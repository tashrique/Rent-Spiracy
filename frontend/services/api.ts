/**
 * API service for communication with the Rent-Spiracy backend
 */

// Always use localhost endpoint for now
const getBaseUrl = (): string => {
  return 'http://localhost:8000';
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
      mode: 'cors',
      credentials: 'omit',
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

// Type definitions for API requests and responses
export type Language = 'english' | 'spanish' | 'chinese' | 'hindi' | 'korean' | 'bengali';

export interface RentalAnalysisRequest {
  listing_url?: string;
  property_address?: string;
  document_content?: string;
  language?: Language;
  voice_output?: boolean;
  landlord_email?: string;
  landlord_phone?: string;
  [key: string]: unknown; // Index signature for Record<string, unknown> compatibility
}

export interface SimplifiedClause {
  text: string;
  simplified_text: string;
  is_concerning: boolean;
  reason?: string;
}

export interface AnalysisResult {
  id: string;
  scam_likelihood: 'Low' | 'Medium' | 'High';
  trustworthiness_score: number;
  trustworthiness_grade: 'A' | 'B' | 'C' | 'D' | 'F';
  risk_level: 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Very High Risk';
  explanation: string;
  action_items?: string[];
  simplified_clauses: SimplifiedClause[];
  suggested_questions: string[];
  created_at: string;
  raw_response?: string; // Raw LLM response for frontend processing
}

// Alias for backward compatibility
export type ScamDetectionResponse = AnalysisResult;

export interface Document {
  _id: string;
  id: string;
  title: string;
  type: string;
  content: string;
  scam_score: number;
  created_at: string;
  updated_at: string;
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
    language?: string;
    voiceOutput?: boolean;
    landlordEmail?: string;
    landlordPhone?: string;
  }): Promise<AnalysisResult> => {
    const requestData: RentalAnalysisRequest = {
      listing_url: data.listingUrl,
      property_address: data.address,
      document_content: data.fileContent,
      language: data.language as Language || 'english',
      voice_output: data.voiceOutput || false,
      landlord_email: data.landlordEmail,
      landlord_phone: data.landlordPhone
    };
    
    return apiRequest<AnalysisResult>('/api/analysis/analyze-rental', 'POST', requestData);
  },
  
  // Get a previous analysis by ID
  getAnalysis: (id: string): Promise<AnalysisResult> => {
    return apiRequest<AnalysisResult>(`/api/analysis/${id}`);
  },
  
  // File upload endpoint - this uses FormData instead of JSON
  uploadDocument: async (
    file: File, 
    listingUrl?: string, 
    propertyAddress?: string,
    language: string = 'english',
    voiceOutput: boolean = false,
    landlordEmail?: string,
    landlordPhone?: string
  ): Promise<AnalysisResult> => {
    const url = `${getBaseUrl()}/api/upload/document`;
    const formData = new FormData();
    
    formData.append('file', file);
    if (listingUrl) formData.append('listing_url', listingUrl);
    if (propertyAddress) formData.append('property_address', propertyAddress);
    if (landlordEmail) formData.append('landlord_email', landlordEmail);
    if (landlordPhone) formData.append('landlord_phone', landlordPhone);
    formData.append('language', language);
    formData.append('voice_output', String(voiceOutput));
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'omit',
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
  },
  
  // List documents - paginated
  listDocuments: (
    skip: number = 0, 
    limit: number = 10,
    minScore?: number,
    type?: string
  ): Promise<Document[]> => {
    let query = `/documents?skip=${skip}&limit=${limit}`;
    if (minScore !== undefined) query += `&min_score=${minScore}`;
    if (type) query += `&type=${encodeURIComponent(type)}`;
    
    return apiRequest<Document[]>(query);
  },
  
  // Get a specific document by ID
  getDocument: (documentId: string): Promise<Document> => {
    return apiRequest<Document>(`/documents/${documentId}`);
  },
  
  // Search documents
  searchDocuments: (query: string, limit: number = 10): Promise<Document[]> => {
    return apiRequest<Document[]>(`/documents/search?query=${encodeURIComponent(query)}&limit=${limit}`);
  },
  
  // Check API status
  checkStatus: (): Promise<{ status: string; message: string }> => {
    return apiRequest<{ status: string; message: string }>('/health');
  },
};

export interface SuspectLeaser {
  name: string;
  email: string;
  phone: string;
  reported_count: number;
  addresses: string[];
  flags: string[];
  created_at: string;
}

/**
 * API endpoints for suspect leasers
 */
export const suspectLeaserApi = {
  // Search for suspect leasers by email or phone
  searchSuspectLeasers: async (email?: string, phone?: string): Promise<SuspectLeaser[]> => {
    let query = '/api/suspect_leasers/search?';
    if (email) query += `email=${encodeURIComponent(email)}`;
    if (phone) {
      if (email) query += '&';
      query += `phone=${encodeURIComponent(phone)}`;
    }
    return apiRequest<SuspectLeaser[]>(query);
  },
};

export const api = {
  baseUrl: getBaseUrl(),
  scamDetection: scamDetectionApi,
  suspectLeaser: suspectLeaserApi,
}; 