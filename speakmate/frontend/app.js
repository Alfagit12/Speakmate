// Config
const API = {
  auth: "/api/auth",
  profile: "/api/profile",
  chat: "/api/chat",
  sessions: "/api/sessions",
  payme: "/api/payments/payme",
  click: "/api/payments/click"
};
const WEEKLY_FREE_LIMIT = 3;

// I18n
const dict = {
  uz: { quick:"Tezkor xabarlar", weekly:"Haftalik turnir", weekStatus:"Turnir 02:13:45 dan so‘ng tugaydi", joinNow:"Ishtirok eting va XP to‘plang!", newBadges:"Yangi badges", overview:"Umumiy ko‘rinish", xp:"XP progress", level:"Daraja:", streak:"Streak:", days:"kun", plan:"Reja:", leaderboard:"Leaderboard", practice:"Speaking mashqi", topic:"Mavzu", question:"Savol", startVoice:"Ovozda Start", stopVoice:"Stop", analyze:"Tahlil", typeText:"Yoki matn yozing", transcript:"Transcript", feedback:"AI feedback", botReply:"Bot javobi", speakReply:"Ovozda aytsin", newChat:"Yangi chat", profile:"Profil", badges:"Badges", history:"Tarix", pricing:"Narxlar", register:"Ro‘yxatdan o‘tish", login:"Kirish" },
  en: { quick:"Quick notifications", weekly:"Weekly tournament", weekStatus:"Tournament ends in 02:13:45", joinNow:"Join now and earn XP!", newBadges:"New badges", overview:"Overview", xp:"XP progress", level:"Level:", streak:"Streak:", days:"days", plan:"Plan:", leaderboard:"Leaderboard", practice:"Speaking practice", topic:"Topic", question:"Question", startVoice:"Voice Start", stopVoice:"Stop", analyze:"Analyze", typeText:"Or type your answer", transcript:"Transcript", feedback:"AI feedback", botReply:"Bot reply", speakReply:"Speak reply", newChat:"New chat", profile:"Profile", badges:"Badges", history:"History", pricing:"Pricing", register:"Register", login:"Login" }
};
let locale = localStorage.getItem("locale") || "uz";
const langToggle = document.getElementById("langToggle");
langToggle.textContent = locale.toUpperCase();
langToggle.addEventListener("click", () => {
  locale = locale === "uz" ? "en" : "uz";
  localStorage.setItem("locale", locale);
  langToggle.textContent = locale.toUpperCase();
  applyI18n();
});
function applyI18n(){ document.querySelectorAll(".i18n").forEach(el => { const key = el.dataset.i18n; el.textContent = dict[locale][key] || el.textContent; }); }
applyI18n();

// Router
const pages=["landing","dashboard","practice","leaderboard","profile","pricing","admin"];
function renderPage(){ const hash = location.hash.replace("#","") || "landing"; pages.forEach(id=>document.getElementById(id)?.classList.toggle("active", id===hash)); }
window.addEventListener("hashchange",renderPage);
window.addEventListener("load",()=>{ renderPage(); initTopics(); initSpeech(); initCharts(); loadLeaderboard(); loadHistory(); refreshUI(); pushNotification("Turnir boshlandi! XP to‘plang."); });

// Splash loading
const btnEnter=document.getElementById("btnEnter");
const loadingOverlay=document.getElementById("loadingOverlay");
btnEnter?.addEventListener("click",()=>{ loadingOverlay.classList.remove("hidden"); setTimeout(()=>{ loadingOverlay.classList.add("hidden"); location.hash="#dashboard"; },1000); });

// State (local MVP)
const state = {
  xp: parseInt(localStorage.getItem("xp")||"0",10),
  level: parseInt(localStorage.getItem("level")||"1",10),
  streak: parseInt(localStorage.getItem("streak")||"0",10),
  plan: localStorage.getItem("plan") || "FREE",
  chatsThisWeek: parseInt(localStorage.getItem("chatsThisWeek")||"0",10),
  token: localStorage.getItem("token") || "",
  email: localStorage.getItem("email") || "",
  phone: localStorage.getItem("phone") || "",
  tg: localStorage.getItem("tg") || ""
};
function saveState(){ Object.entries(state).forEach(([k,v])=>localStorage.setItem(k,String(v))); }
function refreshUI(){
  const need = state.level*100, pct = Math.min(100, Math.round(100*state.xp/need));
  document.getElementById("xpBar").style.width = pct + "%";
  document.getElementById("xpInfo").textContent = `${state.xp} / ${need}`;
  document.getElementById("level").textContent = state.level;
  document.getElementById("streak").textContent = state.streak;
  document.getElementById("plan").textContent = state.plan;
  document.getElementById("limitInfo").textContent = state.plan==="FREE" ? `Free: ${WEEKLY_FREE_LIMIT} chats/week (used: ${state.chatsThisWeek})` : "Premium: Unlimited chats";
}

// Notifications & badges
function pushNotification(text){ const li=document.createElement("li"); li.textContent=text; document.getElementById("notifications").prepend(li); }
function addBadge(name){ const el=document.createElement("div"); el.className="badge"; el.textContent=name; document.getElementById("newBadges").prepend(el); }

// Topics
const topics=[{title:"My hobbies",prompts:["Tell me about your hobbies.","How often do you practice them?"]},{title:"Daily routine",prompts:["Describe your typical day.","Which part is most productive?"]},{title:"Travel",prompts:["Talk about a place you visited.","What did you enjoy the most?"]},{title:"Education",prompts:["Describe your studies.","Why did you choose your major?"]},{title:"Technology",prompts:["Are phones helpful or harmful?","How do you use tech daily?"]},{title:"Environment",prompts:["What can we do for nature?","Is recycling effective?"]}];
const topicSel=document.getElementById("topicSel");const promptEl=document.getElementById("prompt");
function initTopics(){ topics.forEach((t,i)=>{ const opt=document.createElement("option"); opt.value=String(i); opt.textContent=t.title; topicSel.appendChild(opt); }); topicSel.addEventListener("change",()=>{ const t=topics[parseInt(topicSel.value,10)], q=t.prompts[Math.floor(Math.random()*t.prompts.length)]; promptEl.textContent=q; }); topicSel.value="0"; promptEl.textContent=topics[0].prompts[0]; }

// Leaderboard mock
const lbBody=document.getElementById("lbBody");const lbBody2=document.getElementById("lbBody2");const lbSearch=document.getElementById("lbSearch");const lbFilter=document.getElementById("lbFilter");
const mockLB=[{name:"Aziza",xp:860,plan:"PREMIUM"},{name:"Javlon",xp:740,plan:"FREE"},{name:"Nilufar",xp:690,plan:"PREMIUM"},{name:"Bekzod",xp:610,plan:"FREE"},{name:"Sarvinoz",xp:580,plan:"PREMIUM"}];
function loadLeaderboard(){ lbBody.innerHTML=mockLB.map((u,i)=>`<tr><td>${i+1}</td><td>${u.name}</td><td>${u.xp}</td></tr>`).join(""); renderLBTable(mockLB); }
function renderLBTable(list){ const q=(lbSearch?.value||"").toLowerCase(), f=(lbFilter?.value||"all"); const filtered=list.filter(u=>{ const okQ=!q||u.name.toLowerCase().includes(q); const okF=f==="all"||u.plan===f.toUpperCase(); return okQ&&okF; }); lbBody2.innerHTML=filtered.map((u,i)=>`<tr><td>${i+1}</td><td>${u.name}</td><td>${u.xp}</td><td>${u.plan}</td></tr>`).join(""); }
lbSearch?.addEventListener("input",()=>renderLBTable(mockLB)); lbFilter?.addEventListener("change",()=>renderLBTable(mockLB));

// Auth (email/phone/telegram)
const emailEl=document.getElementById("email");const phoneEl=document.getElementById("phone");const tgEl=document.getElementById("tg");const passwordEl=document.getElementById("password");const authMsg=document.getElementById("authMsg");
document.getElementById("btnRegister").addEventListener("click",async()=>{
  const payload={email:emailEl.value.trim(),phone:phoneEl.value.trim(),telegram:tgEl.value.trim(),password:passwordEl.value.trim()};
  const r=await fetch(API.auth,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"register",...payload})});
  const j=await r.json(); authMsg.textContent=j.message||"Registered"; if(j.token){state.token=j.token; state.email=payload.email; state.phone=payload.phone; state.tg=payload.telegram; saveState(); pushNotification("Ro‘yxatdan o‘tish muvaffaqiyatli.");}
});
document.getElementById("btnLogin").addEventListener("click",async()=>{
  const payload={email:emailEl.value.trim(),phone:phoneEl.value.trim(),telegram:tgEl.value.trim(),password:passwordEl.value.trim()};
  const r=await fetch(API.auth,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"login",...payload})});
  const j=await r.json(); authMsg.textContent=j.message||"Login ok"; if(j.token){state.token=j.token; saveState(); pushNotification("Xush kelibsiz!");}
});

// Weekly reset
function ensureWeeklyReset(){ const last=localStorage.getItem("lastWeekReset"); const nowWeek=getWeekKey(new Date()); if(last!==nowWeek){ state.chatsThisWeek=0; localStorage.setItem("lastWeekReset",nowWeek); saveState(); refreshUI(); pushNotification("Haftalik limit qayta boshlandi."); } }
function getWeekKey(d){ const onejan=new Date(d.getFullYear(),0,1); const week=Math.ceil((((d-onejan)/86400000)+onejan.getDay()+1)/7); return `${d.getFullYear()}-W${week}`; }
ensureWeeklyReset();

// Practice & voice
const btnStart=document.getElementById("btnStart"), btnStop=document.getElementById("btnStop"), btnAnalyze=document.getElementById("btnAnalyze");
const recStatus=document.getElementById("recStatus"), userTextEl=document.getElementById("userText");
const transcriptBox=document.getElementById("transcriptBox"), feedbackBox=document.getElementById("feedbackBox"), botReplyBox=document.getElementById("botReply"), btnSpeakReply=document.getElementById("btnSpeakReply"), btnNewChat=document.getElementById("btnNewChat");
let recognition=null, transcriptBuffer="";
function initSpeech(){ const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){ recStatus.textContent=locale==="uz"?"Ovoz tanish mavjud emas. Matndan foydalaning.":"Speech recognition not available."; btnStart.disabled=true; btnStop.disabled=true; return; } recognition=new SR(); recognition.lang="en-US"; recognition.interimResults=true; recognition.continuous=true;
  recognition.onstart=()=>{ transcriptBuffer=""; recStatus.textContent=locale==="uz"?"Gapiring...":"Speak..."; btnStart.disabled=true; btnStop.disabled=false; };
  recognition.onerror=e=>{ recStatus.textContent="Error: "+e.error; };
  recognition.onresult=event=>{ let interim=""; for(let i=event.resultIndex;i<event.results.length;i++){ const r=event.results[i]; if(r.isFinal) transcriptBuffer+=r[0].transcript+" "; else interim+=r[0].transcript; } transcriptBox.textContent=(transcriptBuffer+interim).trim(); };
  recognition.onend=()=>{ recStatus.textContent="Stopped"; btnStart.disabled=false; btnStop.disabled=true; };
}
btnStart.addEventListener("click",()=>{ try{ recognition?.start(); }catch{} }); btnStop.addEventListener("click",()=>{ try{ recognition?.stop(); }catch{} });

btnAnalyze.addEventListener("click",async()=>{
  ensureWeeklyReset();
  if(state.plan==="FREE" && state.chatsThisWeek>=WEEKLY_FREE_LIMIT){ alert(locale==="uz"?"Sizning haftalik limitingiz tugadi. Cheksiz gaplashish uchun Premiumga o‘ting.":"Your weekly free limit is over. Upgrade to Premium."); return; }
  const prompt=promptEl.textContent; const text=(transcriptBuffer.trim()||userTextEl.value.trim()); if(!text){ return alert(locale==="uz"?"Iltimos, gapiring yoki matn yozing.":"Please speak or type your answer."); }
  const r=await fetch(API.chat,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+state.token},body:JSON.stringify({prompt,userText:text})});
  const j=await r.json();
  renderFeedback(j.analysis||{overall:75});
  botReplyBox.textContent=j.reply||"Thank you. Could you elaborate?";
  btnSpeakReply.disabled=false;
  const score=j.analysis?.overall||75, gained=10+(score>=80?5:0);
  state.xp+=gained; if(state.xp>=state.level*100){ state.level+=1; addBadge("Level Up"); }
  state.streak+=1; state.chatsThisWeek+=1; saveState(); refreshUI(); addHistoryItem(prompt,text,score);
});
btnSpeakReply.addEventListener("click",()=>{ const text=botReplyBox.textContent; const utt=new SpeechSynthesisUtterance(text); utt.lang="en-US"; utt.rate=1.0; window.speechSynthesis.cancel(); window.speechSynthesis.speak(utt); });
btnNewChat.addEventListener("click",()=>{ transcriptBuffer=""; transcriptBox.textContent="—"; feedbackBox.textContent="—"; botReplyBox.textContent="—"; btnSpeakReply.disabled=true; });

function renderFeedback(a){
  feedbackBox.innerHTML = `
    <div><strong>Overall:</strong> ${a.overall}/100</div>
    <div><strong>Fluency:</strong> ${a.fluencyScore ?? "-"}</div>
    <div><strong>Grammar:</strong> ${a.grammarScore ?? "-"}</div>
    <div><strong>Fillers:</strong> ${a.fillers ?? 0}</div>
    <div style="margin-top:8px"><strong>Corrections:</strong>
      ${(a.fixes?.length||0)>0 ? `<ul>${a.fixes.map(f=>`<li><span style="color:#c62828">${f.wrong}</span> → <span style="color:#2e7d32">${f.correct}</span><div class="muted">${f.uz}</div></li>`).join("")}</ul>` : `<div class="muted">No major errors found (basic check).</div>`}
    </div>
    <div style="margin-top:8px"><strong>Pronunciation tips:</strong>
      ${(a.pronTips?.length||0)>0 ? `<ul>${a.pronTips.map(t=>`<li>${t}</li>`).join("")}</ul>` : `<div class="muted">Keep a steady pace, stress key words.</div>`}
    </div>`;
}

// History (local list)
function addHistoryItem(prompt,userText,score){
  const item=document.createElement("div"); item.className="prompt-box";
  item.innerHTML=`<div><strong>Mavzu:</strong> ${escapeHtml(prompt)}</div><div><strong>Javobingiz:</strong> ${escapeHtml(userText)}</div><div><strong>Baholash:</strong> ${score} / 100</div><div class="muted">${new Date().toLocaleString()}</div>`;
  document.getElementById("historyList").prepend(item);
}
async function loadHistory(){
  try{ const r=await fetch(API.sessions,{headers:{"Authorization":"Bearer "+state.token}}); const list=await r.json();
    if(Array.isArray(list)){ document.getElementById("historyList").innerHTML=list.map(s=>`<div class="prompt-box"><div><strong>Mavzu:</strong> ${escapeHtml(s.prompt)}</div><div><strong>Javobingiz:</strong> ${escapeHtml(s.userText)}</div><div><strong>Baholash:</strong> ${s.analysis?.overall ?? "-"}</div><div class="muted">${new Date(s.createdAt).toLocaleString()}</div></div>`).join(""); }
  }catch{}
}

// Payments (demo upgrade)
document.getElementById("btnPayme").addEventListener("click",async()=>{ await upgradePlan("payme"); });
document.getElementById("btnClick").addEventListener("click",async()=>{ await upgradePlan("click"); });
async function upgradePlan(method){
  try{
    const r=await fetch(method==="payme"?API.payme:API.click,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+state.token},body:JSON.stringify({plan:"PREMIUM",price:"69000/month"})});
    const j=await r.json(); if(j.ok){ state.plan="PREMIUM"; saveState(); refreshUI(); pushNotification("Premium faollashtirildi."); addBadge("Premium"); } else { alert(j.message||"Payment error"); }
  }catch{ alert("Payment service unavailable"); }
}

// Charts & admin
function initCharts(){
  new Chart(document.getElementById("weeklyChart"),{ type:'line', data:{ labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], datasets:[{ label:'XP', data:[10,20,45,60,70,90,100], borderColor:'#4A90E2', backgroundColor:'rgba(74,144,226,.15)', tension:.3 }] }, options:{ plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} } });
  const ctx2=document.getElementById("adminChart"); if(!ctx2) return;
  new Chart(ctx2,{ type:'bar', data:{ labels:["Hobbies","Routine","Travel","Education","Tech","Env"], datasets:[{ label:'Popularity', data:[32,28,40,22,35,27], backgroundColor:'#7ED321' }] }, options:{ plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} } });
  renderAdminUsers(); renderAdminTopics();
}
function renderAdminUsers(){
  const box=document.getElementById("adminUsers");
  const users=[{email:"aziza@example.com",plan:"PREMIUM",tg:"@aziza",phone:"+998 99 111 22 33"},{email:"javlon@example.com",plan:"FREE",tg:"@javlon",phone:"+998 90 222 33 44"},{email:"nilufar@example.com",plan:"PREMIUM",tg:"@nilufar",phone:"+998 93 333 44 55"}];
  const qEl=document.getElementById("searchUser"); const fEl=document.getElementById("filterPlan");
  function draw(){ const q=(qEl.value||"").toLowerCase(), f=fEl.value; const list=users.filter(u=>{ const okQ=!q||[u.email,u.tg,u.phone].some(s=>s.toLowerCase().includes(q)); const okF=f==="all"||u.plan===f; return okQ&&okF; }); box.innerHTML=list.map(u=>`<div class="prompt-box"><strong>${u.email}</strong> — ${u.plan} — ${u.tg} — ${u.phone}</div>`).join(""); }
  qEl.addEventListener("input",draw); fEl.addEventListener("change",draw); draw();
}
function renderAdminTopics(){
  const box=document.getElementById("adminTopics"); const qEl=document.getElementById("searchTopic"); const fEl=document.getElementById("filterTop"); const list=topics.map(t=>({title:t.title,count:Math.floor(Math.random()*50)+10}));
  function draw(){ const q=(qEl.value||"").toLowerCase(), f=fEl.value; const arr=list.filter(it=>(!q||it.title.toLowerCase().includes(q)) && (f==="all"||it.count>=35)); box.innerHTML=arr.map(it=>`<div class="prompt-box"><strong>${it.title}</strong> — ${it.count} sessions</div>`).join(""); }
  qEl.addEventListener("input",draw); fEl.addEventListener("change",draw); draw();
}

// Helpers
function escapeHtml(str){ return String(str||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
