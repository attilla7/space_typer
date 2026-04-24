// spaceship.js

const SHIPS = [
    { id: 1,  name: 'Árnyékvadász' },
    { id: 2,  name: 'Égnyíl' },
    { id: 3,  name: 'Csillagnyíl' },
    { id: 4,  name: 'Viharmadár' },
    { id: 5,  name: 'Holdszellem' },
    { id: 6,  name: 'Viharszárny' },
    { id: 7,  name: 'Napvágó' },
    { id: 8,  name: 'Méregszél' },
    { id: 9,  name: 'Árnyékkard' },
    { id: 10, name: 'Smaragdvadász' },
    { id: 11, name: 'Fekete Sólyom' },
    { id: 12, name: 'Éjfog' },
    { id: 13, name: 'Villámvadász' },
    { id: 14, name: 'Csillagtőr' },
    { id: 15, name: 'Jégdárda' },
    { id: 16, name: 'Árnyvadász' },
    { id: 17, name: 'Ködjáró' },
    { id: 18, name: 'Fényroham' },
    { id: 19, name: 'Villámszárny' },
    { id: 20, name: 'Zöldárnyék' },
    { id: 21, name: 'Tűzcsapás' },
    { id: 22, name: 'Hópenge' },
    { id: 23, name: 'Ködzúzó' },
    { id: 24, name: 'Holdvágó' },
    { id: 25, name: 'Azúrszárny' },
    { id: 26, name: 'Csillagőr' },
    { id: 27, name: 'Csillagvihar' },
    { id: 28, name: 'Árnyékláng' },
    { id: 29, name: 'Űrvihar' },
    { id: 30, name: 'Űrsólyom' },
    { id: 31, name: 'Villámkés' },
    { id: 32, name: 'Csillagszellem' },
    { id: 33, name: 'Ködvadász' },
    { id: 34, name: 'Űrjáró' },
    { id: 35, name: 'Égszem' },
    { id: 36, name: 'Égzúzó' },
    { id: 37, name: 'Árnyékkés' },
    { id: 38, name: 'Holdvihar' },
    { id: 39, name: 'Fényőr' },
    { id: 40, name: 'Fénydárda' },
];

let selectedShipId = null;

export function getShipImagePath(id) {
    return `pictures/spaceship_${String(id).padStart(2, '0')}.png`;
}

export function getSelectedShipId() {
    return selectedShipId;
}

export function getSelectedShipImagePath() {
    return getShipImagePath(selectedShipId);
}

// Véletlenszerű űrhajó betöltéskor
export function initSpaceship() {
    const randomId = Math.floor(Math.random() * 40) + 1;
    selectedShipId = randomId;
    updateSpaceshipDisplay();
}

function updateSpaceshipDisplay() {
    // Játékban az űrhajó kép frissítése
    const spaceshipEl = document.getElementById('spaceship');
    if (spaceshipEl) {
        spaceshipEl.src = getSelectedShipImagePath();
    }
    // Főoldalon az előnézet frissítése
    const previewEl = document.getElementById('spaceshipPreview');
    if (previewEl) {
        previewEl.src = getSelectedShipImagePath();
    }
    // Főoldalon a név frissítése
    const nameEl = document.getElementById('spaceshipName');
    if (nameEl) {
        const ship = SHIPS.find(s => s.id === selectedShipId);
        nameEl.textContent = ship ? ship.name : '';
    }
}

// Választó modal felépítése és kezelése
export function setupSpaceshipSelector() {
    initSpaceship();

    const editBtn = document.getElementById('editSpaceshipButton');
    const modal = document.getElementById('spaceshipModal');
    const grid = document.getElementById('spaceshipGrid');
    const cancelBtn = document.getElementById('cancelSpaceshipButton');

    if (!editBtn || !modal || !grid || !cancelBtn) return;

    // Grid feltöltése
    SHIPS.forEach(ship => {
        const item = document.createElement('div');
        item.className = 'spaceshipGridItem';
        item.dataset.id = ship.id;

        const img = document.createElement('img');
        img.src = getShipImagePath(ship.id);
        img.alt = ship.name;
        img.width = 40;
        img.height = 40;

        const label = document.createElement('span');
        label.textContent = ship.name;

        item.appendChild(img);
        item.appendChild(label);

        item.addEventListener('click', () => {
            selectedShipId = ship.id;
            updateSpaceshipDisplay();
            modal.style.display = 'none';
            document.getElementById('startScreen').style.display = 'block';
        });

        grid.appendChild(item);
    });

    editBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        document.getElementById('startScreen').style.display = 'none';
        // Kiemeljük az aktuálisan kiválasztottat
        grid.querySelectorAll('.spaceshipGridItem').forEach(item => {
            item.classList.toggle('selected', parseInt(item.dataset.id) === selectedShipId);
        });
    });

    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.getElementById('startScreen').style.display = 'block';
    });
}
