import { FileUtils } from '../utils/file';

/**
 * 协议标记
 */
export const PROTOCOL_MARKERS = {
  START: '<!-- ASINIT START -->',
  END: '<!-- ASINIT END -->',
  CONSTRAINTS_START: '<!-- CONSTRAINTS START -->',
  CONSTRAINTS_END: '<!-- CONSTRAINTS END -->'
};

/**
 * 协议内容接口
 */
export interface ProtocolContent {
  fullContent: string;
  asinitSection?: string;
  constraintsSection?: string;
  customContent?: string;
}

/**
 * 协议解析器
 * 负责解析和操作 CLAUDE.md 文件
 */
export class ProtocolParser {
  /**
   * 解析 CLAUDE.md 文件
   */
  static parse(content: string): ProtocolContent {
    const startRegex = new RegExp(`^${PROTOCOL_MARKERS.START}`, 'm');
    const endRegex = new RegExp(`^${PROTOCOL_MARKERS.END}`, 'm');

    const startMatch = content.match(startRegex);
    const endMatch = content.match(endRegex);

    let startIndex: number;
    let endIndex: number;

    if (!startMatch || !endMatch) {
      startIndex = content.indexOf(PROTOCOL_MARKERS.START);
      endIndex = content.indexOf(PROTOCOL_MARKERS.END);

      if (startIndex === -1 || endIndex === -1) {
        return {
          fullContent: content,
          customContent: content
        };
      }
    } else {
      startIndex = startMatch.index!;
      endIndex = endMatch.index!;
    }

    return this.parseWithIndices(content, startIndex, endIndex);
  }

  private static parseWithIndices(content: string, startIndex: number, endIndex: number): ProtocolContent {
    // 提取 asinit 部分
    const asinitSection = content.substring(
      startIndex,
      endIndex + PROTOCOL_MARKERS.END.length
    );

    // 提取约束部分
    const constraintsStart = asinitSection.indexOf(PROTOCOL_MARKERS.CONSTRAINTS_START);
    const constraintsEnd = asinitSection.indexOf(PROTOCOL_MARKERS.CONSTRAINTS_END);

    let constraintsSection: string | undefined;
    if (constraintsStart !== -1 && constraintsEnd !== -1) {
      constraintsSection = asinitSection.substring(
        constraintsStart,
        constraintsEnd + PROTOCOL_MARKERS.CONSTRAINTS_END.length
      );
    }

    // 提取自定义内容（asinit 之外的部分）
    const customBefore = content.substring(0, startIndex);
    const customAfter = content.substring(endIndex + PROTOCOL_MARKERS.END.length);
    const customContent = (customBefore + customAfter).trim();

    return {
      fullContent: content,
      asinitSection,
      constraintsSection,
      customContent: customContent || undefined
    };
  }

  /**
   * 合并协议内容
   * 用新的 asinit 部分替换旧的，保留自定义内容
   */
  static merge(currentContent: string, newAsinitSection: string): string {
    const parsed = this.parse(currentContent);

    // 如果没有现有的 asinit 部分，插入到文件开头
    if (!parsed.asinitSection) {
      if (parsed.customContent) {
        return `${newAsinitSection}\n\n${parsed.customContent}`;
      }
      return newAsinitSection;
    }

    // 重新解析以获取准确索引
    const currentParsed = this.parse(currentContent);
    const startIndex = currentContent.indexOf(currentParsed.asinitSection!);
    const endIndex = startIndex + currentParsed.asinitSection!.length;

    const before = currentContent.substring(0, startIndex);
    const after = currentContent.substring(endIndex);

    return `${before}${newAsinitSection}${after}`;
  }

  /**
   * 更新约束部分
   */
  static updateConstraints(
    protocolContent: string,
    newConstraints: string
  ): string {
    const constraintsStart = protocolContent.indexOf(PROTOCOL_MARKERS.CONSTRAINTS_START);
    const constraintsEnd = protocolContent.indexOf(PROTOCOL_MARKERS.CONSTRAINTS_END);

    if (constraintsStart === -1 || constraintsEnd === -1) {
      // 如果没有约束标记，添加到 asinit 部分末尾
      const endMarkerIndex = protocolContent.indexOf(PROTOCOL_MARKERS.END);
      if (endMarkerIndex === -1) {
        return protocolContent;
      }

      const before = protocolContent.substring(0, endMarkerIndex);
      const after = protocolContent.substring(endMarkerIndex);

      return `${before}\n\n${PROTOCOL_MARKERS.CONSTRAINTS_START}\n${newConstraints}\n${PROTOCOL_MARKERS.CONSTRAINTS_END}\n\n${after}`;
    }

    // 替换约束部分
    const before = protocolContent.substring(0, constraintsStart);
    const after = protocolContent.substring(constraintsEnd + PROTOCOL_MARKERS.CONSTRAINTS_END.length);

    return `${before}${PROTOCOL_MARKERS.CONSTRAINTS_START}\n${newConstraints}\n${PROTOCOL_MARKERS.CONSTRAINTS_END}${after}`;
  }

  /**
   * 提取约束部分内容（不包含标记）
   */
  static extractConstraints(protocolContent: string): string | null {
    const constraintsStart = protocolContent.indexOf(PROTOCOL_MARKERS.CONSTRAINTS_START);
    const constraintsEnd = protocolContent.indexOf(PROTOCOL_MARKERS.CONSTRAINTS_END);

    if (constraintsStart === -1 || constraintsEnd === -1) {
      return null;
    }

    return protocolContent.substring(
      constraintsStart + PROTOCOL_MARKERS.CONSTRAINTS_START.length,
      constraintsEnd
    ).trim();
  }

  /**
   * 验证协议完整性
   */
  static validate(content: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!content.includes(PROTOCOL_MARKERS.START)) {
      errors.push('缺少 ASINIT START 标记');
    }

    if (!content.includes(PROTOCOL_MARKERS.END)) {
      errors.push('缺少 ASINIT END 标记');
    }

    const startIndex = content.indexOf(PROTOCOL_MARKERS.START);
    const endIndex = content.indexOf(PROTOCOL_MARKERS.END);

    if (startIndex !== -1 && endIndex !== -1 && startIndex > endIndex) {
      errors.push('ASINIT 标记顺序错误');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 从模板文件读取并创建新协议
   */
  static async createFromTemplate(templatePath: string): Promise<string> {
    return await FileUtils.readFile(templatePath);
  }
}
