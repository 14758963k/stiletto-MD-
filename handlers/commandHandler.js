// handlers/commandHandler.js
import { encrypt, decrypt } from "../core/encryption.js";
import { adjustConcurrency, autoCleanup } from "../core/resourceManager.js";
import { logMessage } from "../core/utils.js";
import { config } from "../config.js"; // Config loaded from config.yaml
import { processVV } from "../plugins/mediaProcessing.js"; // For .vv command

// Define command aliases
const commandAliases = {
  "pp": "profilepic",
  "bio": "autobio",
  // Add more aliases as needed
};

/**
 * Routes and processes commands from incoming messages.
 * Every command returns a cold, blunt reply.
 * @param {object} sock - WhatsApp socket instance.
 * @param {object} message - Incoming message object.
 */
export async function handleCommand(sock, message) {
  const { remoteJid } = message.key;
  const text = message.message.conversation || "";

  // Remove prefix and resolve aliases
  let [command, ...args] = text.slice(config.prefix.length).trim().split(" ");
  command = command.toLowerCase();
  if (commandAliases[command]) {
    command = commandAliases[command];
  }

  logMessage(`Received command: ${command} with args: ${args.join(" ")}`);

  // Cold, direct command responses:
  switch (command) {
    // General Commands
    case "ping":
      await sock.sendMessage(remoteJid, { text: "Pong. No frills." });
      break;
    case "alive":
      await sock.sendMessage(remoteJid, { text: "Status: Operational. No exceptions." });
      break;
    case "menu":
      await sock.sendMessage(remoteJid, { text: "Full menu loaded. Choose wisely." });
      break;

    // Owner Commands
    case "ownermenu":
      await sock.sendMessage(remoteJid, { text: "Owner Menu: .shutdown, .broadcast, .autobio, .exec, .eval, etc." });
      break;
    case "shutdown":
      if (remoteJid.includes(config.owner)) {
        await sock.sendMessage(remoteJid, { text: "Shutdown initiated. Exiting." });
        process.exit(0);
      } else {
        await sock.sendMessage(remoteJid, { text: "Permission denied. You are not the owner." });
      }
      break;
    case "broadcast":
      await sock.sendMessage(remoteJid, { text: "Broadcasting message. This is not a charity service." });
      break;
    case "autobio":
      await sock.sendMessage(remoteJid, { text: "Owner bio updated. No emotions." });
      break;

    // Group Management Commands
    case "kickall":
      await sock.sendMessage(remoteJid, { text: "All non-admin members removed. Group now secure." });
      break;
    case "onlyadmin":
      await sock.sendMessage(remoteJid, { text: "Group set to admin-only. No exceptions." });
      break;
    case "welcome":
      await sock.sendMessage(remoteJid, { text: "Welcome message set. Cold and calculated." });
      break;
    case "goodbye":
      await sock.sendMessage(remoteJid, { text: "Goodbye message set. No sentimental attachments." });
      break;
    case "antilink":
      await sock.sendMessage(remoteJid, { text: "Antilink activated. Unwanted links will vanish." });
      break;
    case "antibot":
      await sock.sendMessage(remoteJid, { text: "Antibot engaged. Automated spammers will be eliminated." });
      break;
    case "gname":
      await sock.sendMessage(remoteJid, { text: "Group name updated. Precision achieved." });
      break;
    case "gdesc":
      await sock.sendMessage(remoteJid, { text: "Group description updated. No fluff." });
      break;
    case "revoke":
      await sock.sendMessage(remoteJid, { text: "Invite link revoked. Security enforced." });
      break;
    case "hidetag":
      await sock.sendMessage(remoteJid, { text: "Hidetag message sent. Invisible as intended." });
      break;
    case "automute":
      await sock.sendMessage(remoteJid, { text: "Group muted. Silence is golden." });
      break;
    case "autounmute":
      await sock.sendMessage(remoteJid, { text: "Group unmuted. Order restored." });
      break;
    case "warn":
      await sock.sendMessage(remoteJid, { text: "[SYSTEM] WARNING: Your behavior is unacceptable. Cease all activity immediately or prepare to be removed." });
      break;

    // Media Commands
    case "sticker":
      await sock.sendMessage(remoteJid, { text: "Converting image to sticker. Stand by." });
      break;
    case "vv":
      await processVV(sock, message);
      break;
    case "profilepic":
      await sock.sendMessage(remoteJid, { text: "Fetching profile picture. One moment." });
      // Implement profile picture retrieval logic.
      break;
    case "toimg":
      await sock.sendMessage(remoteJid, { text: "Converting sticker to image. Processing." });
      break;

    // Conversion Commands
    case "emoji":
      await sock.sendMessage(remoteJid, { text: "Converting text to emoji art. Minimalism in action." });
      break;
    case "scrop":
      await sock.sendMessage(remoteJid, { text: "Cropping image. Precision editing." });
      break;
    case "trt":
      await sock.sendMessage(remoteJid, { text: "Translating text. Language is secondary." });
      break;
    case "tts":
      await sock.sendMessage(remoteJid, { text: "Converting text to speech. Robotic clarity." });
      break;

    // Download Commands
    case "gitclone":
      await sock.sendMessage(remoteJid, { text: "Cloning repository. No time for pleasantries." });
      break;
    case "spotify":
      await sock.sendMessage(remoteJid, { text: "Downloading from Spotify. Efficiency is key." });
      break;
    case "tiktok":
      await sock.sendMessage(remoteJid, { text: "Downloading TikTok video. Data extracted." });
      break;
    case "insta":
      await sock.sendMessage(remoteJid, { text: "Downloading Instagram content. Task complete." });
      break;
    case "fb":
      await sock.sendMessage(remoteJid, { text: "Downloading Facebook media. Proceeding." });
      break;

    // AI Commands
    case "gpt":
      await sock.sendMessage(remoteJid, { text: "Generating AI response. No fluff." });
      break;
    case "dalle":
      await sock.sendMessage(remoteJid, { text: "Creating AI-generated image. Art meets precision." });
      break;
    case "gemini":
      await sock.sendMessage(remoteJid, { text: "Invoking Gemini mode. Dual precision active." });
      break;

    // Fun Commands
    case "jokes":
      await sock.sendMessage(remoteJid, { text: "Here's a joke: [Insert cold, deadpan joke]." });
      break;
    case "trivia":
      await sock.sendMessage(remoteJid, { text: "Trivia: [Insert trivia question]." });
      break;
    case "quote":
      await sock.sendMessage(remoteJid, { text: "Quote: [Insert unembellished, factual quote]." });
      break;
    case "insult":
      await sock.sendMessage(remoteJid, { text: "[SYSTEM] Insult: Your argument is as coherent as a broken circuit." });
      break;
    case "dare":
      await sock.sendMessage(remoteJid, { text: "Dare: Prove your worth. No excuses." });
      break;
    case "truth":
      await sock.sendMessage(remoteJid, { text: "Truth: Face reality. No sugarcoating." });
      break;

    // Tools Commands
    case "calc":
      await sock.sendMessage(remoteJid, { text: "Calculation complete. The result is precise." });
      break;
    case "ssweb":
      await sock.sendMessage(remoteJid, { text: "Capturing screenshot. Image stored." });
      break;
    case "upload":
      await sock.sendMessage(remoteJid, { text: "Uploading file. Data transfer initiated." });
      break;
    case "fancy":
      await sock.sendMessage(remoteJid, { text: "Applying fancy text effects. Minimalistic and cold." });
      break;

    // Educational Commands
    case "bible":
      await sock.sendMessage(remoteJid, { text: "Retrieving Bible verses. Scripture delivered without sentiment." });
      break;
    case "wiki":
      await sock.sendMessage(remoteJid, { text: "Fetching Wikipedia summary. Facts, nothing more." });
      break;
    case "news":
      await sock.sendMessage(remoteJid, { text: "Latest news: [Insert headline]. Unbiased and factual." });
      break;

    // User Commands
    case "tempmail":
      await sock.sendMessage(remoteJid, { text: "Generating temporary email. Efficiency ensured." });
      break;
    case "del":
      await sock.sendMessage(remoteJid, { text: "Deleting message. Operation complete." });
      break;

    // Mods Commands
    case "restart":
      await sock.sendMessage(remoteJid, { text: "Restarting bot. Stand by." });
      process.exit(0);
      break;
    case "reboot":
      await sock.sendMessage(remoteJid, { text: "Rebooting system. No time for delays." });
      break;

    // Shortening Commands
    case "tinyurl":
      await sock.sendMessage(remoteJid, { text: "Shortening URL. Result: [Generated short URL]." });
      break;

    // Additional commands can be added here...
    default:
      await sock.sendMessage(remoteJid, { text: "Unknown command." });
  }

  // Adjust resources and perform auto-cleanup after processing.
  adjustConcurrency();
  autoCleanup();
}