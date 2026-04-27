// timer.js

let startTime = null;
let elapsedTime = 0;
let timerInterval = null;

function formatTimeDisplay(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const cs = Math.round((seconds % 1) * 100);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(cs).padStart(2, '0')}`;
}

export function startTimer() {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(() => {
        elapsedTime = Date.now() - startTime;
        const timeElapsedElement = document.getElementById('timeElapsed');
        if (timeElapsedElement) {
            timeElapsedElement.textContent = `Idő: ${formatTimeDisplay(elapsedTime / 1000)}`;
        }
    }, 100);
}

export function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

export function getTimeElapsed() {
    return elapsedTime / 1000;
}

export function resetTimer() {
    elapsedTime = 0;
    clearInterval(timerInterval);
    timerInterval = null;
}
