import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Effect } from 'effect';
import { SiyuanService } from './index.js';
import '@modelcontextprotocol/sdk/client/index.js';
import 'openai';

declare const siyuanServer: Effect.Effect<McpServer, never, SiyuanService>;

export { siyuanServer };
