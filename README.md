# ASINIT - Claude 执行协议初始化工具

一个 Claude Code user 级别的 command，用于在项目中自动初始化或更新执行协议。

## 功能

- 自动检测并更新项目中的 `CLAUDE.md` 文件
- 以补丁方式更新，不破坏已有内容
- 支持两种开发模式：严格执行模式（有 specs）和通用开发模式（无 specs）
- 集成 Gemini subagent 进行代码验收

## 安装

将 `asinit_AwosomeCLAUDE.md` 复制到 Claude 的 user 级别 commands 目录：

```bash
cp asinit_AwosomeCLAUDE.md ~/.claude/commands/asinit.md
```

## 使用

在任意项目目录下，使用 Claude Code 执行：

```
/asinit
```

## 工作原理

执行 `/asinit` 后，会按以下逻辑处理 `CLAUDE.md`：

| 场景 | 行为 |
|------|------|
| `CLAUDE.md` 不存在 | 在当前目录创建新文件，写入协议内容 |
| `CLAUDE.md` 存在，无 `<!-- ASINIT START -->` 标记 | 将协议内容插入到文件**最前面** |
| `CLAUDE.md` 存在，有标记 | 只更新标记之间的内容，**保留其他部分不变** |

## 两种开发模式

### 严格执行模式

当用户表达了使用 specs 开发的意图时触发：

- 引用了 `requirements.md`、`design.md`、`tasks.md` 等文件
- 明确要求"按规范执行"、"按设计文档开发"
- 提到任何 specs 相关内容

**流程：**
1. 加载 Specs（强制）
2. 单 Task 执行
3. 强制测试
4. Gemini 验收（subagent）
5. 提交与结束

### 通用开发模式

当用户未提及 specs 时，走常规开发流程：

1. 理解需求
2. 实现开发
3. 测试验证
4. 提交

## 协议内容预览

生成的协议会包含在 `<!-- ASINIT START -->` 和 `<!-- ASINIT END -->` 标记之间，主要包括：

- 模式判断逻辑
- 严格执行模式的 5 步流程
- 通用开发模式的 4 步流程
- 测试规范（英文注释、统一测试目录等）

---

## 团队协作 SOP

### 角色分工

| 角色 | 职责 |
|------|------|
| 维护者（你） | 审核 PR、整合 tips 到核心协议 |
| 团队成员 | 提交避坑经验到 `tips/` 目录 |

---

### 团队成员：提交避坑经验

**流程：**

```
1. 拉取最新代码
   git pull origin main

2. 在 tips/ 目录下新建 md 文件（禁止修改已有文件）
   文件命名：<主题>-<你的名字>.md
   例如：typescript-type-error-zhangsan.md

3. 按模板填写内容（参考 tips/_template.md）

4. 提交并推送
   git add tips/你的文件.md
   git commit -m "tips: 添加 xxx 避坑经验"
   git push origin main
```

**注意事项：**
- ❌ 禁止直接修改 `asinit_AwosomeCLAUDE.md`
- ❌ 禁止修改他人的 tips 文件
- ✅ 只能在 `tips/` 目录下新增 `.md` 文件

---

### 自动整合（GitHub Actions）

当团队成员推送 tips 文件到 main 分支后，GitHub Actions 会自动：

1. 检测 `tips/` 目录下的新增文件
2. 调用 Claude Sonnet 4 API 智能整合
3. 更新 `asinit_AwosomeCLAUDE.md` 核心协议
4. 更新 `tips/README.md` 已整合记录
5. 自动提交变更

**维护者无需手动操作**，只需在 GitHub 仓库设置中添加 Secret：

```
Settings → Secrets and variables → Actions → New repository secret

Name: ANTHROPIC_API_KEY
Value: 你的 Claude API Key
```

**为什么用 AI 自动整合？**
- 避免人工整合导致的重复条目
- AI 智能判断是"更新已有条目"还是"新增条目"
- 保持协议文档结构一致性
- 完全自动化，零人工干预

---

### 团队成员：获取最新协议

当维护者整合完成后，团队成员在各自项目中执行：

```
/asinit
```

即可自动更新本地项目的 `CLAUDE.md`。

---

## 目录结构

```
├── asinit_AwosomeCLAUDE.md   # 核心协议（维护者管理）
├── README.md                  # 使用文档
├── Subagent/                  # subagent 配置
└── tips/                      # 团队避坑经验（成员贡献）
    ├── README.md              # 贡献指南 + 已整合记录
    ├── _template.md           # 模板文件
    └── xxx-zhangsan.md        # 成员提交的 tips
```

## License

MIT
