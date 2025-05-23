import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import courseRoute from './routes/course.route.js';
import userRoute from './routes/user.route.js';
import adminRoute from './routes/admin.route.js';
import orderRoute from './routes/order.route.js';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import { v2 as cloudinary } from 'cloudinary';
import cors from 'cors';

// Load environment variables
dotenv.config();

console.log('Loaded Environment Variables:', {
    CLOUD_NAME: process.env.CLOUD_NAME,
    API_KEY: process.env.API_KEY,
    API_SECRET: process.env.API_SECRET,
});

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// Add logging for all incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request cookies:', req.cookies);
  next();
});

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:5173', 'https://course-selling-tan.vercel.app'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

const port = process.env.PORT || 3100;
const DB_URI = process.env.MONGO_URI;

// Routes
app.use('/api/courses', courseRoute);
app.use('/api/user', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/order', orderRoute);

// Cloudinary configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET,
});

// Async function to connect to MongoDB
const connectDB = async () => {
    try {
      await mongoose.connect(DB_URI);
      console.log('Connected to MongoDB');
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      }).on('error', (err) => {
        console.error('Server startup error:', err);
        process.exit(1);
      });
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
      process.exit(1);
    }
};
  
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

connectDB();