const { execSync } = require("child_process");
const fs = require("fs").promises;
const path = require("path");

// 配置
const CONFIG = {
  MODEL_ID: "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
  REGION: process.env.AWS_REGION || "us-west-1",
  PROTOCOL_FILE: "asinit_AwosomeCLAUDE.md",
  TIPS_README: "tips/README.md",
  TIPS_ARCHIVED: "tips/archived",
  ALLOWED_EXTENSIONS: [".md"],
};

async function invokeClaudeBedrock(prompt) {
  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 16384,
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
  });

  // 写入临时文件避免命令行长度限制
  const tmpFile = "/tmp/bedrock-request.json";
  const outFile = "/tmp/bedrock-response.json";
  require("fs").writeFileSync(tmpFile, body);

  const cmd = `aws bedrock-runtime invoke-model \
    --model-id "${CONFIG.MODEL_ID}" \
    --region "${CONFIG.REGION}" \
    --content-type "application/json" \
    --accept "application/json" \
    --body "file://${tmpFile}" \
    "${outFile}"`;

  console.log("调用 AWS CLI...");
  execSync(cmd, { stdio: "inherit" });

  const response = JSON.parse(require("fs").readFileSync(outFile, "utf-8"));
  return response.content[0].text;
}

// 安全：验证文件路径
function validateFilePath(filePath) {
  const normalized = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const absolutePath = path.resolve(normalized);
  const cwd = process.cwd();

  if (!absolutePath.startsWith(cwd)) {
    throw new Error(`安全错误：禁止访问工作目录外的文件: ${filePath}`);
  }
  if (!CONFIG.ALLOWED_EXTENSIONS.includes(path.extname(absolutePath))) {
    throw new Error(`安全错误：不允许的文件扩展名: ${filePath}`);
  }
  return normalized;
}

function buildPrompt(currentProtocol, newTips, tipsReadme) {
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
${newTips}

# tips/README.md
${tipsReadme}

# 输出 JSON
\`\`\`json
{
  "updatedProtocol": "完整协议内容",
  "updatedTipsReadme": "完整 README 内容", 
  "summary": "处理摘要",
  "securityIssues": []
}
\`\`\``;
}

async function main() {
  const changedFiles = (process.argv[2] || "").split("\n").filter(Boolean);
  if (changedFiles.length === 0) {
    console.log("No tips to integrate");
    return;
  }

  console.log("Tips files:", changedFiles);

  // 读取 tips
  const tips = [];
  for (const file of changedFiles) {
    try {
      const cleanPath = validateFilePath(file);
      const content = await fs.readFile(cleanPath, "utf-8");
      tips.push(`### ${cleanPath}\n${content}`);
    } catch (err) {
      console.warn(`跳过 ${file}: ${err.message}`);
    }
  }

  if (tips.length === 0) {
    console.log("No valid tips");
    return;
  }

  // 读取现有文档
  const [currentProtocol, tipsReadme] = await Promise.all([
    fs.readFile(CONFIG.PROTOCOL_FILE, "utf-8"),
    fs.readFile(CONFIG.TIPS_README, "utf-8"),
  ]);

  // 备份
  await fs.writeFile(`${CONFIG.PROTOCOL_FILE}.bak`, currentProtocol);

  const prompt = buildPrompt(currentProtocol, tips.join("\n---\n"), tipsReadme);
  console.log("Prompt length:", prompt.length);

  try {
    const content = await invokeClaudeBedrock(prompt);

    let jsonStr = content;
    const match = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (match) jsonStr = match[1];

    const result = JSON.parse(jsonStr);

    if (!result.updatedProtocol.includes("<!-- ASINIT START -->")) {
      throw new Error("输出缺少 ASINIT 标记");
    }

    await fs.writeFile(CONFIG.PROTOCOL_FILE, result.updatedProtocol);
    await fs.writeFile(CONFIG.TIPS_README, result.updatedTipsReadme);

    // 归档
    await fs.mkdir(CONFIG.TIPS_ARCHIVED, { recursive: true });
    const today = new Date().toISOString().split("T")[0];
    for (const file of changedFiles) {
      try {
        const cleanPath = validateFilePath(file);
        const fileName = path.basename(cleanPath, ".md");
        const dest = path.join(CONFIG.TIPS_ARCHIVED, `${fileName}_${today}.md`);
        await fs.rename(cleanPath, dest);
        console.log(`归档: ${cleanPath} → ${dest}`);
      } catch (err) {
        console.warn(`归档失败 ${file}: ${err.message}`);
      }
    }

    await fs.unlink(`${CONFIG.PROTOCOL_FILE}.bak`);
    console.log("✅ 完成!", result.summary);
  } catch (err) {
    console.error("失败:", err.message);
    await fs.copyFile(`${CONFIG.PROTOCOL_FILE}.bak`, CONFIG.PROTOCOL_FILE).catch(() => {});
    process.exit(1);
  }
}

main();
