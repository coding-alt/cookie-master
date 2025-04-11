// 获取当前标签页信息
function getCurrentTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0]);
    });
  });
}

// 获取指定URL的所有cookie
function getAllCookies(url) {
  return new Promise((resolve) => {
    chrome.cookies.getAll({ url }, (cookies) => {
      resolve(cookies);
    });
  });
}

// 统计指定类型的cookie数量
function countCookies(cookies, type) {
  if (type === 'httpOnly') {
    return cookies.filter(c => c.httpOnly).length;
  }
  return cookies.length;
}

// 显示当前站点信息
async function displaySiteInfo() {
  try {
    const currentTab = await getCurrentTab();
    const currentSiteEl = document.getElementById('current-site');
    const cookieCountEl = document.getElementById('cookie-count');
    
    if (currentTab && currentTab.url) {
      const url = new URL(currentTab.url);
      currentSiteEl.textContent = `当前站点: ${url.hostname}`;
      
      // 获取当前站点的cookie
      const cookies = await getAllCookies(currentTab.url);
      const httpOnlyCookies = countCookies(cookies, 'httpOnly');
      
      cookieCountEl.textContent = `Cookie统计: 共${cookies.length}个，其中${httpOnlyCookies}个HttpOnly`;
      
      // 尝试获取localStorage
      chrome.tabs.sendMessage(currentTab.id, { action: 'getLocalStorage' }, (response) => {
        if (response && response.success) {
          const localStorageCount = Object.keys(response.localStorage).length;
          cookieCountEl.textContent += `，LocalStorage: ${localStorageCount}项`;
        }
      });
    } else {
      currentSiteEl.textContent = '无法获取当前站点信息';
      cookieCountEl.textContent = '';
    }
  } catch (e) {
    console.error('显示站点信息出错:', e);
  }
}

// 导出所有cookie
async function exportAllCookies() {
  try {
    const currentTab = await getCurrentTab();
    const textarea = document.getElementById('data-area');
    const statusEl = document.getElementById('status');
    
    if (!currentTab || !currentTab.url) {
      statusEl.textContent = '无法获取当前标签页信息';
      statusEl.style.color = 'red';
      return;
    }
    
    const url = currentTab.url;
    const cookies = await getAllCookies(url);
    
    // 显示加载指示
    statusEl.textContent = '正在获取数据...';
    statusEl.style.color = 'blue';
    
    // 尝试获取localStorage，通过注入内容脚本
    chrome.tabs.sendMessage(currentTab.id, { action: 'getLocalStorage' }, (response) => {
      let localStorage = {};
      
      if (response && response.success) {
        localStorage = response.localStorage;
      } else {
        console.warn('无法获取localStorage数据', response);
      }
      
      // 构建完整的导出数据
      const exportData = {
        cookies,
        localStorage,
        metadata: {
          exportDate: new Date().toISOString(),
          exportDomain: new URL(url).hostname,
          exportUrl: url,
          isExtensionExport: true
        }
      };
      
      // 显示数据到文本区域
      textarea.value = JSON.stringify(exportData, null, 2);
      
      // 创建下载链接
      const blob = new Blob([textarea.value], {type: 'application/json'});
      const blobUrl = URL.createObjectURL(blob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = `cookies_${new URL(url).hostname}_${new Date().toISOString().slice(0,10)}.json`;
      downloadLink.textContent = '下载JSON';
      downloadLink.style.color = 'blue';
      downloadLink.style.textDecoration = 'underline';
      downloadLink.style.cursor = 'pointer';
      
      statusEl.innerHTML = '数据已导出! ';
      statusEl.appendChild(downloadLink);
      
      // 显示统计信息
      const httpOnlyCookies = countCookies(cookies, 'httpOnly');
      const localStorageCount = Object.keys(localStorage).length;
      statusEl.innerHTML += `<br>已导出 ${cookies.length} 个cookie，其中 ${httpOnlyCookies} 个为HttpOnly`;
      statusEl.innerHTML += `<br>已导出 ${localStorageCount} 个localStorage项目`;
      
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 10000);
    });
  } catch (e) {
    console.error('导出cookie出错:', e);
    const statusEl = document.getElementById('status');
    statusEl.textContent = '导出数据错误: ' + e.message;
    statusEl.style.color = 'red';
  }
}

// 导入cookie数据
async function importCookieData() {
  try {
    const currentTab = await getCurrentTab();
    const textarea = document.getElementById('data-area');
    const statusEl = document.getElementById('status');
    
    if (!currentTab || !currentTab.url) {
      statusEl.textContent = '无法获取当前标签页信息';
      statusEl.style.color = 'red';
      return;
    }
    
    const url = currentTab.url;
    
    // 显示加载指示
    statusEl.textContent = '正在导入数据...';
    statusEl.style.color = 'blue';
    
    // 验证JSON格式
    const data = JSON.parse(textarea.value);
    
    // 检测是否为Chrome开发工具导出的格式
    if (Array.isArray(data) && data.length > 0 && data[0].domain && data[0].name && data[0].value) {
      importCookies(data, url, statusEl);
      return;
    }
    
    // 验证自定义格式的结构
    if (!data || typeof data !== 'object') {
      throw new Error('无效的数据格式');
    }
    
    // 导入自定义格式的cookie
    if (Array.isArray(data.cookies)) {
      importCookies(data.cookies, url, statusEl);
      
      // 导入localStorage（通过内容脚本）
      if (data.localStorage && typeof data.localStorage === 'object') {
        chrome.tabs.sendMessage(currentTab.id, { 
          action: 'setLocalStorage', 
          localStorage: data.localStorage 
        }, (response) => {
          if (response && response.success) {
            statusEl.innerHTML += `<br>已导入 ${response.count} 个localStorage项目`;
          } else {
            console.warn('设置localStorage失败', response);
            statusEl.innerHTML += `<br>localStorage导入失败，可能是由于跨域限制`;
          }
        });
      }
    } else if (data.cookies !== undefined) {
      throw new Error('Cookies必须是数组');
    }
  } catch (e) {
    console.error('导入cookie出错:', e);
    const statusEl = document.getElementById('status');
    statusEl.textContent = '导入数据错误: ' + e.message;
    statusEl.style.color = 'red';
  }
}

// 导入cookie的辅助函数
function importCookies(cookies, url, statusEl) {
  let successCount = 0;
  let failCount = 0;
  const totalCookies = cookies.length;
  
  cookies.forEach((cookie) => {
    // 准备cookie数据
    const cookieData = {
      url: url,
      name: cookie.name,
      value: cookie.value,
      path: cookie.path || '/',
      secure: cookie.secure || false,
      httpOnly: cookie.httpOnly || false,
      sameSite: cookie.sameSite || "lax"
    };
    
    // 添加域名（如果存在）
    if (cookie.domain) {
      cookieData.domain = cookie.domain;
    }
    
    // 添加过期时间（如果存在）
    if (cookie.expirationDate) {
      cookieData.expirationDate = cookie.expirationDate;
    }
    
    // 设置cookie
    chrome.cookies.set(cookieData, (result) => {
      if (result) {
        successCount++;
      } else {
        failCount++;
        console.error(`无法设置cookie: ${cookie.name}`, chrome.runtime.lastError);
      }
      
      // 如果所有cookie都已处理完毕，更新状态
      if (successCount + failCount === totalCookies) {
        statusEl.textContent = `导入完成: ${successCount}个cookie已设置，${failCount}个失败`;
        statusEl.style.color = 'green';
        
        // 刷新站点信息
        displaySiteInfo();
      }
    });
  });
}

// 在页面中显示控制面板
async function showPageControlPanel() {
  try {
    const currentTab = await getCurrentTab();
    const statusEl = document.getElementById('status');
    
    if (!currentTab || !currentTab.id) {
      statusEl.textContent = '无法获取当前标签页信息';
      statusEl.style.color = 'red';
      return;
    }
    
    statusEl.textContent = '正在打开控制面板...';
    statusEl.style.color = 'blue';
    
    chrome.tabs.sendMessage(currentTab.id, { action: 'showPanel' }, (response) => {
      if (response && response.success) {
        statusEl.textContent = '控制面板已在页面中显示';
        statusEl.style.color = 'green';
      } else {
        statusEl.textContent = '无法在页面中显示控制面板，可能是因为内容脚本未加载';
        statusEl.style.color = 'red';
      }
    });
  } catch (e) {
    console.error('显示控制面板出错:', e);
    const statusEl = document.getElementById('status');
    statusEl.textContent = '显示控制面板时出错: ' + e.message;
    statusEl.style.color = 'red';
  }
}

// 事件监听和初始化
document.addEventListener('DOMContentLoaded', () => {
  // 显示当前站点信息
  displaySiteInfo();
  
  // 导出按钮
  document.getElementById('export-btn').addEventListener('click', exportAllCookies);
  
  // 导入按钮
  document.getElementById('import-btn').addEventListener('click', importCookieData);
  
  // 页面控制按钮
  document.getElementById('page-control-btn').addEventListener('click', showPageControlPanel);
}); 