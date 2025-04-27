import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { Context } from 'effect';
import { OpenAI } from 'openai';

type AI = {
    openai: OpenAI;
    model: string;
    max_tokens?: number;
    temperature?: number;
};

declare const McpClientService_base: Context.TagClass<McpClientService, "McpClientService", Client<{
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number | undefined;
        } | undefined;
    } | undefined;
}, {
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
        } | undefined;
    } | undefined;
}, {
    [x: string]: unknown;
    _meta?: {
        [x: string]: unknown;
    } | undefined;
}>>;
declare class McpClientService extends McpClientService_base {
}
declare const AiService_base: Context.TagClass<AiService, "OpenAIApiService", AI>;
declare class AiService extends AiService_base {
}
declare const SiyuanService_base: Context.TagClass<SiyuanService, "SiyuanService", {
    conf: {
        apiKey: string;
        baseUrl: string;
    };
}>;
declare class SiyuanService extends SiyuanService_base {
}

export { AiService, McpClientService, SiyuanService };
