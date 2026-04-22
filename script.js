const WORKER_URL = 'https://suvambot.mondal-suvam3.workers.dev';

// ── DARK MODE ──
const themeToggle = document.getElementById('theme-toggle');
const iconMoon    = document.getElementById('icon-moon');
const iconSun     = document.getElementById('icon-sun');

// Restore saved preference
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    if(iconMoon) iconMoon.style.display = 'none';
    if(iconSun) iconSun.style.display  = 'block';
}

if(themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark');
        if(iconMoon) iconMoon.style.display = isDark ? 'none'  : 'block';
        if(iconSun) iconSun.style.display  = isDark ? 'block' : 'none';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

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
                if (loader) loader.style.opacity = '0';
                setTimeout(() => { if (loader) loader.style.display = 'none'; }, 500);
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
    // Hide all pages first
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    const target = document.getElementById('page-' + name);
    if(target) {
        target.classList.add('active');
        currentPage = name;
        setActiveNav(name);
        
        // Scroll target content to top
        const content = target.querySelector('.inner-content');
        if(content) content.scrollTop = 0;
        
        // Render contextual chips
        renderChips(name);
    }
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

const contextualPrompts = {
    home: ["01_TECH_STACK", "02_OPEN_TO_WORK", "03_GLOBUS_SYSTEMS"],
    experience: ["01_GLOBUS_AI_AUTOMATION", "02_CLARIVATE_METRICS", "03_GOLDMAN_SACHS"],
    skills: ["01_DATA_SCIENCE_PG", "02_SQL_EXPERTISE", "03_CLAUDE_AI_FLOWS"],
    contact: ["01_RESPONSE_TIME", "02_RELOCATION_STATUS"]
};

function renderChips(pageName) {
    if (!chipsEl) return;
    chipsEl.innerHTML = '';
    const prompts = contextualPrompts[pageName] || contextualPrompts['home'];
    prompts.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'chip';
        btn.textContent = p;
        btn.addEventListener('click', () => {
            if (btn.id !== 'clear-chat') sendMessage(btn.textContent);
        });
        chipsEl.appendChild(btn);
    });
}

// Initial render
renderChips('home');

// Delayed greeting
setTimeout(() => {
    if (!greeted) {
        greeted = true;
        addMsg("Hey! 👋 Ask me anything about Suvam's experience, skills, or if he's open to work.", 'system');
    }
}, 800);

function addMsg(text, role, isStreaming = false) {
    if (!messagesEl) return;
    
    const el = document.createElement('div');
    el.className = 'msg ' + role;
    
    if (role === 'bot' && isStreaming) {
        el.classList.add('typing');
        messagesEl.appendChild(el);
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                // Stream 2 characters at a time for smoother markdown rendering
                i = Math.min(i + 2, text.length);
                const currentText = text.substring(0, i);
                el.innerHTML = window.marked ? marked.parse(currentText) : currentText.replace(/\n/g, '<br>');
                messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'auto' });
            } else {
                clearInterval(interval);
                el.classList.remove('typing');
                messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
                
                // Add a small "Clear Chat" button if it's the first bot message
                if (chatHistory.length === 2 && !document.getElementById('clear-chat')) {
                    addClearChatBtn();
                }
            }
        }, 15);
    } else {
        if (role === 'bot') {
            el.innerHTML = window.marked ? marked.parse(text) : text.replace(/\n/g, '<br>');
        } else {
            el.textContent = text;
        }
        messagesEl.appendChild(el);
        messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
    }
}

function addClearChatBtn() {
    if (document.getElementById('clear-chat')) return;
    const btn = document.createElement('button');
    btn.id = 'clear-chat';
    btn.className = 'chip';
    btn.style.marginTop = '10px';
    btn.textContent = 'Clear Chat';
    btn.onclick = clearChat;
    messagesEl.appendChild(btn);
}

function clearChat() {
    chatHistory = [];
    if(messagesEl) messagesEl.innerHTML = '';
    if(chipsEl) chipsEl.style.display = 'flex';
    greeted = false;
    setTimeout(() => {
        if (!greeted) {
            greeted = true;
            addMsg("Chat cleared. What else would you like to know? 😊", 'system');
        }
    }, 400);
}

function showTyping() {
    if (!messagesEl) return;
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

    addMsg(text, 'user');
    if(chipsEl) chipsEl.style.display = 'none';
    if(sendBtn) sendBtn.disabled = true;
    showTyping();

    chatHistory.push({ role: 'user', content: text });

    try {
        const res  = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: chatHistory }),
        });
        
        if (!res.ok) throw new Error('Network response was not ok');
        
        const data = await res.json();
        hideTyping();

        if (data.error) {
            addMsg("Message failed to send. Please try again.", 'bot');
            chatHistory.pop(); 
        } else {
            const reply = data.content[0].text;
            chatHistory.push({ role: 'assistant', content: reply });
            addMsg(reply, 'bot', true);
        }
    } catch (err) {
        hideTyping();
        addMsg("Connection error. Please try again later.", 'bot');
        chatHistory.pop(); 
        console.error('Chat error:', err);
    }

    if(sendBtn) sendBtn.disabled = false;
    if(inputEl) inputEl.focus();
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
    b.addEventListener('click', () => {
        if (b.id !== 'clear-chat') sendMessage(b.textContent);
    });
});

// ── INTERACTIVE BACKGROUND PARTICLES ──
const canvas = document.getElementById('bg-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let particles = [];
let mouse = { x: -100, y: -100 };

if (canvas && ctx) {
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    };

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.5; // Smaller dust
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.3 + 0.1;
            this.color = Math.random() > 0.5 ? '#007aff' : '#ffffff';
            this.popping = false;
        }
        update() {
            if (this.popping) {
                this.size += 1;
                this.opacity -= 0.05;
                if (this.opacity <= 0) this.reset();
                return;
            }

            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;

            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
                const angle = Math.atan2(dy, dx);
                const force = (80 - dist) / 80;
                this.x += Math.cos(angle) * force * 3;
                this.y += Math.sin(angle) * force * 3;
            }
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    const initParticles = () => {
        particles = [];
        const count = Math.floor((canvas.width * canvas.height) / 8000); // Denser
        for (let i = 0; i < Math.min(count, 150); i++) {
            particles.push(new Particle());
        }
    };

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('click', e => {
        particles.forEach(p => {
            const dx = p.x - e.clientX;
            const dy = p.y - e.clientY;
            if (Math.sqrt(dx * dx + dy * dy) < 30) {
                p.popping = true;
            }
        });
    });
    
    window.addEventListener('touchmove', e => {
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    });

    resize();
    animate();
}