export type QuestionCategory = 'Cloud General' | string; // Format: 'Cloud General', 'Product Name General', 'Product Name Sizing'

export interface Workspace {
  id: string;
  name: string;
  description?: string;
}

export interface QuestionCategoryMapping {
  category: QuestionCategory;
  workspaceName: string;
}

export interface DiscoveryQuestion {
  id: string;
  question: string;
  category: QuestionCategory;
  answer?: string;
}

export interface Product {
  id: string;
  name: string;
  questions: DiscoveryQuestion[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Config {
  categoryMappings: QuestionCategoryMapping[];
  products: Product[];
  prompts: PromptSettings;
}

export interface PromptSettings {
  general: string;
  sizing: string;
  matrix: string;
}

export interface DiscoveryResult {
  id: string;
  customerName: string;
  projectName: string;
  productId: string;
  productName: string;
  timestamp: string;
  answers: Record<string, string>; // questionId -> answer
  generatedAnswers?: Record<string, string>; // questionId -> generated answer
}

export interface DiscoverySession {
  customerName: string;
  projectName: string;
  productId: string;
  productName: string;
  answers: Record<string, string>;
  generatedAnswers: Record<string, string>;
}

