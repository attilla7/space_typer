// game.js

import { updateDisplays } from './ui.js';

let level = 1;
let score = 0;
let tasksLeft = 5;
let spaceshipSpeed = 1;
let spaceshipPosition = 0;
let spaceshipHeight = 80;
let currentLetter = '';
let levelData = [];

export function initializeGame(data) {
    levelData = data.levels;
}

// Játék indítása egy adott szinttel
export function startGame(selectedLevel) {
    const initialLevelData = levelData.find(l => l.level === selectedLevel) || levelData[0];
    level = selectedLevel;
    tasksLeft = initialLevelData.tasks;
    spaceshipSpeed = initialLevelData.spaceshipSpeed;

    score = 0;
    spaceshipPosition = 0;
    spaceshipHeight = 80;
    document.getElementById('spaceship').style.left = spaceshipPosition + 'px';
    document.getElementById('spaceship').style.top = spaceshipHeight + 'px';
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.getElementById('backButtonScreen').style.display = 'block';

    generateTarget();
    updateDisplays(score, tasksLeft, level);
}

export function exitGame() {
    document.getElementById('game').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
}

function generateTarget() {
    const letters = levelData.find(l => l.level === level).letters;
    currentLetter = letters[Math.floor(Math.random() * letters.length)];
    document.getElementById('targetText').textContent = `Nyomd meg: ${currentLetter.toUpperCase()}`;
}

document.addEventListener('keydown', (event) => {
    if (event.key === currentLetter) {
        score++;
        tasksLeft--;
        spaceshipPosition += spaceshipSpeed * 20;
        document.getElementById('spaceship').style.left = spaceshipPosition + 'px';

        // Ellenőrizzük, hogy van-e még hátralévő feladat, vagy a szint befejeződött
        if (tasksLeft <= 0 || spaceshipPosition >= window.innerWidth - 60) {
            level++;
            nextLevel();
        } else {
            generateTarget();
        }
        
        updateDisplays(score, tasksLeft, level);
    }
});

function nextLevel() {
    level++;
    const currentLevelData = levelData.find(l => l.level === level) || levelData[levelData.length - 1];
    tasksLeft = currentLevelData.tasks;
    spaceshipSpeed = currentLevelData.spaceshipSpeed;

    // Visszaállítjuk a pozíciókat az új szint kezdéséhez
    spaceshipPosition = 0;
    spaceshipHeight += 50;
    document.getElementById('spaceship').style.left = spaceshipPosition + 'px';
    document.getElementById('spaceship').style.top = spaceshipHeight + 'px';

    generateTarget();
    updateDisplays(score, tasksLeft, level);
}

