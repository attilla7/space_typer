// main.js

import { startGame, initializeGame, levelStart, openStatsFromEnd, startLevel, stopBackgroundExplosions } from './game.js';
import { showLevels, showLevelInfo } from './levels.js';
import { displayCurrentVersion, showVersionInfo } from './version.js';
import { setupNameManagement, getPlayerName } from "./name.js";
import { showStats } from './stats.js';
import { setupSpaceshipSelector } from './spaceship.js';

document.addEventListener('DOMContentLoaded', () => {

    setupNameManagement();
    setupSpaceshipSelector();

    document.getElementById('startScreen').style.display = 'block';

    fetch('levels.json')
        .then(response => response.json())
        .then(data => {
            initializeGame(data);
            showLevels();
        })
        .catch(error => console.error('Szintek betöltése nem sikerült:', error));

    document.querySelectorAll('.logoSmall').forEach(logo => {
        logo.addEventListener('click', () => backback());
    });

    displayCurrentVersion();
    document.getElementById('currentVersion').addEventListener('click', showVersionInfo);

    document.getElementById('statsButton').addEventListener('click', () => showStats(null));

    document.getElementById('ujjrendButton').addEventListener('click', () => {
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('ujjrendScreen').style.display = 'block';
    });

    document.getElementById('endRestartButton').addEventListener('click', () => {
        stopBackgroundExplosions();
        document.getElementById('endScreen').style.display = 'none';
        document.getElementById('game').style.display = 'none';
        startGame(startLevel);
    });

    document.getElementById('endStatsButton').addEventListener('click', () => {
        stopBackgroundExplosions();
        document.getElementById('game').style.display = 'none';
        openStatsFromEnd();
    });

    document.getElementById('endMenuButton').addEventListener('click', () => {
        stopBackgroundExplosions();
        document.getElementById('endScreen').style.display = 'none';
        document.getElementById('game').style.display = 'none';
        document.getElementById('startScreen').style.display = 'block';
    });

});

function backback() {
    stopBackgroundExplosions();
    document.getElementById('startScreen').style.display = 'block';
    document.getElementById('versionDetails').style.display = 'none';
    document.getElementById('versionSection').style.display = 'block';
    document.getElementById('game').style.display = 'none';
    document.getElementById('levelInfo').style.display = 'none';
    document.getElementById('statsScreen').style.display = 'none';
    document.getElementById('endScreen').style.display = 'none';
    document.getElementById('ujjrendScreen').style.display = 'none';
    document.getElementById('profileScreen').style.display = 'none';
}
