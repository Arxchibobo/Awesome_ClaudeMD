# Awesome ClaudeMD

团队共享 CLAUDE.md 的管理方案

## 解决什么问题？

手动维护 CLAUDE.md 的痛点：
- 发现问题要手动编辑，容易遗漏
- 团队成员经验无法共享沉淀
- 每个人的版本不一致

## 方案优势

### 1. 一次安装，永久热更新

```bash
# 安装（只需一次）
git clone https://github.com/LeonSGP43/Awesome_ClaudeMD.git ~/Awesome_ClaudeMD
ln -sf ~/Awesome_ClaudeMD/asinit_AwosomeCLAUDE.md ~/.claude/commands/asinit.md

# 使用（任意项目中）
/asinit
```

执行 `/asinit` 时自动 `git pull` 拉取最新协议，软链接确保始终使用最新版本。

**对比手动方式：** 不用每次复制粘贴，不用担心版本过期。

### 2. 团队经验自动整合

团队成员提交避坑经验到 `tips/` 目录，GitHub Actions 自动触发 Claude 审核整合：

```
提交 tips/xxx.md → Claude 分析 → 自动合并到协议 → 全员 /asinit 同步
```

**安全机制：**
- 路径校验，防止越权访问
- 输出校验，确保协议完整性
- 自动备份，失败可恢复

**对比手动方式：** 不用人工审核合并，不用担心格式错乱。

### 3. 分层设计，各司其职

协议分两层，互不干扰：

```markdown
<!-- ASINIT START -->
## 一、标准执行流程     ← 固定不变，定义开发流程
## 二、规范约束         ← 持续积累，团队经验沉淀
<!-- ASINIT END -->
```

| 层级 | 内容 | 说明 |
|------|------|------|
| 执行流程层 | 严格模式/通用模式的标准流程 | 稳定不变 |
| 约束补丁层 | 测试规范、提交规范、避坑经验 | 持续追加 |

**对比手动方式：** 结构清晰，新增内容不会破坏原有流程。

---

## 快速开始

### macOS / Linux

```bash
git clone https://github.com/LeonSGP43/Awesome_ClaudeMD.git ~/Awesome_ClaudeMD
mkdir -p ~/.claude/commands
ln -sf ~/Awesome_ClaudeMD/asinit_AwosomeCLAUDE.md ~/.claude/commands/asinit.md
```

### Windows (PowerShell 管理员)

```powershell
git clone https://github.com/LeonSGP43/Awesome_ClaudeMD.git "$env:USERPROFILE\Awesome_ClaudeMD"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\commands"
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\commands\asinit.md" -Target "$env:USERPROFILE\Awesome_ClaudeMD\asinit_AwosomeCLAUDE.md" -Force
```

### 使用

```bash
/asinit
```

---

## 贡献避坑经验

```bash
# 1. 拉取最新
git pull origin main

# 2. 创建文件（命名：主题-姓名.md）
touch tips/null-check-leon.md

# 3. 填写内容后提交
git add tips/你的文件.md
git commit -m "tips: 添加 xxx 经验"
git push
```

推送后自动整合，无需人工干预。

---

## 仓库配置

Settings → Secrets → Actions 添加：

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## License

MIT
