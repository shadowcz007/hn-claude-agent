/**
 * 应用配置文件
 * 用于管理各种应用设置，包括tags黑名单等
 */

export interface AppConfig {
  // Tags黑名单配置
  tagsBlacklist: {
    // 错误相关的tags
    errorTags: string[];
    // 通用但无意义的tags
    genericTags: string[];
    // 过于宽泛的tags
    broadTags: string[];
    // 自定义黑名单
    customBlacklist: string[];
  };
  
  // 趋势聚合配置
  trendsConfig: {
    // 最大显示趋势数量
    maxTrends: number;
    // 最小出现次数阈值
    minOccurrenceThreshold: number;
    // 是否启用黑名单过滤
    enableBlacklistFilter: boolean;
  };
}

/**
 * 默认配置
 */
export const defaultConfig: AppConfig = {
  tagsBlacklist: {
    // 错误相关的tags - 这些不应该出现在趋势中
    errorTags: [
      '错误',
      '分析失败',
      '无法完成',
      '无法识别',
      '分析过程出错'
    ],
    
    // 通用但无意义的tags - 这些太宽泛，对趋势分析没有价值
    genericTags: [
      '技术',
      '科技',
      '创新',
      '发展',
      '未来',
      '趋势',
      '行业',
      '市场',
      '商业',
      '产品',
      '服务',
      '平台',
      '系统',
      '应用',
      '工具',
      '方法',
      '解决方案',
      '技术分析',
      '行业趋势',
      '市场动态',
      '技术变革'
    ],
    
    // 过于宽泛的tags - 这些标签太通用，不能提供有价值的趋势洞察
    broadTags: [
      '趋势',
      '技术趋势',
      '技术创新',
      '软件',
      '软件开发',
      '软件工程',
      '软件架构',
      '软件设计',
      '软件测试',
      '软件维护',
      '软件优化',
      '硬件',
      '数据',
      '信息',
      '网络',
      '互联网',
      '数字化',
      '自动化',
      '智能化',
      '云计算',
      '大数据',
      '人工智能',
      'AI',
      '机器学习',
      '深度学习',
      '区块链',
      '物联网',
      '移动应用',
      'Web开发',
      '前端',
      '后端',
      '数据库',
      '算法',
      '编程',
      '开发',
      '设计',
      '用户体验',
      '界面设计',
      '性能',
      '安全',
      '隐私',
      '开源',
      '免费',
      '付费',
      '商业模式',
      '创业',
      '投资',
      '融资',
      '上市',
      '收购',
      '合并'
    ],
    
    // 自定义黑名单 - 可以根据实际使用情况动态添加
    customBlacklist: [
      // 可以在这里添加其他需要过滤的tags
    ]
  },
  
  trendsConfig: {
    maxTrends: 10,
    minOccurrenceThreshold: 2, // 至少出现2次才显示在趋势中
    enableBlacklistFilter: true
  }
};

/**
 * 配置管理器
 */
export class ConfigManager {
  private static config: AppConfig = defaultConfig;
  
  /**
   * 获取当前配置
   */
  static getConfig(): AppConfig {
    return this.config;
  }
  
  /**
   * 更新配置
   */
  static updateConfig(newConfig: Partial<AppConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  /**
   * 获取所有黑名单tags
   */
  static getAllBlacklistedTags(): string[] {
    const { tagsBlacklist } = this.config;
    return [
      ...tagsBlacklist.errorTags,
      ...tagsBlacklist.genericTags,
      ...tagsBlacklist.broadTags,
      ...tagsBlacklist.customBlacklist
    ];
  }
  
  /**
   * 检查tag是否在黑名单中
   */
  static isTagBlacklisted(tag: string): boolean {
    const blacklistedTags = this.getAllBlacklistedTags();
    return blacklistedTags.includes(tag);
  }
  
  /**
   * 添加自定义黑名单tag
   */
  static addToBlacklist(tag: string): void {
    if (!this.config.tagsBlacklist.customBlacklist.includes(tag)) {
      this.config.tagsBlacklist.customBlacklist.push(tag);
    }
  }
  
  /**
   * 从黑名单中移除tag
   */
  static removeFromBlacklist(tag: string): void {
    const index = this.config.tagsBlacklist.customBlacklist.indexOf(tag);
    if (index > -1) {
      this.config.tagsBlacklist.customBlacklist.splice(index, 1);
    }
  }
  
  /**
   * 过滤tags数组，移除黑名单中的tags
   */
  static filterTags(tags: string[]): string[] {
    if (!this.config.trendsConfig.enableBlacklistFilter) {
      return tags;
    }
    
    return tags.filter(tag => !this.isTagBlacklisted(tag));
  }
}
