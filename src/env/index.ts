import { config } from 'dotenv';
const { parsed: env } = config();

export const Env = {
  default_apiKey: env!.default_apiKey as string,
  default_apiBaseUrl: env!.default_apiBaseUrl as string,
  default_model: env!.default_model as string,
  default_max_tokens: Number(env!.default_max_tokens),
  default_temperature: Number(env!.default_temperature),

  // 用于单元测试的环境变量
  bigmodel_apiKey: env!.bigmodel_apiKey as string,
  bigmodel_apiBaseUrl: env!.bigmodel_apiBaseUrl as string,
};
