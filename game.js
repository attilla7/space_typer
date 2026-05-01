// game.js

import { updateDisplays } from './ui.js';
import { showLevelInfo } from './levels.js';
import { startTimer, stopTimer, getTimeElapsed, resetTimer } from './timer.js';
import { saveResult, getLevelGroupKey, showStats, showEndScreenStats } from './stats.js';
import { getPlayerName } from './name.js';
import { getSelectedShipImagePath, getSelectedShipId } from './spaceship.js';

let actualLevel = null;
export let startLevel = null;
let score = 0;
let tasksLeft = 5;
let spaceshipSpeed = 1;
let spaceshipPosition = 0;
let spaceshipHeight = 80;
let currentLetter = '';
let taskPoisoned = false;
let levelData = [];
let maxSteps = null;
let maxPosition = null;
let totalGroupTime = 0;
let floatInterval = null;
let floatPhase = 0;
let pendingResult = null;
let topOffset = 190;
export let maxScore = 0;
let animating = false;

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
    const bottomRaw = gameHeight - 20 - spaceshipSize - 10;
    const usableHeight = (bottomRaw - topLimit) * 0.88;
    if (total <= 1) return topLimit;
    return Math.round(topLimit + (usableHeight / (total - 1)) * index);
}

function setRandomBackground() {
    const n = Math.floor(Math.random() * 12) + 1;
    const path = `pictures/stars_${String(n).padStart(2, '0')}.jpg`;
    document.getElementById('game').style.backgroundImage = `url('${path}')`;
}

// ── Lebegés: sima sinusos mozgás ──
function startFloatAnimation(centerX, centerY) {
    stopFloatAnimation();
    const spaceship = document.getElementById('spaceship');
    if (!spaceship) return;
    const speed = 0.04;
    const ampX = 2;
    const ampY = 4;
    function tick() {
        floatPhase += speed;
        spaceship.style.left = (centerX + Math.sin(floatPhase) * ampX) + 'px';
        spaceship.style.top  = (centerY + Math.sin(floatPhase * 0.7) * ampY) + 'px';
        floatInterval = requestAnimationFrame(tick);
    }
    floatInterval = requestAnimationFrame(tick);
}

function stopFloatAnimation() {
    if (floatInterval) {
        cancelAnimationFrame(floatInterval);
        floatInterval = null;
    }
}

// ── Belépő animáció: bal széléről befut, kicsitől normál méretig ──
function animateEntrance(targetX, targetY) {
    return new Promise(resolve => {
        stopFloatAnimation();
        const spaceship = document.getElementById('spaceship');

        // Pozíció azonnali beállítása transition nélkül
        spaceship.style.transition = 'none';
        spaceship.style.transform = 'scale(0.3)';
        spaceship.style.opacity = '0';
        spaceship.style.left = '-80px';
        spaceship.style.top = targetY + 'px';

        // Force reflow – biztosítja hogy a böngésző feldolgozza a fenti értékeket
        spaceship.getBoundingClientRect();

        spaceship.style.transition = 'left 0.5s ease-out, transform 0.5s ease-out, opacity 0.3s ease-out';
        spaceship.style.left = targetX + 'px';
        spaceship.style.transform = 'scale(1)';
        spaceship.style.opacity = '1';

        setTimeout(() => {
            spaceship.style.transition = '';
            resolve();
        }, 520);
    });
}

// ── Szintváltás: kijobb, bal oldalról visszajön az új sorba ──
function animateLevelTransition(newX, newY) {
    return new Promise(resolve => {
        stopFloatAnimation();
        const spaceship = document.getElementById('spaceship');
        const exitX = window.innerWidth + 80;

        // Kilépés jobbra
        spaceship.style.transition = 'left 0.25s ease-in, opacity 0.2s ease-in';
        spaceship.style.left = exitX + 'px';
        spaceship.style.opacity = '0';

        setTimeout(() => {
            // Azonnali pozíció reset bal oldalra, transition nélkül
            spaceship.style.transition = 'none';
            spaceship.style.left = '-80px';
            spaceship.style.top = newY + 'px';
            spaceship.style.opacity = '0';

            // Force reflow
            spaceship.getBoundingClientRect();

            // Bejövés bal oldalról
            spaceship.style.transition = 'left 0.3s ease-out, opacity 0.25s ease-out';
            spaceship.style.left = newX + 'px';
            spaceship.style.opacity = '1';

            setTimeout(() => {
                spaceship.style.transition = '';
                resolve();
            }, 320);
        }, 250);
    });
}

// ── Csillagrobbanás Canvas animáció ──
function launchExplosions(count = 4 + Math.floor(Math.random() * 4), bgMode = false) {
    const gameEl = document.getElementById('game');
    if (!gameEl || gameEl.style.display === 'none') return;
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '5';
    canvas.width = gameEl.clientWidth;
    canvas.height = gameEl.clientHeight;
    gameEl.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const w = canvas.width;
    const h = canvas.height;

    // Ablak kb: vízszintesen középső 1/3, függőlegesen középső 3/5
    // Háttér módban az ablak KÖRÜLI területre szórjuk a robbanásokat
    const explosions = [];

    for (let i = 0; i < count; i++) {
        const delay = Math.random() * 350;
        let x, y;
        if (bgMode) {
            // Véletlenszerűen választunk az ablak melletti 4 sávból
            const zone = Math.floor(Math.random() * 4);
            if (zone === 0) {
                // Bal sáv (0-33%)
                x = w * (Math.random() * 0.30);
                y = h * (0.05 + Math.random() * 0.90);
            } else if (zone === 1) {
                // Jobb sáv (67-100%)
                x = w * (0.70 + Math.random() * 0.30);
                y = h * (0.05 + Math.random() * 0.90);
            } else if (zone === 2) {
                // Felső sáv (0-20%)
                x = w * (0.10 + Math.random() * 0.80);
                y = h * (Math.random() * 0.20);
            } else {
                // Alsó sáv (80-100%)
                x = w * (0.10 + Math.random() * 0.80);
                y = h * (0.80 + Math.random() * 0.20);
            }
        } else {
            // Eredeti: játéktér belső területe
            x = w * (0.25 + Math.random() * 0.5);
            y = h * (0.20 + Math.random() * 0.6);
        }
        explosions.push({ x, y, delay, started: false, particles: [], flash: 1.0 });
    }

    // Részecske létrehozása egy robbanáshoz
    function createParticles(ex) {
        const pCount = 18 + Math.floor(Math.random() * 14); // 18-32 részecske
        for (let i = 0; i < pCount; i++) {
            const angle = (Math.PI * 2 / pCount) * i + (Math.random() - 0.5) * 0.4;
            const speed = bgMode
                ? 0.6 + Math.random() * 1.4   // lassabb háttér módban
                : 1.5 + Math.random() * 3.5;
            const lightness = 85 + Math.floor(Math.random() * 15);
            const saturation = Math.floor(Math.random() * 40);
            ex.particles.push({
                x: ex.x, y: ex.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1.0,
                size: 0.8 + Math.random() * 1.4,
                color: `hsl(50, ${saturation}%, ${lightness}%)`,
            });
        }
    }

    const startTime = performance.now();
    const totalDuration = bgMode ? 2800 : 1200; // ms – háttérben tovább él

    function draw(now) {
        ctx.clearRect(0, 0, w, h);
        const elapsed = now - startTime;
        let anyAlive = false;

        for (const ex of explosions) {
            if (elapsed < ex.delay) { anyAlive = true; continue; }

            if (!ex.started) {
                ex.started = true;
                createParticles(ex);
            }

            // Fehér flash
            if (ex.flash > 0) {
                ex.flash = Math.max(0, ex.flash - 0.12);
                ctx.beginPath();
                ctx.arc(ex.x, ex.y, 18 * ex.flash, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${ex.flash * 0.9})`;
                ctx.fill();
            }

            // Részecskék
            for (const p of ex.particles) {
                if (p.alpha <= 0) continue;
                anyAlive = true;
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= bgMode ? 0.98 : 0.96;
                p.vy *= bgMode ? 0.98 : 0.96;
                p.alpha -= bgMode ? 0.007 : 0.018;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color.replace('hsl', 'hsla').replace(')', `, ${Math.max(0, p.alpha)})`);
                ctx.fill();
            }

            if (ex.particles.some(p => p.alpha > 0)) anyAlive = true;
        }

        if (anyAlive && elapsed < totalDuration) {
            requestAnimationFrame(draw);
        } else {
            canvas.remove();
        }
    }

    requestAnimationFrame(draw);
}

// ── Kilépő animáció: jobbra gyorsulva, nő és elhalványul ──
function animateExit() {
    return new Promise(resolve => {
        stopFloatAnimation();
        const spaceship = document.getElementById('spaceship');
        const exitX = window.innerWidth + 100;

        spaceship.style.transition = 'left 0.6s ease-in, transform 0.6s ease-in, opacity 0.5s ease-in';
        spaceship.style.left = exitX + 'px';
        spaceship.style.transform = 'scale(2.5)';
        spaceship.style.opacity = '0';

        setTimeout(() => {
            spaceship.style.transition = '';
            spaceship.style.transform = '';
            spaceship.style.opacity = '1';
            resolve();
        }, 620);
    });
}

// ── Háttér robbanások az endScreen mögött ──
let bgExplosionTimer = null;

function startBackgroundExplosions() {
    function schedule() {
        const delay = 2800 + Math.random() * 2400; // 2.8-5.2 mp
        bgExplosionTimer = setTimeout(() => {
            launchExplosions(1 + Math.floor(Math.random() * 2), true); // 1-2 robbanás, ablak körül
            schedule();
        }, delay);
    }
    schedule();
}

export function stopBackgroundExplosions() {
    if (bgExplosionTimer) {
        clearTimeout(bgExplosionTimer);
        bgExplosionTimer = null;
    }
}
export function initializeGame(data) {
    levelData = data.levels;
}

export function startGame(selectedLevel) {
    resetTimer();
    totalGroupTime = 0;
    pendingResult = null;

    actualLevel = levelData.find(level => level.level === selectedLevel);
    if (!actualLevel) {
        console.error(`A szint adatai nem találhatók: ${selectedLevel}`);
        return;
    }
    startLevel = actualLevel.level;

    const levelGroupStarts = [
        101, 104, 107, 110,
        1, 6, 11, 16, 21, 26,
        31, 36, 41, 46, 51, 56,
        61, 66, 71, 76
    ];
    if (levelGroupStarts.includes(selectedLevel)) {
        setRandomBackground();
    }

    score = 0;
    spaceshipPosition = 80;
    tasksLeft = actualLevel.tasks;

    const group = LEVEL_GROUPS_DEF.find(g => selectedLevel >= g.starts && selectedLevel <= g.ends);
    if (group) {
        maxScore = levelData
            .filter(l => l.level >= group.starts && l.level <= group.ends)
            .reduce((sum, l) => sum + l.tasks, 0);
    } else {
        maxScore = actualLevel.tasks;
    }

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
    const targetEl = document.getElementById('targetText');
    targetEl.textContent = `Nyomd meg: ${currentLetter.toUpperCase()}`;
    targetEl.style.color = 'white';
}

document.addEventListener('keydown', (event) => {
    if (!currentLetter || animating) return;

    if (currentLetter[0] === event.key) {
        currentLetter = currentLetter.slice(1);

        if (currentLetter.length === 0) {
            if (!taskPoisoned) score++;
            tasksLeft--;
            if (tasksLeft > 0) generateTarget(actualLevel.keys);
        }

        spaceshipFlying();

        if (tasksLeft <= 0) {
            currentLetter = '';
            nextLevel();
            return;
        }

        updateDisplays(startLevel, score, tasksLeft, actualLevel.level);

    } else {
        if (event.key.length === 1) {
            taskPoisoned = true;
            document.getElementById('targetText').style.color = '#E24B4A';
        }
    }
});

async function nextLevel() {
    if (!actualLevel) return;

    const completedLevel = actualLevel.level;

    if (isLastInGroup(completedLevel)) {
        await finishGroup();
        return;
    }

    const nextLevelData = levelData.find(l => l.level === completedLevel + 1);
    if (!nextLevelData) {
        await finishGroup();
        return;
    }

    animating = true;

    actualLevel = nextLevelData;
    tasksLeft = actualLevel.tasks;

    const { index, total } = getLevelGroupInfo(actualLevel.level);
    const newY = getLevelRowCenter(index, total);
    spaceshipHeight = newY;
    spaceshipPosition = 80;

    await animateLevelTransition(spaceshipPosition, spaceshipHeight);

    animating = false;
    generateTarget(actualLevel.keys);
    updateDisplays(startLevel, score, tasksLeft, actualLevel.level);
    startFloatAnimation(spaceshipPosition, spaceshipHeight);
}

async function finishGroup() {
    animating = true;
    currentLetter = '';
    stopTimer();

    // Robbanások és kilépő animáció párhuzamosan
    launchExplosions();
    await animateExit();

    animating = false;

    startBackgroundExplosions();

    const groupTime = getTimeElapsed();
    const playerName = getPlayerName();
    const shipId = getSelectedShipId();
    const groupKey = getLevelGroupKey(startLevel);
    const previousBest = await saveResult(groupKey, playerName, groupTime, score, shipId);

    totalGroupTime = 0;
    pendingResult = { groupKey, playerName, time: groupTime, score, shipId, previousBest };

    document.getElementById('endScreen').style.display = 'flex';

    document.getElementById('endPlayer').textContent = `Játékos: ${playerName}`;
    document.getElementById('endScore').textContent = `Pontszám: ${score} / ${maxScore}`;
    document.getElementById('endTime').textContent = `Idő: ${groupTime.toFixed(2)} s`;

    const endBestEl = document.getElementById('endBest');
    if (previousBest !== null && (score > previousBest.score || (score === previousBest.score && groupTime < previousBest.time))) {
        endBestEl.textContent = `Új rekord!`;
        endBestEl.style.display = 'block';
    } else {
        endBestEl.style.display = 'none';
    }

    showEndScreenStats(pendingResult);
}

export function openStatsFromEnd() {
    showStats(pendingResult);
}

export function levelStart(level) {
    actualLevel = level;
    tasksLeft = level.tasks;

    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('levelInfo').style.display = 'none';
    document.getElementById('game').style.display = 'block';

    document.getElementById('spaceship').src = getSelectedShipImagePath();

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

            const gameRect = gameEl ? gameEl.getBoundingClientRect() : { top: 0 };
            let bottomEdge = 0;
            [h2El, playerEl, statusEl, targetEl].forEach(el => {
                if (el) {
                    const rect = el.getBoundingClientRect();
                    const elBottom = rect.bottom - gameRect.top;
                    if (elBottom > bottomEdge) bottomEdge = elBottom;
                }
            });
            topOffset = bottomEdge > 80 ? bottomEdge + 12 : 190;

            const { index, total } = getLevelGroupInfo(level.level);
            spaceshipHeight = getLevelRowCenter(index, total);
            spaceshipPosition = 80;

            animateEntrance(spaceshipPosition, spaceshipHeight).then(() => {
                startFloatAnimation(spaceshipPosition, spaceshipHeight);
            });
        });
    });
}

function spaceshipFlying() {
    const leftPadding = 80;
    maxSteps = actualLevel.tasks * actualLevel.characterCount;
    maxPosition = window.innerWidth - 160 - leftPadding;
    spaceshipSpeed = maxPosition / maxSteps;
    spaceshipPosition += spaceshipSpeed * 0.9;

    stopFloatAnimation();
    startFloatAnimation(spaceshipPosition, spaceshipHeight);
}
