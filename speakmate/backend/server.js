require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("./models/User");
const Session = require("./models/Session");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(()=>console.log("MongoDB ulandi")).catch(console.error);

// Auth middleware
function auth(req,res,next){
  const token = (req.headers.authorization||"").split(" ")[1];
  if(!token) return res.status(401).json({message:"Token kerak"});
  try{
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  }catch(e){ return res.status(401).json({message:"Token noto‘g‘ri"}); }
}

// Register
app.post("/api/register", async(req,res)=>{
  const {email,password} = req.body;
  if(await User.findOne({email})) return res.status(400).json({message:"Email mavjud"});
  const hash = await bcrypt.hash(password,10);
  await User.create({email,password:hash});
  res.json({message:"Ro‘yxatdan o‘tildi"});
});

// Login
app.post("/api/login", async(req,res)=>{
  const {email,password} = req.body;
  const user = await User.findOne({email});
  if(!user) return res.status(400).json({message:"Email topilmadi"});
  const ok = await bcrypt.compare(password,user.password);
  if(!ok) return res.status(400).json({message:"Parol noto‘g‘ri"});
  const token = jwt.sign({userId:user._id,email:user.email},process.env.JWT_SECRET,{expiresIn:"7d"});
  res.json({message:"Login ok",token});
});

// Profile
app.get("/api/profile",auth,async(req,res)=>{
  const user = await User.findById(req.user.userId).lean();
  res.json(user);
});

// Simple AI analysis
function analyzeText(text){
  const fixes=[];
  if(/I am go/i.test(text)) fixes.push({wrong:"I am go",correct:"I am going",uz:"Present Continuous — 'going' ishlatiladi"});
  const reply="Interesting! Tell me more.";
  return {fixes,overall:fixes.length?70:90,reply};
}

// Chat
app.post("/api/chat",auth,async(req,res)=>{
  const {prompt,userText}=req.body;
  const analysis=analyzeText(userText);
  const sess=await Session.create({userId:req.user.userId,prompt,userText,analysis,botReply:analysis.reply});
  const user=await User.findById(req.user.userId);
  user.xp+=10; if(user.xp>=user.level*100) user.level++;
  await user.save();
  res.json({analysis,botReply:analysis.reply});
});

// History
app.get("/api/sessions",auth,async(req,res)=>{
  const list=await Session.find({userId:req.user.userId}).sort({createdAt:-1}).limit(10).lean();
  res.json(list);
});

app.listen(process.env.PORT,()=>console.log("Server ishlayapti"));
