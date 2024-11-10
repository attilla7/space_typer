import { displayCurrentVersion, showVersionInfo, backToStart } from './version.js';
import { startGame } from './game.js';

// DOMContentLoaded esemény a biztos betöltéshez
document.addEventListener('DOMContentLoaded', () => {
    
    // Kezdőoldali elemek
    const versionDisplay = document.getElementById('currentVersion');
    const versionInfoPage = document.getElementById('versionInfoPage');
    const startScreen = document.getElementById('startScreen');
    const gameContainer = document.getElementById('game');
    const versionElement = document.getElementById('currentVersion');
 
    if (versionElement) {
        versionElement.addEventListener('click', showVersionInfo);
    }
    
    // Verzióinformáció kijelzése kezdőoldalon
    if (versionDisplay) {
        displayCurrentVersion(versionDisplay);
        versionDisplay.addEventListener('click', showVersionInfo);
    } else {
        console.error("Hiba: A currentVersion elem nem található.");
    }

    // Visszalépés a verzió oldalról a kezdőoldalra
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            backToStart();
        });
    } else {
        console.error("Hiba: A backButton elem nem található.");
    }
    
    // Játék indítása gombok kezelése
    const levelButtons = document.querySelectorAll('#levelSelection button');
    levelButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedLevel = parseInt(button.getAttribute('data-level'), 10);
            startScreen.style.display = 'none';
            gameContainer.style.display = 'block';
            startGame(selectedLevel);
        });
    });
});
