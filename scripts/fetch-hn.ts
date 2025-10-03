// 使用统一的环境变量加载器 - 参考 create.js 的模式
import { EnvLoader } from '../src/utils/env-loader';

// 初始化环境变量加载器
const env = EnvLoader.initialize();

import { HackerNewsAPI } from '../src/utils/hn-api';
import { ClaudeAnalyzer } from '../src/utils/claude-analyzer';
import { DataManager } from '../src/utils/data-manager';
import { ProcessingTracker } from '../src/utils/processing-tracker';

async function fetchAndAnalyzeHN() {
  console.log('🚀 开始 HackerNews 数据获取和分析...');
  const startTime = Date.now();
  
  try {
    // Initialize data manager and processing tracker
    console.log('📊 初始化数据管理器和处理跟踪器...');
    await DataManager.initialize();
    await ProcessingTracker.initialize();
    console.log('✅ 数据管理器和处理跟踪器初始化完成');
    
    // Get current max item ID and new stories count for comparison
    console.log('🔍 检查是否有新数据...');
    const currentMaxItemId = await HackerNewsAPI.getMaxItemId();
    const newStoryIds = await HackerNewsAPI.getNewStories();
    const currentNewStoriesCount = newStoryIds.length;
    
    // Check if there are new stories to process
    const hasNewData = await ProcessingTracker.hasNewStories(currentMaxItemId, currentNewStoriesCount);
    
    if (!hasNewData) {
      console.log('ℹ️  没有发现新数据，跳过处理');
      console.log(`   当前最大项目ID: ${currentMaxItemId}`);
      console.log(`   当前新故事数量: ${currentNewStoriesCount}`);
      return;
    }
    
    console.log('🆕 发现新数据，开始处理...');
    console.log(`📈 发现 ${newStoryIds.length} 个最新故事`);
    
    // Take the first 50 latest stories
    const storiesToProcess = newStoryIds.slice(0, 50);
    console.log(`🎯 准备处理 ${storiesToProcess.length} 个最新故事`);
    
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const id of storiesToProcess) {
      const currentIndex = storiesToProcess.indexOf(id) + 1;
      console.log(`\n📝 [${currentIndex}/${storiesToProcess.length}] 处理故事 ${id}...`);
      
      try {
        // Check if this story has already been processed
        const isAlreadyProcessed = await ProcessingTracker.isStoryProcessed(id);
        if (isAlreadyProcessed) {
          console.log(`⏭️  故事 ${id} 已经处理过，跳过...`);
          await ProcessingTracker.addRecord({
            id: `story-${id}`,
            type: 'story',
            hnId: id,
            status: 'skipped'
          });
          skippedCount++;
          continue;
        }
        
        // 优先从本地缓存获取故事数据
        let story = await DataManager.loadRawStory(id);
        
        if (!story) {
          // 如果本地缓存中没有，从API获取
          console.log(`🌐 从API获取故事 ${id}...`);
          story = await HackerNewsAPI.getItem(id);
          
          if (!story) {
            console.log(`⚠️  故事 ${id} 未找到，跳过...`);
            await ProcessingTracker.addRecord({
              id: `story-${id}`,
              type: 'story',
              hnId: id,
              status: 'skipped',
              errorMessage: 'Story not found'
            });
            skippedCount++;
            continue;
          }
          
          // 保存原始HackerNews数据到缓存
          console.log(`💾 缓存原始数据...`);
          await DataManager.saveRawData(story, `story-${story.id}`);
        } else {
          console.log(`📁 从本地缓存加载故事 ${id}`);
        }
        
        if (story.deleted || story.dead) {
          console.log(`⚠️  故事 ${id} 已删除或失效，跳过...`);
          await ProcessingTracker.addRecord({
            id: `story-${id}`,
            type: 'story',
            hnId: id,
            status: 'skipped',
            errorMessage: 'Story deleted or dead'
          });
          skippedCount++;
          continue;
        }
        
        // Check if we already have an analysis for this story
        const existingAnalysis = await DataManager.loadAnalysis(`analysis-${story.id}`);
        if (existingAnalysis) {
          console.log(`⏭️  故事 ${id} 的分析已存在，跳过...`);
          await ProcessingTracker.addRecord({
            id: `analysis-${story.id}`,
            type: 'analysis',
            hnId: id,
            status: 'skipped',
            errorMessage: 'Analysis already exists'
          });
          skippedCount++;
          continue;
        }
        
        // Analyze the story with Claude
        console.log(`🤖 使用 Claude 分析故事 ${id}...`);
        const analysis = await ClaudeAnalyzer.analyzeItem(story);
        
        // Save the analysis
        console.log(`💾 保存分析结果...`);
        await DataManager.saveAnalysis(analysis);
        await ProcessingTracker.addRecord({
          id: `analysis-${analysis.id}`,
          type: 'analysis',
          hnId: id,
          status: 'success'
        });
        
        // Create and save the brief
        console.log(`📄 创建并保存摘要...`);
        const brief = DataManager.createBrief(story, analysis);
        await DataManager.saveBrief(brief);
        await ProcessingTracker.addRecord({
          id: brief.id,
          type: 'brief',
          hnId: id,
          status: 'success'
        });
        
        console.log(`✅ 成功处理并保存故事 ${id}`);
        processedCount++;
        
        // Add a small delay to be respectful to the APIs
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ 处理故事 ${id} 时出错:`, error);
        await ProcessingTracker.addRecord({
          id: `story-${id}`,
          type: 'story',
          hnId: id,
          status: 'error',
          errorMessage: error instanceof Error ? error.message : String(error)
        });
        errorCount++;
      }
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Update processing statistics
    const currentStats = await ProcessingTracker.getStats();
    await ProcessingTracker.updateStats({
      lastProcessedAt: new Date(),
      totalProcessed: currentStats.totalProcessed + processedCount,
      totalErrors: currentStats.totalErrors + errorCount,
      totalSkipped: currentStats.totalSkipped + skippedCount,
      lastMaxItemId: currentMaxItemId,
      lastNewStoriesCount: currentNewStoriesCount
    });
    
    // Clean up old records
    await ProcessingTracker.cleanupOldRecords();
    
    // 获取原始数据缓存统计
    const rawDataStats = await DataManager.getRawDataStats();
    
    console.log('\n🎉 HackerNews 最新故事数据获取和分析完成!');
    console.log('📊 处理统计:');
    console.log(`   📝 计划处理: ${storiesToProcess.length} 个最新故事`);
    console.log(`   ✅ 成功处理: ${processedCount} 个故事`);
    console.log(`   ⏭️  跳过: ${skippedCount} 个故事`);
    console.log(`   ❌ 错误: ${errorCount} 个故事`);
    console.log(`   ⏱️  总耗时: ${duration} 秒`);
    console.log(`   📈 当前最大项目ID: ${currentMaxItemId}`);
    console.log(`   📊 当前新故事数量: ${currentNewStoriesCount}`);
    console.log('\n💾 原始数据缓存统计:');
    console.log(`   📚 总缓存故事数: ${rawDataStats.totalStories}`);
    console.log(`   🗂️  最旧故事ID: ${rawDataStats.oldestStory || '无'}`);
    console.log(`   🗂️  最新故事ID: ${rawDataStats.newestStory || '无'}`);
    console.log(`   💽 缓存总大小: ${(rawDataStats.totalSize / 1024 / 1024).toFixed(2)} MB`);
  } catch (error) {
    console.error('💥 获取和分析过程中发生错误:', error);
    process.exit(1);
  }
}

// Run the function if this script is executed directly
// In ES modules, we can check if the script is being run directly by comparing import.meta.url
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchAndAnalyzeHN();
}

export default fetchAndAnalyzeHN;