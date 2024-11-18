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
let characters = null;
let maxSteps = null;
let maxPosition = null;

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
    characters = actualLevel.characterCount;

    // Játék kezdete: űrhajó pozíciója
    document.getElementById('spaceship').style.left = spaceshipPosition + 'px';
    document.getElementById('spaceship').style.top = spaceshipHeight + 'px';

    // Szint információk megjelenítése
    showLevelInfo(actualLevel);
}

function generateTarget(keys) {
    let keySequence = [];
    // Generáljunk egy karakterláncot a characterCount alapján
    for (let i = 0; i < actualLevel.characterCount; i++) {
        const letter = keys[Math.floor(Math.random() * keys.length)];
        keySequence.push(letter);
    }

    currentLetter = keySequence.join(''); // Az összes karaktert most már egy karakterlánccá alakítjuk

    document.getElementById('targetText').textContent = `Nyomd meg: ${currentLetter.toUpperCase()}`;
}

document.addEventListener('keydown', (event) => {
    if (currentLetter[0] === event.key) { // Ellenőrizzük, hogy az első karakter egyezik-e a megnyomott billentyűvel
        currentLetter = currentLetter.slice(1); // Eltávolítjuk az első karaktert, ha helyes volt
        score++;

        // Ha nincs több karakter, csökkentjük a feladatok számát
        if (currentLetter.length === 0) {
            tasksLeft--; // Feladatok számának csökkentése, ha minden karaktert beírtak
            generateTarget(actualLevel.keys); // Új karakterek generálása
        }

        spaceshipFlying();

        // Ha nincs több hátralévő feladat, vagy elérte a célt, befejezzük a szintet
        if (tasksLeft <= 0) {
            showCompletionMessage(actualLevel.level);  // Sikeres szint üzenet
            nextLevel();               // Következő szint elindítása
        }

        updateDisplays(startLevel, score, tasksLeft, actualLevel.level);  // Képernyő frissítése
    }
});

function nextLevel() {
    if (!actualLevel) return; //????????????????

    // Következő szint adatainak beállítása
    const nextLevelData = levelData.find(l => l.level === actualLevel.level + 1);
    if (!nextLevelData) return;

    actualLevel = nextLevelData;
    tasksLeft = actualLevel.tasks;
    characters = nextLevelData.characterCount;

    const levelIds1 = [
        104, 107, 110
    ];
    const levelIds2 = [
        6, 11, 16, 21, 26,
        31, 36, 41, 46, 51, 56,
        61, 66, 71, 76
    ];
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
    console.log(`Szint elindítva: ${level.level}`); //debug
    console.log(`Feladatok száma: ${level.tasks}`); //debug
    console.log(`Karakterek száma: ${level.characterCount}`); //debug
    console.log(`Gombok: ${level.keys}`); //debug

    // Szint adatainak beállítása
    actualLevel = level;
    tasksLeft = level.tasks;
    characters = level.characterCount;
    
    // Kezdő képernyő eltüntetése
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('levelInfo').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.getElementById('backButtonScreen').style.display = 'block';

    // cél generálása
    generateTarget(actualLevel.keys);

    // Megjelenítések frissítése
    updateDisplays(startLevel, score, tasksLeft, actualLevel.level);
}

function spaceshipFlying() {
        // Maximális lépések számának kiszámítása
        maxSteps = actualLevel.tasks * actualLevel.characterCount;
        // Maximális pozíció számítása (képernyő szélessége - űrhajó szélessége)
        maxPosition = window.innerWidth - 160; // ha 60px az űrhajó szélessége
        spaceshipSpeed = maxPosition / maxSteps;
 //       spaceshipPosition += spaceshipSpeed * 20;  // Űrhajó pozíciójának frissítése
        spaceshipPosition += spaceshipSpeed * 0.9;  // Űrhajó pozíciójának frissítése
        document.getElementById('spaceship').style.left = spaceshipPosition + 'px';
}