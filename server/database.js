import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CATEGORY_MAPPINGS_FILE = path.join(DATA_DIR, 'category-mappings.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const PROMPTS_FILE = path.join(DATA_DIR, 'prompts.json');
const DISCOVERY_RESULTS_FILE = path.join(DATA_DIR, 'discovery-results.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper functions for file operations
function readJSONFile(filePath, defaultValue = []) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return defaultValue;
  }
}

function writeJSONFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    throw error;
  }
}

// Initialize database (async function)
export async function initializeDatabase() {
  // Initialize default admin user if not exists
  const users = readJSONFile(USERS_FILE, []);
  const adminExists = users.some(u => u.username === 'admin');
  
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('admin', 10);
    const adminUser = {
      id: 'admin-' + Date.now(),
      username: 'admin',
      password_hash: passwordHash,
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: null,
    };
    users.push(adminUser);
    writeJSONFile(USERS_FILE, users);
    console.log('Default admin user created: admin/admin');
  }

  // Initialize default prompts if not exists
  const prompts = readJSONFile(PROMPTS_FILE, {});
  if (!prompts.general || !prompts.sizing || !prompts.matrix) {
    const defaultPrompts = {
      general: `You are an experienced AI Cloud Architect. Review the customer's question and context, then provide a clear, actionable response grounded in the knowledge base. Highlight relevant architecture considerations, best practices, and next steps.`,
      sizing: `You are a cloud sizing specialist. Evaluate the customer's workload details and provide capacity, performance, and scaling recommendations grounded in the knowledge base. Call out assumptions, potential gaps, and sizing considerations that may impact cost or performance.`,
      matrix: `You are consulting on the Cloud Matrix. Analyze the customer's needs and interpret the matrix to recommend the best-fit OpenText Cloud products and services. Explain the reasoning, highlight trade-offs, and suggest any follow-up actions needed.`,
    };
    writeJSONFile(PROMPTS_FILE, defaultPrompts);
    console.log('Default prompts initialized');
  }
}

// Database helper functions
export const dbHelpers = {
  // Users
  findUserByUsername: (username) => {
    const users = readJSONFile(USERS_FILE, []);
    return users.find(u => u.username === username) || null;
  },

  findUserById: (id) => {
    const users = readJSONFile(USERS_FILE, []);
    return users.find(u => u.id === id) || null;
  },

  getAllUsers: () => {
    const users = readJSONFile(USERS_FILE, []);
    return users.map(({ password_hash, ...user }) => user); // Exclude password hash
  },

  createUser: async (username, password, role = 'user') => {
    const users = readJSONFile(USERS_FILE, []);
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();

    const newUser = {
      id,
      username,
      password_hash: passwordHash,
      role,
      created_at: now,
      updated_at: null,
    };

    users.push(newUser);
    writeJSONFile(USERS_FILE, users);

    return { id, username, role, created_at: now };
  },

  updateUserPassword: async (userId, newPassword) => {
    const users = readJSONFile(USERS_FILE, []);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const now = new Date().toISOString();
    
    users[userIndex].password_hash = passwordHash;
    users[userIndex].updated_at = now;
    
    writeJSONFile(USERS_FILE, users);
    return true;
  },

  verifyPassword: async (password, passwordHash) => {
    return await bcrypt.compare(password, passwordHash);
  },

  deleteUser: (userId) => {
    const users = readJSONFile(USERS_FILE, []);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users.splice(userIndex, 1);
    writeJSONFile(USERS_FILE, users);
    return true;
  },

  // Category Mappings
  getAllCategoryMappings: () => {
    return readJSONFile(CATEGORY_MAPPINGS_FILE, []);
  },

  getCategoryMapping: (category) => {
    const mappings = readJSONFile(CATEGORY_MAPPINGS_FILE, []);
    return mappings.find(m => m.category === category) || null;
  },

  createCategoryMapping: (category, workspaceName) => {
    const mappings = readJSONFile(CATEGORY_MAPPINGS_FILE, []);
    
    // Remove existing mapping for this category if exists
    const filteredMappings = mappings.filter(m => m.category !== category);
    
    const id = 'mapping-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    const newMapping = {
      id,
      category,
      workspace_name: workspaceName,
      created_at: now,
      updated_at: null,
    };
    
    filteredMappings.push(newMapping);
    writeJSONFile(CATEGORY_MAPPINGS_FILE, filteredMappings);

    return { id, category, workspace_name: workspaceName, created_at: now };
  },

  updateCategoryMapping: (category, workspaceName) => {
    const mappings = readJSONFile(CATEGORY_MAPPINGS_FILE, []);
    const mappingIndex = mappings.findIndex(m => m.category === category);
    
    if (mappingIndex === -1) {
      throw new Error('Category mapping not found');
    }

    const now = new Date().toISOString();
    mappings[mappingIndex].workspace_name = workspaceName;
    mappings[mappingIndex].updated_at = now;
    
    writeJSONFile(CATEGORY_MAPPINGS_FILE, mappings);
    return true;
  },

  deleteCategoryMapping: (category) => {
    const mappings = readJSONFile(CATEGORY_MAPPINGS_FILE, []);
    const filteredMappings = mappings.filter(m => m.category !== category);
    
    if (filteredMappings.length === mappings.length) {
      throw new Error('Category mapping not found');
    }

    writeJSONFile(CATEGORY_MAPPINGS_FILE, filteredMappings);
    return true;
  },

  // Products
  getAllProducts: () => {
    const products = readJSONFile(PRODUCTS_FILE, []);
    const questions = readJSONFile(path.join(DATA_DIR, 'discovery-questions.json'), []);
    
    return products.map(product => ({
      ...product,
      questions: questions.filter(q => q.product_id === product.id).sort((a, b) => a.question_order - b.question_order),
    }));
  },

  getProduct: (productId) => {
    const products = readJSONFile(PRODUCTS_FILE, []);
    const product = products.find(p => p.id === productId);
    
    if (!product) return null;
    
    const questions = readJSONFile(path.join(DATA_DIR, 'discovery-questions.json'), []);
    product.questions = questions.filter(q => q.product_id === productId).sort((a, b) => a.question_order - b.question_order);
    
    return product;
  },

  createProduct: (name, questions) => {
    const products = readJSONFile(PRODUCTS_FILE, []);
    const questionsFile = path.join(DATA_DIR, 'discovery-questions.json');
    const allQuestions = readJSONFile(questionsFile, []);
    
    const id = 'product-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();

    const newProduct = {
      id,
      name,
      created_at: now,
      updated_at: null,
    };

    products.push(newProduct);
    writeJSONFile(PRODUCTS_FILE, products);

    if (questions && questions.length > 0) {
      questions.forEach((q, index) => {
        const qId = 'question-' + Date.now() + '-' + index + '-' + Math.random().toString(36).substr(2, 9);
        allQuestions.push({
          id: qId,
          product_id: id,
          question: q.question,
          category: q.category,
          question_order: index,
          created_at: now,
        });
      });
      writeJSONFile(questionsFile, allQuestions);
    }

    return { id, name, created_at: now, questions: questions || [] };
  },

  updateProduct: (productId, name, questions) => {
    const products = readJSONFile(PRODUCTS_FILE, []);
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      throw new Error('Product not found');
    }

    const now = new Date().toISOString();
    products[productIndex].name = name;
    products[productIndex].updated_at = now;
    writeJSONFile(PRODUCTS_FILE, products);

    // Delete existing questions
    const questionsFile = path.join(DATA_DIR, 'discovery-questions.json');
    const allQuestions = readJSONFile(questionsFile, []);
    const filteredQuestions = allQuestions.filter(q => q.product_id !== productId);

    // Insert new questions
    if (questions && questions.length > 0) {
      questions.forEach((q, index) => {
        const qId = q.id || 'question-' + Date.now() + '-' + index + '-' + Math.random().toString(36).substr(2, 9);
        filteredQuestions.push({
          id: qId,
          product_id: productId,
          question: q.question,
          category: q.category,
          question_order: index,
          created_at: now,
        });
      });
    }

    writeJSONFile(questionsFile, filteredQuestions);
    return true;
  },

  deleteProduct: (productId) => {
    const products = readJSONFile(PRODUCTS_FILE, []);
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      throw new Error('Product not found');
    }

    products.splice(productIndex, 1);
    writeJSONFile(PRODUCTS_FILE, products);

    // Delete related questions
    const questionsFile = path.join(DATA_DIR, 'discovery-questions.json');
    const allQuestions = readJSONFile(questionsFile, []);
    const filteredQuestions = allQuestions.filter(q => q.product_id !== productId);
    writeJSONFile(questionsFile, filteredQuestions);

    return true;
  },

  // Prompt Settings
  getAllPrompts: () => {
    const prompts = readJSONFile(PROMPTS_FILE, {});
    return {
      general: prompts.general || '',
      sizing: prompts.sizing || '',
      matrix: prompts.matrix || '',
    };
  },

  updatePrompts: (prompts) => {
    writeJSONFile(PROMPTS_FILE, prompts);
    return true;
  },

  // Discovery Results
  createDiscoveryResult: (data) => {
    const results = readJSONFile(DISCOVERY_RESULTS_FILE, []);
    const id = 'discovery-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const newResult = {
      id,
      customer_name: data.customerName,
      project_name: data.projectName,
      product_id: data.productId,
      product_name: data.productName,
      answers: data.answers,
      generated_answers: data.generatedAnswers || null,
      timestamp: data.timestamp || new Date().toISOString(),
    };
    
    results.push(newResult);
    writeJSONFile(DISCOVERY_RESULTS_FILE, results);
    return id;
  },

  getAllDiscoveryResults: (limit = 100, offset = 0) => {
    const results = readJSONFile(DISCOVERY_RESULTS_FILE, []);
    // Sort by timestamp descending
    const sortedResults = results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return sortedResults.slice(offset, offset + limit);
  },

  getDiscoveryResult: (id) => {
    const results = readJSONFile(DISCOVERY_RESULTS_FILE, []);
    return results.find(r => r.id === id) || null;
  },

  deleteDiscoveryResult: (id) => {
    const results = readJSONFile(DISCOVERY_RESULTS_FILE, []);
    const resultIndex = results.findIndex(r => r.id === id);
    
    if (resultIndex === -1) {
      return false;
    }

    results.splice(resultIndex, 1);
    writeJSONFile(DISCOVERY_RESULTS_FILE, results);
    return true;
  },
};
