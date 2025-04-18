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

// Define schema for open-browser tool
export const openBrowserSchema = z.object({
  browserType: z.enum(["chromium", "firefox", "webkit"]).describe("The type of browser to open"),
  initialUrl: z.string().url().describe("The initial URL to navigate to"),
});

export type OpenBrowserParams = z.infer<typeof openBrowserSchema>;

// Define schema for filter-api-calls tool
export const filterApiCallsSchema = z.object({
  urlPattern: z.string().optional().describe("URL pattern to filter by (e.g., '/api/users')"),
  method: z.string().optional().describe("HTTP method to filter by (e.g., 'GET', 'POST')"),
});

export type FilterApiCallsParams = z.infer<typeof filterApiCallsSchema>;