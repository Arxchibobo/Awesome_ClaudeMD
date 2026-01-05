import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import * as path from 'path';
import { FileUtils } from '../utils/file';

/**
 * Git 仓库状态
 */
export interface RepositoryStatus {
  exists: boolean;
  isUpToDate: boolean;
  hasUncommittedChanges: boolean;
  currentBranch: string;
  lastCommit?: string;
}

/**
 * Git 仓库管理器
 */
export class GitRepository {
  private git: SimpleGit;
  private repoPath: string;
  private remoteUrl: string;

  constructor(repoPath: string, remoteUrl: string = 'https://github.com/LeonSGP43/Awesome_ClaudeMD.git') {
    this.repoPath = repoPath;
    this.remoteUrl = remoteUrl;

    const options: Partial<SimpleGitOptions> = {
      baseDir: repoPath,
      binary: 'git',
      maxConcurrentProcesses: 6,
    };

    this.git = simpleGit(options);
  }

  /**
   * 检查仓库是否存在
   */
  async exists(): Promise<boolean> {
    try {
      const gitDir = path.join(this.repoPath, '.git');
      return await FileUtils.exists(gitDir);
    } catch {
      return false;
    }
  }

  /**
   * 克隆仓库
   */
  async clone(): Promise<void> {
    const parentDir = path.dirname(this.repoPath);
    await FileUtils.ensureDir(parentDir);

    const git = simpleGit({ baseDir: parentDir });
    await git.clone(this.remoteUrl, this.repoPath);
  }

  /**
   * 拉取最新更新
   */
  async pull(): Promise<{ updated: boolean; message: string }> {
    try {
      const result = await this.git.pull('origin', 'main');

      if (result.summary.changes === 0) {
        return {
          updated: false,
          message: '✅ 协议已是最新版本'
        };
      }

      return {
        updated: true,
        message: `✅ 协议已更新到最新版本 (${result.summary.changes} 个文件变更)`
      };
    } catch (error: any) {
      return {
        updated: false,
        message: `⚠️ 更新失败: ${error.message}`
      };
    }
  }

  /**
   * 推送变更
   */
  async push(branch: string = 'main'): Promise<void> {
    await this.git.push('origin', branch);
  }

  /**
   * 提交变更
   */
  async commit(message: string, files: string[]): Promise<void> {
    await this.git.add(files);
    await this.git.commit(message);
  }

  /**
   * 获取仓库状态
   */
  async getStatus(): Promise<RepositoryStatus> {
    try {
      const exists = await this.exists();
      if (!exists) {
        return {
          exists: false,
          isUpToDate: false,
          hasUncommittedChanges: false,
          currentBranch: ''
        };
      }

      const status = await this.git.status();
      const branch = await this.git.revparse(['--abbrev-ref', 'HEAD']);
      const log = await this.git.log({ maxCount: 1 });

      return {
        exists: true,
        isUpToDate: status.behind === 0,
        hasUncommittedChanges: !status.isClean(),
        currentBranch: branch.trim(),
        lastCommit: log.latest?.hash
      };
    } catch (error) {
      return {
        exists: false,
        isUpToDate: false,
        hasUncommittedChanges: false,
        currentBranch: ''
      };
    }
  }

  /**
   * 获取最近的提交记录
   */
  async getRecentCommits(count: number = 10): Promise<Array<{
    hash: string;
    date: string;
    message: string;
    author: string;
  }>> {
    const log = await this.git.log({ maxCount: count });

    return log.all.map(commit => ({
      hash: commit.hash.substring(0, 7),
      date: commit.date,
      message: commit.message,
      author: commit.author_name
    }));
  }

  /**
   * 获取文件的最后修改时间
   */
  async getFileLastModified(filePath: string): Promise<Date | null> {
    try {
      const log = await this.git.log({ file: filePath, maxCount: 1 });
      if (log.latest) {
        return new Date(log.latest.date);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 获取变更的文件列表
   */
  async getChangedFiles(pattern?: string): Promise<string[]> {
    const status = await this.git.status();
    const files = [
      ...status.modified,
      ...status.created,
      ...status.not_added
    ];

    if (pattern) {
      return files.filter(file => file.match(pattern));
    }

    return files;
  }

  /**
   * 重置到最新提交
   */
  async reset(): Promise<void> {
    await this.git.reset(['--hard', 'HEAD']);
  }

  /**
   * 获取仓库路径
   */
  getPath(): string {
    return this.repoPath;
  }
}
