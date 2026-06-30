const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');
const APIFeatures = require('../utils/apiFeatures');

// @desc    Get all products
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const features = new APIFeatures(Product.find(), req.query)
      .search(['name', 'description', 'category'])
      .filter()
      .sort()
      .paginate(12);

    // Count with same filters (before pagination)
    const countFeatures = new APIFeatures(Product.find(), req.query)
      .search(['name', 'description', 'category'])
      .filter();
    const total = await Product.countDocuments(countFeatures.query.getFilter());

    const products = await features.query;

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: features.page,
      pages: Math.ceil(total / features.limit),
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (Admin)
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.path && file.filename) {
          images.push({ public_id: file.filename, url: file.path });
        }
      }
    }

    // Parse sizes JSON string sent from FormData
    const body = { ...req.body };
    if (body.sizes) {
      try { body.sizes = JSON.parse(body.sizes); } catch { body.sizes = []; }
    }

    const product = await Product.create({ ...body, images });
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Parse sizes JSON string sent from FormData
    const body = { ...req.body };
    if (body.sizes) {
      try { body.sizes = JSON.parse(body.sizes); } catch { body.sizes = []; }
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      for (const img of product.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }
      body.images = req.files.map((f) => ({ public_id: f.filename, url: f.path }));
    }

    product = await Product.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete images from Cloudinary
    for (const img of product.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(6);
    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get best sellers
// @route   GET /api/products/bestsellers
exports.getBestSellers = async (req, res, next) => {
  try {
    const products = await Product.find({ isBestSeller: true }).limit(8);
    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};
