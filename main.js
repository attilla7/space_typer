//main.js

import { startGame, initializeGame, levelStart } from './game.js';
import { showLevels, showLevelInfo } from './levels.js';
import { displayCurrentVersion, showVersionInfo } from './version.js';
import { setupNameManagement, getPlayerName } from "./name.js";

document.addEventListener('DOMContentLoaded', () => {

    setupNameManagement();

    // Kezdőoldal elemeinek megjelenítése
    document.getElementById('startScreen').style.display = 'block';

    // Szintek betöltése és inicializálása
    fetch('levels.json')
        .then(response => response.json())
        .then(data => {
            // A szintek adatainak inicializálása
            initializeGame(data); // Meghívjuk az initializeGame függvényt
            showLevels(); // Szintek megjelenítése
        })
        .catch(error => console.error('Szintek betöltése nem sikerült:', error));

    // Vissza gomb
    document.getElementById('backButton').addEventListener('click', () => backback());

    // JSON betöltése
    const levelButtonsContainer = document.getElementById('levelButtonsContainer');
    levelButtonsContainer.innerHTML = ''; // Törölni az előző gombokat.

    displayCurrentVersion();
    // Verziószám kattintásra
    document.getElementById('currentVersion').addEventListener('click', showVersionInfo);

});

function backback() {
    document.getElementById('startScreen').style.display = 'block';
    document.getElementById('versionDetails').style.display = 'none';
    document.getElementById('versionSection').style.display = 'block';
    document.getElementById('backButtonScreen').style.display = 'none';
    document.getElementById('game').style.display = 'none';
    document.getElementById('levelInfo').style.display = 'none';
}
