import { OpenAI } from 'openai';
import { Env } from '../env';
import { defaultOpenai } from './openai';

export interface TranslateOptions {
  openai?: OpenAI;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  targetLanguage: string;
}

export async function translateText(
  text: string,
  options: TranslateOptions
): Promise<string> {
  const openai = options.openai || defaultOpenai;
  const model = options.model || Env.default_model;
  const max_tokens = options.max_tokens
  const temperature = options.temperature || 0.3;

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: `You are a professional translator. Translate the following text to ${options.targetLanguage} while strictly preserving:
1. Original formatting and markdown syntax
2. Technical terms accuracy
3. Any text inside markdown links like \`[中文文档](./README_zh.md)\` or \`[English Doc](./README.md)\` MUST REMAIN UNCHANGED
4. Code blocks and inline code snippets MUST NOT be translated

特别注意：如果遇到类似 \`[...文档...](...)\` 的Markdown链接，无论其中是什么语言，都原样保留不要翻译`
      },
      { role: 'user', content: text }
    ],
    max_tokens,
    temperature,
    stream: false
  });

  return completion.choices[0].message?.content || '';
}

export async function translateMarkdownFile(
  filePath: string,
  outputPath: string,
  options: TranslateOptions
): Promise<void> {
  const fs = await import('fs/promises');
  const text = await fs.readFile(filePath, 'utf-8');
  const translated = await translateText(text, options);
  await fs.writeFile(outputPath, translated);
}
