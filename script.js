window.onload = () => {
    startLoader();
    initGrid();
    switchTab('profile');
};

function startLoader() {
    let progress = 0;
    const bar = document.getElementById('load-progress');
    const loader = document.getElementById('loader');
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 500);
            }, 300);
        }
        if(bar) bar.style.width = progress + '%';
    }, 30);
}

const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
let mouse = { x: -100, y: -100 };

function initGrid() {
    if(!canvas) return;
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

window.addEventListener('resize', initGrid);

function drawGrid() {
    if(!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const spacing = 40;
    for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            ctx.beginPath();
            if (dist < 150) {
                ctx.fillStyle = `rgba(255, 255, 255, ${0.5 - dist/300})`;
                ctx.arc(x, y, 2, 0, Math.PI * 2);
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.arc(x, y, 1, 0, Math.PI * 2);
            }
            ctx.fill();
        }
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.content-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    const targetTab = document.getElementById('tab-' + tabId);
    const targetBtn = document.getElementById('nav-' + tabId);
    
    if(targetTab) targetTab.classList.add('active');
    if(targetBtn) targetBtn.classList.add('active');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}