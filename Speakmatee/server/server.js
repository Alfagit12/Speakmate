import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app=express();
app.use(cors());
app.use(express.json());

const KEY="OPENROUTER_API_KEY";

app.post("/chat",async(req,res)=>{
  const r=await fetch("https://openrouter.ai/api/v1/chat/completions",{
    method:"POST",
    headers:{
      "Authorization":"Bearer "+KEY,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      model:"openai/gpt-3.5-turbo",
      messages:[
        {role:"system",content:"Correct English mistakes and explain."},
        {role:"user",content:req.body.message}
      ]
    })
  });
  const j=await r.json();
  res.json({reply:j.choices[0].message.content});
});

app.listen(3000,()=>console.log("AI server running"));
