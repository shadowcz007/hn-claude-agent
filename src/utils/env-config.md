# 环境变量配置说明

## 必需的环境变量

### ANTHROPIC_API_KEY
- **描述**: Anthropic API 密钥
- **类型**: 字符串
- **必需**: 是
- **示例**: `sk-ant-api03-...`

## 可选的环境变量

### ANTHROPIC_MODEL
- **描述**: 指定使用的 Claude 模型
- **类型**: 字符串
- **必需**: 否（有默认值）
- **默认值**: `claude-3-5-sonnet-20241022`
- **可选值**:
  - `claude-3-5-sonnet-20241022` - 默认推荐模型，平衡性能和成本
  - `claude-3-5-haiku-20241022` - 更快，成本更低，适合简单任务
  - `claude-3-opus-20240229` - 更强大，成本更高，适合复杂任务

## 配置示例

### .env 文件示例
```bash
# 必需配置
ANTHROPIC_API_KEY=sk-ant-api03-your-api-key-here

# 可选配置
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### 环境变量设置示例

#### Linux/macOS
```bash
export ANTHROPIC_API_KEY="sk-ant-api03-your-api-key-here"
export ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
```

#### Windows
```cmd
set ANTHROPIC_API_KEY=sk-ant-api03-your-api-key-here
set ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

#### Docker
```dockerfile
ENV ANTHROPIC_API_KEY=sk-ant-api03-your-api-key-here
ENV ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

## 模型选择建议

### claude-3-5-sonnet-20241022 (推荐)
- **适用场景**: 大多数分析任务
- **特点**: 平衡性能、质量和成本
- **成本**: 中等
- **速度**: 中等

### claude-3-5-haiku-20241022
- **适用场景**: 简单分析、快速处理
- **特点**: 快速响应，成本低
- **成本**: 低
- **速度**: 快

### claude-3-opus-20240229
- **适用场景**: 复杂分析、高质量要求
- **特点**: 最高质量，处理复杂任务
- **成本**: 高
- **速度**: 较慢

## 验证配置

使用以下代码验证环境变量配置：

```typescript
import { ClaudeAnalyzer } from './claude-analyzer';

// 验证环境变量
const validation = ClaudeAnalyzer.validateEnvironment();
if (!validation.isValid) {
  console.error('配置错误:', validation.errors);
} else {
  console.log('配置验证通过');
  console.log('当前模型:', ClaudeAnalyzer.getCurrentModel());
}
```

## 故障排除

### 常见问题

1. **ANTHROPIC_API_KEY 未设置**
   - 错误: `ANTHROPIC_API_KEY 环境变量未设置`
   - 解决: 设置正确的 API 密钥

2. **模型不存在**
   - 错误: 模型名称无效
   - 解决: 使用支持的模型名称

3. **权限不足**
   - 错误: API 密钥权限不足
   - 解决: 检查 API 密钥权限和配额

### 调试技巧

1. **检查环境变量**
   ```bash
   echo $ANTHROPIC_API_KEY
   echo $ANTHROPIC_MODEL
   ```

2. **启用详细日志**
   ```typescript
   const config = {
     model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
     // 其他配置...
   };
   console.log('使用配置:', config);
   ```

3. **测试连接**
   ```typescript
   // 使用简单测试验证配置
   const testItem = { /* 简单测试数据 */ };
   const result = await ClaudeAnalyzer.analyzeItem(testItem);
   console.log('测试成功:', result);
   ```
