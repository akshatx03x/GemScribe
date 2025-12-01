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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:5173", "https://gem-scribe.vercel.app", "https://gemscribee.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

app.use("/api/auth", AuthRoute);

if (process.env.NODE_ENV === "production") {
    const frontendPath = path.join(__dirname, "../frontend/dist");
    const fs = await import("fs");

    if (fs.existsSync(frontendPath)) {
        app.use(express.static(frontendPath));
        app.get(/.*/, (req, res) => {
            res.sendFile(path.join(frontendPath, "index.html"));
        });
    } else {
        console.error("Frontend build directory not found:", frontendPath);
    }
}

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

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on PORT: ${PORT}`);
    });
}

export default app;
