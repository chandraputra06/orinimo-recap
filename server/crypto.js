import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createHmac,
} from "node:crypto";
function key() {
  const value = process.env.APP_ENCRYPTION_KEY || "";
  if (!/^[a-f0-9]{64}$/i.test(value))
    throw new Error("APP_ENCRYPTION_KEY harus 64 karakter hex.");
  return Buffer.from(value, "hex");
}
export function encrypt(value) {
  if (!value) return null;
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  return [
    "v1",
    iv.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}
export function decrypt(value) {
  if (!value) return "";
  const [v, iv, tag, data] = value.split(".");
  if (v !== "v1") throw new Error("Format enkripsi tidak didukung.");
  const cipher = createDecipheriv(
    "aes-256-gcm",
    key(),
    Buffer.from(iv, "base64"),
  );
  cipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([
    cipher.update(Buffer.from(data, "base64")),
    cipher.final(),
  ]).toString("utf8");
}

export function importDigest(value) {
  return createHmac("sha256", key()).update(value).digest("hex");
}
