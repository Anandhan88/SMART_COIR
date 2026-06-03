const mongoose = require('mongoose');
const User = require('./models/User');
const config = require('./config/config');

const seedUsers = async () => {
  try {
    // Connect to database
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB for seeding users...');

    // Clear existing users with these emails
    await User.deleteMany({ email: { $in: ['admin@smartcoir.com', 'client@coirbuyer.com'] } });
    console.log('Cleared existing test users.');

    // Create Admin User
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@smartcoir.com',
      password: 'adminpassword',
      role: 'admin',
      company: 'Smart Coir Manufacturing',
      phone: '1234567890',
      verified: true
    });
    console.log('✅ Admin user seeded:', admin.email);

    // Create Client User
    const client = await User.create({
      name: 'Client User',
      email: 'client@coirbuyer.com',
      password: 'clientpassword',
      role: 'client',
      company: 'Eco Coir Importers',
      phone: '0987654321',
      verified: true
    });
    console.log('✅ Client user seeded:', client.email);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
