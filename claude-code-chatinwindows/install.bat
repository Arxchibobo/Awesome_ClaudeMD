@echo off
echo ========================================
echo   Awesome ClaudeMD Manager v2.1.1
echo   安装脚本
echo ========================================
echo.

echo [1/3] 卸载旧版本...
code --uninstall-extension awesome-claudemd.awesome-claudemd
timeout /t 2 >nul

echo [2/3] 安装新版本...
code --install-extension awesome-claudemd-2.1.1.vsix --force

echo [3/3] 验证安装...
timeout /t 2 >nul
code --list-extensions | findstr "awesome-claudemd"

echo.
echo ========================================
echo 安装完成!
echo.
echo 下一步:
echo 1. 完全关闭 Cursor
echo 2. 重新启动 Cursor
echo 3. 按 Ctrl+Shift+P
echo 4. 输入: Awesome ClaudeMD
echo ========================================
pause
