import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';

/**
 * 配置管理器
 * 负责读取和管理插件配置
 */
export class ConfigManager {
  private config: vscode.WorkspaceConfiguration;

  constructor() {
    this.config = vscode.workspace.getConfiguration('claudemd');
  }

  /**
   * 刷新配置
   */
  refresh(): void {
    this.config = vscode.workspace.getConfiguration('claudemd');
  }

  /**
   * 获取仓库路径
   */
  getRepositoryPath(): string {
    const configPath = this.config.get<string>('repositoryPath');
    if (configPath) {
      return configPath;
    }

    // 默认路径
    const homeDir = os.homedir();
    let defaultPath = path.join(homeDir, 'Awesome_ClaudeMD');

    // 如果在 Windows 上，且是 Git Bash 环境，处理路径
    if (process.platform === 'win32') {
      defaultPath = defaultPath.replace(/\\/g, '/');
    }

    return defaultPath;
  }

  /**
   * 设置仓库路径
   */
  async setRepositoryPath(path: string): Promise<void> {
    await this.config.update('repositoryPath', path, vscode.ConfigurationTarget.Global);
    this.refresh();
  }

  /**
   * 是否启用自动更新
   */
  isAutoUpdateEnabled(): boolean {
    return this.config.get<boolean>('autoUpdate', true);
  }

  /**
   * 获取更新检查间隔（秒）
   */
  getUpdateInterval(): number {
    return this.config.get<number>('updateInterval', 3600);
  }

  /**
   * 获取 AWS 区域
   */
  getAWSRegion(): string {
    return this.config.get<string>('aws.region', 'us-west-1');
  }

  /**
   * 是否启用本地 LLM
   */
  isLocalLLMEnabled(): boolean {
    return this.config.get<boolean>('localLLM.enabled', false);
  }

  /**
   * 获取本地 LLM 端点
   */
  getLocalLLMEndpoint(): string {
    return this.config.get<string>('localLLM.endpoint', 'http://localhost:11434');
  }

  /**
   * 获取本地 LLM 模型
   */
  getLocalLLMModel(): string {
    return this.config.get<string>('localLLM.model', 'llama2');
  }

  /**
   * 从 SecretStorage 获取 AWS 凭证
   */
  async getAWSCredentials(context: vscode.ExtensionContext): Promise<{
    accessKeyId?: string;
    secretAccessKey?: string;
  }> {
    const accessKeyId = await context.secrets.get('claudemd.aws.accessKeyId');
    const secretAccessKey = await context.secrets.get('claudemd.aws.secretAccessKey');

    return {
      accessKeyId,
      secretAccessKey
    };
  }

  /**
   * 保存 AWS 凭证到 SecretStorage
   */
  async setAWSCredentials(
    context: vscode.ExtensionContext,
    accessKeyId: string,
    secretAccessKey: string
  ): Promise<void> {
    await context.secrets.store('claudemd.aws.accessKeyId', accessKeyId);
    await context.secrets.store('claudemd.aws.secretAccessKey', secretAccessKey);
  }

  /**
   * 清除 AWS 凭证
   */
  async clearAWSCredentials(context: vscode.ExtensionContext): Promise<void> {
    await context.secrets.delete('claudemd.aws.accessKeyId');
    await context.secrets.delete('claudemd.aws.secretAccessKey');
  }
}
