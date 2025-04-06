/**
 * API service for communication with the Rent-Spiracy backend
 */

// Use environment variables to determine the API base URL
const getBaseUrl = (): string => {
  // Access environment variable for API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // If environment variable is not set, use environment-appropriate default
  if (!apiUrl) {
    // Check if we're in production (browser-safe check)
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      console.warn('NEXT_PUBLIC_API_URL not set in production environment');
      return 'https://rent-spiracy.onrender.com';
    } else {
      // Default to localhost in development
      return 'http://127.0.0.1:8000';
    }
  }
  
  return apiUrl;
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
export type Language = 'english' | 'spanish' | 'chinese' | 'hindi' | 'korean' | 'bengali' | 'swahili' | 'arabic';

export type Region = 'Northeast' | 'Midwest' | 'South' | 'West' | 'Pacific';

export interface RentalAnalysisRequest {
  listing_url?: string;
  property_address?: string;
  document_content?: string;
  language?: Language;
  voice_output?: boolean;
  [key: string]: unknown; // Index signature for Record<string, unknown> compatibility
}

export interface SimplifiedClause {
  text: string;
  simplified_text: string;
  is_concerning: boolean;
  reason?: string;
  california_law?: string;
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
  california_tenant_rights?: {
    relevant_statutes: string[];
    local_ordinances: string[];
    case_law: string[];
  };
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

export interface Lawyer {
  id: string;
  name: string;
  languages: Language[];
  specialization: string;
  location: string;
  region: Region;
  phone: string;
  email: string;
  website?: string;
  pictureUrl?: string;
  freeDuration?: string;
  rating?: number;
  created_at?: string;
  updated_at?: string;
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
  }): Promise<AnalysisResult> => {
    const requestData: RentalAnalysisRequest = {
      listing_url: data.listingUrl,
      property_address: data.address,
      document_content: data.fileContent,
      language: data.language as Language || 'english',
      voice_output: data.voiceOutput || false
    };
    
    return apiRequest<AnalysisResult>('/analysis/analyze-rental', 'POST', requestData);
  },
  
  // Get a previous analysis by ID
  getAnalysis: (id: string): Promise<AnalysisResult> => {
    return apiRequest<AnalysisResult>(`/analysis/${id}`);
  },
  
  // File upload endpoint - this uses FormData instead of JSON
  uploadDocument: async (
    file: File, 
    listingUrl?: string, 
    propertyAddress?: string,
    language: string = 'english',
    voiceOutput: boolean = false
  ): Promise<AnalysisResult> => {
    const url = `${getBaseUrl()}/upload/document`;
    const formData = new FormData();
    
    formData.append('file', file);
    if (listingUrl) formData.append('listing_url', listingUrl);
    if (propertyAddress) formData.append('property_address', propertyAddress);
    formData.append('language', language);
    formData.append('voice_output', String(voiceOutput));
    
    console.log(`Making file upload request to ${url} with file: ${file.name}, size: ${file.size}`);
    
    try {
      // Make the upload request
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `API error: ${response.status}`;
        try {
          const errorData = await response.text();
          console.error(`Server error: ${response.status} - ${errorData}`);
          
          // Try to parse JSON if possible
          try {
            const jsonError = JSON.parse(errorData);
            // Handle specific error messages for common issues
            if (jsonError.detail && typeof jsonError.detail === 'string') {
              const detail = jsonError.detail;
              
              if (detail.includes('Could not extract text') || detail.includes('password-protected')) {
                errorMessage = "Could not read the document. The file may be corrupted, password-protected, or in an unsupported format.";
              } else if (detail.includes('size limit')) {
                errorMessage = "The file is too large. Please upload a smaller document.";
              } else if (detail.includes('file type')) {
                errorMessage = "Unsupported file type. Please upload a PDF, Word document, or text file.";
              } else {
                errorMessage = jsonError.detail;
              }
            }
          } catch {
            // If not valid JSON, use the text response
            if (errorData.includes('Could not extract text')) {
              errorMessage = "Could not read the document. The file may be corrupted, password-protected, or in an unsupported format.";
            } else {
              errorMessage = errorData || errorMessage;
            }
          }
        } catch (e) {
          console.error('Could not read error response:', e);
        }
        
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('File upload request failed:', error);
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
  
  // Multiple file upload endpoint
  uploadMultipleDocuments: async (
    files: File[], 
    listingUrl?: string, 
    propertyAddress?: string,
    language: string = 'english',
    voiceOutput: boolean = false
  ): Promise<AnalysisResult> => {
    const url = `${getBaseUrl()}/upload/documents`;
    const formData = new FormData();
    
    // Add each file to the formData with the same field name
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    if (listingUrl) formData.append('listing_url', listingUrl);
    if (propertyAddress) formData.append('property_address', propertyAddress);
    formData.append('language', language);
    formData.append('voice_output', String(voiceOutput));
    
    console.log(`Making multiple file upload request to ${url} with ${files.length} files`);
    
    try {
      // Make the upload request
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        let errorMessage = `API error: ${response.status}`;
        try {
          const errorData = await response.text();
          console.error(`Server error: ${response.status} - ${errorData}`);
          
          // Try to parse JSON if possible
          try {
            const jsonError = JSON.parse(errorData);
            errorMessage = jsonError.detail || errorMessage;
          } catch {
            errorMessage = errorData || errorMessage;
          }
        } catch (e) {
          console.error('Could not read error response:', e);
        }
        
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
      return responseData;
    } catch (error) {
      console.error('Multiple file upload request failed:', error);
      throw error;
    }
  },
};

/**
 * API endpoints for lawyers
 */
export const lawyersApi = {
  // Get all lawyers with optional filtering
  getLawyers: (options?: {
    language?: Language;
    region?: Region;
    specialization?: string;
    skip?: number;
    limit?: number;
  }): Promise<Lawyer[]> => {
    // Build query string from options
    const queryParams = new URLSearchParams();
    if (options?.language) queryParams.append('language', options.language);
    if (options?.region) queryParams.append('region', options.region);
    if (options?.specialization) queryParams.append('specialization', options.specialization);
    if (options?.skip !== undefined) queryParams.append('skip', options.skip.toString());
    if (options?.limit !== undefined) queryParams.append('limit', options.limit.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest<Lawyer[]>(`/lawyers${queryString}`);
  },
  
  // Get a lawyer by ID
  getLawyer: (id: string): Promise<Lawyer> => {
    return apiRequest<Lawyer>(`/lawyers/${id}`);
  },
  
  // Get lawyers by language
  getLawyersByLanguage: (language: Language): Promise<Lawyer[]> => {
    return apiRequest<Lawyer[]>(`/lawyers/filter/by-language/${language}`);
  },
  
  // Get lawyers filtered by both language and region
  getFilteredLawyers: (language?: Language, region?: Region): Promise<Lawyer[]> => {
    const queryParams = new URLSearchParams();
    if (language) queryParams.append('language', language);
    if (region) queryParams.append('region', region);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest<Lawyer[]>(`/lawyers${queryString}`);
  }
};

// Combine API services into a single export
export const api = {
  baseUrl: getBaseUrl(),
  scamDetection: scamDetectionApi,
  lawyers: lawyersApi
}; 