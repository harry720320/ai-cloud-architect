import { create } from 'zustand';
import type { Config, QuestionCategoryMapping, Product, PromptSettings } from '../types';

interface ConfigState {
  config: Config;
  setCategoryMappings: (mappings: QuestionCategoryMapping[]) => void;
  setProducts: (products: Product[]) => void;
  addCategoryMapping: (mapping: QuestionCategoryMapping) => void;
  removeCategoryMapping: (category: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, product: Product) => void;
  deleteProduct: (productId: string) => void;
  loadConfig: () => void;
  saveConfig: () => void;
  updatePrompts: (prompts: PromptSettings) => void;
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
  config: defaultConfig,

  loadConfig: () => {
    try {
      const stored = localStorage.getItem('cloud-architect-config');
      if (stored) {
        const config = JSON.parse(stored);
        config.prompts = {
          ...defaultPrompts,
          ...(config.prompts || {}),
        };
        set({ config });
      }
      else {
        set({ config: { ...defaultConfig } });
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  },

  saveConfig: () => {
    try {
      localStorage.setItem('cloud-architect-config', JSON.stringify(get().config));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  },

  setCategoryMappings: (mappings) => {
    const config = get().config;
    config.categoryMappings = mappings;
    set({ config });
    get().saveConfig();
  },

  setProducts: (products) => {
    const config = get().config;
    config.products = products;
    set({ config });
    get().saveConfig();
  },

  addCategoryMapping: (mapping) => {
    const config = get().config;
    // Remove existing mapping for this category
    config.categoryMappings = config.categoryMappings.filter(
      (m) => m.category !== mapping.category
    );
    config.categoryMappings.push(mapping);
    set({ config });
    get().saveConfig();
  },

  removeCategoryMapping: (category) => {
    const config = get().config;
    config.categoryMappings = config.categoryMappings.filter(
      (m) => m.category !== category
    );
    set({ config });
    get().saveConfig();
  },

  addProduct: (product) => {
    const config = get().config;
    config.products.push(product);
    set({ config });
    get().saveConfig();
  },

  updateProduct: (productId, product) => {
    const config = get().config;
    const index = config.products.findIndex((p) => p.id === productId);
    if (index !== -1) {
      config.products[index] = product;
    }
    set({ config });
    get().saveConfig();
  },

  deleteProduct: (productId) => {
    const config = get().config;
    config.products = config.products.filter((p) => p.id !== productId);
    set({ config });
    get().saveConfig();
  },

  updatePrompts: (prompts) => {
    const config = get().config;
    config.prompts = prompts;
    set({ config });
    get().saveConfig();
  },
}));

