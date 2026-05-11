require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║        Auth Service Running            ║
╠════════════════════════════════════════╣
║  🚀 Port:        ${String(PORT).padEnd(18)} ║
║  📍 Environment: ${String(NODE_ENV).padEnd(18)} ║
║  🔗 URL:         http://localhost:${String(PORT).padEnd(12)} ║
║  ✅ Health:      /health                 ║
╚════════════════════════════════════════╝
  `);
});