// levels.js

import { startGame, levelStart } from './game.js';

const NUMERIC_IDS  = [101, 104, 107, 110];
const ALPHA_IDS    = [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76];

export function showLevels() {
    fetch('levels.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('levelButtonsContainer');
            container.innerHTML = '';

            renderSection(container, data.levels, NUMERIC_IDS,  'Számpad');
            renderSection(container, data.levels, ALPHA_IDS,    'Betűk');
        })
        .catch(error => console.error('Hiba a szintek betöltésekor:', error));
}

function renderSection(container, levels, ids, label) {
    const section = document.createElement('div');
    section.classList.add('level-section');

    const title = document.createElement('p');
    title.classList.add('level-section-title');
    title.textContent = label;
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.classList.add('level-section-grid');

    ids.forEach(id => {
        const level = levels.find(l => l.level === id);
        if (!level) return;

        const wrapper = document.createElement('div');
        wrapper.classList.add('level-button-wrapper');

        const button = document.createElement('button');
        button.innerText = `Szint ${level.level}`;
        button.classList.add('level-button');
        button.onclick = () => startGame(level.level);
        wrapper.appendChild(button);

        if (level.tooltipKeys && level.tooltipKeys.length > 0) {
            const tooltip = document.createElement('div');
            tooltip.classList.add('level-tooltip');
            const isFullList = !level.tooltipKeys[0].startsWith('+');
            tooltip.textContent = isFullList
                ? level.tooltipKeys.join('  ')
                : '+ ' + level.tooltipKeys.map(k => k.slice(1)).join('  ');
            wrapper.appendChild(tooltip);
        }

        grid.appendChild(wrapper);
    });

    section.appendChild(grid);
    container.appendChild(section);
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
