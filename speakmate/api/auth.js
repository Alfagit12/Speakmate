import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Only POST allowed" });
  const { action, email, phone, telegram, password } = req.body || {};
  if (!action) return res.status(400).json({ message: "action required" });

  // Demo-only auth (no DB): issue a signed JWT
  const payload = { email, phone, telegram, plan: "FREE" };
  const token = jwt.sign(payload, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });

  return res.status(200).json({
    message: action === "register" ? "Ro‘yxatdan o‘tish muvaffaqiyatli" : "Kirish muvaffaqiyatli",
    token
  });
}
