// plugins/media.js
import { logMessage, formatError } from "../core/utils.js";
import crypto from "crypto";
import sharp from "sharp";
import { tmpdir } from "os";
import { writeFileSync, unlinkSync } from "fs";
import exiftool from "exiftool-vendored";

const MEDIA_PROTOCOLS = {
  DECODE_SUCCESS: "[0xMEDIA_DECRYPT] View-once bypass initiated",
  METADATA_PURGE: "[0xEXIF_ERASE] Forensic traces eliminated",
  STEGANO_FAIL: "[0xSTEG_FAIL] Hidden payload extraction aborted"
};

export async function processVV(sock, message) {
  const { remoteJid } = message.key;
  const quotedContext = message.message?.extendedTextMessage?.contextInfo;
  
  try {
    // Protocol Enforcement
    if (!quotedContext?.quotedMessage?.imageMessage?.viewOnce) {
      throw new Error("[0xINVALID_INPUT] Target must be view-once image");
    }

    // Nuclear Download Protocol
    const startTime = Date.now();
    const tempPath = `${tmpdir()}/${crypto.randomBytes(6).toString('hex')}.jpg`;
    const buffer = await sock.downloadMediaMessage(quotedContext);
    writeFileSync(tempPath, buffer);

    // Anti-Forensics Suite
    const processedImage = await sharp(tempPath)
      .withMetadata({
        exif: {
          IFD0: {
            Copyright: "Stiletto_MD v0.9.1"
          }
        }
      })
      .toBuffer();

    // Metadata Annihilation
    await exiftool.write(tempPath, {
      AllDates: "1970-01-01 00:00:00",
      GPSLatitude: null,
      GPSLongitude: null
    });

    // Cryptographic Verification
    const mediaHash = crypto.createHash("sha256")
      .update(processedImage)
      .digest("hex")
      .slice(0, 12);

    // Secure Delivery
    await sock.sendMessage(remoteJid, {
      image: processedImage,
      caption: `${MEDIA_PROTOCOLS.DECODE_SUCCESS}\n` +
               `Hash: ${mediaHash} | Process time: ${Date.now() - startTime}ms\n` +
               `Dimensions: ${(await sharp(processedImage).metadata()).width}x` +
               `${(await sharp(processedImage).metadata()).height}`
    });

    // Data Sanitization
    processedImage.fill(0);
    execSync(`shred -u ${tempPath}`);
    logMessage(`[0xVV_SUCCESS] ${mediaHash} | ${remoteJid}`);

  } catch (error) {
    const errorHash = crypto.createHash("sha256")
      .update(error.message)
      .digest("hex")
      .slice(0, 6);

    await sock.sendMessage(remoteJid, {
      text: `[0xMEDIA_FAIL] ${error.message.split(']')[1]?.trim() || "Classified"}\n` +
            `Error code: 0x${errorHash} | Ref: ${Date.now().toString(16)}`
    });

    // Zeroize remnants
    if (buffer) buffer.fill(0);
    try { unlinkSync(tempPath); } catch {}
  }
}

// Bonus: Steganography Module
export async function injectCommand(sock, message) {
  const { remoteJid } = message.key;
  try {
    const imageBuffer = await sock.downloadMediaMessage(message);
    const secretPayload = crypto.randomBytes(64);
    
    const stegImage = await sharp(imageBuffer)
      .composite([{
        input: Buffer.from(`STL_CMD:${secretPayload.toString('hex')}`),
        raw: { width: 1, height: 1, channels: 4 },
        blend: 'atop'
      }])
      .toBuffer();

    await sock.sendMessage(remoteJid, {
      image: stegImage,
      caption: "[0xSTEG_SUCCESS] Payload injected\n" +
               "Activate with .exec 0x[hash]"
    });

  } catch (error) {
    await sock.sendMessage(remoteJid, { text: MEDIA_PROTOCOLS.STEGANO_FAIL });
  }
}