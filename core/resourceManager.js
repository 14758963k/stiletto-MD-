// core/resourceManager.js
import { execSync } from "child_process";

/**
 * Logs current memory usage and returns it in MB.
 * @returns {number} Memory usage in MB.
 */
export function logMemoryUsage() {
  const usageMB = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`[Resource] Memory usage: ${usageMB.toFixed(2)} MB`);
  return usageMB;
}

/**
 * Adjusts maximum concurrent tasks based on memory usage.
 * @returns {number} Adjusted number of concurrent tasks.
 */
export function adjustConcurrency() {
  const usageMB = logMemoryUsage();
  const maxConcurrentTasks = usageMB > 500 ? 1 : 4;
  console.log(`[Resource] Max concurrent tasks set to: ${maxConcurrentTasks}`);
  return maxConcurrentTasks;
}

/**
 * Performs auto-cleanup if disk usage exceeds the threshold.
 */
export function autoCleanup() {
  try {
    const output = execSync("df -h /").toString();
    const match = output.match(/(\d+)%/);
    if (match && parseInt(match[1]) > 80) {
      console.log("[Resource] High disk usage detected. Initiating cleanup...");
      execSync("find ./cache -type f -mtime +7 -delete");
    }
  } catch (err) {
    console.error("[Resource] Cleanup error:", err);
  }
}
