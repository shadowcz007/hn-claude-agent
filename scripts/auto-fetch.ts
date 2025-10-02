#!/usr/bin/env node

// 使用统一的环境变量加载器
import { EnvLoader } from '../src/utils/env-loader';

// 初始化环境变量加载器
const env = EnvLoader.initialize();

import { ProcessingTracker } from '../src/utils/processing-tracker';
import { HackerNewsAPI } from '../src/utils/hn-api';
import fetchAndAnalyzeHN from './fetch-hn';

export interface AutoFetchConfig {
  checkIntervalMinutes: number;
  maxIdleHours: number;
  enableSmartScheduling: boolean;
  quietMode: boolean;
}

export class AutoFetchManager {
  private config: AutoFetchConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private lastActivityCheck = new Date();

  constructor(config: Partial<AutoFetchConfig> = {}) {
    this.config = {
      checkIntervalMinutes: config.checkIntervalMinutes || 15, // 默认15分钟检查一次
      maxIdleHours: config.maxIdleHours || 2, // 默认2小时无活动后停止
      enableSmartScheduling: config.enableSmartScheduling !== false,
      quietMode: config.quietMode || false
    };
  }

  /**
   * 启动自动获取管理器
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.log('⚠️  自动获取管理器已经在运行中');
      return;
    }

    this.log('🚀 启动 HackerNews 智能自动获取管理器...');
    this.log(`⏰ 检查间隔: ${this.config.checkIntervalMinutes} 分钟`);
    this.log(`😴 最大空闲时间: ${this.config.maxIdleHours} 小时`);
    this.log(`🧠 智能调度: ${this.config.enableSmartScheduling ? '启用' : '禁用'}`);

    // 初始化处理跟踪器
    await ProcessingTracker.initialize();

    // 立即执行一次检查
    await this.performCheck();

    // 设置定时器
    this.intervalId = setInterval(async () => {
      await this.performCheck();
    }, this.config.checkIntervalMinutes * 60 * 1000);

    this.isRunning = true;
    this.log('✅ 自动获取管理器启动成功');

    // 设置优雅关闭
    this.setupGracefulShutdown();
  }

  /**
   * 停止自动获取管理器
   */
  stop(): void {
    if (!this.isRunning) {
      this.log('⚠️  自动获取管理器未在运行');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    this.log('🛑 自动获取管理器已停止');
  }

  /**
   * 执行检查
   */
  private async performCheck(): Promise<void> {
    const now = new Date();
    this.log(`\n🔍 [${now.toISOString()}] 执行智能检查...`);

    try {
      // 检查是否有新数据
      const hasNewData = await this.checkForNewData();
      
      if (hasNewData) {
        this.log('🆕 发现新数据，开始处理...');
        await fetchAndAnalyzeHN();
        this.lastActivityCheck = now;
        this.log('✅ 数据处理完成');
      } else {
        this.log('ℹ️  没有新数据，跳过处理');
        
        // 检查是否应该进入空闲模式
        if (this.shouldEnterIdleMode()) {
          this.log(`😴 已空闲超过 ${this.config.maxIdleHours} 小时，进入空闲模式`);
          this.log('💡 提示: 可以停止自动获取管理器以节省资源');
        }
      }

      // 清理旧记录
      await ProcessingTracker.cleanupOldRecords();
      
    } catch (error) {
      this.log(`❌ 检查过程中发生错误: ${error}`);
    }
  }

  /**
   * 检查是否有新数据
   */
  private async checkForNewData(): Promise<boolean> {
    try {
      const currentMaxItemId = await HackerNewsAPI.getMaxItemId();
      const newStoryIds = await HackerNewsAPI.getNewStories();
      const currentNewStoriesCount = newStoryIds.length;

      const hasNewData = await ProcessingTracker.hasNewStories(currentMaxItemId, currentNewStoriesCount);
      
      if (!this.config.quietMode) {
        this.log(`📊 数据状态: 最大ID=${currentMaxItemId}, 新故事=${currentNewStoriesCount}, 有新数据=${hasNewData}`);
      }
      
      return hasNewData;
    } catch (error) {
      this.log(`❌ 检查新数据时出错: ${error}`);
      return false;
    }
  }

  /**
   * 检查是否应该进入空闲模式
   */
  private shouldEnterIdleMode(): boolean {
    const hoursSinceLastActivity = (Date.now() - this.lastActivityCheck.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastActivity > this.config.maxIdleHours;
  }

  /**
   * 设置优雅关闭
   */
  private setupGracefulShutdown(): void {
    const shutdown = () => {
      this.log('\n🛑 收到关闭信号，正在停止自动获取管理器...');
      this.stop();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  /**
   * 获取状态信息
   */
  async getStatus(): Promise<{
    isRunning: boolean;
    config: AutoFetchConfig;
    lastActivityCheck: Date;
    nextCheck?: Date;
    processingStats: any;
  }> {
    const status: any = {
      isRunning: this.isRunning,
      config: this.config,
      lastActivityCheck: this.lastActivityCheck,
      processingStats: await ProcessingTracker.getStats()
    };

    if (this.isRunning && this.intervalId) {
      status.nextCheck = new Date(Date.now() + this.config.checkIntervalMinutes * 60 * 1000);
    }

    return status;
  }

  /**
   * 手动触发检查
   */
  async triggerCheck(): Promise<void> {
    this.log('🔧 手动触发检查...');
    await this.performCheck();
  }

  /**
   * 日志输出
   */
  private log(message: string): void {
    if (!this.config.quietMode) {
      console.log(message);
    }
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const manager = new AutoFetchManager({
    checkIntervalMinutes: parseInt(process.env.AUTO_FETCH_INTERVAL_MINUTES || '15'),
    maxIdleHours: parseInt(process.env.AUTO_FETCH_MAX_IDLE_HOURS || '2'),
    enableSmartScheduling: process.env.AUTO_FETCH_SMART_SCHEDULING !== 'false',
    quietMode: process.env.AUTO_FETCH_QUIET_MODE === 'true'
  });

  switch (command) {
    case 'start':
      await manager.start();
      
      // 保持进程运行
      console.log('📡 自动获取管理器正在运行，按 Ctrl+C 停止...');
      break;

    case 'stop':
      manager.stop();
      break;

    case 'status':
      const status = await manager.getStatus();
      console.log('📊 自动获取管理器状态:');
      console.log(`   运行状态: ${status.isRunning ? '运行中' : '已停止'}`);
      console.log(`   检查间隔: ${status.config.checkIntervalMinutes} 分钟`);
      console.log(`   最大空闲时间: ${status.config.maxIdleHours} 小时`);
      console.log(`   智能调度: ${status.config.enableSmartScheduling ? '启用' : '禁用'}`);
      console.log(`   静默模式: ${status.config.quietMode ? '启用' : '禁用'}`);
      console.log(`   最后活动检查: ${status.lastActivityCheck.toISOString()}`);
      if (status.nextCheck) {
        console.log(`   下次检查: ${status.nextCheck.toISOString()}`);
      }
      console.log('\n📈 处理统计:');
      console.log(`   最后处理时间: ${status.processingStats.lastProcessedAt.toISOString()}`);
      console.log(`   总处理数量: ${status.processingStats.totalProcessed}`);
      console.log(`   总错误数量: ${status.processingStats.totalErrors}`);
      console.log(`   总跳过数量: ${status.processingStats.totalSkipped}`);
      console.log(`   最后最大项目ID: ${status.processingStats.lastMaxItemId}`);
      break;

    case 'check':
      await manager.triggerCheck();
      break;

    default:
      console.log('使用方法:');
      console.log('  npm run auto-fetch start   - 启动自动获取管理器');
      console.log('  npm run auto-fetch stop    - 停止自动获取管理器');
      console.log('  npm run auto-fetch status  - 查看状态');
      console.log('  npm run auto-fetch check   - 手动触发检查');
      console.log('');
      console.log('环境变量:');
      console.log('  AUTO_FETCH_INTERVAL_MINUTES    - 检查间隔（分钟），默认15');
      console.log('  AUTO_FETCH_MAX_IDLE_HOURS      - 最大空闲时间（小时），默认2');
      console.log('  AUTO_FETCH_SMART_SCHEDULING    - 启用智能调度，默认true');
      console.log('  AUTO_FETCH_QUIET_MODE          - 静默模式，默认false');
      break;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('💥 自动获取管理器启动失败:', error);
    process.exit(1);
  });
}

export default AutoFetchManager;
