import * as vscode from 'vscode';

/**
 * 通知类型
 */
export enum NotificationType {
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
  Success = 'success'
}

/**
 * 通知管理器
 */
export class NotificationManager {
  /**
   * 显示通知
   */
  static show(message: string, type: NotificationType = NotificationType.Info): void {
    switch (type) {
      case NotificationType.Info:
        vscode.window.showInformationMessage(`[Awesome ClaudeMD] ${message}`);
        break;
      case NotificationType.Warning:
        vscode.window.showWarningMessage(`[Awesome ClaudeMD] ${message}`);
        break;
      case NotificationType.Error:
        vscode.window.showErrorMessage(`[Awesome ClaudeMD] ${message}`);
        break;
      case NotificationType.Success:
        vscode.window.showInformationMessage(`[Awesome ClaudeMD] ✅ ${message}`);
        break;
    }
  }

  /**
   * 显示成功通知
   */
  static success(message: string): void {
    this.show(message, NotificationType.Success);
  }

  /**
   * 显示错误通知
   */
  static error(message: string, error?: Error): void {
    const fullMessage = error ? `${message}: ${error.message}` : message;
    this.show(fullMessage, NotificationType.Error);
  }

  /**
   * 显示警告通知
   */
  static warning(message: string): void {
    this.show(message, NotificationType.Warning);
  }

  /**
   * 显示信息通知
   */
  static info(message: string): void {
    this.show(message, NotificationType.Info);
  }

  /**
   * 显示进度通知
   */
  static async withProgress<T>(
    title: string,
    task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>
  ): Promise<T> {
    return await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `[Awesome ClaudeMD] ${title}`,
        cancellable: false
      },
      task
    );
  }

  /**
   * 显示确认对话框
   */
  static async confirm(message: string): Promise<boolean> {
    const result = await vscode.window.showInformationMessage(
      `[Awesome ClaudeMD] ${message}`,
      { modal: true },
      '确定',
      '取消'
    );
    return result === '确定';
  }

  /**
   * 显示输入框
   */
  static async input(prompt: string, defaultValue?: string): Promise<string | undefined> {
    return await vscode.window.showInputBox({
      prompt: `[Awesome ClaudeMD] ${prompt}`,
      value: defaultValue
    });
  }
}
