let coins = 0;
let level = 1;
let clickValue = 1;
let upgrades = [];
let clickEffectVisible = false;

async function init() {
    try {
        const initData = new URLSearchParams(Telegram.WebApp.initData);
        const user = JSON.parse(initData.get('user'));
        
        const response = await fetch('/load', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user_id: user.id})
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const progress = await response.json();
        console.log("Завантажений прогрес:", progress);
        
        coins = progress.coins || 0;
        level = progress.level || 1;
        clickValue = progress.clickValue || 1;
        upgrades = progress.upgrades || [];
        
        updateUI();
    } catch (error) {
        console.error("Помилка завантаження прогресу:", error);
        // Відновити значення за замовчуванням у разі помилки
        coins = 0;
        level = 1;
        clickValue = 1;
        upgrades = [];
        updateUI();
    }
}

function updateUI() {
    document.getElementById('coins').textContent = coins;
    document.getElementById('level').textContent = level;
}

document.getElementById('clickTarget').addEventListener('click', (e) => {
    coins += clickValue;
    showClickEffect(e);
    updateUI();
    saveProgress();
});

function showClickEffect(event) {
    if (clickEffectVisible) return;
    
    const effect = document.querySelector('.click-effect');
    effect.style.left = `${event.pageX - 30}px`;
    effect.style.top = `${event.pageY - 30}px`;
    
    clickEffectVisible = true;
    effect.style.display = 'block';
    
    setTimeout(() => {
        effect.style.display = 'none';
        clickEffectVisible = false;
    }, 1000);
}

function toggleUpgrades() {
    const modal = document.getElementById('upgradesModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

async function buyUpgrade(id) {
    const upgradesData = {
        1: { price: 50, value: 2 },
        2: { price: 100, value: 5 },
        3: { price: 200, value: 10 }
    };

    const upgrade = upgradesData[id];
    
    if (!upgrade) {
        console.error("Невідоме покращення з ID:", id);
        return;
    }
    
    if (coins >= upgrade.price && !upgrades.includes(id)) {
        coins -= upgrade.price;
        clickValue += upgrade.value;
        upgrades.push(id);
        updateUI();
        await saveProgress();
        toggleUpgrades(); // Закрити модальне вікно після покупки
    } else if (upgrades.includes(id)) {
        alert("Ви вже купили це покращення!");
    } else {
        alert("Недостатньо монет!");
    }
}

async function saveProgress() {
    try {
        const initData = new URLSearchParams(Telegram.WebApp.initData);
        const user = JSON.parse(initData.get('user'));
        
        const response = await fetch('/save', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user_id: user.id,
                coins: coins,
                level: level,
                clickValue: clickValue,
                upgrades: upgrades
            })
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const result = await response.json();
        console.log("Прогрес збережено:", result);
        return result;
    } catch (error) {
        console.error("Помилка збереження прогресу:", error);
        throw error;
    }
}

// Ініціалізація гри
Telegram.WebApp.ready();
init();