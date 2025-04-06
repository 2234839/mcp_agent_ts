import {
  SiyuanService
} from "./chunk-FPFRGKCZ.js";

// src/server/siyuan/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Effect } from "effect";
import { z } from "zod";
var siyuanServer = Effect.gen(function* ($) {
  const siyuan = yield* SiyuanService;
  const server = new McpServer({
    name: "\u601D\u6E90",
    version: "1.0.0"
  });
  server.tool(
    "search-siyuan",
    "\u641C\u7D22\u601D\u6E90\u7B14\u8BB0\u4E2D\u7684\u5185\u5BB9",
    {
      queryText: z.string()
    },
    async ({ queryText: query }) => {
      const data = {
        query,
        method: 0,
        types: {
          audioBlock: true,
          blockquote: true,
          codeBlock: true,
          databaseBlock: true,
          document: true,
          embedBlock: true,
          heading: true,
          htmlBlock: true,
          iframeBlock: true,
          list: false,
          listItem: false,
          mathBlock: true,
          paragraph: true,
          superBlock: true,
          table: false,
          videoBlock: true,
          widgetBlock: true
        },
        paths: [],
        groupBy: 0,
        orderBy: 0,
        page: 1,
        reqId: Date.now()
      };
      try {
        const response = await fetch(`${siyuan.conf.baseUrl}/api/search/fullTextSearchBlock`, {
          headers: {
            accept: "*/*",
            "accept-language": "zh-CN",
            "content-type": "text/plain;charset=UTF-8",
            Authorization: `Token ${siyuan.conf.apiKey}`
          },
          referrerPolicy: "strict-origin-when-cross-origin",
          body: JSON.stringify(data),
          method: "POST",
          mode: "cors",
          credentials: "include"
        });
        const result = await response.json();
        const blocks = result.data.blocks;
        return {
          content: blocks.map((block) => ({
            type: "text",
            text: `${block.name} - ${block.id}
${block.fcontent.slice(0, 100)}...`
          }))
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `\u641C\u7D22\u5931\u8D25: ${e instanceof Error ? e.message : String(e)}`
            }
          ]
        };
      }
    }
  );
  return server;
});
export {
  siyuanServer
};
//# sourceMappingURL=siyuan.js.map