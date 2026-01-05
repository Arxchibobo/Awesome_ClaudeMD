import * as vscode from 'vscode';
import * as path from 'path';
import { ClaudeMDManager } from '../claudemd/manager';
import { TipsManager } from '../claudemd/tips';
import { GitRepository } from '../git/repository';

/**
 * 主面板 Webview Provider
 * 提供协议状态仪表板和快速操作
 */
export class MainPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'claudemd.mainPanel';
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly claudeMDManager: ClaudeMDManager,
    private readonly tipsManager: TipsManager,
    private readonly repository: GitRepository
  ) {}

  /**
   * 解析 Webview 视图
   */
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    // 配置 Webview
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'out', 'webviews')
      ]
    };

    // 设置 HTML 内容
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // 监听消息
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'refresh':
          await this._updateData();
          break;
        case 'updateProtocol':
          vscode.commands.executeCommand('claudemd.updateProtocol');
          break;
        case 'applyProtocol':
          vscode.commands.executeCommand('claudemd.applyProtocol');
          break;
        case 'exportProtocol':
          vscode.commands.executeCommand('claudemd.exportProtocol');
          break;
        case 'openTipsPanel':
          vscode.commands.executeCommand('claudemd.openTipsPanel');
          break;
      }
    });

    // 初始加载数据
    this._updateData();
  }

  /**
   * 更新数据
   */
  private async _updateData() {
    if (!this._view) {
      return;
    }

    try {
      // 获取状态信息
      const status = await this.claudeMDManager.getStatus();
      const repoStatus = await this.repository.getStatus();
      const pendingTips = await this.tipsManager.getPendingTips();
      const integratedTips = await this.tipsManager.getIntegratedTips();
      const commits = await this.repository.getRecentCommits(5);

      // 发送数据到 Webview
      this._view.webview.postMessage({
        command: 'updateData',
        data: {
          projectStatus: {
            exists: status.exists,
            hasAsinit: status.hasAsinit,
            isUpToDate: status.isUpToDate,
            lastModified: status.lastModified?.toISOString()
          },
          repoStatus: {
            exists: repoStatus.exists,
            isUpToDate: repoStatus.isUpToDate,
            currentBranch: repoStatus.currentBranch,
            hasUncommittedChanges: repoStatus.hasUncommittedChanges
          },
          tipsStats: {
            pending: pendingTips.length,
            integrated: integratedTips.length
          },
          recentCommits: commits
        }
      });
    } catch (error) {
      console.error('[MainPanel] 更新数据失败:', error);
    }
  }

  /**
   * 生成 Webview HTML
   */
  private _getHtmlForWebview(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ClaudeMD Manager</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      padding: 10px;
      margin: 0;
    }

    .container {
      max-width: 100%;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }

    h1 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-latest {
      background-color: var(--vscode-testing-iconPassed);
      color: var(--vscode-editor-background);
    }

    .status-update {
      background-color: var(--vscode-testing-iconQueued);
      color: var(--vscode-editor-background);
    }

    .dashboard {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 15px;
    }

    .card {
      background-color: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      padding: 12px;
    }

    .card h2 {
      font-size: 13px;
      font-weight: 600;
      margin: 0 0 10px 0;
      color: var(--vscode-foreground);
    }

    .card p {
      font-size: 12px;
      margin: 6px 0;
      color: var(--vscode-descriptionForeground);
    }

    .card .value {
      color: var(--vscode-foreground);
      font-weight: 500;
    }

    .icon {
      margin-right: 4px;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 15px;
    }

    button {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    button:hover {
      background-color: var(--vscode-button-hoverBackground);
    }

    button:active {
      background-color: var(--vscode-button-activeBackground);
    }

    .secondary-btn {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    .secondary-btn:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }

    .history {
      margin-top: 15px;
    }

    .history h2 {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 10px 0;
    }

    .history-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .history-item {
      font-size: 11px;
      padding: 8px;
      margin-bottom: 6px;
      background-color: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
    }

    .commit-hash {
      font-family: var(--vscode-editor-font-family);
      color: var(--vscode-textLink-foreground);
      margin-right: 8px;
    }

    .commit-message {
      color: var(--vscode-foreground);
    }

    .commit-author {
      color: var(--vscode-descriptionForeground);
      margin-left: 8px;
    }

    .refresh-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 24px;
      height: 24px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading {
      text-align: center;
      padding: 20px;
      color: var(--vscode-descriptionForeground);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>ClaudeMD Manager</h1>
      <button class="refresh-btn" onclick="refresh()" title="刷新">⟳</button>
    </header>

    <div id="content" class="loading">加载中...</div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    // 监听来自扩展的消息
    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.command) {
        case 'updateData':
          renderData(message.data);
          break;
      }
    });

    // 刷新数据
    function refresh() {
      vscode.postMessage({ command: 'refresh' });
    }

    // 渲染数据
    function renderData(data) {
      const { projectStatus, repoStatus, tipsStats, recentCommits } = data;

      const statusBadge = repoStatus.isUpToDate
        ? '<span class="status-badge status-latest">✓ 最新</span>'
        : '<span class="status-badge status-update">⚠ 有更新</span>';

      const html = \`
        <div class="dashboard">
          <div class="card">
            <h2><span class="icon">📁</span>当前项目</h2>
            <p>CLAUDE.md: <span class="value">\${projectStatus.exists ? '✅ 已存在' : '❌ 不存在'}</span></p>
            <p>协议状态: <span class="value">\${projectStatus.isUpToDate ? '✅ 最新' : '⚠️ 有更新'}</span></p>
            \${projectStatus.lastModified ? \`<p>最后修改: <span class="value">\${new Date(projectStatus.lastModified).toLocaleString('zh-CN')}</span></p>\` : ''}
          </div>

          <div class="card">
            <h2><span class="icon">📦</span>仓库状态</h2>
            <p>分支: <span class="value">\${repoStatus.currentBranch}</span></p>
            <p>状态: <span class="value">\${repoStatus.isUpToDate ? '✅ 最新' : '⚠️ 有更新'}</span></p>
            <p>未提交变更: <span class="value">\${repoStatus.hasUncommittedChanges ? '⚠️ 有' : '✅ 无'}</span></p>
          </div>

          <div class="card">
            <h2><span class="icon">📝</span>Tips 统计</h2>
            <p>待整合: <span class="value">\${tipsStats.pending} 个</span></p>
            <p>已整合: <span class="value">\${tipsStats.integrated} 个</span></p>
          </div>

          <div class="card">
            <h2><span class="icon">ℹ️</span>快捷信息</h2>
            <p>协议版本: <span class="value">v1.0</span></p>
            <p>总体状态: \${statusBadge}</p>
          </div>
        </div>

        <div class="actions">
          <button onclick="updateProtocol()">🔄 更新协议</button>
          <button onclick="applyProtocol()">📥 应用到项目</button>
          <button class="secondary-btn" onclick="exportProtocol()">📤 导出协议</button>
          <button class="secondary-btn" onclick="openTipsPanel()">📝 打开 Tips 管理</button>
        </div>

        <div class="history">
          <h2>📜 最近更新</h2>
          <ul class="history-list">
            \${recentCommits.map(commit => \`
              <li class="history-item">
                <span class="commit-hash">\${commit.hash}</span>
                <span class="commit-message">\${commit.message}</span>
                <span class="commit-author">by \${commit.author}</span>
              </li>
            \`).join('')}
          </ul>
        </div>
      \`;

      document.getElementById('content').innerHTML = html;
    }

    // 命令函数
    function updateProtocol() {
      vscode.postMessage({ command: 'updateProtocol' });
    }

    function applyProtocol() {
      vscode.postMessage({ command: 'applyProtocol' });
    }

    function exportProtocol() {
      vscode.postMessage({ command: 'exportProtocol' });
    }

    function openTipsPanel() {
      vscode.postMessage({ command: 'openTipsPanel' });
    }

    // 初始请求数据
    refresh();
  </script>
</body>
</html>`;
  }
}
