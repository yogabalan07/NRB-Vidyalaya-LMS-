import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/environment.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.nodeEnv === "development" ? "http://localhost:3000" : "" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "NRB Vidyalaya LMS API",
    timestamp: new Date().toISOString(),
  });
});

// Placeholder route groups
// TODO: Add route imports
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/courses", courseRoutes);

export default app;
