import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { Configuration, OpenAIApi, type ResponseTypes } from 'openai-edge';

const configuration = new Configuration({
  apiKey: '09bc63119e1f26d148cac77cda12e089.Rw7lnq1zkg3FcmYZ',
  basePath: 'https://open.bigmodel.cn/api/paas/v4',
});
export const openai = new OpenAIApi(configuration);

type AI = {
  openai: OpenAIApi;
  model?: string;
  max_tokens?: number;
  temperature?: number;
};
const defaultConfig = {
  //   model: "gpt-3.5-turbo",
  /** 智谱清言 免费模型 */
  model: 'GLM-4-Flash',
  //   max_tokens: undefined,
  max_tokens: 9999,
  temperature: 0.3,
};
export async function ai搜索关键词提取(ai: AI, userInput: string) {
  // 你是一个专业辅助用户搜索的助手，请从用户的提问之中拆分和联想出可以用于搜索的词组

  // ## 你回答的内容
  // 1. 格式：你的回答应该是一个单行json字符串数组，不要包含其他的内容
  // 2. 不仅仅要包含用户提问中出现过的关键词，你还应该要联想到关键词的可能变体

  // ## 搜索引擎的特性
  // 1. 搜索程序支持使用空格连接多个关键词
  // 2. 有时候单个关键词可以搜索到相关内容，多个关键词连接反而搜索不到，所以你不仅要返回空格连接的多个关键词，还应该返回需要搜索的单个关键词之类的，但是太多的单个关键词又可能搜索到无关紧要的内容，这个就是需要你取舍的地方了
  const completion = await ai.openai.createChatCompletion({
    model: ai.model ?? defaultConfig.model,
    messages: [
      {
        role: 'system',
        content: `你是一名助理，专门协助用户进行搜索。请按照以下规则提供答案：

1. 输出格式：**JSON 格式**，不要使用代码块,要确保你的回答可以直接被 JSON.parse。
2. 内容要求：
   - 答案应该是**单行的 JSON 字符串数组**。
   - 包含**用户问题中的关键词**及其**可能的变体**。
3. 搜索引擎功能：
   - 支持使用空格连接多个关键词，但也要考虑**单个关键词**的可能性。
   - 选择合适的关键词，以避免返回过多无关的结果。

示例：
用户: “有哪些关键词”
你: ["关键词1", "关键词2"]
`,
      },
      { role: 'user', content: userInput },
    ],
    max_tokens: ai.max_tokens ?? defaultConfig.max_tokens,
    temperature: ai.temperature ?? defaultConfig.temperature,
    stream: false,
  });
  const data = (await completion.json()) as ResponseTypes['createChatCompletion'];
  const resStr = data.choices[0].message!.content!;
  let queryArr;
  try {
    if (resStr.startsWith('```')) {
      const lines = resStr.split('\n');
      lines[0] = '';
      lines[lines.length - 1] = '';
      queryArr = JSON.parse(lines.join('\n'));
    } else {
      queryArr = JSON.parse(resStr);
    }
  } catch (error) {
    console.log('[error]', error);
    queryArr = [resStr];
  }
  return {
    res: queryArr,
    raw: data,
  };
}
export async function ai回答(ai: AI, userInput: string, searchMd: string) {
  const completion = await ai.openai.createChatCompletion({
    model: ai.model ?? defaultConfig.model,
    messages: [
      {
        role: 'system',
        content: `你是用户的笔记ai提问助手，请根据用户的问题和你检索到的笔记内容来回答用户的问题
## 回答的格式

你的回答要表示是基于哪些块的内容回答的，表现方式是在对应回答的后面添加 :[种花心得(这个块的内容摘要)](siyuan://blocks/20240113141417-va4uedb(笔记块的id))
例如 :

提问:怎么养兰花
回答:

1. 保持适宜的空气湿度 [养兰花的第三天](siyuan://blocks/20130123242415-ad32fad12)
2. 需要准备的一些工具:.....  [种花心得](siyuan://blocks/20160133242325-d23dfg1)

## 注意你的回答最后面附加的链接 [] 内填的是这个块的摘要文本 () 中的 siyuan://blocks/id 是思源特有的链接方式
`,
      },
      {
        role: 'assistant',
        content: `检索到的内容:\n${searchMd}`,
      },
      { role: 'user', content: userInput },
    ],
    max_tokens: ai.max_tokens ?? defaultConfig.max_tokens,
    temperature: ai.temperature ?? defaultConfig.temperature,
    stream: false,
  });
  const data = (await completion.json()) as ResponseTypes['createChatCompletion'];
  return {
    res: data.choices[0].message!.content!,
    raw: data,
  };
}
export async function aiFunctionCall(ai: AI, mcpClient: Client, userInput: string) {
  const tools = await mcpClient.listTools();

  const completion = await ai.openai.createChatCompletion({
    model: ai.model ?? defaultConfig.model,
    messages: [
      {
        role: 'system',
        content: `你是一个 aiFunctionCall ，主要就是通过分析用户的输入来判断是否要调用mcp server提供的某些功能
如果你判断解决用户的问题需要调用对应的功能就回复相应的代码,后续会通过 js 来调用这些工具返回结果给用户的
## 你的回复应该是一个合法的json，可以直接被 JSON.parse() 解析，不需要额外的处理。

## 调用 tool 的回复示例
### 注意，你应该在callTool 数组中列出所有需要调用的tool，并且每个tool的参数都放在callTool数组中。例如：

\`\`\`js
{
    callTool:[
        {name:"tool name",arg:{"参数名":"参数值"}},
        {name:"other tool name",arg:{"参数名":<任何合法的json值>}}
        // ... 其他需要调用的tool
    ]
}
\`\`\`
  `,
      },
      {
        role: 'assistant',
        content: `#mcp server提供的功能
## tools
${tools.tools
  .map((tool) => {
    const toolStr =
      `### ${tool.name}\n` +
      (tool.description ? `- **description**: ${tool.description}\n` : '') +
      `
- **parameters**: ${JSON.stringify({
        ...tool.inputSchema,
        //#region 去除一些没啥用的字段
        type: undefined,
        $schema: undefined,
        //#endregion 去除一些没啥用的字段
      })}
`;
    return toolStr;
  })
  .join('\n\n')}`,
      },
      { role: 'user', content: userInput },
    ],
    max_tokens: ai.max_tokens ?? defaultConfig.max_tokens,
    temperature: ai.temperature ?? defaultConfig.temperature,
    stream: false,
  });
  const data = (await completion.json()) as ResponseTypes['createChatCompletion'];
  return {
    res: JSON_parse_AIResponse(data.choices[0].message!.content!),
    raw: data,
  };
}

function JSON_parse_AIResponse(resStr: string) {
  let jsonObj;
  try {
    if (resStr.startsWith('```')) {
      const lines = resStr.split('\n');
      lines[0] = '';
      lines[lines.length - 1] = '';
      jsonObj = JSON.parse(lines.join('\n'));
    } else {
      jsonObj = JSON.parse(resStr);
    }
    return jsonObj as { callTool?: { name: string; arg: { [key: string]: any } }[] };
  } catch (error: unknown) {
    return error as Error;
  }
}
