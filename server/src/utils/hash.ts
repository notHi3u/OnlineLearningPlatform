import crypto from "crypto";

// tạo hash kiểu Odoo: sha512$salt$hash
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .createHmac("sha512", salt)
    .update(password)
    .digest("hex");

  return `sha512$${salt}$${hash}`;
}

export function verifyPassword(input: string, stored: string): boolean {
  // 👉 1) Nếu password trong DB là plaintext → cho login
  if (!stored.includes("$")) {
    return input === stored; // hợp lệ
  }

  // 👉 2) Nếu password là dạng hash sha512$salt$hash → verify chuẩn
  const [algo, salt, hashed] = stored.split("$");
  if (algo !== "sha512") return false;

  const verifyHash = crypto
    .createHmac("sha512", salt)
    .update(input)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(hashed), Buffer.from(verifyHash));
}
