// plugins/profile.js
import { logMessage, formatError } from "../core/utils.js";

/**
 * Processes the .pp command.
 * When replying to a user's message with .pp, this function retrieves
 * the profile picture of the replied user and sends it back.
 * @param {object} sock - The WhatsApp socket instance.
 * @param {object} message - The incoming message object (must be a reply).
 */
export async function processProfilePic(sock, message) {
  const remoteJid = message.key.remoteJid;
  // Ensure the command is sent as a reply
  const quotedContext = message.message?.extendedTextMessage?.contextInfo;
  if (!quotedContext || !quotedContext.quotedMessage) {
    await sock.sendMessage(remoteJid, { text: "Usage: Reply to a user's message with .pp to get their profile picture." });
    return;
  }
  
  const targetJid = quotedContext.participant;
  try {
    // Fetch profile picture URL using Baileys method
    const profilePicUrl = await sock.profilePictureUrl(targetJid, "image");
    if (profilePicUrl) {
      await sock.sendMessage(remoteJid, { image: { url: profilePicUrl } });
      logMessage("Profile picture sent successfully.");
    } else {
      await sock.sendMessage(remoteJid, { text: "No profile picture found for this contact." });
    }
  } catch (error) {
    logMessage(`Error in .pp command: ${formatError(error)}`);
    await sock.sendMessage(remoteJid, { text: "Failed to retrieve profile picture." });
  }
}

/**
 * Processes the .autobio command.
 * Updates the owner's WhatsApp bio automatically with current info.
 * @param {object} sock - The WhatsApp socket instance.
 * @param {object} message - The incoming message object.
 */
export async function processAutoBio(sock, message) {
  const remoteJid = message.key.remoteJid;
  try {
    // For demonstration, update the bio with a fixed message.
    // In production, you might fetch dynamic info such as uptime or current number.
    const newBio = "Contact: 94743381623 | Stiletto MD is online.";
    await sock.updateProfileStatus(newBio);
    await sock.sendMessage(remoteJid, { text: `Owner bio updated: "${newBio}"` });
    logMessage("Owner bio updated successfully.");
  } catch (error) {
    logMessage(`Error in .autobio command: ${formatError(error)}`);
    await sock.sendMessage(remoteJid, { text: "Failed to update bio." });
  }
}