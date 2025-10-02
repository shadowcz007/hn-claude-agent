import { ClaudeAnalyzer, type AnalysisResult, type AnalyzerConfig } from './claude-analyzer';
import { HNItem } from './hn-api';

/**
 * ClaudeAnalyzer 使用示例
 * 
 * 这个文件展示了如何使用重构后的 ClaudeAnalyzer 类
 * 进行 HackerNews 项目的技术趋势分析
 */

// 示例配置 - 使用环境变量中的模型
const exampleConfig: AnalyzerConfig = {
  model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
  batchSize: 3,
  delayBetweenBatches: 1000,
  allowedTools: ['Read', 'Write', 'Edit', 'Grep', 'Glob'],
  permissionMode: 'bypassPermissions'
};

/**
 * 示例 1: 分析单个 HackerNews 项目
 */
export async function analyzeSingleItem(item: HNItem): Promise<AnalysisResult> {
  console.log(`🔍 分析项目: ${item.title}`);
  console.log(`🤖 使用模型: ${ClaudeAnalyzer.getCurrentModel()}`);
  
  const analysis = await ClaudeAnalyzer.analyzeItem(item, exampleConfig);
  
  console.log('📊 分析结果:');
  console.log(`  标题: ${analysis.title}`);
  console.log(`  摘要: ${analysis.summary}`);
  console.log(`  相关性评分: ${analysis.relevanceScore}/10`);
  console.log(`  情绪: ${analysis.sentiment}`);
  console.log(`  标签: ${analysis.tags.join(', ')}`);
  console.log(`  关键点: ${analysis.keyPoints.join('; ')}`);
  
  return analysis;
}

/**
 * 示例 2: 批量分析多个项目
 */
export async function analyzeMultipleItems(items: HNItem[]): Promise<AnalysisResult[]> {
  console.log(`🔍 批量分析 ${items.length} 个项目...`);
  
  const analyses = await ClaudeAnalyzer.analyzeMultipleItems(items, exampleConfig);
  
  // 显示统计信息
  const stats = ClaudeAnalyzer.getAnalysisStats(analyses);
  console.log('📊 批量分析统计:');
  console.log(`  总项目数: ${stats.totalItems}`);
  console.log(`  平均相关性: ${stats.avgRelevance}`);
  console.log(`  情绪分布:`, stats.sentimentCounts);
  console.log(`  热门标签:`, stats.topTags.slice(0, 5).map(t => `${t.tag}(${t.count})`).join(', '));
  
  return analyses;
}

/**
 * 示例 3: 流式分析（实时显示结果）
 */
export async function streamAnalysis(items: HNItem[]): Promise<void> {
  console.log(`🔍 开始流式分析 ${items.length} 个项目...`);
  
  for await (const analysis of ClaudeAnalyzer.analyzeItemsStream(items, exampleConfig)) {
    console.log(`✅ ${analysis.title}: ${analysis.sentiment} (${analysis.relevanceScore}/10)`);
  }
  
  console.log('🎉 流式分析完成！');
}

/**
 * 示例 4: 生成综合趋势报告
 */
export async function generateComprehensiveReport(analyses: AnalysisResult[]): Promise<string> {
  console.log('📊 生成综合趋势报告...');
  
  const report = await ClaudeAnalyzer.generateTrendReport(analyses, exampleConfig);
  
  console.log('✅ 趋势报告生成完成');
  console.log('报告长度:', report.length, '字符');
  
  return report;
}

/**
 * 示例 5: 高级过滤和分析
 */
export function advancedFiltering(analyses: AnalysisResult[]): void {
  console.log('🔍 高级过滤和分析...');
  
  // 按相关性过滤
  const highRelevanceItems = ClaudeAnalyzer.filterByRelevance(analyses, 8);
  console.log(`高相关性项目 (≥8分): ${highRelevanceItems.length} 个`);
  
  // 按情绪过滤
  const positiveItems = ClaudeAnalyzer.filterBySentiment(analyses, 'positive');
  const negativeItems = ClaudeAnalyzer.filterBySentiment(analyses, 'negative');
  console.log(`积极情绪项目: ${positiveItems.length} 个`);
  console.log(`消极情绪项目: ${negativeItems.length} 个`);
  
  // 按标签过滤
  const aiRelatedItems = ClaudeAnalyzer.filterByTags(analyses, ['ai', 'artificial-intelligence', 'machine-learning']);
  console.log(`AI相关项目: ${aiRelatedItems.length} 个`);
  
  // 导出数据
  const exportedData = ClaudeAnalyzer.exportToJSON(analyses);
  console.log(`数据导出完成，大小: ${exportedData.length} 字符`);
}

/**
 * 示例 6: 自定义配置分析
 */
export async function customConfigAnalysis(items: HNItem[]): Promise<AnalysisResult[]> {
  // 自定义配置：更快的处理，更小的批次
  const fastConfig: AnalyzerConfig = {
    model: 'claude-3-5-sonnet-20241022',
    batchSize: 1,
    delayBetweenBatches: 500,
    allowedTools: ['Read', 'Grep'],
    permissionMode: 'bypassPermissions'
  };
  
  console.log('⚡ 使用快速配置进行分析...');
  
  const analyses = await ClaudeAnalyzer.analyzeMultipleItems(items, fastConfig);
  
  console.log(`✅ 快速分析完成，处理了 ${analyses.length} 个项目`);
  
  return analyses;
}

/**
 * 完整的使用示例
 */
export async function completeExample(items: HNItem[]): Promise<void> {
  console.log('🚀 开始完整的分析示例...\n');
  
  // 验证环境变量
  const envValidation = ClaudeAnalyzer.validateEnvironment();
  if (!envValidation.isValid) {
    console.error('❌ 环境变量验证失败:', envValidation.errors);
    return;
  }
  
  console.log(`🤖 当前使用模型: ${ClaudeAnalyzer.getCurrentModel()}\n`);
  
  try {
    // 1. 批量分析
    const analyses = await analyzeMultipleItems(items);
    console.log('');
    
    // 2. 生成趋势报告
    const report = await generateComprehensiveReport(analyses);
    console.log('');
    
    // 3. 高级过滤
    advancedFiltering(analyses);
    console.log('');
    
    // 4. 流式分析演示
    console.log('演示流式分析:');
    await streamAnalysis(items.slice(0, 2)); // 只分析前2个项目作为演示
    console.log('');
    
    console.log('🎉 完整示例执行完成！');
    
  } catch (error) {
    console.error('❌ 示例执行过程中出现错误:', error);
  }
}

// 导出所有示例函数
export {
  exampleConfig
};
