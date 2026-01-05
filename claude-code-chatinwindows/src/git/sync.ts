import { GitRepository } from './repository';
import { NotificationManager } from '../utils/notifications';

/**
 * 同步管理器
 * 负责自动同步和更新检查
 */
export class SyncManager {
  private repository: GitRepository;
  private updateTimer?: NodeJS.Timeout;
  private isUpdating: boolean = false;

  constructor(repository: GitRepository) {
    this.repository = repository;
  }

  /**
   * 初始化并检查仓库
   */
  async initialize(): Promise<boolean> {
    const exists = await this.repository.exists();

    if (!exists) {
      const shouldClone = await NotificationManager.confirm(
        '未找到 Awesome_ClaudeMD 仓库，是否立即克隆？'
      );

      if (shouldClone) {
        try {
          await NotificationManager.withProgress('正在克隆仓库...', async () => {
            await this.repository.clone();
          });

          NotificationManager.success('仓库克隆成功');
          return true;
        } catch (error: any) {
          NotificationManager.error('仓库克隆失败', error);
          return false;
        }
      }

      return false;
    }

    return true;
  }

  /**
   * 执行同步更新
   */
  async sync(): Promise<{ success: boolean; message: string }> {
    if (this.isUpdating) {
      return {
        success: false,
        message: '正在更新中，请稍候...'
      };
    }

    this.isUpdating = true;

    try {
      // 检查仓库状态
      const status = await this.repository.getStatus();

      if (!status.exists) {
        await this.initialize();
        const newStatus = await this.repository.getStatus();
        if (!newStatus.exists) {
          return {
            success: false,
            message: '仓库不存在且克隆失败'
          };
        }
      }

      // 检查是否有未提交的变更
      if (status.hasUncommittedChanges) {
        const shouldReset = await NotificationManager.confirm(
          '检测到本地有未提交的变更，是否重置为远程版本？\n（警告：本地修改将丢失）'
        );

        if (shouldReset) {
          await this.repository.reset();
        } else {
          return {
            success: false,
            message: '存在未提交变更，已取消更新'
          };
        }
      }

      // 拉取更新
      const result = await this.repository.pull();

      return {
        success: true,
        message: result.message
      };
    } catch (error: any) {
      return {
        success: false,
        message: `同步失败: ${error.message}`
      };
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * 启动自动更新
   */
  startAutoUpdate(intervalSeconds: number): void {
    this.stopAutoUpdate();

    this.updateTimer = setInterval(async () => {
      const result = await this.sync();
      if (result.success && result.message.includes('已更新')) {
        NotificationManager.info(result.message);
      }
    }, intervalSeconds * 1000);
  }

  /**
   * 停止自动更新
   */
  stopAutoUpdate(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined;
    }
  }

  /**
   * 检查更新（不自动拉取）
   */
  async checkForUpdates(): Promise<{
    hasUpdates: boolean;
    message: string;
  }> {
    try {
      const status = await this.repository.getStatus();

      if (!status.exists) {
        return {
          hasUpdates: false,
          message: '仓库不存在'
        };
      }

      if (!status.isUpToDate) {
        return {
          hasUpdates: true,
          message: '有可用更新'
        };
      }

      return {
        hasUpdates: false,
        message: '已是最新版本'
      };
    } catch (error: any) {
      return {
        hasUpdates: false,
        message: `检查更新失败: ${error.message}`
      };
    }
  }

  /**
   * 提交并推送 Tip
   */
  async submitTip(tipFilePath: string, message: string): Promise<boolean> {
    try {
      await NotificationManager.withProgress('正在提交 Tip...', async () => {
        await this.repository.commit(message, [tipFilePath]);
        await this.repository.push();
      });

      NotificationManager.success('Tip 提交成功');
      return true;
    } catch (error: any) {
      NotificationManager.error('Tip 提交失败', error);
      return false;
    }
  }

  /**
   * 清理
   */
  dispose(): void {
    this.stopAutoUpdate();
  }
}
