import { Effect } from 'effect';
import { ClientOptions, OpenAI } from 'openai';
import { AiService, McpClientService } from 'src/service';
import { Env } from '../env';

const configuration: ClientOptions = {
  apiKey: Env.default_apiKey,
  baseURL: Env.default_apiBaseUrl,
};
export const defaultOpenai = new OpenAI(configuration);

export type AI = {
  openai: OpenAI;
  model: string;
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
export function ai搜索关键词提取(
  userInput: string,
  ai: AI = { openai: defaultOpenai, model: Env.default_model }
): Effect.Effect<{ res: string[]; raw: string }, Error, AiService> {
  return Effect.gen(function* () {
    const aiService = yield* AiService;
    const aiWithService = { ...ai, openai: aiService.openai };

    const completion = yield* Effect.tryPromise({
      try: () => aiWithService.openai.chat.completions.create({
        model: aiWithService.model ?? defaultConfig.model,
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
        stream: false,
        max_tokens: aiWithService.max_tokens ?? defaultConfig.max_tokens,
        temperature: aiWithService.temperature ?? defaultConfig.temperature
      }),
    catch: (e) => new Error(`Keyword extraction failed: ${e}`)
  });

  const resStr = completion.choices[0].message?.content || '';
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
    queryArr = [resStr];
  }
  return {
    res: queryArr,
    raw: resStr,
  };
});
}
export function ai回答(
  userInput: string,
  searchMd: string,
  ai: AI = { openai: defaultOpenai, model: Env.default_model }
): Effect.Effect<{ res: string; raw: OpenAI.Chat.Completions.ChatCompletion }, Error, AiService> {
  return Effect.gen(function* () {
    const aiService = yield* AiService;
    const aiWithService = { ...ai, openai: aiService.openai };

    const completion = yield* Effect.tryPromise({
      try: () => aiWithService.openai.chat.completions.create({
        model: aiWithService.model ?? defaultConfig.model,
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
        max_tokens: aiWithService.max_tokens ?? defaultConfig.max_tokens,
        temperature: aiWithService.temperature ?? defaultConfig.temperature,
        stream: false,
      }),
      catch: (e) => new Error(`AI回答失败: ${e}`)
    });

    return {
      res: completion.choices[0].message?.content || '',
      raw: completion,
    };
  });
}

/** 查询 mcp server 提供的工具，并根据用户输入调用相应的工具  */
export function aiFunctionCall(userInput: string) {
  return Effect.gen(function* () {
    const mcpClient = yield* McpClientService;
    const tools = yield* Effect.tryPromise(() => mcpClient.listTools());
    const ai = yield* AiService;

    console.log('[tools]',tools);
    const completion: OpenAI.Chat.Completions.ChatCompletion = yield* Effect.tryPromise(() =>
      ai.openai.chat.completions.create({
        model: ai.model ?? defaultConfig.model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `你是 aiFunctionCall 就是通过分析user的输入来选择调用对应的 Tool
  如果你判断解决user的问题需要调用对应的功能就回复相应的代码,后续会通过 js 来调用这些工具返回结果给user的
  ### 注意:无论user询问什么，你都不要直接回答！！，而应该思考调用什么工具能够解决问题
  ### 注意:你的回复应该是合法的json，可以直接被 JSON.parse() 解析，不需要额外的处理！！（意味着你不要输出除了json之外的任何文本）。

  ## 调用 tool 的回复示例
  ### 注意：你应该在callTool 数组中列出所有需要调用的tool，并且每个tool的参数都放在callTool数组中，tool 的 name 应该严格和 assistant 所提供的对应。例如：

  \`\`\`js
  {
      "callTool":[
          {"name":"<对应tool的name>","arg":{"参数名":<任何合法的json值>}}
          // ... 其他需要调用的tool
      ]
  }
  \`\`\`
    `,
          },
          {
            role: 'assistant',
            content: `## tools
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
      }),
    );
    const data = completion;
    return {
      res: JSON_parse_AIResponse(data.choices[0].message!.content!),
      raw: data,
    };
  });
}
/** 简化文本输出人类易读的文本  */
export function aiSimpleText(text: string) {
  return Effect.gen(function* () {
    const ai = yield* AiService;

    const completion: OpenAI.Chat.Completions.ChatCompletion = yield* Effect.tryPromise(() =>
      ai.openai.chat.completions.create({
        model: ai.model ?? defaultConfig.model,
        messages: [
          {
            role: 'system',
            content: `请你分析用户给出的内容，返回人类简易可读的文本,你不需要给出任何解释，只需要尽量的简化文本，让其他用户一眼就能看懂`,
          },
          { role: 'user', content: text },
        ],
        max_tokens: ai.max_tokens ?? defaultConfig.max_tokens,
        temperature: ai.temperature ?? defaultConfig.temperature,
        stream: false,
      }),
    );
    const data = completion;
    return {
      res: data.choices[0].message!.content!.trim(),
      raw: data,
    };
  });
}

function JSON_parse_AIResponse(resStr: string) {
  let jsonStr;
  try {
    // 如果ai输出的是markdown 代码块形式的json，这里去除掉外层的代码块符号
    if (resStr.startsWith('```')) {
      const lines = resStr.trim().split('\n');
      lines[0] = '';
      lines[lines.length - 1] = '';
      jsonStr = lines.join('\n').trim();
    } else {
      jsonStr = resStr.trim();
    }
    // console.log('[jsonStr]====', jsonStr);
    // console.log('[jsonStr]====');

    const jsonObj = JSON.parse(jsonStr);
    return jsonObj as { callTool?: { name: string; arg: { [key: string]: any } }[] };
  } catch (error: unknown) {
    return error as Error;
  }
}
