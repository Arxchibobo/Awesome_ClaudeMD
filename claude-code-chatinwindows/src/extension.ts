import * as vscode from 'vscode';
import * as path from 'path';
import { ConfigManager } from './utils/config';
import { GitRepository } from './git/repository';
import { SyncManager } from './git/sync';
import { ClaudeMDManager } from './claudemd/manager';
import { TipsManager } from './claudemd/tips';
import { TipsIntegrator } from './claudemd/integrator';
import { BedrockClient } from './ai/bedrock';
import { NotificationManager } from './utils/notifications';
import { MainPanelProvider } from './views/main-panel';
import { TipsPanelProvider } from './views/tips-panel';

/**
 * 插件激活函数
 * 完整功能版本 - 集成所有管理器和命令
 */
export function activate(context: vscode.ExtensionContext) {
  // 创建输出通道用于日志
  const outputChannel = vscode.window.createOutputChannel('ClaudeMD Manager');
  outputChannel.show();

  const log = (message: string) => {
    console.log(message);
    outputChannel.appendLine(message);
  };

  log('[ClaudeMD] === 插件激活开始 ===');
  log(`[ClaudeMD] VS Code 版本: ${vscode.version}`);
  log(`[ClaudeMD] 扩展路径: ${context.extensionPath}`);

  // 立即显示一个通知，证明激活函数被调用
  vscode.window.showInformationMessage('🚀 ClaudeMD 激活函数已被调用！');

  // 初始化配置管理器（这个不会失败）
  log('[ClaudeMD] 初始化配置管理器...');
  const config = new ConfigManager();

  // 尝试初始化 Git 仓库（可能失败）
  let repository: GitRepository | null = null;
  let syncManager: SyncManager | null = null;
  let claudeMDManager: ClaudeMDManager | null = null;
  let tipsManager: TipsManager | null = null;
  let repoPath: string = config.getRepositoryPath();

  try {
    log('[ClaudeMD] 初始化 Git 仓库...');
    log('[ClaudeMD] 仓库路径: ' + repoPath);
    repository = new GitRepository(repoPath);

    // 3. 初始化同步管理器
    log('[ClaudeMD] 初始化同步管理器...');
    syncManager = new SyncManager(repository);

    // 4. 初始化 CLAUDE.md 管理器
    log('[ClaudeMD] 初始化 CLAUDE.md 管理器...');
    const templatePath = path.join(repoPath, 'asinit_AwosomeCLAUDE.md');
    claudeMDManager = new ClaudeMDManager(repository, templatePath);

    // 5. 初始化 Tips 管理器
    log('[ClaudeMD] 初始化 Tips 管理器...');
    tipsManager = new TipsManager(repository);
  } catch (initError: any) {
    log('[ClaudeMD] 初始化失败: ' + initError.message);
    console.error('[ClaudeMD] 初始化失败:', initError);
    vscode.window.showWarningMessage(
      `ClaudeMD 初始化失败: ${initError.message}\n` +
      '扩展将以受限模式运行。请检查仓库路径配置。',
      '打开设置'
    ).then(choice => {
      if (choice === '打开设置') {
        vscode.commands.executeCommand('workbench.action.openSettings', 'claudemd.repositoryPath');
      }
    });
  }

  // 即使初始化失败也注册基本命令
  try {
    // 先注册 openMainPanel 命令（基础命令，不依赖仓库）
    log('[ClaudeMD] 注册 openMainPanel 命令...');
    context.subscriptions.push(
      vscode.commands.registerCommand('claudemd.openMainPanel', async () => {
        log('[ClaudeMD] openMainPanel 命令被调用');
        // 打开主面板视图
        vscode.commands.executeCommand('workbench.view.extension.claudemd-sidebar');
      })
    );

    // 注册 openTipsPanel 命令
    log('[ClaudeMD] 注册 openTipsPanel 命令...');
    context.subscriptions.push(
      vscode.commands.registerCommand('claudemd.openTipsPanel', async () => {
        log('[ClaudeMD] openTipsPanel 命令被调用');
        // 打开 Tips 面板视图（在侧边栏）
        vscode.commands.executeCommand('claudemd.tipsPanel.focus');
      })
    );

    // 注册测试命令
    log('[ClaudeMD] 注册测试命令...');
    context.subscriptions.push(
      vscode.commands.registerCommand('claudemd.test', () => {
        vscode.window.showInformationMessage('🎉 ClaudeMD 插件工作正常！');
        log('[ClaudeMD] 测试命令被调用');
      })
    );

    // 只有当管理器初始化成功时才注册需要它们的功能
    if (repository && syncManager && claudeMDManager && tipsManager) {
      // 6. 注册主面板 Webview Provider
      console.log('[ClaudeMD] 注册主面板 Provider...');
      const mainPanelProvider = new MainPanelProvider(
      context.extensionUri,
      claudeMDManager,
      tipsManager,
      repository
    );
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        MainPanelProvider.viewType,
        mainPanelProvider
      )
    );

    // 6b. 注册 Tips 面板 Webview Provider
    console.log('[ClaudeMD] 注册 Tips 面板 Provider...');
    const tipsPanelProvider = new TipsPanelProvider(
      context.extensionUri,
      tipsManager,
      syncManager
    );
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        TipsPanelProvider.viewType,
        tipsPanelProvider
      )
    );

    // 7. 创建状态栏图标
    console.log('[ClaudeMD] 创建状态栏...');
    const statusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    statusBar.text = "$(cloud) ClaudeMD";
    statusBar.tooltip = "ClaudeMD Manager - 点击打开主面板";
    statusBar.command = 'claudemd.openMainPanel';
    statusBar.show();
    context.subscriptions.push(statusBar);

    // 8. 注册所有命令
    console.log('[ClaudeMD] 注册命令...');

    // 8.1 更新协议命令
    context.subscriptions.push(
      vscode.commands.registerCommand('claudemd.updateProtocol', async () => {
        try {
          await NotificationManager.withProgress('正在更新协议...', async () => {
            const result = await syncManager.sync();
            if (result.success) {
              NotificationManager.success(result.message);
              statusBar.text = "$(cloud-check) ClaudeMD";
            } else {
              NotificationManager.warning(result.message);
            }
          });
        } catch (error: any) {
          NotificationManager.error('更新协议失败', error);
        }
      })
    );

    // 7.2 应用协议到当前项目
    context.subscriptions.push(
      vscode.commands.registerCommand('claudemd.applyProtocol', async () => {
        try {
          await NotificationManager.withProgress('正在应用协议...', async () => {
            const success = await claudeMDManager.applyToCurrentProject();
            if (success) {
              NotificationManager.success('协议已应用到当前项目');
            }
          });
        } catch (error: any) {
          NotificationManager.error('应用协议失败', error);
        }
      })
    );

    // 7.3 导出 CLAUDE.md
    context.subscriptions.push(
      vscode.commands.registerCommand('claudemd.exportProtocol', async () => {
        try {
          const success = await claudeMDManager.exportCurrentProject();
          if (success) {
            NotificationManager.success('协议导出成功');
          }
        } catch (error: any) {
          NotificationManager.error('导出协议失败', error);
        }
      })
    );

    // 7.4 提交新 Tip
    context.subscriptions.push(
      vscode.commands.registerCommand('claudemd.submitTip', async () => {
        try {
          // 获取 Tip 信息
          const title = await vscode.window.showInputBox({
            prompt: '请输入 Tip 标题（例如：null-check）',
            placeHolder: 'null-check'
          });

          if (!title) {
            return;
          }

          const author = await vscode.window.showInputBox({
            prompt: '请输入你的名字',
            placeHolder: 'leon'
          });

          if (!author) {
            return;
          }

          // 获取模板
          const template = await tipsManager.getTemplate();

          // 打开编辑器让用户填写内容
          const document = await vscode.workspace.openTextDocument({
            content: template,
            language: 'markdown'
          });

          const editor = await vscode.window.showTextDocument(document);

          // 等待用户编辑完成
          const confirmed = await vscode.window.showInformationMessage(
            '请编辑 Tip 内容，完成后点击"提交"',
            { modal: true },
            '提交',
            '取消'
          );

          if (confirmed !== '提交') {
            return;
          }

          // 获取编辑后的内容
          const content = editor.document.getText();

          // 创建 Tip 文件
          const tipPath = await tipsManager.createTip(title, content, author);

          // 提交到远程仓库
          const commitMessage = `tips: 添加 ${title} 经验 by ${author}`;
          await syncManager.submitTip(tipPath, commitMessage);

          NotificationManager.success('Tip 提交成功！');
        } catch (error: any) {
          NotificationManager.error('提交 Tip 失败', error);
        }
      })
    );

    // 7.5 整合 Tips（使用 AI）
    context.subscriptions.push(
      vscode.commands.registerCommand('claudemd.integrateTips', async () => {
        try {
          // 检查 AWS 凭证
          const credentials = await config.getAWSCredentials(context);

          if (!credentials.accessKeyId || !credentials.secretAccessKey) {
            const shouldConfigure = await vscode.window.showInformationMessage(
              '尚未配置 AWS 凭证，是否立即配置？',
              '配置',
              '取消'
            );

            if (shouldConfigure === '配置') {
              // 获取凭证
              const accessKeyId = await vscode.window.showInputBox({
                prompt: '请输入 AWS Access Key ID',
                password: false
              });

              if (!accessKeyId) {
                return;
              }

              const secretAccessKey = await vscode.window.showInputBox({
                prompt: '请输入 AWS Secret Access Key',
                password: true
              });

              if (!secretAccessKey) {
                return;
              }

              // 保存凭证
              await config.setAWSCredentials(context, accessKeyId, secretAccessKey);

              NotificationManager.success('AWS 凭证配置成功');
            } else {
              return;
            }
          }

          // 重新获取凭证
          const updatedCredentials = await config.getAWSCredentials(context);

          // 创建 Bedrock 客户端
          const bedrockClient = new BedrockClient({
            region: config.getAWSRegion(),
            accessKeyId: updatedCredentials.accessKeyId,
            secretAccessKey: updatedCredentials.secretAccessKey
          });

          // 创建整合器
          const protocolPath = path.join(repoPath, 'asinit_AwosomeCLAUDE.md');
          const integrator = new TipsIntegrator(tipsManager, protocolPath, bedrockClient);

          // 执行整合
          await NotificationManager.withProgress('正在整合 Tips...（这可能需要几分钟）', async () => {
            const result = await integrator.integrate();

            if (result.success) {
              NotificationManager.success(
                result.summary || 'Tips 整合成功！'
              );

              if (result.securityIssues && result.securityIssues.length > 0) {
                vscode.window.showWarningMessage(
                  `安全提醒: ${result.securityIssues.join(', ')}`
                );
              }
            } else {
              NotificationManager.error('整合失败', new Error(result.error || '未知错误'));
            }
          });
        } catch (error: any) {
          NotificationManager.error('整合 Tips 失败', error);
        }
      })
    );

    // 8.6 关于
    context.subscriptions.push(
      vscode.commands.registerCommand('claudemd.about', () => {
        vscode.window.showInformationMessage(
          'ClaudeMD Manager v1.0.0\n\n' +
          '团队共享 CLAUDE.md 的管理工具\n' +
          '仓库: https://github.com/LeonSGP43/Awesome_ClaudeMD\n\n' +
          '© 2026 ClaudeMD Team',
          '确定'
        );
      })
    );

    // 9. 启动时初始化仓库
    console.log('[ClaudeMD] 初始化仓库...');
    syncManager.initialize().then(initialized => {
      if (initialized) {
        console.log('[ClaudeMD] 仓库初始化成功');

        // 10. 启动自动更新（如果配置启用）
        if (config.isAutoUpdateEnabled()) {
          const interval = config.getUpdateInterval();
          console.log(`[ClaudeMD] 启动自动更新（间隔: ${interval}秒）`);
          syncManager.startAutoUpdate(interval);

          // 注册清理函数
          context.subscriptions.push({
            dispose: () => syncManager.dispose()
          });
        }
      } else {
        console.log('[ClaudeMD] 仓库初始化失败或被取消');
      }
    }).catch(error => {
      console.error('[ClaudeMD] 仓库初始化错误:', error);
    });

      // 11. 显示激活成功通知
      console.log('[ClaudeMD] === 插件激活完成 ===');
      vscode.window.showInformationMessage('✅ ClaudeMD Manager 已激活');
    } else {
      // 仓库初始化失败，只显示受限模式通知
      console.log('[ClaudeMD] === 插件以受限模式激活 ===');
      vscode.window.showWarningMessage('⚠️ ClaudeMD Manager 以受限模式运行');
    }

  } catch (error) {
    console.error('[ClaudeMD] 激活过程中发生错误:', error);
    vscode.window.showErrorMessage(`ClaudeMD 激活失败: ${error}`);
  }
}

/**
 * 插件停用函数
 */
export function deactivate() {
  console.log('[ClaudeMD] 插件停用');
}
