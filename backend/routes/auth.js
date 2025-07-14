const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/login - Admin login
router.post('/login', authController.login);

// GET /api/auth/verify - Verify token
router.get('/verify', authenticateToken, authController.verifyToken);

// POST /api/auth/change-password - Change password
router.post('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
