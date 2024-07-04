import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createMovie } from './controllers/movieController.js';
import authRoutes from './routes/authroutes.js';
import movieRoutes from './routes/movieroutes.js';
import { errorMiddleware } from './middlewares/error-middleware.js';
import { connectDb } from './utils/connectDb.js';
import session from 'express-session';



/* CONFIGURATIONS */
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files from the public directory
app.use('/upload', express.static(path.join(__dirname, 'public/upload'))); // Serve static files from /upload

app.use(cors({
  origin: 'https://movie-mania-jet-gamma.vercel.app', // Replace with your frontend URL
  credentials: true,
}));
app.use('/public', express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path, stat) => {
    res.set('Access-Control-Allow-Origin', '*'); // Set CORS headers
  }
}));

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    return cb(null, "./public/upload")
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`)
  }
})
const upload = multer({ storage: storage });

// Route for creating a new movie with file upload
app.post('/api/movies', upload.single('imagePath'), createMovie);

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

app.use(errorMiddleware);

// Start server
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at port: ${PORT}`);
  });
}).catch((err) => {
  console.error('Database connection failed', err);
  process.exit(1);
});
