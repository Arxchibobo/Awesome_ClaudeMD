import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Webview Provider 基类
 * 提供 Webview 创建和消息通信的基础功能
 */
export abstract class BaseWebviewProvider {
  protected panel: vscode.WebviewPanel | undefined;
  protected context: vscode.ExtensionContext;
  protected disposables: vscode.Disposable[] = [];

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * 创建或显示 Webview 面板
   */
  public show(): void {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.One);
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      this.getViewType(),
      this.getTitle(),
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(this.context.extensionPath, 'resources'))
        ]
      }
    );

    this.panel.webview.html = this.getHtmlContent();
    this.setupMessageHandlers();

    // 面板关闭时清理
    this.panel.onDidDispose(
      () => {
        this.panel = undefined;
        this.dispose();
      },
      null,
      this.disposables
    );
  }

  /**
   * 获取视图类型（子类实现）
   */
  protected abstract getViewType(): string;

  /**
   * 获取面板标题（子类实现）
   */
  protected abstract getTitle(): string;

  /**
   * 获取 HTML 内容（子类实现）
   */
  protected abstract getHtmlContent(): string;

  /**
   * 设置消息处理器（子类可覆盖）
   */
  protected setupMessageHandlers(): void {
    if (!this.panel) {
      return;
    }

    this.panel.webview.onDidReceiveMessage(
      async (message) => {
        await this.handleMessage(message);
      },
      null,
      this.disposables
    );
  }

  /**
   * 处理来自 Webview 的消息（子类实现）
   */
  protected abstract handleMessage(message: any): Promise<void>;

  /**
   * 发送消息到 Webview
   */
  protected postMessage(message: any): void {
    this.panel?.webview.postMessage(message);
  }

  /**
   * 获取资源 URI（用于 Webview 中加载本地资源）
   */
  protected getResourceUri(resourcePath: string): vscode.Uri {
    if (!this.panel) {
      throw new Error('Panel not initialized');
    }

    const diskPath = vscode.Uri.file(
      path.join(this.context.extensionPath, 'resources', resourcePath)
    );

    return this.panel.webview.asWebviewUri(diskPath);
  }

  /**
   * 获取基础 HTML 模板
   */
  protected getBaseHtml(content: string, title: string): string {
    const nonce = this.getNonce();

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${this.panel?.webview.cspSource}; script-src 'nonce-${nonce}';">
  <title>${title}</title>
  <style>
    ${this.getBaseStyles()}
  </style>
</head>
<body>
  ${content}
  <script nonce="${nonce}">
    ${this.getBaseScript()}
  </script>
</body>
</html>`;
  }

  /**
   * 获取基础样式
   */
  protected getBaseStyles(): string {
    return `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: var(--vscode-font-family);
        font-size: var(--vscode-font-size);
        color: var(--vscode-foreground);
        background-color: var(--vscode-editor-background);
        padding: 20px;
      }

      h1, h2, h3 {
        margin-bottom: 16px;
        font-weight: 600;
      }

      h1 {
        font-size: 24px;
      }

      h2 {
        font-size: 20px;
      }

      h3 {
        font-size: 16px;
      }

      p {
        margin-bottom: 12px;
        line-height: 1.6;
      }

      button {
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        padding: 8px 16px;
        cursor: pointer;
        border-radius: 2px;
        font-size: 13px;
        margin-right: 8px;
        margin-bottom: 8px;
      }

      button:hover {
        background-color: var(--vscode-button-hoverBackground);
      }

      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      button.secondary {
        background-color: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
      }

      button.secondary:hover {
        background-color: var(--vscode-button-secondaryHoverBackground);
      }

      input, textarea, select {
        background-color: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-input-border);
        padding: 6px 8px;
        border-radius: 2px;
        font-family: inherit;
        font-size: inherit;
        width: 100%;
        margin-bottom: 12px;
      }

      input:focus, textarea:focus, select:focus {
        outline: 1px solid var(--vscode-focusBorder);
      }

      .container {
        max-width: 800px;
        margin: 0 auto;
      }

      .section {
        background-color: var(--vscode-editor-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 4px;
        padding: 16px;
        margin-bottom: 16px;
      }

      .status {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 2px;
        font-size: 12px;
        font-weight: 500;
      }

      .status.success {
        background-color: var(--vscode-testing-iconPassed);
        color: white;
      }

      .status.warning {
        background-color: var(--vscode-editorWarning-foreground);
        color: white;
      }

      .status.error {
        background-color: var(--vscode-editorError-foreground);
        color: white;
      }

      .loading {
        text-align: center;
        padding: 40px;
        color: var(--vscode-descriptionForeground);
      }

      .empty {
        text-align: center;
        padding: 40px;
        color: var(--vscode-descriptionForeground);
      }
    `;
  }

  /**
   * 获取基础脚本
   */
  protected getBaseScript(): string {
    return `
      // VS Code API
      const vscode = acquireVsCodeApi();

      // 发送消息到扩展
      function sendMessage(command, data = {}) {
        vscode.postMessage({ command, ...data });
      }

      // 监听来自扩展的消息
      window.addEventListener('message', event => {
        const message = event.data;
        handleMessage(message);
      });

      // 消息处理函数（由子类实现）
      function handleMessage(message) {
        console.log('Received message:', message);
      }
    `;
  }

  /**
   * 生成随机 nonce（用于 CSP）
   */
  private getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
  }
}
