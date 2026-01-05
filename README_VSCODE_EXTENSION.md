# ClaudeMD Manager - VS Code 扩展版

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![VS Code](https://img.shields.io/badge/VS%20Code-1.85.0+-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**团队协议可视化管理工具 - VS Code 一键安装版**

[快速安装](#-快速安装) • [功能特性](#-功能特性) • [使用指南](#-使用指南)

</div>

---

## 🎯 这是什么？

**ClaudeMD Manager** 是 Awesome_ClaudeMD 的 **VS Code 可视化管理插件**，让你：

- ✅ **一键安装** - 下载 VSIX 文件，VS Code 中安装即用
- ✅ **可视化界面** - 漂亮的侧边栏面板，一目了然
- ✅ **自动同步** - 自动拉取最新协议，无需手动操作
- ✅ **团队协作** - 提交 Tips，AI 自动整合

---

## 📦 快速安装

### 1. 下载 VSIX 文件

从仓库下载：
```
https://github.com/LeonSGP43/Awesome_ClaudeMD/raw/main/claude-code-chatinwindows/claudemd-manager-1.0.0.vsix
```

### 2. 安装到 VS Code

**方法 A：图形界面**
1. 打开 VS Code
2. 按 `Ctrl+Shift+X` 打开扩展
3. 点击右上角 `...` → **"从 VSIX 安装..."**
4. 选择下载的文件

**方法 B：命令行**
```bash
code --install-extension claudemd-manager-1.0.0.vsix
```

### 3. 开始使用

安装后：
- 左侧出现 **☁ 云图标**
- 点击即可打开管理面板
- 首次使用会自动克隆协议仓库

---

## ✨ 功能特性

### 🎨 可视化界面

#### 主面板
```
┌─────────────────────────┐
│ 📁 当前项目 │ 📦 仓库   │
│ 📝 Tips统计 │ ℹ️ 信息   │
├─────────────────────────┤
│  [🔄 更新协议]          │
│  [📥 应用到项目]        │
│  [📝 打开 Tips]         │
├─────────────────────────┤
│ 📜 最近提交历史...      │
└─────────────────────────┘
```

#### Tips 管理面板
```
┌─────────────────────────┐
│ 📌 待整合 | ✅ 已整合   │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ null-check          │ │
│ │ [查看][编辑][删除]  │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ [🤖 整合所有 Tips]      │
└─────────────────────────┘
```

### 🛠️ 核心功能

- **协议管理**
  - 一键更新最新协议
  - 智能应用到项目
  - 保留自定义内容

- **Tips 协同**
  - 提交避坑经验
  - AI 自动整合
  - 自动归档管理

- **可视化监控**
  - 实时状态展示
  - 提交历史查看
  - 统计数据分析

---

## 📚 使用指南

### 基本操作

1. **更新协议**
   ```
   点击云图标 → 主面板 → "更新协议" 按钮
   或按 Ctrl+Shift+P → "ClaudeMD: 更新协议"
   ```

2. **应用到项目**
   ```
   打开项目 → Ctrl+Shift+P → "ClaudeMD: 应用协议到当前项目"
   ```

3. **提交 Tip**
   ```
   Ctrl+Shift+P → "ClaudeMD: 提交新 Tip"
   → 填写标题和内容 → 提交
   ```

### 团队工作流

```
成员 A: 发现避坑经验 → 提交 Tip
Lead: 定期运行"整合 Tips" → AI 自动处理
成员 B/C/D: 启动 VS Code → 自动同步最新协议
```

---

## ⚙️ 配置

### VS Code 设置

按 `Ctrl+,` 搜索 `claudemd`：

```json
{
  "claudemd.autoUpdate": true,          // 启用自动更新
  "claudemd.updateInterval": 3600,      // 更新间隔（秒）
  "claudemd.repositoryPath": ""         // 仓库路径（默认 ~/Awesome_ClaudeMD）
}
```

### AWS Bedrock（可选）

如需使用 AI 整合 Tips：
1. 获取 AWS 凭证
2. 首次运行"整合 Tips"时输入
3. 凭证安全存储在 VS Code

---

## 🆚 对比原方案

| 特性 | 原方案（软链接） | VS Code 扩展版 |
|-----|----------------|---------------|
| **安装** | 需要命令行操作 | 一键安装 VSIX |
| **界面** | 纯命令行 | 可视化图形界面 |
| **更新** | 手动 git pull | 自动检查更新 |
| **状态** | 无可视化 | 实时状态展示 |
| **Tips** | 手动编辑 | 图形化管理 |
| **适合** | 终端用户 | VS Code 用户 |

---

## ❓ 常见问题

### Q: 安装后看不到云图标？
A: 重新加载 VS Code（`Ctrl+Shift+P` → "Reload Window"）

### Q: 克隆仓库失败？
A: 确保安装了 Git 且网络正常

### Q: 如何更新插件？
A: 下载新版 VSIX → 卸载旧版 → 安装新版

### Q: 如何卸载？
A: `Ctrl+Shift+X` → 搜索 "ClaudeMD" → 右键 → 卸载

---

## 📖 完整文档

- [详细 README](claude-code-chatinwindows/README.md)
- [安装指南](INSTALL_GUIDE.md)
- [使用手册](claude-code-chatinwindows/USAGE.md)
- [项目总结](claude-code-chatinwindows/PROJECT_SUMMARY.md)

---

## 🔗 相关链接

- **主仓库**: https://github.com/LeonSGP43/Awesome_ClaudeMD
- **问题反馈**: https://github.com/LeonSGP43/Awesome_ClaudeMD/issues

---

## 🎉 开始使用

```bash
# 1. 下载 VSIX
# 2. 安装到 VS Code
code --install-extension claudemd-manager-1.0.0.vsix

# 3. 点击左侧云图标
# 4. 开始管理你的协议！
```

---

<div align="center">

**给个 ⭐ 支持一下吧！**

Made with ❤️ by ClaudeMD Team

</div>
