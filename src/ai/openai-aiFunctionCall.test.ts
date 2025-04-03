import { Context, Effect } from 'effect';
import OpenAI from 'openai';
import { Env } from 'src/env';
import { AiService, McpClientService } from 'src/service';
import { describe, expect, it, vi } from 'vitest';
import { aiFunctionCall } from './openai';
import { defalutServer } from 'src/server';
import { defaultClient } from 'src/client';
import { clientTransport, serverTransport } from 'src/transport';
vi.setConfig({ testTimeout: 25_000 });
describe.each([
  { model: 'glm-4' }, // 测试 glm-4
  { model: 'glm-4-flashx' }, // glm-4-flashx
  { model: 'glm-4-flash' }, // glm-4-flash 免费模型
  { model: 'CodeGeeX-4' }, // CodeGeeX-4 用于 aiFunctionCall 有较好的效果，运行速度也快
])('aiFunctionCall with model: %o', ({ model }) => {
  it('应该正确处理函数调用请求', async () => {
    const userInput = `算出下列算式的答案
      1+3=?
      99*7890=?`;
    await defalutServer.connect(serverTransport);
    await defaultClient.connect(clientTransport);

    const context = Context.empty().pipe(
      Context.add(McpClientService, defaultClient),
      Context.add(AiService, {
        openai: new OpenAI({
          apiKey: Env.bigmodel_apiKey,
          baseURL: Env.bigmodel_apiBaseUrl,
        }),
        model, // 动态传入 model
      }),
    );
    const p = Effect.provide(aiFunctionCall(userInput), context);
    const { res } = await Effect.runPromise(p);
    if (res instanceof Error) {
      console.error(res);
      throw res;
    }
    const result = res;
    expect(result).toBeDefined();
    expect(result.callTool).toBeDefined();
    expect(result.callTool?.length).toBe(2);
    expect(result.callTool?.map((tool) => tool.name)).toEqual(
      expect.arrayContaining(['add', '乘法']),
    );
  });
});
