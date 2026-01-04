const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");

const client = new Anthropic();

async function main() {
  const changedFiles = process.argv[2]?.split("\n").filter(Boolean) || [];

  if (changedFiles.length === 0) {
    console.log("No new tips to integrate");
    return;
  }

  console.log("Changed tips files:", changedFiles);

  // 读取新增的 tips 内容
  const newTips = changedFiles
    .map((file) => {
      const content = fs.readFileSync(file, "utf-8");
      return `### 文件: ${file}\n${content}`;
    })
    .join("\n\n---\n\n");

  // 读取当前核心协议
  const currentProtocol = fs.readFileSync("asinit_AwosomeCLAUDE.md", "utf-8");

  // 读取 tips README
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
4. 更新 tips/README.md 中的"已整合的 Tips"表格，添加已处理的文件记录

## 输出格式

请严格按以下 JSON 格式输出：
\`\`\`json
{
  "updatedProtocol": "完整的更新后的 asinit_AwosomeCLAUDE.md 内容",
  "updatedTipsReadme": "完整的更新后的 tips/README.md 内容",
  "summary": "简要说明做了哪些整合"
}
\`\`\`

注意：
- 只修改 CONSTRAINTS START/END 之间的内容
- 不要修改"标准执行流程"部分
- 保持文档结构清晰
- 只输出 JSON，不要有其他内容`;

  console.log("Calling Claude API...");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0].text;

  // 提取 JSON
  const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
  if (!jsonMatch) {
    console.error("Failed to parse Claude response");
    console.log("Response:", content);
    process.exit(1);
  }

  const result = JSON.parse(jsonMatch[1]);

  // 写入更新后的文件
  fs.writeFileSync("asinit_AwosomeCLAUDE.md", result.updatedProtocol);
  fs.writeFileSync("tips/README.md", result.updatedTipsReadme);

  console.log("Integration complete!");
  console.log("Summary:", result.summary);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
