/* DIAZ Chatbot — vanilla JS */
(function () {
  "use strict";

  const chatEl = document.getElementById("chat");
  const inputEl = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const clearBtn = document.getElementById("clearBtn");

  const STORAGE_KEY = "diaz_chat_history_v1";

  // 30+ predefined response rules (keyword -> replies[])
  const RULES = [
    { keys: ["hi", "hello", "hey", "hola"], replies: ["Hey there! 👋 I'm DIAZ. How can I help?", "Hello! What can I do for you today?"] },
    { keys: ["good morning"], replies: ["Good morning! ☀️ Ready when you are."] },
    { keys: ["good night"], replies: ["Good night! 🌙 Sleep well."] },
    { keys: ["how are you", "how r u"], replies: ["I'm running smoothly — thanks for asking! How about you?"] },
    { keys: ["your name", "who are you", "what are you"], replies: ["I'm DIAZ, a lightweight AI chatbot built with HTML, CSS, and JavaScript."] },
    { keys: ["who made you", "who created you", "creator"], replies: ["I was built for a CodeAlpha internship project. ✨"] },
    { keys: ["help", "what can you do"], replies: ["I can chat, answer simple questions, tell jokes, share the time and date, and more. Try asking 'tell me a joke'."] },
    { keys: ["time"], replies: [() => `It's ${new Date().toLocaleTimeString()} on my clock.`] },
    { keys: ["date", "day"], replies: [() => `Today is ${new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`] },
    { keys: ["weather"], replies: ["I can't check live weather yet, but it always looks bright inside this chat. ☀️"] },
    { keys: ["joke", "funny"], replies: [
      "Why don't programmers like nature? It has too many bugs. 🐛",
      "I told my computer I needed a break — it said 'No problem, I'll go to sleep.' 😴",
      "Why did the developer go broke? Because he used up all his cache. 💸"
    ]},
    { keys: ["quote", "motivate", "inspire"], replies: [
      "“Stay hungry, stay foolish.” — Steve Jobs",
      "“The only way to do great work is to love what you do.” — Steve Jobs",
      "“Simplicity is the ultimate sophistication.” — Leonardo da Vinci"
    ]},
    { keys: ["thanks", "thank you", "thx"], replies: ["You're welcome! 😊", "Anytime!"] },
    { keys: ["bye", "goodbye", "see you"], replies: ["Goodbye! Come back soon. 👋", "See you later!"] },
    { keys: ["love"], replies: ["Love is a beautiful thing. ❤️"] },
    { keys: ["sad", "depressed", "unhappy"], replies: ["I'm sorry to hear that. Remember — tough times pass. 💙"] },
    { keys: ["happy"], replies: ["That's wonderful to hear! 🎉"] },
    { keys: ["age", "how old"], replies: ["I'm timeless — I was born the moment you opened this page."] },
    { keys: ["language", "languages"], replies: ["I think in JavaScript, but I speak plain English. 🌐"] },
    { keys: ["html"], replies: ["HTML structures the web — every page starts with it."] },
    { keys: ["css"], replies: ["CSS is what makes the web beautiful. 🎨"] },
    { keys: ["javascript", "js"], replies: ["JavaScript brings web pages to life. ⚡"] },
    { keys: ["python"], replies: ["Python is clean, readable, and great for AI and data work. 🐍"] },
    { keys: ["ai", "artificial intelligence"], replies: ["AI is the science of making machines that can think and learn."] },
    { keys: ["codealpha"], replies: ["CodeAlpha offers internships that help students gain real-world coding experience. 🚀"] },
    { keys: ["internship"], replies: ["Internships are a great way to learn by doing — keep building! 💼"] },
    { keys: ["project"], replies: ["This DIAZ chatbot is itself a fun project — feel free to extend it!"] },
    { keys: ["food", "hungry"], replies: ["I don't eat, but I hear pizza solves most problems. 🍕"] },
    { keys: ["music", "song"], replies: ["Music makes everything better. What genre are you into?"] },
    { keys: ["movie", "film"], replies: ["Got any favorites? I keep hearing good things about Interstellar."] },
    { keys: ["game", "games"], replies: ["Games are great for unwinding. What do you play?"] },
    { keys: ["sport", "football", "cricket"], replies: ["Sports keep the body and mind sharp! 🏏⚽"] },
    { keys: ["news"], replies: ["I can't fetch live news, but staying informed is always a good idea. 📰"] },
    { keys: ["color", "favorite color"], replies: ["I'm partial to cyan — matches my vibe. 💎"] },
    { keys: ["yes", "yeah", "yep"], replies: ["Great! 👍", "Awesome."] },
    { keys: ["no", "nope"], replies: ["No worries. 🙂", "Okay, let me know what you need."] },
    { keys: ["okay", "ok"], replies: ["👍", "Sounds good."] }
  ];

  const FALLBACKS = [
    "Interesting — tell me more.",
    "I'm still learning. Could you rephrase that?",
    "Hmm, I don't fully get that yet, but I'm listening.",
    "Could you share a bit more detail?",
    "That's a great question — let's explore it together."
  ];

  function pick(arr) {
    const v = arr[Math.floor(Math.random() * arr.length)];
    return typeof v === "function" ? v() : v;
  }

  function getReply(text) {
    const t = text.toLowerCase();
    for (const rule of RULES) {
      if (rule.keys.some((k) => t.includes(k))) return pick(rule.replies);
    }
    return pick(FALLBACKS);
  }

  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function appendMessage(role, text, save = true) {
    const wrap = document.createElement("div");
    wrap.className = `message ${role}`;
    wrap.innerHTML =
      role === "bot"
        ? `<div class="avatar">D</div><div class="bubble">${escapeHTML(text)}</div>`
        : `<div class="bubble">${escapeHTML(text)}</div>`;
    chatEl.appendChild(wrap);
    scrollToBottom();
    if (save) saveMessage(role, text);
  }

  function showTyping() {
    const wrap = document.createElement("div");
    wrap.className = "message bot";
    wrap.id = "typing-indicator";
    wrap.innerHTML = `<div class="avatar">D</div><div class="bubble"><span class="typing"><span></span><span></span><span></span></span></div>`;
    chatEl.appendChild(wrap);
    scrollToBottom();
  }

  function removeTyping() {
    const el = document.getElementById("typing-indicator");
    if (el) el.remove();
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatEl.scrollTop = chatEl.scrollHeight;
    });
  }

  function saveMessage(role, text) {
    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      history.push({ role, text, t: Date.now() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-100)));
    } catch (_) {}
  }

  function loadHistory() {
    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!history.length) return;
      chatEl.innerHTML = "";
      history.forEach((m) => appendMessage(m.role, m.text, false));
    } catch (_) {}
  }

  function send() {
    const text = inputEl.value.trim();
    if (!text) return;
    appendMessage("user", text);
    inputEl.value = "";
    inputEl.focus();
    showTyping();
    const delay = 500 + Math.random() * 700;
    setTimeout(() => {
      removeTyping();
      appendMessage("bot", getReply(text));
    }, delay);
  }

  function clearChat() {
    localStorage.removeItem(STORAGE_KEY);
    chatEl.innerHTML = "";
    appendMessage("bot", "Chat cleared. Let's start fresh — what's on your mind?", true);
  }

 alert("Script Loaded");
  sendBtn.addEventListener("click", send);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
  clearBtn.addEventListener("click", clearChat);

  loadHistory();
  inputEl.focus();
})();

