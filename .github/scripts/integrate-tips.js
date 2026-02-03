const fs = require("fs").promises;
const path = require("path");
const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");

// 配置
const CONFIG = {
  // 使用当前可用的模型 ID
  MODEL_ID: "anthropic.claude-3-5-sonnet-20240620-v1:0",
  REGION: process.env.AWS_REGION || "us-west-1",
  PROTOCOL_FILE: "asinit_AwosomeCLAUDE.md",
  TIPS_README: "tips/README.md",
  TIPS_ARCHIVED: "tips/archived",
  ALLOWED_EXTENSIONS: [".md"],
};

/**
 * 使用 AWS SDK 调用 Bedrock
 */
async function invokeClaudeBedrock(prompt) {
  const client = new BedrockRuntimeClient({
    region: CONFIG.REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const body = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 16384,
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
  };

  const command = new InvokeModelCommand({
    modelId: CONFIG.MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(body),
  });

  console.log(`正在调用 Bedrock 模型: ${CONFIG.MODEL_ID}...`);
  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  if (responseBody.content && responseBody.content.length > 0) {
    console.log("Claude 响应成功，内容长度:", responseBody.content[0].text.length);
    return responseBody.content[0].text;
  }

  throw new Error("Bedrock 响应格式无效");
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

# 输出格式要求
返回一个有效的 JSON 对象。注意：
- JSON 字符串中的换行符必须转义为 \\n
- JSON 字符串中的双引号必须转义为 \\"
- JSON 字符串中的反斜杠必须转义为 \\\\
- 代码块中的反引号 \` 保持原样，但确保整个字符串是有效的 JSON

输出格式：
{
  "updatedProtocol": "完整协议内容（所有换行转义为\\n）",
  "updatedTipsReadme": "完整 README 内容（所有换行转义为\\n）", 
  "summary": "处理摘要",
  "securityIssues": []
}

直接输出 JSON，不要用 markdown 代码块包裹。`;
}

async function main() {
  const args = process.argv[2] || "";
  const changedFiles = args.split(/\s+/).filter(Boolean);

  if (changedFiles.length === 0) {
    console.log("没有需要处理的 tips");
    return;
  }

  console.log("待处理的 Tips 文件:", changedFiles);

  // 读取 tips
  const tips = [];
  for (const file of changedFiles) {
    try {
      const cleanPath = validateFilePath(file);
      if (!(await fs.stat(cleanPath).catch(() => null))?.isFile()) {
        console.warn(`跳过不存在的文件: ${file}`);
        continue;
      }
      const content = await fs.readFile(cleanPath, "utf-8");
      tips.push(`### ${cleanPath}\n${content}`);
    } catch (err) {
      console.warn(`跳过 ${file}: ${err.message}`);
    }
  }

  if (tips.length === 0) {
    console.log("没有有效的 tips 需要整合");
    return;
  }

  // 读取现有文档
  const [currentProtocol, tipsReadme] = await Promise.all([
    fs.readFile(CONFIG.PROTOCOL_FILE, "utf-8"),
    fs.readFile(CONFIG.TIPS_README, "utf-8"),
  ]);

  // 备份
  const backupFile = `${CONFIG.PROTOCOL_FILE}.bak`;
  await fs.writeFile(backupFile, currentProtocol);

  const prompt = buildPrompt(currentProtocol, tips.join("\n---\n"), tipsReadme);

  try {
    const content = await invokeClaudeBedrock(prompt);
    
    // 提取并解析 JSON
    let result;
    try {
      const firstOpen = content.indexOf('{');
      const lastClose = content.lastIndexOf('}');

      if (firstOpen === -1 || lastClose <= firstOpen) {
        throw new Error("未在响应中找到 JSON 结构");
      }

      const jsonStr = content.substring(firstOpen, lastClose + 1);
      result = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("JSON 解析失败，原始内容:", content);
      throw new Error(`无法解析 Claude 返回的 JSON: ${parseErr.message}`);
    }

    if (!result.updatedProtocol || !result.updatedProtocol.includes("<!-- ASINIT START -->")) {
      throw new Error("输出内容不完整或缺少 ASINIT 标记");
    }

    await fs.writeFile(CONFIG.PROTOCOL_FILE, result.updatedProtocol);
    await fs.writeFile(CONFIG.TIPS_README, result.updatedTipsReadme);

    // 归档
    await fs.mkdir(CONFIG.TIPS_ARCHIVED, { recursive: true });
    const today = new Date().toISOString().split("T")[0];
    for (const file of changedFiles) {
      try {
        const cleanPath = validateFilePath(file);
        if (await fs.stat(cleanPath).catch(() => null)) {
          const fileName = path.basename(cleanPath, ".md");
          const dest = path.join(CONFIG.TIPS_ARCHIVED, `${fileName}_${today}.md`);
          await fs.rename(cleanPath, dest);
          console.log(`归档成功: ${cleanPath} → ${dest}`);
        }
      } catch (err) {
        console.warn(`归档失败 ${file}: ${err.message}`);
      }
    }

    await fs.unlink(backupFile);
    console.log("✅ 整合完成!", result.summary);
  } catch (err) {
    console.error("❌ 整合失败:", err.message);
    if (await fs.stat(backupFile).catch(() => null)) {
      await fs.copyFile(backupFile, CONFIG.PROTOCOL_FILE);
      await fs.unlink(backupFile);
      console.log("已从备份恢复原始协议文件");
    }
    process.exit(1);
  }
}

main().catch(err => {
  console.error("未捕获的错误:", err);
  process.exit(1);
});
