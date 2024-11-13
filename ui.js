//export function updateDisplays(score, tasksLeft, level) {
//    document.getElementById('scoreDisplay').textContent = `Pontszám: ${score}`;
//    document.getElementById('tasksDisplay').textContent = `Hátralévő feladatok: ${tasksLeft}`;
//}

export function updateDisplays(score, tasksLeft, level) {
    document.getElementById('score').textContent = score;
    document.getElementById('tasksLeft').textContent = tasksLeft;
    if (tasksLeft === 0) {
        showCompletionMessage(level);
    }
}

function showCompletionMessage(level) {
    alert(`Gratulálunk! A(z) ${level}. szint teljesítve.`);
    // További funkció hozzáadható később, mint például statisztika kijelzése vagy folytatás.
}
