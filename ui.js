// ui.js

import { getPlayerName } from './name.js';
import { getTimeElapsed, stopTimer } from './timer.js';
import { getTotalGroupTime, setTotalGroupTime } from './game.js';

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

export function showCompletionMessage(level) {
    const levelTime = getTimeElapsed();
    stopTimer();

    let totalGroupTime = getTotalGroupTime();
    totalGroupTime += levelTime;
    setTotalGroupTime(totalGroupTime);
}
