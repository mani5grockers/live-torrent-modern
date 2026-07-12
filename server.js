import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import liveTorrentBackend from "live-torrent-backend";
import ytsApi from "./yts-api.js";

// setup env vars
dotenv.config();

// Environment validation
const requiredEnvVars = ["PORT"];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://yts.lt", "https://yts.mx"],
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use("/api", limiter);

// Stricter rate limiting for torrent operations
const torrentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many torrent operations, please try again later."
});
app.use("/api/torrent", torrentLimiter);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// Logging
app.use(morgan("combined"));

// Body parsing (built into Express 4.16+)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// API routes with CORS
app.use("/api", cors(corsOptions), liveTorrentBackend(true));
app.use("/api/yts", cors(corsOptions), ytsApi);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// for production
if (process.env.NODE_ENV === "production") {
  // handle static content
  app.use(express.static("./dist", {
    maxAge: "1y",
    etag: true
  }));

  // handle SPA
  app.get(/.*/, (req, res) => {
    res.sendFile(__dirname + "/dist/index.html");
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`CORS origins: ${corsOptions.origin}`);
});
