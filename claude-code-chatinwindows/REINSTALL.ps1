# Awesome ClaudeMD Manager - 重新安装脚本
# 用于修复插件无法激活的问题

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Awesome ClaudeMD Manager v2.1.1" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 卸载旧版本
Write-Host "[1/4] 卸载旧版本..." -ForegroundColor Yellow
code --uninstall-extension awesome-claudemd.awesome-claudemd 2>&1 | Out-Null
Start-Sleep -Seconds 2

# 2. 清理缓存
Write-Host "[2/4] 清理缓存..." -ForegroundColor Yellow
$extensionDir = "$env:USERPROFILE\.vscode\extensions"
$oldExtensions = Get-ChildItem -Path $extensionDir -Filter "awesome-claudemd.awesome-claudemd-*" -Directory -ErrorAction SilentlyContinue
foreach ($ext in $oldExtensions) {
    Remove-Item -Path $ext.FullName -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  已清理: $($ext.Name)" -ForegroundColor Green
}

# 3. 安装新版本
Write-Host "[3/4] 安装新版本..." -ForegroundColor Yellow
code --install-extension awesome-claudemd-2.1.1.vsix --force

# 4. 验证安装
Write-Host "[4/4] 验证安装..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
$installed = code --list-extensions | Select-String "awesome-claudemd.awesome-claudemd"
if ($installed) {
    Write-Host "  安装成功!" -ForegroundColor Green
} else {
    Write-Host "  安装可能失败" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "下一步操作:" -ForegroundColor Green
Write-Host ""
Write-Host "1. 完全关闭 Cursor" -ForegroundColor White
Write-Host "2. 重新启动 Cursor" -ForegroundColor White
Write-Host "3. 按 F12 打开开发者工具" -ForegroundColor White
Write-Host "4. 查看 Console 是否有初始化成功信息" -ForegroundColor White
Write-Host "5. 按 Ctrl+Shift+P 测试命令" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
