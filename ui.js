//ui.js

import { setupNameManagement, getPlayerName } from './name.js';
import { getTimeElapsed, stopTimer } from './timer.js';
import { levelGroupStartTime, getTotalGroupTime, setTotalGroupTime } from './game.js';

let levelTime = null;

export function updateDisplays(level1, score, tasksLeft, level) {
    // Az időt is frissítjük a kijelzőn
    const timeElapsed = getTimeElapsed().toFixed(2);  // Másodpercben
    document.getElementById('timeElapsed').textContent = `Idő: ${timeElapsed} s`;
    
    if (level > 100 && level < 113) {
        document.getElementById('level').textContent = level + " / 101-112";
      } else if (level > 0 && level < 81) {
        document.getElementById('level').textContent = level + " /80";
      } else {
        document.getElementById('level').textContent = level;
      }

      // További adatok frissítése
     document.getElementById('level1').textContent = level1;
    document.getElementById('score').textContent = score;
    document.getElementById('tasksLeft').textContent = tasksLeft;

    // Ha nincs hátralévő feladat, akkor megjelenítjük a szint sikeres teljesítését
    if (tasksLeft === 0) {
        showCompletionMessage(level);
    }
}

export function showCompletionMessage(level) {
  levelTime = getTimeElapsed(); // Az aktuális szint ideje
  const endMessage = `Gratulálok, ${getPlayerName()}! Teljesítetted a(z) ${level}. szintet ${levelTime.toFixed(2)} másodperc alatt.`;
  alert(endMessage);
    // Ha a szint befejeződött, hívjuk a levelCompleted függvényt
    levelCompleted();
    // További funkció hozzáadható később, mint például statisztika kijelzése vagy folytatás.
}

// Szint befejezése
function levelCompleted() {
  stopTimer();
  levelTime = getTimeElapsed();
  console.log(`A szintet ${levelTime.toFixed(2)} másodperc alatt teljesítetted.`);

  // Szintcsoport időmérése
  if (levelGroupStartTime) {
      let totalGroupTime = getTotalGroupTime(); // Az aktuális érték lekérdezése
      console.log("totalGroupTime type:", typeof totalGroupTime);   //debugging
      totalGroupTime += levelTime;
      setTotalGroupTime(totalGroupTime); // Új érték beállítása
      const groupTime = getTimeElapsed() - levelGroupStartTime;
      console.log(`Az eddigi szintcsoportot ${totalGroupTime.toFixed(2)} másodperc alatt teljesítetted.`);
  }

  // További szintbefejezés logika...
}
