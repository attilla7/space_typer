export function updateDisplays(score, tasksLeft, level) {
    document.getElementById('scoreDisplay').textContent = `Pontszám: ${score}`;
    document.getElementById('tasksLeftDisplay').textContent = `Feladatok hátra: ${tasksLeft}`;
    document.getElementById('levelDisplay').textContent = `Szint: ${level}`;
}
