function sendMessage(){
  const input = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");

  if(input.value.trim()==="") return;

  // USER MESSAGE
  const userMsg = document.createElement("div");
  userMsg.className = "user-msg";
  userMsg.textContent = input.value;
  chatBox.appendChild(userMsg);

  const userText = input.value;
  input.value = "";

  chatBox.scrollTop = chatBox.scrollHeight;

  // AI TYPING...
  setTimeout(()=>{
    const aiMsg = document.createElement("div");
    aiMsg.className = "ai-msg";

    aiMsg.textContent = generateAIResponse(userText);
    chatBox.appendChild(aiMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
  },1000);
}

function generateAIResponse(text){
  if(text.toLowerCase().includes("hello"))
    return "Hello! How are you today?";
  if(text.toLowerCase().includes("grammar"))
    return "Try to speak in full sentences. I will help you correct mistakes.";
  return "Good attempt! Try to explain it in more detail.";
}
