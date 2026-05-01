// version.js

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
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('versionDetails').style.display = 'block';

    if (versionLoaded === 'loaded') return;

    fetch('version.json')
        .then(response => response.json())
        .then(data => {
            const versionHistory = document.getElementById('versionHistory');
            if (!versionHistory) return;

            // Verzióhistória
            data.versions.forEach(version => {
                const versionItem = document.createElement('div');
                versionItem.className = 'versionItem';

                const versionHeader = document.createElement('h3');
                versionHeader.textContent = `${version.version} – ${version.date}`;
                versionItem.appendChild(versionHeader);

                version.description.forEach(descriptionText => {
                    const p = document.createElement('p');
                    p.textContent = descriptionText;
                    versionItem.appendChild(p);
                });

                versionHistory.appendChild(versionItem);
            });

            // Technológiák blokk
            const techBlock = document.createElement('div');
            techBlock.className = 'versionInfoBlock';

            const techTitle = document.createElement('h3');
            techTitle.textContent = 'Technológiák';
            techBlock.appendChild(techTitle);

            const techList = [
                'Claude AI',
                'ChatGPT',
                'GitHub',
                'Netlify',
                'Photoshop',
                'Supabase',
                'Tensor Art',
                'Visual Studio Code',
            ];

            const ul = document.createElement('ul');
            ul.className = 'techList';
            techList.forEach(tech => {
                const li = document.createElement('li');
                li.textContent = tech;
                ul.appendChild(li);
            });
            techBlock.appendChild(ul);
            versionHistory.appendChild(techBlock);

            // Copyright blokk
            const copyrightBlock = document.createElement('div');
            copyrightBlock.className = 'versionInfoBlock copyrightBlock';

            const cpText = document.createElement('p');
            cpText.textContent = '© 2026 attilla';
            copyrightBlock.appendChild(cpText);

            const cpText2 = document.createElement('p');
            cpText2.textContent = 'All rights reserved. Some assets generated with AI tools.';
            copyrightBlock.appendChild(cpText2);

            versionHistory.appendChild(copyrightBlock);
        })
        .catch(error => console.error("Verzióadatok betöltési hiba:", error));

    versionLoaded = 'loaded';
}
