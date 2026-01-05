import * as vscode from 'vscode';
import * as path from 'path';
import { ConfigManager } from '../utils/config';
import { GitRepository } from '../git/repository';
import { SyncManager } from '../git/sync';
import { TipsManager } from '../claudemd/tips';
import { ClaudeMDManager } from '../claudemd/manager';
import { MainPanelProvider } from '../ui/mainPanel';
import { TipsPanelProvider } from '../ui/tipsPanel';
import { ManagerContainer } from './types';

/**
 * 懒加载管理器
 * 只在首次调用时初始化所有管理器
 */
export class LazyLoader {
  private static instance: ManagerContainer | undefined;
  private static initPromise: Promise<ManagerContainer> | undefined;
  private static context: vscode.ExtensionContext | undefined;

  /**
   * 设置扩展上下文
   */
  static setContext(context: vscode.ExtensionContext): void {
    this.context = context;
  }

  /**
   * 获取管理器实例（懒加载）
   */
  static async getManagers(): Promise<ManagerContainer> {
    // 如果已经初始化，直接返回
    if (this.instance) {
      return this.instance;
    }

    // 如果正在初始化，等待完成
    if (this.initPromise) {
      return this.initPromise;
    }

    // 开始初始化
    this.initPromise = this.initialize();
    return this.initPromise;
  }

  /**
   * 初始化所有管理器
   */
  private static async initialize(): Promise<ManagerContainer> {
    console.log('[Awesome ClaudeMD] 开始懒加载初始化');

    if (!this.context) {
      throw new Error('Extension context not set');
    }

    try {
      // 显示初始化进度
      return await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Awesome ClaudeMD Manager',
          cancellable: false
        },
        async (progress) => {
          progress.report({ message: '正在初始化...' });

          // 1. 初始化配置管理器
          console.log('[Awesome ClaudeMD] 初始化 ConfigManager');
          const configManager = new ConfigManager();

          // 2. 初始化 Git 仓库
          console.log('[Awesome ClaudeMD] 初始化 GitRepository');
          const repoPath = configManager.getRepositoryPath();
          const repository = new GitRepository(repoPath);

          // 3. 初始化同步管理器
          console.log('[Awesome ClaudeMD] 初始化 SyncManager');
          const syncManager = new SyncManager(repository);

          // 4. 初始化 Tips 管理器
          console.log('[Awesome ClaudeMD] 初始化 TipsManager');
          const tipsManager = new TipsManager(repository);

          // 5. 初始化 CLAUDE.md 管理器
          console.log('[Awesome ClaudeMD] 初始化 ClaudeMDManager');
          const templatePath = path.join(
            this.context!.extensionPath,
            'templates',
            'asinit_template.md'
          );
          const claudeMDManager = new ClaudeMDManager(repository, templatePath);

          // 6. 初始化 UI 面板
          console.log('[Awesome ClaudeMD] 初始化 UI 面板');
          const mainPanel = new MainPanelProvider(
            this.context!,
            claudeMDManager,
            syncManager,
            tipsManager
          );
          const tipsPanel = new TipsPanelProvider(
            this.context!,
            tipsManager,
            syncManager
          );

          // 保存实例
          this.instance = {
            configManager,
            repository,
            syncManager,
            tipsManager,
            claudeMDManager,
            mainPanel,
            tipsPanel
          };

          console.log('[Awesome ClaudeMD] 懒加载初始化完成');

          // 启动自动更新（如果启用）
          this.startAutoUpdate();

          return this.instance;
        }
      );
    } catch (error) {
      console.error('[Awesome ClaudeMD] 懒加载初始化失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(
        `Awesome ClaudeMD Manager 初始化失败: ${errorMessage}`
      );
      throw error;
    }
  }

  /**
   * 启动自动更新
   */
  private static startAutoUpdate(): void {
    if (!this.instance) {
      return;
    }

    const { configManager, syncManager } = this.instance;

    // 延迟启动自动更新，避免阻塞
    setTimeout(async () => {
      try {
        if (configManager.isAutoUpdateEnabled()) {
          const initialized = await syncManager.initialize();
          if (initialized) {
            const result = await syncManager.sync();
            if (result.success && result.message.includes('已更新')) {
              vscode.window.showInformationMessage(result.message);
            }

            const interval = configManager.getUpdateInterval();
            syncManager.startAutoUpdate(interval);
          }
        }
      } catch (error) {
        console.error('[Awesome ClaudeMD] 自动更新启动失败:', error);
      }
    }, 3000); // 延迟 3 秒启动
  }

  /**
   * 清理资源
   */
  static dispose(): void {
    if (this.instance) {
      this.instance.syncManager.dispose();
      this.instance.mainPanel.dispose();
      this.instance.tipsPanel.dispose();
      this.instance = undefined;
    }
    this.initPromise = undefined;
  }
}
