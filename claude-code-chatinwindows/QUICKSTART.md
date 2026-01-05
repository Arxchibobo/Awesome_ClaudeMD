# 快速开始指南

5 分钟内上手 Awesome ClaudeMD 插件！

## 🚀 安装（2 分钟）

### 步骤 1: 安装依赖并编译

```bash
cd claude-code-chatinwindows
npm install
npm run compile
```

### 步骤 2: 在 VS Code 中测试

按 `F5` 启动调试，会打开一个新的 VS Code 窗口，插件已激活。

## ⚡ 快速体验（3 分钟）

### 1. 更新协议

```
Ctrl+Shift+P → "Awesome ClaudeMD: 更新协议"
```

首次运行会提示克隆仓库，选择"是"。

### 2. 应用到项目

在任意项目中：

```
Ctrl+Shift+P → "Awesome ClaudeMD: 应用协议到当前项目"
```

查看生成的 `CLAUDE.md` 文件。

### 3. 提交 Tip

```
Ctrl+Shift+P → "Awesome ClaudeMD: 提交新 Tip"
```

输入主题和作者，编辑内容后保存。

## 📦 打包插件

```bash
npm run package
```

会生成 `awesome-claudemd-1.0.0.vsix` 文件。

安装：

```bash
code --install-extension awesome-claudemd-1.0.0.vsix
```

## 🎯 核心命令

| 命令 | 快捷键 | 说明 |
|------|--------|------|
| 更新协议 | - | 从 Git 拉取最新协议 |
| 应用协议 | - | 应用到当前项目 |
| 导出协议 | - | 导出 CLAUDE.md |
| 提交 Tip | - | 提交避坑经验 |
| 整合 Tips | - | AI 辅助整合 |

## ⚙️ 配置（可选）

```json
// settings.json
{
  "awesomeClaudeMD.repositoryPath": "~/Awesome_ClaudeMD",
  "awesomeClaudeMD.autoUpdate": true,
  "awesomeClaudeMD.updateInterval": 3600
}
```

## 🐛 遇到问题？

查看详细文档：
- [完整使用指南](USAGE.md)
- [构建指南](BUILD.md)
- [故障排查](USAGE.md#故障排查)

---

**就这么简单！** 开始享受团队协议管理的便利吧 🎉
