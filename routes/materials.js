const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getMaterials, uploadMaterial } = require('../controllers/materialsController');
const { authMiddleware, anyStaffMiddleware } = require('../middleware/auth');

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Routes
router.get('/', authMiddleware, getMaterials);
router.post('/upload', authMiddleware, anyStaffMiddleware, upload.single('materialFile'), uploadMaterial);

module.exports = router;
