import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    // 多入口配置
    index: 'src/index.ts',
    siyuan: 'src/server/siyuan/index.ts',
  },
  splitting: true,
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['esm'], // 指定输出为 ESM 格式
});
