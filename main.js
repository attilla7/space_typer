import { startGame, exitGame, initializeGame } from './game.js';
import { showLevels, showLevelInfo } from './levels.js';
import { displayCurrentVersion, showVersionInfo, backToStart } from './version.js';

document.addEventListener('DOMContentLoaded', () => {
    const levelButtons = [
        { id: 'startLevel1', level: 1 },
        { id: 'startLevel6', level: 6 },
        { id: 'startLevel11', level: 11 },
        { id: 'startLevel16', level: 16 },
        { id: 'startLevel21', level: 21 },
        { id: 'startLevel26', level: 26 },
        { id: 'startLevel32', level: 32 },
        { id: 'startLevel36', level: 36 }
    ];

    //levelButtons.forEach(({ id, level }) => {
    //    document.getElementById(id).addEventListener('click', () => startGame(level));
    //});

    document.getElementById('startGame').addEventListener('click', () => {
        startGame(1);
    });

    document.getElementById('selectLevel').addEventListener('click', showLevels);
    document.getElementById('backToStart').addEventListener('click', () => {
        document.getElementById('levelScreen').style.display = 'none';
        document.getElementById('startScreen').style.display = 'block';
    });

    //document.getElementById('exitButton').addEventListener('click', exitGame);
    document.getElementById('currentVersion').addEventListener('click', showVersionInfo);
    //document.getElementById('backButton').addEventListener('click', backToStart);

    fetch('levels.json')
        .then(response => response.json())
        .then(data => initializeGame(data))
        .catch(error => console.error("Hiba a szintek betöltésekor:", error));

    displayCurrentVersion();

//    window.addEventListener('load', () => {
//        displayVersion();
//    });
});
