import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Effect } from 'effect';
import { SiyuanService } from 'src/service';
import { z } from 'zod';

export const siyuanServer = Effect.gen(function* ($) {
  const siyuan = yield* SiyuanService;
  const server = new McpServer({
    name: '思源',
    version: '1.0.0',
  });

  // 思源搜索工具
  server.tool(
    'search-siyuan',
    '搜索思源笔记中的内容',
    {
      queryText: z.string(),
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
          widgetBlock: true,
        },
        paths: [],
        groupBy: 0,
        orderBy: 0,
        page: 1,
        reqId: Date.now(),
      };

      try {
        const response = await fetch(`${siyuan.conf.baseUrl}/api/search/fullTextSearchBlock`, {
          headers: {
            accept: '*/*',
            'accept-language': 'zh-CN',
            'content-type': 'text/plain;charset=UTF-8',
            Authorization: `Token ${siyuan.conf.apiKey}`,
          },
          referrerPolicy: 'strict-origin-when-cross-origin',
          body: JSON.stringify(data),
          method: 'POST',
          mode: 'cors',
          credentials: 'include',
        });

        const result = await response.json();
        const blocks = result.data.blocks as {
          id: string;
          fcontent: string;
          content: string;
          name: string;
        }[];

        return {
          content: blocks.map((block) => ({
            type: 'text',
            text: `${block.name} - ${block.id}\n${block.fcontent.slice(0, 100)}...`,
          })),
        };
      } catch (e) {
        return {
          content: [
            {
              type: 'text',
              text: `搜索失败: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
        };
      }
    },
  );

  return server;
});
