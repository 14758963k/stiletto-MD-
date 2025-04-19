import { logMessage, formatError } from "../core/utils.js";
import { execSync } from "child_process";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import fs from "fs";
import path from "path";

/**
 * Processes the .sticker command.
 */
export async function processSticker(sock, message) {
  const remoteJid = message.key.remoteJid;
  try {
    execSync("ffmpeg -i input.jpg -vf scale=512:512 output.webp");
    await sock.sendMessage(remoteJid, { sticker: "output.webp" });
    logMessage("Image converted to sticker and sent.");
  } catch (error) {
    logMessage("Error in .sticker: " + formatError(error));
    await sock.sendMessage(remoteJid, { text: "Sticker conversion failed. Operation aborted." });
  }
}

/**
 * Processes the .toimg command.
 */
export async function processToImage(sock, message) {
  const remoteJid = message.key.remoteJid;
  try {
    execSync("ffmpeg -i input.webp output.jpg");
    await sock.sendMessage(remoteJid, { image: { url: "output.jpg" } });
    logMessage("Sticker converted to image and sent.");
  } catch (error) {
    logMessage("Error in .toimg: " + formatError(error));
    await sock.sendMessage(remoteJid, { text: "Conversion to image failed. Abort." });
  }
}

/**
 * Processes the .deep command.
 */
export async function processDeepFilter(sock, message) {
  const remoteJid = message.key.remoteJid;
  try {
    await sock.sendMessage(remoteJid, { text: "Deep filter applied. Nothing personal." });
    logMessage("Deep filter processed.");
  } catch (error) {
    logMessage("Error in .deep: " + formatError(error));
    await sock.sendMessage(remoteJid, { text: "Deep filtering failed. Cold and unyielding." });
  }
}

/**
 * Processes the .bass command.
 */
export async function processBass(sock, message) {
  const remoteJid = message.key.remoteJid;
  try {
    execSync(`ffmpeg -i input.mp3 -af "bass=g=10" output.mp3`);
    await sock.sendMessage(remoteJid, { audio: { url: "output.mp3" } });
    logMessage("Bass enhancement applied.");
  } catch (error) {
    logMessage("Error in .bass: " + formatError(error));
    await sock.sendMessage(remoteJid, { text: "Bass enhancement failed. Not our problem." });
  }
}

/**
 * Processes the .reverse command.
 */
export async function processReverse(sock, message) {
  const remoteJid = message.key.remoteJid;
  try {
    execSync(`ffmpeg -i input.mp3 -filter_complex "areverse" output.mp3`);
    await sock.sendMessage(remoteJid, { audio: { url: "output.mp3" } });
    logMessage("Audio reversed successfully.");
  } catch (error) {
    logMessage("Error in .reverse: " + formatError(error));
    await sock.sendMessage(remoteJid, { text: "Audio reversal failed. Operation aborted." });
  }
}

/**
 * Processes the .vv command.
 * Unlocks and resends view-once media.
 */
export async function processVV(sock, message) {
  const remoteJid = message.key.remoteJid;
  try {
    const msgContent = message.message?.viewOnceMessage?.message;
    if (!msgContent) throw new Error("No view-once media found in the message.");

    const buffer = await downloadMediaMessage(
      { message: msgContent },
      "buffer",
      {},
      { logger: undefined, reuploadRequest: sock.updateMediaMessage }
    );

    const isImage = !!msgContent.imageMessage;
    const fileName = isImage ? "unlocked.jpg" : "unlocked.mp4";
    fs.writeFileSync(fileName, buffer);

    const mediaObj = isImage
      ? { image: fs.readFileSync(fileName), caption: "🔓 View-once image unlocked." }
      : { video: fs.readFileSync(fileName), caption: "🔓 View-once video unlocked." };

    await sock.sendMessage(remoteJid, mediaObj);
    logMessage(".vv: View-once media unlocked and resent.");
  } catch (error) {
    logMessage("Error in .vv: " + formatError(error));
    await sock.sendMessage(remoteJid, {
      text: "⚠️ Couldn't unlock view-once media. Make sure to reply to it directly.",
    });
  }
}
