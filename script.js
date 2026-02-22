window.onload = () => {
    startLoader();
    initGrid();
    switchTab('profile');
};

function startLoader() {
    let progress = 0;
    const bar = document.getElementById('load-progress');
    const status = document.getElementById('load-status');
    const loader = document.getElementById('loader');
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 8) + 2;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 500);
            }, 500);
        }
        bar.style.width = progress + '%';
        status.innerText = progress + '%';
    }, 40);
}

const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
let mouse = { x: -100, y: -100 };

function initGrid() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawGrid();
}

window.addEventListener('mousemove', (e) => {
    const container = document.querySelector('.container');
    if (container && !container.contains(e.target)) {
        mouse.x = e.clientX; mouse.y = e.clientY;
    } else {
        mouse.x = -100; mouse.y = -100;
    }
    drawGrid();
});

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const spacing = 40;
    for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            ctx.beginPath();
            if (dist < 120) {
                ctx.fillStyle = `rgba(255, 255, 255, ${0.4 - dist/280})`;
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.arc(x, y, 0.5, 0, Math.PI * 2);
            }
            ctx.fill();
        }
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.content-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    document.getElementById('nav-' + tabId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}