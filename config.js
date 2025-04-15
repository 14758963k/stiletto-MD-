// config.js
import fs from "fs";
import yaml from "js-yaml";

let config = {};
try {
  const fileContents = fs.readFileSync("config.yaml", "utf8");
  config = yaml.load(fileContents);
  console.log("Configuration loaded:", config);
} catch (e) {
  console.error("Error loading config.yaml:", e);
}

export { config };