export function updateDisplays(score, tasksLeft, level) {
    document.getElementById('scoreDisplay').textContent = `Pontszám: ${score}`;
    document.getElementById('tasksDisplay').textContent = `Hátralévő feladatok: ${tasksLeft}`;
}
