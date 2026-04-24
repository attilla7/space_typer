// levels.js

import { startGame, levelStart } from './game.js';

export function showLevels() {
    fetch('levels.json')
        .then(response => response.json())
        .then(data => {
            const levelIds = [
                101, 104, 107, 110,
                1, 6, 11, 16, 21, 26,
                31, 36, 41, 46, 51, 56,
                61, 66, 71, 76
            ];

            data.levels.forEach(level => {
                if (levelIds.includes(level.level)) {
                    const button = document.createElement('button');
                    button.innerText = `Szint ${level.level}`;
                    button.classList.add('level-button');
                    button.onclick = () => startGame(level.level);
                    levelButtonsContainer.appendChild(button);
                }
            });
        })
        .catch(error => console.error('Hiba a szintek betöltésekor:', error));
}

export function showLevelInfo(level) {
    document.getElementById('keyList').textContent = level.keys.join(', ');
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('levelInfo').style.display = 'block';
    document.getElementById('game').style.display = 'none';
    document.getElementById('backButtonScreen').style.display = 'block';

    const startHandler = (event) => {
        if (event.key === ' ') {
            document.getElementById('levelInfo').style.display = 'none';
            levelStart(level);
            document.removeEventListener('keydown', startHandler);
        }
    };
    document.addEventListener('keydown', startHandler);
}
