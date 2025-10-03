// 测试HackerNews原始数据缓存功能
import { EnvLoader } from '../src/utils/env-loader';

// 初始化环境变量加载器
const env = EnvLoader.initialize();

import { HackerNewsAPI } from '../src/utils/hn-api';
import { DataManager } from '../src/utils/data-manager';

async function testCacheFunctionality() {
  console.log('🧪 开始测试HackerNews原始数据缓存功能...');
  
  try {
    // 初始化数据管理器
    await DataManager.initialize();
    console.log('✅ 数据管理器初始化完成');
    
    // 获取一个测试故事ID
    const newStoryIds = await HackerNewsAPI.getNewStories();
    if (newStoryIds.length === 0) {
      console.log('⚠️  没有可用的新故事进行测试');
      return;
    }
    
    const testStoryId = newStoryIds[0];
    console.log(`🎯 使用故事ID ${testStoryId} 进行测试`);
    
    // 测试1: 检查缓存是否存在
    console.log('\n📋 测试1: 检查缓存状态');
    const hasCached = await DataManager.hasRawData(testStoryId);
    console.log(`   缓存状态: ${hasCached ? '✅ 已存在' : '❌ 不存在'}`);
    
    // 测试2: 从API获取数据并缓存
    console.log('\n📋 测试2: 从API获取数据并缓存');
    const story = await HackerNewsAPI.getItem(testStoryId);
    if (story) {
      await DataManager.saveRawData(story, `story-${story.id}`);
      console.log(`   ✅ 成功缓存故事 ${story.id}`);
    } else {
      console.log('   ❌ 无法获取故事数据');
      return;
    }
    
    // 测试3: 从缓存加载数据
    console.log('\n📋 测试3: 从缓存加载数据');
    const cachedStory = await DataManager.loadRawStory(testStoryId);
    if (cachedStory) {
      console.log(`   ✅ 成功从缓存加载故事 ${cachedStory.id}`);
      console.log(`   📝 标题: ${cachedStory.title || '无标题'}`);
      console.log(`   👤 作者: ${cachedStory.by || '未知'}`);
      console.log(`   ⏰ 时间: ${new Date(cachedStory.time * 1000).toISOString()}`);
    } else {
      console.log('   ❌ 无法从缓存加载数据');
    }
    
    // 测试4: 获取缓存统计
    console.log('\n📋 测试4: 获取缓存统计');
    const stats = await DataManager.getRawDataStats();
    console.log(`   📚 总缓存故事数: ${stats.totalStories}`);
    console.log(`   🗂️  最旧故事ID: ${stats.oldestStory || '无'}`);
    console.log(`   🗂️  最新故事ID: ${stats.newestStory || '无'}`);
    console.log(`   💽 缓存总大小: ${(stats.totalSize / 1024).toFixed(2)} KB`);
    
    // 测试5: 获取所有缓存的Story IDs
    console.log('\n📋 测试5: 获取所有缓存的Story IDs');
    const cachedIds = await DataManager.getCachedStoryIds();
    console.log(`   📋 缓存的Story IDs: ${cachedIds.slice(0, 10).join(', ')}${cachedIds.length > 10 ? '...' : ''}`);
    console.log(`   📊 总数: ${cachedIds.length}`);
    
    console.log('\n🎉 缓存功能测试完成!');
    
  } catch (error) {
    console.error('💥 测试过程中发生错误:', error);
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testCacheFunctionality();
}

export default testCacheFunctionality;
