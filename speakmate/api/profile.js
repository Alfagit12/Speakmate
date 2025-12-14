import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Only GET allowed" });
  const auth = req.headers.authorization || "";
  const token = auth.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token kerak" });

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    // Demo profile
    return res.status(200).json({ email: data.email, phone: data.phone, telegram: data.telegram, plan: data.plan || "FREE", xp: 0, level: 1 });
  } catch {
    return res.status(401).json({ message: "Token noto‘g‘ri" });
  }
}
