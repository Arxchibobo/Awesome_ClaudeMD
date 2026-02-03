import * as path from 'path';
import * as vscode from 'vscode';
import { FileUtils } from '../utils/file';
import { ProtocolParser } from './protocol';
import { NotificationManager } from '../utils/notifications';
import { GitRepository } from '../git/repository';

/**
 * CLAUDE.md 管理器
 * 负责管理项目中的 CLAUDE.md 文件
 */
export class ClaudeMDManager {
  private repository: GitRepository;
  private templatePath: string;

  constructor(repository: GitRepository, templatePath: string) {
    this.repository = repository;
    this.templatePath = templatePath;
  }

  /**
   * 获取当前工作区的 CLAUDE.md 路径
   */
  private getCurrentClaudeMDPath(): string | null {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return null;
    }

    return path.join(workspaceFolders[0].uri.fsPath, 'CLAUDE.md');
  }

  /**
   * 获取仓库中的协议模板路径
   */
  getTemplateProtocolPath(): string {
    return path.join(this.repository.getPath(), 'asinit_AwosomeCLAUDE.md');
  }

  /**
   * 读取协议模板
   */
  async readTemplateProtocol(): Promise<string> {
    const templatePath = this.getTemplateProtocolPath();
    return await FileUtils.readFile(templatePath);
  }

  /**
   * 应用协议到当前项目
   */
  async applyToCurrentProject(): Promise<boolean> {
    const claudeMDPath = this.getCurrentClaudeMDPath();
    if (!claudeMDPath) {
      NotificationManager.warning('当前没有打开的工作区');
      return false;
    }

    try {
      // 读取新协议并提取核心部分
      const templateContent = await this.readTemplateProtocol();
      const parsedTemplate = ProtocolParser.parse(templateContent);

      if (!parsedTemplate.asinitSection) {
        NotificationManager.error('模板协议无效：未找到 ASINIT 标记');
        return false;
      }

      const newProtocol = parsedTemplate.asinitSection;

      // 检查是否已存在 CLAUDE.md
      const exists = await FileUtils.exists(claudeMDPath);

      if (exists) {
        // 合并现有内容
        const currentContent = await FileUtils.readFile(claudeMDPath);
        const mergedContent = ProtocolParser.merge(currentContent, newProtocol);

        // 创建备份
        await FileUtils.backup(claudeMDPath);

        // 写入合并后的内容
        await FileUtils.writeFile(claudeMDPath, mergedContent);

        NotificationManager.success('协议已更新到当前项目');
      } else {
        // 直接创建新文件
        await FileUtils.writeFile(claudeMDPath, newProtocol);
        NotificationManager.success('协议已应用到当前项目');
      }

      // 打开文件
      const document = await vscode.workspace.openTextDocument(claudeMDPath);
      await vscode.window.showTextDocument(document);

      return true;
    } catch (error: any) {
      NotificationManager.error('应用协议失败', error);
      return false;
    }
  }

  /**
   * 导出当前项目的 CLAUDE.md
   */
  async exportCurrentProject(): Promise<boolean> {
    const claudeMDPath = this.getCurrentClaudeMDPath();
    if (!claudeMDPath) {
      NotificationManager.warning('当前没有打开的工作区');
      return false;
    }

    const exists = await FileUtils.exists(claudeMDPath);
    if (!exists) {
      NotificationManager.warning('当前项目没有 CLAUDE.md 文件');
      return false;
    }

    try {
      // 让用户选择导出位置
      const uri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(path.join(vscode.workspace.workspaceFolders![0].uri.fsPath, 'CLAUDE_export.md')),
        filters: {
          'Markdown': ['md']
        }
      });

      if (!uri) {
        return false;
      }

      // 读取并复制文件
      const content = await FileUtils.readFile(claudeMDPath);
      await FileUtils.writeFile(uri.fsPath, content);

      NotificationManager.success(`协议已导出到: ${uri.fsPath}`);
      return true;
    } catch (error: any) {
      NotificationManager.error('导出协议失败', error);
      return false;
    }
  }

  /**
   * 批量应用协议到多个项目
   */
  async batchApply(projectPaths: string[]): Promise<{
    success: number;
    failed: number;
    errors: Array<{ path: string; error: string }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ path: string; error: string }>
    };

    const templateContent = await this.readTemplateProtocol();
    const parsedTemplate = ProtocolParser.parse(templateContent);

    if (!parsedTemplate.asinitSection) {
      throw new Error('模板协议无效：未找到 ASINIT 标记');
    }

    const newProtocol = parsedTemplate.asinitSection;

    for (const projectPath of projectPaths) {
      try {
        const claudeMDPath = path.join(projectPath, 'CLAUDE.md');
        const exists = await FileUtils.exists(claudeMDPath);

        if (exists) {
          const currentContent = await FileUtils.readFile(claudeMDPath);
          const mergedContent = ProtocolParser.merge(currentContent, newProtocol);
          await FileUtils.backup(claudeMDPath);
          await FileUtils.writeFile(claudeMDPath, mergedContent);
        } else {
          await FileUtils.writeFile(claudeMDPath, newProtocol);
        }

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          path: projectPath,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * 查看当前项目的协议状态
   */
  async getStatus(): Promise<{
    exists: boolean;
    hasAsinit: boolean;
    isUpToDate: boolean;
    lastModified?: Date;
  }> {
    const claudeMDPath = this.getCurrentClaudeMDPath();
    if (!claudeMDPath) {
      return {
        exists: false,
        hasAsinit: false,
        isUpToDate: false
      };
    }

    const exists = await FileUtils.exists(claudeMDPath);
    if (!exists) {
      return {
        exists: false,
        hasAsinit: false,
        isUpToDate: false
      };
    }

    const content = await FileUtils.readFile(claudeMDPath);
    const parsed = ProtocolParser.parse(content);
    const lastModified = await FileUtils.getModifiedTime(claudeMDPath);

    // 简单比对是否与模板一致
    const template = await this.readTemplateProtocol();
    const isUpToDate = parsed.asinitSection === template;

    return {
      exists: true,
      hasAsinit: !!parsed.asinitSection,
      isUpToDate,
      lastModified
    };
  }

  /**
   * 验证 CLAUDE.md 文件
   */
  async validate(filePath?: string): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const targetPath = filePath || this.getCurrentClaudeMDPath();
    if (!targetPath) {
      return {
        valid: false,
        errors: ['没有指定文件路径']
      };
    }

    const exists = await FileUtils.exists(targetPath);
    if (!exists) {
      return {
        valid: false,
        errors: ['文件不存在']
      };
    }

    const content = await FileUtils.readFile(targetPath);
    return ProtocolParser.validate(content);
  }
}
