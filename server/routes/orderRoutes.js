const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, uploadCustomPhoto,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/upload-custom-photo', protect, uploadCustomPhoto);
router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.get('/', protect, authorize('admin'), getAllOrders);
router.put('/:id', protect, authorize('admin'), updateOrderStatus);

module.exports = router;
