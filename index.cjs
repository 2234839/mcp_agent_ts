"use strict";

// src/server/testServer.ts
var import_mcp = require("@modelcontextprotocol/sdk/server/mcp.js");
var import_zod = require("zod");
var testServer = new import_mcp.McpServer({
  name: "Demo",
  version: "1.0.0"
});
testServer.prompt("review-code", { code: import_zod.z.string() }, ({ code }) => ({
  messages: [
    {
      role: "user",
      content: {
        type: "text",
        text: `Please review this code:

${code}`
      }
    }
  ]
}));
testServer.tool("add", { a: import_zod.z.number(), b: import_zod.z.number() }, async ({ a, b }) => ({
  content: [{ type: "text", text: String(a + b) }]
}));
testServer.tool("\u4E58\u6CD5", { a: import_zod.z.number(), b: import_zod.z.number() }, async ({ a, b }) => ({
  content: [{ type: "text", text: String(a * b) }]
}));
testServer.resource(
  "greeting",
  new import_mcp.ResourceTemplate("greeting://{name}", { list: void 0 }),
  async (uri, { name }) => ({
    contents: [
      {
        uri: uri.href,
        text: `Hello, ${name}!`
      }
    ]
  })
);

// src/client/index.ts
var import_client = require("@modelcontextprotocol/sdk/client/index.js");
var defaultClient = new import_client.Client(
  {
    name: "example-client",
    version: "1.0.0"
  },
  {
    capabilities: {
      prompts: {},
      resources: {},
      tools: {}
    }
  }
);
//# sourceMappingURL=index.cjs.map