import * as vscode from 'vscode';
import { BaseWebviewProvider } from './webviewProvider';
import { TipsManager, TipInfo } from '../claudemd/tips';
import { SyncManager } from '../git/sync';
import { NotificationManager } from '../utils/notifications';

/**
 * Tips 管理面板 Provider
 */
export class TipsPanelProvider extends BaseWebviewProvider {
  private tipsManager: TipsManager;
  private syncManager: SyncManager;

  constructor(
    context: vscode.ExtensionContext,
    tipsManager: TipsManager,
    syncManager: SyncManager
  ) {
    super(context);
    this.tipsManager = tipsManager;
    this.syncManager = syncManager;
  }

  protected getViewType(): string {
    return 'awesomeClaudeMD.tipsPanel';
  }

  protected getTitle(): string {
    return 'Tips 管理';
  }

  protected getHtmlContent(): string {
    return this.getBaseHtml(
      `
      <div class="container">
        <h1>💡 Tips 管理</h1>

        <!-- 操作栏 -->
        <div class="section">
          <button onclick="createTip()">➕ 新建 Tip</button>
          <button class="secondary" onclick="integrateTips()">🔄 整合 Tips</button>
          <button class="secondary" onclick="refresh()">🔃 刷新</button>
        </div>

        <!-- 过滤器 -->
        <div class="section">
          <div style="display: flex; gap: 8px;">
            <button id="filterAll" class="filter-btn" onclick="filterTips('all')">全部</button>
            <button id="filterPending" class="filter-btn" onclick="filterTips('pending')">待整合</button>
            <button id="filterIntegrated" class="filter-btn" onclick="filterTips('integrated')">已整合</button>
          </div>
        </div>

        <!-- Tips 列表 -->
        <div id="loading" class="loading">
          <p>正在加载 Tips...</p>
        </div>

        <div id="tipsList" style="display: none;"></div>

        <div id="empty" class="empty" style="display: none;">
          <p>暂无 Tips</p>
          <button onclick="createTip()" style="margin-top: 16px;">➕ 创建第一个 Tip</button>
        </div>
      </div>
      `,
      'Tips 管理'
    );
  }

  protected getBaseStyles(): string {
    return super.getBaseStyles() + `
      .tip-card {
        background-color: var(--vscode-editor-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 4px;
        padding: 16px;
        margin-bottom: 12px;
      }

      .tip-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .tip-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--vscode-foreground);
      }

      .tip-meta {
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
        margin-bottom: 8px;
      }

      .tip-content {
        font-size: 13px;
        line-height: 1.6;
        color: var(--vscode-foreground);
        max-height: 200px;
        overflow-y: auto;
        white-space: pre-wrap;
        margin-bottom: 12px;
      }

      .tip-actions {
        display: flex;
        gap: 8px;
      }

      .tip-actions button {
        font-size: 12px;
        padding: 4px 12px;
      }

      .filter-btn {
        opacity: 0.6;
      }

      .filter-btn.active {
        opacity: 1;
        background-color: var(--vscode-button-background);
      }
    `;
  }

  protected getBaseScript(): string {
    return super.getBaseScript() + `
      let currentFilter = 'all';
      let allTips = [];

      // 刷新列表
      function refresh() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('tipsList').style.display = 'none';
        document.getElementById('empty').style.display = 'none';
        sendMessage('refresh');
      }

      // 过滤 Tips
      function filterTips(filter) {
        currentFilter = filter;

        // 更新按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        document.getElementById('filter' + filter.charAt(0).toUpperCase() + filter.slice(1)).classList.add('active');

        // 过滤显示
        const filteredTips = filter === 'all'
          ? allTips
          : allTips.filter(tip => tip.status === filter);

        renderTips(filteredTips);
      }

      // 渲染 Tips 列表
      function renderTips(tips) {
        const listEl = document.getElementById('tipsList');
        const emptyEl = document.getElementById('empty');
        const loadingEl = document.getElementById('loading');

        loadingEl.style.display = 'none';

        if (tips.length === 0) {
          listEl.style.display = 'none';
          emptyEl.style.display = 'block';
          return;
        }

        emptyEl.style.display = 'none';
        listEl.style.display = 'block';

        listEl.innerHTML = tips.map(tip => \`
          <div class="tip-card">
            <div class="tip-header">
              <div class="tip-title">\${tip.title}</div>
              <span class="status \${tip.status === 'integrated' ? 'success' : 'warning'}">
                \${tip.status === 'integrated' ? '✓ 已整合' : '⏳ 待整合'}
              </span>
            </div>
            <div class="tip-meta">
              作者: \${tip.author} |
              创建: \${tip.createdAt ? new Date(tip.createdAt).toLocaleString() : '未知'}
              \${tip.integratedAt ? ' | 整合: ' + new Date(tip.integratedAt).toLocaleString() : ''}
            </div>
            <div class="tip-content">\${tip.content.substring(0, 300)}\${tip.content.length > 300 ? '...' : ''}</div>
            <div class="tip-actions">
              <button class="secondary" onclick="viewTip('\${tip.fileName}')">📄 查看</button>
              \${tip.status === 'pending' ? '<button class="secondary" onclick="editTip(\\''+tip.fileName+'\\')">✏️ 编辑</button>' : ''}
              \${tip.status === 'pending' ? '<button class="secondary" onclick="deleteTip(\\''+tip.fileName+'\\')">🗑️ 删除</button>' : ''}
            </div>
          </div>
        \`).join('');
      }

      // 创建 Tip
      function createTip() {
        sendMessage('createTip');
      }

      // 查看 Tip
      function viewTip(fileName) {
        sendMessage('viewTip', { fileName });
      }

      // 编辑 Tip
      function editTip(fileName) {
        sendMessage('editTip', { fileName });
      }

      // 删除 Tip
      function deleteTip(fileName) {
        if (confirm('确定要删除这个 Tip 吗？')) {
          sendMessage('deleteTip', { fileName });
        }
      }

      // 整合 Tips
      function integrateTips() {
        if (confirm('确定要整合待处理的 Tips 吗？（需要 AWS 凭证）')) {
          sendMessage('integrateTips');
        }
      }

      // 处理消息
      function handleMessage(message) {
        if (message.command === 'updateTips') {
          allTips = message.tips;
          filterTips(currentFilter);
        }
      }

      // 页面加载时刷新
      window.addEventListener('load', () => {
        document.getElementById('filterAll').classList.add('active');
        refresh();
      });
    `;
  }

  protected async handleMessage(message: any): Promise<void> {
    switch (message.command) {
      case 'refresh':
        await this.refreshTips();
        break;
      case 'createTip':
        await vscode.commands.executeCommand('awesomeClaudeMD.submitTip');
        await this.refreshTips();
        break;
      case 'viewTip':
        await this.viewTip(message.fileName);
        break;
      case 'editTip':
        await this.editTip(message.fileName);
        break;
      case 'deleteTip':
        await this.deleteTip(message.fileName);
        break;
      case 'integrateTips':
        await vscode.commands.executeCommand('awesomeClaudeMD.integrateTips');
        await this.refreshTips();
        break;
    }
  }

  /**
   * 刷新 Tips 列表
   */
  private async refreshTips(): Promise<void> {
    try {
      const tips = await this.tipsManager.listTips();
      this.postMessage({
        command: 'updateTips',
        tips: tips.map(tip => ({
          ...tip,
          // 只发送必要字段，避免内容过大
          content: tip.content.substring(0, 500)
        }))
      });
    } catch (error: any) {
      NotificationManager.error('刷新 Tips 失败', error);
    }
  }

  /**
   * 查看 Tip
   */
  private async viewTip(fileName: string): Promise<void> {
    try {
      const tips = await this.tipsManager.listTips();
      const tip = tips.find(t => t.fileName === fileName);

      if (!tip) {
        NotificationManager.error('找不到指定的 Tip');
        return;
      }

      // 在编辑器中打开
      const document = await vscode.workspace.openTextDocument(
        vscode.Uri.file(tip.filePath)
      );
      await vscode.window.showTextDocument(document);
    } catch (error: any) {
      NotificationManager.error('打开 Tip 失败', error);
    }
  }

  /**
   * 编辑 Tip
   */
  private async editTip(fileName: string): Promise<void> {
    await this.viewTip(fileName);
  }

  /**
   * 删除 Tip
   */
  private async deleteTip(fileName: string): Promise<void> {
    try {
      const tips = await this.tipsManager.listTips();
      const tip = tips.find(t => t.fileName === fileName);

      if (!tip) {
        NotificationManager.error('找不到指定的 Tip');
        return;
      }

      await this.tipsManager.deleteTip(tip.filePath);
      NotificationManager.success('Tip 已删除');
      await this.refreshTips();
    } catch (error: any) {
      NotificationManager.error('删除 Tip 失败', error);
    }
  }

  /**
   * 显示面板时自动刷新
   */
  public show(): void {
    super.show();
    setTimeout(() => {
      this.refreshTips();
    }, 100);
  }
}
