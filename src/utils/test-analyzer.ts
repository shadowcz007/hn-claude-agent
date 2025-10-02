import { ClaudeAnalyzer, type AnalysisResult, type AnalyzerConfig } from './claude-analyzer';
import { HNItem } from './hn-api';

// 测试用的 HackerNews 项目数据
const testItems: HNItem[] = [
  {
    id: 1,
    title: "New JavaScript Framework Released",
    text: "A new JavaScript framework has been released that promises better performance and developer experience.",
    type: "story",
    url: "https://example.com/js-framework",
    time: Date.now() / 1000,
    by: "developer123",
    score: 150,
    descendants: 25
  },
  {
    id: 2,
    title: "AI in Software Development",
    text: "Discussion about how AI is changing the landscape of software development and coding practices.",
    type: "story",
    url: "https://example.com/ai-dev",
    time: Date.now() / 1000,
    by: "ai_researcher",
    score: 200,
    descendants: 40
  }
];

// 测试配置 - 使用环境变量中的模型
const testConfig: AnalyzerConfig = {
  model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
  batchSize: 2,
  delayBetweenBatches: 500,
  allowedTools: ['Read', 'Write', 'Edit', 'Grep', 'Glob'],
  permissionMode: 'bypassPermissions'
};

async function testAnalyzer() {
  console.log('🚀 开始测试 ClaudeAnalyzer...\n');

  // 验证环境变量
  const envValidation = ClaudeAnalyzer.validateEnvironment();
  if (!envValidation.isValid) {
    console.error('❌ 环境变量验证失败:', envValidation.errors);
    return;
  }
  
  console.log(`🤖 当前使用模型: ${ClaudeAnalyzer.getCurrentModel()}\n`);

  try {
    // 测试单个项目分析
    console.log('📊 测试单个项目分析...');
    const singleAnalysis = await ClaudeAnalyzer.analyzeItem(testItems[0], testConfig);
    console.log('✅ 单个分析结果:', {
      id: singleAnalysis.id,
      title: singleAnalysis.title,
      summary: singleAnalysis.summary.substring(0, 100) + '...',
      relevanceScore: singleAnalysis.relevanceScore,
      sentiment: singleAnalysis.sentiment,
      tags: singleAnalysis.tags
    });
    console.log('');

    // 测试批量分析
    console.log('📊 测试批量分析...');
    const batchAnalyses = await ClaudeAnalyzer.analyzeMultipleItems(testItems, testConfig);
    console.log(`✅ 批量分析完成，共 ${batchAnalyses.length} 个项目`);
    console.log('');

    // 测试统计分析
    console.log('📊 测试统计分析...');
    const stats = ClaudeAnalyzer.getAnalysisStats(batchAnalyses);
    console.log('✅ 分析统计:', stats);
    console.log('');

    // 测试过滤功能
    console.log('📊 测试过滤功能...');
    const highRelevanceItems = ClaudeAnalyzer.filterByRelevance(batchAnalyses, 7);
    const positiveItems = ClaudeAnalyzer.filterBySentiment(batchAnalyses, 'positive');
    console.log(`✅ 高相关性项目 (≥7分): ${highRelevanceItems.length} 个`);
    console.log(`✅ 积极情绪项目: ${positiveItems.length} 个`);
    console.log('');

    // 测试趋势报告生成
    console.log('📊 测试趋势报告生成...');
    const trendReport = await ClaudeAnalyzer.generateTrendReport(batchAnalyses, testConfig);
    console.log('✅ 趋势报告生成完成');
    console.log('报告预览:', trendReport.substring(0, 200) + '...');
    console.log('');

    // 测试流式分析
    console.log('📊 测试流式分析...');
    console.log('流式分析结果:');
    for await (const analysis of ClaudeAnalyzer.analyzeItemsStream(testItems, testConfig)) {
      console.log(`  - ${analysis.title}: ${analysis.sentiment} (${analysis.relevanceScore}/10)`);
    }
    console.log('');

    // 测试导出/导入功能
    console.log('📊 测试导出/导入功能...');
    const exportedJSON = ClaudeAnalyzer.exportToJSON(batchAnalyses);
    const importedAnalyses = ClaudeAnalyzer.importFromJSON(exportedJSON);
    console.log(`✅ 导出/导入测试完成，数据完整性: ${batchAnalyses.length === importedAnalyses.length ? '通过' : '失败'}`);
    console.log('');

    console.log('🎉 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  testAnalyzer().catch(console.error);
}

export { testAnalyzer };
