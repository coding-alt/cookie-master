// 监听来自弹出窗口或内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getAllCookies') {
    // 获取所有cookie
    chrome.cookies.getAll({ url: request.url }, (cookies) => {
      sendResponse({ success: true, cookies: cookies });
    });
    return true; // 异步响应
  } 
  else if (request.action === 'importCookies') {
    let successCount = 0;
    let failCount = 0;
    const totalCookies = request.cookies.length;
    
    // 逐个设置cookie
    request.cookies.forEach((cookie) => {
      // 准备cookie数据
      const cookieData = {
        url: request.url,
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
        
        // 如果所有cookie都已处理完毕，发送响应
        if (successCount + failCount === totalCookies) {
          sendResponse({ 
            success: true, 
            message: `导入完成: ${successCount}个cookie已设置，${failCount}个失败` 
          });
        }
      });
    });
    
    return true; // 异步响应
  }
});

// 安装扩展时的事件处理
chrome.runtime.onInstalled.addListener(() => {
  console.log('Cookie Master 扩展已安装');
}); 