import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import AuthRoute from "./routes/Auth.route.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

// Routes
app.use("/api/auth", AuthRoute);

// Production: Serve frontend static files
if (process.env.NODE_ENV === "production") {
    const frontendPath = path.join(__dirname, "../frontend/dist");
    const fs = await import("fs");

    if (fs.existsSync(frontendPath)) {
        app.use(express.static(frontendPath));

        // SPA fallback: serve index.html for any unknown routes
        app.get("*", (req, res) => {
            res.sendFile(path.join(frontendPath, "index.html"));
        });
    } else {
        console.error("Frontend build directory not found:", frontendPath);
    }
}

// DB Connection
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_CONN);
        console.log("Database Connection Successful");
    } catch (err) {
        console.error("Database Connection lost", err);
        process.exit(1);
    }
}

await connectDB();

// Start server locally (skip in Vercel)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on PORT: ${PORT}`);
    });
}

export default app;
