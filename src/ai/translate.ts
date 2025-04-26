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
  const model = options.model || 'GLM-4-Flash';
  const max_tokens = options.max_tokens || 9999;
  const temperature = options.temperature || 0.3;

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: `You are a professional translator. Translate the following text to ${options.targetLanguage} while preserving the original formatting, markdown syntax, and technical terms accuracy.`
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
