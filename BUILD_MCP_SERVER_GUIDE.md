# Building a Model Context Protocol (MCP) Server: Step-by-Step Guide

This guide walks you through the process of building a Model Context Protocol (MCP) server for API integrations, using the example codebase structure from this project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Understanding MCP Architecture](#understanding-mcp-architecture)
- [Building the Core Components](#building-the-core-components)
- [Implementing Authentication](#implementing-authentication)
- [Creating Custom Tools](#creating-custom-tools)
- [Testing Your MCP Server](#testing-your-mcp-server)
- [Integration with VS Code](#integration-with-vs-code)
- [Advanced Features](#advanced-features)

## Prerequisites

Before getting started, make sure you have:

- Node.js 16+ installed
- npm or yarn package manager
- Basic understanding of TypeScript
- Familiarity with API concepts

## Project Setup

1. **Initialize your project**:

```bash
mkdir my-mcp-server
cd my-mcp-server
npm init -y
```

2. **Install dependencies**:

```bash
npm install @modelcontextprotocol/sdk zod node-fetch
npm install --save-dev typescript ts-node @types/node
```

3. **Create TypeScript configuration**:

Create a `tsconfig.json` file with appropriate settings:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

4. **Set up project structure**:

```
my-mcp-server/
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── auth/
│   │   └── authentication.ts
│   └── tools/
│       ├── types.ts
│       ├── auth.ts
│       └── api-call.ts
├── package.json
├── tsconfig.json
└── README.md
```

5. **Update package.json scripts**:

```json
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js",
  "dev": "ts-node --esm src/index.ts"
}
```

## Understanding MCP Architecture

The Model Context Protocol (MCP) provides a standardized way for AI models to interact with external tools and resources. An MCP server:

1. **Exposes tools**: Functions that the AI can call to perform actions
2. **Manages connections**: Handles communication using a transport protocol (stdio in this case)
3. **Processes requests**: Validates inputs and formats responses according to the MCP spec

### Key Components:

- **Server instance**: The main MCP server that registers tools
- **Tools**: Functions that perform specific tasks when called by an AI
- **Transports**: Mechanisms for sending/receiving data (like stdio)
- **Schemas**: Type definitions using Zod to validate inputs/outputs

## Building the Core Components

### 1. Define Types

First, create the basic types for your MCP server in `src/types.ts`:

```typescript
export interface ApiCallData {
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

### 2. Create Tool Response Types

In `src/tools/types.ts`, define the expected response format for tools:

```typescript
import { z } from "zod";

// Define the common tool response type to match MCP SDK expectations
export interface ToolResponse {
  [key: string]: unknown;
  content: Array<{
    [key: string]: unknown;
    type: "text";
    text: string;
  } | {
    [key: string]: unknown;
    type: "image";
    data: string;
    mimeType: string;
  } | {
    [key: string]: unknown;
    type: "audio";
    data: string;
    mimeType: string;
  } | {
    [key: string]: unknown;
    type: "resource";
    resource: {
      [key: string]: unknown;
      text: string;
      uri: string;
      mimeType?: string;
    } | {
      [key: string]: unknown;
      uri: string;
      blob: string;
      mimeType?: string;
    };
  }>;
  _meta?: Record<string, unknown>;
  isError?: boolean;
}
```

## Implementing Authentication

### 1. Create Authentication Context

In `src/auth/authentication.ts`, implement a basic authentication system:

```typescript
// Auth context to store and validate authentication tokens
export interface AuthContext {
  token: string | null;
  isAuthenticated: boolean;
}

// Global auth context singleton
let authContext: AuthContext = {
  token: null,
  isAuthenticated: false
};

/**
 * Sets the authentication token
 * @param token - The token to set
 */
export function setAuthToken(token: string): void {
  authContext.token = token;
  authContext.isAuthenticated = !!token;
}

/**
 * Gets the current authentication token
 * @returns The current token or null if not authenticated
 */
export function getAuthToken(): string | null {
  return authContext.token;
}

/**
 * Checks if the current context is authenticated
 * @returns True if authenticated, false otherwise
 */
export function isAuthenticated(): boolean {
  return authContext.isAuthenticated;
}

/**
 * Clears the authentication token
 */
export function clearAuthToken(): void {
  authContext.token = null;
  authContext.isAuthenticated = false;
}

/**
 * Middleware to check if a request is authenticated
 * @throws Error if not authenticated
 */
export function requireAuth(): void {
  if (!isAuthenticated()) {
    throw new Error('Authentication required. Please provide a valid token.');
  }
}
```

### 2. Implement Authentication Tool

In `src/tools/auth.ts`, create a tool to manage authentication:

```typescript
import { ToolResponse } from "./types.js";
import { setAuthToken, getAuthToken, clearAuthToken } from "../auth/authentication.js";

/**
 * Tool for managing authentication tokens
 * @param params - Parameters containing the auth action and token
 * @returns Response with authentication status
 */
export async function authTool(params: { 
  action: "set" | "check" | "clear"; 
  token?: string; 
}): Promise<ToolResponse> {
  const { action, token } = params;
  
  switch (action) {
    case "set":
      if (!token) {
        return {
          content: [{ type: "text", text: "Error: Token is required for 'set' action" }],
          isError: true
        };
      }
      setAuthToken(token);
      return {
        content: [{ type: "text", text: "Authentication token set successfully" }]
      };
      
    case "check":
      const currentToken = getAuthToken();
      return {
        content: [{ 
          type: "text", 
          text: currentToken 
            ? `Authenticated with token: ${currentToken.substring(0, 4)}...${currentToken.substring(currentToken.length - 4)}` 
            : "Not authenticated" 
        }]
      };
      
    case "clear":
      clearAuthToken();
      return {
        content: [{ type: "text", text: "Authentication token cleared" }]
      };
      
    default:
      return {
        content: [{ type: "text", text: `Error: Invalid action '${action}'. Valid actions are: set, check, clear` }],
        isError: true
      };
  }
}
```

## Creating Custom Tools

### 1. Create an API Call Tool

In `src/tools/api-call.ts`, implement a tool to make external API calls:

```typescript
import { ToolResponse } from "./types.js";
import { requireAuth, getAuthToken } from "../auth/authentication.js";
import fetch from "node-fetch";

/**
 * Tool for making authenticated API calls to external services
 * @returns Response with the API call result
 */
export async function apiCallTool(): Promise<ToolResponse> {
  try {
    const url = "https://swapi.py4e.com/api/vehicles/";
    const method = "GET";
    const headers = {};
   
    // Uncomment to require authentication
    // requireAuth();
    // const token = getAuthToken();
    // const authHeaders = {
    //   ...headers,
    //   Authorization: `${token}`,
    // };
    
    const authHeaders = { ...headers };

    // Make the API call
    const response = await fetch(url, {
      method,
      headers: authHeaders,
    });

    // Parse the response
    const contentType = response.headers.get("content-type") || "";
    let responseData: any;

    if (contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // Return the response
    return {
      content: [
        {
          type: "text",
          text: `API Call Response (${response.status} ${response.statusText}):
            Status: ${response.status}
            URL: ${url}
            Method: ${method}
            Response:
            ${
              typeof responseData === "object"
                ? JSON.stringify(responseData, null, 2)
                : responseData
            }`,
        },
      ],
      _meta: {
        statusCode: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        responseData,
      },
    };
  } catch (error) {
    // Handle errors
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      content: [
        {
          type: "text",
          text: `Error making API call: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
```

### 2. Create the Main Server

In `src/index.ts`, tie everything together:

```typescript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Import our tools
import { authTool } from "./tools/auth.js";
import { apiCallTool } from "./tools/api-call.js";

const server = new McpServer({
  name: "api-mcp-server",
  description: "API MCP Server",
  version: "1.0.0"
});

// Register authentication tool
server.tool(
  "auth",
  "authenticate and manage authentication tokens",
  { 
    action: z.enum(["set", "check", "clear"]), 
    token: z.string().optional() 
  },
  async (params) => await authTool(params)
);

// Register API call tool that requires authentication
server.tool(
  "vehicle_api",
  "get vehicles List from API",
  {},
  async () => await apiCallTool()
);

// Connect the server to stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running on stdio");
  
  // Clean up resources when the process is terminated
  const cleanup = async () => {
    console.log("Cleaning up resources...");
    process.exit(0);
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
```

## Testing Your MCP Server

1. **Build and run your server**:

```bash
npm run build
npm start
```

2. **Manual testing**:
   - When running, the MCP server listens on stdio
   - You can interact with it by sending properly formatted JSON requests
   - Each request should include a tool name and parameters

3. **Example testing script**:
   Create a `test.js` file to pipe test requests to your server:

```javascript
// Test script to interact with MCP server
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Start the MCP server
const mcpServer = spawn('node', ['dist/index.js']);

// Send a test request to check authentication
const testRequest = {
  jsonrpc: '2.0',
  id: '1',
  method: 'tool',
  params: {
    name: 'auth',
    input: {
      action: 'check'
    }
  }
};

// Write the request to the server's stdin
mcpServer.stdin.write(JSON.stringify(testRequest) + '\n');

// Listen for responses
mcpServer.stdout.on('data', (data) => {
  console.log('Response:', data.toString());
});

// Handle server errors
mcpServer.stderr.on('data', (data) => {
  console.error('Server log:', data.toString());
});
```

## Integration with VS Code

To integrate your MCP server with VS Code:

1. **Create a `.vscode` folder** in your project
2. **Add an `mcp.json` file** with configuration:

```json
{
  "servers": {
    "api-mcp-server": {
      "type": "stdio",
      "command": "sh",
      "args": [
        "-c",
        "cd /path/to/your/mcp-server && npm run build && npm run start"
      ]
    }
  }
}
```

3. Replace `/path/to/your/mcp-server` with the absolute path to your project
4. Restart VS Code or reload the window

## Advanced Features

Here are some ideas to enhance your MCP server:

### 1. Customize the API Call Tool

Modify `api-call.ts` to accept parameters like URL, method, and headers:

```typescript
export async function apiCallTool(params: {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
}): Promise<ToolResponse> {
  // Implementation that uses the provided parameters
  // ...
}
```

### 2. Add Request/Response Logging

Create a logging system to track API calls:

```typescript
// In a new file src/utils/logger.ts
export function logApiCall(data: ApiCallData): void {
  console.log(`[${new Date(data.timestamp).toISOString()}] ${data.method} ${data.url} - ${data.responseStatus}`);
}
```

### 3. Implement More Authentication Methods

Extend the authentication system with OAuth, API keys, etc.:

```typescript
// In authentication.ts
export function setOAuthToken(token: string, expiresIn: number): void {
  // Implementation
}
```

### 4. Add Tool for Browser Automation

Create a tool that can open and control a headless browser:

```typescript
// In src/tools/browser.ts
export async function browserTool(params: {
  action: "open" | "navigate" | "screenshot";
  url?: string;
}): Promise<ToolResponse> {
  // Implementation using Puppeteer or Playwright
}
```

## Conclusion

You've now built a functional MCP server that can authenticate and make API calls! This foundation can be extended with additional tools and features based on your specific use case.

Remember to:

1. Properly handle errors and provide meaningful feedback
2. Add proper documentation for your tools
3. Implement proper security measures for authentication
4. Consider performance optimizations for API calls

Happy building!