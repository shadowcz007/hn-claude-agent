# ClaudeAnalyzer 使用指南

## 概述

`ClaudeAnalyzer` 是一个基于 `@anthropic-ai/claude-agent-sdk` 的 HackerNews 项目分析工具，能够使用 Claude AI 对技术文章进行深度分析，提取关键洞察和趋势。

## 主要功能

- 🔍 **智能分析**: 使用 Claude AI 分析 HackerNews 项目内容
- 📊 **批量处理**: 支持批量分析多个项目，带有智能批处理机制
- 🌊 **流式分析**: 实时流式分析，适合大量数据处理
- 📈 **趋势报告**: 生成综合的技术趋势报告
- 🎯 **高级过滤**: 按相关性、情绪、标签等维度过滤分析结果
- 📤 **数据导出**: 支持 JSON 格式的数据导出和导入
- ⚙️ **灵活配置**: 可自定义模型、批处理大小、工具权限等

## 环境配置

### 必需的环境变量

```bash
# 设置 Anthropic API 密钥
export ANTHROPIC_API_KEY="sk-ant-api03-your-api-key-here"

# 可选：指定 Claude 模型（默认: claude-3-5-sonnet-20241022）
export ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
```

### 支持的模型

- `claude-3-5-sonnet-20241022` - 默认推荐，平衡性能和成本
- `claude-3-5-haiku-20241022` - 更快，成本更低
- `claude-3-opus-20240229` - 更强大，成本更高

## 快速开始

### 基本用法

```typescript
import { ClaudeAnalyzer, type AnalyzerConfig } from './claude-analyzer';
import { HNItem } from './hn-api';

// 验证环境变量
const validation = ClaudeAnalyzer.validateEnvironment();
if (!validation.isValid) {
  console.error('环境变量配置错误:', validation.errors);
}

// 创建分析配置（自动使用环境变量中的模型）
const config: AnalyzerConfig = {
  model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
  batchSize: 5,
  delayBetweenBatches: 1000,
  allowedTools: ['Read', 'Write', 'Edit', 'Grep', 'Glob'],
  permissionMode: 'bypassPermissions'
};

// 分析单个项目
const analysis = await ClaudeAnalyzer.analyzeItem(hackerNewsItem, config);

// 批量分析
const analyses = await ClaudeAnalyzer.analyzeMultipleItems(items, config);

// 生成趋势报告
const report = await ClaudeAnalyzer.generateTrendReport(analyses, config);
```

### 流式分析

```typescript
// 流式分析，实时获取结果
for await (const analysis of ClaudeAnalyzer.analyzeItemsStream(items, config)) {
  console.log(`分析完成: ${analysis.title} - ${analysis.sentiment}`);
}
```

## 配置选项

### AnalyzerConfig 接口

```typescript
interface AnalyzerConfig {
  model?: string;                    // Claude 模型名称
  batchSize?: number;                // 批处理大小
  delayBetweenBatches?: number;      // 批次间延迟（毫秒）
  allowedTools?: string[];           // 允许使用的工具
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan';
}
```

### 默认配置

```typescript
{
  model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
  batchSize: 5,
  delayBetweenBatches: 1000,
  allowedTools: ['Read', 'Write', 'Edit', 'Grep', 'Glob'],
  permissionMode: 'bypassPermissions'
}
```

### 环境变量验证

```typescript
// 验证环境变量配置
const validation = ClaudeAnalyzer.validateEnvironment();
if (!validation.isValid) {
  console.error('配置错误:', validation.errors);
}

// 获取当前使用的模型
const currentModel = ClaudeAnalyzer.getCurrentModel();
console.log('当前模型:', currentModel);
```

## 分析结果

### AnalysisResult 接口

```typescript
interface AnalysisResult {
  id: string;                        // 分析ID
  title: string;                     // 项目标题
  summary: string;                   // 内容摘要
  keyPoints: string[];               // 关键点
  technicalInsights: string[];       // 技术洞察
  trends: string[];                  // 趋势分析
  sentiment: 'positive' | 'negative' | 'neutral';  // 情绪分析
  relevanceScore: number;            // 相关性评分 (1-10)
  tags: string[];                    // 标签分类
  generatedAt: Date;                 // 生成时间
}
```

## 高级功能

### 统计分析

```typescript
const stats = ClaudeAnalyzer.getAnalysisStats(analyses);
console.log('平均相关性:', stats.avgRelevance);
console.log('情绪分布:', stats.sentimentCounts);
console.log('热门标签:', stats.topTags);
```

### 数据过滤

```typescript
// 按相关性过滤
const highRelevance = ClaudeAnalyzer.filterByRelevance(analyses, 8);

// 按情绪过滤
const positiveItems = ClaudeAnalyzer.filterBySentiment(analyses, 'positive');

// 按标签过滤
const aiItems = ClaudeAnalyzer.filterByTags(analyses, ['ai', 'machine-learning']);
```

### 数据导出/导入

```typescript
// 导出为 JSON
const jsonData = ClaudeAnalyzer.exportToJSON(analyses);

// 从 JSON 导入
const importedAnalyses = ClaudeAnalyzer.importFromJSON(jsonData);
```

## 使用示例

### 示例 1: 基础分析

```typescript
import { ClaudeAnalyzer } from './claude-analyzer';

const item = {
  id: 1,
  title: "New JavaScript Framework",
  text: "A revolutionary new framework...",
  type: "story",
  url: "https://example.com",
  time: Date.now() / 1000,
  by: "developer",
  score: 100,
  descendants: 20
};

const analysis = await ClaudeAnalyzer.analyzeItem(item);
console.log('分析结果:', analysis);
```

### 示例 2: 批量处理

```typescript
const items = [item1, item2, item3, item4, item5];
const analyses = await ClaudeAnalyzer.analyzeMultipleItems(items);

// 获取统计信息
const stats = ClaudeAnalyzer.getAnalysisStats(analyses);
console.log('处理统计:', stats);
```

### 示例 3: 趋势报告

```typescript
const report = await ClaudeAnalyzer.generateTrendReport(analyses);
console.log('趋势报告:', report);
```

## 错误处理

分析器内置了完善的错误处理机制：

- 单个项目分析失败不会影响其他项目
- 批处理中的错误会被记录但不会中断整个流程
- 提供默认的分析结果作为降级方案
- 详细的错误日志记录

## 性能优化

- **批处理**: 自动将大量项目分批处理，避免 API 限制
- **延迟控制**: 批次间自动延迟，保护 API 资源
- **流式处理**: 支持流式分析，实时获取结果
- **错误恢复**: 单个失败不影响整体处理

## 注意事项

1. **API 密钥**: 确保正确配置 Anthropic API 密钥
2. **速率限制**: 注意 API 调用频率限制
3. **成本控制**: 大量分析可能产生较高成本
4. **网络稳定性**: 确保网络连接稳定

## 故障排除

### 常见问题

1. **分析失败**: 检查 API 密钥和网络连接
2. **JSON 解析错误**: 检查 Claude 返回的格式
3. **批处理超时**: 调整 `delayBetweenBatches` 参数
4. **内存不足**: 减少 `batchSize` 参数

### 调试模式

```typescript
const debugConfig: AnalyzerConfig = {
  model: 'claude-3-5-sonnet-20241022',
  batchSize: 1,  // 小批次便于调试
  delayBetweenBatches: 2000,  // 增加延迟
  permissionMode: 'bypassPermissions'
};
```

## 更新日志

- **v2.0.0**: 重构使用 `@anthropic-ai/claude-agent-sdk`
- **v1.0.0**: 初始版本，模拟分析功能

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个工具！
