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

## VS Code Integration

This server can be integrated with VS Code through the Model Context Protocol:

1. Create a `.vscode` folder in your project (if it doesn't exist)
2. Add a `mcp.json` file with the following configuration:

```json
{
  "servers": {
    "api-mcp-server": {
      "type": "stdio",
      "command": "sh",
      "args": [
        "-c",
        "cd /path/to/mcp-api-server && npm run build && npm run start"
      ]
    }
  }
}
```

3. Replace `/path/to/mcp-api-server` with the absolute path to your project
4. Restart VS Code or reload the window
5. The MCP server will be available to compatible AI extensions

### Troubleshooting

- If the MCP server isn't connecting, check the VS Code Developer Console for errors
- Verify the path in `mcp.json` is correct and accessible
- Ensure the server builds successfully with `npm run build`

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