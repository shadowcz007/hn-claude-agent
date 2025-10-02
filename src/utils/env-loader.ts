// 统一的环境变量加载工具 - 参考 create.js 的模式
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

export interface EnvConfig {
  ANTHROPIC_AUTH_TOKEN?: string;
  ANTHROPIC_BASE_URL?: string;
  ANTHROPIC_MODEL?: string;
  ANTHROPIC_DEFAULT_HAIKU_MODEL?: string;
  ANTHROPIC_DEFAULT_OPUS_MODEL?: string;
  ANTHROPIC_DEFAULT_SONNET_MODEL?: string;
  CLAUDE_CODE_SUBAGENT_MODEL?: string;
}

export class EnvLoader {
  private static env: EnvConfig = {};
  private static initialized = false;

  /**
   * 初始化环境变量加载器
   * @param customPath 自定义 .env.local 文件路径
   */
  static initialize(customPath?: string): EnvConfig {
    if (this.initialized) {
      return this.env;
    }

    console.log('🔧 初始化环境变量加载器...');

    try {
      // 获取当前文件的目录
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);

      // 确定 .env.local 文件路径
      const envPath = customPath || join(__dirname, '..', '..', '.env.local');
      
      console.log('📁 环境变量文件路径:', envPath);

      // 获取 dotenv 解析结果 - 参考 create.js 的环境变量加载方式
      const dotenvResult = dotenv.config({ path: envPath });

      // 单独获取环境变量
      const envLocal = dotenvResult.parsed || {};

      // 合并环境变量
      this.env = {
        ...process.env,
        ANTHROPIC_AUTH_TOKEN: process.env.ANTHROPIC_AUTH_TOKEN,
        ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL,
        ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
        ANTHROPIC_DEFAULT_HAIKU_MODEL: process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL,
        ANTHROPIC_DEFAULT_OPUS_MODEL: process.env.ANTHROPIC_DEFAULT_OPUS_MODEL,
        ANTHROPIC_DEFAULT_SONNET_MODEL: process.env.ANTHROPIC_DEFAULT_SONNET_MODEL,
        CLAUDE_CODE_SUBAGENT_MODEL: process.env.CLAUDE_CODE_SUBAGENT_MODEL,
        ...envLocal
      };

      this.initialized = true;
      this.logEnvStatus();
      
      return this.env;
    } catch (error) {
      console.error('❌ 环境变量加载失败:', error);
      this.env = {
        ANTHROPIC_AUTH_TOKEN: process.env.ANTHROPIC_AUTH_TOKEN,
        ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL,
        ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
        ANTHROPIC_DEFAULT_HAIKU_MODEL: process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL,
        ANTHROPIC_DEFAULT_OPUS_MODEL: process.env.ANTHROPIC_DEFAULT_OPUS_MODEL,
        ANTHROPIC_DEFAULT_SONNET_MODEL: process.env.ANTHROPIC_DEFAULT_SONNET_MODEL,
        CLAUDE_CODE_SUBAGENT_MODEL: process.env.CLAUDE_CODE_SUBAGENT_MODEL,
      };
      this.initialized = true;
      return this.env;
    }
  }

  /**
   * 获取环境变量配置
   */
  static getEnv(): EnvConfig {
    if (!this.initialized) {
      return this.initialize();
    }
    return this.env;
  }

  /**
   * 显示当前环境变量状态
   */
  private static logEnvStatus(): void {
    console.log('🚀 环境变量加载状态:');
    console.log('📁 工作目录:', process.cwd());
    console.log('🔑 ANTHROPIC_AUTH_TOKEN:', this.env.ANTHROPIC_AUTH_TOKEN ? '已设置' : '未设置');
    console.log('🌐 ANTHROPIC_BASE_URL:', this.env.ANTHROPIC_BASE_URL || '使用默认值');
    console.log('🤖 ANTHROPIC_MODEL:', this.env.ANTHROPIC_MODEL || '使用默认值');
    
    // 显示其他可选环境变量
    const optionalVars = [
      'ANTHROPIC_DEFAULT_HAIKU_MODEL',
      'ANTHROPIC_DEFAULT_OPUS_MODEL', 
      'ANTHROPIC_DEFAULT_SONNET_MODEL',
      'CLAUDE_CODE_SUBAGENT_MODEL'
    ];
    
    optionalVars.forEach(varName => {
      const value = this.env[varName as keyof EnvConfig];
      if (value) {
        console.log(`✅ ${varName}: ${value}`);
      }
    });
  }

  /**
   * 验证必需的环境变量
   */
  static validateRequired(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    console.log('🔍 验证必需的环境变量...');
    
    if (!this.env.ANTHROPIC_AUTH_TOKEN) {
      errors.push('ANTHROPIC_AUTH_TOKEN 环境变量未设置');
      console.log('❌ ANTHROPIC_AUTH_TOKEN 未设置');
    } else {
      console.log('✅ ANTHROPIC_AUTH_TOKEN 已设置');
    }
    
    const isValid = errors.length === 0;
    console.log(isValid ? '✅ 环境变量验证通过' : '❌ 环境变量验证失败');
    
    return {
      isValid,
      errors
    };
  }

  /**
   * 获取特定环境变量
   */
  static get(key: keyof EnvConfig): string | undefined {
    if (!this.initialized) {
      this.initialize();
    }
    return this.env[key];
  }

  /**
   * 重置环境变量加载器（主要用于测试）
   */
  static reset(): void {
    this.initialized = false;
    this.env = {};
  }
}

// 自动初始化
EnvLoader.initialize();
