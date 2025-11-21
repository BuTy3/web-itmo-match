// app config
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import collectionRoutes from './routes/collection.routes.js';
import drawingRoutes from './routes/drawing.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import { authPageRequired } from './middlewares/auth.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Global middleware 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // parse HTTP request form
app.use(cookieParser());

// Serve static files from ../uploads (images)
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', '..', 'uploads'))
);

// Upload routes (images)
app.use('/upload', uploadRoutes);

// Auth routes
app.use('/auth', authRoutes);

// Collections (constructor + items)
app.use('/collections', collectionRoutes);

// Drawing (public)
app.use('/drawing', drawingRoutes);

// login page / home demo
app.get('/login', (req, res) => {
  res.send('<h1>Login page</h1>');
});

app.get('/home', authPageRequired, (req, res) => {
  res.send(`<h1>Welcome, ${req.user.login}</h1>`);
});

export default app;