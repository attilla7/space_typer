import { startGame, initializeGame } from './game.js';
import { showLevels, showLevelInfo } from './levels.js';
import { displayCurrentVersion, showVersionInfo } from './version.js';

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

 //   document.getElementById('startGame').addEventListener('click', () => {
 //       startGame();
 //   });

 //   document.getElementById('selectLevel').addEventListener('click', showLevels);
    document.getElementById('backButton').addEventListener('click', () => {
        document.getElementById('startScreen').style.display = 'block';
        document.getElementById('versionDetails').style.display = 'none';
        document.getElementById('versionPage').style.display = 'none';
        document.getElementById('versionSection').style.display = 'block';
        document.getElementById('versionSection').style.display = 'block';
        document.getElementById('backButtonScreen').style.display = 'none';
    })

    //document.getElementById('exitButton').addEventListener('click', exitGame);
    document.getElementById('currentVersion').addEventListener('click', showVersionInfo);
    document.getElementById('backButton').addEventListener('click', backToStart);

    fetch('levels.json')
        .then(response => response.json())
        .then(data => initializeGame(data))
        .catch(error => console.error("Hiba a szintek betöltésekor:", error));

    displayCurrentVersion();

//    window.addEventListener('load', () => {
//        displayVersion();
//    });
});

function backToStart() {
    document.getElementById('game').style.display = 'none';
    document.getElementById('versionDetails').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
    document.getElementById('backButtonScreen').style.display = 'none';


    document.getElementById('backButton').addEventListener('click', () => {
        document.getElementById('startScreen').style.display = 'block';
        document.getElementById('levelScreen').style.display = 'none';
        document.getElementById('game').style.display = 'none';
        document.getElementById('levelInfo').style.display = 'none';
        document.getElementById('versionDetails').style.display = 'none';
        document.getElementById('backButtonScreen').style.display = 'none';
     })
}

// Dinamikus gombok generálása a kezdőoldalon
function loadLevelButtons() {
    const levelButtonsContainer = document.getElementById('levelButtonsContainer');
    levelButtonsContainer.innerHTML = ''; // Gombok törlése (ha újratöltjük)

    fetch('levels.json')
        .then(response => response.json())
        .then(levels => {
            const levelIds = [
                101, 104, 107, 110,
                1, 6, 11, 16, 21, 26,
                31, 36, 41, 46, 51, 56,
                61, 66, 71, 76
            ];
            
            levelIds.forEach(levelId => {
                if (levels[levelId]) {
                    const button = document.createElement('button');
                    button.innerText = `Szint ${levelId}`;
                    button.classList.add('level-button');
                    button.onclick = () => startGame(levelId, levels[levelId]);
                    levelButtonsContainer.appendChild(button);
                }
            });
        })
        .catch(error => console.error('Failed to load levels:', error));
}

// Oldal betöltésekor a kezdőoldal frissítése
window.onload = () => {
    loadLevelButtons();
};