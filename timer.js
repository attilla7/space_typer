//timer.js

let startTime = null;
let elapsedTime = 0;
let timerInterval = null;

export function startTimer() {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(() => {
        elapsedTime = Date.now() - startTime;
        const timeElapsedElement = document.getElementById('timeElapsed');
        if (timeElapsedElement) {
            timeElapsedElement.textContent = `Idő: ${(elapsedTime / 1000).toFixed(2)} s`;
        }
    }, 100);
}

export function stopTimer() {
    clearInterval(timerInterval);
}

export function getTimeElapsed() {
    return elapsedTime / 1000; // Másodpercben
}

export function resetTimer() {
    elapsedTime = 0;
    clearInterval(timerInterval);
}
