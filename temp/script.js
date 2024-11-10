document.addEventListener('DOMContentLoaded', () => {
    // HTML elemek lekérése
    const spaceship = document.getElementById('spaceship');
    const targetText = document.getElementById('targetText');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const tasksLeftDisplay = document.getElementById('tasksLeftDisplay');
    const levelDisplay = document.getElementById('levelDisplay');

    const startScreen = document.getElementById('startScreen');
    const gameContainer = document.getElementById('game');
    gameContainer.style.display = 'none'; // Kezdetben rejtve van a játékterület

    let spaceshipPosition = 0;
    let spaceshipHeight = 50; // Kezdeti magasság a bal felső sarokban
    let score = 0;
    let level = 1;
    let tasksLeft = 5;
    let spaceshipSpeed = 1;
    const letters = ['f', 'j', 'd', 'k']; // Kezdő betűk listája, bővíthető
    let currentLetter = '';
    let levelData = [];

    // Cél betű generálása
    function generateTarget() {
        currentLetter = letters[Math.floor(Math.random() * letters.length)];
        targetText.textContent = `Nyomd meg: ${currentLetter.toUpperCase()}`;
    }

    // Kezdeti magasság módosítása csak az első szint indításkor
    spaceshipHeight = 80; // Az első szintnél 80px-re kezdjük
    spaceship.style.left = spaceshipPosition + 'px';
    spaceship.style.top = spaceshipHeight + 'px'; // Kezdő pozíció 80px

    // Szint frissítése JSON adatok alapján
    function nextLevel() {
        level++;
        const currentLevelData = levelData.find(l => l.level === level) || levelData[levelData.length - 1];
        tasksLeft = currentLevelData.tasks;
        spaceshipSpeed = currentLevelData.spaceshipSpeed;
    
        spaceshipPosition = 0;
        spaceshipHeight += 50;  // Minden szintnél 50 pixellel lejjebb
        spaceship.style.top = spaceshipHeight + 'px';  // A szintlépéskor már növeli a pozíciót
        spaceship.style.left = spaceshipPosition + 'px';
        generateTarget();
        updateDisplays();
    }

    // Kijelzők frissítése
    function updateDisplays() {
        scoreDisplay.textContent = `Pontszám: ${score}`;
        tasksLeftDisplay.textContent = `Feladatok hátra: ${tasksLeft}`;
        levelDisplay.textContent = `Szint: ${level}`;
    }

    // Játék indítása
    window.startGame = function(selectedLevel) {
        if (levelData.length === 0) {
            console.error("A szintadatok nem töltődtek be.");
            return;
        }
    
        level = selectedLevel;
        const initialLevelData = levelData.find(l => l.level === level) || levelData[0];
        tasksLeft = initialLevelData.tasks;
        spaceshipSpeed = initialLevelData.spaceshipSpeed;
    
        score = 0;
        spaceshipPosition = 0;
        spaceshipHeight = 80;
        spaceship.style.left = spaceshipPosition + 'px';
        spaceship.style.top = spaceshipHeight + 'px';
        startScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        generateTarget();
        updateDisplays();
    };

    // Játék kilépés
    window.exitGame = function() {
        gameContainer.style.display = 'none';
        startScreen.style.display = 'block';
    }

    // Billentyű lenyomás esemény
    document.addEventListener('keydown', (event) => {
        if (event.key === currentLetter) {
            score++;
            tasksLeft--;
            spaceshipPosition += spaceshipSpeed * 20;
            spaceship.style.left = spaceshipPosition + 'px';

            if (tasksLeft <= 0) {
                nextLevel();
            } else if (spaceshipPosition >= window.innerWidth - spaceship.offsetWidth) {
                nextLevel();
            } else {
                generateTarget();
            }
            updateDisplays();
        }
    });

    // JSON adat betöltése
    fetch('levels.json')
        .then(response => response.json())
        .then(data => {
            levelData = data.levels;
        })
        .catch(error => console.error('Hiba a szintadatok betöltésénél:', error));
});
