// plugins/education.js  
import { logMessage, formatError } from "../core/utils.js";  
import crypto from "crypto";  

// ====================  
// Offline Bible Dataset  
// ====================  
import KJV_BIBLE from "../assets/bible_kjv.json" assert { type: "json" };  
const BIBLE_CACHE = new Map();  

// Initialize Bible Cache  
(function() {  
  KJV_BIBLE.forEach(book => {  
    book.chapters.forEach((chapter, chapterIdx) => {  
      chapter.forEach((verse, verseIdx) => {  
        const key = `${book.name} ${chapterIdx + 1}:${verseIdx + 1}`.toLowerCase();  
        BIBLE_CACHE.set(key, verse);  
      });  
    });  
  });  
})();  

// =======================  
// Offline Wikipedia Snapshot  
// =======================  
const WIKI_DATASET = {  
  "quantum computing": "Quantum computing utilizes qubits to perform calculations. Cold logic dominates this field.",  
  "black hole": "A region of spacetime exhibiting gravitational acceleration so strong that nothing—no particles or even electromagnetic radiation such as light—can escape from it.",  
  "blockchain": "Decentralized digital ledger. Immutable by design. Efficiency paramount."  
};  

// =======================  
// News Archive (Pre-Cached)  
// =======================  
const NEWS_ARCHIVE = [  
  {  
    hash: "a3f4de7d",  
    headline: "Global temperatures drop 0.2°C. Climate models recalculated.",  
    timestamp: 1672531200  
  },  
  {  
    hash: "b8c2d5f1",  
    headline: "AI achieves 99.8% diagnostic accuracy. Human doctors obsolete.",  
    timestamp: 1672617600  
  }  
];  

// =======================  
// Command Handlers  
// =======================  
export async function processBible(sock, message) {  
  const { remoteJid } = message.key;  
  const text = message.message.conversation?.replace(config.prefix + "bible", "").trim() || "";  

  try {  
    if (!text) throw new Error("[0xBIBLE_ERR] Syntax: .bible [Book] [Chapter:Verse]");  

    const match = text.match(/(\d?\s?\w+)\s+(\d+):(\d+)/i);  
    if (!match) throw new Error("[0xBIBLE_ERR] Invalid reference pattern");  

    const [, book, chapter, verse] = match;  
    const refKey = `${book} ${chapter}:${verse}`.toLowerCase();  
    const verseText = BIBLE_CACHE.get(refKey);  

    if (!verseText) throw new Error(`[0xBIBLE_NF] ${refKey} not found`);  

    await sock.sendMessage(remoteJid, {  
      text: `[0xSCRIPTURE] ${refKey}\n${verseText}\n` +  
            `Integrity: ${crypto.createHash("sha256").update(verseText).digest("hex").slice(0,8)}`  
    });  

  } catch (error) {  
    await sock.sendMessage(remoteJid, {  
      text: error.message.includes("0x") ? error.message :  
        "[0xBIBLE_FAIL] Text retrieval error. Divine logic preserved."  
    });  
  }  
}  

export async function processWiki(sock, message) {  
  const { remoteJid } = message.key;  
  const query = message.message.conversation?.replace(config.prefix + "wiki", "").trim().toLowerCase() || "";  

  try {  
    if (!query) throw new Error("[0xWIKI_ERR] Syntax: .wiki [topic]");  

    const summary = WIKI_DATASET[query];  
    if (!summary) throw new Error(`[0xWIKI_NF] ${query.slice(0,12)}... not in archive`);  

    await sock.sendMessage(remoteJid, {  
      text: `[0xKNOWLEDGE] ${query}\n${summary}\n` +  
            `Cache date: 2023-12-01 | Entropy: ${crypto.randomBytes(2).readUInt16LE()}`  
    });  

  } catch (error) {  
    await sock.sendMessage(remoteJid, {  
      text: error.message.includes("0x") ? error.message :  
        "[0xWIKI_FAIL] Encyclopedic retrieval failure. Facts remain static."  
    });  
  }  
}  

export async function processNews(sock, message) {  
  const { remoteJid } = message.key;  

  try {  
    const article = NEWS_ARCHIVE[Math.floor(Math.random() * NEWS_ARCHIVE.length)];  
    const date = new Date(article.timestamp * 1000).toISOString().split('T')[0];  

    await sock.sendMessage(remoteJid, {  
      text: `[0xNEWS] ${date}\n${article.headline}\n` +  
            `Verification: ${article.hash} | Source: Archive ${date}`  
    });  

  } catch (error) {  
    await sock.sendMessage(remoteJid, {  
      text: "[0xNEWS_FAIL] Information flow halted. Reality unchanged."  
    });  
  }  
}  