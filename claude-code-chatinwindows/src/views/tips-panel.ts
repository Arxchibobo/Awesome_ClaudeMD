import * as vscode from 'vscode';
import { TipsManager, TipInfo } from '../claudemd/tips';
import { SyncManager } from '../git/sync';

/**
 * Tips 管理面板 Webview Provider
 * 提供 Tips 列表、编辑和管理功能
 */
export class TipsPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'claudemd.tipsPanel';
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly tipsManager: TipsManager,
    private readonly syncManager: SyncManager
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
      console.log('[TipsPanel] 收到消息:', message.command);

      try {
        switch (message.command) {
          case 'refresh':
            await this._updateData();
            break;
          case 'viewTip':
            await this._viewTip(message.tip);
            break;
          case 'editTip':
            await this._editTip(message.tip);
            break;
          case 'deleteTip':
            await this._deleteTip(message.tip);
            break;
          case 'createTip':
            vscode.commands.executeCommand('claudemd.submitTip');
            break;
          case 'integrateTips':
            vscode.commands.executeCommand('claudemd.integrateTips');
            break;
        }
      } catch (error: any) {
        console.error('[TipsPanel] 处理消息失败:', error);
        vscode.window.showErrorMessage(`操作失败: ${error.message}`);
      }
    });

    // 初始加载数据
    this._updateData();
  }

  /**
   * 更新数据
   */
  private async _updateData() {
    console.log('[TipsPanel] 开始更新数据...');

    if (!this._view) {
      console.log('[TipsPanel] _view 不存在，跳过更新');
      return;
    }

    try {
      console.log('[TipsPanel] 获取待整合 Tips...');
      const pendingTips = await this.tipsManager.getPendingTips();
      console.log(`[TipsPanel] 获取到 ${pendingTips.length} 个待整合 Tips`);

      console.log('[TipsPanel] 获取已整合 Tips...');
      const integratedTips = await this.tipsManager.getIntegratedTips();
      console.log(`[TipsPanel] 获取到 ${integratedTips.length} 个已整合 Tips`);

      console.log('[TipsPanel] 发送数据到 webview...');
      this._view.webview.postMessage({
        command: 'updateData',
        data: {
          pendingTips,
          integratedTips
        }
      });
      console.log('[TipsPanel] ✅ 数据更新成功');
    } catch (error: any) {
      console.error('[TipsPanel] ❌ 更新数据失败:', error);
      console.error('[TipsPanel] 错误堆栈:', error.stack);

      // 向 webview 发送错误消息
      this._view.webview.postMessage({
        command: 'error',
        message: `加载失败: ${error.message || '未知错误'}`
      });

      // 也显示 VS Code 通知
      vscode.window.showErrorMessage(`Tips 面板加载失败: ${error.message}`);
    }
  }

  /**
   * 查看 Tip 详情
   */
  private async _viewTip(tip: TipInfo) {
    const document = await vscode.workspace.openTextDocument({
      content: tip.content,
      language: 'markdown'
    });
    await vscode.window.showTextDocument(document, {
      preview: true,
      viewColumn: vscode.ViewColumn.Beside
    });
  }

  /**
   * 编辑 Tip
   */
  private async _editTip(tip: TipInfo) {
    const document = await vscode.workspace.openTextDocument(
      vscode.Uri.file(tip.filePath)
    );
    const editor = await vscode.window.showTextDocument(document);

    // 提示用户保存后自动同步
    vscode.window.showInformationMessage(
      '编辑完成后保存文件，即可提交到远程仓库',
      '立即提交'
    ).then(action => {
      if (action === '立即提交') {
        this.syncManager.submitTip(
          tip.filePath,
          `tips: 更新 ${tip.title}`
        );
      }
    });
  }

  /**
   * 删除 Tip
   */
  private async _deleteTip(tip: TipInfo) {
    const confirmed = await vscode.window.showWarningMessage(
      `确定要删除 "${tip.title}" 吗？`,
      { modal: true },
      '删除',
      '取消'
    );

    if (confirmed === '删除') {
      try {
        await this.tipsManager.deleteTip(tip.filePath);
        vscode.window.showInformationMessage('Tip 已删除');
        await this._updateData();
      } catch (error: any) {
        vscode.window.showErrorMessage(`删除失败: ${error.message}`);
      }
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
  <title>Tips 管理</title>
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
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }

    h1 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    button {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    button:hover {
      background-color: var(--vscode-button-hoverBackground);
    }

    button.secondary {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    button.secondary:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }

    button.icon-btn {
      width: 28px;
      height: 28px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tabs {
      display: flex;
      gap: 2px;
      margin-bottom: 15px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }

    .tab {
      padding: 8px 16px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      font-size: 13px;
      font-weight: 500;
      color: var(--vscode-descriptionForeground);
      transition: all 0.2s;
    }

    .tab:hover {
      color: var(--vscode-foreground);
    }

    .tab.active {
      color: var(--vscode-textLink-foreground);
      border-bottom-color: var(--vscode-textLink-foreground);
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    .tips-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .tip-card {
      background-color: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      padding: 12px;
      transition: border-color 0.2s;
    }

    .tip-card:hover {
      border-color: var(--vscode-focusBorder);
    }

    .tip-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 8px;
    }

    .tip-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--vscode-foreground);
      margin: 0;
    }

    .tip-meta {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      margin-top: 4px;
    }

    .tip-actions {
      display: flex;
      gap: 4px;
    }

    .tip-actions button {
      padding: 4px 8px;
      font-size: 10px;
    }

    .tip-preview {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      margin: 8px 0 0 0;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--vscode-descriptionForeground);
    }

    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 10px;
      opacity: 0.5;
    }

    .empty-state-text {
      font-size: 14px;
      margin-bottom: 15px;
    }

    .stats {
      display: flex;
      gap: 15px;
      padding: 10px 0;
      margin-bottom: 15px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 600;
      color: var(--vscode-foreground);
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
      <h1>📝 Tips 管理</h1>
      <div class="header-actions">
        <button id="refreshBtn" class="icon-btn secondary" title="刷新">⟳</button>
        <button id="createTipBtn">+ 新建 Tip</button>
      </div>
    </header>

    <div class="stats">
      <div class="stat-item">
        <div class="stat-label">待整合</div>
        <div class="stat-value" id="pendingCount">0</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">已整合</div>
        <div class="stat-value" id="integratedCount">0</div>
      </div>
    </div>

    <div class="tabs">
      <div class="tab active" data-tab="pending">
        📌 待整合
      </div>
      <div class="tab" data-tab="integrated">
        ✅ 已整合
      </div>
    </div>

    <div id="content" class="loading">加载中...</div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    let currentData = null;
    let allTips = []; // 存储所有 tips 数据

    // HTML 转义函数，防止 XSS 和语法错误
    function escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // 初始化事件监听器
    function initEventListeners() {
      // 刷新按钮
      const refreshBtn = document.getElementById('refreshBtn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', refresh);
      }

      // 创建 Tip 按钮
      const createTipBtn = document.getElementById('createTipBtn');
      if (createTipBtn) {
        createTipBtn.addEventListener('click', createTip);
      }

      // 标签切换
      document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
          const tabName = this.getAttribute('data-tab');
          switchTab(tabName);
        });
      });
    }

    // 监听来自扩展的消息
    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.command) {
        case 'updateData':
          currentData = message.data;
          // 合并所有 tips 并添加索引
          allTips = [
            ...message.data.pendingTips.map((tip, idx) => ({ ...tip, _index: idx, _type: 'pending' })),
            ...message.data.integratedTips.map((tip, idx) => ({ ...tip, _index: idx + message.data.pendingTips.length, _type: 'integrated' }))
          ];
          renderData(message.data);
          break;
        case 'error':
          // 显示错误信息（使用 DOM 操作避免 onclick 转义问题）
          const contentDiv = document.getElementById('content');
          contentDiv.innerHTML = '';

          const errorDiv = document.createElement('div');
          errorDiv.className = 'empty-state';

          const icon = document.createElement('div');
          icon.className = 'empty-state-icon';
          icon.textContent = '⚠️';

          const text = document.createElement('div');
          text.className = 'empty-state-text';
          text.style.color = 'var(--vscode-errorForeground)';
          text.textContent = message.message;

          const retryBtn = document.createElement('button');
          retryBtn.textContent = '重试';
          retryBtn.onclick = refresh;

          errorDiv.appendChild(icon);
          errorDiv.appendChild(text);
          errorDiv.appendChild(retryBtn);
          contentDiv.appendChild(errorDiv);
          break;
      }
    });

    // 刷新数据
    function refresh() {
      console.log('[TipsPanel] 刷新数据...');
      document.getElementById('content').innerHTML = '<div class="loading">加载中...</div>';
      vscode.postMessage({ command: 'refresh' });
    }

    // 切换标签页
    function switchTab(tabName) {
      // 更新标签样式
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });
      const targetTab = document.querySelector('[data-tab="' + tabName + '"]');
      if (targetTab) {
        targetTab.classList.add('active');
      }

      // 渲染对应内容
      if (currentData) {
        renderTabContent(tabName, currentData);
      }
    }

    // 渲染数据
    function renderData(data) {
      // 更新统计
      document.getElementById('pendingCount').textContent = data.pendingTips.length;
      document.getElementById('integratedCount').textContent = data.integratedTips.length;

      // 渲染当前标签页内容
      const activeTab = document.querySelector('.tab.active').dataset.tab;
      renderTabContent(activeTab, data);
    }

    // 渲染标签页内容（使用 DOM 操作避免字符串拼接问题）
    function renderTabContent(tabName, data) {
      const tips = tabName === 'pending' ? data.pendingTips : data.integratedTips;
      const contentDiv = document.getElementById('content');

      // 清空内容
      contentDiv.innerHTML = '';

      if (tips.length === 0) {
        // 空状态
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state';

        const icon = document.createElement('div');
        icon.className = 'empty-state-icon';
        icon.textContent = tabName === 'pending' ? '📭' : '✨';

        const text = document.createElement('div');
        text.className = 'empty-state-text';
        text.innerHTML = tabName === 'pending'
          ? '暂无待整合的 Tips<br>点击上方按钮创建新的 Tip'
          : '还没有已整合的 Tips<br>提交一些 Tips 并运行整合吧';

        const button = document.createElement('button');
        button.textContent = tabName === 'pending' ? '创建 Tip' : '整合 Tips';
        button.onclick = tabName === 'pending' ? createTip : integrateTips;

        emptyDiv.appendChild(icon);
        emptyDiv.appendChild(text);
        emptyDiv.appendChild(button);
        contentDiv.appendChild(emptyDiv);
        return;
      }

      // 创建列表容器
      const listDiv = document.createElement('div');
      listDiv.className = 'tips-list';

      // 渲染每个 tip 卡片
      tips.forEach((tip, localIdx) => {
        // 查找全局索引
        const globalIndex = allTips.findIndex(t =>
          t.filePath === tip.filePath && t.title === tip.title
        );

        // 创建卡片
        const card = document.createElement('div');
        card.className = 'tip-card';
        card.setAttribute('data-tip-index', globalIndex);

        // 卡片头部
        const header = document.createElement('div');
        header.className = 'tip-header';

        // 左侧信息
        const leftDiv = document.createElement('div');

        const title = document.createElement('h3');
        title.className = 'tip-title';
        title.textContent = tip.title;

        const meta = document.createElement('div');
        meta.className = 'tip-meta';
        let metaText = '👤 ' + tip.author;
        if (tip.createdAt) {
          metaText += ' • ' + new Date(tip.createdAt).toLocaleDateString('zh-CN');
        }
        if (tip.integratedAt) {
          metaText += ' • 整合于 ' + new Date(tip.integratedAt).toLocaleDateString('zh-CN');
        }
        meta.textContent = metaText;

        leftDiv.appendChild(title);
        leftDiv.appendChild(meta);

        // 操作按钮
        const actions = document.createElement('div');
        actions.className = 'tip-actions';

        const viewBtn = document.createElement('button');
        viewBtn.textContent = '查看';
        viewBtn.onclick = () => viewTip(globalIndex);
        actions.appendChild(viewBtn);

        if (tabName === 'pending') {
          const editBtn = document.createElement('button');
          editBtn.textContent = '编辑';
          editBtn.onclick = () => editTip(globalIndex);
          actions.appendChild(editBtn);

          const delBtn = document.createElement('button');
          delBtn.textContent = '删除';
          delBtn.className = 'secondary';
          delBtn.onclick = () => deleteTip(globalIndex);
          actions.appendChild(delBtn);
        }

        header.appendChild(leftDiv);
        header.appendChild(actions);

        // 预览内容
        const preview = document.createElement('div');
        preview.className = 'tip-preview';
        const previewText = tip.content.substring(0, 150).replace(/\\n/g, ' ');
        preview.textContent = previewText + '...';

        // 组装卡片
        card.appendChild(header);
        card.appendChild(preview);
        listDiv.appendChild(card);
      });

      contentDiv.appendChild(listDiv);

      // 添加整合按钮
      if (tabName === 'pending' && tips.length > 0) {
        const integrateBtn = document.createElement('button');
        integrateBtn.textContent = '🤖 整合所有 Tips';
        integrateBtn.style.marginTop = '15px';
        integrateBtn.style.width = '100%';
        integrateBtn.onclick = integrateTips;
        contentDiv.appendChild(integrateBtn);
      }
    }

    // 命令函数
    function createTip() {
      console.log('[TipsPanel] 创建新 Tip');
      vscode.postMessage({ command: 'createTip' });
    }

    function viewTip(index) {
      const tip = allTips[index];
      if (!tip) {
        console.error('[TipsPanel] 未找到 Tip, index:', index);
        return;
      }
      console.log('[TipsPanel] 查看 Tip:', tip.title);
      vscode.postMessage({ command: 'viewTip', tip });
    }

    function editTip(index) {
      const tip = allTips[index];
      if (!tip) {
        console.error('[TipsPanel] 未找到 Tip, index:', index);
        return;
      }
      console.log('[TipsPanel] 编辑 Tip:', tip.title);
      vscode.postMessage({ command: 'editTip', tip });
    }

    function deleteTip(index) {
      const tip = allTips[index];
      if (!tip) {
        console.error('[TipsPanel] 未找到 Tip, index:', index);
        return;
      }
      console.log('[TipsPanel] 删除 Tip:', tip.title);
      vscode.postMessage({ command: 'deleteTip', tip });
    }

    function integrateTips() {
      console.log('[TipsPanel] 整合 Tips');
      vscode.postMessage({ command: 'integrateTips' });
    }

    // 页面加载完成后初始化
    initEventListeners();

    // 初始请求数据
    refresh();
  </script>
</body>
</html>`;
  }
}
