import { defineConfig } from 'tsup';
// @ts-ignore
import packageJson from './package.json';
// @ts-ignore
import fs from 'fs';
// 解析当前版本号
const [major, minor, patch] = packageJson.version.split('.').map(Number);

// 增加小版本号
const newVersion = `${major}.${minor}.${patch + 1}`;
packageJson.version = newVersion;
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
export default defineConfig({
  entry: {
    // 多入口配置
    index: 'src/index.ts',
    siyuan: 'src/server/siyuan/index.ts',
    'cli/translate': 'src/cli/translate.ts',
  },
  splitting: true,
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['esm'], // 指定输出为 ESM 格式
});
