//name.js

let playerName = "Névtelen űrhajós kapitány";

export function setupNameManagement() {
    const playerNameDisplay = document.getElementById("playerName");
    const currentPlayerName = document.getElementById("currentPlayerName");
    const editNameButton = document.getElementById("editNameButton");
    const nameModal = document.getElementById("nameModal");
    const playerNameInput = document.getElementById("playerNameInput");
    const saveNameButton = document.getElementById("saveNameButton");
    const cancelNameButton = document.getElementById("cancelNameButton");
    const resetNameButton = document.getElementById("resetNameButton");

    if (!playerNameDisplay || !currentPlayerName || !editNameButton || !nameModal || 
        !playerNameInput || !saveNameButton || !cancelNameButton || !resetNameButton) {
        console.error("Egy vagy több szükséges elem nem található.");
        return;
    }

    // Név megjelenítése
    function updatePlayerNameDisplays() {
        playerNameDisplay.textContent = playerName;
        currentPlayerName.textContent = playerName;
    }

    // "Név módosítása" gomb eseménykezelő
    editNameButton.addEventListener("click", () => {
        nameModal.style.display = "block";
        document.getElementById('startScreen').style.display = 'none';
        playerNameInput.value = playerName === "Névtelen űrhajós kapitány" ? "" : playerName;
    });

    // Mentés gomb eseménykezelő
    saveNameButton.addEventListener("click", () => {
        const newName = playerNameInput.value.trim();
        playerName = newName || "Névtelen űrhajós kapitány";
        updatePlayerNameDisplays();
        nameModal.style.display = "none";
        document.getElementById('startScreen').style.display = 'block';
    });

    // Mégse gomb eseménykezelő
    cancelNameButton.addEventListener("click", () => {
        nameModal.style.display = "none";
        document.getElementById('startScreen').style.display = 'block';
    });

    // Név törlése gomb eseménykezelő
    resetNameButton.addEventListener("click", () => {
        playerName = "Névtelen űrhajós kapitány";
        updatePlayerNameDisplays();
        nameModal.style.display = "none";
        document.getElementById('startScreen').style.display = 'block';
    });

    // Kezdeti frissítés
    updatePlayerNameDisplays();
}

export function getPlayerName() {
    return playerName;
}