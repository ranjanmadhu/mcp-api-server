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