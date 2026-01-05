# ClaudeMD Manager 完全重新安装脚本
# 解决扩展激活问题

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "ClaudeMD Manager 重新安装工具" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 步骤 1: 卸载旧版本
Write-Host "[1/6] 卸载旧版本..." -ForegroundColor Yellow
code --uninstall-extension claudemd-team.claudemd-manager
Start-Sleep -Seconds 2

# 步骤 2: 清理扩展缓存
Write-Host "[2/6] 清理扩展缓存..." -ForegroundColor Yellow
$extensionPath = "$env:USERPROFILE\.vscode\extensions\claudemd-team.claudemd-manager-*"
if (Test-Path $extensionPath) {
    Remove-Item $extensionPath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ 缓存已清理" -ForegroundColor Green
} else {
    Write-Host "  - 无需清理" -ForegroundColor Gray
}

# 步骤 3: 检查并编译源代码
Write-Host "[3/6] 检查并编译源代码..." -ForegroundColor Yellow
Push-Location $PSScriptRoot

if (Test-Path ".\out\extension.js") {
    Write-Host "  ✓ 编译文件已存在" -ForegroundColor Green
} else {
    Write-Host "  ! 需要重新编译" -ForegroundColor Red
    npm run compile
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ 编译成功" -ForegroundColor Green
    } else {
        Write-Host "  ✗ 编译失败，请检查错误" -ForegroundColor Red
        Pop-Location
        exit 1
    }
}

# 步骤 4: 检查 VSIX 文件
Write-Host "[4/6] 检查 VSIX 包..." -ForegroundColor Yellow
if (Test-Path ".\claudemd-manager-1.0.0.vsix") {
    $vsixSize = (Get-Item ".\claudemd-manager-1.0.0.vsix").Length / 1KB
    Write-Host ("  ✓ VSIX 文件存在 ({0:N2} KB)" -f $vsixSize) -ForegroundColor Green
} else {
    Write-Host "  ! 需要重新打包" -ForegroundColor Red
    npx @vscode/vsce package --no-dependencies
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ 打包成功" -ForegroundColor Green
    } else {
        Write-Host "  ✗ 打包失败，请检查错误" -ForegroundColor Red
        Pop-Location
        exit 1
    }
}

# 步骤 5: 安装新版本
Write-Host "[5/6] 安装新版本..." -ForegroundColor Yellow
code --install-extension ".\claudemd-manager-1.0.0.vsix" --force
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ 安装成功" -ForegroundColor Green
} else {
    Write-Host "  ✗ 安装失败" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

# 步骤 6: 验证安装
Write-Host "[6/6] 验证安装..." -ForegroundColor Yellow
$installed = code --list-extensions | Select-String "claudemd-team.claudemd-manager"
if ($installed) {
    Write-Host "  ✓ 扩展已安装" -ForegroundColor Green
} else {
    Write-Host "  ✗ 扩展未找到" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "安装完成！" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 下一步操作：" -ForegroundColor Yellow
Write-Host "  1. 完全关闭所有 VS Code 窗口"
Write-Host "  2. 重新打开 VS Code"
Write-Host "  3. 按 Ctrl+Shift+P 输入 'Developer: Show Running Extensions'"
Write-Host "  4. 查找 'claudemd-manager'，确认状态为激活"
Write-Host ""
Write-Host "如果仍有问题，请查看 DIAGNOSE.md 获取详细诊断步骤" -ForegroundColor Cyan
Write-Host ""

# 询问是否立即打开 VS Code
$response = Read-Host "是否立即打开 VS Code? (Y/N)"
if ($response -eq "Y" -or $response -eq "y") {
    Write-Host "正在启动 VS Code..." -ForegroundColor Green
    Start-Process code -ArgumentList "."
}
