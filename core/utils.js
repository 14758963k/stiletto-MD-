// core/utils.js
import { config } from "../config.js";

/**
 * Logs a message with a timestamp.
 * Uses console.debug if debug mode is enabled, else console.log.
 * @param {string} message - Message to log.
 */
export function logMessage(message) {
  const timestamp = new Date().toISOString();
  if (config.debug) {
    console.debug(`[DEBUG] [${timestamp}] ${message}`);
  } else {
    console.log(`[${timestamp}] ${message}`);
  }
}

/**
 * Formats an error object into a consistent string.
 * @param {Error} error - Error object.
 * @returns {string} Formatted error message.
 */
export function formatError(error) {
  return `Error: ${error.message}\nStack: ${error.stack}`;
}