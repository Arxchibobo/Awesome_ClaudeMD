# ClaudeMD Manager 诊断指南

## 问题：扩展无法激活，命令未找到

### 🔍 诊断步骤

#### 1. 检查扩展是否安装

在 VS Code 中按 `Ctrl+Shift+P`，输入：
```
Extensions: Show Installed Extensions
```

查找 **ClaudeMD Manager**，应该能看到这个扩展。

---

#### 2. 检查扩展是否激活

按 `Ctrl+Shift+P`，输入：
```
Developer: Show Running Extensions
```

**预期结果**：
- 找到 `claudemd-manager`
- 状态显示为 **激活**（绿色对勾）

**如果显示未激活或有错误**：
- 点击扩展名称查看详细错误
- 截图错误信息

---

#### 3. 查看开发者控制台

按 `Ctrl+Shift+I` 或 `F12` 打开开发者工具。

切换到 **Console** 标签页。

**查找以下信息**：
- 是否有 `[ClaudeMD]` 开头的日志？
- 是否有红色错误信息？

**预期日志**：
```
[ClaudeMD] Extension activated
[ClaudeMD] Repository initialized at: E:\Bobo's Coding cache\Awesome_ClaudeMD
```

---

#### 4. 强制重新加载窗口

按 `Ctrl+Shift+P`，输入：
```
Developer: Reload Window
```

这会重新加载 VS Code 窗口，强制激活所有扩展。

---

#### 5. 完全重新安装

如果以上步骤都失败，请完全重新安装：

```bash
# 1. 完全卸载
code --uninstall-extension claudemd-team.claudemd-manager

# 2. 关闭所有 VS Code 窗口

# 3. 删除扩展缓存（可选）
# Windows:
Remove-Item "$env:USERPROFILE\.vscode\extensions\claudemd-team.claudemd-manager-*" -Recurse -Force

# 4. 重新安装
cd "E:/Bobo's Coding cache/Awesome_ClaudeMD/claude-code-chatinwindows"
code --install-extension claudemd-manager-1.0.0.vsix

# 5. 启动 VS Code
code .
```

---

## 🐛 常见问题

### Q1: 看到 "Extension host terminated unexpectedly"

**原因**：扩展代码有运行时错误

**解决**：
1. 打开开发者控制台查看具体错误
2. 可能是依赖项缺失，运行：
```bash
cd "E:/Bobo's Coding cache/Awesome_ClaudeMD/claude-code-chatinwindows"
npm install
npm run compile
npx @vscode/vsce package --no-dependencies
```

### Q2: 左侧活动栏没有 ClaudeMD 图标

**原因**：Webview Containers 未注册

**解决**：
1. 检查 `package.json` 中的 `viewsContainers` 配置
2. 重新加载窗口：`Ctrl+Shift+P` → `Developer: Reload Window`

### Q3: 命令面板找不到 ClaudeMD 命令

**原因**：commands 未注册或扩展未激活

**解决**：
1. 确认扩展已激活（步骤 2）
2. 检查 `activationEvents` 是否为 `onStartupFinished`

---

## 📋 收集诊断信息

如果问题仍未解决，请收集以下信息：

1. **VS Code 版本**：
   - 按 `Ctrl+Shift+P` → `Help: About`
   - 复制版本信息

2. **扩展状态**：
   - `Developer: Show Running Extensions` 的截图

3. **控制台错误**：
   - 开发者工具 Console 的完整错误信息

4. **扩展输出**：
   - 按 `Ctrl+Shift+U` 打开输出面板
   - 从下拉菜单选择 "ClaudeMD Manager"
   - 复制所有输出内容

---

## 🔧 手动验证安装

运行以下命令验证 VSIX 文件：

```bash
cd "E:/Bobo's Coding cache/Awesome_ClaudeMD/claude-code-chatinwindows"

# 查看 VSIX 内容
npx @vscode/vsce ls

# 检查 package.json
cat package.json | grep -A 3 "activationEvents"

# 检查编译输出
ls -la out/
```

**预期结果**：
- `out/extension.js` 存在且大小 > 10KB
- `activationEvents` 包含 `onStartupFinished`
- `out/views/` 目录包含 `main-panel.js` 和 `tips-panel.js`
