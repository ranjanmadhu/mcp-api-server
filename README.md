# API Rover - MCP Server with Playwright API Tracking

API Rover is a Model Context Protocol (MCP) server that uses Playwright to track and record API calls during web browsing sessions. It provides a set of tools to open a browser window, navigate to any URL, and collect detailed information about API calls made during the session.

## Features

- Open a browser window where users can navigate to any website
- Automatically intercept and track all API calls made during browsing
- Record comprehensive metadata for each API call:
  - URL
  - HTTP method
  - Request headers and body
  - Response status, headers, and body
  - Timestamp
- Filter collected API calls by URL pattern or method
- Return all collected data as structured JSON

## Prerequisites

- Node.js 16+
- npm

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/api-rover.git
cd api-rover

# Install dependencies
npm install
```

## Usage

You can run the server directly:

```bash
# Development mode
npm run dev

# Or build and run in production
npm run build
npm start
```

## MCP Integration

API Rover is designed to be used with MCP-compatible clients. The server exposes the following tools:

### 1. `open-browser`

Opens a browser window for navigating and tracking API calls.

Parameters:
- `browserType`: The type of browser to open (`chromium`, `firefox`, or `webkit`)
- `initialUrl`: The initial URL to navigate to

### 2. `get-api-calls`

Gets all tracked API calls during the current session.

No parameters.

### 3. `filter-api-calls`

Filters the tracked API calls by URL pattern or method.

Parameters:
- `urlPattern` (optional): URL pattern to filter by (e.g., '/api/users')
- `method` (optional): HTTP method to filter by (e.g., 'GET', 'POST')

## Data Structure

Each API call is recorded with the following structure:

```typescript
interface ApiCallData {
  url: string;
  method: string;
  requestHeaders: Record<string, string>;
  requestBody?: any;
  responseStatus: number;
  responseHeaders: Record<string, string>;
  responseBody?: any;
  timestamp: number;
}
```

## License

MIT