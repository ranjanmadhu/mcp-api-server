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
  async (params) => await apiCallTool()
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