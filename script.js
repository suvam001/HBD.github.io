const WORKER_URL = 'https://suvambot.mondal-suvam3.workers.dev';

// ── LOADER ──
(function() {
    let p = 0;
    const bar = document.getElementById('loader-bar');
    const loader = document.getElementById('loader');
    const t = setInterval(() => {
        p += Math.floor(Math.random() * 12) + 5;
        if (p >= 100) {
            p = 100; clearInterval(t);
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 500);
            }, 200);
        }
        bar.style.width = p + '%';
    }, 30);
})();

// ── PAGE NAVIGATION ──
let currentPage = 'home';

function setActiveNav(name) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('nav-' + name);
    if (btn) btn.classList.add('active');
}

function openPage(name) {
    // hide all inner pages first
    ['experience','skills','education','profile'].forEach(p => {
        document.getElementById('page-' + p).classList.remove('active');
    });
    document.getElementById('page-' + name).classList.add('active');
    currentPage = name;
    setActiveNav(name);
}

function goHome() {
    ['experience','skills','education','profile'].forEach(p => {
        document.getElementById('page-' + p).classList.remove('active');
    });
    currentPage = 'home';
    setActiveNav('home');
}

function closePage(name) {
    goHome();
}

// Set home as active on load
setActiveNav('home');

// ── FACE ──
const face = document.getElementById('face');
let talkTimer = null;

function setFace(state) {
    face.classList.remove('talking', 'thinking', 'happy');
    if (state) face.classList.add(state);
}
function startTalking(ms) {
    setFace('talking');
    clearTimeout(talkTimer);
    talkTimer = setTimeout(() => setFace('happy'), ms);
    setTimeout(() => setFace(null), ms + 1200);
}

// ── CHAT ──
const messagesEl    = document.getElementById('chat-messages');
const inputEl       = document.getElementById('chat-input');
const sendBtn       = document.getElementById('chat-send');
const chipsEl       = document.getElementById('chips');
let chatHistory     = [];
let greeted         = false;

// Greeting on load
setTimeout(() => {
    if (!greeted) {
        greeted = true;
        addMsg("Hey! 👋 I'm Suvam's AI — ask me anything about his experience, skills, or whether he's open to work!", 'bot');
        startTalking(2800);
    }
}, 800);

function addMsg(text, role) {
    const el = document.createElement('div');
    el.className = 'msg ' + role;
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}
function showTyping() {
    const el = document.createElement('div');
    el.className = 'msg-typing'; el.id = 'typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}
function hideTyping() {
    const t = document.getElementById('typing');
    if (t) t.remove();
}

async function sendMessage(text) {
    if (!text.trim()) return;

    if (WORKER_URL === 'YOUR_WORKER_URL') {
        addMsg("⚙️ Almost there! Deploy the Cloudflare Worker and paste the URL into script.js.", 'bot');
        startTalking(2000);
        return;
    }

    addMsg(text, 'user');
    chipsEl.style.display = 'none';
    sendBtn.disabled = true;
    setFace('thinking');
    showTyping();

    chatHistory.push({ role: 'user', content: text });

    try {
        const res  = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: chatHistory }),
        });
        const data = await res.json();
        hideTyping();

        if (data.error) {
            addMsg("Something went wrong — try again!", 'bot');
            chatHistory.pop(); setFace(null);
        } else {
            const reply = data.content[0].text;
            chatHistory.push({ role: 'assistant', content: reply });
            addMsg(reply, 'bot');
            startTalking(Math.min(500 + reply.length * 28, 6000));
        }
    } catch {
        hideTyping();
        addMsg("Network error — check your connection and try again.", 'bot');
        chatHistory.pop(); setFace(null);
    }

    sendBtn.disabled = false;
}

sendBtn.addEventListener('click', () => {
    const v = inputEl.value.trim();
    if (!v) return;
    inputEl.value = '';
    sendMessage(v);
});
inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const v = inputEl.value.trim();
        if (!v) return;
        inputEl.value = '';
        sendMessage(v);
    }
});
document.querySelectorAll('.chip').forEach(b => {
    b.addEventListener('click', () => sendMessage(b.textContent));
});