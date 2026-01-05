# 安装和使用指南

## 🎉 恭喜！插件开发完成

Awesome ClaudeMD VS Code 插件已经完成了所有核心功能的开发，包括：

✅ **完整的后端功能**
- Git 仓库管理和自动同步
- CLAUDE.md 智能解析和合并
- Tips 协同系统
- AWS Bedrock AI 整合
- 安全的凭证管理

✅ **全新的 UI 界面**
- 主控制面板（协议状态、快速操作）
- Tips 管理面板（可视化管理、编辑删除）
- 完整的样式和交互

---

## 📦 安装步骤

### 方式 1: 从源码安装（推荐）

#### 1. 确认项目已编译

```bash
cd claude-code-chatinwindows

# 如果还没编译，运行：
npm install
npm run compile
```

#### 2. 在 VS Code 中测试

**方法 A: 使用 F5 调试**

1. 在 VS Code 中打开 `claude-code-chatinwindows` 文件夹
2. 按 `F5` 键
3. 选择 "Run Extension"
4. 新窗口会打开，插件已激活

**方法 B: 创建 launch.json**

如果 F5 没反应，创建 `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}"
      ],
      "outFiles": [
        "${workspaceFolder}/out/**/*.js"
      ],
      "preLaunchTask": "${defaultBuildTask}"
    }
  ]
}
```

然后按 F5。

#### 3. 测试功能

在调试窗口中：

1. `Ctrl+Shift+P` → 输入 "Awesome ClaudeMD"
2. 应该看到所有命令：
   - 打开主面板 ✨
   - 更新协议
   - 应用协议到当前项目
   - 导出 CLAUDE.md
   - 打开 Tips 管理 ✨
   - 提交新 Tip
   - 整合 Tips

3. 测试主面板：
   - 运行 "打开主面板"
   - 应该看到漂亮的 UI 界面
   - 显示协议状态、Tips 统计等

4. 测试 Tips 管理：
   - 运行 "打开 Tips 管理"
   - 应该看到 Tips 列表
   - 可以创建、查看、编辑 Tips

### 方式 2: 打包安装

#### 1. 打包为 .vsix

```bash
cd claude-code-chatinwindows

# 安装打包工具（如果还没安装）
npm install -g @vscode/vsce

# 打包
npm run package
# 或
vsce package
```

会生成 `awesome-claudemd-1.0.0.vsix`

#### 2. 安装 .vsix

```bash
# 方法 1: 命令行
code --install-extension awesome-claudemd-1.0.0.vsix

# 方法 2: VS Code UI
# 扩展面板 → "..." 菜单 → "Install from VSIX..."
```

#### 3. 重启 VS Code

安装后重启 VS Code，插件即可使用。

---

## 🚀 快速上手

### 首次使用

#### 1. 打开主面板

```
Ctrl+Shift+P → "Awesome ClaudeMD: 打开主面板"
```

你会看到：
- 📋 协议状态
- 📦 仓库状态
- 💡 Tips 统计
- 📁 当前项目信息
- ⚡ 快速操作按钮

#### 2. 初始化仓库

如果是首次使用，点击主面板的 "🔄 更新协议" 按钮，或运行：

```
Ctrl+Shift+P → "Awesome ClaudeMD: 更新协议"
```

插件会提示克隆 Awesome_ClaudeMD 仓库。

#### 3. 应用协议到项目

在任意项目中，点击主面板的 "📝 应用到当前项目" 按钮，或运行：

```
Ctrl+Shift+P → "Awesome ClaudeMD: 应用协议到当前项目"
```

会在项目根目录生成或更新 `CLAUDE.md` 文件。

### 日常使用

#### 管理 Tips

1. 打开 Tips 面板：
   ```
   Ctrl+Shift+P → "Awesome ClaudeMD: 打开 Tips 管理"
   ```

2. 在面板中可以：
   - 查看所有 Tips（全部/待整合/已整合）
   - 创建新 Tip
   - 编辑或删除待整合的 Tip
   - 触发 AI 整合

#### 提交 Tips

方法 1: 在 Tips 面板点击 "➕ 新建 Tip"

方法 2: 运行命令
```
Ctrl+Shift+P → "Awesome ClaudeMD: 提交新 Tip"
```

按提示填写：
1. 主题（如 `git-commit-message`）
2. 作者名
3. 编辑内容
4. 选择是否立即提交到远程

#### 整合 Tips（需要 AWS 凭证）

方法 1: 在 Tips 面板点击 "🔄 整合 Tips"

方法 2: 运行命令
```
Ctrl+Shift+P → "Awesome ClaudeMD: 整合 Tips"
```

首次使用会提示配置 AWS 凭证。

---

## ⚙️ 配置

### 基础设置

打开 VS Code 设置，搜索 "Awesome ClaudeMD"：

```json
{
  // 仓库路径（默认: ~/Awesome_ClaudeMD）
  "awesomeClaudeMD.repositoryPath": "",

  // 启动时自动检查更新
  "awesomeClaudeMD.autoUpdate": true,

  // 自动更新间隔（秒）
  "awesomeClaudeMD.updateInterval": 3600,

  // AWS Bedrock 区域
  "awesomeClaudeMD.aws.region": "us-west-1",

  // 本地 LLM（未来版本）
  "awesomeClaudeMD.localLLM.enabled": false
}
```

### AWS Bedrock 配置

运行整合 Tips 命令时，会提示输入：
- AWS Access Key ID
- AWS Secret Access Key

凭证会安全存储在 VS Code SecretStorage 中。

---

## 🎯 功能演示

### 主面板

打开主面板后，你会看到：

```
🚀 Awesome ClaudeMD 管理器

┌─────────────────────────────────────┐
│ 📋 协议状态                         │
│ ✓ 仓库已克隆  ✓ 最新版本           │
│ 最后更新: 2026-01-05 14:30         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📦 仓库状态                         │
│ 分支: main                          │
│ 状态: 已同步                        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 💡 Tips 统计                        │
│ 总计: 12 个 Tips                    │
│ 待整合: 2 个                        │
│ 已整合: 10 个                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📁 当前项目                         │
│ 项目: my-awesome-project            │
│ CLAUDE.md: ✓ 已存在                │
└─────────────────────────────────────┘

⚡ 快速操作
[🔄 更新协议] [📝 应用到当前项目] [💾 导出协议]
[💡 管理 Tips] [⚙️ 设置] [🔃 刷新]
```

### Tips 管理面板

打开 Tips 管理后，你会看到：

```
💡 Tips 管理

[➕ 新建 Tip] [🔄 整合 Tips] [🔃 刷新]

[全部] [待整合] [已整合]

┌─────────────────────────────────────┐
│ Git 提交规范         ⏳ 待整合     │
│ 作者: leon | 创建: 2026-01-05      │
│                                     │
│ # Git 提交规范                      │
│ ## 问题                             │
│ 团队提交信息格式不统一...           │
│                                     │
│ [📄 查看] [✏️ 编辑] [🗑️ 删除]     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 空值检查              ✓ 已整合     │
│ 作者: bob | 整合: 2026-01-04       │
│                                     │
│ # 空值检查                          │
│ ## 问题                             │
│ 没有检查 API 返回的空值...          │
│                                     │
│ [📄 查看]                           │
└─────────────────────────────────────┘
```

---

## 🐛 故障排查

### 问题 1: F5 无法启动调试

**症状**: 按 F5 没反应或报错

**解决方案**:

1. 确认已编译：
   ```bash
   cd claude-code-chatinwindows
   npm run compile
   ls out/  # 应该看到 extension.js 等文件
   ```

2. 检查 `.vscode/launch.json` 是否存在（参见上文）

3. 重启 VS Code

### 问题 2: 主面板打开但显示空白

**症状**: 面板打开但看不到内容

**解决方案**:

1. 打开开发者工具：
   ```
   帮助 → 切换开发人员工具
   ```

2. 查看 Console 是否有错误

3. 常见原因：
   - 仓库未初始化 → 先运行"更新协议"
   - 权限问题 → 检查仓库路径权限

### 问题 3: Tips 整合失败

**症状**: 提示"未配置 AWS 凭证"

**解决方案**:

1. 准备 AWS Access Key 和 Secret Key
2. 运行 "整合 Tips" 命令
3. 按提示输入凭证
4. 重试整合

### 问题 4: 编译错误

**症状**: `npm run compile` 报错

**解决方案**:

1. 删除 node_modules 重新安装：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. 检查 TypeScript 版本：
   ```bash
   npx tsc --version  # 应该是 5.3+
   ```

3. 查看具体错误信息并修复

---

## 🎓 进阶使用

### 自定义快捷键

在 `keybindings.json` 中添加：

```json
[
  {
    "key": "ctrl+alt+m",
    "command": "awesomeClaudeMD.openMainPanel"
  },
  {
    "key": "ctrl+alt+t",
    "command": "awesomeClaudeMD.openTipsPanel"
  },
  {
    "key": "ctrl+alt+u",
    "command": "awesomeClaudeMD.updateProtocol"
  }
]
```

### 批量应用协议

目前需要手动遍历项目：

```bash
# 脚本示例
for project in /path/to/projects/*; do
  code "$project"
  # 在打开的窗口中运行命令
done
```

v1.2 版本会提供 UI 界面。

### 离线使用

如果没有 AWS 账号：
1. 所有基本功能都可用（更新、应用、导出）
2. 只有 Tips 自动整合功能需要 AWS
3. 可以手动编辑协议来整合 Tips

---

## 📈 下一步

### 立即体验

1. 按 F5 启动调试
2. 打开主面板看看
3. 尝试应用协议到项目
4. 创建一个 Tip

### 反馈和改进

- 遇到问题？[提交 Issue](https://github.com/yourusername/awesome-claudemd-vscode/issues)
- 有建议？[参与讨论](https://github.com/yourusername/awesome-claudemd-vscode/discussions)
- 想贡献代码？查看 [贡献指南](CONTRIBUTING.md)

### 后续版本

- **v1.2**: 设置面板、批量应用
- **v1.3**: 本地 LLM 支持
- **v2.0**: 多仓库管理、模板市场

---

**享受插件带来的便利吧！** 🎉

有任何问题随时查看：
- [README.md](README.md) - 功能介绍
- [USAGE.md](USAGE.md) - 详细使用说明
- [BUILD.md](BUILD.md) - 构建指南
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - 项目总结
