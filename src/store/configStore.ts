import { create } from 'zustand';
import { configApi } from '../lib/backendApi';
import type { Config, QuestionCategoryMapping, Product, PromptSettings } from '../types';

interface ConfigState {
  config: Config | null;
  isLoading: boolean;
  error: string | null;
  setCategoryMappings: (mappings: QuestionCategoryMapping[]) => void;
  setProducts: (products: Product[]) => void;
  addCategoryMapping: (mapping: QuestionCategoryMapping) => Promise<void>;
  removeCategoryMapping: (category: string) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (productId: string, product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  loadConfig: (force?: boolean) => Promise<void>;
  updatePrompts: (prompts: PromptSettings) => Promise<void>;
}

export const defaultPrompts: PromptSettings = {
  general: `You are an experienced AI Cloud Architect. Review the customer's question and context, then provide a clear, actionable response grounded in the knowledge base. Highlight relevant architecture considerations, best practices, and next steps.`,
  sizing: `You are a cloud sizing specialist. Evaluate the customer's workload details and provide capacity, performance, and scaling recommendations grounded in the knowledge base. Call out assumptions, potential gaps, and sizing considerations that may impact cost or performance.`,
  matrix: `You are consulting on the Cloud Matrix. Analyze the customer's needs and interpret the matrix to recommend the best-fit OpenText Cloud products and services. Explain the reasoning, highlight trade-offs, and suggest any follow-up actions needed.`,
};

const defaultConfig: Config = {
  categoryMappings: [],
  products: [],
  prompts: { ...defaultPrompts },
};

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: null,
  isLoading: false,
  error: null,

  loadConfig: async (force = false) => {
    // Don't reload if already loading
    if (get().isLoading) return;
    
    // If config already exists and not forcing, don't reload
    if (!force && get().config) return;
    
    set({ isLoading: true, error: null });
    
    try {
      // Check if we have a token before making API calls
      const token = localStorage.getItem('auth-token');
      if (!token) {
        // No token, set default config immediately
        console.log('No auth token, using default config');
        set({ config: { ...defaultConfig }, isLoading: false, error: null });
        return;
      }

      // Try to load from API with timeout
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );
        
        const apiPromise = Promise.all([
          configApi.getCategoryMappings(),
          configApi.getProducts(),
          configApi.getPrompts(),
        ]);
        
        const [mappings, products, prompts] = await Promise.race([
          apiPromise,
          timeoutPromise,
        ]) as any[];

        // Transform mappings from API format
        const categoryMappings: QuestionCategoryMapping[] = (mappings || []).map((m: any) => ({
          category: m.category,
          workspaceName: m.workspace_name,
        }));

        // Transform products from API format
        const transformedProducts: Product[] = (products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          questions: (p.questions || []).map((q: any) => ({
            id: q.id,
            question: q.question,
            category: q.category,
          })),
        }));

        const config: Config = {
          categoryMappings,
          products: transformedProducts,
          prompts: prompts || defaultPrompts,
        };

        set({ config, isLoading: false, error: null });
      } catch (apiError: any) {
        // Handle API errors - always use default config as fallback
        console.error('Failed to load config from API:', apiError);
        
        // Check if it's a network error (no response)
        if (!apiError.response) {
          console.warn('Network error or backend server is down, using default config');
          set({ config: { ...defaultConfig }, isLoading: false, error: null });
          return;
        }
        
        // If it's an auth error, clear token but still use default config
        if (apiError.response?.status === 401 || apiError.response?.status === 403) {
          console.warn('Authentication error, clearing token and using default config');
          localStorage.removeItem('auth-token');
          localStorage.removeItem('auth-user');
          set({ config: { ...defaultConfig }, isLoading: false, error: null });
          return;
        }
        
        // For any other error, use default config
        console.warn('API error, using default config:', apiError.response?.status);
        set({ config: { ...defaultConfig }, isLoading: false, error: null });
      }
    } catch (error: any) {
      // Fallback for any unexpected errors - always set default config
      console.error('Unexpected error loading config:', error);
      set({ config: { ...defaultConfig }, isLoading: false, error: null });
    }
  },

  setCategoryMappings: (mappings) => {
    const { config } = get();
    if (config) {
      config.categoryMappings = mappings;
      set({ config });
    }
  },

  setProducts: (products) => {
    const { config } = get();
    if (config) {
      config.products = products;
      set({ config });
    }
  },

  addCategoryMapping: async (mapping) => {
    try {
      await configApi.createCategoryMapping(mapping.category, mapping.workspaceName);
      // Force reload to get updated config
      await get().loadConfig(true);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to add category mapping');
    }
  },

  removeCategoryMapping: async (category) => {
    try {
      await configApi.deleteCategoryMapping(category);
      // Force reload to get updated config
      await get().loadConfig(true);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to remove category mapping');
    }
  },

  addProduct: async (product) => {
    try {
      const questions = product.questions.map((q) => ({
        question: q.question,
        category: q.category,
      }));
      await configApi.createProduct(product.name, questions);
      // Force reload to get updated config
      await get().loadConfig(true);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to add product');
    }
  },

  updateProduct: async (productId, product) => {
    try {
      const questions = product.questions.map((q) => ({
        question: q.question,
        category: q.category,
      }));
      await configApi.updateProduct(productId, product.name, questions);
      // Force reload to get updated config
      await get().loadConfig(true);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update product');
    }
  },

  deleteProduct: async (productId) => {
    try {
      await configApi.deleteProduct(productId);
      // Force reload to get updated config
      await get().loadConfig(true);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete product');
    }
  },

  updatePrompts: async (prompts) => {
    try {
      await configApi.updatePrompts(prompts);
      // Force reload to get updated config
      await get().loadConfig(true);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update prompts');
    }
  },
}));
