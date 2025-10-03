import { createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

// 修改jinaReader工具的实现
const jinaReader = tool(
    'jinaReader',
    '爬取网页内容并返回markdown格式的正文', {
    url: z.string().describe('要爬取的网页URL')
},
    async ({ url }, extra) => {
        try {
            const response = await fetch(`https://r.jina.ai/${url}`, {
                headers: {
                    'X-Return-Format': 'markdown'
                }
            });

            // 更详细的状态码处理
            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                
                switch (response.status) {
                    case 451:
                        errorMessage = `网站因法律原因拒绝访问 (HTTP 451): ${url}`;
                        break;
                    case 403:
                        errorMessage = `网站拒绝访问 (HTTP 403): ${url}`;
                        break;
                    case 404:
                        errorMessage = `网页不存在 (HTTP 404): ${url}`;
                        break;
                    case 429:
                        errorMessage = `请求过于频繁，请稍后重试 (HTTP 429): ${url}`;
                        break;
                    case 500:
                    case 502:
                    case 503:
                    case 504:
                        errorMessage = `服务器错误 (HTTP ${response.status}): ${url}`;
                        break;
                    default:
                        errorMessage = `获取网页失败 (HTTP ${response.status}): ${url}`;
                }
                
                throw new Error(errorMessage);
            }

            const content = await response.text();

            // 返回符合MCP标准的CallToolResult格式
            return {
                content: [{
                    type: 'text',
                    text: content
                }],
                isError: false
            };
        } catch (error: any) {
            console.error(`Error fetching ${url}:`, error);

            // 错误情况也返回标准格式
            return {
                content: [{
                    type: 'text',
                    text: `无法获取网页内容: ${error.message}`
                }],
                isError: true
            };
        }
    }
);

// 创建 MCP 服务器
export default {
    'jina-mcp-server': createSdkMcpServer({
        name: 'jina-mcp-server',
        version: '1.0.0',
        tools: [jinaReader]
    })
};

