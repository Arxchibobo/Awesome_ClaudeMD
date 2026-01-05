# ClaudeMD Manager - 更新安装脚本 (PowerShell)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   ClaudeMD Manager - 更新安装脚本" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] 卸载旧版本..." -ForegroundColor Yellow
code --uninstall-extension claudemd-team.claudemd-manager
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "[2/3] 安装新版本..." -ForegroundColor Yellow
code --install-extension claudemd-manager-1.0.0.vsix --force

Write-Host ""
Write-Host "[3/3] 完成！" -ForegroundColor Green
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   安装完成！请按照以下步骤操作：" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 完全关闭 VS Code（关闭所有窗口）" -ForegroundColor White
Write-Host "2. 重新打开 VS Code" -ForegroundColor White
Write-Host "3. 打开您的项目" -ForegroundColor White
Write-Host "4. 查看左侧边栏的 'CLAUDEMD' 面板" -ForegroundColor White
Write-Host "5. 点击主面板查看 Tips 管理指南" -ForegroundColor White
Write-Host ""

Read-Host "按 Enter 键退出"
