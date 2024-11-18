//ui.js

export function updateDisplays(level1, score, tasksLeft, level) {
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
    alert(`Gratulálunk! A(z) ${level}. szint teljesítve.`);
    // További funkció hozzáadható később, mint például statisztika kijelzése vagy folytatás.
}
