import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/environment.js";
import { rateLimiter } from "./middleware/rateLimit.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import aiRoutes from "./routes/ai.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import progressRoutes from "./routes/progress.routes.js";

const app: express.Express = express();

app.use(helmet());

const allowedOrigins = config.nodeEnv === "development"
  ? ["http://localhost:3000", "http://localhost:4000"]
  : config.allowedOrigins;

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "NRB Vidyalaya LMS API",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/ai", aiRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/progress", progressRoutes);

app.use(errorHandler);

export default app;
