import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";

dotenv.config();

// เชื่อมต่อฐานข้อมูล MongoDB ก่อนเริ่มเซิร์ฟเวอร์
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Route สำหรับ authentication และ post CRUD
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Express MVC API is running" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
