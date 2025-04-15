// plugins/voiceCommands.js
import { logMessage, formatError } from "../core/utils.js";
import { execSync } from "child_process";
import fs from "fs";

/**
 * Processes a voice command by transcribing an audio message.
 * Expects the incoming message to be an audio message.
 * Uses a local transcription tool (whisper.cpp) to generate the transcript.
 * The response is cold, precise, and without any frills.
 *
 * @param {object} sock - The WhatsApp socket instance.
 * @param {object} message - The incoming message object.
 */
export async function processVoiceCommand(sock, message) {
  const remoteJid = message.key.remoteJid;

  // Validate that the message is an audio message
  if (!message.message.audioMessage) {
    await sock.sendMessage(remoteJid, { text: "Not an audio message. Command aborted." });
    return;
  }

  try {
    // Download the audio message (assumes it returns a Buffer)
    const buffer = await sock.downloadMediaMessage(message);
    // Save the audio buffer to a temporary file (input.ogg)
    fs.writeFileSync("input.ogg", buffer);

    // Execute the transcription command using whisper.cpp
    // Adjust the command parameters as necessary for your setup
    execSync(`./whisper.cpp/main -f input.ogg -m ./models/ggml-base.bin -o transcript.txt`);

    // Read the resulting transcript
    const transcript = fs.readFileSync("transcript.txt", "utf8").trim();

    // Send the transcript with a cold, precise response
    await sock.sendMessage(remoteJid, { text: `[Voice Transcription] ${transcript}` });
    logMessage("Voice command processed: Transcript sent successfully.");

    // Clean up temporary files
    fs.unlinkSync("input.ogg");
    fs.unlinkSync("transcript.txt");
  } catch (error) {
    logMessage(`Voice command failed: ${formatError(error)}`);
    await sock.sendMessage(remoteJid, { text: "[Voice Transcription] Operation failed. Cold logic persists." });
  }
}