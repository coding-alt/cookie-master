# Cookie Master 扩展演示

本文档展示如何使用Cookie Master扩展导出和导入网站的Cookie（包括HttpOnly Cookie）。

## 演示场景

我们将以Github.com为例，演示如何：
1. 导出其所有cookie
2. 查看导出的内容（包括HttpOnly cookie）
3. 导入之前导出的cookie

## 步骤1：安装扩展

1. 按照`USAGE.md`文档中的说明安装扩展
2. 确认扩展图标已出现在Chrome工具栏中

## 步骤2：导出Github的Cookie

1. 访问 https://github.com 并登录您的账户
2. 点击Chrome工具栏中的Cookie Master图标
3. 在弹出窗口中，您会看到当前站点（github.com）的Cookie统计信息
4. 点击"导出所有Cookie"按钮
5. 您将看到导出的JSON数据显示在文本区域中
6. 记下HttpOnly的Cookie数量（通常会有几个HttpOnly cookie）
7. 点击"下载JSON"链接保存导出的数据

## 步骤3：检查导出的数据

1. 打开下载的JSON文件
2. 在文件中查找`"httpOnly": true`字段
3. 确认成功导出了HttpOnly cookie
4. 注意localStorage部分也已被导出

## 步骤4：导入Cookie演示

为了安全起见，我们将在同一网站上演示导入功能：

1. 打开一个新的隐私浏览窗口
2. 访问 https://github.com（不要登录）
3. 点击页面右下角的Cookie图标按钮
4. 在打开的控制面板中，将之前导出的JSON数据复制到文本区域
5. 点击"导入数据"按钮
6. 成功导入后，您将看到导入统计信息
7. 刷新页面，您应该已经自动登录到Github（因为认证cookie已被导入）

## 检验成功导入HttpOnly Cookie

通常，网站的认证Cookie往往是HttpOnly的。如果导入后您自动登录了该网站，这证明HttpOnly cookie已成功导入。

## 安全提示

* 演示完成后请删除导出的Cookie文件
* 不要将导出的Cookie数据分享给他人
* 在实际使用中，请小心导入来源不明的Cookie数据

## 高级演示：跨浏览器会话复制

您也可以尝试：

1. 在Chrome浏览器A中登录网站并导出Cookie
2. 在Chrome浏览器B中导入这些Cookie
3. 验证是否在浏览器B中自动登录了网站

这展示了Cookie Master作为会话管理工具的强大功能。 