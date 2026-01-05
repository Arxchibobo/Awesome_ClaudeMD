import { ConfigManager } from '../utils/config';
import { GitRepository } from '../git/repository';
import { SyncManager } from '../git/sync';
import { TipsManager } from '../claudemd/tips';
import { ClaudeMDManager } from '../claudemd/manager';
import { MainPanelProvider } from '../ui/mainPanel';
import { TipsPanelProvider } from '../ui/tipsPanel';

/**
 * 管理器容器
 * 包含所有核心管理器实例
 */
export interface ManagerContainer {
  configManager: ConfigManager;
  repository: GitRepository;
  syncManager: SyncManager;
  tipsManager: TipsManager;
  claudeMDManager: ClaudeMDManager;
  mainPanel: MainPanelProvider;
  tipsPanel: TipsPanelProvider;
}
