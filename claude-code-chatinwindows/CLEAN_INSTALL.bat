@echo off
chcp 65001 >nul
echo ====================================
echo ClaudeMD Manager - 完全清理安装
echo ====================================
echo.

echo [1/5] 卸载旧版本...
code --uninstall-extension claudemd-team.claudemd-manager
timeout /t 2 /nobreak >nul

echo.
echo [2/5] 清理 VS Code 扩展缓存...
set "EXT_DIR=%USERPROFILE%\.vscode\extensions"
if exist "%EXT_DIR%\claudemd-team.claudemd-manager-*" (
    echo 删除缓存目录: %EXT_DIR%\claudemd-team.claudemd-manager-*
    rmdir /s /q "%EXT_DIR%\claudemd-team.claudemd-manager-*"
)

echo.
echo [3/5] 关闭所有 VS Code 窗口...
echo 请手动关闭所有 VS Code 窗口，然后按任意键继续...
pause >nul

echo.
echo [4/5] 安装新版本...
code --install-extension claudemd-manager-1.0.0.vsix --force

echo.
echo [5/5] 等待安装完成...
timeout /t 3 /nobreak >nul

echo.
echo ====================================
echo ✅ 安装完成！
echo ====================================
echo.
echo 请执行以下步骤验证：
echo 1. 启动 VS Code
echo 2. 按 Ctrl+Shift+P，输入 "Developer: Reload Window"
echo 3. 点击左侧 ClaudeMD 图标
echo 4. 打开 Tips 管理面板
echo 5. 按 F12 打开开发者工具查看控制台
echo.
pause
