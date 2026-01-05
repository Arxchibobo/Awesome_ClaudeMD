# 检查插件激活状态

## 方法 1: 查看输出面板

1. 在 Cursor 中按 `Ctrl+Shift+U` 打开输出面板
2. 在右上角的下拉菜单中选择 "Extension Host"
3. 查找是否有 "Awesome ClaudeMD" 相关的错误或激活消息
4. 截图发给我

## 方法 2: 查看扩展详情

1. 按 `Ctrl+Shift+X` 打开扩展面板
2. 搜索 "Awesome ClaudeMD"
3. 点击插件名称
4. 查看插件详情页面，看是否显示"已激活"状态
5. 截图发给我

## 方法 3: 手动测试激活

在 Cursor 的任意 JavaScript/TypeScript 文件中，按 F1 或 Ctrl+Shift+P，运行以下代码：

打开命令面板后，输入：`Developer: Show Running Extensions`

这会显示所有正在运行的扩展。查找 "awesome-claudemd" 是否在列表中。

## 方法 4: 检查错误日志

查看 Cursor 的日志文件：

```
C:\Users\Administrator\AppData\Roaming\Cursor\logs\
```

打开最新的日志文件，搜索 "awesome-claudemd" 或 "error"，看是否有相关错误。

## 可能的问题

### 问题 1: Cursor 与 VS Code 扩展不兼容
**可能性**: Cursor 虽然基于 VS Code，但可能对某些扩展有限制

**解决方案**:
- 尝试在真正的 VS Code 中安装测试
- 检查 Cursor 的扩展兼容性文档

### 问题 2: 扩展激活事件未触发
**可能性**: `onStartupFinished` 事件在 Cursor 中可能不工作

**解决方案**: 修改 package.json，使用 `*` 作为激活事件（立即激活）

### 问题 3: 运行时错误
**可能性**: extension.js 执行时抛出异常

**解决方案**: 需要查看具体的错误信息才能修复
