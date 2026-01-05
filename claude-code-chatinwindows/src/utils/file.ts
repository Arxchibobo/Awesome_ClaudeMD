import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * 文件工具类
 */
export class FileUtils {
  /**
   * 检查文件是否存在
   */
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 读取文件内容
   */
  static async readFile(filePath: string): Promise<string> {
    return await fs.readFile(filePath, 'utf-8');
  }

  /**
   * 写入文件内容
   */
  static async writeFile(filePath: string, content: string): Promise<void> {
    await fs.writeFile(filePath, content, 'utf-8');
  }

  /**
   * 确保目录存在
   */
  static async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error: any) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * 复制文件
   */
  static async copyFile(src: string, dest: string): Promise<void> {
    await fs.copyFile(src, dest);
  }

  /**
   * 创建备份文件
   */
  static async backup(filePath: string): Promise<string> {
    const backupPath = `${filePath}.bak`;
    if (await this.exists(filePath)) {
      await this.copyFile(filePath, backupPath);
    }
    return backupPath;
  }

  /**
   * 从备份恢复文件
   */
  static async restoreFromBackup(filePath: string, backupPath: string): Promise<void> {
    if (await this.exists(backupPath)) {
      await this.copyFile(backupPath, filePath);
      await fs.unlink(backupPath);
    }
  }

  /**
   * 安全路径验证（防止路径遍历攻击）
   */
  static validatePath(basePath: string, targetPath: string): string {
    const normalized = path.normalize(targetPath).replace(/^(\.\.[/\\])+/, '');
    const absolute = path.resolve(basePath, normalized);

    if (!absolute.startsWith(basePath)) {
      throw new Error(`安全错误：禁止访问基础目录外的文件: ${targetPath}`);
    }

    return absolute;
  }

  /**
   * 列出目录下的文件
   */
  static async listFiles(
    dirPath: string,
    options?: {
      extensions?: string[];
      recursive?: boolean;
    }
  ): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (options?.recursive) {
          const subFiles = await this.listFiles(fullPath, options);
          files.push(...subFiles);
        }
      } else if (entry.isFile()) {
        if (!options?.extensions || options.extensions.includes(path.extname(entry.name))) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  /**
   * 获取文件修改时间
   */
  static async getModifiedTime(filePath: string): Promise<Date> {
    const stats = await fs.stat(filePath);
    return stats.mtime;
  }
}
