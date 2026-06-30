require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const sampleProducts = [
  // ── Coffee Mug ────────────────────────────────────────────
  {
    name: 'Classic White Ceramic Coffee Mug',
    description: 'A timeless white ceramic mug perfect for your morning coffee or tea. Microwave and dishwasher safe. 350ml capacity.',
    category: 'Coffee Mug',
    price: 299,
    stock: 100,
    ratings: 4.7,
    numReviews: 85,
    isFeatured: true,
    isBestSeller: true,
    images: [{ public_id: 'mug_1', url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop' }],
  },
  {
    name: 'Personalised Name Coffee Mug',
    description: 'Custom printed mug with your name or message. High-quality ceramic with vibrant print that lasts. Great gifting option.',
    category: 'Coffee Mug',
    price: 399,
    stock: 80,
    ratings: 4.9,
    numReviews: 120,
    isFeatured: true,
    isBestSeller: true,
    images: [{ public_id: 'mug_2', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop' }],
  },
  {
    name: 'Travel Coffee Mug with Lid',
    description: 'Insulated stainless steel travel mug. Keeps your drinks hot for 6 hours and cold for 12 hours. Leak-proof lid.',
    category: 'Coffee Mug',
    price: 549,
    stock: 60,
    ratings: 4.6,
    numReviews: 67,
    isFeatured: false,
    isBestSeller: false,
    images: [{ public_id: 'mug_3', url: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=600&h=600&fit=crop' }],
  },

  // ── Key Chain ─────────────────────────────────────────────
  {
    name: 'Photo Printed Key Chain',
    description: 'Carry your memories everywhere with this high-quality photo printed key chain. Durable acrylic with a shiny finish.',
    category: 'Key Chain',
    price: 149,
    stock: 150,
    ratings: 4.5,
    numReviews: 98,
    isFeatured: true,
    isBestSeller: true,
    images: [{ public_id: 'keychain_1', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop' }],
  },
  {
    name: 'Custom Name Metal Key Chain',
    description: 'Premium stainless steel key chain engraved with your name or initials. A stylish and durable accessory.',
    category: 'Key Chain',
    price: 199,
    stock: 120,
    ratings: 4.4,
    numReviews: 54,
    isFeatured: false,
    isBestSeller: false,
    images: [{ public_id: 'keychain_2', url: 'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=600&h=600&fit=crop' }],
  },
  {
    name: 'Heart Shape Couple Key Chain',
    description: 'A beautiful pair of heart-shaped keychains for couples. Comes in a premium gift box. Perfect anniversary gift.',
    category: 'Key Chain',
    price: 299,
    stock: 90,
    ratings: 4.8,
    numReviews: 76,
    isFeatured: false,
    isBestSeller: true,
    images: [{ public_id: 'keychain_3', url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=600&fit=crop' }],
  },

  // ── Magic Mirror ──────────────────────────────────────────
  {
    name: 'LED Magic Photo Mirror',
    description: 'A stunning decorative mirror with LED border lighting and a custom photo printed in the center. Perfect wall decor.',
    category: 'Magic Mirror',
    price: 1299,
    stock: 40,
    ratings: 4.8,
    numReviews: 42,
    isFeatured: true,
    isBestSeller: true,
    images: [{ public_id: 'mirror_1', url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&h=600&fit=crop' }],
  },
  {
    name: 'Round Personalised Magic Mirror',
    description: 'Elegant round magic mirror with your photo and message etched on the surface. Comes with a hanging bracket.',
    category: 'Magic Mirror',
    price: 999,
    stock: 35,
    ratings: 4.6,
    numReviews: 28,
    isFeatured: false,
    isBestSeller: false,
    images: [{ public_id: 'mirror_2', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=600&fit=crop' }],
  },

  // ── Mobile Cover ──────────────────────────────────────────
  {
    name: 'Custom Photo Mobile Cover',
    description: 'Print your favourite photo on a premium quality hard plastic mobile cover. Available for all major phone models.',
    category: 'Mobile Cover',
    price: 349,
    stock: 200,
    ratings: 4.7,
    numReviews: 156,
    isFeatured: true,
    isBestSeller: true,
    images: [{ public_id: 'cover_1', url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=600&fit=crop' }],
  },
  {
    name: 'Personalised Name Mobile Cover',
    description: 'Stylish mobile cover with your name or initials printed in bold. Slim-fit, lightweight and scratch resistant.',
    category: 'Mobile Cover',
    price: 299,
    stock: 180,
    ratings: 4.5,
    numReviews: 112,
    isFeatured: false,
    isBestSeller: true,
    images: [{ public_id: 'cover_2', url: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&h=600&fit=crop' }],
  },
  {
    name: 'Couple Photo Mobile Cover',
    description: 'A romantic mobile cover featuring your couple photo. Made from durable TPU material with precise cutouts.',
    category: 'Mobile Cover',
    price: 399,
    stock: 150,
    ratings: 4.8,
    numReviews: 89,
    isFeatured: false,
    isBestSeller: false,
    images: [{ public_id: 'cover_3', url: 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=600&h=600&fit=crop' }],
  },

  // ── Customised T-Shirt ────────────────────────────────────
  {
    name: 'Custom Photo Printed T-Shirt',
    description: 'High-quality 100% cotton t-shirt with your photo printed using advanced sublimation. Fade-resistant and soft to wear.',
    category: 'Customised T-Shirt',
    price: 699,
    stock: 75,
    ratings: 4.6,
    numReviews: 93,
    isFeatured: true,
    isBestSeller: true,
    images: [{ public_id: 'tshirt_1', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop' }],
  },
  {
    name: 'Personalised Name & Quote T-Shirt',
    description: 'Express yourself with a custom name and motivational quote printed on a premium cotton t-shirt. Available in multiple colours.',
    category: 'Customised T-Shirt',
    price: 599,
    stock: 85,
    ratings: 4.4,
    numReviews: 67,
    isFeatured: false,
    isBestSeller: false,
    images: [{ public_id: 'tshirt_2', url: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=600&h=600&fit=crop' }],
  },
  {
    name: 'Couple Matching T-Shirt Set',
    description: 'A matching set of two t-shirts with complementary custom designs for couples. Made from breathable cotton blend.',
    category: 'Customised T-Shirt',
    price: 1199,
    stock: 50,
    ratings: 4.9,
    numReviews: 45,
    isFeatured: true,
    isBestSeller: true,
    images: [{ public_id: 'tshirt_3', url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=600&fit=crop' }],
  },

  // ── Photo Frame ───────────────────────────────────────────
  {
    name: 'Wooden Personalised Photo Frame',
    description: 'Elegant natural wood photo frame with your name and date engraved. Perfect for gifting on special occasions.',
    category: 'Photo Frame',
    price: 499,
    stock: 60,
    ratings: 4.7,
    numReviews: 103,
    isFeatured: true,
    isBestSeller: true,
    images: [{ public_id: 'frame_1', url: 'https://images.unsplash.com/photo-1531685250784-7569952593d2?w=600&h=600&fit=crop' }],
  },
  {
    name: 'Multi-Photo Collage Frame',
    description: 'A beautiful collage frame holding 6 photos. Comes with a custom message printed on the mat board. Great for memories.',
    category: 'Photo Frame',
    price: 799,
    stock: 45,
    ratings: 4.8,
    numReviews: 72,
    isFeatured: false,
    isBestSeller: true,
    images: [{ public_id: 'frame_2', url: 'https://images.unsplash.com/photo-1542038374682-bdab4f818e6c?w=600&h=600&fit=crop' }],
  },
  {
    name: 'LED Light Photo Frame',
    description: 'A premium photo frame with warm LED border lighting. USB powered. Perfect as a bedside or desk decoration.',
    category: 'Photo Frame',
    price: 999,
    stock: 40,
    ratings: 4.9,
    numReviews: 58,
    isFeatured: true,
    isBestSeller: false,
    images: [{ public_id: 'frame_3', url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&h=600&fit=crop' }],
  },
];

const seedDB = async () => {
  await connectDB();

  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert sample products
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`✅ Seeded ${inserted.length} products successfully!\n`);

    // Summary by category
    const categories = [...new Set(sampleProducts.map((p) => p.category))];
    categories.forEach((cat) => {
      const count = sampleProducts.filter((p) => p.category === cat).length;
      console.log(`   ${cat}: ${count} product${count > 1 ? 's' : ''}`);
    });

    console.log('\n🚀 Database ready!');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedDB();
