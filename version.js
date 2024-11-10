export function displayCurrentVersion() {
    fetch('versions.json')
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

    fetch('versions.json')
        .then(response => response.json())
        .then(data => {
            const versionHistory = document.getElementById('versionHistory');
            if (versionHistory) {
                versionHistory.innerHTML = '';
                data.versions.forEach(version => {
                    const versionItem = document.createElement('div');
                    versionItem.textContent = `${version.version} - ${version.date}: ${version.description.join(', ')}`;
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
