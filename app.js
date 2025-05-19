let coins = 0;
let level = 1;
let clickValue = 1;
let upgrades = [];
let clickEffectVisible = false;

async function init() {
    const initData = new URLSearchParams(window.Telegram.WebApp.initData);
    const user = JSON.parse(initData.get('user'));
    
    const progress = await fetch('/load', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: user.id})
    }).then(r => r.json());
    
    coins = progress.coins || 0;
    level = progress.level || 1;
    clickValue = progress.clickValue || 1;
    upgrades = progress.upgrades || [];
    updateUI();
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
        2: { price: 100, value: 5 }
    };

    const upgrade = upgradesData[id];
    
    if (coins >= upgrade.price && !upgrades.includes(id)) {
        coins -= upgrade.price;
        clickValue += upgrade.value;
        upgrades.push(id);
        updateUI();
        saveProgress();
    }
}

async function saveProgress() {
    const initData = new URLSearchParams(window.Telegram.WebApp.initData);
    const user = JSON.parse(initData.get('user'));
    
    await fetch('/save', {
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
}

Telegram.WebApp.ready();
init();