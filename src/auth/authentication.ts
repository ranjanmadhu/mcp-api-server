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