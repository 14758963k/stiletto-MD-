// plugins/systemCommands.js
import { logMessage, formatError } from "../core/utils.js";
import { execSync } from "child_process";

/**
 * Processes the .update command.
 * Simulates a system update with a cold, precise response.
 * @param {object} sock - The WhatsApp socket instance.
 * @param {object} message - The incoming message object.
 */
export async function processUpdate(sock, message) {
  const remoteJid = message.key.remoteJid;
  try {
    // Placeholder: Insert real update logic if needed.
    await sock.sendMessage(remoteJid, { text: "[SYSTEM] Update initiated. No delays, no pleasantries." });
    logMessage("Processed .update command.");
  } catch (error) {
    logMessage("Error in .update: " + formatError(error));
    await sock.sendMessage(remoteJid, { text: "[SYSTEM] Update failed. Reality remains unchanged." });
  }
}

/**
 * Processes the .restart command.
 * Restarts the bot with cold efficiency.
 * @param {object} sock - The WhatsApp socket instance.
 * @param {object} message - The incoming message object.
 */
export async function processRestart(sock, message) {
  const remoteJid = message.key.remoteJid;
  try {
    await sock.sendMessage(remoteJid, { text: "[SYSTEM] Restarting bot. Stand by for reactivation." });
    logMessage("Processed .restart command. Initiating restart.");
    process.exit(0); // In production, use a process manager (e.g., PM2) to restart the bot.
  } catch (error) {
    logMessage("Error in .restart: " + formatError(error));
    await sock.sendMessage(remoteJid, { text: "[SYSTEM] Restart failed. System error." });
  }
}

/**
 * Processes the .reboot command.
 * Reboots the entire system with uncompromising cold logic.
 * @param {object} sock - The WhatsApp socket instance.
 * @param {object} message - The incoming message object.
 */
export async function processReboot(sock, message) {
  const remoteJid = message.key.remoteJid;
  try {
    await sock.sendMessage(remoteJid, { text: "[SYSTEM] Rebooting system. No time for sentimentality." });
    logMessage("Processed .reboot command. System reboot initiated.");
    // Execute a system reboot command. (Ensure proper permissions.)
    execSync("sudo reboot");
  } catch (error) {
    logMessage("Error in .reboot: " + formatError(error));
    await sock.sendMessage(remoteJid, { text: "[SYSTEM] Reboot failed. System unresponsive." });
  }
}

/**
 * Processes the .shell command.
 * Executes a shell command provided by the owner with brutal efficiency.
 * @param {object} sock - The WhatsApp socket instance.
 * @param {object} message - The incoming message object.
 * @param {Array} args - Command arguments (the shell command to execute).
 */
export async function processShell(sock, message, args) {
  const remoteJid = message.key.remoteJid;
  if (args.length === 0) {
    await sock.sendMessage(remoteJid, { text: "Usage: .shell [command]. Specify a shell command." });
    return;
  }
  
  try {
    const cmd = args.join(" ");
    const output = execSync(cmd).toString();
    await sock.sendMessage(remoteJid, { text: `[SYSTEM] Shell output: ${output}` });
    logMessage(`Processed .shell command: ${cmd}`);
  } catch (error) {
    logMessage("Error in .shell: " + formatError(error));
    await sock.sendMessage(remoteJid, { text: "[SYSTEM] Shell command failed. Cold logic persists." });
  }
}