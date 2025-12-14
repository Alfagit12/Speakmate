import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Only POST allowed" });
  const auth = req.headers.authorization || "";
  const token = auth.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token kerak" });

  try { jwt.verify(token, process.env.JWT_SECRET || "dev_secret"); } catch { return res.status(401).json({ message: "Token noto‘g‘ri" }); }

  // Demo: upgrade success (replace with Payme integration + webhook)
  return res.status(200).json({ ok: true, message: "Premium activated via Payme (demo)" });
}
