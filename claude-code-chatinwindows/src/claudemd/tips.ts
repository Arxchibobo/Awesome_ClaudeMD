import * as path from 'path';
import { FileUtils } from '../utils/file';
import { GitRepository } from '../git/repository';

/**
 * Tip 信息接口
 */
export interface TipInfo {
  fileName: string;
  filePath: string;
  title: string;
  content: string;
  author: string;
  status: 'pending' | 'integrated' | 'archived';
  createdAt?: Date;
  integratedAt?: Date;
}

/**
 * Tips 管理器
 */
export class TipsManager {
  private repository: GitRepository;
  private tipsDir: string;
  private archivedDir: string;

  constructor(repository: GitRepository) {
    this.repository = repository;
    this.tipsDir = path.join(repository.getPath(), 'tips');
    this.archivedDir = path.join(this.tipsDir, 'archived');
  }

  /**
   * 列出所有 Tips
   */
  async listTips(): Promise<TipInfo[]> {
    const tips: TipInfo[] = [];

    // 读取 tips 目录
    const files = await FileUtils.listFiles(this.tipsDir, {
      extensions: ['.md'],
      recursive: false
    });

    // 过滤掉 README 和模板
    const tipFiles = files.filter(file => {
      const name = path.basename(file);
      return name !== 'README.md' && name !== '_template.md';
    });

    for (const file of tipFiles) {
      const tip = await this.parseTip(file);
      if (tip) {
        tips.push(tip);
      }
    }

    // 读取已归档的 tips
    const archivedExists = await FileUtils.exists(this.archivedDir);
    if (archivedExists) {
      const archivedFiles = await FileUtils.listFiles(this.archivedDir, {
        extensions: ['.md']
      });

      for (const file of archivedFiles) {
        const tip = await this.parseTip(file, 'archived');
        if (tip) {
          tips.push(tip);
        }
      }
    }

    return tips;
  }

  /**
   * 解析单个 Tip 文件
   */
  private async parseTip(filePath: string, status: 'pending' | 'archived' = 'pending'): Promise<TipInfo | null> {
    try {
      const content = await FileUtils.readFile(filePath);
      const fileName = path.basename(filePath);

      // 从文件名提取作者 (格式: 主题-作者.md)
      const match = fileName.match(/^(.+)-(.+)\.md$/);
      const title = match ? match[1] : fileName.replace('.md', '');
      const author = match ? match[2] : 'Unknown';

      // 获取文件创建时间
      const modifiedTime = await FileUtils.getModifiedTime(filePath);

      // 检查是否已归档
      let integratedAt: Date | undefined;
      if (status === 'archived') {
        // 从文件名提取归档日期 (格式: 原文件名_2026-01-05.md)
        const dateMatch = fileName.match(/_(\d{4}-\d{2}-\d{2})\.md$/);
        if (dateMatch) {
          integratedAt = new Date(dateMatch[1]);
        }
      }

      return {
        fileName,
        filePath,
        title,
        content,
        author,
        status: status === 'archived' ? 'integrated' : 'pending',
        createdAt: modifiedTime,
        integratedAt
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * 创建新 Tip
   */
  async createTip(title: string, content: string, author: string): Promise<string> {
    // 生成文件名: 主题-作者.md
    const fileName = `${title.replace(/\s+/g, '-')}-${author}.md`;
    const filePath = path.join(this.tipsDir, fileName);

    // 检查文件是否已存在
    if (await FileUtils.exists(filePath)) {
      throw new Error('相同名称的 Tip 已存在');
    }

    // 写入文件
    await FileUtils.writeFile(filePath, content);

    return filePath;
  }

  /**
   * 读取 Tip 模板
   */
  async getTemplate(): Promise<string> {
    const templatePath = path.join(this.tipsDir, '_template.md');
    return await FileUtils.readFile(templatePath);
  }

  /**
   * 更新 Tip
   */
  async updateTip(filePath: string, content: string): Promise<void> {
    await FileUtils.writeFile(filePath, content);
  }

  /**
   * 删除 Tip
   */
  async deleteTip(filePath: string): Promise<void> {
    const fs = require('fs/promises');
    await fs.unlink(filePath);
  }

  /**
   * 获取待整合的 Tips
   */
  async getPendingTips(): Promise<TipInfo[]> {
    const allTips = await this.listTips();
    return allTips.filter(tip => tip.status === 'pending');
  }

  /**
   * 获取已整合的 Tips
   */
  async getIntegratedTips(): Promise<TipInfo[]> {
    const allTips = await this.listTips();
    return allTips.filter(tip => tip.status === 'integrated');
  }

  /**
   * 读取 tips/README.md
   */
  async getTipsReadme(): Promise<string> {
    const readmePath = path.join(this.tipsDir, 'README.md');
    return await FileUtils.readFile(readmePath);
  }

  /**
   * 更新 tips/README.md
   */
  async updateTipsReadme(content: string): Promise<void> {
    const readmePath = path.join(this.tipsDir, 'README.md');
    await FileUtils.writeFile(readmePath, content);
  }

  /**
   * 归档 Tip（移动到 archived 目录）
   */
  async archiveTip(tipPath: string): Promise<string> {
    const fs = require('fs/promises');

    // 确保 archived 目录存在
    await FileUtils.ensureDir(this.archivedDir);

    // 生成归档文件名（添加日期后缀）
    const fileName = path.basename(tipPath, '.md');
    const today = new Date().toISOString().split('T')[0];
    const archivedFileName = `${fileName}_${today}.md`;
    const archivedPath = path.join(this.archivedDir, archivedFileName);

    // 移动文件
    await fs.rename(tipPath, archivedPath);

    return archivedPath;
  }

  /**
   * 获取最近变更的 Tips（用于自动整合）
   */
  async getRecentlyChangedTips(): Promise<string[]> {
    return await this.repository.getChangedFiles('tips/*.md');
  }
}
