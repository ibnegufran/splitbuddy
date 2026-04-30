const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const groupRoutes = require("./routes/groupRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const authRoutes = require("./routes/authRoutes");
const publicRoutes = require("./routes/publicRoutes");

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in environment variables.");
}

connectDB();

const app = express();

const normalizeOrigin = (value = "") =>
  value.trim().replace(/^['"]|['"]$/g, "").replace(/\/+$/, "").toLowerCase();

const configuredOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => normalizeOrigin(origin))
  : [];

const isOriginAllowed = (requestOrigin) => {
  if (!requestOrigin) {
    return true;
  }

  const normalized = normalizeOrigin(requestOrigin);
  if (configuredOrigins.length === 0) {
    return true;
  }

  return configuredOrigins.some((allowed) => {
    if (allowed === normalized) {
      return true;
    }
    if (allowed.startsWith("*.")) {
      const suffix = allowed.slice(1);
      return normalized.endsWith(suffix);
    }
    return false;
  });
};

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  if (isOriginAllowed(requestOrigin)) {
    res.header("Access-Control-Allow-Origin", requestOrigin || "*");
  }
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  return next();
});

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "SplitBuddy API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/groups/:groupId", expenseRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong." });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
