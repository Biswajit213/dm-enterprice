const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema(
  {
    image: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HeroSlide', heroSlideSchema);
