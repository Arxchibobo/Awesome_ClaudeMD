import * as vscode from 'vscode';
import { BaseWebviewProvider } from './webviewProvider';
import { ClaudeMDManager } from '../claudemd/manager';
import { SyncManager } from '../git/sync';
import { TipsManager } from '../claudemd/tips';
import { NotificationManager } from '../utils/notifications';

/**
 * 主面板数据
 */
interface MainPanelData {
  protocolStatus: {
    exists: boolean;
    isUpToDate: boolean;
    lastUpdated?: string;
  };
  repoStatus: {
    exists: boolean;
    currentBranch: string;
    hasUpdates: boolean;
  };
  tipsStats: {
    total: number;
    pending: number;
    integrated: number;
  };
  projectStatus: {
    hasWorkspace: boolean;
    hasCLAUDEMD: boolean;
    projectName?: string;
  };
}

/**
 * 主面板 Provider
 * 显示协议状态、快速操作等
 */
export class MainPanelProvider extends BaseWebviewProvider {
  private claudeMDManager: ClaudeMDManager;
  private syncManager: SyncManager;
  private tipsManager: TipsManager;

  constructor(
    context: vscode.ExtensionContext,
    claudeMDManager: ClaudeMDManager,
    syncManager: SyncManager,
    tipsManager: TipsManager
  ) {
    super(context);
    this.claudeMDManager = claudeMDManager;
    this.syncManager = syncManager;
    this.tipsManager = tipsManager;
  }

  protected getViewType(): string {
    return 'awesomeClaudeMD.mainPanel';
  }

  protected getTitle(): string {
    return 'Awesome ClaudeMD 管理器';
  }

  protected getHtmlContent(): string {
    return this.getBaseHtml(
      `
      <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h1 style="margin: 0;">🚀 Awesome ClaudeMD 管理器</h1>
          <span class="version-badge">v2.1.1</span>
        </div>
        <div style="margin-bottom: 20px; padding: 12px; background: var(--vscode-textBlockQuote-background); border-left: 4px solid var(--vscode-textLink-foreground); border-radius: 4px;">
          <p style="margin: 0; font-size: 13px; color: var(--vscode-descriptionForeground);">
            💡 <strong>独立管理工具</strong> - 与 Claude Code CLI 互补使用，专注于 CLAUDE.md 协议管理
          </p>
        </div>

        <div id="loading" class="loading">
          <p>正在加载...</p>
        </div>

        <div id="content" style="display: none;">
          <!-- 协议状态 -->
          <div class="section">
            <h2>📋 协议状态</h2>
            <div id="protocolStatus"></div>
          </div>

          <!-- 仓库状态 -->
          <div class="section">
            <h2>📦 仓库状态</h2>
            <div id="repoStatus"></div>
          </div>

          <!-- Tips 统计 -->
          <div class="section">
            <h2>💡 Tips 统计</h2>
            <div id="tipsStats"></div>
          </div>

          <!-- 当前项目 -->
          <div class="section">
            <h2>📁 当前项目</h2>
            <div id="projectStatus"></div>
          </div>

          <!-- 快速操作 -->
          <div class="section">
            <h2>⚡ 快速操作</h2>
            <div>
              <button onclick="updateProtocol()">🔄 更新协议</button>
              <button onclick="applyProtocol()">📝 应用到当前项目</button>
              <button onclick="exportProtocol()">💾 导出协议</button>
            </div>
            <div style="margin-top: 8px;">
              <button class="secondary" onclick="openTipsPanel()">💡 管理 Tips</button>
              <button class="secondary" onclick="openSettings()">⚙️ 设置</button>
              <button class="secondary" onclick="refresh()">🔃 刷新</button>
            </div>
          </div>
        </div>
      </div>
      `,
      'Awesome ClaudeMD 主面板'
    );
  }

  protected getBaseStyles(): string {
    return super.getBaseStyles() + `
      .version-badge {
        display: inline-block;
        padding: 4px 12px;
        background-color: var(--vscode-badge-background);
        color: var(--vscode-badge-foreground);
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
      }
    `;
  }

  protected getBaseScript(): string {
    return super.getBaseScript() + `
      // 刷新数据
      function refresh() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('content').style.display = 'none';
        sendMessage('refresh');
      }

      // 更新协议
      function updateProtocol() {
        sendMessage('updateProtocol');
      }

      // 应用协议
      function applyProtocol() {
        sendMessage('applyProtocol');
      }

      // 导出协议
      function exportProtocol() {
        sendMessage('exportProtocol');
      }

      // 打开 Tips 面板
      function openTipsPanel() {
        sendMessage('openTipsPanel');
      }

      // 打开设置
      function openSettings() {
        sendMessage('openSettings');
      }

      // 处理消息
      function handleMessage(message) {
        if (message.command === 'updateData') {
          updateUI(message.data);
        }
      }

      // 更新 UI
      function updateUI(data) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';

        // 协议状态
        const protocolStatus = document.getElementById('protocolStatus');
        if (data.repoStatus.exists) {
          protocolStatus.innerHTML = \`
            <p>
              <span class="status success">✓ 仓库已克隆</span>
              <span class="status \${data.protocolStatus.isUpToDate ? 'success' : 'warning'}">\${data.protocolStatus.isUpToDate ? '✓ 最新版本' : '⚠ 有可用更新'}</span>
            </p>
            \${data.protocolStatus.lastUpdated ? '<p>最后更新: ' + data.protocolStatus.lastUpdated + '</p>' : ''}
          \`;
        } else {
          protocolStatus.innerHTML = '<p><span class="status error">✗ 仓库未克隆</span></p>';
        }

        // 仓库状态
        const repoStatus = document.getElementById('repoStatus');
        if (data.repoStatus.exists) {
          repoStatus.innerHTML = \`
            <p>分支: <strong>\${data.repoStatus.currentBranch}</strong></p>
            <p>状态: \${data.repoStatus.hasUpdates ? '<span class="status warning">有远程更新</span>' : '<span class="status success">已同步</span>'}</p>
          \`;
        } else {
          repoStatus.innerHTML = '<p class="empty">仓库未初始化，请运行"更新协议"命令</p>';
        }

        // Tips 统计
        const tipsStats = document.getElementById('tipsStats');
        tipsStats.innerHTML = \`
          <p>总计: <strong>\${data.tipsStats.total}</strong> 个 Tips</p>
          <p>待整合: <strong>\${data.tipsStats.pending}</strong> 个</p>
          <p>已整合: <strong>\${data.tipsStats.integrated}</strong> 个</p>
        \`;

        // 项目状态
        const projectStatus = document.getElementById('projectStatus');
        if (data.projectStatus.hasWorkspace) {
          projectStatus.innerHTML = \`
            <p>项目: <strong>\${data.projectStatus.projectName || '未命名'}</strong></p>
            <p>CLAUDE.md: \${data.projectStatus.hasCLAUDEMD ? '<span class="status success">✓ 已存在</span>' : '<span class="status warning">✗ 不存在</span>'}</p>
          \`;
        } else {
          projectStatus.innerHTML = '<p class="empty">当前没有打开的工作区</p>';
        }
      }

      // 页面加载时刷新
      window.addEventListener('load', () => {
        refresh();
      });
    `;
  }

  protected async handleMessage(message: any): Promise<void> {
    switch (message.command) {
      case 'refresh':
        await this.refreshData();
        break;
      case 'updateProtocol':
        await this.handleUpdateProtocol();
        break;
      case 'applyProtocol':
        await this.handleApplyProtocol();
        break;
      case 'exportProtocol':
        await this.handleExportProtocol();
        break;
      case 'openTipsPanel':
        vscode.commands.executeCommand('awesomeClaudeMD.openTipsPanel');
        break;
      case 'openSettings':
        vscode.commands.executeCommand('workbench.action.openSettings', 'awesomeClaudeMD');
        break;
    }
  }

  /**
   * 刷新面板数据
   */
  private async refreshData(): Promise<void> {
    try {
      const data = await this.collectData();
      this.postMessage({
        command: 'updateData',
        data
      });
    } catch (error: any) {
      NotificationManager.error('刷新数据失败', error);
    }
  }

  /**
   * 收集面板数据
   */
  private async collectData(): Promise<MainPanelData> {
    // 仓库状态
    const repoStatus = await this.syncManager['repository'].getStatus();
    const hasUpdates = !(await this.syncManager.checkForUpdates()).hasUpdates;

    // Tips 统计
    const allTips = await this.tipsManager.listTips();
    const pendingTips = allTips.filter(t => t.status === 'pending');
    const integratedTips = allTips.filter(t => t.status === 'integrated');

    // 协议状态
    const protocolStatus = await this.claudeMDManager.getStatus();

    // 项目状态
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const hasWorkspace = !!workspaceFolders && workspaceFolders.length > 0;

    return {
      protocolStatus: {
        exists: repoStatus.exists,
        isUpToDate: repoStatus.isUpToDate,
        lastUpdated: repoStatus.lastCommit ? new Date().toLocaleString() : undefined
      },
      repoStatus: {
        exists: repoStatus.exists,
        currentBranch: repoStatus.currentBranch,
        hasUpdates: !hasUpdates
      },
      tipsStats: {
        total: allTips.length,
        pending: pendingTips.length,
        integrated: integratedTips.length
      },
      projectStatus: {
        hasWorkspace,
        hasCLAUDEMD: protocolStatus.exists,
        projectName: hasWorkspace ? workspaceFolders![0].name : undefined
      }
    };
  }

  /**
   * 处理更新协议
   */
  private async handleUpdateProtocol(): Promise<void> {
    await vscode.commands.executeCommand('awesomeClaudeMD.updateProtocol');
    await this.refreshData();
  }

  /**
   * 处理应用协议
   */
  private async handleApplyProtocol(): Promise<void> {
    await vscode.commands.executeCommand('awesomeClaudeMD.applyProtocol');
    await this.refreshData();
  }

  /**
   * 处理导出协议
   */
  private async handleExportProtocol(): Promise<void> {
    await vscode.commands.executeCommand('awesomeClaudeMD.exportProtocol');
  }

  /**
   * 显示面板时自动刷新
   */
  public show(): void {
    super.show();
    // 延迟刷新，等待面板完全加载
    setTimeout(() => {
      this.refreshData();
    }, 100);
  }
}
