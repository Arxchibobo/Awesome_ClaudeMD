import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput
} from '@aws-sdk/client-bedrock-runtime';

/**
 * AWS Bedrock 配置
 */
export interface BedrockConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  modelId?: string;
}

/**
 * AWS Bedrock 客户端
 */
export class BedrockClient {
  private client: BedrockRuntimeClient;
  private modelId: string;

  constructor(config: BedrockConfig) {
    const clientConfig: any = {
      region: config.region
    };

    // 如果提供了凭证，则使用；否则使用环境变量或 IAM 角色
    if (config.accessKeyId && config.secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      };
    }

    this.client = new BedrockRuntimeClient(clientConfig);
    this.modelId = config.modelId || 'us.anthropic.claude-sonnet-4-5-20250929-v1:0';
  }

  /**
   * 调用 Claude 模型
   */
  async invokeModel(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<string> {
    const body = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: options?.maxTokens || 16384,
      temperature: options?.temperature || 0,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    const input: InvokeModelCommandInput = {
      modelId: this.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(body)
    };

    try {
      const command = new InvokeModelCommand(input);
      const response = await this.client.send(command);

      // 解析响应
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      if (responseBody.content && responseBody.content.length > 0) {
        return responseBody.content[0].text;
      }

      throw new Error('响应格式无效');
    } catch (error: any) {
      throw new Error(`Bedrock 调用失败: ${error.message}`);
    }
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.invokeModel('测试连接', { maxTokens: 10 });
      return true;
    } catch {
      return false;
    }
  }
}
