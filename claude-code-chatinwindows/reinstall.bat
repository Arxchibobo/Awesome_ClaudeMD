@echo off
chcp 65001 >nul
echo ===================================
echo ClaudeMD Manager Reinstall Tool
echo ===================================
echo.

echo [1/5] Uninstalling old version...
code --uninstall-extension claudemd-team.claudemd-manager
timeout /t 2 /nobreak >nul

echo [2/5] Compiling source code...
call npm run compile
if %errorlevel% neq 0 (
    echo ERROR: Compilation failed
    pause
    exit /b 1
)

echo [3/5] Packaging VSIX...
call npx @vscode/vsce package --no-dependencies
if %errorlevel% neq 0 (
    echo ERROR: Packaging failed
    pause
    exit /b 1
)

echo [4/5] Installing new version...
code --install-extension claudemd-manager-1.0.0.vsix --force
if %errorlevel% neq 0 (
    echo ERROR: Installation failed
    pause
    exit /b 1
)

echo [5/5] Verifying installation...
code --list-extensions | findstr "claudemd-team.claudemd-manager"
if %errorlevel% equ 0 (
    echo SUCCESS: Extension installed
) else (
    echo ERROR: Extension not found
    pause
    exit /b 1
)

echo.
echo ===================================
echo Installation Complete!
echo ===================================
echo.
echo Next steps:
echo 1. Close ALL VS Code windows
echo 2. Reopen VS Code
echo 3. Press Ctrl+Shift+I to open Developer Tools
echo 4. Check Console for [ClaudeMD] logs
echo.
pause
