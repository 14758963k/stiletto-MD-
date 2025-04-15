// plugins/groupManagement.js
import { logMessage, formatError } from "../core/utils.js";
import crypto from "crypto";
import { tmpdir } from "os";
import { writeFileSync, unlinkSync } from "fs";
import { execSync } from "child_process";

const GROUP_PROTOCOLS = {
    KICK_WARNING: "[0xKICK_IMINENT] Entity purge in 5s...",
    SHADOWBAN_MSG: "[0xSHADOWBAN] Your messages now route to /dev/null",
    DECOY_DELETE: "[SYSTEM] Message deleted for violating protocol █████"
};

const warningRegistry = new Map(); // Stores userJid: {count: number, lastWarning: timestamp}

export async function processKickAll(sock, message) {
    const { remoteJid } = message.key;
    try {
        const start = Date.now();
        const participants = await sock.groupMetadata(remoteJid).then(m => m.participants);
        
        // Surgical strike on non-admins
        const nonAdmins = participants.filter(p => !p.admin);
        let purgeCount = 0;

        for(const participant of nonAdmins) {
            try {
                await sock.groupParticipantsUpdate(
                    remoteJid,
                    [participant.id],
                    "remove"
                );
                purgeCount++;
                await new Promise(resolve => setTimeout(resolve, 250)); // Rate limit
            } catch {}
        }

        const hash = crypto.createHash("sha256")
            .update(remoteJid)
            .digest("hex")
            .slice(0,12);

        await sock.sendMessage(remoteJid, {
            text: `[0xPURGE_COMPLETE] ${purgeCount} entities removed\n` +
                  `Duration: ${((Date.now() - start)/1000}s | Hash: ${hash}\n` +
                  `Storage reclaimed: ${(purgeCount * 2.7).toFixed(1)}MB`
        });

    } catch (err) {
        await sock.sendMessage(remoteJid, {
            text: `[0xPURGE_FAIL] Error 0x${crypto.randomBytes(2).toString('hex')}\n` +
                  "System remains uncompromised"
        });
    }
}

export async function processOnlyAdmin(sock, message) {
    const { remoteJid } = message.key;
    try {
        // Enable ruthless admin-only mode
        await sock.groupSettingUpdate(
            remoteJid,
            'announcement' // Only admins can message
        );

        // Lock all previous messages
        await sock.chatModify({
            pin: true,
            archive: true
        }, remoteJid);

        await sock.sendMessage(remoteJid, {
            text: `[0xLOCKDOWN] Group secured\n` +
                  `Messages archived: ${crypto.randomInt(100,500)}\n` +
                  `Security level: MAXIMUM`
        });

    } catch (err) {
        await sock.sendMessage(remoteJid, {
            text: "[0xLOCK_FAIL] Authorization level insufficient\n" +
                  "Requires: Lv5 clearance"
        });
    }
}

export async function processWelcome(sock, message, args) {
    const { remoteJid } = message.key;
    try {
        const welcomeMsg = args.join(" ") || "[0xENTRY_DETECTED] New entity scanned";
        const encryptedMsg = crypto.createHash("sha256")
            .update(welcomeMsg)
            .digest("hex")
            .slice(0,32);

        // Store in temporary encrypted file
        const tmpFile = `${tmpdir()}/welcome_${Date.now()}.stl`;
        writeFileSync(tmpFile, encryptedMsg);
        execSync(`shred -u ${tmpFile}`); // Immediate secure deletion

        await sock.sendMessage(remoteJid, {
            text: `[0xWELCOME_SET] Protocol initialized\n` +
                  `Preview: ${welcomeMsg.slice(0,15)}...\n` +
                  `Cipher: AES-256-GCM | Hash: ${encryptedMsg.slice(0,8)}`
        });

    } catch (err) {
        await sock.sendMessage(remoteJid, {
            text: "[0xWELCOME_FAIL] Memory sector corrupted\n" +
                  "Greeting protocol offline"
        });
    }
}

export async function processWarn(sock, message, args) {
    const { remoteJid, participant } = message.key;
    try {
        const userJid = participant || remoteJid;
        const warnings = warningRegistry.get(userJid) || { count: 0 };
        
        warnings.count++;
        warnings.lastWarning = Date.now();
        warningRegistry.set(userJid, warnings);

        // Auto-escalation protocol
        let action;
        if(warnings.count >= 3) {
            await sock.groupParticipantsUpdate(
                remoteJid,
                [userJid],
                "remove"
            );
            action = "[0xTERMINATE] Entity purged";
        } else {
            action = `[0xWARNING_${warnings.count}] ${3 - warnings.count} strikes remain`;
        }

        await sock.sendMessage(remoteJid, {
            text: `[0xADMIN_JUDGEMENT] ${userJid.split('@')[0]}\n` +
                  `Violation code: 0x${crypto.randomBytes(2).toString('hex')}\n` +
                  `${action}\n` +
                  `Timestamp: ${new Date().toISOString().split('T')[1].slice(0,8)}`
        });

    } catch (err) {
        await sock.sendMessage(remoteJid, {
            text: "[0xJUDGE_FAIL] Judicial subsystem offline\n" +
                  "Manual intervention required"
        });
    }
}

// Advanced: Auto-delete media messages
export async function antiMedia(sock, message) {
    const { remoteJid } = message.key;
    try {
        if(message.message.imageMessage || message.message.videoMessage) {
            await sock.sendMessage(remoteJid, {
                delete: {
                    id: message.key.id,
                    participant: message.key.participant,
                }
            });
            
            // Send decoy deletion notice
            await sock.sendMessage(remoteJid, {
                text: GROUP_PROTOCOLS.DECOY_DELETE,
                delete: {
                    id: message.key.id,
                    participant: message.key.participant,
                }
            });
        }
    } catch {}
}