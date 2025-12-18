let progress = 0;
let weeklyLimit = 3;
let used = 0;

async function sendMessage() {
    if (used >= weeklyLimit) {
        alert("Sizning haftalik limitingiz tugadi. Premiumga o'ting.");
        return;
    }

    const input = document.getElementById("userInput").value;
    if (!input) return;

    used++;

    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML += `<p><b>You:</b> ${input}</p>`;

    const res = await fetch("http://localhost:3000/ai", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ text: input })
    });

    const data = await res.json();

    chatBox.innerHTML += `<p><b>AI:</b> ${data.reply}</p>`;
    chatBox.innerHTML += `<p style='color:red'><b>Mistakes:</b> ${data.mistakes}</p>`;

    progress += 20;
    if (progress > 100) progress = 100;

    document.getElementById("progressBar").value = progress;
    document.getElementById("progressText").innerText = `Progress: ${progress}%`;

    document.getElementById("userInput").value = "";
}

// 🎤 Voice Input
function startVoice() {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (e) => {
        document.getElementById("userInput").value = e.results[0][0].transcript;
    };
    recognition.start();
}

// 🔊 AI Voice
function speakAI() {
    let text = document.getElementById("chatBox").innerText;
    let speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speechSynthesis.speak(speech);
}
