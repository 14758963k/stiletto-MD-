// plugins/statusAndDeletion.js
import { logMessage } from "../core/utils.js";

/**
 * Automatically views status updates without leaving a trace.
 * The bot silently marks status updates as viewed and logs minimal metadata.
 * No sentiment, no fluff.
 * @param {object} sock - The WhatsApp socket instance.
 * @param {Array} updates - Array of status update objects.
 */
export async function autoStatusViewer(sock, updates) {
  for (const update of updates) {
    try {
      // Silently mark the status as viewed; no read receipt is sent.
      await sock.readStatus([update.jid]);
      logMessage(`Status viewed for ${update.jid} at ${new Date().toISOString()}`);
    } catch (error) {
      logMessage(`Status view failure for ${update.jid}: ${error.message}`);
    }
  }
}

/**
 * Schedules deletion of a message with surgical precision.
 * After the specified delay, the message is removed without mercy.
 * @param {object} sock - The WhatsApp socket instance.
 * @param {object} messageKey - The key of the message to delete.
 * @param {number} delayMs - Delay in milliseconds (default: 60000).
 */
export function scheduleDelete(sock, messageKey, delayMs = 60000) {
  setTimeout(async () => {
    try {
      await sock.sendMessage(messageKey.remoteJid, {
        delete: {
          id: messageKey.id,
          participant: messageKey.fromMe ? undefined : messageKey.participant,
        },
      });
      logMessage(`Message ${messageKey.id} deleted after ${delayMs}ms. No trace remains.`);
    } catch (error) {
      logMessage(`Deletion failed for message ${messageKey.id}: ${error.message}`);
    }
  }, delayMs);
}