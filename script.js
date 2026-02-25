window.onload = () => {
    startLoader();
    initGrid();
    switchTab('profile');
};

/* ── LOADER ─────────────────────────────────────────── */
function startLoader() {
    let progress = 0;
    const bar     = document.getElementById('load-progress');
    const loader  = document.getElementById('loader');
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 600);
            }, 300);
        }
        if (bar) bar.style.width = progress + '%';
    }, 30);
}

/* ── GRID CANVAS ─────────────────────────────────────── */
const canvas = document.getElementById('gridCanvas');
const ctx    = canvas ? canvas.getContext('2d') : null;

let mouse       = { x: -300, y: -300 };
let rafPending  = false;
let dots        = [];
const SPACING   = 40;
const RIPPLES   = []; // { x, y, t }

function buildDots() {
    dots = [];
    for (let x = 0; x < canvas.width; x += SPACING) {
        for (let y = 0; y < canvas.height; y += SPACING) {
            dots.push({ x, y, base: Math.random() * 0.04 });
        }
    }
}

function initGrid() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildDots();
    requestAnimationFrame(animateGrid);
}

/* Throttled mousemove — only trigger a redraw once per frame */
window.addEventListener('mousemove', (e) => {
    const container = document.querySelector('.container');
    if (container && !container.contains(e.target)) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    } else {
        mouse.x = -300;
        mouse.y = -300;
    }
});

/* Click ripple on canvas area */
window.addEventListener('click', (e) => {
    const container = document.querySelector('.container');
    if (container && !container.contains(e.target)) {
        RIPPLES.push({ x: e.clientX, y: e.clientY, t: 0 });
    }
});

window.addEventListener('resize', () => {
    initGrid();
});

let lastTime = 0;
function animateGrid(ts) {
    requestAnimationFrame(animateGrid);
    if (!ctx) return;

    const dt = ts - lastTime;
    if (dt < 16) return; // cap ~60fps
    lastTime = ts;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Age ripples
    for (let i = RIPPLES.length - 1; i >= 0; i--) {
        RIPPLES[i].t += dt * 0.003;
        if (RIPPLES[i].t > 1) RIPPLES.splice(i, 1);
    }

    for (const d of dots) {
        const dx   = d.x - mouse.x;
        const dy   = d.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let radius  = 1;
        let alpha   = d.base;

        // Cursor proximity glow
        if (dist < 180) {
            const t  = 1 - dist / 180;
            radius   = 1 + t * 2.5;
            alpha    = 0.05 + t * 0.55;
        }

        // Ripple effect
        for (const r of RIPPLES) {
            const rdx  = d.x - r.x;
            const rdy  = d.y - r.y;
            const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
            const wave  = r.t * 400; // expanding radius
            const band  = 40;
            const diff  = Math.abs(rdist - wave);
            if (diff < band) {
                const strength = (1 - diff / band) * (1 - r.t) * 0.6;
                alpha   = Math.max(alpha, strength);
                radius  = Math.max(radius, 1 + strength * 2);
            }
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);

        if (alpha > 0.15) {
            ctx.fillStyle = `rgba(124, 111, 247, ${alpha})`;
        } else {
            ctx.fillStyle = `rgba(124, 111, 247, ${alpha * 0.4})`;
        }
        ctx.fill();
    }
}

/* ── TABS ────────────────────────────────────────────── */
function switchTab(tabId) {
    document.querySelectorAll('.content-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const targetTab = document.getElementById('tab-' + tabId);
    const targetBtn = document.getElementById('nav-' + tabId);

    if (targetTab) targetTab.classList.add('active');
    if (targetBtn) targetBtn.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}


/* ── CHAT OVERLAY ────────────────────────────────────── */

// ▼▼▼ PASTE YOUR CLOUDFLARE WORKER URL HERE ▼▼▼
const WORKER_URL = 'https://suvambot.mondal-suvam3.workers.dev';

const overlay       = document.getElementById('chat-overlay');
const face          = document.getElementById('face');
const messagesEl    = document.getElementById('chat-messages');
const inputEl       = document.getElementById('chat-input');
const sendBtn       = document.getElementById('chat-send');
const suggestionsEl = document.getElementById('chat-suggestions');

let chatHistory  = [];
let talkTimer    = null;
let chatGreeted  = false;

function openChat() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (!chatGreeted) {
        chatGreeted = true;
        setTimeout(() => {
            addMsg("Hey! 👋 I'm Suvam's AI. Ask me anything about his experience, skills, or whether he's open to new opportunities!", 'bot');
            setFace('talking');
            talkTimer = setTimeout(() => setFace('happy'), 2800);
            setTimeout(() => setFace(null), 4000);
        }, 400);
    }
    setTimeout(() => inputEl.focus(), 500);
}

function closeChat() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
}

// Close on Escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeChat();
});

/* Face states */
function setFace(state) {
    face.classList.remove('talking', 'thinking', 'happy');
    if (state) face.classList.add(state);
}

/* Messages */
function addMsg(text, role) {
    const el = document.createElement('div');
    el.className = `msg ${role}`;
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showTyping() {
    const el = document.createElement('div');
    el.className = 'msg-typing'; el.id = 'typing-ind';
    el.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function hideTyping() {
    const t = document.getElementById('typing-ind');
    if (t) t.remove();
}

/* Send */
async function sendMessage(text) {
    if (!text.trim()) return;

    if (WORKER_URL === 'YOUR_WORKER_URL') {
        addMsg("⚙️ Chat isn't connected yet — deploy the Cloudflare Worker and update WORKER_URL in script.js!", 'bot');
        setFace('thinking');
        setTimeout(() => setFace(null), 2000);
        return;
    }

    addMsg(text, 'user');
    suggestionsEl.style.display = 'none';
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
            addMsg("Something went wrong — try again in a moment!", 'bot');
            chatHistory.pop();
            setFace(null);
        } else {
            const reply = data.content[0].text;
            chatHistory.push({ role: 'assistant', content: reply });
            addMsg(reply, 'bot');
            const talkMs = Math.min(500 + reply.length * 28, 6000);
            setFace('talking');
            clearTimeout(talkTimer);
            talkTimer = setTimeout(() => setFace('happy'), talkMs);
            setTimeout(() => setFace(null), talkMs + 1200);
        }
    } catch {
        hideTyping();
        addMsg("Network error — check your connection and try again.", 'bot');
        chatHistory.pop();
        setFace(null);
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
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const v = inputEl.value.trim();
        if (!v) return;
        inputEl.value = '';
        sendMessage(v);
    }
});

document.querySelectorAll('.suggestion-chip').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.textContent));
});
