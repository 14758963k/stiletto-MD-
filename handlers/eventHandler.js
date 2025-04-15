// handlers/eventHandler.js
import { handleCommand } from "./commandHandler.js";
import { logMessage, formatError } from "../core/utils.js";

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_BACKOFF = 5000; // 5 seconds

/**
 * Calculates exponential backoff delay.
 * @param {number} attempt - Current attempt number.
 * @returns {number} Delay in milliseconds.
 */
function calculateBackoff(attempt) {
  return INITIAL_BACKOFF * Math.pow(2, attempt);
}

/**
 * Sets up robust event handlers for messages, connection updates, and status changes.
 * Every event is handled with cold precision.
 * @param {object} sock - WhatsApp socket instance.
 * @param {Function} reconnect - Function to reinitialize the connection.
 */
export function setupEventHandlers(sock, reconnect) {
  // Listen for incoming messages (only "notify" type)
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    try {
      if (type !== "notify") return;
      const message = messages[0];
      if (!message.message || message.key.fromMe) return;
      logMessage(`New message from ${message.key.remoteJid}.`);
      await handleCommand(sock, message);
    } catch (error) {
      console.error("Error in messages.upsert:", formatError(error));
    }
  });

  // Connection update handler with exponential backoff
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
      logMessage(`Connection closed. Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = calculateBackoff(reconnectAttempts);
          logMessage(`Attempt ${reconnectAttempts + 1}: Reconnecting in ${delay / 1000}s...`);
          reconnectAttempts++;
          setTimeout(() => {
            reconnect().catch((err) => {
              console.error("Reconnection error:", formatError(err));
            });
          }, delay);
        } else {
          logMessage("Max reconnect attempts reached. Exiting without remorse.");
          process.exit(1);
        }
      } else {
        logMessage("Disconnected permanently. Check credentials or network. No sympathy given.");
      }
    } else if (connection === "open") {
      logMessage("Stiletto MD is connected. Cold, efficient, and online.");
      reconnectAttempts = 0;
    }
  });

  // Log message deletion events
  sock.ev.on("messages.delete", (data) => {
    logMessage("A message deletion event occurred. No record remains.");
  });

  // Listen for status updates
  sock.ev.on("status.update", async (updates) => {
    try {
      for (const update of updates) {
        logMessage(`Status update from ${update.jid} at ${new Date().toISOString()}.`);
      }
    } catch (error) {
      console.error("Error processing status update:", formatError(error));
    }
  });
}