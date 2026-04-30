const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const groupRoutes = require("./routes/groupRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const authRoutes = require("./routes/authRoutes");
const publicRoutes = require("./routes/publicRoutes");

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing in environment variables.");
  process.exit(1);
}

connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
