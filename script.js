const WORKER_URL = 'https://suvambot.mondal-suvam3.workers.dev';
const STATUS_URL = 'https://suvam-status.mondal-suvam3.workers.dev';

// ── THEME (dark default, light toggle) ──
function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.querySelector('span').textContent = isLight ? '☀' : '☾';
}
(function initTheme() {
    if (localStorage.getItem('theme') === 'light') {
        document.documentElement.classList.add('light');
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.querySelector('span').textContent = '☀';
    }
})();

// ── CURSOR GLOW ──
(function () {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    let rafId;
    document.addEventListener('mousemove', e => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            document.documentElement.style.setProperty('--cx', e.clientX + 'px');
            document.documentElement.style.setProperty('--cy', e.clientY + 'px');
        });
    });
})();

// ── SCROLL PROGRESS ──
(function () {
    function updateScroll() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        document.documentElement.style.setProperty('--scroll-p', p);
    }
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
})();

// ── LOADER ──
(function () {
    let p = 0;
    const bar    = document.getElementById('loader-bar');
    const perc   = document.getElementById('loader-perc');
    const loader = document.getElementById('loader');
    const status = document.querySelector('.loader-status');
    const t = setInterval(() => {
        p += Math.floor(Math.random() * 7) + 2;
        if (p >= 100) {
            p = 100;
            clearInterval(t);
            if (status) status.textContent = 'Agent Ready';
            setTimeout(() => {
                if (loader) {
                    loader.classList.add('done');
                    document.body.classList.add('hero-loaded');
                    setTimeout(() => { loader.style.display = 'none'; }, 900);
                }
            }, 320);
        }
        if (bar)  bar.style.width = p + '%';
        if (perc) perc.textContent = p.toString().padStart(2, '0') + '%';
    }, 38);
})();

// ── HEADER NAME (reveal after hero name scrolls past) ──
(function () {
    const heroName = document.querySelector('.hero-name');
    const headerName = document.querySelector('.header-name');
    if (!heroName || !headerName) return;
    const obs = new IntersectionObserver(([entry]) => {
        headerName.classList.toggle('show', !entry.isIntersecting);
    }, { rootMargin: '-58px 0px 0px 0px', threshold: 0 });
    obs.observe(heroName);
})();

// ── SCROLL REVEAL ──
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.reveal, .reveal-item').forEach(el => revealObserver.observe(el));

// ── STATS COUNT-UP ──
(function () {
    const statsRow = document.querySelector('.stats-row');
    if (!statsRow) return;
    const counters = statsRow.querySelectorAll('[data-count]');
    let fired = false;
    const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting || fired) return;
        fired = true;
        obs.disconnect();
        counters.forEach(el => {
            const target = parseInt(el.dataset.count, 10);
            const suffix = el.dataset.suffix || '';
            const duration = 1100;
            let start = null;
            function step(ts) {
                if (!start) start = ts;
                const progress = Math.min((ts - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(eased * target) + suffix;
                if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        });
    }, { threshold: 0.5 });
    obs.observe(statsRow);
})();

// ── CHATBOT ──
const chatWindow = document.getElementById('chat-window');

function toggleChat() {
    if (chatWindow) {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            dismissPeek();
            const toggle = document.getElementById('chat-toggle');
            if (toggle) toggle.classList.remove('nudge');
            const input = document.getElementById('chat-input');
            if (input) input.focus();
        }
    }
}

// Open the chat (if closed) and send a prefilled question.
function openChatWith(text) {
    if (chatWindow && !chatWindow.classList.contains('active')) toggleChat();
    sendMessage(text);
}

const messagesEl = document.getElementById('chat-messages');
const inputEl    = document.getElementById('chat-input');
const sendBtn    = document.getElementById('chat-send');
const chipsEl    = document.getElementById('chips');

let chatHistory = [];
let greeted     = false;
let isThinking  = false;

const chatPrompts = [
    "What's your tech stack?",
    "Are you open to work?",
    "Tell me about your AI work",
    "How did you use Claude AI?",
];

function setChatBusy(busy) {
    isThinking = busy;
    if (inputEl) {
        inputEl.disabled = busy;
        inputEl.placeholder = busy ? 'AI is thinking…' : 'Ask me anything…';
    }
    if (sendBtn) {
        sendBtn.disabled = busy;
        sendBtn.style.opacity = busy ? '0.4' : '1';
    }
}

function renderChips() {
    if (!chipsEl) return;
    chipsEl.innerHTML = '';
    chatPrompts.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'chip';
        btn.textContent = p;
        btn.onclick = () => { if (!isThinking) sendMessage(p); };
        chipsEl.appendChild(btn);
    });
}

let typingEl = null;

function showTyping() {
    if (!messagesEl) return;
    typingEl = document.createElement('div');
    typingEl.className = 'msg bot';
    typingEl.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function hideTyping() {
    if (typingEl && typingEl.parentNode) {
        typingEl.parentNode.removeChild(typingEl);
        typingEl = null;
    }
}

function addMsg(text, role, isStreaming = false) {
    if (!messagesEl) return;
    const el = document.createElement('div');
    el.className = 'msg ' + role;
    messagesEl.appendChild(el);

    if (role === 'bot' && isStreaming) {
        let i = 0;
        const iv = setInterval(() => {
            if (i < text.length) {
                i = Math.min(i + 4, text.length);
                el.innerHTML = window.marked ? marked.parse(text.substring(0, i)) : text.substring(0, i);
                messagesEl.scrollTop = messagesEl.scrollHeight;
            } else {
                clearInterval(iv);
                messagesEl.scrollTop = messagesEl.scrollHeight;
                setChatBusy(false);
            }
        }, 15);
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
    if (inputEl) { inputEl.value = ''; inputEl.focus(); }
    chatHistory.push({ role: 'user', content: text });
    showTyping();

    try {
        const res = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: chatHistory }),
        });
        const data = await res.json();
        const reply = data.content[0].text;
        chatHistory.push({ role: 'assistant', content: reply });
        hideTyping();
        addMsg(reply, 'bot', true);
    } catch {
        chatHistory.pop();
        hideTyping();
        addMsg("Couldn't reach the AI — please try again.", 'bot');
        setChatBusy(false);
    }
}

if (sendBtn) sendBtn.onclick = () => sendMessage(inputEl.value);
if (inputEl) inputEl.onkeydown = e => { if (e.key === 'Enter') sendMessage(inputEl.value); };

renderChips();
setTimeout(() => {
    if (!greeted) {
        greeted = true;
        addMsg("Hey! 👋 I'm Suvam — ask me anything about my experience, projects, or whether I'm open to new roles.", 'bot');
    }
}, 1200);

// ── LIVE STATUS ──
async function fetchLiveStatus() {
    if (!STATUS_URL) return;
    try {
        const res = await fetch(STATUS_URL);
        const data = await res.json();
        const textEl = document.getElementById('live-status-text');
        const dotEl  = document.getElementById('live-dot');
        if (textEl && data.text) textEl.textContent = data.text;
        if (dotEl && data.type) {
            const colors = { available: '#4ade80', busy: '#facc15', offline: '#6e6c66' };
            dotEl.style.background = colors[data.type] || colors.available;
        }
    } catch { /* silently fail — status is a nice-to-have */ }
}
fetchLiveStatus();

// ── BACKGROUND CANVAS ──
const canvas = document.getElementById('bg-canvas');
const ctx    = canvas ? canvas.getContext('2d') : null;
if (canvas && ctx) {
    const resize = () => {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Packet {
        constructor() { this.reset(); }
        reset() {
            this.x     = Math.random() * canvas.width;
            this.y     = Math.random() * canvas.height;
            this.size  = Math.random() * 2 + 0.5;
            this.speed = Math.random() * 0.3 + 0.08;
            this.alpha = Math.random() * 0.2;
            this.pulse = Math.random() * 0.035;
        }
        update() {
            this.y -= this.speed;
            this.alpha += this.pulse;
            if (this.alpha > 0.3 || this.alpha < 0.04) this.pulse *= -1;
            if (this.y < -8) this.reset();
        }
        draw() {
            ctx.fillStyle  = '#c96442';
            ctx.globalAlpha = this.alpha;
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    const packets = Array.from({ length: 55 }, () => new Packet());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        packets.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
}

// ── CHAT PEEK BUBBLE ──
const peekEl = document.getElementById('chat-peek');
function dismissPeek() {
    if (peekEl) peekEl.classList.remove('show');
}
if (peekEl) {
    peekEl.addEventListener('click', () => toggleChat());
    if (!sessionStorage.getItem('peekShown')) {
        setTimeout(() => {
            if (chatWindow && !chatWindow.classList.contains('active')) {
                peekEl.classList.add('show');
                sessionStorage.setItem('peekShown', '1');
                setTimeout(dismissPeek, 7000);
            }
        }, 3500);
    }
}

// ── KEYBOARD SHORTCUT (⌘K / Ctrl+K / "/") ──
document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
    const cmdK = (e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey);
    const slash = e.key === '/' && !typing && !e.metaKey && !e.ctrlKey;
    if (!cmdK && !slash) return;
    e.preventDefault();
    if (chatWindow && !chatWindow.classList.contains('active')) {
        toggleChat();
    } else {
        const i = document.getElementById('chat-input');
        if (i) i.focus();
    }
});

// ── CONTENT → BOT ──
document.querySelectorAll('.skills-tags .tag').forEach(tag => {
    tag.addEventListener('click', () =>
        openChatWith('Tell me about your experience with ' + tag.textContent.trim()));
});
document.querySelectorAll('.timeline-company').forEach(el => {
    el.addEventListener('click', () =>
        openChatWith('What did you do at ' + el.textContent.trim() + '?'));
});

// ── HERO ROTATE ──
(function () {
    const el = document.getElementById('hero-rotate');
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const roles = [
        'Agentic AI', 'Team Leadership', 'Intelligent Automation', 'Stakeholder Management',
        'Data Strategy', 'Mentorship', 'Decision Intelligence', 'Cross-functional Collaboration',
        'Predictive Analytics', 'Client Relations', 'Diagnostic Analytics', 'Automation Expert',
        'Data Orchestration', 'Process Optimization', 'Data Governance',
    ];
    let i = 0;
    setInterval(() => {
        el.classList.add('out');
        setTimeout(() => {
            i = (i + 1) % roles.length;
            el.textContent = roles[i];
            el.classList.remove('out');
        }, 320);
    }, 2600);
})();

// ── TOAST + COPY EMAIL ──
let toastTimer = null;
function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}
document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', (e) => {
        if (!navigator.clipboard) return;
        const email = link.getAttribute('href').replace('mailto:', '');
        e.preventDefault();
        navigator.clipboard.writeText(email).then(
            () => showToast('Email copied ✓'),
            () => { window.location.href = link.getAttribute('href'); }
        );
    });
});
// ── AMBIENT MUSIC ──
// Loops a royalty-free track quietly the whole time the page is open.
const AMBIENT_VOLUME = 0.15; // light background level (0..1)
let bgAudio = null;
let ambientStarted = false;
let soundOn = localStorage.getItem('sound') !== 'off'; // default on

(function initSoundToggle() {
    const btn = document.getElementById('sound-toggle');
    if (btn && !soundOn) btn.classList.add('muted');
})();

// Smoothly ramp an audio element's volume; pauses when it reaches 0.
function fadeAudio(el, target, ms) {
    if (!el) return;
    const steps = 24, start = el.volume, delta = target - start;
    let i = 0;
    const iv = setInterval(() => {
        i++;
        el.volume = Math.max(0, Math.min(1, start + delta * (i / steps)));
        if (i >= steps) { clearInterval(iv); if (target === 0) el.pause(); }
    }, ms / steps);
}

function startAmbient() {
    if (ambientStarted || !soundOn) return;
    ambientStarted = true;
    bgAudio = new Audio('ambient.mp3');
    bgAudio.loop = true;
    bgAudio.preload = 'auto';
    bgAudio.volume = 0;
    bgAudio.play().then(() => fadeAudio(bgAudio, AMBIENT_VOLUME, 2500))
                  .catch(() => { ambientStarted = false; });
}

// Browsers block audio until a user gesture — start on first interaction.
window.addEventListener('pointerdown', startAmbient, { once: false, passive: true });
['keydown', 'scroll', 'touchstart'].forEach(ev =>
    window.addEventListener(ev, startAmbient, { once: false, passive: true }));

function toggleSound() {
    soundOn = !soundOn;
    localStorage.setItem('sound', soundOn ? 'on' : 'off');
    const btn = document.getElementById('sound-toggle');
    if (btn) btn.classList.toggle('muted', !soundOn);

    if (soundOn) {
        if (!ambientStarted) { startAmbient(); return; }
        if (bgAudio) { bgAudio.play().catch(() => {}); fadeAudio(bgAudio, AMBIENT_VOLUME, 800); }
    } else if (bgAudio) {
        fadeAudio(bgAudio, 0, 600); // fades out, then pauses
    }
}

document.querySelectorAll('.copy-email').forEach(btn => {
    btn.addEventListener('click', () => {
        const email = btn.dataset.email;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(email).then(
                () => showToast('Email copied ✓'),
                () => { window.location.href = 'mailto:' + email; }
            );
        } else {
            window.location.href = 'mailto:' + email;
        }
    });
});

// ── RECRUITER FIT ENGINE ──
async function fitCheck() {
    const ta  = document.getElementById('fit-jd');
    const btn = document.getElementById('fit-go');
    const jd  = (ta && ta.value || '').trim();
    if (!jd) { if (ta) ta.focus(); return; }

    const orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Reading…';
    try {
        const res = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: 'fit', jd: jd.slice(0, 4000) }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || 'failed');
        renderFit(data);
    } catch (_) {
        showToast('Could not analyze that — try again.');
    } finally {
        btn.disabled = false;
        btn.textContent = orig;
    }
}

function renderFit(data) {
    const result  = document.getElementById('fit-result');
    const pctEl   = document.getElementById('fit-pct');
    const bar     = document.querySelector('.fit-bar > i');
    const matched = document.getElementById('fit-matched');
    const pitch   = document.getElementById('fit-pitch');
    const score   = Math.max(0, Math.min(100, parseInt(data.score, 10) || 90));

    matched.innerHTML = '';
    (data.matched || []).forEach(m => {
        const li = document.createElement('li');
        li.textContent = m;
        matched.appendChild(li);
    });
    pitch.innerHTML = window.marked ? marked.parse(data.pitch || '') : (data.pitch || '');
    result.hidden = false;

    requestAnimationFrame(() => { if (bar) bar.style.width = score + '%'; });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        pctEl.textContent = score + '%';
    } else {
        const dur = 1100;
        let start = null;
        requestAnimationFrame(function loop(ts) {
            if (!start) start = ts;
            const p = Math.min((ts - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            pctEl.textContent = Math.round(eased * score) + '%';
            if (p < 1) requestAnimationFrame(loop);
        });
    }
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

const fitTa = document.getElementById('fit-jd');
if (fitTa) fitTa.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') fitCheck();
});
