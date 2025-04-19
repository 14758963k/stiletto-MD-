// platforms/whatsapp.js

// 1) Import the entire Baileys package as a default CJS export
import pkg from "@whiskeysockets/baileys";
const { default: makeWASocket, useMultiFileAuthState } = pkg;

import P from "pino";
import { config } from "../config.js";
import { logMessage, formatError } from "../core/utils.js";

/**
 * Connects to WhatsApp using Baileys.
 * Displays a QR code (or pairing code if available) and sets up stealth settings.
 * @returns {object} WhatsApp socket instance.
 */
export async function connectWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,         // Displays QR code for first-time pairing
    markOnlineOnConnect: false,      // Remain offline for stealth
    sendReceipts: false,             // Disable automatic read receipts
    logger: P({ level: config.logLevel || "silent" }),
    // pairingMode: config.pairing,  // Uncomment if code pairing is supported
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("pairing.update", (pairingInfo) => {
    if (pairingInfo.code) {
      logMessage(`Pairing Code: ${pairingInfo.code}`);
    } else {
      logMessage("Pairing update received, using default QR mode.");
    }
  });

  sock.ev.on("presence.update", (update) => {
    logMessage(`Presence update: ${JSON.stringify(update)}`);
  });

  sock.ev.on("group-participants.update", async (update) => {
    logMessage(`Group participant update: ${JSON.stringify(update)}`);
  });

  sock.ev.on("connection.update", (update) => {
    logMessage(`Advanced connection update: ${JSON.stringify(update)}`);
  });

  sock.ev.on("error", (err) => {
    logMessage(`Socket error: ${formatError(err)}`);
  });

  return sock;
}
