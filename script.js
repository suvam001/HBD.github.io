const WORKER_URL = 'https://suvambot.mondal-suvam3.workers.dev';

// ── LOADER ──
(function() {
    let p = 0;
    const bar = document.getElementById('loader-bar');
    const perc = document.getElementById('loader-perc');
    const loader = document.getElementById('loader');
    const status = document.querySelector('.loader-status');
    
    const t = setInterval(() => {
        p += Math.floor(Math.random() * 8) + 2;
        if (p >= 100) {
            p = 100; clearInterval(t);
            if (status) status.textContent = 'AGENT_READY';
            setTimeout(() => {
                if (loader) {
                    loader.classList.add('done');
                    // Completely remove after animation finishes (0.8s curtain + small buffer)
                    setTimeout(() => { loader.style.display = 'none'; }, 1000);
                }
            }, 300);
        }
        if(bar) bar.style.width = p + '%';
        if(perc) perc.textContent = p.toString().padStart(2, '0') + '%';
    }, 40);
})();

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

// ── CHAT CORE ──
const messagesEl    = document.getElementById('chat-messages');
const inputEl       = document.getElementById('chat-input');
const sendBtn       = document.getElementById('chat-send');
const chipsEl       = document.getElementById('chips');
let chatHistory     = [];
let greeted         = false;
let isThinking      = false;

const contextualPrompts = {
    home: ["01_TECH_STACK", "02_OPEN_TO_WORK", "03_AGENTIC_AI"],
    experience: ["01_GLOBUS_SYSTEMS", "02_CLARIVATE_ANALYTICS", "03_GOLDMAN_SACHS"],
    skills: ["01_SQL_EXPERTISE", "02_POWER_BI_DASHBOARDS", "03_CLAUDE_AUTOMATION"],
    contact: ["01_RESPONSE_TIME", "02_RELOCATION"]
};

function setChatBusy(busy) {
    isThinking = busy;
    if (inputEl) {
        inputEl.disabled = busy;
        inputEl.placeholder = busy ? "AI_THINKING..." : "Ask me anything...";
    }
    if (sendBtn) {
        sendBtn.disabled = busy;
        sendBtn.style.opacity = busy ? "0.5" : "1";
    }
}

function renderChips(pageName) {
    if (!chipsEl) return;
    chipsEl.innerHTML = '';
    const prompts = contextualPrompts[pageName] || contextualPrompts['home'];
    prompts.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'chip';
        btn.textContent = p;
        btn.onclick = () => {
            if (!isThinking) sendMessage(p);
        };
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
                setChatBusy(false);
            }
        }, 20);
    } else {
        el.innerHTML = window.marked && role === 'bot' ? marked.parse(text) : text;
        messagesEl.scrollTop = messagesEl.scrollHeight;
        if (role === 'bot' && !isStreaming) setChatBusy(false);
    }
}

async function sendMessage(text) {
    if (!text.trim() || isThinking) return;
    setChatBusy(true);
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
        addMsg("CONNECTION_ERROR // RETRY_LATER", 'bot');
        setChatBusy(false);
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
        addMsg("HELLO_WORLD // I_AM_SUVAMS_AI_ASSISTANT // HOW_CAN_I_HELP?", 'bot');
    }
}, 1200);

// ── BACKGROUND (AGENTIC DATA PACKETS) ──
const canvas = document.getElementById('bg-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
if (canvas && ctx) {
    let packets = [];
    const resize = () => { 
        canvas.width = window.innerWidth; 
        canvas.height = window.innerHeight; 
    };
    window.onresize = resize;
    resize();

    class Packet {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speed = Math.random() * 0.4 + 0.1;
            this.alpha = Math.random() * 0.2;
            this.pulse = Math.random() * 0.05;
        }
        update() {
            this.y -= this.speed;
            this.alpha += this.pulse;
            if (this.alpha > 0.3 || this.alpha < 0.05) this.pulse *= -1;
            if (this.y < -10) this.reset();
        }
        draw() {
            ctx.fillStyle = "#c96442";
            ctx.globalAlpha = this.alpha;
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    for(let i=0; i<50; i++) packets.push(new Packet());

    function animate() {
        ctx.clearRect(0,0,canvas.width, canvas.height);
        packets.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}