import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be a 64-char hex string (32 bytes).");
  }
  return Buffer.from(hex, "hex");
}

/** Returns "iv:authTag:encrypted" (all hex) */
export function encrypt(plaintext: string): string {
  if (!plaintext) return "";
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

/** Decrypts a value produced by encrypt() */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) return "";
  try {
    const [ivHex, tagHex, encHex] = ciphertext.split(":");
    if (!ivHex || !tagHex || !encHex) return "";
    const key = getKey();
    const decipher = createDecipheriv(ALGO, key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encHex, "hex")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return "";
  }
}

/** Mask a secret for display — show last 4 chars only */
export function mask(value: string): string {
  if (!value || value.length < 8) return "••••••••";
  return "••••••••" + value.slice(-4);
}
