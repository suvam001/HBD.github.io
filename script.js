const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%";
let interval = null;

function triggerScramble(target) {
    let iteration = 0;
    const originalValue = target.dataset.value;
    
    clearInterval(interval);
    
    interval = setInterval(() => {
        target.innerText = originalValue
            .split("")
            .map((letter, index) => {
                if(index < iteration || letter === " ") {
                    return originalValue[index];
                }
                return letters[Math.floor(Math.random() * letters.length)];
            })
            .join("");
        
        if(iteration >= originalValue.length) {
            clearInterval(interval);
        }
        
        iteration += 1 / 3;
    }, 30);
}

function switchTab(tabId) {
    // Update Nav Buttons
    document.querySelectorAll('.nav-hub button').forEach(btn => btn.classList.remove('active'));
    document.getElementById('nav-' + tabId).classList.add('active');
    
    // Update Content
    document.querySelectorAll('.content-tab').forEach(tab => tab.classList.remove('active'));
    const activeTab = document.getElementById('tab-' + tabId);
    activeTab.classList.add('active');
    
    // If profile, trigger scramble
    if(tabId === 'profile') {
        const glitchElement = activeTab.querySelector('.glitch-text');
        triggerScramble(glitchElement);
    }
}

// Initial Run
window.onload = () => {
    triggerScramble(document.querySelector('.glitch-text'));
};
