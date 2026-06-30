const express = require('express');
const router = express.Router();
const { getCart, updateCart, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getCart);
router.post('/', updateCart);
router.delete('/', clearCart);
router.delete('/:productId', removeFromCart);

module.exports = router;
