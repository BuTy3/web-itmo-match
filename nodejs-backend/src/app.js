// app config
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import authRoutes from "./routes/auth.routes.js";
import collectionRoutes from "./routes/collection.routes.js";
import drawingRoutes from "./routes/drawing.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import homeRoutes from "./routes/home.routes.js";
import historyRoutes from "./routes/history.routes.js";
import roomsRoutes from "./routes/rooms.routes.js";
import roomVotingRoutes from "./routes/room.routes.js";

import { authPageRequired } from "./middlewares/auth.middleware.js";
import { prisma } from "./db.js";
import { bugsnagMiddleware } from "./bugsnag.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load OpenAPI specification from YAML file (root folder)
const swaggerDocument = YAML.load(path.join(__dirname, "..", "openapi.yaml"));

const app = express();

// Bugsnag request handler (if Bugsnag is enabled)
// This middleware must be added before all other middlewares and routes.
if (bugsnagMiddleware) {
  app.use(bugsnagMiddleware.requestHandler);
}

// Global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // parse HTTP request form
app.use(cookieParser());

// Serve static files from ../uploads (images)
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "..", "uploads")),
);

// Swagger UI for OpenAPI documentation (static YAML)
// Available at: GET /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Upload routes (images)
app.use("/upload", uploadRoutes);

// Auth routes
app.use("/auth", authRoutes);

// Collections (constructor + items)
app.use("/collections", collectionRoutes);

// Drawing (public)
app.use("/drawing", drawingRoutes);

// Home routes
app.use("/home", homeRoutes);

// History routes
app.use("/history", historyRoutes);

// Rooms routes
app.use("/rooms", roomsRoutes);
app.use("/rooms", roomVotingRoutes);

// login page / home demo
app.get("/login", (req, res) => {
  res.send("<h1>Login page</h1>");
});

app.get("/home", authPageRequired, (req, res) => {
  res.send(`<h1>Welcome, ${req.user.login}</h1>`);
});

app.get("/db-test", async (req, res) => {
  try {
    // Very simple query: adjust table name later if needed
    // For now we just test connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, message: "DB connection is OK" });
  } catch (err) {
    console.error("DB test error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

// Test route to trigger Bugsnag error manually
app.get("/bugsnag-test", (req, res, next) => {
  try {
    throw new Error("Bugsnag test error from /bugsnag-test");
  } catch (err) {
    // Pass error to next middleware so Bugsnag can capture it
    return next(err);
  }
});

// Bugsnag error handler MUST be the last middleware
if (bugsnagMiddleware) {
  app.use(bugsnagMiddleware.errorHandler);
}

export default app;
