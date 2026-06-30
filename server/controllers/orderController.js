const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

// @desc    Upload custom photo to Cloudinary (called from Checkout)
// @route   POST /api/orders/upload-custom-photo
exports.uploadCustomPhoto = async (req, res, next) => {
  try {
    const { base64Image, productId } = req.body;
    if (!base64Image) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'dm-enterprise/custom-orders',
      resource_type: 'image',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });

    res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      productId,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create order
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingInfo, customPhotos } = req.body; // customPhotos: { [productId]: cloudinaryUrl }

    // Get user cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Validate all cart items have populated products
    const validItems = cart.items.filter((item) => item.product && item.product._id);
    if (validItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are invalid. Please refresh your cart.' });
    }

    // Calculate prices
    const itemsPrice = validItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const taxPrice = Math.round(itemsPrice * 0.1 * 100) / 100;
    const shippingPrice = itemsPrice > 50 ? 0 : 5.99;
    const totalPrice = Math.round((itemsPrice + taxPrice + shippingPrice) * 100) / 100;

    const orderItems = validItems.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images?.[0]?.url || '',
      price: item.price,
      quantity: item.quantity,
      customPhoto: customPhotos?.[item.product._id.toString()] || '',
    }));

    const paymentInfo = { method: 'cash', status: 'pending' };

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingInfo,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    // Clear cart after order
    await Cart.findOneAndDelete({ user: req.user.id });

    // Update stock
    for (const item of validItems) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my orders
// @route   GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    // Ensure user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort('-createdAt');
    const totalRevenue = orders.reduce((acc, o) => acc + o.totalPrice, 0);
    res.status(200).json({ success: true, count: orders.length, totalRevenue, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = req.body.orderStatus;
    if (req.body.orderStatus === 'Delivered') {
      order.deliveredAt = Date.now();
      order.paymentInfo.status = 'paid';
    }

    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
