import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
// Create an MCP server
export const testServer = new McpServer({
  name: 'Demo',
  version: '1.0.0',
});
testServer.prompt('review-code', { code: z.string() }, ({ code }) => ({
  messages: [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `Please review this code:\n\n${code}`,
      },
    },
  ],
}));
// Add an addition tool
testServer.tool('add', { a: z.number(), b: z.number() }, async ({ a, b }) => ({
  content: [{ type: 'text', text: String(a + b) }],
}));
testServer.tool('乘法', { a: z.number(), b: z.number() }, async ({ a, b }) => ({
  content: [{ type: 'text', text: String(a * b) }],
}));
// Add a dynamic greeting resource
testServer.resource(
  'greeting',
  new ResourceTemplate('greeting://{name}', { list: undefined }),
  async (uri, { name }) => ({
    contents: [
      {
        uri: uri.href,
        text: `Hello, ${name}!`,
      },
    ],
  }),
);
