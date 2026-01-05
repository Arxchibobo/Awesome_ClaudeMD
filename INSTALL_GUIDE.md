# ClaudeMD Manager 安装指南

## 📦 快速安装（推荐）

### Windows 用户

1. **下载 VSIX 文件**
   ```
   访问: https://github.com/LeonSGP43/Awesome_ClaudeMD/tree/main/claude-code-chatinwindows
   下载: claudemd-manager-1.0.0.vsix
   ```

2. **安装扩展**
   
   **方法 A：使用 VS Code 界面**
   - 打开 VS Code
   - 按 `Ctrl+Shift+X` 打开扩展面板
   - 点击右上角 `...` 菜单
   - 选择 **"从 VSIX 安装..."**
   - 选择下载的 `claudemd-manager-1.0.0.vsix` 文件
   - 等待安装完成
   - 点击 **"重新加载"** 按钮

   **方法 B：使用命令行**
   ```bash
   # 在 Git Bash 或 PowerShell 中执行
   code --install-extension claudemd-manager-1.0.0.vsix
   ```

3. **验证安装**
   - 左侧活动栏出现 **☁ 云图标**
   - 右下角状态栏显示 **☁ ClaudeMD**
   - 按 `Ctrl+Shift+P` 输入 "ClaudeMD" 可看到所有命令

### macOS / Linux 用户

```bash
# 1. 下载 VSIX
wget https://github.com/LeonSGP43/Awesome_ClaudeMD/raw/main/claude-code-chatinwindows/claudemd-manager-1.0.0.vsix

# 2. 安装
code --install-extension claudemd-manager-1.0.0.vsix

# 3. 重新加载 VS Code
```

---

## 🚀 首次使用

安装后首次打开 VS Code：

1. **插件会自动激活**
   - 看到通知："✅ ClaudeMD Manager 已激活"

2. **克隆协议仓库**
   - 点击左侧 **☁ 云图标**
   - 或按 `Ctrl+Shift+P` → "ClaudeMD: 更新协议"
   - 首次使用会提示克隆仓库，点击 **"立即克隆"**
   - 默认克隆到 `~/Awesome_ClaudeMD`

3. **应用协议到项目**
   - 打开你的项目
   - 按 `Ctrl+Shift+P` → "ClaudeMD: 应用协议到当前项目"
   - CLAUDE.md 文件会自动创建在项目根目录

---

## 🎯 快速上手

### 查看主面板
```
点击左侧活动栏 ☁ 图标 → 展开侧边栏 → 查看"主面板"
```

显示内容：
- 📁 当前项目状态
- 📦 仓库状态
- 📝 Tips 统计
- 📜 最近提交历史

### 管理 Tips
```
侧边栏 → "Tips 管理" 标签
```

功能：
- 查看待整合和已整合的 Tips
- 创建、编辑、删除 Tips
- 一键整合所有 Tips

### 常用命令
```
Ctrl+Shift+P 打开命令面板，输入：

- "ClaudeMD: 更新协议"        # 拉取最新协议
- "ClaudeMD: 应用协议到当前项目"  # 应用到项目
- "ClaudeMD: 提交新 Tip"      # 提交避坑经验
```

---

## ⚙️ 配置（可选）

### 修改仓库路径

1. 按 `Ctrl+,` 打开设置
2. 搜索 `claudemd`
3. 修改 **Repository Path**
4. 重启 VS Code

### 配置 AWS Bedrock（可选）

如需使用 AI 整合 Tips：

1. 获取 AWS 凭证（Access Key ID + Secret Key）
2. 按 `Ctrl+Shift+P` → "ClaudeMD: 整合 Tips"
3. 首次使用会提示输入凭证
4. 凭证安全存储在 VS Code SecretStorage

---

## 🐛 故障排查

### 问题1：安装后没有看到云图标

**解决方案**：
```bash
# 1. 检查扩展是否已启用
Ctrl+Shift+X → 搜索 "ClaudeMD" → 确认已启用

# 2. 重新加载 VS Code
Ctrl+Shift+P → "Reload Window"

# 3. 查看日志
Ctrl+Shift+U → 选择 "ClaudeMD" → 查看错误信息
```

### 问题2：克隆仓库失败

**原因**：
- 没有安装 Git
- 网络连接问题
- GitHub 访问受限

**解决方案**：
```bash
# 1. 确认 Git 已安装
git --version

# 2. 手动克隆（如有代理问题）
git clone https://github.com/LeonSGP43/Awesome_ClaudeMD.git ~/Awesome_ClaudeMD

# 3. 在插件中使用
按 Ctrl+Shift+P → "ClaudeMD: 应用协议到当前项目"
```

### 问题3：VSIX 安装提示"签名验证失败"

**解决方案**：
```bash
# 使用 --force 参数强制安装
code --install-extension claudemd-manager-1.0.0.vsix --force
```

---

## 🔄 更新插件

### 方式1：重新安装 VSIX

```bash
# 1. 卸载旧版本
code --uninstall-extension claudemd-team.claudemd-manager

# 2. 下载新版本 VSIX

# 3. 安装新版本
code --install-extension claudemd-manager-x.x.x.vsix
```

### 方式2：从源码构建

```bash
cd Awesome_ClaudeMD/claude-code-chatinwindows

# 拉取最新代码
git pull origin main

# 重新编译和打包
npm install
npm run compile
npm run package

# 安装新版本
code --install-extension claudemd-manager-1.0.0.vsix
```

---

## ❌ 卸载插件

### 方法 A：使用 VS Code UI
```
Ctrl+Shift+X → 搜索 "ClaudeMD" → 右键 → "卸载"
```

### 方法 B：使用命令行
```bash
code --uninstall-extension claudemd-team.claudemd-manager
```

---

## 📞 获取帮助

遇到问题？

1. 查看 [完整文档](README.md)
2. 查看 [使用指南](claude-code-chatinwindows/USAGE.md)
3. 提交 [Issue](https://github.com/LeonSGP43/Awesome_ClaudeMD/issues)

---

## 🎉 安装成功！

现在你可以：
- ✅ 可视化管理 CLAUDE.md 协议
- ✅ 一键同步最新团队规范
- ✅ 提交和管理避坑经验
- ✅ 使用 AI 自动整合 Tips

**开始你的高效协作之旅吧！** 🚀

---

Made with ❤️ by ClaudeMD Team
