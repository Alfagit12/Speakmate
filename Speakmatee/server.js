import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/ai", async (req, res) => {
    const userText = req.body.text;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": "Bearer YOUR_FREE_API_KEY",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct",
            messages: [
                { role: "system", content: "You are an English tutor. Correct mistakes and explain." },
                { role: "user", content: userText }
            ]
        })
    });

    const data = await response.json();

    res.json({
        reply: data.choices[0].message.content,
        mistakes: "Grammar or word usage corrections shown above"
    });
});

app.listen(3000, () => console.log("AI Server running on 3000"));
