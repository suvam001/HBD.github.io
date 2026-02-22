window.addEventListener('load', () => {
    const nameElement = document.querySelector('.glitch-name');
    if (nameElement) triggerHackerText(nameElement);
});

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let scrambleInterval = null;

function triggerHackerText(element) {
    let iteration = 0;
    const originalText = element.dataset.value || element.innerText;
    
    if (!element.dataset.value) {
        element.dataset.value = originalText;
    }

    clearInterval(scrambleInterval);
    
    scrambleInterval = setInterval(() => {
        element.innerText = originalText
            .split("")
            .map((letter, index) => {
                if(index < iteration || letter === " ") {
                    return originalText[index];
                }
                return letters[Math.floor(Math.random() * 26)];
            })
            .join("");
        
        if(iteration >= originalText.length){ 
            clearInterval(scrambleInterval);
        }
        
        iteration += 1 / 3;
    }, 30);
}

const nameEl = document.querySelector('.glitch-name');
if (nameEl) {
    nameEl.addEventListener('mouseover', function() {
        triggerHackerText(this);
    });
}
