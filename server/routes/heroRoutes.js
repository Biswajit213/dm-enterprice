const express = require('express');
const router = express.Router();
const { getSlides, getAllSlides, addSlide, updateSlide, deleteSlide } = require('../controllers/heroController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Public
router.get('/', getSlides);

// Admin only
router.get('/all', protect, authorize('admin'), getAllSlides);
router.post('/', protect, authorize('admin'), upload.single('image'), addSlide);
router.put('/:id', protect, authorize('admin'), updateSlide);
router.delete('/:id', protect, authorize('admin'), deleteSlide);

module.exports = router;
