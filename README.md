# ASINIT

Claude Code 执行协议初始化工具，为项目生成标准化的 AI 开发规范。

## 架构概览

```mermaid
graph TD
    subgraph "用户环境"
        User[开发者]
        CC[Claude Code]
        ASINIT[asinit 命令]
    end

    subgraph "目标项目"
        CMD[CLAUDE.md]
        Specs[specs/]
        Code[源代码]
    end

    subgraph "外部服务"
        Gemini[Gemini Subagent]
        GHA[GitHub Actions]
    end

    User -->|/asinit| CC
    CC -->|读取| ASINIT
    ASINIT -->|生成/更新| CMD
    CMD -.->|配置行为| CC
    CC -->|严格模式| Specs
    CC -->|验收| Gemini
    GHA -->|整合 tips| ASINIT
```

## 安装

```bash
cp asinit_AwosomeCLAUDE.md ~/.claude/commands/asinit.md
```

## 使用

```bash
/asinit
```

## 工作原理

| 场景 | 行为 |
|------|------|
| `CLAUDE.md` 不存在 | 创建新文件 |
| 存在但无标记 | 插入到文件最前面 |
| 存在且有标记 | 只更新标记内容，保留其他部分 |

## 两种模式

### 严格执行模式

当用户提及 specs 文档时触发，强制 5 步流程：

1. 加载 Specs
2. 单 Task 执行
3. 强制测试
4. Gemini 验收
5. 提交

### 通用开发模式

默认模式，4 步流程：

1. 理解需求
2. 实现
3. 测试
4. 提交

---

## 团队协作

### 提交避坑经验

```bash
# 1. 拉取最新
git pull origin main

# 2. 新建 tips 文件（禁止修改已有文件）
# 命名：<主题>-<姓名>.md

# 3. 按模板填写（参考 tips/_template.md）

# 4. 提交
git add tips/你的文件.md
git commit -m "tips: 添加 xxx 避坑经验"
git push origin main
```

**规则：**
- ❌ 禁止修改 `asinit_AwosomeCLAUDE.md`
- ❌ 禁止修改他人 tips
- ✅ 只能新增 `tips/*.md`

### 自动整合

推送 tips 后，GitHub Actions 自动：

1. 检测新增文件
2. 调用 Claude API 智能整合
3. 更新核心协议
4. 自动提交

**配置：** 在仓库 Settings → Secrets 添加：
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

---

## 目录结构

```
├── asinit_AwosomeCLAUDE.md   # 核心协议
├── README.md
├── Subagent/
│   └── gemini-mcp-suagent.md # Gemini 子代理配置
└── tips/                      # 团队避坑经验
    ├── README.md
    └── _template.md
```

## License

MIT
