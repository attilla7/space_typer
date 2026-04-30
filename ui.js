// ui.js

import { getPlayerName } from './name.js';
import { getTotalGroupTime, setTotalGroupTime, maxScore } from './game.js';

export function updateDisplays(level1, score, tasksLeft, level) {
    if (level > 100 && level < 113) {
        document.getElementById('level').textContent = level + ' / 101-112';
    } else if (level > 0 && level < 81) {
        document.getElementById('level').textContent = level + ' / 80';
    } else {
        document.getElementById('level').textContent = level;
    }

    document.getElementById('level1').textContent = level1;
    document.getElementById('score').textContent = maxScore > 0 ? `${score} / ${maxScore}` : score;
    document.getElementById('tasksLeft').textContent = tasksLeft;
}

export function showCompletionMessage(level) {
}
