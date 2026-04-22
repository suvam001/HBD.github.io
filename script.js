const WORKER_URL = 'https://suvambot.mondal-suvam3.workers.dev';

// ── PAGE NAVIGATION ──
let currentPage = 'home';

function setActiveNav(name) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('nav-' + name);
    if (btn) btn.classList.add('active');
}

function openPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + name);
    if(target) {
        target.classList.add('active');
        currentPage = name;
        setActiveNav(name);
        const content = target.querySelector('.inner-content');
        if(content) content.scrollTop = 0;
        renderChips(name);
    }
}

// ── CHATBOT WIDGET LOGIC ──
const chatWindow = document.getElementById('chat-window');
function toggleChat() {
    if (chatWindow) {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            document.getElementById('chat-input').focus();
        }
    }
}

// ── LOADER ──
(function() {
    let p = 0;
    const bar = document.getElementById('loader-bar');
    const loader = document.getElementById('loader');
    const t = setInterval(() => {
        p += Math.floor(Math.random() * 15) + 5;
        if (p >= 100) {
            p = 100; clearInterval(t);
            setTimeout(() => {
                if (loader) loader.style.opacity = '0';
                setTimeout(() => { if (loader) loader.style.display = 'none'; }, 500);
            }, 200);
        }
        if(bar) bar.style.width = p + '%';
    }, 30);
})();

// ── CHAT CORE ──
const messagesEl    = document.getElementById('chat-messages');
const inputEl       = document.getElementById('chat-input');
const sendBtn       = document.getElementById('chat-send');
const chipsEl       = document.getElementById('chips');
let chatHistory     = [];
let greeted         = false;

const contextualPrompts = {
    home: ["What is your tech stack?", "Are you open to work?", "Recent project highlights?"],
    experience: ["Tell me about Globus Systems", "What did you do at Clarivate?", "Any leadership roles?"],
    skills: ["How good is your SQL?", "Show me Power BI examples", "Python automation details"],
    contact: ["How quickly do you respond?", "Are you open to relocation?"]
};

function renderChips(pageName) {
    if (!chipsEl) return;
    chipsEl.innerHTML = '';
    const prompts = contextualPrompts[pageName] || contextualPrompts['home'];
    prompts.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'chip';
        btn.textContent = p;
        btn.onclick = () => sendMessage(p);
        chipsEl.appendChild(btn);
    });
}

function addMsg(text, role, isStreaming = false) {
    if (!messagesEl) return;
    const el = document.createElement('div');
    el.className = 'msg ' + role;
    messagesEl.appendChild(el);

    if (role === 'bot' && isStreaming) {
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                i = Math.min(i + 3, text.length);
                el.innerHTML = window.marked ? marked.parse(text.substring(0, i)) : text.substring(0, i);
                messagesEl.scrollTop = messagesEl.scrollHeight;
            } else {
                clearInterval(interval);
                messagesEl.scrollTop = messagesEl.scrollHeight;
            }
        }, 20);
    } else {
        el.innerHTML = window.marked && role === 'bot' ? marked.parse(text) : text;
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }
}

async function sendMessage(text) {
    if (!text.trim()) return;
    addMsg(text, 'user');
    inputEl.value = '';
    
    chatHistory.push({ role: 'user', content: text });

    try {
        const res = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: chatHistory }),
        });
        const data = await res.json();
        const reply = data.content[0].text;
        chatHistory.push({ role: 'assistant', content: reply });
        addMsg(reply, 'bot', true);
    } catch (err) {
        addMsg("Connection error. Please try again.", 'bot');
    }
}

if(sendBtn) sendBtn.onclick = () => sendMessage(inputEl.value);
if(inputEl) {
    inputEl.onkeydown = e => { if(e.key === 'Enter') sendMessage(inputEl.value); };
}

// Initial state
renderChips('home');
setTimeout(() => {
    if (!greeted) {
        greeted = true;
        addMsg("Hello! I'm Suvam's AI assistant. How can I help you today?", 'bot');
    }
}, 1000);

// ── BACKGROUND (Optional subtle dust) ──
const canvas = document.getElementById('bg-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
if (canvas && ctx) {
    let particles = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.onresize = resize;
    resize();
    for(let i=0; i<30; i++) particles.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height, s:Math.random()*2});
    function anim() {
        ctx.clearRect(0,0,canvas.width, canvas.height);
        ctx.fillStyle = "#c96442"; ctx.globalAlpha = 0.2;
        particles.forEach(p => {
            p.y -= 0.2; if(p.y < 0) p.y = canvas.height;
            ctx.fillRect(p.x, p.y, p.s, p.s);
        });
        requestAnimationFrame(anim);
    }
    anim();
}