const WORKER_URL = 'https://suvambot.mondal-suvam3.workers.dev';

// ── DARK MODE ──
const themeToggle = document.getElementById('theme-toggle');
const iconMoon    = document.getElementById('icon-moon');
const iconSun     = document.getElementById('icon-sun');

// Restore saved preference
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    iconMoon.style.display = 'none';
    iconSun.style.display  = 'block';
}

themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    iconMoon.style.display = isDark ? 'none'  : 'block';
    iconSun.style.display  = isDark ? 'block' : 'none';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// ── CUSTOM CURSOR ──
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
});

// Ring follows with lag
(function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
})();

// Hover state on interactive elements
document.querySelectorAll('a, button, input, .chip, .nav-item, .avatar-hover-container, .tech-skill-card, .soft-skill-pill, .domain-tag').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

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
        if(bar) bar.style.width = p + '%';
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
    // Hide inner pages
    ['experience','skills','education'].forEach(p => {
        const page = document.getElementById('page-' + p);
        if(page) page.classList.remove('active');
    });
    const target = document.getElementById('page-' + name);
    if(target) target.classList.add('active');
    currentPage = name;
    setActiveNav(name);
}

function goHome() {
    ['experience','skills','education'].forEach(p => {
        const page = document.getElementById('page-' + p);
        if(page) page.classList.remove('active');
    });
    currentPage = 'home';
    setActiveNav('home');
}

function closePage(name) {
    goHome();
}

// Set home as active on load
setActiveNav('home');

// ── CHAT ──
const messagesEl    = document.getElementById('chat-messages');
const inputEl       = document.getElementById('chat-input');
const sendBtn       = document.getElementById('chat-send');
const chipsEl       = document.getElementById('chips');
let chatHistory     = [];
let greeted         = false;

// Delayed greeting
setTimeout(() => {
    if (!greeted) {
        greeted = true;
        addMsg("Hey! 👋 Ask me anything about Suvam's experience, skills, or if he's open to work.", 'bot');
    }
}, 800);

function addMsg(text, role) {
    const el = document.createElement('div');
    el.className = 'msg ' + role;
    if (role === 'bot') {
        el.innerHTML = text.replace(/\n/g, '<br>');
    } else {
        el.textContent = text;
    }
    messagesEl.appendChild(el);
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
}

function showTyping() {
    const el = document.createElement('div');
    el.className = 'msg-typing'; el.id = 'typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(el);
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
}

function hideTyping() {
    const t = document.getElementById('typing');
    if (t) t.remove();
}

async function sendMessage(text) {
    if (!text.trim()) return;

    if (WORKER_URL === 'YOUR_WORKER_URL') {
        addMsg("⚙️ Cloudflare Worker URL is not configured.", 'bot');
        return;
    }

    addMsg(text, 'user');
    if(chipsEl) chipsEl.style.display = 'none';
    sendBtn.disabled = true;
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
            addMsg("Message failed to send. Please try again.", 'bot');
            chatHistory.pop(); 
        } else {
            const reply = data.content[0].text;
            chatHistory.push({ role: 'assistant', content: reply });
            addMsg(reply, 'bot');
        }
    } catch {
        hideTyping();
        addMsg("Network error. Please check your connection.", 'bot');
        chatHistory.pop(); 
    }

    sendBtn.disabled = false;
    inputEl.focus();
}

if(sendBtn) {
    sendBtn.addEventListener('click', () => {
        const v = inputEl.value.trim();
        if (!v) return;
        inputEl.value = '';
        sendMessage(v);
    });
}
if(inputEl) {
    inputEl.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const v = inputEl.value.trim();
            if (!v) return;
            inputEl.value = '';
            sendMessage(v);
        }
    });
}
document.querySelectorAll('.chip').forEach(b => {
    b.addEventListener('click', () => sendMessage(b.textContent));
});