// ui.js

import { getTimeElapsed } from './timer.js';

export function updateDisplays(level1, score, tasksLeft, level) {
    const timeElapsed = getTimeElapsed().toFixed(2);
    document.getElementById('timeElapsed').textContent = `Idő: ${timeElapsed} s`;

    if (level > 100 && level < 113) {
        document.getElementById('level').textContent = level + ' / 101-112';
    } else if (level > 0 && level < 81) {
        document.getElementById('level').textContent = level + ' / 80';
    } else {
        document.getElementById('level').textContent = level;
    }

    document.getElementById('level1').textContent = level1;
    document.getElementById('score').textContent = score;
    document.getElementById('tasksLeft').textContent = tasksLeft;
}

export function showCompletionMessage() {
    // Timer szándékosan NEM áll meg itt – fut végig az egész szintcsoporton.
    // Csak a finishGroup()-ban áll meg.
}
