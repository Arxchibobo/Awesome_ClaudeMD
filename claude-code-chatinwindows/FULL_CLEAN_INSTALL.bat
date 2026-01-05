@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║   ClaudeMD Manager - 完全清理安装                  ║
echo ╚════════════════════════════════════════════════════╝
echo.

:: 步骤 1: 卸载旧版本
echo [1/6] 卸载旧版本...
code --uninstall-extension claudemd-team.claudemd-manager 2>nul
timeout /t 2 /nobreak >nul

:: 步骤 2: 清理扩展目录
echo.
echo [2/6] 清理 VS Code 扩展缓存...
set "EXT_DIR=%USERPROFILE%\.vscode\extensions"
for /d %%i in ("%EXT_DIR%\claudemd-team.claudemd-manager-*") do (
    echo   删除: %%i
    rmdir /s /q "%%i" 2>nul
)
echo   [OK] 缓存已清理

:: 步骤 3: 关闭 VS Code 进程
echo.
echo [3/6] 关闭 VS Code 进程...
tasklist /FI "IMAGENAME eq Code.exe" 2>nul | find /I "Code.exe" >nul
if !errorlevel! equ 0 (
    echo   发现 VS Code 正在运行
    echo   正在关闭所有 VS Code 进程...
    taskkill /F /IM Code.exe /T >nul 2>&1
    timeout /t 2 /nobreak >nul
    echo   [OK] VS Code 进程已关闭
) else (
    echo   [OK] 未发现运行中的 VS Code 进程
)

:: 步骤 4: 清理工作区缓存
echo.
echo [4/6] 清理工作区缓存...
set "WS_DIR=%APPDATA%\Code\User\workspaceStorage"
if exist "%WS_DIR%" (
    echo   清理旧的工作区缓存...
    :: 删除 1 天前的缓存
    forfiles /P "%WS_DIR%" /D -1 /C "cmd /c if @isdir==TRUE rmdir /s /q @path" 2>nul
    echo   [OK] 工作区缓存已清理
) else (
    echo   [OK] 未找到工作区缓存目录
)

:: 步骤 5: 安装新版本
echo.
echo [5/6] 安装新版本...
if exist "claudemd-manager-1.0.0.vsix" (
    code --install-extension claudemd-manager-1.0.0.vsix --force
    echo   [OK] 安装命令已执行
) else (
    echo   [ERROR] 未找到 VSIX 文件: claudemd-manager-1.0.0.vsix
    echo   请确保在正确的目录中运行此脚本
    pause
    exit /b 1
)

:: 步骤 6: 等待安装完成
echo.
echo [6/6] 等待安装完成...
timeout /t 3 /nobreak >nul

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║   [OK] 安装完成！                                  ║
echo ╚════════════════════════════════════════════════════╝
echo.
echo 验证步骤：
echo   1. 启动 VS Code
echo   2. 按 Ctrl+Shift+P，输入 "Developer: Reload Window"
echo   3. 点击左侧 ClaudeMD 图标
echo   4. 打开 Tips 管理面板
echo   5. 按 F12 打开开发者工具查看控制台
echo.
echo 预期结果：
echo   [OK] 应该看到：[TipsPanel] 数据更新成功
echo   [X]  不应看到：Uncaught SyntaxError 或 ReferenceError
echo.
pause
