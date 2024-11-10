export function displayCurrentVersion() {
    fetch('versions.json')
        .then(response => response.json())
        .then(data => {
            document.getElementById('versionNumber').textContent = data.current_version;
            populateVersionList(data.versions);
        })
        .catch(error => console.error('Verzióadatok betöltési hiba:', error));
}

export function showVersionInfo() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('versionInfo').style.display = 'block';
}

export function backToStart() {
    document.getElementById('versionInfo').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
}

function populateVersionList(versions) {
    const versionList = document.getElementById('versionList');
    versionList.innerHTML = '';
    versions.forEach(version => {
        const item = document.createElement('li');
        item.innerHTML = `<strong>Verzió ${version.version} - ${version.date}</strong><br>${version.description.join('<br>')}`;
        versionList.appendChild(item);
    });
}
