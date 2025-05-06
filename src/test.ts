import { Context, Effect } from 'effect';
import { AiService, McpClientService, SiyuanService } from './service';
import { aiSimpleText, aiFunctionCall } from './ai/openai';
import { defaultClient } from './client';
import { clientTransport, serverTransport } from './transport';
import { testServer } from './server/testServer';
import { siyuanServer } from './server/siyuan';
import { Env } from './env';
import { callTool } from './client/util';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import OpenAI from 'openai';

const testP = Effect.gen(function* () {
  const client = yield* McpClientService;
  console.log('[aiFunctionCall start]');
  const rawQuery = `算出下列算式的答案
      1+3=?
      99*7890=?`;
  const { res: aiRes } = yield* aiFunctionCall(rawQuery);
  if (aiRes instanceof Error) {
    console.error(aiRes);
  } else {
    const callToolRes = yield* callTool(aiRes.callTool ?? []);
    const awser = yield* aiSimpleText(
      `请使用一个简易的表示结果例如：\n 调用加法 : 1+1 = 2 \n 将结果填充到原始问题中\n 原始问题：${rawQuery}` +
        JSON.stringify(callToolRes, null, 2),
    );
    console.log('[awser]\n' + awser.res);
  }
});

const testSiyuan = Effect.gen(function* ($) {
  const server = yield* siyuanServer;
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const rawQuery = `OceanPress 是什么？`;
  const t = yield* aiFunctionCall(rawQuery);
  yield* Effect.tryPromise(() => server.connect(serverTransport));
  yield* Effect.tryPromise(() => defaultClient.connect(clientTransport));
  const { res } = yield* aiFunctionCall(rawQuery);
  if (res instanceof Error) {
  } else {
    console.log('[callTool]', res.callTool);
    const callToolRes = yield* callTool(res.callTool ?? []);
    console.log('[callToolRes]', callToolRes);
  }
});
async function test() {
  // 这里必须要让 defalutServer 先连接
  await testServer.connect(serverTransport);
  await defaultClient.connect(clientTransport);
  const defaultOpenai = new OpenAI({
    apiKey: Env.default_apiKey,
    baseURL: Env.default_apiBaseUrl,
  });
  const context = Context.empty().pipe(
    Context.add(McpClientService, defaultClient),
    Context.add(AiService, {
      openai: defaultOpenai,
      model: Env.default_model,
    }),
    Context.add(SiyuanService, {
      conf: {
        baseUrl: Env.siyuan_baseUrl,
        apiKey: Env.siyuan_apiKey,
      },
    }),
  );
  // const p = Effect.provide(testP, context);
  const p = Effect.provide(testSiyuan, context);
  const res = await Effect.runPromise(p);
  console.log('[res]', res);

  return;
  // List prompts
  //   const prompts = await client.listPrompts();
  //   const prompt = await client.getPrompt({
  //     name: 'review-code',
  //     arguments: {
  //       code: 'console.log("Hello, world!")',
  //     },
  //   });

  //   // List resources
  //   const resources = await client.listResources();

  //   // Read a resource
  //   const resource = await client.readResource({
  //     uri: 'greeting://example.txt',
  //   });

  //   // Call a tool
  //   const result = await client.callTool({
  //     name: 'add',
  //     arguments: {
  //       a: 1,
  //       b: 2,
  //     },
  //   });
  //   console.log('[result]', result);
  //   client.
}
test();
