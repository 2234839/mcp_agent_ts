import { Context, Effect } from 'effect';
import { AiService, McpClientService } from './service';
import { aiSimpleText, aiFunctionCall, defaultOpenai } from './ai/openai';
import { defaultClient } from './client';
import { clientTransport, serverTransport } from './transport';
import { defalutServer } from './server';

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
    console.log('[callTool]', aiRes.callTool);
    const callToolRes = yield* Effect.tryPromise(() =>
      Promise.all(
        aiRes.callTool?.map(async ({ name, arg }) => {
          return {
            res: await client.callTool({
              name: name ?? 'unkown',
              arguments: arg,
            }),
            name,
            arg,
          };
        }) ?? [],
      ),
    );
    const awser = yield* aiSimpleText(
      `请使用一个简易的表示结果例如：\n 调用加法 : 1+1 = 2 \n 将结果填充到原始问题中\n 原始问题：${rawQuery}` +
        JSON.stringify(callToolRes, null, 2),
    );
    console.log('[awser]\n' + awser.res);
  }
});

async function test() {
  // 这里必须要让 defalutServer 先连接
  await defalutServer.connect(serverTransport);
  await defaultClient.connect(clientTransport);

  const context = Context.empty().pipe(
    Context.add(McpClientService, defaultClient),
    Context.add(AiService, {
      openai: defaultOpenai,
      // model: 'glm-4'
    }),
  );
  const p = Effect.provide(testP, context);
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
