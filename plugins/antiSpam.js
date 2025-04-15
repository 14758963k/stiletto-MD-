// plugins/antiSpam.js  
import { logMessage, formatError } from "../core/utils.js";  
import crypto from "crypto";  

// Cold Storage for Violations (TTL: 24h)  
const VIOLATION_RECORDS = new Map();  
const VIOLATION_TTL = 86_400_000; // 24h  

// Spam Signatures (Regex + Hashes)  
const SPAM_PATTERNS = {  
  URL: /\b(?:https?:\/\/|www\.|bit\.ly|t\.co)\S+\b/gi,  
  PHISHING: /(?:banking|password|login|verify)\s+portal/gi,  
  CRYPTO: /\b(?:bitcoin|eth|nft|airdrop)\s+(free|claim)\b/gi  
};  

// SHA256 Hashes of Common Spam Phrases  
const SPAM_HASHES = new Set([  
  "a3f4de7d1e2...", // "Free Bitcoin"  
  "b8c2d5f1a9e..."  // "Click here for discount"  
]);  

/**  
 * Nuclear Spam Detection with 3-Strike Protocol  
 */  
export async function antiSpamCheck(sock, message) {  
  const { remoteJid, participant, id: msgId } = message.key;  
  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text) ?? "";  

  // Phase 1: Pattern Detection  
  const urlMatch = SPAM_PATTERNS.URL.test(text);  
  const phishingMatch = SPAM_PATTERNS.PHISHING.test(text);  
  const cryptoMatch = SPAM_PATTERNS.CRYPTO.test(text);  
  const hashMatch = SPAM_HASHES.has(crypto.createHash("sha256").update(text).digest("hex"));  

  if (!urlMatch && !phishingMatch && !cryptoMatch && !hashMatch) return;  

  // Phase 2: Violation Escalation  
  const offender = participant || remoteJid;  
  const violations = VIOLATION_RECORDS.get(offender) || { count: 0, timer: null };  

  // Reset TTL on new violation  
  if (violations.timer) clearTimeout(violations.timer);  
  violations.timer = setTimeout(() => VIOLATION_RECORDS.delete(offender), VIOLATION_TTL);  
  violations.count++;  
  VIOLATION_RECORDS.set(offender, violations);  

  // Phase 3: Surgical Strike  
  try {  
    // 1. Delete Message  
    await sock.sendMessage(remoteJid, { delete: { id: msgId } });  

    // 2. Apply Sanctions  
    let sanction;  
    switch(violations.count) {  
      case 1:  
        sanction = "[0xSPAM_WARN] Violation 1/3: Message incinerated";  
        break;  
      case 2:  
        sanction = "[0xSPAM_MUTE] 24h comms ban enacted";  
        await sock.groupParticipantsUpdate(remoteJid, [offender], "restrict");  
        break;  
      case 3:  
        sanction = "[0xSPAM_TERM] Entity purged from network";  
        await sock.groupParticipantsUpdate(remoteJid, [offender], "remove");  
        break;  
    }  

    // 3. Broadcast Consequences  
    await sock.sendMessage(remoteJid, {  
      text: `${sanction}\n` +  
            `Hash: ${crypto.createHash("sha256").update(text).digest("hex").slice(0,12)}...\n` +  
            `Next: ${violations.count < 3 ? 3 - violations.count + " strikes remain" : "Terminal"}`  
    });  

    logMessage(`[0xSPAM_ERAD] ${offender} | Strike ${violations.count} | ${text.slice(0,15)}...`);  
  } catch (error) {  
    logMessage(`[0xSPAM_FAIL] ${formatError(error).slice(0,50)}...`);  
  }  
}  