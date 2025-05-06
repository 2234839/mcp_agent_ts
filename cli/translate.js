#!/usr/bin/env node
import {
  AiService
} from "../chunk-FPFRGKCZ.js";

// src/cli/translate.ts
import { program } from "commander";

// src/ai/translate.ts
import { Effect } from "effect";
function translateText(text, targetLanguage) {
  return Effect.gen(function* () {
    const ai = yield* AiService;
    const completion = yield* Effect.tryPromise({
      try: () => ai.openai.chat.completions.create({
        model: ai.model,
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the following text to ${targetLanguage} while strictly preserving:
1. Original formatting and markdown syntax
2. Technical terms accuracy
3. Any text inside markdown links like \`[\u4E2D\u6587\u6587\u6863](./README_zh.md)\` or \`[English Doc](./README.md)\` MUST REMAIN UNCHANGED
4. Code blocks and inline code snippets MUST NOT be translated

\u7279\u522B\u6CE8\u610F\uFF1A\u5982\u679C\u9047\u5230\u7C7B\u4F3C \`[...\u6587\u6863...](...)\` \u7684Markdown\u94FE\u63A5\uFF0C\u65E0\u8BBA\u5176\u4E2D\u662F\u4EC0\u4E48\u8BED\u8A00\uFF0C\u90FD\u539F\u6837\u4FDD\u7559\u4E0D\u8981\u7FFB\u8BD1`
          },
          { role: "user", content: text }
        ],
        max_tokens: ai.max_tokens,
        temperature: ai.temperature,
        stream: false
      }),
      catch: (e) => new Error(`Translation failed: ${e}`)
    });
    return completion.choices[0].message?.content || "";
  });
}
function translateMarkdownFile(filePath, outputPath, targetLanguage) {
  return Effect.gen(function* () {
    const fs = yield* Effect.promise(() => import("fs/promises"));
    const text = yield* Effect.tryPromise({
      try: () => fs.readFile(filePath, "utf-8"),
      catch: (e) => new Error(`Failed to read file: ${e}`)
    });
    const translated = yield* translateText(text, targetLanguage);
    yield* Effect.tryPromise({
      try: () => fs.writeFile(outputPath, translated),
      catch: (e) => new Error(`Failed to write file: ${e}`)
    });
  });
}

// src/cli/translate.ts
import path from "path";
import { Effect as Effect2 } from "effect";

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

// src/cli/translate.ts
import OpenAI from "openai";
program.name("mcp_agent_ts-translate-md").description("CLI tool to translate markdown files using AI").version("1.0.0");
program.command("translate").description("Translate a markdown file to target language").requiredOption("-i, --input <path>", "Input markdown file path").requiredOption("-o, --output <path>", "Output file path").requiredOption("-l, --language <language>", 'Target language (e.g. "Chinese", "French")').action(async (options) => {
  console.log(`Translating ${options.input} to ${options.language}...`);
  const defaultOpenai = new OpenAI({
    apiKey: Env.default_apiKey,
    baseURL: Env.default_apiBaseUrl
  });
  const r = await Effect2.runPromise(
    translateMarkdownFile(
      path.resolve(options.input),
      path.resolve(options.output),
      options.language
    ).pipe(
      Effect2.provideService(AiService, {
        openai: defaultOpenai,
        model: Env.default_model
      })
    )
  );
  console.log(`Translation saved to ${options.output}`);
});
program.parseAsync(process.argv).catch(console.error);
//# sourceMappingURL=translate.js.map