// Backend health check and connection utilities

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

export interface HealthCheckResult {
  isHealthy: boolean;
  responseTime: number;
  error?: string;
}

/**
 * Check if the backend server is healthy and responsive
 */
export const checkBackendHealth = async (): Promise<HealthCheckResult> => {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-cache',
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        isHealthy: true,
        responseTime,
      };
    } else {
      return {
        isHealthy: false,
        responseTime,
        error: `Health check failed: ${response.status} ${response.statusText}`,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      isHealthy: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Wait for backend to become healthy
 */
export const waitForBackendHealth = async (maxWaitTime: number = 30000): Promise<boolean> => {
  const startTime = Date.now();
  const checkInterval = 2000; // Check every 2 seconds
  
  while (Date.now() - startTime < maxWaitTime) {
    console.log('Checking backend health...');
    const health = await checkBackendHealth();
    
    if (health.isHealthy) {
      console.log(`Backend is healthy! Response time: ${health.responseTime}ms`);
      return true;
    }
    
    console.log(`Backend not ready: ${health.error}. Retrying in ${checkInterval}ms...`);
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }
  
  console.log('Backend health check timed out');
  return false;
};

/**
 * Enhanced fetch with backend health check and warm-up
 */
export const fetchWithHealthCheck = async (
  url: string, 
  options: RequestInit, 
  maxRetries: number = 3,
  checkHealth: boolean = true
): Promise<Response> => {
  // Optional health check first
  if (checkHealth) {
    console.log('Performing health check before upload...');
    const health = await checkBackendHealth();
    if (!health.isHealthy) {
      console.log('Backend appears unhealthy, but proceeding with upload...');
    }
  }
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Upload attempt ${attempt}/${maxRetries} to:`, url);
      
      // Progressive timeout based on attempt
      const timeoutMs = Math.min(60000 + (attempt - 1) * 30000, 180000); // 1-3 minutes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // If successful, return immediately
      if (response.ok) {
        console.log(`Upload successful on attempt ${attempt}`);
        return response;
      }
      
      // If it's a client error (4xx), don't retry
      if (response.status >= 400 && response.status < 500) {
        console.log(`Client error ${response.status}, not retrying`);
        return response;
      }
      
      // For server errors (5xx), retry
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Upload attempt ${attempt} failed:`, lastError.message);
      
      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying (exponential backoff with jitter)
      const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      const jitter = Math.random() * 1000; // Add randomness to prevent thundering herd
      const delay = baseDelay + jitter;
      
      console.log(`Retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

export { BASE_URL };
