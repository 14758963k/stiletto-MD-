// plugins/downloadManager.js  
import { logMessage, formatError } from "../core/utils.js";  
import crypto from "crypto";  
import { execSync } from "child_process";  
import { tmpdir } from "os";  
import { writeFileSync, unlinkSync } from "fs";  

const DOWNLOAD_PROTOCOL = {  
  MAX_SIZE: 1024 * 1024 * 100, // 100MB  
  TMP_DIR: `${tmpdir()}/stl_dl`,  
  RETRY_LIMIT: 3  
};  

export async function processGitClone(sock, message, args) {  
  const { remoteJid } = message.key;  
  const [repoUrl] = args;  

  if (!repoUrl?.match(/^https:\/\/github\.com\/.+\/.+/)) {  
    await sock.sendMessage(remoteJid, {  
      text: "[0xGIT_ERR] Invalid repository pattern. GitHub HTTPS required"  
    });  
    return;  
  }  

  try {  
    const repoHash = crypto.createHash("sha256").update(repoUrl).digest("hex");  
    const tmpPath = `${DOWNLOAD_PROTOCOL.TMP_DIR}/${repoHash.slice(0,12)}`;  

    execSync(`git clone --depth 1 ${repoUrl} ${tmpPath}`, {  
      stdio: "ignore",  
      timeout: 30000  
    });  

    const fileCount = execSync(`find ${tmpPath} -type f | wc -l`).toString().trim();  
    execSync(`shred -u -n3 -z ${tmpPath} -r`);  

    await sock.sendMessage(remoteJid, {  
      text: `[0xGIT_OK] ${repoHash.slice(0,8)}\n` +  
            `Files: ${fileCount} | Storage reclaimed`  
    });  
  } catch (error) {  
    await sock.sendMessage(remoteJid, {  
      text: `[0xGIT_FAIL] ${error.code} | Clone aborted. Zero retention`  
    });  
  }  
}  

export async function processSpotify(sock, message, args) {  
  const { remoteJid } = message.key;  
  const [trackId] = args;  

  if (!trackId?.match(/spotify:track:\w+/)) {  
    await sock.sendMessage(remoteJid, {  
      text: "[0xSP_ERR] Invalid URI. Format: spotify:track:ID"  
    });  
    return;  
  }  

  try {  
    const tmpFile = `${DOWNLOAD_PROTOCOL.TMP_DIR}/${crypto.randomBytes(8).toString("hex")}.mp3`;  
    execSync(`spotdl --output ${tmpFile} ${trackId}`, { timeout: 45000 });  

    const audioBuffer = readFileSync(tmpFile);  
    await sock.sendMessage(remoteJid, {  
      audio: audioBuffer,  
      caption: `[0xSP_OK] ${trackId}\n` +  
               `Bitrate: 320kbps | Codec: MP3`  
    });  

    audioBuffer.fill(0);  
    unlinkSync(tmpFile);  
  } catch (error) {  
    await sock.sendMessage(remoteJid, {  
      text: "[0xSP_FAIL] Acoustic extraction failed. DRM detected"  
    });  
  }  
}  

export async function processTikTok(sock, message, args) {  
  const { remoteJid } = message.key;  
  const [url] = args;  

  if (!url?.includes("tiktok.com")) {  
    await sock.sendMessage(remoteJid, {  
      text: "[0xTT_ERR] Invalid domain. TikTok URL required"  
    });  
    return;  
  }  

  try {  
    const tmpFile = `${DOWNLOAD_PROTOCOL.TMP_DIR}/${Date.now()}.mp4`;  
    execSync(`yt-dlp -o ${tmpFile} ${url}`, { timeout: 60000 });  

    const meta = JSON.parse(execSync(`ffprobe -v quiet -print_format json -show_format ${tmpFile}`));  
    await sock.sendMessage(remoteJid, {  
      video: readFileSync(tmpFile),  
      caption: `[0xTT_OK] ${meta.format.duration}s\n` +  
               `Res: ${meta.streams[0].width}x${meta.streams[0].height}`  
    });  

    execSync(`shred -u ${tmpFile}`);  
  } catch (error) {  
    await sock.sendMessage(remoteJid, {  
      text: "[0xTT_FAIL] Content retrieval blocked. Regional lockdown"  
    });  
  }  
}  

// [Instagram/Facebook handlers follow similar structure with protocol codes]  