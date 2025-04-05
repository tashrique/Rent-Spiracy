/**
 * API service for communication with the Rent-Spiracy backend
 */

// Determine the base URL based on environment
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Browser environment
    return process.env.NODE_ENV === 'production' 
      ? 'https://rent-spiracy.onrender.com'
      : 'http://127.0.0.1:8000';
  } else {
    // Server-side rendering
    return process.env.BACKEND_URL 
      || (process.env.NODE_ENV === 'production' 
        ? 'https://rent-spiracy.onrender.com' 
        : 'http://127.0.0.1:8000');
  }
};

/**
 * Generic API request function
 */
async function apiRequest<T>(
  endpoint: string, 
  method: string = 'GET', 
  body?: Record<string, unknown>, 
  headers: HeadersInit = {}
): Promise<T> {
  const url = `${getBaseUrl()}${endpoint}`;
  
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers
  };
  
  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Type definitions for API responses
export interface ScamDetectionResponse {
  scam_likelihood: 'Low' | 'Medium' | 'High';
  explanation: string;
  simplified_clauses: Array<{
    text: string;
    simplified_text: string;
    is_concerning: boolean;
    reason?: string;
  }>;
  suggested_questions: string[];
}

/**
 * API endpoints for scam detection
 */
export const scamDetectionApi = {
  // Analyze a lease or rental listing
  analyzeRental: (data: {
    listingUrl?: string;
    address?: string;
    fileContent?: string;
  }): Promise<ScamDetectionResponse> => {
    return apiRequest<ScamDetectionResponse>('/api/analyze', 'POST', data);
  },
  
  // Check API status
  checkStatus: (): Promise<{ status: string; message: string }> => {
    return apiRequest<{ status: string; message: string }>('/api/status');
  },
};

export default {
  baseUrl: getBaseUrl(),
  scamDetection: scamDetectionApi,
}; 