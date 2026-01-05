# 🔄 更新到 v2.1.1 指南

## ❗ 问题说明

如果你看到版本显示仍是 v2.1.0，这是因为 Cursor/VS Code 缓存了旧版本。

需要**完全卸载旧版本**后再安装新版本。

---

## 🛠️ 解决步骤

### 方法 1: 完整卸载重装（推荐）

#### 步骤 1: 卸载旧版本

**在 Cursor 中：**

1. 打开扩展面板（`Ctrl+Shift+X`）
2. 搜索 "Awesome ClaudeMD"
3. 找到已安装的插件
4. 点击 **"卸载"** 按钮
5. **重启 Cursor**（重要！）

**或使用命令行：**

```bash
# 在 Git Bash 中运行
code --uninstall-extension awesome-claudemd.awesome-claudemd
```

#### 步骤 2: 清理缓存（可选但推荐）

```bash
# Windows
rm -rf "$APPDATA/Code/User/workspaceStorage"
rm -rf "$APPDATA/Code/CachedExtensions"

# 或者手动删除
# C:\Users\你的用户名\AppData\Roaming\Code\User\workspaceStorage
```

#### 步骤 3: 安装新版本

```bash
cd "E:/Bobo's Coding cache/Awesome_ClaudeMD/claude-code-chatinwindows"
code --install-extension awesome-claudemd-2.1.1.vsix
```

#### 步骤 4: 验证版本

1. **重启 Cursor**
2. 打开命令面板（`Ctrl+Shift+P`）
3. 输入 "Awesome ClaudeMD"
4. 查看状态栏或主面板，应该显示 **v2.1.1**

---

### 方法 2: 强制覆盖安装

如果方法 1 不方便，可以尝试强制安装：

```bash
cd "E:/Bobo's Coding cache/Awesome_ClaudeMD/claude-code-chatinwindows"

# 强制安装（覆盖）
code --install-extension awesome-claudemd-2.1.1.vsix --force
```

然后 **重启 Cursor**。

---

### 方法 3: 手动清理扩展目录

如果上述方法都不行：

#### 步骤 1: 找到扩展目录

Windows 默认位置：
```
C:\Users\你的用户名\.vscode\extensions
```

或者 Cursor 的位置可能是：
```
C:\Users\你的用户名\.cursor\extensions
```

#### 步骤 2: 删除旧版本文件夹

找到并删除：
```
awesome-claudemd.awesome-claudemd-2.1.0
```

#### 步骤 3: 安装新版本

```bash
code --install-extension awesome-claudemd-2.1.1.vsix
```

#### 步骤 4: 重启 Cursor

---

## ✅ 验证安装成功

安装成功后，应该看到：

### 1. 扩展面板
- 版本号：**v2.1.1**
- 状态：已启用

### 2. 命令面板
```
Ctrl+Shift+P → "Awesome ClaudeMD"
```
应该有 7 个命令可用。

### 3. 打开主面板测试
```
Ctrl+Shift+P → "Awesome ClaudeMD: 打开主面板"
```

---

## 🔍 检查当前安装的版本

### 方法 1: 通过命令行

```bash
code --list-extensions --show-versions | grep awesome-claudemd
```

应该显示：
```
awesome-claudemd.awesome-claudemd@2.1.1
```

### 方法 2: 通过扩展面板

1. 打开扩展面板
2. 搜索 "Awesome ClaudeMD"
3. 查看版本号

### 方法 3: 通过主面板

打开主面板，标题栏应该显示版本信息。

---

## 🐛 常见问题

### Q: 卸载后重装，版本还是 v2.1.0？

**A**: 需要清理缓存：

```bash
# 删除工作区存储
rm -rf "$APPDATA/Code/User/workspaceStorage"

# 删除扩展缓存
rm -rf "$APPDATA/Code/CachedExtensions"

# 重启 Cursor
```

### Q: 找不到扩展目录？

**A**: 运行这个命令查找：

```bash
# Windows
find "$HOME" -name "awesome-claudemd.awesome-claudemd*" 2>/dev/null

# 或
dir /s /b "%USERPROFILE%\awesome-claudemd.awesome-claudemd*"
```

### Q: 命令行安装失败？

**A**: 尝试使用绝对路径：

```bash
code --install-extension "E:/Bobo's Coding cache/Awesome_ClaudeMD/claude-code-chatinwindows/awesome-claudemd-2.1.1.vsix"
```

### Q: Cursor 和 VS Code 是一样的吗？

**A**: Cursor 是基于 VS Code 的，但可能有独立的扩展目录。尝试查找：
- `%USERPROFILE%\.cursor\extensions`
- `%USERPROFILE%\.vscode\extensions`

---

## 📋 快速操作清单

复制这些命令到 Git Bash 运行：

```bash
# 1. 卸载旧版本
code --uninstall-extension awesome-claudemd.awesome-claudemd

# 2. 进入插件目录
cd "E:/Bobo's Coding cache/Awesome_ClaudeMD/claude-code-chatinwindows"

# 3. 安装新版本
code --install-extension awesome-claudemd-2.1.1.vsix --force

# 4. 验证版本
code --list-extensions --show-versions | grep awesome-claudemd
```

然后**重启 Cursor**。

---

## 📝 版本差异

### v2.1.1 (新) vs v2.1.0 (旧)

**v2.1.1 新增：**
- ✅ 完整的 Webview UI 框架
- ✅ 主控制面板
- ✅ Tips 管理面板
- ✅ 实时数据刷新
- ✅ 更好的错误处理

确保更新到最新版本以获得最佳体验！

---

## 💡 提示

- 更新后第一次启动可能稍慢（初始化）
- 建议更新后运行一次 "更新协议" 命令
- 如果遇到问题，尝试禁用后重新启用插件

---

**需要帮助？** 查看其他文档：
- [INSTALLATION.md](INSTALLATION.md) - 完整安装指南
- [USAGE.md](USAGE.md) - 使用手册
- [QUICKSTART.md](QUICKSTART.md) - 快速上手

---

**祝更新顺利！** 🚀
