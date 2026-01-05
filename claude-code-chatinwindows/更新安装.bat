@echo off
chcp 65001 >nul
echo ============================================
echo    ClaudeMD Manager - 更新安装脚本
echo ============================================
echo.

echo [1/3] 卸载旧版本...
code --uninstall-extension claudemd-team.claudemd-manager
timeout /t 3 /nobreak >nul

echo.
echo [2/3] 安装新版本...
code --install-extension claudemd-manager-1.0.0.vsix --force

echo.
echo [3/3] 完成！
echo.
echo ============================================
echo    安装完成！请按照以下步骤操作：
echo ============================================
echo.
echo 1. 完全关闭 VS Code（关闭所有窗口）
echo 2. 重新打开 VS Code
echo 3. 打开您的项目
echo 4. 查看左侧边栏的 "CLAUDEMD" 面板
echo 5. 点击主面板查看 Tips 管理指南
echo.
echo 按任意键退出...
pause >nul
