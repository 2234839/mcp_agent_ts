import { Client } from '@modelcontextprotocol/sdk/client/index.js';

export const defaultClient = new Client(
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

