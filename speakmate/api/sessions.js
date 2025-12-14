import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Only GET allowed" });
  const auth = req.headers.authorization || "";
  const token = auth.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token kerak" });

  try { jwt.verify(token, process.env.JWT_SECRET || "dev_secret"); } catch { return res.status(401).json({ message: "Token noto‘g‘ri" }); }

  // Demo-only: static list (replace with KV/Supabase later)
  return res.status(200).json([
    { prompt: "My hobbies", userText: "I am go to play football", analysis: { overall: 75 }, createdAt: new Date().toISOString() },
    { prompt: "Daily routine", userText: "I wake up and she have breakfast", analysis: { overall: 70 }, createdAt: new Date(Date.now()-86400000).toISOString() }
  ]);
}
