# HN Claude Agent - Technical Trend Insights System

HN Claude Agent is an automated system that analyzes HackerNews content using Claude AI to identify and summarize the latest technology trends and insights.

## Overview

This system automatically collects technical content from HackerNews, processes it with Claude AI, and generates structured briefs highlighting important trends, insights, and developments. The results are presented through a Next.js web application.

## Features

- Automated collection of technical content from HackerNews
- AI-powered analysis and summarization using Claude
- Organized presentation of insights with tags
- Search functionality to find specific topics
- Archive of historical briefs for trend tracking
- Responsive web interface

## Architecture

The system consists of four main components:

1. **Information Collection Module** - Fetches data from the HackerNews API
2. **Claude Agent Processing Module** - Analyzes content using Claude AI
3. **Data Storage Module** - Manages raw data and processed briefs
4. **Next.js Web Application** - Provides user interface for trend insights

## Project Structure

```
hn-claude-agent/
├── docs/                    # Documentation files
├── posts/                   # Generated briefs
├── scripts/                 # Scripts for data processing
├── src/
│   ├── api/                 # API utilities
│   ├── components/          # React components
│   ├── pages/               # Next.js pages
│   ├── types/               # Type definitions
│   └── utils/               # Utility functions
├── styles/                  # CSS styles
├── package.json             # Project dependencies
└── README.md                # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Claude API access

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/hn-claude-agent.git
   cd hn-claude-agent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local to add your Claude API key
   ```

### Running the Application

To run the development server:

```bash
npm run dev
```

To build and run the production application:

```bash
npm run build
npm start
```

### Fetching and Analyzing Data

To fetch new data from HackerNews and analyze it:

```bash
npm run fetch
```

This script will:
1. Fetch the top stories from HackerNews
2. Process each story with Claude AI
3. Generate and save briefs to the `posts/` directory

## API Endpoints

- `GET /api/briefs` - Get all briefs metadata
- `GET /api/briefs?id={id}` - Get a specific brief
- `GET /api/briefs?search={keyword}` - Search briefs by keyword
- `GET /api/briefs?tag={tag}` - Get briefs by tag
- `GET /api/search?q={query}` - Search across all briefs

## Development

The project follows these key implementation files:

- `src/utils/hn-api.ts` - HackerNews API client
- `src/utils/claude-analyzer.ts` - Claude AI integration
- `src/utils/data-manager.ts` - Data storage and retrieval
- `src/pages/index.tsx` - Home page
- `src/pages/brief/[id].tsx` - Brief detail page
- `src/pages/archive.tsx` - Archive page
- `scripts/fetch-hn.ts` - Data fetching and analysis script

## Deployment

This application is designed to be deployed on platforms that support Next.js applications, such as Vercel.

For static export (to deploy on GitHub Pages or similar), run:
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -am 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- HackerNews API for providing the data source
- Anthropic for the Claude AI technology
- Next.js for the web framework