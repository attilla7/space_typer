//game.js

import { updateDisplays, showCompletionMessage } from './ui.js';
import { showLevelInfo } from './levels.js';

let actualLevel = null;  // A globális változó a kiválasztott szinthez
let startLevel = null; //később lesz rá szükség
let score = 0;  // Reset játékállapot
let tasksLeft = 5;
let spaceshipSpeed = 1;
let spaceshipPosition = 0;
let spaceshipHeight = 80;
let currentLetter = '';
let levelData = [];  // A globális változó a szintek adatainak tárolásához

export function initializeGame(data) {
    levelData = data.levels;  // A szintek adatainak betöltése
}

// Játék indítása egy adott szinttel
export function startGame(selectedLevel) {
    // Beállítjuk a kiválasztott szintet
    actualLevel = levelData.find(level => level.level === selectedLevel);
    startLevel = actualLevel.level;

    if (!actualLevel) {
        console.error(`A szint adatai nem találhatók: ${selectedLevel}`);
        return;
    }
    // Reset játékállapot
    spaceshipPosition = 0;
    spaceshipHeight = 80;
    tasksLeft = actualLevel.tasks;
    spaceshipSpeed = actualLevel.characterCount;

    // Játék kezdete: űrhajó pozíciója és kezdő képernyő eltüntetése

    document.getElementById('spaceship').style.left = spaceshipPosition + 'px';
    document.getElementById('spaceship').style.top = spaceshipHeight + 'px';

    // Szint információk megjelenítése
    showLevelInfo(actualLevel);
}

function generateTarget(keys) {
    currentLetter = keys[Math.floor(Math.random() * keys.length)];
    document.getElementById('targetText').textContent = `Nyomd meg: ${currentLetter.toUpperCase()}`;
}

// Billentyű lenyomás figyelése
document.addEventListener('keydown', (event) => {
    if (event.key === currentLetter) {

        score++;
        tasksLeft--;
        spaceshipPosition += spaceshipSpeed * 20;
        document.getElementById('spaceship').style.left = spaceshipPosition + 'px';

        // Ellenőrizzük, hogy van-e még hátralévő feladat, vagy a szint befejeződött
        if (tasksLeft <= 0 || spaceshipPosition >= window.innerWidth - 60) {
            showCompletionMessage();
            nextLevel();
        } else {
            generateTarget(actualLevel.keys);  // Frissítjük a következő célt
        }

        updateDisplays(startLevel, score, tasksLeft, actualLevel.level);
    }
});

function nextLevel() {
    if (!actualLevel) return; //????????????????

    // Következő szint adatainak beállítása
    const nextLevelData = levelData.find(l => l.level === actualLevel.level + 1);
    if (!nextLevelData) return;

    actualLevel = nextLevelData;
    tasksLeft = actualLevel.tasks;
    spaceshipSpeed = actualLevel.characterCount;

    const levelIds1 = [
        104, 107, 110
    ];
    const levelIds2 = [
        6, 11, 16, 21, 26,
        31, 36, 41, 46, 51, 56,
        61, 66, 71, 76
    ];
    console.log(`actualLevel.level ${actualLevel.level}`);
    if (levelIds1.includes(actualLevel.level)) {  // szám blokk vége
            startGame(actualLevel.level);
        } else if (levelIds2.includes(actualLevel.level)) {  // betű blokk vége
            startGame(actualLevel.level);
        } else if (actualLevel.level === 113) {  // betű blokk vége
            alert(`Befejezted a 12. számbillentyűs szintet.`);
            backback();
        } else if (actualLevel.level === 81) {  // betű blokk vége
            alert(`Befejezted a 80. kétkezes szintet.`);
            backback();
        } else {  // simán következő szint
            // Visszaállítjuk a pozíciókat az új szint kezdéséhez
            spaceshipPosition = 0;
            spaceshipHeight += 50;
            document.getElementById('spaceship').style.left = spaceshipPosition + 'px';
            document.getElementById('spaceship').style.top = spaceshipHeight + 'px';

            // Új cél generálása
            generateTarget(actualLevel.keys);
            updateDisplays(startLevel, score, tasksLeft, actualLevel.level);
        }
    };



// Szint indítása
export function levelStart(level) {
    console.log(`Szint elindítva: ${level.level}`);
    console.log(`Feladatok száma: ${level.tasks}`);
    console.log(`Karakterek száma: ${level.characterCount}`);
    console.log(`Gombok: ${level.keys}`);
    // Itt helyezheted el a szint elindításához szükséges funkciókat
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('levelInfo').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.getElementById('backButtonScreen').style.display = 'block';

    // cél generálása
    generateTarget(actualLevel.keys);

    // Megjelenítések frissítése
    updateDisplays(startLevel, score, tasksLeft, actualLevel.level);


}