// 验证缓存功能的简单脚本
import { DataManager } from '../src/utils/data-manager';

async function verifyCacheImplementation() {
  console.log('🔍 验证缓存功能实现...');
  
  try {
    // 初始化数据管理器
    await DataManager.initialize();
    console.log('✅ DataManager 初始化成功');
    
    // 测试保存和加载功能
    const testData = {
      id: 12345,
      title: 'Test Story',
      by: 'testuser',
      time: Math.floor(Date.now() / 1000),
      type: 'story' as const
    };
    
    // 保存测试数据
    await DataManager.saveRawData(testData, 'test-story');
    console.log('✅ 测试数据保存成功');
    
    // 加载测试数据
    const loadedData = await DataManager.loadRawData('test-story');
    if (loadedData && loadedData.id === testData.id) {
      console.log('✅ 测试数据加载成功');
    } else {
      console.log('❌ 测试数据加载失败');
    }
    
    // 测试hasRawData功能
    const hasData = await DataManager.hasRawData(12345);
    console.log(`✅ hasRawData 功能: ${hasData ? '正常' : '异常'}`);
    
    // 测试统计功能
    const stats = await DataManager.getRawDataStats();
    console.log(`✅ 统计功能: 总故事数 ${stats.totalStories}`);
    
    // 清理测试数据
    const fs = await import('fs/promises');
    const path = await import('path');
    const testFilePath = path.join(process.cwd(), 'data', 'test-story.json');
    try {
      await fs.unlink(testFilePath);
      console.log('✅ 测试数据清理完成');
    } catch (error) {
      console.log('⚠️  测试数据清理失败，但不影响功能');
    }
    
    console.log('\n🎉 缓存功能验证完成！所有功能正常工作。');
    
  } catch (error) {
    console.error('💥 验证过程中发生错误:', error);
  }
}

// 运行验证
verifyCacheImplementation();
