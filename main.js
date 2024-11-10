import { startGame, exitGame, initializeGame } from './game.js';
import { displayCurrentVersion, showVersionInfo, backToStart } from './version.js';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('startLevel1').addEventListener('click', () => startGame(1));
    document.getElementById('startLevel2').addEventListener('click', () => startGame(2));
    document.getElementById('startLevel3').addEventListener('click', () => startGame(3));
    document.getElementById('exitButton').addEventListener('click', exitGame);
    document.getElementById('currentVersion').addEventListener('click', showVersionInfo);
    document.getElementById('backButton').addEventListener('click', backToStart);

    fetch('levels.json')
        .then(response => response.json())
        .then(data => initializeGame(data))
        .catch(error => console.error("Hiba a szintek betöltésekor:", error));

    displayCurrentVersion();
});
