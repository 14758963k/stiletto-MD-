// stiletto.js
import { connectWhatsApp } from "./platforms/whatsapp.js";
import { setupEventHandlers } from "./handlers/eventHandler.js";
import { logMessage } from "./core/utils.js";

async function startBot() {
  try {
    const sock = await connectWhatsApp();
    // Provide a cold reconnection function
    setupEventHandlers(sock, async () => {
      logMessage("Reconnecting...");
      await startBot();
    });
    logMessage("✅ Stiletto MD is running...");
  } catch (error) {
    console.error("Failed to start Stiletto MD:", error);
    process.exit(1);
  }
}

startBot();