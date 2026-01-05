import { BedrockClient } from '../ai/bedrock';
import { ProtocolParser } from './protocol';
import { TipsManager } from './tips';
import { FileUtils } from '../utils/file';
import * as path from 'path';

/**
 * Tips 整合结果
 */
export interface IntegrationResult {
  success: boolean;
  updatedProtocol?: string;
  updatedTipsReadme?: string;
  summary?: string;
  securityIssues?: string[];
  error?: string;
}

/**
 * Tips 整合引擎
 * 将新的 Tips 整合到协议文档中
 */
export class TipsIntegrator {
  private bedrockClient: BedrockClient | null = null;
  private tipsManager: TipsManager;
  private protocolPath: string;

  constructor(
    tipsManager: TipsManager,
    protocolPath: string,
    bedrockClient?: BedrockClient
  ) {
    this.tipsManager = tipsManager;
    this.protocolPath = protocolPath;
    this.bedrockClient = bedrockClient || null;
  }

  /**
   * 整合 Tips
   */
  async integrate(): Promise<IntegrationResult> {
    if (!this.bedrockClient) {
      return {
        success: false,
        error: '未配置 AWS Bedrock 客户端，无法自动整合'
      };
    }

    try {
      // 获取待整合的 Tips
      const pendingTips = await this.tipsManager.getPendingTips();

      if (pendingTips.length === 0) {
        return {
          success: true,
          summary: '没有待整合的 Tips'
        };
      }

      // 读取当前协议和 README
      const currentProtocol = await FileUtils.readFile(this.protocolPath);
      const tipsReadme = await this.tipsManager.getTipsReadme();

      // 构建提示词
      const prompt = this.buildPrompt(currentProtocol, pendingTips, tipsReadme);

      // 调用 Claude 进行整合
      const response = await this.bedrockClient.invokeModel(prompt);

      // 解析响应
      const result = this.parseResponse(response);

      if (!result.success) {
        return result;
      }

      // 验证输出完整性
      const validation = ProtocolParser.validate(result.updatedProtocol!);
      if (!validation.valid) {
        throw new Error(`输出验证失败: ${validation.errors.join(', ')}`);
      }

      // 创建备份
      await FileUtils.backup(this.protocolPath);

      // 写入更新后的文件
      await FileUtils.writeFile(this.protocolPath, result.updatedProtocol!);
      await this.tipsManager.updateTipsReadme(result.updatedTipsReadme!);

      // 归档已整合的 Tips
      for (const tip of pendingTips) {
        await this.tipsManager.archiveTip(tip.filePath);
      }

      // 删除备份
      await require('fs/promises').unlink(`${this.protocolPath}.bak`);

      return result;
    } catch (error: any) {
      // 恢复备份
      try {
        await FileUtils.restoreFromBackup(
          this.protocolPath,
          `${this.protocolPath}.bak`
        );
      } catch {
        // 忽略恢复失败
      }

      return {
        success: false,
        error: `整合失败: ${error.message}`
      };
    }
  }

  /**
   * 构建提示词
   */
  private buildPrompt(
    currentProtocol: string,
    tips: Array<{ content: string; fileName: string }>,
    tipsReadme: string
  ): string {
    const tipsContent = tips
      .map(tip => `### ${tip.fileName}\n${tip.content}`)
      .join('\n---\n');

    return `# 任务
将 tips 整合到协议文档的约束部分。

# 规则
1. 只能修改 <!-- CONSTRAINTS START --> 和 <!-- CONSTRAINTS END --> 之间的内容
2. 其他部分保持不变
3. 新约束用 ### 标题格式
4. 重复内容跳过或合并

# 当前协议
${currentProtocol}

# 新 Tips
${tipsContent}

# tips/README.md
${tipsReadme}

# 输出格式要求
返回一个有效的 JSON 对象。注意：
- JSON 字符串中的换行符必须转义为 \\n
- JSON 字符串中的双引号必须转义为 \\"
- JSON 字符串中的反斜杠必须转义为 \\\\
- 代码块中的反引号 \` 保持原样，但确保整个字符串是有效的 JSON

输出格式：
{
  "updatedProtocol": "完整协议内容（所有换行转义为\\\\n）",
  "updatedTipsReadme": "完整 README 内容（所有换行转义为\\\\n）",
  "summary": "处理摘要",
  "securityIssues": []
}

直接输出 JSON，不要用 markdown 代码块包裹。`;
  }

  /**
   * 解析 Claude 响应
   */
  private parseResponse(response: string): IntegrationResult {
    try {
      // 提取 JSON
      let jsonStr = response;

      // 方法1: 基于括号匹配提取
      const firstOpen = response.indexOf('{');
      const lastClose = response.lastIndexOf('}');

      if (firstOpen !== -1 && lastClose > firstOpen) {
        jsonStr = response.substring(firstOpen, lastClose + 1);
      } else {
        // 方法2: 尝试提取代码块
        const codeBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1];
        }
      }

      // 解析 JSON
      const parsed = JSON.parse(jsonStr);

      return {
        success: true,
        updatedProtocol: parsed.updatedProtocol,
        updatedTipsReadme: parsed.updatedTipsReadme,
        summary: parsed.summary,
        securityIssues: parsed.securityIssues || []
      };
    } catch (error: any) {
      return {
        success: false,
        error: `响应解析失败: ${error.message}`
      };
    }
  }

  /**
   * 手动整合单个 Tip（不使用 AI）
   */
  async manualIntegrate(
    tipContent: string,
    constraintsSection: string
  ): Promise<string> {
    // 简单地将 tip 内容追加到约束部分
    return `${constraintsSection}\n\n${tipContent}`.trim();
  }
}
