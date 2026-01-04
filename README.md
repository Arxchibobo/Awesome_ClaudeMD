# Awesome ClaudeMD

**团队共享 CLAUDE.md 的最佳实践** — 一次安装，永久热更新

## 为什么需要这个？

手动维护 `CLAUDE.md` 的痛点：
- 每次发现新问题都要手动编辑
- 团队成员的经验无法共享
- 版本混乱，不知道哪个是最新的

**Awesome ClaudeMD 的解决方案：**

```
/asinit  ← 一个命令，自动拉取最新协议到你的项目
```

## 核心特性

### 🔥 热更新机制

```bash
# 一次安装
git clone https://github.com/LeonSGP43/Awesome_ClaudeMD.git ~/Awesome_ClaudeMD
ln -sf ~/Awesome_ClaudeMD/asinit_AwosomeCLAUDE.md ~/.claude/commands/asinit.md

# 永久使用 — 每次执行 /asinit 自动拉取最新版本
/asinit
```

软链接 + 自动 git pull = **零维护成本的持续更新**

### 🤖 AI 自动合并团队经验

团队成员提交避坑经验 → GitHub Actions 触发 → Claude 智能整合 → 自动更新核心协议

```
提交 tips/xxx.md → AI 审核 → 自动合并到协议 → 全团队 /asinit 即可同步
```

**安全机制：**
- 路径遍历防护
- Prompt 注入防护  
- 自动备份恢复
- 输出完整性校验

### 📐 分层架构设计

协议分为两大部分，互不干扰：

| 层级 | 内容 | 可修改 |
|------|------|--------|
| **执行流程层** | 标准开发流程（严格模式/通用模式） | ❌ 锁定 |
| **约束补丁层** | 团队积累的避坑经验、规范约束 | ✅ AI 自动追加 |

```markdown
<!-- ASINIT START -->
## 一、标准执行流程     ← 锁定，不可修改
...
## 二、规范约束         ← 补丁区，持续积累
<!-- CONSTRAINTS START -->
### 测试规范
### Git 提交规范
### ...更多团队经验
<!-- CONSTRAINTS END -->
<!-- ASINIT END -->
```

## 快速开始

### 安装（一次性）

**macOS / Linux：**
```bash
git clone https://github.com/LeonSGP43/Awesome_ClaudeMD.git ~/Awesome_ClaudeMD
mkdir -p ~/.claude/commands
ln -sf ~/Awesome_ClaudeMD/asinit_AwosomeCLAUDE.md ~/.claude/commands/asinit.md
```

**Windows (PowerShell 管理员)：**
```powershell
git clone https://github.com/LeonSGP43/Awesome_ClaudeMD.git "$env:USERPROFILE\Awesome_ClaudeMD"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\commands"
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\commands\asinit.md" -Target "$env:USERPROFILE\Awesome_ClaudeMD\asinit_AwosomeCLAUDE.md" -Force
```

### 使用

在任意项目中执行：

```bash
/asinit
```

自动完成：
1. 拉取最新协议版本
2. 生成/更新项目的 `CLAUDE.md`
3. 保留你的自定义配置（只更新标记区域内的内容）

---

## 三种使用方式

| 方式 | 适合场景 | 更新方式 |
|------|----------|----------|
| **① /asinit 命令** | 推荐！长期使用 | 自动热更新 |
| **② 手动复制** | 临时使用、无法安装 | 手动同步 |
| **③ Fork 定制** | 企业内部定制版 | 自行维护 |

### 方式①：/asinit 命令（推荐）

见上方「快速开始」

### 方式②：手动复制

直接复制 [asinit_AwosomeCLAUDE.md](./asinit_AwosomeCLAUDE.md) 中 `<!-- ASINIT START -->` 到 `<!-- ASINIT END -->` 之间的内容到你的 `CLAUDE.md`

### 方式③：Fork 定制

Fork 本仓库，修改协议内容，配置 AWS Secrets 启用自动整合

---

## 团队协作：贡献避坑经验

### 提交流程

```bash
# 1. 拉取最新
git pull origin main

# 2. 创建 tips 文件（命名：主题-姓名.md）
touch tips/null-check-zhangsan.md

# 3. 按模板填写
# 4. 提交推送
git add tips/你的文件.md
git commit -m "tips: 添加 xxx 避坑经验"
git push
```

### Tips 模板

```markdown
# 主题名称

## 问题
简述遇到的问题

## 解决方案
Claude 应该如何处理

## 示例（可选）
具体例子
```

### 自动整合流程

```
推送 → GitHub Actions → Claude 分析 → 智能合并 → 归档原文件
```

**提交规则：**
- ✅ 只能新增 `tips/*.md` 文件
- ❌ 禁止修改 `asinit_AwosomeCLAUDE.md`（AI 自动维护）
- ❌ 禁止修改他人的 tips

---

## 两种开发模式

### 严格执行模式

触发条件：用户提及 specs 文档（requirements.md、design.md、tasks.md）

强制 5 步流程：加载 Specs → 单 Task 执行 → 强制测试 → Gemini 验收 → 提交

### 通用开发模式

默认模式，4 步流程：理解需求 → 实现 → 测试 → 提交

---

## 仓库配置（Fork 用户）

Settings → Secrets and variables → Actions：

| Secret | 说明 |
|--------|------|
| `AWS_ACCESS_KEY_ID` | AWS 访问密钥 ID |
| `AWS_SECRET_ACCESS_KEY` | AWS 访问密钥 |

---

## 目录结构

```
├── asinit_AwosomeCLAUDE.md   # 核心协议（AI 维护）
├── tips/                      # 团队避坑经验
│   ├── _template.md           # 模板
│   └── archived/              # 已整合归档
├── .github/
│   ├── scripts/integrate-tips.js
│   └── workflows/integrate-tips.yml
└── Subagent/                  # Gemini 子代理配置
```

## License

MIT
