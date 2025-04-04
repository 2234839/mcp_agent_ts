import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { Context } from 'effect';
import type { AI } from 'src/ai/openai';

export class McpClientService extends Context.Tag('McpClientService')<McpClientService, Client>() {}
export class AiService extends Context.Tag('OpenAIApiService')<AiService, AI>() {}

export class SiyuanService extends Context.Tag('SiyuanService')<
  SiyuanService,
  {
    conf: {
      apiKey: string;
      baseUrl: string;
    };
  }
>() {}
