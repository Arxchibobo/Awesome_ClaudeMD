# 使用指南

详细的使用说明和最佳实践。

## 目录

1. [初次使用](#初次使用)
2. [日常工作流](#日常工作流)
3. [Tips 协同](#tips-协同)
4. [高级功能](#高级功能)
5. [故障排查](#故障排查)
6. [最佳实践](#最佳实践)

---

## 初次使用

### 步骤 1: 安装插件

从 VS Code 市场安装或从 .vsix 文件安装（参见 README）。

### 步骤 2: 配置仓库

插件首次激活时会自动提示配置：

1. 打开命令面板 (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. 输入 `Awesome ClaudeMD: 更新协议`
3. 如果未找到仓库，选择"是"来克隆

**手动配置路径：**

```json
// settings.json
{
  "awesomeClaudeMD.repositoryPath": "C:/Users/你的用户名/Awesome_ClaudeMD"
}
```

### 步骤 3: 验证安装

运行命令 `Awesome ClaudeMD: 更新协议`，应该看到：

```
✅ 协议已是最新版本
```

或

```
✅ 协议已更新到最新版本 (X 个文件变更)
```

---

## 日常工作流

### 场景 1: 开始新项目

```
1. 创建新项目目录
2. 在 VS Code 中打开项目
3. 运行: Awesome ClaudeMD: 应用协议到当前项目
4. 开始编码！
```

### 场景 2: 加入现有项目

```
1. clone 项目
2. 检查是否有 CLAUDE.md
3. 如果有，运行: Awesome ClaudeMD: 更新协议
   （会智能合并，保留项目自定义内容）
4. 如果没有，运行: Awesome ClaudeMD: 应用协议到当前项目
```

### 场景 3: 协议更新后

团队更新了协议，你需要同步：

```
1. 运行: Awesome ClaudeMD: 更新协议
2. 查看变更内容
3. 运行: Awesome ClaudeMD: 应用协议到当前项目
4. 审查合并结果
```

**自动化：** 启用自动更新

```json
{
  "awesomeClaudeMD.autoUpdate": true,
  "awesomeClaudeMD.updateInterval": 3600  // 每小时检查一次
}
```

---

## Tips 协同

### 提交新 Tip

**适用场景：** 你发现了一个避坑经验，想分享给团队

#### 步骤：

1. 运行命令: `Awesome ClaudeMD: 提交新 Tip`

2. 输入主题（例如：`git-commit-message`）

3. 输入作者名（例如：`leon`）

4. 编辑 Tip 内容：

```markdown
# Git 提交规范

## 问题

团队提交信息格式不统一，难以追踪变更历史。

## 解决方案

Claude 应该强制使用以下格式：
- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档变更
- `test:` 测试相关

## 示例

正确：
```
feat: 添加用户登录功能
```

错误：
```
add login
```
```

5. 保存文件

6. 选择"是"立即提交到远程仓库

### 查看待整合的 Tips

运行命令: `Awesome ClaudeMD: 打开 Tips 管理`（v1.1 版本中）

或手动查看：

```bash
cd ~/Awesome_ClaudeMD/tips
ls -l
```

### 整合 Tips

**前提：** 已配置 AWS 凭证

1. 运行命令: `Awesome ClaudeMD: 整合 Tips`

2. 插件会：
   - 读取所有待整合的 Tips
   - 调用 Claude AI 分析并合并到协议
   - 自动归档已整合的 Tips
   - 更新 tips/README.md

3. 查看整合结果：

```
✅ Tips 整合完成
- 新增 3 条约束
- 已归档 3 个 Tips
```

---

## 高级功能

### 批量应用协议

**场景：** 你有多个项目需要统一应用协议

（v1.1 版本中提供 UI 界面）

**手动方式：**

```bash
# 创建项目列表
projects=(
  "/path/to/project1"
  "/path/to/project2"
  "/path/to/project3"
)

# 遍历应用
for project in "${projects[@]}"; do
  code "$project"
  # 在打开的窗口中运行: Awesome ClaudeMD: 应用协议到当前项目
done
```

### 导出自定义协议

如果你的项目有特殊的自定义内容：

1. 运行: `Awesome ClaudeMD: 导出 CLAUDE.md`
2. 选择保存位置
3. 可以作为模板分享给其他团队

### 协议版本回退

如果更新后发现问题：

```bash
cd ~/Awesome_ClaudeMD
git log --oneline  # 查看提交历史
git checkout <commit-hash> asinit_AwosomeCLAUDE.md
```

然后在 VS Code 中运行 `应用协议到当前项目`。

---

## 故障排查

### 问题 1: 更新协议失败

**症状：**
```
⚠️ 更新失败: fatal: not a git repository
```

**解决方案：**
1. 删除旧仓库目录
2. 重新运行 `Awesome ClaudeMD: 更新协议`
3. 选择"是"克隆新仓库

### 问题 2: 应用协议时提示"未找到工作区"

**症状：**
```
当前没有打开的工作区
```

**解决方案：**
确保在 VS Code 中打开了文件夹（不是单个文件）。

`文件 → 打开文件夹`

### 问题 3: Tips 整合失败

**症状：**
```
未配置 AWS 凭证，无法自动整合
```

**解决方案：**

#### 方法 1: 配置 AWS 凭证

1. 准备 AWS Access Key 和 Secret Key
2. 运行 `Awesome ClaudeMD: 整合 Tips`
3. 按提示配置

#### 方法 2: 使用本地 LLM（v1.1）

```json
{
  "awesomeClaudeMD.localLLM.enabled": true,
  "awesomeClaudeMD.localLLM.endpoint": "http://localhost:11434",
  "awesomeClaudeMD.localLLM.model": "llama2"
}
```

### 问题 4: Git 操作权限错误

**症状：**
```
Permission denied (publickey)
```

**解决方案：**
配置 Git SSH 密钥或使用 HTTPS：

```bash
cd ~/Awesome_ClaudeMD
git remote set-url origin https://github.com/LeonSGP43/Awesome_ClaudeMD.git
```

### 问题 5: 协议合并后格式混乱

**症状：**
CLAUDE.md 中出现重复内容或标记错位

**解决方案：**
1. 恢复备份：项目根目录会有 `CLAUDE.md.bak`
2. 手动检查冲突
3. 运行 `Awesome ClaudeMD: 应用协议到当前项目` 重新应用

---

## 最佳实践

### 1. 定期同步协议

建议：
- 每天启动 VS Code 时检查更新
- 启用自动更新功能

### 2. Tip 提交规范

**好的 Tip:**
```markdown
# 空值检查

## 问题
没有检查 API 返回的空值导致崩溃

## 解决方案
Claude 应该在使用 API 数据前添加空值检查

## 示例
```typescript
const data = await api.fetch();
if (!data || !data.items) {
  throw new Error('Invalid response');
}
```
```

**不好的 Tip:**
```markdown
# 注意事项

记得检查空值。
```

### 3. 协议自定义

在 CLAUDE.md 中添加项目特定内容时，**不要**放在 `<!-- ASINIT START/END -->` 标记之间。

**推荐结构：**

```markdown
<!-- ASINIT START -->
...标准协议...
<!-- ASINIT END -->

# 项目特定规范

## 数据库约定
...

## API 规范
...
```

### 4. 团队协作

- **协议变更：** 由团队 lead 统一审核和合并
- **Tips 提交：** 任何成员都可以提交
- **定期整合：** 每周集中整合一次 Tips

### 5. 版本管理

为重要的协议变更打标签：

```bash
cd ~/Awesome_ClaudeMD
git tag v1.2-strict-mode
git push origin v1.2-strict-mode
```

需要时可以切换：

```bash
git checkout v1.2-strict-mode
```

---

## 快捷键（推荐配置）

在 `keybindings.json` 中添加：

```json
[
  {
    "key": "ctrl+shift+c u",
    "command": "awesomeClaudeMD.updateProtocol",
    "when": "editorTextFocus"
  },
  {
    "key": "ctrl+shift+c a",
    "command": "awesomeClaudeMD.applyProtocol",
    "when": "editorTextFocus"
  },
  {
    "key": "ctrl+shift+c t",
    "command": "awesomeClaudeMD.submitTip",
    "when": "editorTextFocus"
  }
]
```

---

## 更多帮助

- [GitHub Issues](https://github.com/yourusername/awesome-claudemd-vscode/issues)
- [主仓库文档](https://github.com/LeonSGP43/Awesome_ClaudeMD)
- [Discord 社区](#)（即将开放）

---

**祝你使用愉快！** 🎉
