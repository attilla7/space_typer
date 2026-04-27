// game.js

import { updateDisplays } from './ui.js';
import { showLevelInfo } from './levels.js';
import { startTimer, stopTimer, getTimeElapsed, resetTimer } from './timer.js';
import { saveResult, getLevelGroupKey, showStats } from './stats.js';
import { getPlayerName } from './name.js';
import { getSelectedShipImagePath, getSelectedShipId } from './spaceship.js';

let actualLevel = null;
let startLevel = null;
let score = 0;
let tasksLeft = 5;
let spaceshipSpeed = 1;
let spaceshipPosition = 0;
let spaceshipHeight = 80;
let currentLetter = '';
let taskPoisoned = false;
let levelData = [];
let characters = null;
let maxSteps = null;
let maxPosition = null;
export let levelGroupStartTime = null;
let totalGroupTime = 0;
let spaceshipMoveInterval = null;
let floatInterval = null;
let pendingResult = null;
let topOffset = 190;
let backButtonHeight = 70;

const LEVEL_GROUPS_DEF = [
    { starts: 101, ends: 103 },
    { starts: 104, ends: 106 },
    { starts: 107, ends: 109 },
    { starts: 110, ends: 112 },
    { starts: 1,   ends: 5   },
    { starts: 6,   ends: 10  },
    { starts: 11,  ends: 15  },
    { starts: 16,  ends: 20  },
    { starts: 21,  ends: 25  },
    { starts: 26,  ends: 30  },
    { starts: 31,  ends: 35  },
    { starts: 36,  ends: 40  },
    { starts: 41,  ends: 45  },
    { starts: 46,  ends: 50  },
    { starts: 51,  ends: 55  },
    { starts: 56,  ends: 60  },
    { starts: 61,  ends: 65  },
    { starts: 66,  ends: 70  },
    { starts: 71,  ends: 75  },
    { starts: 76,  ends: 80  },
];

function isLastInGroup(levelNum) {
    const group = LEVEL_GROUPS_DEF.find(g => levelNum >= g.starts && levelNum <= g.ends);
    return group ? levelNum === group.ends : false;
}

function getLevelGroupInfo(levelNum) {
    const group = LEVEL_GROUPS_DEF.find(g => levelNum >= g.starts && levelNum <= g.ends);
    if (!group) return { index: 0, total: 1 };
    return {
        index: levelNum - group.starts,
        total: group.ends - group.starts + 1
    };
}

function getLevelRowCenter(index, total) {
    const spaceshipSize = 60;
    const gameEl = document.getElementById('game');
    const gameHeight = gameEl ? gameEl.clientHeight : window.innerHeight;

    const topLimit = topOffset + 60;
    const bottomRaw = gameHeight - backButtonHeight - 10 - spaceshipSize - 10;
    const usableHeight = (bottomRaw - topLimit) * 0.88;

    if (total <= 1) return topLimit;
    return Math.round(topLimit + (usableHeight / (total - 1)) * index);
}

function setSpaceshipRow(levelNum) {
    const { index, total } = getLevelGroupInfo(levelNum);
    spaceshipHeight = getLevelRowCenter(index, total);
    spaceshipPosition = 0;
    const spaceship = document.getElementById('spaceship');
    spaceship.style.left = spaceshipPosition + 'px';
    spaceship.style.top = spaceshipHeight + 'px';
}

function startFloatAnimation(centerX, centerY) {
    stopFloatAnimation();
    const spaceship = document.getElementById('spaceship');
    if (!spaceship) return;
    floatInterval = setInterval(() => {
        const dx = (Math.random() - 0.5) * 6;
        const dy = (Math.random() - 0.5) * 10;
        spaceship.style.left = (centerX + dx) + 'px';
        spaceship.style.top  = (centerY + dy) + 'px';
    }, 100);
}

function stopFloatAnimation() {
    if (floatInterval) {
        clearInterval(floatInterval);
        floatInterval = null;
    }
}

function setRandomBackground() {
    const n = Math.floor(Math.random() * 12) + 1;
    const path = `pictures/stars_${String(n).padStart(2, '0')}.jpg`;
    document.getElementById('game').style.backgroundImage = `url('${path}')`;
}

export function initializeGame(data) {
    levelData = data.levels;
}

export function startGame(selectedLevel) {
    resetTimer();
    totalGroupTime = 0;
    pendingResult = null;

    actualLevel = levelData.find(level => level.level === selectedLevel);
    startLevel = actualLevel.level;

    const levelGroupStarts = [
        101, 104, 107, 110,
        1, 6, 11, 16, 21, 26,
        31, 36, 41, 46, 51, 56,
        61, 66, 71, 76
    ];
    if (levelGroupStarts.includes(selectedLevel)) {
        levelGroupStartTime = Date.now();
        setRandomBackground();
    }

    if (!actualLevel) {
        console.error(`A szint adatai nem találhatók: ${selectedLevel}`);
        return;
    }

    score = 0;
    spaceshipPosition = 0;
    tasksLeft = actualLevel.tasks;
    characters = actualLevel.characterCount;

    showLevelInfo(actualLevel);
}

function generateTarget(keys) {
    let keySequence = [];
    for (let i = 0; i < actualLevel.characterCount; i++) {
        const letter = keys[Math.floor(Math.random() * keys.length)];
        keySequence.push(letter);
    }
    currentLetter = keySequence.join('');
    taskPoisoned = false;
    document.getElementById('targetText').textContent = `Nyomd meg: ${currentLetter.toUpperCase()}`;
}

document.addEventListener('keydown', (event) => {
    if (!currentLetter) return;

    if (currentLetter[0] === event.key) {
        currentLetter = currentLetter.slice(1);

        if (currentLetter.length === 0) {
            if (!taskPoisoned) score++;
            tasksLeft--;
            if (tasksLeft > 0) generateTarget(actualLevel.keys);
        }

        spaceshipFlying();

        if (tasksLeft <= 0) {
            nextLevel();
            return;
        }

        updateDisplays(startLevel, score, tasksLeft, actualLevel.level);

    } else {
        if (event.key.length === 1) taskPoisoned = true;
    }
});

function nextLevel() {
    if (!actualLevel) return;

    const completedLevel = actualLevel.level;

    if (isLastInGroup(completedLevel)) {
        finishGroup();
        return;
    }

    const nextLevelData = levelData.find(l => l.level === completedLevel + 1);
    if (!nextLevelData) {
        finishGroup();
        return;
    }

    actualLevel = nextLevelData;
    tasksLeft = actualLevel.tasks;
    characters = actualLevel.characterCount;

    stopFloatAnimation();
    setSpaceshipRow(actualLevel.level);
    startFloatAnimation(spaceshipPosition, spaceshipHeight);

    generateTarget(actualLevel.keys);
    updateDisplays(startLevel, score, tasksLeft, actualLevel.level);
}

async function finishGroup() {
    currentLetter = '';
    stopFloatAnimation();
    stopTimer();

    const groupTime = getTimeElapsed();
    const playerName = getPlayerName();
    const shipId = getSelectedShipId();
    const groupKey = getLevelGroupKey(startLevel);

    // Végképernyő azonnal megjelenik mentés előtt
    document.getElementById('game').style.display = 'none';
    document.getElementById('backButtonScreen').style.display = 'none';
    document.getElementById('endScreen').style.display = 'block';
    document.getElementById('endPlayer').textContent = `Játékos: ${playerName}`;
    document.getElementById('endScore').textContent = `Pontszám: ${score}`;
    document.getElementById('endTime').textContent = `Idő: ${groupTime.toFixed(2)} s`;
    document.getElementById('endBest').style.display = 'none';

    totalGroupTime = 0;

    try {
        const previousBest = await saveResult(groupKey, playerName, groupTime, score, shipId);

        pendingResult = { groupKey, playerName, time: groupTime, score, shipId, previousBest };

        const endBestEl = document.getElementById('endBest');
        if (previousBest !== null) {
            const improved = score > previousBest.score ||
                (score === previousBest.score && groupTime < previousBest.time);
            if (improved) {
                endBestEl.textContent = `Új rekord! (előző: ${previousBest.score} pt, ${previousBest.time.toFixed(2)} s)`;
            } else {
                endBestEl.textContent = `Legjobb eredményed: ${previousBest.score} pt, ${previousBest.time.toFixed(2)} s`;
            }
            endBestEl.style.display = 'block';
        }
    } catch (e) {
        pendingResult = { groupKey, playerName, time: groupTime, score, shipId, previousBest: null };
    }
}

export function openStatsFromEnd() {
    showStats(pendingResult);
}

export function levelStart(level) {
    actualLevel = level;
    tasksLeft = level.tasks;
    characters = level.characterCount;

    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('levelInfo').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.getElementById('backButtonScreen').style.display = 'block';

    document.getElementById('spaceship').src = getSelectedShipImagePath();

    stopSpaceshipAnimation();
    startTimer();
    generateTarget(actualLevel.keys);
    updateDisplays(startLevel, score, tasksLeft, actualLevel.level);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const gameEl = document.getElementById('game');
            const h2El = gameEl ? gameEl.querySelector('h2') : null;
            const playerEl = document.getElementById('currentPlayer');
            const statusEl = document.getElementById('status');
            const targetEl = document.getElementById('targetText');
            const backEl = document.getElementById('backButtonScreen');

            let measuredTop = 20;
            if (h2El) measuredTop += h2El.offsetHeight + 8;
            if (playerEl) measuredTop += playerEl.offsetHeight + 4;
            if (statusEl) measuredTop += statusEl.offsetHeight + 8;
            if (targetEl) measuredTop += targetEl.offsetHeight + 8;
            topOffset = measuredTop > 80 ? measuredTop : 190;
            backButtonHeight = backEl ? backEl.offsetHeight : 70;

            setSpaceshipRow(level.level);
            startFloatAnimation(spaceshipPosition, spaceshipHeight);
        });
    });
}

function spaceshipFlying() {
    maxSteps = actualLevel.tasks * actualLevel.characterCount;
    maxPosition = window.innerWidth - 160;
    spaceshipSpeed = maxPosition / maxSteps;
    spaceshipPosition += spaceshipSpeed * 0.9;

    stopFloatAnimation();
    startFloatAnimation(spaceshipPosition, spaceshipHeight);
}

export function startSpaceshipAnimation() {
    if (!spaceshipMoveInterval) {
        spaceshipMoveInterval = setInterval(() => {
            const spaceship = document.getElementById('spaceship');
            const randomHeight = Math.random() * window.innerHeight * 0.25;
            spaceship.style.top = `${randomHeight}px`;
        }, 500);
    }
}

export function stopSpaceshipAnimation() {
    clearInterval(spaceshipMoveInterval);
    spaceshipMoveInterval = null;
}
