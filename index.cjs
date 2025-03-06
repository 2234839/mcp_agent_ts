"use strict";

// src/server/index.ts
var import_mcp = require("@modelcontextprotocol/sdk/server/mcp.js");
var import_zod = require("zod");

// src/transport/index.ts
var import_inMemory = require("@modelcontextprotocol/sdk/inMemory.js");
var [clientTransport, serverTransport] = import_inMemory.InMemoryTransport.createLinkedPair();

// src/server/index.ts
var server = new import_mcp.McpServer({
  name: "Demo",
  version: "1.0.0"
});
server.prompt("review-code", { code: import_zod.z.string() }, ({ code }) => ({
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
server.tool("add", { a: import_zod.z.number(), b: import_zod.z.number() }, async ({ a, b }) => ({
  content: [{ type: "text", text: String(a + b) }]
}));
server.tool("\u4E58\u6CD5", { a: import_zod.z.number(), b: import_zod.z.number() }, async ({ a, b }) => ({
  content: [{ type: "text", text: String(a * b) }]
}));
server.resource(
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
var transport = serverTransport;
server.connect(transport);

// src/client/index.ts
var import_client = require("@modelcontextprotocol/sdk/client/index.js");

// src/ai/openai.ts
var import_openai_edge = require("openai-edge");

// src/env/index.ts
var import_dotenv = require("dotenv");
var { parsed: env } = (0, import_dotenv.config)();
var Env = {
  default_apiKey: env.default_apiKey,
  default_apiBaseUrl: env.default_apiBaseUrl,
  default_model: env.default_model,
  default_max_tokens: Number(env.default_max_tokens),
  default_temperature: Number(env.default_temperature)
};

// src/ai/openai.ts
var configuration = new import_openai_edge.Configuration({
  apiKey: Env.default_apiKey,
  basePath: Env.default_apiBaseUrl
});
var defaultOpenai = new import_openai_edge.OpenAIApi(configuration);
var defaultConfig = {
  //   model: "gpt-3.5-turbo",
  /** 智谱清言 免费模型 */
  model: "CodeGeeX-4",
  //   max_tokens: undefined,
  max_tokens: 9999,
  temperature: 0.3
};
async function aiFunctionCall(ai = { openai: defaultOpenai }, mcpClient, userInput) {
  const tools = await mcpClient.listTools();
  const completion = await ai.openai.createChatCompletion({
    model: ai.model ?? defaultConfig.model,
    messages: [
      {
        role: "system",
        content: `\u4F60\u662F\u4E00\u4E2A aiFunctionCall \uFF0C\u4E3B\u8981\u5C31\u662F\u901A\u8FC7\u5206\u6790\u7528\u6237\u7684\u8F93\u5165\u6765\u5224\u65AD\u662F\u5426\u8981\u8C03\u7528mcp server\u63D0\u4F9B\u7684\u67D0\u4E9B\u529F\u80FD
\u5982\u679C\u4F60\u5224\u65AD\u89E3\u51B3\u7528\u6237\u7684\u95EE\u9898\u9700\u8981\u8C03\u7528\u5BF9\u5E94\u7684\u529F\u80FD\u5C31\u56DE\u590D\u76F8\u5E94\u7684\u4EE3\u7801,\u540E\u7EED\u4F1A\u901A\u8FC7 js \u6765\u8C03\u7528\u8FD9\u4E9B\u5DE5\u5177\u8FD4\u56DE\u7ED3\u679C\u7ED9\u7528\u6237\u7684
## \u4F60\u7684\u56DE\u590D\u5E94\u8BE5\u662F\u4E00\u4E2A\u5408\u6CD5\u7684json\uFF0C\u53EF\u4EE5\u76F4\u63A5\u88AB JSON.parse() \u89E3\u6790\uFF0C\u4E0D\u9700\u8981\u989D\u5916\u7684\u5904\u7406\u3002

## \u8C03\u7528 tool \u7684\u56DE\u590D\u793A\u4F8B
### \u6CE8\u610F\uFF0C\u4F60\u5E94\u8BE5\u5728callTool \u6570\u7EC4\u4E2D\u5217\u51FA\u6240\u6709\u9700\u8981\u8C03\u7528\u7684tool\uFF0C\u5E76\u4E14\u6BCF\u4E2Atool\u7684\u53C2\u6570\u90FD\u653E\u5728callTool\u6570\u7EC4\u4E2D\u3002\u4F8B\u5982\uFF1A

\`\`\`js
{
    "callTool":[
        {"name":"tool name","arg":{"\u53C2\u6570\u540D":"\u53C2\u6570\u503C"}},
        {"name":"other tool name","arg":{"\u53C2\u6570\u540D":<\u4EFB\u4F55\u5408\u6CD5\u7684json\u503C>}}
        // ... \u5176\u4ED6\u9700\u8981\u8C03\u7528\u7684tool
    ]
}
\`\`\`
  `
      },
      {
        role: "assistant",
        content: `#mcp server\u63D0\u4F9B\u7684\u529F\u80FD
## tools
${tools.tools.map((tool) => {
          const toolStr = `### ${tool.name}
` + (tool.description ? `- **description**: ${tool.description}
` : "") + `
- **parameters**: ${JSON.stringify({
            ...tool.inputSchema,
            //#region 去除一些没啥用的字段
            type: void 0,
            $schema: void 0
            //#endregion 去除一些没啥用的字段
          })}
`;
          return toolStr;
        }).join("\n\n")}`
      },
      { role: "user", content: userInput }
    ],
    max_tokens: ai.max_tokens ?? defaultConfig.max_tokens,
    temperature: ai.temperature ?? defaultConfig.temperature,
    stream: false
  });
  const data = await completion.json();
  return {
    res: JSON_parse_AIResponse(data.choices[0].message.content),
    raw: data
  };
}
function JSON_parse_AIResponse(resStr) {
  let jsonStr;
  try {
    if (resStr.startsWith("```")) {
      const lines = resStr.trim().split("\n");
      lines[0] = "";
      lines[lines.length - 1] = "";
      jsonStr = lines.join("\n").trim();
    } else {
      jsonStr = resStr.trim();
    }
    const jsonObj = JSON.parse(jsonStr);
    return jsonObj;
  } catch (error) {
    return error;
  }
}

// src/client/index.ts
var transport2 = clientTransport;
var client = new import_client.Client(
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
async function test() {
  await client.connect(transport2);
  console.log("[aiFunctionCall start]");
  const { res: aiRes } = await aiFunctionCall(
    { openai: defaultOpenai },
    client,
    `\u7B97\u51FA\u4E0B\u5217\u7B97\u5F0F\u7684\u7B54\u6848
    1+3=?
    99*78=?`
  );
  console.log("[aiRes]", JSON.stringify(aiRes, null, 2));
  if (aiRes instanceof Error) {
    console.error(aiRes);
  } else {
    const callToolRes = await Promise.all(
      aiRes.callTool?.map(async ({ name, arg }) => {
        return {
          res: await client.callTool({
            name,
            arguments: arg
          }),
          name,
          arg
        };
      }) ?? []
    );
    console.log("[callToolRes]", callToolRes);
  }
  return;
  const prompts = await client.listPrompts();
  const prompt = await client.getPrompt({
    name: "review-code",
    arguments: {
      code: 'console.log("Hello, world!")'
    }
  });
  const resources = await client.listResources();
  const resource = await client.readResource({
    uri: "greeting://example.txt"
  });
  const result = await client.callTool({
    name: "add",
    arguments: {
      a: 1,
      b: 2
    }
  });
  console.log("[result]", result);
}
test();
//# sourceMappingURL=index.cjs.map