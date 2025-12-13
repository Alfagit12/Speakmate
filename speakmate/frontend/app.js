// Config
const API_URL = "/api/chat"; // Vercel Function endpoint (keyin ulaysiz). Hozir demo ishlaydi.
const WEEKLY_FREE_LIMIT = 3;

// Simple i18n dictionary
const dict = {
  uz: {
    quick: "Tezkor xabarlar",
    weekly: "Haftalik turnir",
    weekStatus: "Turnir 02:13:45 dan so‘ng tugaydi",
    joinNow: "Ishtirok eting va XP to‘plang!",
    newBadges: "Yangi badges",
    overview: "Umumiy ko‘rinish",
    xp: "XP progress",
    level: "Daraja:",
    streak: "Streak:",
    days: "kun",
    plan: "Reja:",
    leaderboard: "Leaderboard",
    practice: "Speaking mashqi",
    topic: "Mavzu",
    question: "Savol",
    startVoice: "Ovozda Start",
    stopVoice: "Stop",
    analyze: "Tahlil",
    typeText: "Yoki matn yozing",
    transcript: "Transcript",
    feedback: "AI feedback",
    botReply: "Bot javobi",
    speakReply: "Ovozda aytsin",
    newChat: "Yangi chat",
    profile: "Profil",
    badges: "Badges",
    history: "Tarix",
    pricing: "Narxlar",
    register: "Ro‘yxatdan o‘tish",
    login: "Kirish"
  },
  en: {
    quick: "Quick notifications",
    weekly: "Weekly tournament",
    weekStatus: "Tournament ends in 02:13:45",
    joinNow: "Join now and earn XP!",
    newBadges: "New badges",
    overview: "Overview",
    xp: "XP progress",
    level: "Level:",
    streak: "Streak:",
    days: "days",
    plan: "Plan:",
    leaderboard: "Leaderboard",
    practice: "Speaking practice",
    topic: "Topic",
    question: "Question",
    startVoice: "Voice Start",
    stopVoice: "Stop",
    analyze: "Analyze",
    typeText: "Or type your answer",
    transcript: "Transcript",
    feedback: "AI feedback",
    botReply: "Bot reply",
    speakReply: "Speak reply",
    newChat: "New chat",
    profile: "Profile",
    badges: "Badges",
    history: "History",
    pricing: "Pricing",
    register: "Register",
    login: "Login"
  }
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

// Apply i18n
function applyI18n() {
  document.querySelectorAll(".i18n").forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = dict[locale][key] || el.textContent;
  });
}
applyI18n();

/* Router */
const pages = ["dashboard","practice","leaderboard","profile","pricing","admin"];
function renderPage(){
  const hash = location.hash.replace("#","") || "dashboard";
  pages.forEach(id => document.getElementById(id)?.classList.toggle("active", id === hash));
}
window.addEventListener("hashchange", renderPage);
window.addEventListener("load", () => {
  renderPage();
  initTopics();
  initSpeech();
  initCharts();
  loadLeaderboard();
  loadHistory();
  refreshUI();
  pushNotification("Turnir boshlandi! XP to‘plang.");
});

/* State (localStorage) */
const state = {
  xp: parseInt(localStorage.getItem("xp")||"0",10),
  level: parseInt(localStorage.getItem("level")||"1",10),
  streak: parseInt(localStorage.getItem("streak")||"0",10),
  plan: localStorage.getItem("plan") || "FREE",
  chatsThisWeek: parseInt(localStorage.getItem("chatsThisWeek")||"0",10),
  email: localStorage.getItem("email") || "",
  phone: localStorage.getItem("phone") || "",
  tg: localStorage.getItem("tg") || ""
};

function saveState(){
  Object.entries(state).forEach(([k,v]) => localStorage.setItem(k,String(v)));
}

/* Dashboard UI */
const xpBar = document.getElementById("xpBar");
const xpInfo = document.getElementById("xpInfo");
const levelEl = document.getElementById("level");
const streakEl = document.getElementById("streak");
const planEl = document.getElementById("plan");

function refreshUI(){
  const need = state.level*100;
  const pct = Math.min(100, Math.round(100*state.xp/need));
  xpBar.style.width = pct + "%";
  xpInfo.textContent = `${state.xp} / ${need}`;
  levelEl.textContent = state.level;
  streakEl.textContent = state.streak;
  planEl.textContent = state.plan;
  document.getElementById("limitInfo").textContent = state.plan==="FREE"
    ? `Free: ${WEEKLY_FREE_LIMIT} chats/week (used: ${state.chatsThisWeek})`
    : "Premium: Unlimited chats";
}

/* Notifications & badges */
const notifications = document.getElementById("notifications");
function pushNotification(text){
  const li = document.createElement("li");
  li.textContent = text;
  notifications.prepend(li);
}
const newBadges = document.getElementById("newBadges");
function addBadge(name){
  const el = document.createElement("div");
  el.className = "badge";
  el.textContent = name;
  newBadges.prepend(el);
}

/* Topics & prompts */
const topics = [
  { title:"My hobbies", prompts:["Tell me about your hobbies.","How often do you practice them?"] },
  { title:"Daily routine", prompts:["Describe your typical day.","Which part is most productive?"] },
  { title:"Travel", prompts:["Talk about a place you visited.","What did you enjoy the most?"] },
  { title:"Education", prompts:["Describe your studies.","Why did you choose your major?"] },
  { title:"Technology", prompts:["Are phones helpful or harmful?","How do you use tech daily?"] },
  { title:"Environment", prompts:["What can we do for nature?","Is recycling effective?"] }
];
const topicSel = document.getElementById("topicSel");
const promptEl = document.getElementById("prompt");
function initTopics(){
  topics.forEach((t,i)=>{
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = t.title;
    topicSel.appendChild(opt);
  });
  topicSel.addEventListener("change", ()=>{
    const t = topics[parseInt(topicSel.value,10)];
    const q = t.prompts[Math.floor(Math.random()*t.prompts.length)];
    promptEl.textContent = q;
  });
  topicSel.value = "0";
  promptEl.textContent = topics[0].prompts[0];
}

/* Leaderboard (mock) */
const lbBody = document.getElementById("lbBody");
const lbBody2 = document.getElementById("lbBody2");
const lbSearch = document.getElementById("lbSearch");
const lbFilter = document.getElementById("lbFilter");
const mockLB = [
  {name:"Aziza", xp: 860, plan:"PREMIUM"},
  {name:"Javlon", xp: 740, plan:"FREE"},
  {name:"Nilufar", xp: 690, plan:"PREMIUM"},
  {name:"Bekzod", xp: 610, plan:"FREE"},
  {name:"Sarvinoz", xp: 580, plan:"PREMIUM"}
];
function loadLeaderboard(){
  lbBody.innerHTML = mockLB.map((u,i)=>`<tr><td>${i+1}</td><td>${u.name}</td><td>${u.xp}</td></tr>`).join("");
  renderLBTable(mockLB);
}
function renderLBTable(list){
  const q = (lbSearch.value||"").toLowerCase();
  const f = lbFilter.value;
  const filtered = list.filter(u => {
    const okQ = !q || u.name.toLowerCase().includes(q);
    const okF = f==="all" || u.plan===f.toUpperCase();
    return okQ && okF;
  });
  lbBody2.innerHTML = filtered.map((u,i)=>`<tr><td>${i+1}</td><td>${u.name}</td><td>${u.xp}</td><td>${u.plan}</td></tr>`).join("");
}
lbSearch?.addEventListener("input", ()=>renderLBTable(mockLB));
lbFilter?.addEventListener("change", ()=>renderLBTable(mockLB));

/* Profile auth: email + phone + telegram */
const emailEl = document.getElementById("email");
const phoneEl = document.getElementById("phone");
const tgEl = document.getElementById("tg");
const authMsg = document.getElementById("authMsg");
document.getElementById("btnRegister").addEventListener("click", ()=>{
  state.email = emailEl.value.trim();
  state.phone = phoneEl.value.trim();
  state.tg = tgEl.value.trim();
  saveState();
  authMsg.textContent = "Ro‘yxatdan o‘tish muvaffaqiyatli (demo).";
});
document.getElementById("btnLogin").addEventListener("click", ()=>{
  if (!state.email && !state.phone && !state.tg) {
    authMsg.textContent = "Email yoki Telefon yoki Telegram username kiriting.";
    return;
  }
  authMsg.textContent = "Kirish muvaffaqiyatli (demo).";
  pushNotification("Xush kelibsiz!");
});

/* History (local) */
const historyList = document.getElementById("historyList");
function addHistoryItem(prompt, userText, score){
  const item = document.createElement("div");
  item.className = "prompt-box";
  const when = new Date().toLocaleString();
  item.innerHTML = `<div><strong>Mavzu:</strong> ${escapeHtml(prompt)}</div>
    <div><strong>Javobingiz:</strong> ${escapeHtml(userText)}</div>
    <div><strong>Baholash:</strong> ${score} / 100</div>
    <div class="muted">${when}</div>`;
  historyList.prepend(item);
}

/* Payments (demo) */
document.getElementById("btnPayme").addEventListener("click", ()=>{
  state.plan = "PREMIUM"; saveState(); refreshUI();
  pushNotification("Premium faollashtirildi (Payme demo)."); addBadge("Premium");
});
document.getElementById("btnClick").addEventListener("click", ()=>{
  state.plan = "PREMIUM"; saveState(); refreshUI();
  pushNotification("Premium faollashtirildi (Click demo)."); addBadge("Premium");
});

/* Weekly reset (demo: har sahifa ochilganda tekshiradi) */
function ensureWeeklyReset(){
  const last = localStorage.getItem("lastWeekReset");
  const nowWeek = getWeekKey(new Date());
  if (last !== nowWeek) {
    state.chatsThisWeek = 0; localStorage.setItem("lastWeekReset", nowWeek); saveState(); refreshUI();
    pushNotification("Haftalik limit qayta boshlandi.");
  }
}
function getWeekKey(d){
  const onejan = new Date(d.getFullYear(),0,1);
  const week = Math.ceil((((d - onejan)/86400000) + onejan.getDay()+1)/7);
  return `${d.getFullYear()}-W${week}`;
}
ensureWeeklyReset();

/* Practice: speech + analyze */
const btnStart = document.getElementById("btnStart");
const btnStop = document.getElementById("btnStop");
const btnAnalyze = document.getElementById("btnAnalyze");
const recStatus = document.getElementById("recStatus");
const userTextEl = document.getElementById("userText");
const transcriptBox = document.getElementById("transcriptBox");
const feedbackBox = document.getElementById("feedbackBox");
const botReplyBox = document.getElementById("botReply");
const btnSpeakReply = document.getElementById("btnSpeakReply");
const btnNewChat = document.getElementById("btnNewChat");
let recognition=null, transcriptBuffer="";

function initSpeech(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    recStatus.textContent = locale==="uz" ? "Ovoz tanish mavjud emas. Matndan foydalaning." : "Speech recognition not available. Use text.";
    btnStart.disabled = true; btnStop.disabled = true;
    return;
  }
  recognition = new SR();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.onstart = ()=>{ transcriptBuffer=""; recStatus.textContent = locale==="uz"?"Gapiring...":"Speak..."; btnStart.disabled=true; btnStop.disabled=false; };
  recognition.onerror = e => { recStatus.textContent = "Error: " + e.error; };
  recognition.onresult = (event) => {
    let interim="";
    for(let i=event.resultIndex;i<event.results.length;i++){
      const r=event.results[i];
      if (r.isFinal) transcriptBuffer += r[0].transcript + " ";
      else interim += r[0].transcript;
    }
    transcriptBox.textContent = (transcriptBuffer + interim).trim();
  };
  recognition.onend = ()=>{ recStatus.textContent = "Stopped"; btnStart.disabled=false; btnStop.disabled=true; };
}
btnStart.addEventListener("click", ()=>{ try{ recognition?.start(); }catch{} });
btnStop.addEventListener("click", ()=>{ try{ recognition?.stop(); }catch{} });

btnAnalyze.addEventListener("click", async ()=>{
  ensureWeeklyReset();
  if (state.plan==="FREE" && state.chatsThisWeek >= WEEKLY_FREE_LIMIT) {
    alert(locale==="uz"
      ? "Sizning haftalik limitingiz tugadi. Cheksiz gaplashish uchun Premiumga o‘ting."
      : "Your weekly free limit is over. Upgrade to Premium for unlimited chats.");
    return;
  }
  const prompt = promptEl.textContent;
  const text = (transcriptBuffer.trim() || userTextEl.value.trim());
  if (!text) return alert(locale==="uz"?"Iltimos, gapiring yoki matn yozing.":"Please speak or type your answer.");

  // AI call: replace with your Vercel Function route. Demo fallback.
  let aiReply = "";
  let analysis = null;
  try {
    const res = await demoAI(prompt, text);
    aiReply = res.reply;
    analysis = res.analysis;
  } catch {
    aiReply = "Thank you. Could you provide more details and examples?";
    analysis = simpleAnalyze(text);
  }

  renderFeedback(analysis);
  botReplyBox.textContent = aiReply;
  btnSpeakReply.disabled = false;

  // Progress & badges
  const score = analysis.overall || 75;
  const gained = 10 + (score >= 80 ? 5 : 0);
  state.xp += gained;
  if (state.xp >= state.level*100) { state.level += 1; addBadge("Level Up"); }
  state.streak += 1;
  state.chatsThisWeek += 1;
  saveState(); refreshUI();
  addHistoryItem(prompt, text, score);
});

btnSpeakReply.addEventListener("click", ()=>{
  const text = botReplyBox.textContent;
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-US";
  utt.rate = 1.0;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utt);
});

btnNewChat.addEventListener("click", ()=>{
  transcriptBuffer=""; transcriptBox.textContent="—";
  feedbackBox.textContent="—"; botReplyBox.textContent="—"; btnSpeakReply.disabled=true;
});

/* Feedback rendering */
function renderFeedback(a){
  feedbackBox.innerHTML = `
    <div><strong>Overall:</strong> ${a.overall}/100</div>
    <div><strong>Fluency:</strong> ${a.fluencyScore ?? "-"}</div>
    <div><strong>Grammar:</strong> ${a.grammarScore ?? "-"}</div>
    <div><strong>Fillers:</strong> ${a.fillers ?? 0}</div>
    <div style="margin-top:8px"><strong>Corrections:</strong>
      ${(a.fixes?.length||0)>0
        ? `<ul>${a.fixes.map(f=>`<li><span style="color:#c62828">${f.wrong}</span> → <span style="color:#2e7d32">${f.correct}</span><div class="muted">${f.uz}</div></li>`).join("")}</ul>`
        : `<div class="muted">No major errors found (basic check).</div>`
      }
    </div>
    <div style="margin-top:8px"><strong>Pronunciation tips:</strong>
      ${(a.pronTips?.length||0)>0
        ? `<ul>${a.pronTips.map(t=>`<li>${t}</li>`).join("")}</ul>`
        : `<div class="muted">Keep a steady pace, stress key words.</div>`
      }
    </div>
  `;
}

/* Demo AI (free-friendly) */
// Dictionary: dictionaryapi.dev example for vocabulary hints
async function vocabHints(text){
  const word = (text.split(/\s+/).find(w=>w.length>5) || "practice").toLowerCase();
  try{
    const r = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    const j = await r.json();
    const defs = Array.isArray(j) ? (j[0]?.meanings?.[0]?.definitions||[]).slice(0,2).map(d=>d.definition) : [];
    return defs.length ? `Vocabulary: "${word}" → ${defs.join("; ")}` : "";
  }catch{return "";}
}

async function demoAI(prompt, userText){
  // If you add serverless function, swap to: const r = await fetch(API_URL,{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,userText})})
  // const j = await r.json(); return j;
  const analysis = simpleAnalyze(userText);
  const hints = await vocabHints(userText);
  const reply = hints
    ? `Nice! ${hints} Could you add more details related to "${prompt}"?`
    : `Nice! Could you add more details related to "${prompt}"?`;
  return { reply, analysis };
}

/* Simple local analyze (rule-based) */
function simpleAnalyze(text){
  const cleaned = text.replace(/\s+/g," ").trim();
  const fillers = (cleaned.match(/\b(um|uh|like|you know)\b/gi) || []).length;

  const fixes=[];
  if(/\bI am go\b/i.test(cleaned)) fixes.push({wrong:"I am go",correct:"I am going",uz:"Present Continuous — hozirgi harakat uchun 'going' ishlatiladi."});
  if(/\bShe have\b/i.test(cleaned)) fixes.push({wrong:"She have",correct:"She has",uz:"3‑shaxs birlikda 'has' ishlatiladi."});
  if(/\bHe don'?t\b/i.test(cleaned)) fixes.push({wrong:"He don't",correct:"He doesn't",uz:"3‑shaxsda 'doesn't' ishlatiladi."});
  if(/\bthe people is\b/i.test(cleaned)) fixes.push({wrong:"the people is",correct:"people are",uz:"'people' ko‘plik."});

  const pronTips=[];
  if(/\b(th|three|think|thank)\b/i.test(cleaned)) pronTips.push("‘th’ tovushi: tilni tishlar orasiga qo‘yib yumshoq chiqarish.");
  if(/\b(see|need|week)\b/i.test(cleaned)) pronTips.push("Uzun ‘ee’ [iː]: tovushni cho‘zib ayting.");
  if(/\b(world|girl)\b/i.test(cleaned)) pronTips.push("‘r’ tovushini yumshoq ayting, og‘izni ortiqcha cho‘zmang.");

  const fluencyScore = Math.max(50, 92 - fillers*6);
  const grammarScore = Math.max(55, 95 - fixes.length*12);
  const overall = Math.round((fluencyScore + grammarScore)/2);

  return { fixes, pronTips, fillers, fluencyScore, grammarScore, overall };
}

/* Charts */
function initCharts(){
  const ctx = document.getElementById("weeklyChart");
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
      datasets: [{
        label: 'XP',
        data: [10, 20, 45, 60, 70, 90, 100],
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74,144,226,.15)',
        tension: .3
      }]
    },
    options: {
      plugins:{legend:{display:false}},
      scales:{y:{beginAtZero:true}}
    }
  });

  const ctx2 = document.getElementById("adminChart");
  if (!ctx2) return;
  new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: ["Hobbies","Routine","Travel","Education","Tech","Env"],
      datasets: [{
        label: 'Popularity',
        data: [32, 28, 40, 22, 35, 27],
        backgroundColor: '#7ED321'
      }]
    },
    options: {
      plugins:{legend:{display:false}},
      scales:{y:{beginAtZero:true}}
    }
  });

  // Admin lists (mock + filters)
  renderAdminUsers();
  renderAdminTopics();
}
function renderAdminUsers(){
  const box = document.getElementById("adminUsers");
  const users = [
    {email:"aziza@example.com", plan:"PREMIUM", tg:"@aziza", phone:"+998 99 111 22 33"},
    {email:"javlon@example.com", plan:"FREE", tg:"@javlon", phone:"+998 90 222 33 44"},
    {email:"nilufar@example.com", plan:"PREMIUM", tg:"@nilufar", phone:"+998 93 333 44 55"}
  ];
  const qEl = document.getElementById("searchUser");
  const fEl = document.getElementById("filterPlan");
  function draw(){
    const q = (qEl.value||"").toLowerCase();
    const f = fEl.value;
    const list = users.filter(u => {
      const okQ = !q || [u.email,u.tg,u.phone].some(s=>s.toLowerCase().includes(q));
      const okF = f==="all" || u.plan===f;
      return okQ && okF;
    });
    box.innerHTML = list.map(u=>`<div class="prompt-box"><strong>${u.email}</strong> — ${u.plan} — ${u.tg} — ${u.phone}</div>`).join("");
  }
  qEl.addEventListener("input", draw);
  fEl.addEventListener("change", draw);
  draw();
}
function renderAdminTopics(){
  const box = document.getElementById("adminTopics");
  const qEl = document.getElementById("searchTopic");
  const fEl = document.getElementById("filterTop");
  const list = topics.map(t=>({title:t.title, count: Math.floor(Math.random()*50)+10}));
  function draw(){
    const q = (qEl.value||"").toLowerCase();
    const f = fEl.value;
    const arr = list.filter(it => (!q || it.title.toLowerCase().includes(q)) && (f==="all" || it.count>=35));
    box.innerHTML = arr.map(it=>`<div class="prompt-box"><strong>${it.title}</strong> — ${it.count} sessions</div>`).join("");
  }
  qEl.addEventListener("input", draw);
  fEl.addEventListener("change", draw);
  draw();
}

/* Utils */
function escapeHtml(str){
  return String(str||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
