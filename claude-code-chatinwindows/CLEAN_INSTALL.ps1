# ClaudeMD Manager - 完全清理安装脚本
# 确保以管理员权限运行（可选，但推荐）

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "ClaudeMD Manager - 完全清理安装" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# 步骤 1: 卸载旧版本
Write-Host "[1/6] 卸载旧版本..." -ForegroundColor Yellow
& code --uninstall-extension claudemd-team.claudemd-manager
Start-Sleep -Seconds 2

# 步骤 2: 清理扩展目录
Write-Host ""
Write-Host "[2/6] 清理 VS Code 扩展缓存..." -ForegroundColor Yellow
$extDir = "$env:USERPROFILE\.vscode\extensions"
$oldExt = Get-ChildItem -Path $extDir -Filter "claudemd-team.claudemd-manager-*" -Directory -ErrorAction SilentlyContinue

if ($oldExt) {
    foreach ($dir in $oldExt) {
        Write-Host "  删除: $($dir.FullName)" -ForegroundColor Gray
        Remove-Item -Path $dir.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }
    Write-Host "  ✅ 缓存已清理" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  未找到旧版本缓存" -ForegroundColor Gray
}

# 步骤 3: 关闭 VS Code 进程
Write-Host ""
Write-Host "[3/6] 检查并关闭 VS Code 进程..." -ForegroundColor Yellow
$vscodeProcesses = Get-Process -Name "Code" -ErrorAction SilentlyContinue

if ($vscodeProcesses) {
    Write-Host "  发现 $($vscodeProcesses.Count) 个 VS Code 进程正在运行" -ForegroundColor Yellow
    Write-Host "  是否强制关闭所有 VS Code 窗口？(Y/N)" -ForegroundColor Yellow
    $response = Read-Host

    if ($response -eq "Y" -or $response -eq "y") {
        Stop-Process -Name "Code" -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ 已关闭所有 VS Code 进程" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host "  ⚠️  请手动关闭所有 VS Code 窗口，然后按任意键继续..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
} else {
    Write-Host "  ✅ 未发现运行中的 VS Code 进程" -ForegroundColor Green
}

# 步骤 4: 清理 VS Code 工作区存储（webview 缓存）
Write-Host ""
Write-Host "[4/6] 清理 VS Code 工作区缓存（webview 缓存）..." -ForegroundColor Yellow
$workspaceStorage = "$env:APPDATA\Code\User\workspaceStorage"
if (Test-Path $workspaceStorage) {
    Write-Host "  清理 webview 缓存目录..." -ForegroundColor Gray
    # 不完全删除，只清理时间戳较旧的缓存
    $oldCaches = Get-ChildItem -Path $workspaceStorage -Directory | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-1) }
    foreach ($cache in $oldCaches) {
        Remove-Item -Path $cache.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }
    Write-Host "  ✅ 已清理旧缓存" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  未找到工作区缓存目录" -ForegroundColor Gray
}

# 步骤 5: 安装新版本
Write-Host ""
Write-Host "[5/6] 安装新版本..." -ForegroundColor Yellow
$vsixFile = "claudemd-manager-1.0.0.vsix"
if (Test-Path $vsixFile) {
    & code --install-extension $vsixFile --force
    Write-Host "  ✅ 安装命令已执行" -ForegroundColor Green
} else {
    Write-Host "  ❌ 未找到 VSIX 文件: $vsixFile" -ForegroundColor Red
    Write-Host "  请确保在正确的目录中运行此脚本" -ForegroundColor Red
    exit 1
}

# 步骤 6: 等待安装完成
Write-Host ""
Write-Host "[6/6] 等待安装完成..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "✅ 安装完成！" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 验证步骤：" -ForegroundColor Cyan
Write-Host "1. 启动 VS Code" -ForegroundColor White
Write-Host "2. 按 Ctrl+Shift+P，输入 'Developer: Reload Window'" -ForegroundColor White
Write-Host "3. 点击左侧 ClaudeMD 图标" -ForegroundColor White
Write-Host "4. 打开 Tips 管理面板" -ForegroundColor White
Write-Host "5. 按 F12 打开开发者工具查看控制台（确认无错误）" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  重要提示：" -ForegroundColor Yellow
Write-Host "- 如果仍有问题，请完全关闭 VS Code 后重新打开" -ForegroundColor Yellow
Write-Host "- 确保没有其他 VS Code 窗口在后台运行" -ForegroundColor Yellow
Write-Host ""

Read-Host "按回车键退出"
