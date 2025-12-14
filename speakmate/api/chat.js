import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Only POST allowed" });
  const auth = req.headers.authorization || "";
  const token = auth.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token kerak" });

  try { jwt.verify(token, process.env.JWT_SECRET || "dev_secret"); } catch { return res.status(401).json({ message: "Token noto‘g‘ri" }); }

  const { prompt, userText } = req.body || {};
  if (!prompt || !userText) return res.status(400).json({ message: "prompt and userText required" });

  try {
    // Call OpenRouter (free-friendly)
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an English speaking practice AI. Analyze grammar mistakes, fluency, and give corrections in Uzbek + English." },
          { role: "user", content: `Prompt: ${prompt}\nUser answer: ${userText}\nPlease respond with a short reply and structured feedback.` }
        ]
      })
    });

    const j = await r.json();
    const reply = j.choices?.[0]?.message?.content || "Thank you. Could you elaborate?";
    const analysis = simpleAnalyze(userText);
    return res.status(200).json({ reply, analysis });
  } catch (e) {
    console.error(e);
    const analysis = simpleAnalyze(userText);
    return res.status(200).json({ reply: "Thanks. Please add more details and examples.", analysis });
  }
}

function simpleAnalyze(text) {
  const cleaned = String(text).replace(/\s+/g," ").trim();
  const fixes=[];
  if(/\bI am go\b/i.test(cleaned)) fixes.push({ wrong:"I am go", correct:"I am going", uz:"Present Continuous — hozirgi harakat uchun 'going'." });
  if(/\bShe have\b/i.test(cleaned)) fixes.push({ wrong:"She have", correct:"She has", uz:"3‑shaxs birlikda 'has'." });
  if(/\bHe don'?t\b/i.test(cleaned)) fixes.push({ wrong:"He don't", correct:"He doesn't", uz:"3‑shaxsda 'doesn't' ishlatiladi." });
  const fillers=(cleaned.match(/\b(um|uh|like|you know)\b/gi)||[]).length;
  const pronTips=[]; if(/\b(th|three|think|thank)\b/i.test(cleaned)) pronTips.push("‘th’: tilni tishlar orasiga qo‘yib yumshoq ayting.");
  const fluencyScore=Math.max(50,92 - fillers*6); const grammarScore=Math.max(55,95 - fixes.length*12); const overall=Math.round((fluencyScore+grammarScore)/2);
  return { fixes, pronTips, fillers, fluencyScore, grammarScore, overall };
}
