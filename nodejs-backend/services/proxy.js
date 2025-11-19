const httpProxy = require("http-proxy-middleware");

const proxyToSpring = httpProxy.createProxyMiddleware({
  target: "http://localhost:8080", // Spring Boot run port 8080
  changeOrigin: true,
  pathRewrite: { "^/api": "" }, // /api/user → http://localhost:8080/user
});

module.exports = proxyToSpring;