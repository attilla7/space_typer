// name.js

let playerName = "Névtelen űrhajós kapitány";

export function setupNameManagement() {
    const playerNameDisplay  = document.getElementById("playerName");
    const currentPlayerName  = document.getElementById("currentPlayerName");
    const profileNameDisplay = document.getElementById("profileNameDisplay");
    const editProfileButton  = document.getElementById("editProfileButton");
    const playerNameInput    = document.getElementById("playerNameInput");
    const saveNameButton     = document.getElementById("saveNameButton");
    const cancelNameButton   = document.getElementById("cancelNameButton");
    const resetNameButton    = document.getElementById("resetNameButton");

    function updatePlayerNameDisplays() {
        if (playerNameDisplay)  playerNameDisplay.textContent  = playerName;
        if (currentPlayerName)  currentPlayerName.textContent  = playerName;
        if (profileNameDisplay) profileNameDisplay.textContent = playerName;
    }

    function openProfile() {
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('profileScreen').style.display = 'block';
        document.getElementById('backButtonScreen').style.display = 'block';
        if (playerNameInput) {
            playerNameInput.value = playerName === "Névtelen űrhajós kapitány" ? "" : playerName;
        }
        updatePlayerNameDisplays();
    }

    function closeProfile() {
        document.getElementById('profileScreen').style.display = 'none';
        document.getElementById('startScreen').style.display = 'block';
        document.getElementById('backButtonScreen').style.display = 'none';
    }

    if (editProfileButton) editProfileButton.addEventListener("click", openProfile);

    if (saveNameButton) saveNameButton.addEventListener("click", () => {
        const newName = playerNameInput ? playerNameInput.value.trim() : '';
        playerName = newName || "Névtelen űrhajós kapitány";
        updatePlayerNameDisplays();
        closeProfile();
    });

    if (cancelNameButton) cancelNameButton.addEventListener("click", closeProfile);

    if (resetNameButton) resetNameButton.addEventListener("click", () => {
        playerName = "Névtelen űrhajós kapitány";
        updatePlayerNameDisplays();
        closeProfile();
    });

    updatePlayerNameDisplays();
}

export function getPlayerName() {
    return playerName;
}
