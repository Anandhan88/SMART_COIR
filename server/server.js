const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const config = require('./config/config');
const connectDB = require('./config/db');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect to Database
connectDB();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Flexible CORS for Localhost & Production deployments
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:3000',
  'https://smart-coir-client.onrender.com',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production' || origin.endsWith('.onrender.com') || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory
const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
}

// Root Status Page
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'Smart Coir Backend API',
    status: 'Online 🚀',
    health: '/api/health',
    documentation: '/llms.txt',
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/workers', require('./routes/workers'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Smart Coir API is running', timestamp: new Date() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  socket.on('join-room', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their room`);
  });

  socket.on('join-chat', (chatId) => {
    socket.join(`chat-${chatId}`);
  });

  socket.on('send-message', (data) => {
    socket.to(`chat-${data.chatId}`).emit('new-message', data);
  });

  socket.on('typing', (data) => {
    socket.to(`chat-${data.chatId}`).emit('user-typing', data);
  });

  socket.on('stop-typing', (data) => {
    socket.to(`chat-${data.chatId}`).emit('user-stop-typing', data);
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`\n🚀 Smart Coir Server running on port ${PORT}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`🌐 Client URL: ${config.clientUrl}\n`);
});

module.exports = { app, server, io };
