#!/usr/bin/env node
import "../chunk-FPFRGKCZ.js";

// src/cli/translate.ts
import { program } from "commander";

// src/ai/openai.ts
import { Effect } from "effect";
import { OpenAI } from "openai";

// src/env/index.ts
import { config } from "dotenv";
var { parsed: env } = config();
var Env = {
  default_apiKey: env.default_apiKey,
  default_apiBaseUrl: env.default_apiBaseUrl,
  default_model: env.default_model,
  default_max_tokens: Number(env.default_max_tokens),
  default_temperature: Number(env.default_temperature),
  // 用于单元测试的环境变量
  bigmodel_apiKey: env.bigmodel_apiKey,
  bigmodel_apiBaseUrl: env.bigmodel_apiBaseUrl,
  // 思源配置
  siyuan_baseUrl: env.siyuan_baseUrl,
  siyuan_apiKey: env.siyuan_apiKey
};

// src/ai/openai.ts
var configuration = {
  apiKey: Env.default_apiKey,
  baseURL: Env.default_apiBaseUrl
};
var defaultOpenai = new OpenAI(configuration);

// src/ai/translate.ts
async function translateText(text, options) {
  const openai = options.openai || defaultOpenai;
  const model = options.model || "GLM-4-Flash";
  const max_tokens = options.max_tokens || 9999;
  const temperature = options.temperature || 0.3;
  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `You are a professional translator. Translate the following text to ${options.targetLanguage} while strictly preserving:
1. Original formatting and markdown syntax
2. Technical terms accuracy
3. Any text inside markdown links like \`[\u4E2D\u6587\u6587\u6863](./README_zh.md)\` or \`[English Doc](./README.md)\` MUST REMAIN UNCHANGED
4. Code blocks and inline code snippets MUST NOT be translated

\u7279\u522B\u6CE8\u610F\uFF1A\u5982\u679C\u9047\u5230\u7C7B\u4F3C \`[...\u6587\u6863...](...)\` \u7684Markdown\u94FE\u63A5\uFF0C\u65E0\u8BBA\u5176\u4E2D\u662F\u4EC0\u4E48\u8BED\u8A00\uFF0C\u90FD\u539F\u6837\u4FDD\u7559\u4E0D\u8981\u7FFB\u8BD1`
      },
      { role: "user", content: text }
    ],
    max_tokens,
    temperature,
    stream: false
  });
  return completion.choices[0].message?.content || "";
}
async function translateMarkdownFile(filePath, outputPath, options) {
  const fs = await import("fs/promises");
  const text = await fs.readFile(filePath, "utf-8");
  const translated = await translateText(text, options);
  await fs.writeFile(outputPath, translated);
}

// src/cli/translate.ts
import path from "path";
program.name("mcp_agent_ts-translate-md").description("CLI tool to translate markdown files using AI").version("1.0.0");
program.command("translate").description("Translate a markdown file to target language").requiredOption("-i, --input <path>", "Input markdown file path").requiredOption("-o, --output <path>", "Output file path").requiredOption("-l, --language <language>", 'Target language (e.g. "Chinese", "French")').action(async (options) => {
  try {
    console.log(`Translating ${options.input} to ${options.language}...`);
    await translateMarkdownFile(
      path.resolve(options.input),
      path.resolve(options.output),
      { targetLanguage: options.language }
    );
    console.log(`Translation saved to ${options.output}`);
  } catch (error) {
    console.error("Translation failed:", error);
    process.exit(1);
  }
});
program.parseAsync(process.argv).catch(console.error);
//# sourceMappingURL=translate.js.map