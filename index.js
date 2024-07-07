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
import admin from 'firebase-admin';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin SDK using environment variables
admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET // Replace with your Firebase Storage bucket name
});
const bucket = admin.storage().bucket();

app.use(express.json());
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(cors({
  origin: 'https://movie-mania-jet-gamma.vercel.app', // Replace with your frontend URL
  credentials: true,
}));

const storage = multer.memoryStorage(); // Use memory storage for multer
const upload = multer({ storage: storage });

app.post('/api/movies', upload.single('imagePath'), createMovie);

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

app.use(errorMiddleware);

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at port: ${PORT}`);
  });
}).catch((err) => {
  console.error('Database connection failed', err);
  process.exit(1);
});
