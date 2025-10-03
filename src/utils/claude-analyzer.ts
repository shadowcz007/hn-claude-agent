import { query, type Options } from '@anthropic-ai/claude-agent-sdk';
import { HNItem } from './hn-api';
import { EnvLoader } from './env-loader';
import jinaMcp from './jina-mcp';

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
    // Construct the prompt for Claude - 修改为中文分析策略， 
    const prompt = `
      请分析以下HackerNews项目，提供深度的技术趋势洞察：

      标题: ${item.title || ''}
      内容: ${item.text || ''}
      类型: ${item.type}
      链接: ${item.url || ''}

      重要说明：
      - 优先使用 jinaReader 工具获取链接内容
      - 如果相关工具无法获取链接内容，请仅基于上述提供的标题、内容和类型信息进行分析
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

      重要提示：
      - 请用中文回答，并且只返回有效的JSON对象，不要包含任何解释性文字。
      - 如果无直接技术点，应返回[]
      - 如果无相关技术趋势，应返回[]
      - 如果无技术洞察，应返回[]
      - 如果无行业趋势，应返回[]
      - 如果无分类标签，应返回[]

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

    // 获取环境变量配置 - 参考 news.js 的方式
    const env = EnvLoader.getEnv();
    const targetDir = process.cwd();

    const queryResult = query({
      prompt,
      options: {
        env, // 添加环境变量配置
        cwd: targetDir, // 添加工作目录
        model: mergedConfig.model,
        permissionMode: mergedConfig.permissionMode,
        includePartialMessages: true, // 包含流式中间消息
        mcpServers: {
          ...jinaMcp
        },
        disallowedTools: [
          'WebSearch', 
          'Task',
          'Bash',
          'Glob',
          'Grep',
          'ExitPlanMode',
          'Read',
          'Edit',
          'Write',
          'NotebookEdit',
          'TodoWrite',
          'BashOutput',
          'KillShell',
          'SlashCommand'
        ],
        hooks: {
          SessionStart: [{
            hooks: [async (input) => {
              console.log('🚀 Claude 会话开始，ID:', input.session_id);
              return { continue: true };
            }]
          }],
          PreToolUse: [{
            hooks: [async (input: any) => {
              console.log(`🛠️  即将调用工具: ${input.tool_name || '未知工具'}`);
              console.log('📥 工具输入:', JSON.stringify(input.tool_input || {}, null, 2));
              return { continue: true };
            }]
          }],
          PostToolUse: [{
            hooks: [async (input: any) => {
              console.log(`✅ 工具 ${input.tool_name || '未知工具'} 执行完成`);
              return { continue: true };
            }]
          }],
          SessionEnd: [{
            hooks: [async (input) => {
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
            console.log('✅  cwd', message.cwd);
            console.log('✅  tools', message.tools);
            console.log('✅  mcp_servers', message.mcp_servers);

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

            const text = message.event.delta?.text || '';
            const thinking = message.event.delta?.thinking || '';

            if (text) {
              // 所有内容都直接输出到控制台
              process.stdout.write(text);
            }
            if (thinking) {
              // 所有内容都直接输出到控制台
              process.stdout.write(thinking);
            }

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

    // Parse the JSON response from Claude with robust extraction
    try {
      // 使用新的智能JSON提取方法
      const extractedResult = this.extractRobustJSON(finalResult);

      if (extractedResult) {
        return extractedResult;
      }

      // 如果智能提取失败，回退到原来的备用方法
      console.log('🔄 智能JSON提取失败，使用备用分析方法');
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
    } catch (parseError) {
      console.error('Error in JSON extraction process:', parseError);
      console.error('Raw response that failed to parse:', finalResult);

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
   * Robust JSON extraction with multiple fallback strategies
   */
  private static extractRobustJSON(rawResponse: string): Omit<AnalysisResult, 'id' | 'title' | 'generatedAt'> | null {
    console.log('🔍 开始智能JSON提取...');

    // Strategy 1: Clean the response string
    let cleanResponse = rawResponse.trim();

    // Remove any BOM or invisible characters
    cleanResponse = cleanResponse.replace(/^\uFEFF/, '').replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

    // Strategy 2: Try to find JSON boundaries
    const jsonStart = cleanResponse.indexOf('{');
    const jsonEnd = cleanResponse.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      console.log('❌ 未找到有效的JSON边界');
      return null;
    }

    let jsonCandidate = cleanResponse.substring(jsonStart, jsonEnd + 1);

    // Strategy 3: Try multiple parsing attempts with different approaches
    const parseAttempts = [
      () => JSON.parse(jsonCandidate),
      () => {
        // Try to fix common JSON issues
        let fixed = jsonCandidate
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":') // Quote unquoted keys
          .replace(/:\s*'([^']*)'/g, ':"$1"'); // Convert single quotes to double quotes
        return JSON.parse(fixed);
      },
      () => {
        // Try to extract only the structured parts we need
        const summaryMatch = jsonCandidate.match(/"summary"\s*:\s*"([^"]+)"/);
        const keyPointsMatch = jsonCandidate.match(/"keyPoints"\s*:\s*\[(.*?)\]/);
        const insightsMatch = jsonCandidate.match(/"technicalInsights"\s*:\s*\[(.*?)\]/);
        const trendsMatch = jsonCandidate.match(/"trends"\s*:\s*\[(.*?)\]/);
        const tagsMatch = jsonCandidate.match(/"tags"\s*:\s*\[(.*?)\]/);

        if (summaryMatch) {
          return {
            summary: summaryMatch[1],
            keyPoints: this.parseArrayFromString(keyPointsMatch ? keyPointsMatch[1] : ''),
            technicalInsights: this.parseArrayFromString(insightsMatch ? insightsMatch[1] : ''),
            trends: this.parseArrayFromString(trendsMatch ? trendsMatch[1] : ''),
            tags: this.parseArrayFromString(tagsMatch ? tagsMatch[1] : '')
          };
        }
        return null;
      }
    ];

    for (let i = 0; i < parseAttempts.length; i++) {
      try {
        const result = parseAttempts[i]();
        if (result && this.isValidAnalysisResult(result)) {
          console.log(`✅ JSON解析成功 (策略 ${i + 1})`);
          return result;
        }
      } catch (error) {
        console.log(`❌ 解析策略 ${i + 1} 失败:`, error instanceof Error ? error.message : String(error));
      }
    }

    console.log('❌ 所有JSON解析策略都失败了');
    return null;
  }

  /**
   * Parse array from string with fallback strategies
   */
  private static parseArrayFromString(arrayString: string): string[] {
    if (!arrayString || arrayString.trim() === '') {
      return [];
    }

    try {
      // First try: direct JSON parse
      return JSON.parse(`[${arrayString}]`);
    } catch {
      // Fallback: manual parsing
      const items = arrayString
        .split(',')
        .map(item => item.trim().replace(/^["']|["']$/g, ''))
        .filter(item => item.length > 0);
      return items;
    }
  }

  /**
   * Validate if the parsed result has the expected structure
   */
  private static isValidAnalysisResult(result: any): boolean {
    return (
      result &&
      typeof result === 'object' &&
      typeof result.summary === 'string' &&
      Array.isArray(result.keyPoints) &&
      Array.isArray(result.technicalInsights) &&
      Array.isArray(result.trends) &&
      Array.isArray(result.tags)
    );
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
              hooks: [async (input) => {
                console.log('🚀 报告生成会话开始，ID:', input.session_id);
                return { continue: true };
              }]
            }],
            PreToolUse: [{
              hooks: [async (input: any) => {
                console.log(`🛠️  报告生成即将调用工具: ${input.tool_name || '未知工具'}`);
                return { continue: true };
              }]
            }],
            PostToolUse: [{
              hooks: [async (input: any) => {
                console.log(`✅ 报告生成工具 ${input.tool_name || '未知工具'} 执行完成`);
                return { continue: true };
              }]
            }],
            SessionEnd: [{
              hooks: [async (input) => {
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