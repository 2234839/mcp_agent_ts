#!/usr/bin/env node
import { program } from 'commander';
import { translateMarkdownFile } from '../ai/translate';
import { readFileSync } from 'fs';
import path from 'path';
import { Effect } from 'effect';
import { AiService } from 'src/service';
import { defaultOpenai } from 'src/ai/openai';
import { Env } from 'src/env';

program
  .name('mcp_agent_ts-translate-md')
  .description('CLI tool to translate markdown files using AI')
  .version('1.0.0');

program
  .command('translate')
  .description('Translate a markdown file to target language')
  .requiredOption('-i, --input <path>', 'Input markdown file path')
  .requiredOption('-o, --output <path>', 'Output file path')
  .requiredOption('-l, --language <language>', 'Target language (e.g. "Chinese", "French")')
  .action(async (options) => {
    console.log(`Translating ${options.input} to ${options.language}...`);

    const r = await Effect.runPromise(
      translateMarkdownFile(
        path.resolve(options.input),
        path.resolve(options.output),
        options.language,
      ).pipe(
        Effect.provideService(AiService, {
          openai: defaultOpenai,
          model: Env.default_model,
        }),
      ),
    );
    console.log(`Translation saved to ${options.output}`);
  });

program.parseAsync(process.argv).catch(console.error);
