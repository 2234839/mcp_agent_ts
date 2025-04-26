import { Effect, Context } from 'effect';
import { AiService } from '../service';

export function translateText(
  text: string,
  targetLanguage: string
): Effect.Effect<string, Error, AiService> {
  return Effect.gen(function* () {
    const ai = yield* AiService;

    const completion = yield* Effect.tryPromise({
      try: () => ai.openai.chat.completions.create({
        model: ai.model,
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following text to ${targetLanguage} while strictly preserving:
1. Original formatting and markdown syntax
2. Technical terms accuracy
3. Any text inside markdown links like \`[中文文档](./README_zh.md)\` or \`[English Doc](./README.md)\` MUST REMAIN UNCHANGED
4. Code blocks and inline code snippets MUST NOT be translated

特别注意：如果遇到类似 \`[...文档...](...)\` 的Markdown链接，无论其中是什么语言，都原样保留不要翻译`
          },
          { role: 'user', content: text }
        ],
        max_tokens: ai.max_tokens,
        temperature: ai.temperature,
        stream: false
      }),
      catch: (e) => new Error(`Translation failed: ${e}`)
    });

    return completion.choices[0].message?.content || '';
  });
}

export function translateMarkdownFile(
  filePath: string,
  outputPath: string,
  targetLanguage: string
): Effect.Effect<void, Error, AiService> {
  return Effect.gen(function* () {
    const fs = yield* Effect.promise(() => import('fs/promises'));
    const text = yield* Effect.tryPromise({
      try: () => fs.readFile(filePath, 'utf-8'),
      catch: (e) => new Error(`Failed to read file: ${e}`)
    });
    const translated = yield* translateText(text, targetLanguage);
    yield* Effect.tryPromise({
      try: () => fs.writeFile(outputPath, translated),
      catch: (e) => new Error(`Failed to write file: ${e}`)
    });
  });
}
