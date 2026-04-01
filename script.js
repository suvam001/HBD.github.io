const WORKER_URL = 'https://suvambot.mondal-suvam3.workers.dev';

// ── PAGE NAVIGATION ──
let currentPage = 'home';

function setActiveNav(name) {
    document.querySelectorAll('.cli-nav-item').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('nav-' + name);
    if (btn) btn.classList.add('active');
}

function openPage(name) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Show target page
    const target = document.getElementById('page-' + name);
    if(target) target.classList.add('active');
    
    currentPage = name;
    setActiveNav(name);
}

// ── CHAT ──
const messagesEl    = document.getElementById('chat-messages');
const inputEl       = document.getElementById('chat-input');
const sendBtn       = document.getElementById('chat-send');
let chatHistory     = [];
let greeted         = false;

// Delayed greeting
setTimeout(() => {
    if (!greeted) {
        greeted = true;
        addMsg("Terminal session established. Type a command or ask me about Suvam.", 'system');
    }
}, 500);

function addMsg(text, role, isStreaming = false) {
    const el = document.createElement('div');
    el.className = 'msg ' + role;
    
    if (role === 'bot' && isStreaming) {
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                el.innerHTML += text[i] === '\n' ? '<br>' : text[i];
                i++;
                messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'auto' });
            } else {
                clearInterval(interval);
            }
        }, 10);
    } else {
        el.innerHTML = text.replace(/\n/g, '<br>');
    }
    
    messagesEl.appendChild(el);
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
}

function showTyping() {
    const el = document.createElement('div');
    el.className = 'msg system'; el.id = 'typing';
    el.textContent = 'Processing...';
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
    inputEl.disabled = true;
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
            addMsg("Command failed. Please retry.", 'bot');
            chatHistory.pop(); 
        } else {
            const reply = data.content[0].text;
            chatHistory.push({ role: 'assistant', content: reply });
            addMsg(reply, 'bot', true);
        }
    } catch {
        hideTyping();
        addMsg("Network error. Link lost.", 'bot');
        chatHistory.pop(); 
    }

    inputEl.disabled = false;
    inputEl.value = '';
    inputEl.focus();
}

if(inputEl) {
    inputEl.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage(inputEl.value.trim());
        }
    });
}
