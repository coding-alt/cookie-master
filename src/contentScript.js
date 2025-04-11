// 创建并注入悬浮按钮
function injectFloatingButton() {
  // 防止重复注入
  if (document.getElementById('cookie-master-button')) {
    return;
  }

  // 创建悬浮按钮
  const button = document.createElement('button');
  button.id = 'cookie-master-button';
  button.textContent = '🍪';
  button.title = 'Cookie Master';
  button.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 20px;
    text-align: center;
    cursor: pointer;
    z-index: 9999;
    box-shadow: 0 0 5px rgba(0,0,0,0.2);
  `;

  // 点击按钮打开操作菜单
  button.addEventListener('click', function() {
    // 移除现有的面板（如果存在）
    const existingPanel = document.getElementById('cookie-master-panel');
    if (existingPanel) {
      existingPanel.remove();
      return;
    }

    createPanel();
  });

  document.body.appendChild(button);
}

// 创建操作面板
function createPanel() {
  // 创建操作面板
  const panel = document.createElement('div');
  panel.id = 'cookie-master-panel';
  panel.style.cssText = `
    position: fixed;
    bottom: 60px;
    right: 10px;
    width: 400px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    z-index: 9999;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    font-family: Arial, sans-serif;
    font-size: 12px;
  `;

  // 添加标题
  const title = document.createElement('h3');
  title.textContent = 'Cookie & LocalStorage 管理器';
  title.style.cssText = 'margin: 0 0 10px 0; font-size: 14px;';
  panel.appendChild(title);

  // 添加按钮容器
  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; text-align: center;';
  panel.appendChild(buttonsContainer);

  // 导出按钮
  const exportBtn = document.createElement('button');
  exportBtn.textContent = '导出所有Cookie';
  exportBtn.style.cssText = 'flex: 1; padding: 5px;';
  exportBtn.addEventListener('click', exportData);
  buttonsContainer.appendChild(exportBtn);

  // 导入按钮
  const importBtn = document.createElement('button');
  importBtn.textContent = '导入数据';
  importBtn.style.cssText = 'flex: 1; padding: 5px;';
  importBtn.addEventListener('click', importData);
  buttonsContainer.appendChild(importBtn);

  // 关闭按钮
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '关闭';
  closeBtn.style.cssText = 'flex: 1; padding: 5px;';
  closeBtn.addEventListener('click', () => panel.remove());
  buttonsContainer.appendChild(closeBtn);

  // 添加信息文本
  const infoText = document.createElement('div');
  infoText.innerHTML = `<div style="background: #f8f8f8; padding: 8px; border-radius: 4px; margin-bottom: 10px;">
    <p style="margin: 0 0 5px 0;"><b>扩展模式：</b>可以获取和设置所有Cookie，包括HttpOnly。</p>
  </div>`;
  panel.appendChild(infoText);

  // 添加文本区域
  const textarea = document.createElement('textarea');
  textarea.id = 'storage-data';
  textarea.placeholder = '导入/导出的JSON数据';
  textarea.style.cssText = 'width: 100%; height: 150px; box-sizing: border-box; margin-top: 5px;';
  panel.appendChild(textarea);

  // 添加状态信息区域
  const status = document.createElement('div');
  status.id = 'status-message';
  status.style.cssText = 'margin-top: 5px; color: green; font-size: 12px;';
  panel.appendChild(status);

  document.body.appendChild(panel);
}

// 获取所有localStorage数据
function getAllLocalStorage() {
  // 使用直接方式获取localStorage
  const localStorage = {};
  
  try {
    // 检查localStorage是否可用
    if (window.localStorage) {
      // 获取所有键
      Object.keys(window.localStorage).forEach(key => {
        try {
          localStorage[key] = window.localStorage.getItem(key);
        } catch (err) {
          console.error(`获取localStorage键 ${key} 时出错:`, err);
        }
      });
    }
  } catch (e) {
    console.error('获取localStorage时出错:', e);
  }
  
  return localStorage;
}

// 导出数据
function exportData() {
  const textarea = document.getElementById('storage-data');
  const statusEl = document.getElementById('status-message');
  
  // 获取当前URL
  const currentUrl = window.location.href;
  
  // 通过扩展API获取所有cookie
  chrome.runtime.sendMessage({ action: 'getAllCookies', url: currentUrl }, (response) => {
    if (response && response.success) {
      try {
        // 获取localStorage
        const localStorage = getAllLocalStorage();
        
        // 添加元数据
        const exportData = {
          cookies: response.cookies,
          localStorage: localStorage,
          metadata: {
            exportDate: new Date().toISOString(),
            exportDomain: window.location.hostname,
            exportUrl: currentUrl,
            isExtensionExport: true
          }
        };
        
        // 显示数据到文本区域
        textarea.value = JSON.stringify(exportData, null, 2);
        
        // 创建下载链接
        const blob = new Blob([textarea.value], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `cookies_${window.location.hostname}_${new Date().toISOString().slice(0,10)}.json`;
        
        statusEl.textContent = '数据已导出! ';
        statusEl.appendChild(downloadLink);
        downloadLink.textContent = '下载JSON';
        downloadLink.style.color = 'blue';
        downloadLink.style.textDecoration = 'underline';
        downloadLink.style.cursor = 'pointer';
        
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 10000);
        
        // 显示导出的cookie信息
        const httpOnlyCookies = response.cookies.filter(c => c.httpOnly).length;
        const totalCookies = response.cookies.length;
        const localStorageCount = Object.keys(localStorage).length;
        statusEl.innerHTML += `<br>已导出 ${totalCookies} 个cookie，其中 ${httpOnlyCookies} 个为HttpOnly`;
        statusEl.innerHTML += `<br>已导出 ${localStorageCount} 个localStorage项目`;
      } catch (e) {
        statusEl.textContent = '导出数据错误: ' + e.message;
        statusEl.style.color = 'red';
      }
    } else {
      statusEl.textContent = '获取cookie失败';
      statusEl.style.color = 'red';
    }
  });
}

// 导入数据
function importData() {
  const textarea = document.getElementById('storage-data');
  const statusEl = document.getElementById('status-message');
  
  try {
    // 验证JSON格式
    const data = JSON.parse(textarea.value);
    
    // 获取当前URL
    const currentUrl = window.location.href;
    
    // 检测是否为Chrome开发工具导出的格式
    if (Array.isArray(data) && data.length > 0 && data[0].domain && data[0].name && data[0].value) {
      // 导入Chrome DevTools格式的cookie
      chrome.runtime.sendMessage({
        action: 'importCookies',
        cookies: data,
        url: currentUrl
      }, (response) => {
        if (response && response.success) {
          statusEl.innerHTML = response.message;
          statusEl.style.color = 'green';
        } else {
          statusEl.textContent = '导入失败';
          statusEl.style.color = 'red';
        }
      });
      return;
    }
    
    // 验证自定义格式的结构
    if (!data || typeof data !== 'object') {
      throw new Error('无效的数据格式');
    }
    
    // 导入cookie
    if (Array.isArray(data.cookies)) {
      chrome.runtime.sendMessage({
        action: 'importCookies',
        cookies: data.cookies,
        url: currentUrl
      }, (response) => {
        if (response && response.success) {
          statusEl.innerHTML = response.message;
          statusEl.style.color = 'green';
          
          // 导入localStorage
          if (data.localStorage && typeof data.localStorage === 'object') {
            let localStorageSet = 0;
            Object.keys(data.localStorage).forEach(key => {
              try {
                window.localStorage.setItem(key, data.localStorage[key]);
                localStorageSet++;
              } catch (e) {
                console.error(`设置localStorage项目 ${key} 时出错:`, e);
              }
            });
            
            statusEl.innerHTML += `<br>已导入 ${localStorageSet} 个localStorage项目`;
          }
        } else {
          statusEl.textContent = '导入失败';
          statusEl.style.color = 'red';
        }
      });
    } else if (data.cookies !== undefined) {
      throw new Error('Cookies必须是数组');
    }
  } catch (e) {
    statusEl.textContent = '导入数据错误: ' + e.message;
    statusEl.style.color = 'red';
  }
}

// 在页面加载完成后注入按钮
document.addEventListener('DOMContentLoaded', () => {
  injectFloatingButton();
});

// 立即尝试注入按钮，以防DOMContentLoaded已经触发
injectFloatingButton();

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 获取localStorage
  if (request.action === 'getLocalStorage') {
    try {
      const localStorage = getAllLocalStorage();
      sendResponse({ success: true, localStorage });
    } catch (e) {
      console.error('获取localStorage出错:', e);
      sendResponse({ success: false, error: e.message });
    }
    return true;
  }
  
  // 设置localStorage
  if (request.action === 'setLocalStorage') {
    try {
      let count = 0;
      const localStorage = request.localStorage;
      
      Object.keys(localStorage).forEach(key => {
        try {
          window.localStorage.setItem(key, localStorage[key]);
          count++;
        } catch (e) {
          console.error(`设置localStorage项目 ${key} 时出错:`, e);
        }
      });
      
      sendResponse({ success: true, count });
    } catch (e) {
      console.error('设置localStorage出错:', e);
      sendResponse({ success: false, error: e.message });
    }
    return true;
  }
  
  // 在页面中显示控制面板
  if (request.action === 'showPanel') {
    try {
      // 移除现有的面板（如果存在）
      const existingPanel = document.getElementById('cookie-master-panel');
      if (existingPanel) {
        existingPanel.remove();
      }
      
      // 创建新面板
      createPanel();
      
      sendResponse({ success: true });
    } catch (e) {
      console.error('显示控制面板出错:', e);
      sendResponse({ success: false, error: e.message });
    }
    return true;
  }
}); 