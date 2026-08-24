import app from "./app.js";
import { config } from "./config/environment.js";

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 NRB Vidyalaya API server running on port ${PORT}`);
  console.log(`📚 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
