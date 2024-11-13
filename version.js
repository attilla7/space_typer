// Változó a verziók betöltésének nyomon követésére
let versionLoaded = 'empty';

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
    // Ellenőrizzük, hogy a verziók már betöltöttek-e

    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('versionDetails').style.display = 'block';
    document.getElementById('backStartscreen').style.display = 'block';
//    document.getElementById('versionSection').style.display = 'block';

    if (versionLoaded === 'loaded') {
        return; // Ha igen, nem töltjük be újra
    }

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
    
            // Verziók sikeres betöltése után állítsuk "loaded" értékre
    versionLoaded = 'loaded';
}

export function backToStart() {
    document.getElementById('versionDetails').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
    document.getElementById('backStartscreen').style.display = 'none';


    document.getElementById('backButton').addEventListener('click', () => {
        document.getElementById('startScreen').style.display = 'block';
        document.getElementById('versionDetails').style.display = 'none';
        document.getElementById('versionPage').style.display = 'none';
        document.getElementById('versionSection').style.display = 'block';
        document.getElementById('backStartscreen').style.display = 'none';
    })
}