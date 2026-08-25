import app from "./app.js";
import { config } from "./config/environment.js";

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`NRB Vidyalaya API server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

function shutdown(signal: string) {
  console.log(`${signal} received. Starting graceful shutdown...`);
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
