# Templates 可复用模板

经过验证的 CLAUDE.md 模板集合，可直接复制到你的项目中使用。

## 可用模板

| 模板 | 版本 | 适用场景 | 说明 |
|------|------|----------|------|
| [team-claude-v1.md](./team-claude-v1.md) | v1.0 | 团队协作项目 | 包含核心工作流、错误模式、方法论 |

## 使用方法

### 方式 1：直接复制

```bash
# 复制模板到你的项目
cp templates/team-claude-v1.md /your/project/CLAUDE.md

# 编辑自定义区域
# 搜索 [YOUR_ 开头的占位符替换为实际值
```

### 方式 2：与 asinit 结合

1. 先运行 `/asinit` 生成基础执行协议
2. 将模板内容追加到 `<!-- ASINIT END -->` 之后

## 模板结构说明

每个模板包含以下核心部分：

```
核心原则       - 工作模式、提问规则
Top 5 错误模式 - 编码前必查的常见问题
核心方法论     - 三文件模式、失败追踪、阶段门控
能力速查       - MCP/Skills/Plugins 快速参考
项目配置       - 需要自定义的占位符区域
```

## 贡献模板

欢迎提交你的 CLAUDE.md 模板！

### 模板要求

1. **经过验证** - 在实际项目中使用过
2. **通用化处理** - 移除项目特定信息，使用占位符
3. **结构清晰** - 包含必要的核心部分
4. **文档完整** - 说明适用场景和使用方法

### 提交流程

```bash
# 1. Fork 并创建分支
git checkout -b template/your-template-name

# 2. 添加模板文件
# 命名规范：[用途]-claude-v[版本].md
touch templates/api-claude-v1.md

# 3. 更新本 README 的模板列表

# 4. 提交 PR
```

## 模板命名规范

```
[用途]-claude-v[版本].md

示例：
- team-claude-v1.md      # 团队协作
- api-claude-v1.md       # API 开发
- frontend-claude-v1.md  # 前端项目
- data-claude-v1.md      # 数据分析
```
