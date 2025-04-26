# mcp_agent_ts

[中文文档](./README_zh.md) [English Document](./README.md)

这是一个我创建的工具，用于简化基于 mcp 的代理创建

## 功能

- [x] 基于 mcp
- [x] 自动调用 mcp 提供的资源
- [x] Markdown 文件翻译 CLI 工具
- [ ] 基于 openai 连接到开放模型

## 翻译 CLI 工具

`mcp_agent_ts-translate-md` 命令提供 Markdown 文件的翻译，同时保留格式：

### 安装
```bash
pnpm install -g mcp_agent_ts
```

### 使用
```bash
mcp_agent_ts-translate-md translate -i <输入.md> -o <输出.md> -l <语言>
```

### 示例
```bash
# 翻译为中文
mcp_agent_ts-translate-md translate -i README_zh.md -o README.md -l "English"
```

### 功能
- 保留 Markdown 语法
- 使用 GLM-4-Flash AI 模型
- 简单的命令行界面