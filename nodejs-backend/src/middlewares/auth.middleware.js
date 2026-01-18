// Auth middleware
import { verifyToken } from "../security/jwt.js";

// API Middleware (return JSON)
export function authApiRequired(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const token = authHeader.slice(7); // clear "Bearer "

  try {
    const payload = verifyToken(token);

    // Send to next handler
    req.user = {
      id: payload.userId,
      login: payload.login,
      ukey: payload.ukey,
    };

    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    return res.status(401).json({ ok: false, message: "Invalid token" });
  }
}

// Page middleware (redirect /login)
export function authPageRequired(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.redirect("/login");
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.userId,
      login: payload.login,
      ukey: payload.ukey,
    };
    next();
  } catch {
    return res.redirect("/login");
  }
}
