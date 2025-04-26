import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { siyuanServer } from '.';
import { Context, Effect } from 'effect';
import { SiyuanService } from 'src/service';
import { Env } from 'src/env';

async function main() {
  const transport = new StdioServerTransport();
  const context = Context.empty().pipe(
    Context.add(SiyuanService, {
      conf: {
        baseUrl: Env.siyuan_baseUrl,
        apiKey: Env.siyuan_apiKey,
      },
    }),
  );
  // const p = Effect.provide(testP, context);
  const p = Effect.provide(siyuanServer, context);
  const server = await Effect.runPromise(p);
  await server.connect(transport);
  console.error('Weather MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
