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


## License

MIT
