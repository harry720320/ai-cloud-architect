import express from 'express';
import { dbHelpers } from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all category mappings
router.get('/category-mappings', authenticateToken, (req, res) => {
  try {
    const mappings = dbHelpers.getAllCategoryMappings();
    res.json({ mappings });
  } catch (error) {
    console.error('Get category mappings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update category mapping
router.post('/category-mappings', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { category, workspaceName } = req.body;
    
    if (!category || !workspaceName) {
      return res.status(400).json({ error: 'Category and workspace name are required' });
    }
    
    const mapping = dbHelpers.createCategoryMapping(category, workspaceName);
    res.json({ mapping });
  } catch (error) {
    console.error('Create category mapping error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Delete category mapping
router.delete('/category-mappings/:category', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { category } = req.params;
    dbHelpers.deleteCategoryMapping(category);
    res.json({ message: 'Category mapping deleted successfully' });
  } catch (error) {
    console.error('Delete category mapping error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get all products
router.get('/products', authenticateToken, (req, res) => {
  try {
    const products = dbHelpers.getAllProducts();
    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product
router.get('/products/:productId', authenticateToken, (req, res) => {
  try {
    const { productId } = req.params;
    const product = dbHelpers.getProduct(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create product
router.post('/products', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, questions } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    
    const product = dbHelpers.createProduct(name, questions || []);
    res.json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Update product
router.put('/products/:productId', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { productId } = req.params;
    const { name, questions } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    
    dbHelpers.updateProduct(productId, name, questions || []);
    const product = dbHelpers.getProduct(productId);
    res.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Delete product
router.delete('/products/:productId', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { productId } = req.params;
    dbHelpers.deleteProduct(productId);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get prompt settings
router.get('/prompts', authenticateToken, (req, res) => {
  try {
    const prompts = dbHelpers.getAllPrompts();
    res.json({ prompts });
  } catch (error) {
    console.error('Get prompts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update prompt settings
router.put('/prompts', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { prompts } = req.body;
    
    if (!prompts || typeof prompts !== 'object') {
      return res.status(400).json({ error: 'Prompts object is required' });
    }
    
    dbHelpers.updatePrompts(prompts);
    const updatedPrompts = dbHelpers.getAllPrompts();
    res.json({ prompts: updatedPrompts });
  } catch (error) {
    console.error('Update prompts error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

