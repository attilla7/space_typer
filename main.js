// main.js

import { startGame, initializeGame, levelStart, openStatsFromEnd } from './game.js';
import { showLevels, showLevelInfo } from './levels.js';
import { displayCurrentVersion, showVersionInfo } from './version.js';
import { setupNameManagement, getPlayerName } from "./name.js";
import { showStats, hideStats } from './stats.js';
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

    document.getElementById('backButton').addEventListener('click', () => backback());

    displayCurrentVersion();
    document.getElementById('currentVersion').addEventListener('click', showVersionInfo);

    document.getElementById('statsButton').addEventListener('click', () => showStats(null));
    document.getElementById('statsBackButton').addEventListener('click', hideStats);

    document.getElementById('ujjrendButton').addEventListener('click', () => {
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('ujjrendScreen').style.display = 'block';
        document.getElementById('backButtonScreen').style.display = 'block';
    });

    document.getElementById('endStatsButton').addEventListener('click', () => openStatsFromEnd());

    document.getElementById('endMenuButton').addEventListener('click', () => {
        document.getElementById('endScreen').style.display = 'none';
        document.getElementById('startScreen').style.display = 'block';
    });

});

function backback() {
    document.getElementById('startScreen').style.display = 'block';
    document.getElementById('versionDetails').style.display = 'none';
    document.getElementById('versionSection').style.display = 'block';
    document.getElementById('backButtonScreen').style.display = 'none';
    document.getElementById('game').style.display = 'none';
    document.getElementById('levelInfo').style.display = 'none';
    document.getElementById('statsScreen').style.display = 'none';
    document.getElementById('endScreen').style.display = 'none';
    document.getElementById('ujjrendScreen').style.display = 'none';
    document.getElementById('profileScreen').style.display = 'none';
}
