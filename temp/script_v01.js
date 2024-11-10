document.addEventListener('DOMContentLoaded', () => {
    const spaceship = document.getElementById('spaceship');
    const targetText = document.getElementById('targetText');
    let spaceshipPosition = 0;

    // Betűk listája az egyes szintekhez (később bővíthető)
    const letters = ['f', 'j', 'd', 'k'];
    let currentLetter = '';

    // Új cél betű generálása
    function generateTarget() {
        currentLetter = letters[Math.floor(Math.random() * letters.length)];
        targetText.textContent = `Nyomd meg: ${currentLetter.toUpperCase()}`;
    }

    // Első betű generálása
    generateTarget();

    // Billentyű esemény figyelése
    document.addEventListener('keydown', (event) => {
        if (event.key === currentLetter) {
            spaceshipPosition += 20; // űrhajó előrelépése
            spaceship.style.left = spaceshipPosition + 'px';
            generateTarget(); // új betű generálása
        }
    });
});
