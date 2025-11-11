import axios from 'axios';

export class AnythingLLMApi {
  private baseURL: string;
  private apiKey?: string;

  constructor(baseURL: string, apiKey?: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  async searchMessage(workspaceSlug: string, message: string, mode: 'query' | 'chat' = 'query'): Promise<string> {
    try {
      const endpoint = mode === 'query' 
        ? `${this.baseURL}/api/v1/workspace/${workspaceSlug}/chat`
        : `${this.baseURL}/api/v1/workspace/${workspaceSlug}/chat`;
      
      const response = await axios.post(
        endpoint,
        {
          message,
          mode,
        },
        {
          headers: this.getHeaders(),
        }
      );

      return response.data.textResponse || response.data.response || '';
    } catch (error: any) {
      console.error('Error calling AnythingLLM API:', error);
      
      // Provide more detailed error information
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const statusText = error.response.statusText;
        const message = error.response.data?.message || error.response.data?.error || 'Unknown error';
        throw new Error(`API Error (${status} ${statusText}): ${message}`);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error(`Network Error: Cannot connect to AnythingLLM at ${this.baseURL}. Please check if the service is running.`);
      } else {
        // Something else happened
        throw new Error(`Error: ${error.message || 'Unknown error occurred'}`);
      }
    }
  }

  async getWorkspaces(): Promise<Array<{ slug: string; name: string }>> {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/workspaces`, {
        headers: this.getHeaders(),
      });
      // Handle both response formats: { workspaces: [...] } or direct array
      const workspaces = response.data?.workspaces || response.data || [];
      // Extract only slug and name from each workspace
      return workspaces.map((w: any) => ({
        slug: w.slug,
        name: w.name,
      }));
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      return [];
    }
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    
    return headers;
  }
}

export const anythingLLMApi = new AnythingLLMApi(
  import.meta.env.VITE_ANYTHINGLLM_BASE_URL || 'http://localhost:3001',
  import.meta.env.VITE_ANYTHINGLLM_API_KEY
);

