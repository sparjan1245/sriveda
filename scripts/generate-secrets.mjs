/**
 * Generates NEXTAUTH_SECRET and ENCRYPTION_KEY for production deployment.
 * Run: node scripts/generate-secrets.mjs
 */
import { randomBytes } from "crypto";

const nextauthSecret  = randomBytes(32).toString("base64");
const encryptionKey   = randomBytes(32).toString("hex");   // 64 hex chars = 32 bytes (AES-256)

console.log("\n=== Generated Secrets — copy these into Vercel Environment Variables ===\n");
console.log(`NEXTAUTH_SECRET="${nextauthSecret}"`);
console.log(`ENCRYPTION_KEY="${encryptionKey}"`);
console.log("\n⚠️  Set ENCRYPTION_KEY before running prisma db push / db:seed.");
console.log("    Once data is encrypted with a key, that key cannot be changed without");
console.log("    re-encrypting all SiteSettings rows in the database.\n");
