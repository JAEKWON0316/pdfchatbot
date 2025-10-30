// 백엔드 API 클라이언트
// Vercel rewrites를 사용하므로 상대 경로 사용
const API_BASE_URL = '';

export interface ChatResponse {
  answer: string;
  references: string[];
}

export interface UploadResponse {
  message: string;
  fileName: string;
  status: 'success' | 'error';
  details?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async chat(question: string): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/api/rag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async uploadPdf(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getUploadedFiles() {
    const response = await fetch(`${this.baseUrl}/api/upload/files`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async healthCheck() {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }
}

export const apiClient = new ApiClient();