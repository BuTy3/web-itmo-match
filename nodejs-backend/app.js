const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const authenticate = require("./middleware/auth");
const proxyToSpring = require("./services/proxy");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/auth", authRoutes); // Routes
app.use("/api", authenticate, proxyToSpring); // Proxy: to Spring Boot with authentication

// Health check
app.get('/health', (req, res) => res.status(200).send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Node.js server running on port ${PORT}`);
});