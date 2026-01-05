# 调试检查清单

## 步骤 1: 检查插件是否激活

1. 打开 Cursor
2. 按 `Ctrl+Shift+P`
3. 输入: `Developer: Toggle Developer Tools`
4. 打开开发者工具后，切换到 **Console (控制台)** 标签
5. 查看是否有以下输出：
   ```
   Awesome ClaudeMD Manager v2.1.1 已激活
   ```

## 步骤 2: 查看错误信息

在开发者工具的控制台中：
1. 查看是否有红色错误信息
2. 特别注意包含 "awesome-claudemd" 或 "extension" 的错误
3. 截图发给我

## 步骤 3: 手动触发激活

在开发者工具的控制台中，输入以下代码：

```javascript
vscode.extensions.getExtension('awesome-claudemd.awesome-claudemd')
```

按回车后，查看输出：
- 如果返回 `undefined`，说明插件未安装
- 如果返回一个对象，说明插件已安装

然后尝试激活：

```javascript
vscode.extensions.getExtension('awesome-claudemd.awesome-claudemd').activate()
```

查看返回信息和是否有错误。

## 步骤 4: 检查扩展目录

打开文件管理器，导航到：
```
C:\Users\Administrator\.vscode\extensions\
```

查找是否有以下文件夹：
```
awesome-claudemd.awesome-claudemd-2.1.1
```

进入该文件夹，检查：
- 是否有 `out` 文件夹
- `out` 文件夹中是否有 `extension.js`

## 常见问题

### 问题 1: 插件未激活
**可能原因**: activationEvents 配置问题或初始化代码报错

**解决方案**: 查看开发者控制台错误

### 问题 2: 命令未注册
**可能原因**: 初始化代码中的 try-catch 捕获了错误，导致后续命令未注册

**解决方案**: 需要调整错误处理逻辑

### 问题 3: 依赖缺失
**可能原因**: node_modules 未正确打包

**解决方案**: 检查 vsix 包内容
