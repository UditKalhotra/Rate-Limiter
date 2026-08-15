const crypto = require("crypto");

/*
 * API keys used to be bcrypt-hashed only, which is one-way — the raw key
 * could never be shown to the user again after creation, and validating
 * an incoming key meant looping over every stored key and running
 * bcrypt.compare() on each one (O(n) per request).
 *
 * To support "let me see my key again" in the dashboard, we now store two
 * things instead of one bcrypt hash:
 *   - keyHash:      SHA-256 digest of the raw key, used purely for O(1)
 *                    lookup (`findOne({ keyHash })`) during auth.
 *   - keyEncrypted: the raw key encrypted with AES-256-GCM, which can be
 *                    decrypted on demand when the user clicks "reveal".
 *
 * Trade-off, stated plainly: this makes key storage reversible. Anyone
 * with both DB access and API_KEY_SECRET can recover every raw key. A
 * one-way hash (what you had before) is strictly more secure and is what
 * production systems (Stripe, GitHub, AWS) use — they show the secret
 * once and never again. We're intentionally trading that for the
 * "view it later" UX you asked for. If you ever want the stricter
 * behavior back, drop keyEncrypted and go back to show-once.
 */

const ALGO = "aes-256-gcm";

function getSecretKey() {
  const secret = process.env.API_KEY_SECRET;
  if (!secret) {
    throw new Error(
      "API_KEY_SECRET is not set. Add a 32+ char random string to backend/.env"
    );
  }
  // Derive a stable 32-byte key regardless of the raw secret's length.
  return crypto.createHash("sha256").update(secret).digest();
}

function hashKey(rawKey) {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

function encryptKey(rawKey) {
  const key = getSecretKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(rawKey, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Store as iv:authTag:ciphertext, all hex.
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

function decryptKey(payload) {
  const key = getSecretKey();
  const [ivHex, authTagHex, dataHex] = payload.split(":");
  if (!ivHex || !authTagHex || !dataHex) {
    throw new Error("Malformed encrypted API key payload");
  }
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final()
  ]);
  return decrypted.toString("utf8");
}

module.exports = { hashKey, encryptKey, decryptKey };
