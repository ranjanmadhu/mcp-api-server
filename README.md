# MCP API Server

An API-focused Model Context Protocol (MCP) server that provides authentication and API call capabilities. This server allows secure API calls through MCP tools, with authentication management and response handling.

## Features

- Authentication management with token-based security
- Make authenticated API calls to external services
- Secure token management with authentication state tracking
- Well-typed responses using the MCP protocol structure
- Response formatting for different content types (JSON, text)

## Prerequisites

- Node.js 16+
- npm

## Installation

```bash
# Clone the repository
git clone https://github.com/ranjanmadhu/mcp-api-server.git
cd mcp-api-server

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

This MCP server exposes the following tools:

### 1. `auth`

Manages authentication tokens for secure API access.

Parameters:
- `action`: The authentication action to perform (`set`, `check`, or `clear`)
- `token`: The authentication token (required for `set` action)

### 2. `vehicle_api`

Makes an API call to retrieve vehicle data from an external API.

No parameters required.

## Data Structure

API call responses are formatted according to the MCP protocol:

```typescript
interface ToolResponse {
  content: Array<{
    type: "text" | "image" | "audio" | "resource";
    text?: string;
    data?: string;
    mimeType?: string;
    resource?: {
      text?: string;
      uri: string;
      blob?: string;
      mimeType?: string;
    };
  }>;
  _meta?: Record<string, unknown>;
  isError?: boolean;
}
```

## License

MIT