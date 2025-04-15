// core/encryption.js
import crypto from "crypto";

/**
 * Encrypts data using AES-256-GCM with keys derived from the provided PIN.
 * @param {string|Buffer} data - Data to encrypt.
 * @param {string} pin - User-provided PIN.
 * @returns {string} Encrypted data as a hex string.
 */
export function encrypt(data, pin) {
  try {
    const salt = crypto.randomBytes(32);
    const key = crypto.hkdfSync("sha256", Buffer.from(pin), salt, "", 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, salt, encrypted]).toString("hex");
  } catch (error) {
    console.error("Encryption error:", error);
    throw error;
  }
}

/**
 * Decrypts a hex string encrypted with the encrypt() function.
 * @param {string} encryptedHex - Encrypted data as a hex string.
 * @param {string} pin - User-provided PIN.
 * @returns {string} Decrypted data.
 */
export function decrypt(encryptedHex, pin) {
  try {
    const data = Buffer.from(encryptedHex, "hex");
    const iv = data.slice(0, 16);
    const tag = data.slice(16, 32);
    const salt = data.slice(32, 64);
    const encrypted = data.slice(64);
    const key = crypto.hkdfSync("sha256", Buffer.from(pin), salt, "", 32);
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("Decryption error:", error);
    throw error;
  }
}