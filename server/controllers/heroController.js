const HeroSlide = require('../models/HeroSlide');
const { cloudinary } = require('../config/cloudinary');

// @desc  Get all active slides (public)
// @route GET /api/hero
exports.getSlides = async (req, res, next) => {
  try {
    const slides = await HeroSlide.find({ isActive: true }).sort('order');
    res.json({ success: true, slides });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all slides including inactive (admin)
// @route GET /api/hero/all
exports.getAllSlides = async (req, res, next) => {
  try {
    const slides = await HeroSlide.find().sort('order');
    res.json({ success: true, slides });
  } catch (err) {
    next(err);
  }
};

// @desc  Add a slide (admin)
// @route POST /api/hero
exports.addSlide = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }
    const slide = await HeroSlide.create({
      image: { public_id: req.file.filename, url: req.file.path },
      order: req.body.order || 0,
    });
    res.status(201).json({ success: true, slide });
  } catch (err) {
    next(err);
  }
};

// @desc  Update slide (toggle active / reorder)
// @route PUT /api/hero/:id
exports.updateSlide = async (req, res, next) => {
  try {
    const slide = await HeroSlide.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!slide) return res.status(404).json({ success: false, message: 'Slide not found' });
    res.json({ success: true, slide });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete slide (admin)
// @route DELETE /api/hero/:id
exports.deleteSlide = async (req, res, next) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) return res.status(404).json({ success: false, message: 'Slide not found' });
    // Remove from Cloudinary
    if (slide.image?.public_id) {
      await cloudinary.uploader.destroy(slide.image.public_id).catch(() => {});
    }
    await slide.deleteOne();
    res.json({ success: true, message: 'Slide deleted' });
  } catch (err) {
    next(err);
  }
};
