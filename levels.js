import { initializeGame, startGame } from './game.js';

const levels = [
    { level: 1, letters: ["4", "5", "6"], tasks: 5, spaceshipSpeed: 1 },
    { level: 2, letters: ["4", "5", "6", "7", "8", "9"], tasks: 10, spaceshipSpeed: 1.2 },
    // További szintek és beállítások hozzáadása itt.
];

let levelsData;

export async function loadLevels() {
    try {
        const response = await fetch('./levels.json');
        levelsData = await response.json();
    } catch (error) {
        console.error('Failed to load levels:', error);
    }
}

export function showLevels() {
    const levelContainer = document.getElementById('levels');
    levelContainer.innerHTML = '';

    levels.forEach((level) => {
        const levelButton = document.createElement('button');
        levelButton.textContent = `Szint ${level.level}`;
        levelButton.addEventListener('click', () => showLevelInfo(level.level));
        levelContainer.appendChild(levelButton);
    });

    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('levelScreen').style.display = 'block';
}

export function showLevelInfo(levelNumber) {
    const level = levels.find(l => l.level === levelNumber);
    document.getElementById('keyList').textContent = level.letters.join(', ');

    document.getElementById('levelScreen').style.display = 'none';
    document.getElementById('levelInfo').style.display = 'block';

    document.addEventListener('keydown', (event) => {
        if (event.key === ' ') {
            document.getElementById('levelInfo').style.display = 'none';
            startGame(levelNumber);
        }
    },);
}

export function getLevelData() {
    return { levels };
}

initializeGame(getLevelData());

initializeGame(loadLevels);
