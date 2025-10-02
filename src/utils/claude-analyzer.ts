import { query, type Options } from '@anthropic-ai/claude-agent-sdk';
import { HNItem } from './hn-api';
import { EnvLoader } from './env-loader';

export interface AnalysisResult {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  technicalInsights: string[];
  trends: string[];
  tags: string[];
  generatedAt: Date;
}

export interface AnalyzerConfig {
  model?: string;
  batchSize?: number;
  delayBetweenBatches?: number; 
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan';
}

export class ClaudeAnalyzer {
  private static getDefaultConfig(): AnalyzerConfig {
    const env = EnvLoader.getEnv();
    return {
      model: env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      batchSize: 5,
      delayBetweenBatches: 1000,
      permissionMode: 'bypassPermissions'
    };
  }

  /**
   * 获取当前使用的模型名称
   */
  static getCurrentModel(): string {
    return this.getDefaultConfig().model || 'claude-3-5-sonnet-20241022';
  }

  /**
   * 验证环境变量配置 - 使用统一的环境变量加载器
   */
  static validateEnvironment(): { isValid: boolean; errors: string[] } {
    console.log('🔍 验证环境变量配置...');
    return EnvLoader.validateRequired();
  }

  /**
   * Analyze a HackerNews item using Claude Agent SDK
   */
  static async analyzeItem(item: HNItem, config: AnalyzerConfig = {}): Promise<AnalysisResult> {
    console.log(`\n🔍 开始分析 HackerNews 项目 ${item.id}...`);
    console.log(`📝 标题: ${item.title || '无标题'}`);
    console.log(`🔗 类型: ${item.type}`);
    console.log(`👤 作者: ${item.by || '未知'}`);
    console.log(`⭐ 评分: ${item.score || 0}`);
    
    // 验证环境变量
    const envValidation = this.validateEnvironment();
    if (!envValidation.isValid) {
      console.warn('⚠️  环境变量验证失败:', envValidation.errors);
    } else {
      console.log('✅ 环境变量验证通过');
    }

    const env = EnvLoader.getEnv();
    console.log('🤖 当前使用的模型:', env.ANTHROPIC_MODEL || this.getDefaultConfig().model);
    // Construct the prompt for Claude - 修改为中文分析策略，添加WebFetch失败处理
    const prompt = `
      请分析以下HackerNews项目，提供深度的技术趋势洞察：

      标题: ${item.title || ''}
      内容: ${item.text || ''}
      类型: ${item.type}
      链接: ${item.url || ''}

      重要说明：
      - 如果WebFetch工具无法获取链接内容（出现"The WebFetch tool failed to retrieve content from the provided URL"错误），请仅基于上述提供的标题、内容和类型信息进行分析
      - 不要尝试访问外部链接，专注于分析已有的信息
      - 基于标题和内容描述进行合理的技术分析推断

      请从以下维度进行专业分析：
      1. 内容摘要 - 基于标题和内容描述，简洁明了地总结核心内容
      2. 关键技术点 - 从标题和描述中提取重要的技术概念、工具或方法
      3. 技术洞察 - 分析技术价值、创新点或潜在影响
      4. 行业趋势 - 识别相关的技术趋势或发展方向
      5. 分类标签 - 用中文标签进行分类

      分析策略：
      - 如果信息有限，请基于标题和类型进行合理的推断分析
      - 重点关注技术关键词和行业趋势
      - 保持分析的客观性和专业性
      - 如果无法获取详细信息，也需要进行推断分析"

      重要提示：请用中文回答，并且只返回有效的JSON对象，不要包含任何解释性文字。

      JSON格式要求：
      {
        "summary": "内容的中文摘要",
        "keyPoints": ["关键技术点1", "关键技术点2"],
        "technicalInsights": ["技术洞察1", "技术洞察2"],
        "trends": ["相关趋势1", "相关趋势2"],
        "tags": ["标签1", "标签2", "标签3"]
      }
    `;

    try {
      // Use Claude Agent SDK for real analysis
      console.log('🚀 开始调用 Claude Agent SDK 进行分析...');
      const result = await this.queryClaude(prompt, config, item);
      
      console.log('✅ Claude 分析完成，生成结果...');
      const analysisResult = {
        id: `analysis-${item.id}`,
        title: item.title || `Item ${item.id}`,
        ...result,
        generatedAt: new Date()
      };
      
      console.log('📊 分析结果摘要:');
      console.log(`   📝 摘要长度: ${result.summary.length} 字符`);
      console.log(`   🔑 关键点数量: ${result.keyPoints.length}`);
      console.log(`   💡 技术洞察数量: ${result.technicalInsights.length}`);
      console.log(`   📈 趋势数量: ${result.trends.length}`);
      console.log(`   🏷️  标签数量: ${result.tags.length}`);
      
      return analysisResult;
    } catch (error) {
      console.error(`💥 分析项目 ${item.id} 时发生错误:`, error);
      console.error('错误详情:', error instanceof Error ? error.message : String(error));
      
      // Return a default analysis result in case of error
      console.log('🔄 返回默认分析结果...');
      const errorAnalysis = this.generateErrorAnalysis('分析过程出错');
      return {
        id: `analysis-${item.id}`,
        title: item.title || `Item ${item.id}`,
        ...errorAnalysis,
        generatedAt: new Date()
      };
    }
  }

  /**
   * Query Claude using the Agent SDK - 参考 create.js 的模式
   */
  private static async queryClaude(prompt: string, config: AnalyzerConfig = {}, item: HNItem): Promise<Omit<AnalysisResult, 'id' | 'title' | 'generatedAt'>> {
    const mergedConfig = { ...this.getDefaultConfig(), ...config };
    console.log('🤖 开始 Claude 查询...');
    console.log('⚙️  配置:', JSON.stringify(mergedConfig, null, 2));
    
    const queryResult = query({
      prompt,
      options: {
        model: mergedConfig.model,
        permissionMode: mergedConfig.permissionMode, 
        includePartialMessages: true, // 包含流式中间消息
        hooks: {
          SessionStart: [{
            hooks: [async(input) => {
              console.log('🚀 Claude 会话开始，ID:', input.session_id);
              return { continue: true };
            }]
          }],
          PreToolUse: [{
            hooks: [async(input: any) => {
              console.log(`🛠️  即将调用工具: ${input.tool_name || '未知工具'}`);
              console.log('📥 工具输入:', JSON.stringify(input.tool_input || {}, null, 2));
              return { continue: true };
            }]
          }],
          PostToolUse: [{
            hooks: [async(input: any) => {
              console.log(`✅ 工具 ${input.tool_name || '未知工具'} 执行完成`);
              return { continue: true };
            }]
          }],
          SessionEnd: [{
            hooks: [async(input) => {
              console.log('🔚 Claude 会话结束');
              return { continue: true };
            }]
          }]
        }
      }
    });

    let finalResult = '';
    let sessionInfo = { model: '', duration: 0, cost: 0, turns: 0 };
    
    for await (const message of queryResult) {
      switch (message.type) {
        case 'system':
          if (message.subtype === 'init') {
            console.log('✅ Claude 会话已启动，模型:', message.model);
            sessionInfo.model = message.model || '';
          } else if (message.subtype === 'compact_boundary') {
            console.log('🔄 Claude 对话历史已压缩');
          }
          break;

        case 'assistant':
          // 完整的助手回复（每轮结束时）
          console.log('🤖 Claude 助手回复:', message.message.content);
          break;

        case 'stream_event':
          // 流式中间内容（需开启 includePartialMessages）
          if (message.event.type === 'content_block_delta') {
            process.stdout.write(message.event.delta.text || '');
          }
          break;

        case 'result':
          if (message.subtype === 'success') {
            console.log('\n✅ Claude 任务完成！');
            console.log('⏱️  耗时:', message.duration_ms, 'ms');
            console.log('💰 花费: $', message.total_cost_usd.toFixed(6));
            console.log('📊 总轮次:', message.num_turns);
            finalResult = message.result;
            sessionInfo.duration = message.duration_ms;
            sessionInfo.cost = message.total_cost_usd;
            sessionInfo.turns = message.num_turns;
          } else {
            console.error('❌ Claude 执行出错:', message.subtype);
          }
          break;
      }
    }

    console.log('📝 Claude 原始响应:', finalResult);

    // 检查是否是 API 错误响应
    if (this.isApiError(finalResult)) {
      console.error('API Error detected:', finalResult);
      throw new Error(`API Error: ${finalResult}`);
    }

    // 检查是否是 WebFetch 错误
    if (this.isWebFetchError(finalResult)) {
      console.log('🔄 检测到WebFetch错误，使用基于已有信息的分析策略');
      return this.generateLimitedInfoAnalysis(item);
    }

    // Parse the JSON response from Claude
    try {
      // 尝试提取 JSON 部分，如果响应包含其他文本
      let jsonString = finalResult.trim();
      
      // 查找 JSON 对象的开始和结束位置
      const jsonStart = jsonString.indexOf('{');
      const jsonEnd = jsonString.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
      }
      
      const parsed = JSON.parse(jsonString);
      return {
        summary: parsed.summary || '无可用摘要',
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        technicalInsights: Array.isArray(parsed.technicalInsights) ? parsed.technicalInsights : [],
        trends: Array.isArray(parsed.trends) ? parsed.trends : [],
        tags: Array.isArray(parsed.tags) ? parsed.tags : []
      };
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      console.error('Raw response that failed to parse:', finalResult);
      
      // 如果解析失败，尝试从响应中提取一些信息
      const fallbackResult = this.extractFallbackAnalysis(finalResult);
      if (fallbackResult) {
        return fallbackResult;
      }
      
      // 最后的备用方案：使用模拟响应
      return this.processResponse({ 
        id: 0, 
        title: '', 
        text: '', 
        type: 'story', 
        url: '', 
        time: 0,
        by: '',
        score: 0,
        descendants: 0
      });
    }
  }

  /**
   * Check if the response is an API error
   */
  private static isApiError(response: string): boolean {
    const errorPatterns = [
      'API Error:',
      'Connection error',
      'Authentication failed',
      'Rate limit exceeded',
      'Service unavailable',
      'Internal server error',
      'Bad request',
      'Unauthorized',
      'Forbidden',
      'Not found'
    ];
    
    const lowerResponse = response.toLowerCase();
    return errorPatterns.some(pattern => lowerResponse.includes(pattern.toLowerCase()));
  }

  /**
   * Check if the response indicates WebFetch failure
   */
  private static isWebFetchError(response: string): boolean {
    const webFetchErrorPatterns = [
      'The WebFetch tool failed to retrieve content from the provided URL',
      'WebFetch tool failed',
      'failed to retrieve content',
      'unable to fetch content',
      'fetch error',
      'network error',
      'connection timeout'
    ];
    
    const lowerResponse = response.toLowerCase();
    return webFetchErrorPatterns.some(pattern => lowerResponse.includes(pattern.toLowerCase()));
  }

  /**
   * 生成统一的错误分析结果
   */
  private static generateErrorAnalysis(errorType: string = '分析失败'): Omit<AnalysisResult, 'id' | 'title' | 'generatedAt'> {
    return {
      summary: `${errorType}，无法获取完整分析结果`,
      keyPoints: ['分析失败'],
      technicalInsights: ['无法完成技术分析'],
      trends: ['无法识别技术趋势'],
      tags: ['错误', '分析失败']
    };
  }

  /**
   * Extract analysis from non-JSON response as fallback
   */
  private static extractFallbackAnalysis(response: string): Omit<AnalysisResult, 'id' | 'title' | 'generatedAt'> | null {
    console.log('🔄 使用备用分析方法');
    return this.generateErrorAnalysis('响应格式错误');
  }

  /**
   * Analyze multiple items and return a comprehensive report
   */
  static async analyzeMultipleItems(items: HNItem[], config: AnalyzerConfig = {}): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    const mergedConfig = { ...this.getDefaultConfig(), ...config };
    
    // Process items in batches to avoid overwhelming the API
    const batchSize = mergedConfig.batchSize || 5;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchPromises = batch.map(item => this.analyzeItem(item, config));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Add a small delay between batches to be respectful to the API
        if (i + batchSize < items.length) {
          await new Promise(resolve => setTimeout(resolve, mergedConfig.delayBetweenBatches || 1000));
        }
      } catch (error) {
        console.error(`Error processing batch ${i}-${i + batchSize}:`, error);
        // Continue with next batch even if one fails
      }
    }
    
    return results;
  }

  /**
   * Analyze items with streaming results for real-time updates
   */
  static async *analyzeItemsStream(items: HNItem[], config: AnalyzerConfig = {}): AsyncGenerator<AnalysisResult, void, unknown> {
    for (const item of items) {
      try {
        const analysis = await this.analyzeItem(item, config);
        yield analysis;
      } catch (error) {
        console.error(`Error analyzing item ${item.id}:`, error);
        // Yield a default result for failed items
        const errorAnalysis = this.generateErrorAnalysis('流式分析失败');
        yield {
          id: `analysis-${item.id}`,
          title: item.title || `Item ${item.id}`,
          ...errorAnalysis,
          generatedAt: new Date()
        };
      }
    }
  }

  /**
   * Process the item and extract structured data
   */
  static async processResponse(item: HNItem): Promise<Omit<AnalysisResult, 'id' | 'title' | 'generatedAt'>> {
    console.log('🔄 使用备用处理方法');
    return this.generateErrorAnalysis('备用处理');
  }

  /**
   * Generate analysis based on limited information when WebFetch fails
   */
  private static generateLimitedInfoAnalysis(item: HNItem): Omit<AnalysisResult, 'id' | 'title' | 'generatedAt'> {
    console.log('🔄 WebFetch失败，使用备用分析');
    return this.generateErrorAnalysis('WebFetch工具失败');
  }



  /**
   * Generate a comprehensive report from multiple analyses
   */
  static async generateTrendReport(analyses: AnalysisResult[], config: AnalyzerConfig = {}): Promise<string> {
    const prompt = `
      基于以下HackerNews项目的分析结果，请生成一份综合的技术趋势报告：

      ${analyses.map(analysis => `
        标题: ${analysis.title}
        摘要: ${analysis.summary}
        关键点: ${analysis.keyPoints.join(', ')}
        技术洞察: ${analysis.technicalInsights.join(', ')}
        趋势: ${analysis.trends.join(', ')}
        标签: ${analysis.tags.join(', ')}
      `).join('\n')}

      请提供：
      1. 主要趋势的执行摘要
      2. 关键技术发展
      3. 新兴技术或方法论
      4. 进一步调查的建议

      请用中文生成一份结构清晰的Markdown格式报告，包含明确的章节和深度洞察。
    `;

    try {
      // Use Claude Agent SDK for real report generation - 参考 create.js 的模式
      const mergedConfig = { ...this.getDefaultConfig(), ...config };
      console.log('📊 开始生成趋势报告...');
      console.log('⚙️  报告配置:', JSON.stringify(mergedConfig, null, 2));
      
      const queryResult = query({
        prompt,
        options: {
          model: mergedConfig.model,
          permissionMode: mergedConfig.permissionMode, 
          settingSources: [],
          includePartialMessages: true,
          hooks: {
            SessionStart: [{
              hooks: [async(input) => {
                console.log('🚀 报告生成会话开始，ID:', input.session_id);
                return { continue: true };
              }]
            }],
            PreToolUse: [{
              hooks: [async(input: any) => {
                console.log(`🛠️  报告生成即将调用工具: ${input.tool_name || '未知工具'}`);
                return { continue: true };
              }]
            }],
            PostToolUse: [{
              hooks: [async(input: any) => {
                console.log(`✅ 报告生成工具 ${input.tool_name || '未知工具'} 执行完成`);
                return { continue: true };
              }]
            }],
            SessionEnd: [{
              hooks: [async(input) => {
                console.log('🔚 报告生成会话结束');
                return { continue: true };
              }]
            }]
          }
        }
      });

      let finalResult = '';
      for await (const message of queryResult) {
        switch (message.type) {
          case 'system':
            if (message.subtype === 'init') {
              console.log('✅ 报告生成会话已启动，模型:', message.model);
            } else if (message.subtype === 'compact_boundary') {
              console.log('🔄 报告生成对话历史已压缩');
            }
            break;

          case 'assistant':
            console.log('🤖 报告生成助手回复:', message.message.content);
            break;

          case 'stream_event':
            if (message.event.type === 'content_block_delta') {
              process.stdout.write(message.event.delta.text || '');
            }
            break;

          case 'result':
            if (message.subtype === 'success') {
              console.log('\n✅ 报告生成任务完成！');
              console.log('⏱️  耗时:', message.duration_ms, 'ms');
              console.log('💰 花费: $', message.total_cost_usd.toFixed(6));
              console.log('📊 总轮次:', message.num_turns);
              finalResult = message.result;
            } else {
              console.error('❌ 报告生成执行出错:', message.subtype);
            }
            break;
        }
      }

      return finalResult || this.processReportResponse(analyses);
    } catch (error) {
      console.error('💥 生成趋势报告时发生错误:', error);
      return this.processReportResponse(analyses);
    }
  }

  /**
   * Process the analyses for trend report
   */
  static async processReportResponse(analyses: AnalysisResult[]): Promise<string> {
    // Generate a simple trend report based on analyses
    const totalItems = analyses.length;
    const allTags = analyses.flatMap(a => a.tags);
    const uniqueTags = Array.from(new Set(allTags));
    
    return `# 综合趋势报告
    
## 分析概览
- **总分析项目数**: ${totalItems}
- **主要标签**: ${uniqueTags.slice(0, 10).join(', ')}

## 报告说明
本报告总结了从HackerNews内容分析中识别的技术趋势。`;
  }

  /**
   * Get analysis statistics
   */
  static getAnalysisStats(analyses: AnalysisResult[]) {
    const totalItems = analyses.length;
    
    const allTags = analyses.flatMap(a => a.tags);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return {
      totalItems,
      topTags,
      totalTags: Object.keys(tagCounts).length
    };
  }


  /**
   * Filter analyses by tags
   */
  static filterByTags(analyses: AnalysisResult[], tags: string[]): AnalysisResult[] {
    return analyses.filter(analysis => 
      tags.some(tag => analysis.tags.includes(tag))
    );
  }

  /**
   * Export analyses to JSON
   */
  static exportToJSON(analyses: AnalysisResult[]): string {
    return JSON.stringify(analyses, null, 2);
  }

  /**
   * Import analyses from JSON
   */
  static importFromJSON(jsonString: string): AnalysisResult[] {
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error importing analyses from JSON:', error);
      return [];
    }
  }
}