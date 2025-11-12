import express from 'express';
import { dbHelpers } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create discovery result
router.post('/results', authenticateToken, (req, res) => {
  try {
    const { customerName, projectName, productId, productName, answers, generatedAnswers } = req.body;
    
    if (!customerName || !projectName || !productId || !productName || !answers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const id = dbHelpers.createDiscoveryResult({
      customerName,
      projectName,
      productId,
      productName,
      answers,
      generatedAnswers,
      timestamp: new Date().toISOString(),
    });
    
    res.json({ id, message: 'Discovery result saved successfully' });
  } catch (error) {
    console.error('Create discovery result error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get all discovery results
router.get('/results', authenticateToken, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const results = dbHelpers.getAllDiscoveryResults(limit, offset);
    res.json({ results });
  } catch (error) {
    console.error('Get discovery results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single discovery result
router.get('/results/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const result = dbHelpers.getDiscoveryResult(id);
    if (!result) {
      return res.status(404).json({ error: 'Discovery result not found' });
    }
    res.json({ result });
  } catch (error) {
    console.error('Get discovery result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete discovery result
router.delete('/results/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = dbHelpers.deleteDiscoveryResult(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Discovery result not found' });
    }
    res.json({ message: 'Discovery result deleted successfully' });
  } catch (error) {
    console.error('Delete discovery result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

