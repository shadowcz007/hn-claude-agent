# HN Claude Agent - 技术趋势洞察系统

HN Claude Agent 是一个自动化系统，利用 Claude AI 分析 HackerNews 内容，识别并总结最新技术趋势和洞察。

## 概述

该系统自动从 HackerNews 收集技术内容，使用 Claude AI 进行处理，并生成结构化简报，突出重要趋势、洞察和发展。结果通过 Next.js Web 应用程序呈现。

## 功能特点

- 自动收集 HackerNews 技术内容
- 使用 Claude AI 进行智能分析和总结
- 趋势分析和聚合展示
- 按标签组织的洞察呈现
- 强大的搜索功能
- 历史简报归档，便于趋势追踪
- 响应式 Web 界面
- 智能调度的自动获取系统

## 系统架构

系统由四个主要组件组成：

1. **信息收集模块** - 从 HackerNews API 获取数据
2. **Claude Agent 处理模块** - 使用 Claude AI 分析内容
3. **数据存储模块** - 管理原始数据和处理后的简报
4. **Next.js Web 应用** - 提供趋势洞察的用户界面

## 项目结构

```
hn-claude-agent/
├── docs/                    # 文档文件
├── posts/                   # 生成的简报
├── scripts/                 # 数据处理脚本
│   ├── auto-fetch.ts        # 自动获取管理器
│   ├── fetch-hn.ts          # HN数据获取和分析
│   └── forever-manager.sh   # 进程管理脚本
├── src/
│   ├── api/                 # API 工具
│   ├── components/          # React 组件
│   ├── pages/               # Next.js 页面
│   ├── types/               # 类型定义
│   └── utils/               # 工具函数
│       ├── claude-analyzer.ts # Claude AI 集成
│       ├── data-manager.ts    # 数据管理
│       ├── config.ts          # 配置管理
│       └── hn-api.ts          # HackerNews API 客户端
├── styles/                  # CSS 样式
├── package.json             # 项目依赖
└── README.md                # 本文件
```

## 开始使用

### 前提条件

- Node.js (v16 或更高版本)
- Claude API 访问权限

### 安装

1. 克隆仓库:
   ```bash
   git clone https://github.com/your-username/hn-claude-agent.git
   cd hn-claude-agent
   ```

2. 安装依赖:
   ```bash
   npm install
   ```

3. 设置环境变量:
   ```bash
   cp .env.example .env.local
   # 编辑 .env.local 添加你的 Claude API 密钥
   ```

### 运行应用

运行开发服务器:

```bash
npm run dev
```

构建并运行生产应用:

```bash
npm run build
npm start
```

### 获取和分析数据

从 HackerNews 获取新数据并分析:

```bash
npm run fetch
```

该脚本将:
1. 从 HackerNews 获取热门故事
2. 使用 Claude AI 处理每个故事
3. 生成并保存简报到 `posts/` 目录

### 自动获取数据

启动自动获取管理器:

```bash
npm run auto-fetch start
```

自动获取管理器功能:
- 定期检查 HackerNews 新内容
- 智能调度处理任务
- 自动管理资源使用
- 可配置的检查间隔和空闲模式

## API 端点

- `GET /api/briefs` - 获取所有简报元数据
- `GET /api/briefs?id={id}` - 获取特定简报
- `GET /api/briefs?search={keyword}` - 按关键词搜索简报
- `GET /api/briefs?tag={tag}` - 按标签获取简报
- `GET /api/search?q={query}` - 跨所有简报搜索
- `GET /api/trends` - 获取趋势分析数据

## 技术趋势功能

系统包含先进的趋势分析功能:

- 自动识别和聚合技术趋势
- 趋势权重和频率分析
- 智能标签过滤和黑名单系统
- 趋势与相关简报的关联
- 趋势统计和可视化

## 开发

项目的关键实现文件:

- `src/utils/hn-api.ts` - HackerNews API 客户端
- `src/utils/claude-analyzer.ts` - Claude AI 集成
- `src/utils/data-manager.ts` - 数据存储和检索
- `src/utils/config.ts` - 配置管理
- `src/pages/index.tsx` - 主页
- `src/pages/brief/[id].tsx` - 简报详情页
- `src/pages/archive.tsx` - 归档页面
- `scripts/fetch-hn.ts` - 数据获取和分析脚本
- `scripts/auto-fetch.ts` - 自动获取管理器

## 部署

该应用程序设计为可部署在支持 Next.js 应用程序的平台上，如 Vercel。

对于静态导出 (部署到 GitHub Pages 或类似平台):
```bash
npm run build
```

## 贡献

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -am 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建新的 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 致谢

- HackerNews API 提供数据源
- Anthropic 提供 Claude AI 技术
- Next.js 提供 Web 框架
- Mixlab AI 提供支持