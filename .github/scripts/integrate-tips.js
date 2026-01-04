const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");
const fs = require("fs");

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-west-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function invokeClaudeBedrock(prompt) {
  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-sonnet-4-20250514-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  return responseBody.content[0].text;
}

async function main() {
  const changedFiles = process.argv[2]?.split("\n").filter(Boolean) || [];

  if (changedFiles.length === 0) {
    console.log("No new tips to integrate");
    return;
  }

  console.log("Changed tips files:", changedFiles);

  const newTips = changedFiles
    .map((file) => {
      const content = fs.readFileSync(file, "utf-8");
      return `### 文件: ${file}\n${content}`;
    })
    .join("\n\n---\n\n");

  const currentProtocol = fs.readFileSync("asinit_AwosomeCLAUDE.md", "utf-8");
  const tipsReadme = fs.readFileSync("tips/README.md", "utf-8");

  const prompt = `你是一个文档整合助手。请帮我将新的 tips 整合到核心协议文档的"规范约束"部分。

## 当前核心协议文档
\`\`\`markdown
${currentProtocol}
\`\`\`

## 新增的 Tips
${newTips}

## 当前 tips/README.md
\`\`\`markdown
${tipsReadme}
\`\`\`

## 任务

1. 分析新增的 tips 内容
2. 判断每条 tip：
   - 若与"规范约束"部分已有条目重复 → 跳过或合并优化
   - 若是新内容 → 添加到 \`<!-- CONSTRAINTS START -->\` 和 \`<!-- CONSTRAINTS END -->\` 标记之间
3. 新增的约束应该作为独立的小节（### 标题），与现有约束平级
4. 更新 tips/README.md 中的"已整合的 Tips"表格

## 输出格式

请严格按以下 JSON 格式输出：
\`\`\`json
{
  "updatedProtocol": "完整的更新后的 asinit_AwosomeCLAUDE.md 内容",
  "updatedTipsReadme": "完整的更新后的 tips/README.md 内容",
  "summary": "简要说明做了哪些整合"
}
\`\`\`

只输出 JSON，不要有其他内容`;

  console.log("Calling Claude via AWS Bedrock...");

  const content = await invokeClaudeBedrock(prompt);

  const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
  if (!jsonMatch) {
    console.error("Failed to parse Claude response");
    console.log("Response:", content);
    process.exit(1);
  }

  const result = JSON.parse(jsonMatch[1]);

  fs.writeFileSync("asinit_AwosomeCLAUDE.md", result.updatedProtocol);
  fs.writeFileSync("tips/README.md", result.updatedTipsReadme);

  console.log("Integration complete!");
  console.log("Summary:", result.summary);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
