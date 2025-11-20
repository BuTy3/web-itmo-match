// app config
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import collectionRoutes from './routes/collection.routes.js';
import { authPageRequired } from './middlewares/auth.middleware.js';

const app = express();

// Global middleware 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // parse HTTP request form
app.use(cookieParser());

// Auth routes
app.use('/auth', authRoutes);

// Collections (constructor + items)
app.use('/collections', collectionRoutes);

// login page / home demo
app.get('/login', (req, res) => {
  res.send('<h1>Login page</h1>');
});

app.get('/home', authPageRequired, (req, res) => {
  res.send(`<h1>Welcome, ${req.user.login}</h1>`);
});

export default app;