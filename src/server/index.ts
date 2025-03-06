import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { serverTransport } from '../transport/index.js';
// Create an MCP server
const server = new McpServer({
  name: 'Demo',
  version: '1.0.0',
});
server.prompt('review-code', { code: z.string() }, ({ code }) => ({
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
server.tool('add', { a: z.number(), b: z.number() }, async ({ a, b }) => ({
  content: [{ type: 'text', text: String(a + b) }],
}));
server.tool('乘法', { a: z.number(), b: z.number() }, async ({ a, b }) => ({
  content: [{ type: 'text', text: String(a * b) }],
}));
// Add a dynamic greeting resource
server.resource(
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

// Start receiving messages on stdin and sending messages on stdout
const transport = serverTransport;
server.connect(transport);
