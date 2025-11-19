import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import { authApiRequired, authPageRequired } from './middlewares/auth.middleware.js';

const app = express();

// Global middleware 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // parse HTTP request form
app.use(cookieParser());

// Routes login/register
app.use('/auth', authRoutes);

// Trang login (minh hoạ, bạn có thể thay bằng file HTML thật)
app.get('/login', (req, res) => {
  res.send('<h1>Login page</h1>');
});

// Trang home, cần đăng nhập → nếu không có token → redirect /login
app.get('/home', authPageRequired, (req, res) => {
  res.send(`<h1>Welcome, ${req.user.login}</h1>`);
});

// API protected – ví dụ /api/profile
app.get('/api/profile', authApiRequired, (req, res) => {
  res.json({
    ok: true,
    user: {
      id: req.user.id,
      login: req.user.login,
      ukey: req.user.ukey,
    },
  });
});

export default app;
