#!/bin/bash

# HackerNews Claude Agent Forever 管理脚本
# 使用 forever 管理 Node.js 进程

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目信息
PROJECT_NAME="hn-claude-agent"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVICE_NAME="hn-claude-agent-auto-fetch"

echo -e "${BLUE}🚀 HackerNews Claude Agent Forever 管理脚本${NC}"
echo "=================================================="

# 检查项目目录
if [[ ! -f "$PROJECT_DIR/package.json" ]]; then
    echo -e "${RED}❌ 未找到项目目录: $PROJECT_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 项目目录: $PROJECT_DIR${NC}"

# 检查 Node.js 和 npm
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 未找到 Node.js，请先安装 Node.js${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ 未找到 npm，请先安装 npm${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js 版本: $(node --version)${NC}"
echo -e "${GREEN}✅ npm 版本: $(npm --version)${NC}"

# 检查 forever 是否已安装
if ! command -v forever &> /dev/null; then
    echo -e "${YELLOW}📦 安装 forever...${NC}"
    npm install -g forever
fi

echo -e "${GREEN}✅ Forever 版本: $(forever --version)${NC}"

# 安装项目依赖
echo -e "${YELLOW}📦 安装项目依赖...${NC}"
cd "$PROJECT_DIR"
npm install

# 创建日志目录
mkdir -p "$PROJECT_DIR/logs"

# 获取命令参数
COMMAND=${1:-help}

case $COMMAND in
    start)
        echo -e "${YELLOW}🚀 启动服务...${NC}"
        
        # 检查是否已经在运行
        if forever list | grep -q "$SERVICE_NAME"; then
            echo -e "${YELLOW}⚠️  服务已经在运行中${NC}"
            forever list | grep "$SERVICE_NAME"
        else
            # 启动服务
            forever start \
                --uid "$SERVICE_NAME" \
                --name "$SERVICE_NAME" \
                --minUptime 1000 \
                --spinSleepTime 1000 \
                --logFile "$PROJECT_DIR/logs/forever.log" \
                --outFile "$PROJECT_DIR/logs/out.log" \
                --errFile "$PROJECT_DIR/logs/error.log" \
                -c "npx tsx" \
                scripts/auto-fetch.ts start
            
            echo -e "${GREEN}✅ 服务启动成功${NC}"
        fi
        
        # 显示状态
        echo -e "${BLUE}📊 服务状态:${NC}"
        forever list | grep "$SERVICE_NAME" || echo "未找到服务"
        ;;
        
    stop)
        echo -e "${YELLOW}🛑 停止服务...${NC}"
        
        if forever list | grep -q "$SERVICE_NAME"; then
            forever stop "$SERVICE_NAME"
            echo -e "${GREEN}✅ 服务停止成功${NC}"
        else
            echo -e "${YELLOW}⚠️  服务未在运行${NC}"
        fi
        ;;
        
    restart)
        echo -e "${YELLOW}🔄 重启服务...${NC}"
        
        if forever list | grep -q "$SERVICE_NAME"; then
            forever restart "$SERVICE_NAME"
            echo -e "${GREEN}✅ 服务重启成功${NC}"
        else
            echo -e "${YELLOW}⚠️  服务未在运行，尝试启动...${NC}"
            $0 start
        fi
        ;;
        
    status)
        echo -e "${BLUE}📊 服务状态:${NC}"
        if forever list | grep -q "$SERVICE_NAME"; then
            forever list | grep "$SERVICE_NAME"
            echo ""
            echo -e "${BLUE}📋 详细信息:${NC}"
            forever show "$SERVICE_NAME"
        else
            echo -e "${YELLOW}⚠️  服务未在运行${NC}"
        fi
        ;;
        
    logs)
        echo -e "${BLUE}📋 查看日志:${NC}"
        if forever list | grep -q "$SERVICE_NAME"; then
            echo -e "${YELLOW}实时日志 (按 Ctrl+C 退出):${NC}"
            forever logs "$SERVICE_NAME" -f
        else
            echo -e "${YELLOW}⚠️  服务未在运行${NC}"
            echo -e "${BLUE}查看历史日志:${NC}"
            if [[ -f "$PROJECT_DIR/logs/forever.log" ]]; then
                tail -n 50 "$PROJECT_DIR/logs/forever.log"
            else
                echo "没有找到日志文件"
            fi
        fi
        ;;
        
    clean)
        echo -e "${YELLOW}🧹 清理日志和临时文件...${NC}"
        
        # 停止服务
        if forever list | grep -q "$SERVICE_NAME"; then
            forever stop "$SERVICE_NAME"
        fi
        
        # 清理日志文件
        rm -f "$PROJECT_DIR/logs/forever.log"
        rm -f "$PROJECT_DIR/logs/out.log"
        rm -f "$PROJECT_DIR/logs/error.log"
        
        # 清理 forever 进程列表
        forever cleanlogs
        
        echo -e "${GREEN}✅ 清理完成${NC}"
        ;;
        
    help|*)
        echo -e "${BLUE}📋 使用方法:${NC}"
        echo "  $0 start     - 启动服务"
        echo "  $0 stop      - 停止服务"
        echo "  $0 restart   - 重启服务"
        echo "  $0 status    - 查看状态"
        echo "  $0 logs      - 查看日志"
        echo "  $0 clean     - 清理日志和临时文件"
        echo "  $0 help      - 显示帮助"
        echo ""
        echo -e "${BLUE}🔧 项目管理命令:${NC}"
        echo "  手动执行:   npm run fetch"
        echo "  查看状态:   npm run auto-fetch:status"
        echo "  手动检查:   npm run auto-fetch:check"
        echo ""
        echo -e "${BLUE}📁 日志文件位置:${NC}"
        echo "  Forever 日志: $PROJECT_DIR/logs/forever.log"
        echo "  输出日志:     $PROJECT_DIR/logs/out.log"
        echo "  错误日志:     $PROJECT_DIR/logs/error.log"
        echo ""
        echo -e "${YELLOW}⚠️  注意事项:${NC}"
        echo "1. 请确保已正确配置环境变量 (.env.local)"
        echo "2. 服务会在系统重启后自动启动（如果配置了 forever 自启动）"
        echo "3. 日志文件会自动轮转，避免占用过多磁盘空间"
        echo "4. 使用 'forever list' 可以查看所有 forever 管理的进程"
        ;;
esac
