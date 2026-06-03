const mongoose = require('mongoose');
const Product = require('./models/Product');
const Inventory = require('./models/Inventory');
const config = require('./config/config');

const products = [
  {
    name: 'Premium 2-Ply Coir Rope',
    category: 'coir-rope',
    shortDescription: 'Heavy-duty 2-ply coir rope with premium tensile strength.',
    description: 'Extremely strong, environment-friendly natural coir rope made from organic coconut husk fibers. Perfect for marine applications, agricultural binding, soil bio-engineering, and general industrial usage.',
    qualityGrade: 'Premium',
    images: [{ url: '/images/products/coir-rope.jpg', alt: 'Premium 2-Ply Coir Rope' }],
    weight: { value: 50, unit: 'kg' },
    price: { amount: 150, currency: 'INR', perUnit: 'kg' },
    specifications: {
      length: '220 meters',
      diameter: '12mm',
      tensileStrength: '450 kgf',
      moistureContent: '14%',
      color: 'Golden Brown',
      fiberType: 'Bristle Fiber'
    },
    sku: 'CR-PREM-2PLY',
    tags: ['rope', 'premium', '2-ply', 'heavy-duty']
  },
  {
    name: 'Standard Spun Coir Yarn',
    category: 'coir-yarn',
    shortDescription: 'Uniformly spun coir yarn, ideal for weaving and mats.',
    description: 'Machine-spun natural coir yarn with uniform thickness and high tensile strength. Excellent choice for geotextile weaving, hop cultivation twine, domestic mat weaving, and agricultural tying.',
    qualityGrade: 'Standard',
    images: [{ url: '/images/products/coir-yarn.jpg', alt: 'Standard Spun Coir Yarn' }],
    weight: { value: 25, unit: 'kg' },
    price: { amount: 110, currency: 'INR', perUnit: 'kg' },
    specifications: {
      length: '350 meters',
      diameter: '6mm',
      tensileStrength: '180 kgf',
      moistureContent: '15%',
      color: 'Natural Brown',
      fiberType: 'Mixed Fiber'
    },
    sku: 'CY-STD-SPUN',
    tags: ['yarn', 'spinning', 'standard', 'geotextiles']
  },
  {
    name: 'Export Grade Coir Fiber Bundle',
    category: 'coir-bundle',
    shortDescription: 'Tightly packed coir fiber bundles for upholstery and bedding.',
    description: 'Highly compressed long bristle coir fiber bundles prepared for export markets. Free from impurities, widely used in mattress manufacture, acoustic insulation pads, and industrial brush construction.',
    qualityGrade: 'Export Grade',
    images: [{ url: '/images/products/coir-bundle.jpg', alt: 'Export Grade Coir Fiber Bundle' }],
    weight: { value: 100, unit: 'kg' },
    price: { amount: 85, currency: 'INR', perUnit: 'kg' },
    specifications: {
      length: 'N/A',
      diameter: 'N/A',
      tensileStrength: 'N/A',
      moistureContent: '12%',
      color: 'Bright Golden',
      fiberType: 'Long Bristle'
    },
    sku: 'CB-EXP-BDL',
    tags: ['bundle', 'fiber', 'export', 'compressed']
  },
  {
    name: 'Raw Unprocessed Coir Fiber',
    category: 'raw-coir-fiber',
    shortDescription: 'Bulk raw coir fiber direct from decorticating units.',
    description: 'Raw, uncombed coir fiber directly obtained from coconut husks via mechanical extraction. Contains mixed short and medium fibers. Ideal for soil conditioning, composting blends, and raw industrial raw materials.',
    qualityGrade: 'Industrial',
    images: [{ url: '/images/products/raw-fiber.jpg', alt: 'Raw Unprocessed Coir Fiber' }],
    weight: { value: 200, unit: 'kg' },
    price: { amount: 50, currency: 'INR', perUnit: 'kg' },
    specifications: {
      length: 'N/A',
      diameter: 'N/A',
      tensileStrength: 'N/A',
      moistureContent: '18%',
      color: 'Dark Brown',
      fiberType: 'Mattress Fiber'
    },
    sku: 'CF-RAW-BULK',
    tags: ['raw', 'bulk', 'fiber', 'industrial']
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB for seeding products...');

    // Clear existing products and inventory
    await Product.deleteMany({});
    await Inventory.deleteMany({});
    console.log('Cleared existing products and inventory.');

    // Seed products & create corresponding inventory records
    for (const p of products) {
      const product = await Product.create(p);
      console.log('✅ Product seeded:', product.name);

      const qty = Math.floor(Math.random() * 500) + 50; // Random stock between 50 and 550
      await Inventory.create({
        product: product._id,
        quantity: qty,
        warehouse: 'Main Warehouse A',
        minStock: 30,
        maxStock: 1000
      });
      console.log(`✅ Inventory seeded for ${product.name} with quantity ${qty}`);
    }

    console.log('Product and Inventory seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
