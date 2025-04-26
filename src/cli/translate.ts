#!/usr/bin/env node
import { program } from 'commander';
import { translateMarkdownFile } from '../ai/translate';
import { readFileSync } from 'fs';
import path from 'path';

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
    try {
      console.log(`Translating ${options.input} to ${options.language}...`);
      await translateMarkdownFile(
        path.resolve(options.input),
        path.resolve(options.output),
        { targetLanguage: options.language }
      );
      console.log(`Translation saved to ${options.output}`);
    } catch (error) {
      console.error('Translation failed:', error);
      process.exit(1);
    }
  });

program.parseAsync(process.argv).catch(console.error);
