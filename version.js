// Verzió kijelzése a kezdőoldalon
export function displayCurrentVersion(versionDisplay) {
    fetch('version.json')
        .then(response => {
            if (!response.ok) throw new Error("Nem sikerült betölteni a verzió adatokat.");
            return response.json();
        })
        .then(data => {
            const currentVersion = data.current_version;
            versionDisplay.textContent = `Verzió: ${currentVersion}`;
        })
        .catch(error => console.error("Hiba a verziók betöltésekor:", error));
}

// Verzióinformáció oldal megjelenítése
export function showVersionInfo() {
    const versionInfoPage = document.getElementById('versionInfoPage');
    const startScreen = document.getElementById('startScreen');
    const versionList = document.getElementById('versionList');
    
    // Oldalváltás: kezdőoldal elrejtése, verzióoldal megjelenítése
    startScreen.style.display = 'none';
    versionInfoPage.style.display = 'block';
    
    // Verzióinformációk betöltése és kiírása
    fetch('version.json')
        .then(response => {
            if (!response.ok) throw new Error("Nem sikerült betölteni a verzió adatokat.");
            return response.json();
        })
        .then(data => {
            // Verziólista frissítése
            versionList.innerHTML = ''; // Üres lista a verzióinformációkhoz
            data.versions.forEach(version => {
                const versionItem = document.createElement('li');
                versionItem.innerHTML = `<strong>Verzió: ${version.version} (${version.date})</strong><br>${version.description.join('<br>')}`;
                versionList.appendChild(versionItem);
            });
        })
        .catch(error => console.error("Verzióadatok betöltési hiba:", error));
}

// Visszatérés a kezdőoldalra a verzióoldalról
export function backToStart() {
    const versionInfoPage = document.getElementById('versionInfoPage');
    const startScreen = document.getElementById('startScreen');
    versionInfoPage.style.display = 'none';
    startScreen.style.display = 'block';
}