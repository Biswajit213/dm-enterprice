const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 100 },
    description: { type: String, required: [true, 'Description is required'], maxlength: 2000 },
    category: {
      type: String,
      required: true,
      enum: ['Coffee Mug', 'Key Chain', 'Magic Mirror', 'Mobile Cover', 'Customised T-Shirt', 'Photo Frame'],
    },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    stock: { type: Number, required: true, min: [0, 'Stock cannot be negative'], default: 0 },
    sizes: [{ type: String, trim: true }], // e.g. for Photo Frame: ["4x6", "5x7", "8x10"]
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Text index for search
productSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
