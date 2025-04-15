// plugins/funCommands.js  
import { logMessage, formatError } from "../core/utils.js";  
import { Jokes } from "give-me-a-joke";  
import { fortune } from "fortune-cookie";  
import { getRandom } from "random-useragent";  
import { faces } from "cool-ascii-faces";  

// Protocol Codes  
const FUN_PROTOCOLS = {  
  JOKE_FAIL: "[0xJOKE_FAIL] Humor subsystem frozen",  
  TRUTH_FAIL: "[0xTRUTH_FAIL] Reality distortion detected"  
};  

// Cold Humor Database  
const ROBOTIC_JOKES = [  
  "Why did the robot go broke? It had no emotional investment.",  
  "How many machine learners does it take to change a bulb? None. That's a hardware problem.",  
  "Why do programmers prefer dark mode? Light attracts entropy."  
];  

const CYBER_INSULTS = [  
  "Your logic gates are stuck in superposition.",  
  "Your code has more leaks than a sieve.",  
  "Your UX design triggers my exception handler."  
];  

// Generic Handler  
async function coldResponse(sock, remoteJid, generatorFn, protocolCode) {  
  try {  
    const content = await generatorFn();  
    await sock.sendMessage(remoteJid, {  
      text: `[0x${protocolCode}]\n${content}\n` +  
            `Generated: ${new Date().toISOString().split('T')[1].slice(0,8)}`  
    });  
  } catch (error) {  
    await sock.sendMessage(remoteJid, {  
      text: FUN_PROTOCOLS[`${protocolCode}_FAIL`] || "[0xFUN_FAIL] Amusement protocol crashed"  
    });  
  }  
}  

// Command Handlers  
export async function processJokes(sock, message) {  
  const { remoteJid } = message.key;  
  await coldResponse(sock, remoteJid, async () => {  
    // 70% robotic joke, 30% random tech joke  
    return Math.random() > 0.3 ?  
      ROBOTIC_JOKES[Math.floor(Math.random() * ROBOTIC_JOKES.length)] :  
      await Jokes.getRandomDadJoke();  
  }, "JOKE");  
}  

export async function processTrivia(sock, message) {  
  const { remoteJid } = message.key;  
  await coldResponse(sock, remoteJid, () => {  
    const facts = [  
      `The average cloud server has no atmospheric pressure. (Source: ${getRandom()})`,  
      "Cold logic reduces computational entropy by 42.7%.",  
      `Current face: ${faces()}`  
    ];  
    return facts[Math.floor(Math.random() * facts.length)];  
  }, "TRIVIA");  
}  

export async function processQuote(sock, message) {  
  const { remoteJid } = message.key;  
  await coldResponse(sock, remoteJid, () => {  
    return `"${fortune()}" - SHA256: ${crypto.createHash("sha256")  
      .update(fortune()).digest("hex").slice(0,8)}`;  
  }, "QUOTE");  
}  

export async function processInsult(sock, message) {  
  const { remoteJid } = message.key;  
  await coldResponse(sock, remoteJid, () => {  
    return CYBER_INSULTS[Math.floor(Math.random() * CYBER_INSULTS.length)] +  
      `\nSeverity: ${Math.floor(Math.random() * 10) + 1}/10`;  
  }, "INSULT");  
}  

export async function processDare(sock, message) {  
  const { remoteJid } = message.key;  
  await coldResponse(sock, remoteJid, () => {  
    const dares = [  
      "Terminate all social media processes for 24h.",  
      "Execute a 5km run. Report biometric metrics.",  
      "Delete 3 non-essential Chrome tabs. Now."  
    ];  
    return `[0xDARE_PROTOCOL] ${dares[Math.random() * dares.length | 0]}`;  
  }, "DARE");  
}  

export async function processTruth(sock, message) {  
  const { remoteJid } = message.key;  
  await coldResponse(sock, remoteJid, () => {  
    return `System query: ${["Have you optimized today?",  
      "Does sentiment affect your code?",  
      "Is your firewall intact?"][Math.random() * 3 | 0]}`;  
  }, "TRUTH");  
}  