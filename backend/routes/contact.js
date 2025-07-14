const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/submit', contactController.submitMessage);

// Admin routes (protected)
router.get('/', authenticateToken, contactController.getAllMessages);
router.get('/stats', authenticateToken, contactController.getContactStats);
router.get('/:id', authenticateToken, contactController.getMessageById);
router.put('/:id/status', authenticateToken, contactController.updateMessageStatus);
router.delete('/:id', authenticateToken, contactController.deleteMessage);

module.exports = router;
