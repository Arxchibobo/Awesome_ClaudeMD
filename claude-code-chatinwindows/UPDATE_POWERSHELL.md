# 🔄 PowerShell 更新指南

## ✅ 正确的 PowerShell 命令

你在用 PowerShell，需要使用不同的语法！

---

## 🛠️ 完整更新步骤（PowerShell）

### 步骤 1: 卸载旧版本

```powershell
# 方法 1: 使用 code 命令
code --uninstall-extension awesome-claudemd.awesome-claudemd

# 方法 2: 如果上面不行，在 Cursor 扩展面板手动卸载
```

### 步骤 2: 清理缓存（PowerShell 语法）

```powershell
# 删除工作区缓存
Remove-Item -Path "$env:APPDATA\Code\User\workspaceStorage" -Recurse -Force -ErrorAction SilentlyContinue

# 删除扩展缓存
Remove-Item -Path "$env:APPDATA\Code\CachedExtensions" -Recurse -Force -ErrorAction SilentlyContinue

# 如果是 Cursor，也清理它的缓存
Remove-Item -Path "$env:APPDATA\Cursor\User\workspaceStorage" -Recurse -Force -ErrorAction SilentlyContinue
```

### 步骤 3: 安装新版本

```powershell
# 进入插件目录
cd "E:\Bobo's Coding cache\Awesome_ClaudeMD\claude-code-chatinwindows"

# 安装新版本
code --install-extension awesome-claudemd-2.1.1.vsix --force
```

### 步骤 4: 重启 Cursor

关闭所有 Cursor 窗口，然后重新打开。

### 步骤 5: 验证版本

```powershell
# 检查安装的版本
code --list-extensions --show-versions | Select-String "awesome-claudemd"
```

应该显示：
```
awesome-claudemd.awesome-claudemd@2.1.1
```

---

## 📋 一键执行脚本

复制下面的命令到 PowerShell（管理员模式）：

```powershell
# 1. 卸载旧版本
Write-Host "正在卸载旧版本..." -ForegroundColor Yellow
code --uninstall-extension awesome-claudemd.awesome-claudemd

# 2. 清理缓存
Write-Host "正在清理缓存..." -ForegroundColor Yellow
Remove-Item -Path "$env:APPDATA\Code\User\workspaceStorage" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:APPDATA\Code\CachedExtensions" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:APPDATA\Cursor\User\workspaceStorage" -Recurse -Force -ErrorAction SilentlyContinue

# 3. 进入目录
Write-Host "正在进入插件目录..." -ForegroundColor Yellow
cd "E:\Bobo's Coding cache\Awesome_ClaudeMD\claude-code-chatinwindows"

# 4. 安装新版本
Write-Host "正在安装 v2.1.1..." -ForegroundColor Green
code --install-extension awesome-claudemd-2.1.1.vsix --force

# 5. 验证
Write-Host "`n验证安装版本:" -ForegroundColor Cyan
code --list-extensions --show-versions | Select-String "awesome-claudemd"

Write-Host "`n✅ 完成！请重启 Cursor。" -ForegroundColor Green
```

---

## 🎯 快速方法（推荐）

如果上面太复杂，最简单的方法：

### 方法 1: 手动操作

1. **在 Cursor 中**：
   - 打开扩展面板（`Ctrl+Shift+X`）
   - 搜索 "Awesome ClaudeMD"
   - 点击"卸载"

2. **关闭 Cursor**（完全关闭所有窗口）

3. **重新打开 Cursor**

4. **安装新版本**：
   - 扩展面板 → 右上角 `···` → "从 VSIX 安装..."
   - 选择：`E:\Bobo's Coding cache\Awesome_ClaudeMD\claude-code-chatinwindows\awesome-claudemd-2.1.1.vsix`

5. **再次重启 Cursor**

6. **验证版本**：
   - 扩展面板查看版本号
   - 应该显示 **v2.1.1**

---

## 🔍 手动查找和删除旧版本

如果自动卸载不行，手动删除：

```powershell
# 查找扩展目录
$extensions = @(
    "$env:USERPROFILE\.vscode\extensions",
    "$env:USERPROFILE\.cursor\extensions"
)

foreach ($dir in $extensions) {
    if (Test-Path $dir) {
        Write-Host "检查目录: $dir" -ForegroundColor Cyan
        Get-ChildItem -Path $dir -Filter "awesome-claudemd*" -Directory | ForEach-Object {
            Write-Host "找到: $($_.FullName)" -ForegroundColor Yellow
            Write-Host "版本: $($_.Name)" -ForegroundColor Yellow

            # 询问是否删除
            $confirm = Read-Host "是否删除? (y/n)"
            if ($confirm -eq 'y') {
                Remove-Item -Path $_.FullName -Recurse -Force
                Write-Host "已删除!" -ForegroundColor Green
            }
        }
    }
}
```

---

## 🐛 常见问题

### Q: 运行 `code` 命令提示找不到？

**A**: 可能需要用 `cursor` 命令：

```powershell
cursor --uninstall-extension awesome-claudemd.awesome-claudemd
cursor --install-extension awesome-claudemd-2.1.1.vsix --force
```

### Q: 权限不足？

**A**: 以管理员身份运行 PowerShell：

1. 右键点击 PowerShell
2. 选择"以管理员身份运行"
3. 再执行命令

### Q: 找不到 vsix 文件？

**A**: 确认文件路径，使用绝对路径：

```powershell
# 检查文件是否存在
Test-Path "E:\Bobo's Coding cache\Awesome_ClaudeMD\claude-code-chatinwindows\awesome-claudemd-2.1.1.vsix"

# 应该返回 True
```

### Q: 删除缓存后还是显示旧版本？

**A**: 尝试删除更多缓存：

```powershell
# 删除所有相关缓存
Remove-Item -Path "$env:APPDATA\Code" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:APPDATA\Cursor" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:LOCALAPPDATA\Programs\cursor" -Recurse -Force -ErrorAction SilentlyContinue
```

⚠️ **警告**：这会删除所有 VS Code/Cursor 的设置和缓存！

---

## 💡 PowerShell vs Git Bash

| 命令 | Git Bash | PowerShell |
|------|----------|------------|
| 删除文件夹 | `rm -rf` | `Remove-Item -Recurse -Force` |
| 环境变量 | `$APPDATA` | `$env:APPDATA` |
| 查找文本 | `grep` | `Select-String` |
| 列出文件 | `ls` | `Get-ChildItem` |

---

## ✅ 验证成功标志

更新成功后，你应该看到：

1. **扩展面板**：
   - 名称：Awesome ClaudeMD Manager
   - 版本：**v2.1.1** ✅
   - 状态：已启用

2. **命令面板**（`Ctrl+Shift+P`）：
   ```
   ✨ Awesome ClaudeMD: 打开主面板
   🔄 Awesome ClaudeMD: 更新协议
   📝 Awesome ClaudeMD: 应用协议到当前项目
   💾 Awesome ClaudeMD: 导出 CLAUDE.md
   💡 Awesome ClaudeMD: 打开 Tips 管理
   ➕ Awesome ClaudeMD: 提交新 Tip
   🔄 Awesome ClaudeMD: 整合 Tips
   ```

3. **主面板**：
   - 打开主面板应该看到完整的 UI
   - 标题显示正确的版本号

---

## 🎯 总结

**PowerShell 关键区别**：
- ❌ `rm -rf` → ✅ `Remove-Item -Recurse -Force`
- ❌ `$APPDATA` → ✅ `$env:APPDATA`

**最简单的方法**：
1. 在 Cursor 扩展面板手动卸载
2. 完全关闭 Cursor
3. 重新打开，从 VSIX 安装
4. 再次重启

---

**遇到问题？** 告诉我具体的错误信息！😊
