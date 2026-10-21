import express from "express";
import "dotenv/config.js";
import authRouter from "./routes/authRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";

const app = express();
connectDB(); 


app.use(cors({origin: process.env.ORIGINS.split(","), credentials: true}));
app.use(express.json());
app.use(cookieParser());

app.get("/",(req,res)=> res.send("Server is running!"));
app.use("/api/auth", authRouter);
// centralized error handler
app.use((err, _req, res, next) => {
  console.error(`[Error]: ${err.message}`);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});