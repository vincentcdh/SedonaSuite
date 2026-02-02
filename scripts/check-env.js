#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const ENV_EXAMPLE = path.join(ROOT_DIR, ".env.example");
const ENV_LOCAL = path.join(ROOT_DIR, ".env.local");

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const keys = new Map();

  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith("#")) return;

    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=/);
    if (match) {
      keys.set(match[1], trimmed);
    }
  });

  return keys;
}

function main() {
  console.log("\n🔍 Checking environment variables...\n");

  // Check if .env.example exists
  if (!fs.existsSync(ENV_EXAMPLE)) {
    console.log("⚠️  No .env.example found, skipping check.\n");
    return;
  }

  const exampleKeys = parseEnvFile(ENV_EXAMPLE);
  const localKeys = parseEnvFile(ENV_LOCAL);

  // If .env.local doesn't exist, create it from .env.example
  if (!localKeys) {
    console.log("📝 .env.local not found. Creating from .env.example...\n");
    fs.copyFileSync(ENV_EXAMPLE, ENV_LOCAL);
    console.log("✅ Created .env.local - Please update it with your values!\n");
    console.log("   File location: " + ENV_LOCAL + "\n");
    return;
  }

  // Find missing keys
  const missingKeys = [];
  for (const [key, line] of exampleKeys) {
    if (!localKeys.has(key)) {
      missingKeys.push({ key, line });
    }
  }

  if (missingKeys.length === 0) {
    console.log("✅ All environment variables are present in .env.local\n");
    return;
  }

  // Report missing keys
  console.log(
    `⚠️  Found ${missingKeys.length} missing variable(s) in .env.local:\n`
  );
  missingKeys.forEach(({ key }) => {
    console.log(`   - ${key}`);
  });

  // Append missing keys to .env.local
  console.log("\n📝 Adding missing variables to .env.local...\n");

  const additions = [
    "",
    "# ===========================================",
    "# Added automatically from .env.example",
    "# ===========================================",
    ...missingKeys.map(({ line }) => line),
  ];

  fs.appendFileSync(ENV_LOCAL, additions.join("\n") + "\n");

  console.log("✅ Added missing variables. Please update their values in:\n");
  console.log("   " + ENV_LOCAL + "\n");
}

main();
