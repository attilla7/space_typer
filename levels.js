// levels.js

import { startGame, levelStart } from './game.js';

export function showLevels() {
    fetch('levels.json')
        .then(response => response.json())
        .then(data => {
            const numericIds = [101, 104, 107, 110];
            const alphaIds   = [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76];

            const numericContainer = document.getElementById('numericButtons');
            const alphaContainer   = document.getElementById('alphaButtons');

            data.levels.forEach(level => {
                if (numericIds.includes(level.level)) {
                    const button = document.createElement('button');
                    button.innerText = `Szint ${level.level}`;
                    button.classList.add('level-button');
                    button.onclick = () => startGame(level.level);
                    numericContainer.appendChild(button);
                } else if (alphaIds.includes(level.level)) {
                    const button = document.createElement('button');
                    button.innerText = `Szint ${level.level}`;
                    button.classList.add('level-button');
                    button.onclick = () => startGame(level.level);
                    alphaContainer.appendChild(button);
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
