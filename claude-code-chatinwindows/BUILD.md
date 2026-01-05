# 构建指南

本文档介绍如何从源码构建和打包 Awesome ClaudeMD 插件。

## 前置要求

### 必需
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**

### 可选
- **VS Code** >= 1.85.0（用于开发和测试）
- **@vscode/vsce**（用于打包发布）

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/LeonSGP43/Awesome_ClaudeMD.git
cd Awesome_ClaudeMD/claude-code-chatinwindows
```

### 2. 安装依赖

```bash
npm install
```

这会安装所有必需的依赖包：
- `simple-git` - Git 操作
- `@aws-sdk/client-bedrock-runtime` - AWS Bedrock 集成
- `typescript` - TypeScript 编译器
- `@types/*` - 类型定义
- 其他开发依赖

### 3. 编译 TypeScript

```bash
npm run compile
```

这会将 `src/` 目录下的 TypeScript 文件编译到 `out/` 目录。

编译成功后，你会看到：
```
src/
├── extension.ts → out/extension.js
├── utils/
│   ├── config.ts → out/utils/config.js
│   └── ...
└── ...
```

### 4. 监视模式（开发时）

在开发时，可以使用监视模式自动重新编译：

```bash
npm run watch
```

这会在文件变更时自动重新编译。

## 在 VS Code 中调试

### 方法 1: 使用 F5 调试

1. 在 VS Code 中打开项目
2. 按 `F5` 或点击 "Run and Debug"
3. 选择 "Run Extension"
4. 新窗口会打开，插件已加载

### 方法 2: 使用命令面板

1. `Ctrl+Shift+P` / `Cmd+Shift+P`
2. 输入 "Debug: Start Debugging"
3. 选择 "Extension"

### 设置断点

在 TypeScript 源码中直接设置断点即可，VS Code 会自动映射到编译后的 JS。

## 打包插件

### 安装 vsce

```bash
npm install -g @vscode/vsce
```

### 打包为 .vsix

```bash
npm run package
```

或直接使用 vsce：

```bash
vsce package
```

这会生成 `awesome-claudemd-1.0.0.vsix` 文件。

### 安装 .vsix

#### 方法 1: 命令行

```bash
code --install-extension awesome-claudemd-1.0.0.vsix
```

#### 方法 2: VS Code UI

1. 打开 VS Code
2. 扩展面板（Ctrl+Shift+X）
3. 点击 "..." 菜单
4. 选择 "Install from VSIX..."
5. 选择生成的 .vsix 文件

## 发布到市场（维护者）

### 首次发布

1. 创建 [Azure DevOps](https://dev.azure.com) 账号
2. 创建个人访问令牌（PAT）
3. 登录 vsce：

```bash
vsce login <publisher-name>
```

4. 发布：

```bash
vsce publish
```

### 后续更新

1. 更新 `package.json` 中的版本号
2. 更新 `CHANGELOG.md`
3. 提交并打标签：

```bash
git add .
git commit -m "chore: bump version to 1.1.0"
git tag v1.1.0
git push origin main --tags
```

4. 发布：

```bash
vsce publish
```

## 项目结构

```
claude-code-chatinwindows/
├── src/                    # TypeScript 源码
│   ├── extension.ts        # 插件入口
│   ├── claudemd/           # CLAUDE.md 管理
│   │   ├── manager.ts
│   │   ├── protocol.ts
│   │   ├── tips.ts
│   │   └── integrator.ts
│   ├── git/                # Git 操作
│   │   ├── repository.ts
│   │   └── sync.ts
│   ├── ai/                 # AI 集成
│   │   └── bedrock.ts
│   └── utils/              # 工具类
│       ├── config.ts
│       ├── file.ts
│       └── notifications.ts
├── templates/              # 协议模板
│   ├── asinit_template.md
│   └── tips_template.md
├── out/                    # 编译输出（git忽略）
├── node_modules/           # 依赖包（git忽略）
├── package.json            # 包配置
├── tsconfig.json           # TypeScript 配置
├── .vscodeignore           # 打包忽略文件
└── README.md               # 用户文档
```

## 常见问题

### Q: 编译失败，提示找不到模块

A: 确保已安装所有依赖：

```bash
rm -rf node_modules package-lock.json
npm install
```

### Q: 调试时插件无法加载

A: 检查以下几点：
1. `out/` 目录是否存在
2. `out/extension.js` 是否存在
3. 重启 VS Code Extension Host (F1 → "Reload Window")

### Q: 打包时提示缺少文件

A: 检查 `.vscodeignore` 是否正确排除了不必要的文件。

### Q: 如何测试 Git 功能？

A: 可以使用测试仓库：

```bash
# 创建测试仓库
mkdir ~/test-awesome-claudemd
cd ~/test-awesome-claudemd
git init
# 复制必要文件
cp -r path/to/Awesome_ClaudeMD/* .
git add .
git commit -m "init"
```

然后在插件配置中指向这个测试仓库。

## 性能优化

### 编译优化

修改 `tsconfig.json` 启用增量编译：

```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

### 打包优化

使用 esbuild 替代 tsc：

```bash
npm install --save-dev esbuild
```

修改 `package.json`:

```json
{
  "scripts": {
    "compile": "esbuild src/extension.ts --bundle --outfile=out/extension.js --external:vscode --format=cjs --platform=node"
  }
}
```

## 贡献代码

在提交代码前，请确保：

1. ✅ 代码通过 TypeScript 编译
2. ✅ 运行 `npm run lint` 无错误
3. ✅ 在 VS Code 中测试过基本功能
4. ✅ 更新了相关文档

---

**祝你构建愉快！** 🚀
