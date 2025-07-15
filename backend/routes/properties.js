const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const propertyController = require('../controllers/propertyController');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.body.category || 'lands';
    const uploadPath = path.join(__dirname, '../uploads', category);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: fileFilter
});

// Public routes
router.get('/', propertyController.getAllProperties);
router.get('/category/:category', propertyController.getPropertiesByCategory);
router.get('/:id', propertyController.getPropertyById);

// Admin routes (protected)
router.post('/', authenticateToken, upload.single('image'), propertyController.addProperty);
router.put('/:id', authenticateToken, upload.single('image'), propertyController.updateProperty);
router.delete('/:id', authenticateToken, propertyController.deleteProperty);
router.get('/admin/stats', authenticateToken, propertyController.getDashboardStats);

module.exports = router;
