# ClaudeMD Manager - VS Code 扩展

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![VS Code](https://img.shields.io/badge/VS%20Code-1.85.0+-brightgreen.svg)

**团队共享 CLAUDE.md 的可视化管理工具**

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [使用指南](#-使用指南) • [常见问题](#-常见问题)

</div>

---

## 📖 简介

ClaudeMD Manager 是一个 VS Code 扩展，用于管理 [Awesome_ClaudeMD](https://github.com/LeonSGP43/Awesome_ClaudeMD) 团队协议仓库。它提供了可视化界面来：

- 🔄 自动同步最新协议
- 📝 管理团队 Tips（避坑经验）
- 🤖 使用 AI 自动整合 Tips
- 📊 可视化仪表板查看状态

告别手动复制粘贴，告别版本不一致，一键管理你的 CLAUDE.md 协议！

---

## ✨ 功能特性

### 🎯 核心功能

- **协议自动更新**：一键拉取最新协议，支持自动定时检查
- **智能应用协议**：保留项目自定义内容，智能合并新协议
- **Tips 协同管理**：团队成员可提交避坑经验，统一整合
- **AI 自动整合**：使用 AWS Bedrock Claude 自动整合 Tips 到协议
- **可视化仪表板**：实时查看协议状态、仓库状态、Tips 统计

### 🎨 用户界面

#### 主面板
- 📁 当前项目状态（CLAUDE.md 是否存在、是否最新）
- 📦 仓库状态（分支、是否有更新、未提交变更）
- 📝 Tips 统计（待整合/已整合数量）
- 📜 最近 5 次提交历史
- ⚡ 快速操作按钮（更新、应用、导出）

#### Tips 管理面板
- 📌 待整合 Tips 列表
- ✅ 已整合 Tips 列表
- 🔍 查看、编辑、删除 Tips
- 🤖 一键整合所有 Tips

### 🛠️ 命令面板

- `ClaudeMD: 更新协议` - 从远程仓库拉取最新协议
- `ClaudeMD: 应用协议到当前项目` - 将协议应用到打开的项目
- `ClaudeMD: 导出 CLAUDE.md` - 导出当前项目的协议文件
- `ClaudeMD: 提交新 Tip` - 创建并提交新的避坑经验
- `ClaudeMD: 整合 Tips` - 使用 AI 自动整合待处理的 Tips
- `ClaudeMD: 打开主面板` - 打开可视化主面板
- `ClaudeMD: 打开 Tips 管理` - 打开 Tips 管理面板

---

## 🚀 快速开始

### 方式1：直接安装 VSIX（推荐）

1. **下载 VSIX 文件**

   从本仓库下载 `claudemd-manager-1.0.0.vsix` 文件

2. **安装扩展**

   **方法 A：使用 VS Code UI**
   ```
   1. 打开 VS Code
   2. 按 Ctrl+Shift+X 打开扩展面板
   3. 点击右上角 "..." 菜单
   4. 选择 "Install from VSIX..."
   5. 选择下载的 .vsix 文件
   ```

   **方法 B：使用命令行**
   ```bash
   code --install-extension claudemd-manager-1.0.0.vsix
   ```

3. **首次使用**

   安装后重新加载 VS Code，插件会自动激活：
   - 左侧活动栏出现 **云图标 (☁)**
   - 右下角状态栏显示 **☁ ClaudeMD**
   - 首次使用会提示克隆 Awesome_ClaudeMD 仓库

### 方式2：从源码构建

```bash
# 1. 克隆仓库
git clone https://github.com/LeonSGP43/Awesome_ClaudeMD.git
cd Awesome_ClaudeMD/claude-code-chatinwindows

# 2. 安装依赖
npm install

# 3. 编译
npm run compile

# 4. 打包
npm run package

# 5. 安装
code --install-extension claudemd-manager-1.0.0.vsix
```

---

## 📚 使用指南

### 基本工作流

#### 1. 更新协议到最新版本

```
方式 A：点击侧边栏云图标 → 主面板 → 点击"更新协议"按钮
方式 B：Ctrl+Shift+P → 输入"ClaudeMD: 更新协议"
方式 C：点击右下角状态栏 ☁ 图标 → 选择"更新协议"
```

插件会自动从 GitHub 拉取最新协议，如有更新会显示通知。

#### 2. 应用协议到当前项目

```
1. 在 VS Code 中打开你的项目
2. Ctrl+Shift+P → "ClaudeMD: 应用协议到当前项目"
3. 插件会智能合并：
   - 保留项目现有的自定义内容
   - 更新 ASINIT 标准流程部分
   - 追加新的约束和 Tips
```

如果项目已有 CLAUDE.md，会先备份为 `CLAUDE.md.bak`。

#### 3. 提交团队 Tips

当你发现有价值的避坑经验：

```
1. Ctrl+Shift+P → "ClaudeMD: 提交新 Tip"
2. 输入 Tip 标题（如：null-check）
3. 输入你的名字（如：leon）
4. 在打开的编辑器中填写 Tip 内容
5. 点击"提交"按钮
```

Tips 会自动提交到远程仓库的 `tips/` 目录。

#### 4. 整合 Tips（需要 AWS 凭证）

当累积了一些 Tips 后，可以使用 AI 自动整合：

```
1. Ctrl+Shift+P → "ClaudeMD: 整合 Tips"
2. 首次使用会提示配置 AWS Bedrock 凭证
3. 输入 Access Key ID 和 Secret Access Key
4. 等待 AI 处理（约 1-3 分钟）
5. 整合完成后 Tips 会自动归档
```

---

## ⚙️ 配置说明

### VS Code 设置

在 VS Code 设置中搜索 `claudemd`，可配置：

```json
{
  // 仓库路径（默认：~/Awesome_ClaudeMD）
  "claudemd.repositoryPath": "",

  // 启动时自动检查更新
  "claudemd.autoUpdate": true,

  // 自动更新检查间隔（秒）
  "claudemd.updateInterval": 3600,

  // AWS Bedrock 区域
  "claudemd.aws.region": "us-west-1",

  // 启用本地 LLM（实验性功能）
  "claudemd.localLLM.enabled": false,
  "claudemd.localLLM.endpoint": "http://localhost:11434",
  "claudemd.localLLM.model": "llama2"
}
```

### AWS Bedrock 配置（可选）

如需使用 AI 整合 Tips 功能：

1. **获取 AWS 凭证**
   - 登录 [AWS Console](https://console.aws.amazon.com/)
   - 导航至 IAM → 用户 → 创建访问密钥
   - 保存 Access Key ID 和 Secret Access Key

2. **配置权限**

   确保 IAM 用户有 Bedrock 调用权限：
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Action": "bedrock:InvokeModel",
       "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude-*"
     }]
   }
   ```

3. **在插件中配置**

   首次运行"整合 Tips"命令时，按提示输入凭证。凭证会安全存储在 VS Code SecretStorage 中。

---

## 🎯 使用场景

### 场景1：新项目初始化

```bash
1. 在 VS Code 中打开新项目
2. Ctrl+Shift+P → "ClaudeMD: 应用协议到当前项目"
3. 开始编码！
```

### 场景2：协议有更新

```bash
1. 插件会自动通知有新版本（如启用自动更新）
2. 点击通知 → 更新协议
3. 再次应用到项目即可获得最新规范
```

### 场景3：团队协作

```bash
团队成员 A：
- 发现避坑经验 → 提交 Tip

团队 Lead：
- 定期运行"整合 Tips"
- AI 自动审核并合并到主协议
- 推送到远程仓库

团队成员 B/C/D：
- 启动 VS Code → 自动同步最新协议
- 应用到项目 → 获得最新经验
```

---

## ❓ 常见问题

### Q1: 安装后没有看到云图标？

**A**: 尝试以下步骤：
1. 重新加载 VS Code（Ctrl+Shift+P → "Reload Window"）
2. 检查扩展是否已启用（Ctrl+Shift+X → 搜索 "ClaudeMD"）
3. 查看输出面板（Ctrl+Shift+U → 选择 "ClaudeMD"）检查错误日志

### Q2: 提示"仓库克隆失败"？

**A**: 确保：
- 有网络连接
- 已安装 Git 并配置在 PATH 中
- GitHub 可访问（如需代理请配置 Git 代理）

### Q3: 整合 Tips 失败？

**A**: 检查：
- AWS 凭证是否正确
- IAM 用户是否有 `bedrock:InvokeModel` 权限
- 选择的区域是否支持 Claude 模型（推荐 us-west-1）
- 网络是否可访问 AWS Bedrock

### Q4: 如何更新插件？

**A**:
```bash
# 1. 下载新版本 VSIX
# 2. 卸载旧版本
code --uninstall-extension claudemd-team.claudemd-manager

# 3. 安装新版本
code --install-extension claudemd-manager-1.0.0.vsix
```

### Q5: 如何卸载？

**A**:
```bash
# 命令行
code --uninstall-extension claudemd-team.claudemd-manager

# 或者在 VS Code 扩展面板中右键 → 卸载
```

### Q6: 协议合并有冲突怎么办？

**A**: 插件会智能合并，但如遇问题：
1. 查看 `CLAUDE.md.bak` 备份文件
2. 手动比对差异
3. 或删除 CLAUDE.md 后重新应用

---

## 🛠️ 技术栈

- **语言**: TypeScript 5.3+
- **框架**: VS Code Extension API 1.85+
- **Git**: simple-git 3.21.0
- **AI**: AWS Bedrock Runtime (Claude Sonnet 4.5)
- **UI**: Webview API + 原生 HTML/CSS/JS

---

## 📦 项目结构

```
claude-code-chatinwindows/
├── src/
│   ├── extension.ts           # 插件入口
│   ├── views/                 # Webview 视图
│   │   ├── main-panel.ts      # 主面板
│   │   └── tips-panel.ts      # Tips 管理面板
│   ├── claudemd/              # 协议管理
│   │   ├── manager.ts         # CLAUDE.md 管理器
│   │   ├── protocol.ts        # 协议解析器
│   │   ├── tips.ts            # Tips 管理器
│   │   └── integrator.ts      # AI 整合引擎
│   ├── git/                   # Git 操作
│   │   ├── repository.ts      # 仓库管理
│   │   └── sync.ts            # 同步管理
│   ├── ai/                    # AI 集成
│   │   └── bedrock.ts         # AWS Bedrock 客户端
│   └── utils/                 # 工具函数
│       ├── config.ts          # 配置管理
│       ├── file.ts            # 文件操作
│       └── notifications.ts   # 通知管理
├── templates/                 # 模板文件
├── out/                       # 编译输出
├── package.json               # 插件配置
└── README.md                  # 本文档
```

---

## 🤝 贡献指南

欢迎提交 Issues 和 Pull Requests！

### 开发环境

```bash
# 1. 克隆仓库
git clone https://github.com/LeonSGP43/Awesome_ClaudeMD.git
cd Awesome_ClaudeMD/claude-code-chatinwindows

# 2. 安装依赖
npm install

# 3. 编译
npm run compile

# 4. 调试
# 在 VS Code 中按 F5 启动调试
```

### 提交规范

- `feat:` 新功能
- `fix:` 修复 Bug
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 重构
- `test:` 测试
- `chore:` 构建/工具

---

## 📄 许可证

MIT License

Copyright (c) 2026 ClaudeMD Team

---

## 🔗 相关链接

- **主仓库**: https://github.com/LeonSGP43/Awesome_ClaudeMD
- **问题反馈**: https://github.com/LeonSGP43/Awesome_ClaudeMD/issues
- **VS Code 市场**: (待发布)

---

## 📞 支持

遇到问题？

1. 查看 [常见问题](#-常见问题)
2. 查看 [使用指南](USAGE.md)
3. 提交 [Issue](https://github.com/LeonSGP43/Awesome_ClaudeMD/issues)

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐ Star！**

Made with ❤️ by ClaudeMD Team

</div>
