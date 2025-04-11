# Cookie Master

一个功能强大的Chrome扩展，用于导出和导入所有cookie，包括HttpOnly cookie。

## 功能特点

- 导出当前网站的所有cookie，包括HttpOnly cookie
- 导出localStorage数据
- 导入cookie和localStorage数据
- 支持多种数据格式导入
- 页面内浮动控制面板
- 弹出窗口提供快捷操作
- 兼容内容安全策略(CSP)限制的网站

## 安装方法

### 开发者模式安装

1. 下载此扩展的源代码并解压
2. 打开Chrome浏览器，进入扩展管理页面 (chrome://extensions/)
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"按钮
5. 选择解压后的源代码目录

## 使用方法

### 方法一：使用弹出窗口

1. 点击Chrome工具栏中的Cookie Master图标
2. 在弹出窗口中，您可以看到当前网站的cookie统计
3. 点击"导出所有Cookie"按钮导出数据
4. 点击"导入Cookie数据"按钮导入数据
5. 点击"在页面中显示控制面板"在网页中显示悬浮控制面板

### 方法二：使用页面悬浮按钮

1. 访问任意网页，页面右下角会出现一个cookie图标按钮
2. 点击该按钮，打开控制面板
3. 使用面板中的按钮导出或导入数据

## 数据格式

本扩展支持以下数据格式：

1. 自定义格式（首选）：
```json
{
  "cookies": [
    {
      "name": "cookieName",
      "value": "cookieValue",
      "domain": "example.com",
      "path": "/",
      "httpOnly": true,
      "secure": true,
      "expirationDate": 1234567890
    }
  ],
  "localStorage": {
    "key1": "value1",
    "key2": "value2"
  },
  "metadata": {
    "exportDate": "2023-01-01T00:00:00.000Z",
    "exportDomain": "example.com",
    "exportUrl": "https://example.com"
  }
}
```

2. Chrome开发工具格式：
```json
[
  {
    "name": "cookieName",
    "value": "cookieValue",
    "domain": "example.com",
    "path": "/",
    "httpOnly": true,
    "secure": true,
    "expirationDate": 1234567890
  }
]
```

## 注意事项

- 导入cookie时，可能会受到跨域限制
- HttpOnly cookie只能通过Chrome扩展API访问，不能通过JavaScript直接访问
- 请小心使用导入功能，以避免安全风险

## 隐私声明
此扩展不会收集或发送您的cookie数据到任何外部服务器。所有数据处理都在本地进行。 
- 如果网站禁用了window.postMessage，可能会影响localStorage数据的获取

## 未来计划

- 添加SessionStorage支持
- 添加筛选和搜索功能
- 添加自动备份功能
- 支持导入/导出Cookie格式的更多选项 