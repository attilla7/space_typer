export function displayCurrentVersion() {
    fetch('version.json')
        .then(response => response.json())
        .then(data => {
            const versionElement = document.getElementById('currentVersion');
            if (versionElement) {
                versionElement.textContent = `Verzió: ${data.current_version}`;
            }
        })
        .catch(error => console.error("Hiba a verziók betöltésekor:", error));
}

export function showVersionInfo() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('versionDetails').style.display = 'block';

    fetch('version.json')
        .then(response => response.json())
        .then(data => {
            const versionHistory = document.getElementById('versionHistory');
            if (versionHistory) {
                data.versions.forEach(version => {
                    const versionItem = document.createElement('div');
                    
                    // Verzió és dátum kiírása
                    const versionHeader = document.createElement('h3');
                    versionHeader.textContent = `${version.version} - ${version.date}`;
                    versionItem.appendChild(versionHeader);
                    
                    // A description tömb elemeinek egymás alá írása
                    version.description.forEach(descriptionText => {
                        const descriptionElement = document.createElement('p');
                        descriptionElement.textContent = descriptionText;
                        versionItem.appendChild(descriptionElement);
                    });
                
                    versionHistory.appendChild(versionItem);
                });
            }
        })
        .catch(error => console.error("Verzióadatok betöltési hiba:", error));
}

export function backToStart() {
    document.getElementById('versionDetails').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
}

export function displayVersion() {
    const versionElement = document.getElementById('version');
    versionElement.textContent = 'Verzió: 1.2 - Kiterjesztett szintek és funkciók';
}