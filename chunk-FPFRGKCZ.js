// src/service/index.ts
import { Context } from "effect";
var McpClientService = class extends Context.Tag("McpClientService")() {
};
var AiService = class extends Context.Tag("OpenAIApiService")() {
};
var SiyuanService = class extends Context.Tag("SiyuanService")() {
};

export {
  McpClientService,
  AiService,
  SiyuanService
};
//# sourceMappingURL=chunk-FPFRGKCZ.js.map