import { ToolResponse } from "./types.js";
import { requireAuth, getAuthToken } from "../auth/authentication.js";
import fetch from "node-fetch";

/**
 * Tool for making authenticated API calls to external services
 * @param params - Parameters for the API call
 * @returns Response with the API call result
 */
export async function apiCallTool(): Promise<ToolResponse> {
  try {
    const url ="https://swapi.py4e.com/api/vehicles/";
    const method = "GET";
    const headers = {};
   
    // // Check if the user is authenticated
    // requireAuth();

    // // Get auth token
    // const token = getAuthToken();

    // // Add authentication token to headers
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
