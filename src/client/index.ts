import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { clientTransport } from '../transport';
import { aiFunctionCall, defaultOpenai } from '../ai/openai';

const transport = clientTransport;

const client = new Client(
  {
    name: 'example-client',
    version: '1.0.0',
  },
  {
    capabilities: {
      prompts: {},
      resources: {},
      tools: {},
    },
  },
);
async function test() {
  await client.connect(transport);
  console.log('[aiFunctionCall start]');
  const { res: aiRes } = await aiFunctionCall(
    { openai: defaultOpenai },
    client,
    `算出下列算式的答案
    1+3=?
    99*78=?`,
  );
  console.log('[aiRes]', JSON.stringify(aiRes, null, 2));

  if (aiRes instanceof Error) {
    console.error(aiRes);
  } else {
    const callToolRes = await Promise.all(
      aiRes.callTool?.map(async ({ name, arg }) => {
        return {
          res: await client.callTool({
            name,
            arguments: arg,
          }),
          name,
          arg,
        };
      }) ?? [],
    );
    console.log('[callToolRes]', callToolRes);
  }
  return;
  // List prompts
  const prompts = await client.listPrompts();
  const prompt = await client.getPrompt({
    name: 'review-code',
    arguments: {
      code: 'console.log("Hello, world!")',
    },
  });

  // List resources
  const resources = await client.listResources();

  // Read a resource
  const resource = await client.readResource({
    uri: 'greeting://example.txt',
  });

  // Call a tool
  const result = await client.callTool({
    name: 'add',
    arguments: {
      a: 1,
      b: 2,
    },
  });
  console.log('[result]', result);
  //   client.
}
test();
