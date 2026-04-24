// stats.js

const STORAGE_KEY = 'spaceTyperStats';
const TOP_COUNT = 5;

const LEVEL_GROUPS = [
    { startLevel: 101, label: 'Számok 1. csoport (101-103)' },
    { startLevel: 104, label: 'Számok 2. csoport (104-106)' },
    { startLevel: 107, label: 'Számok 3. csoport (107-109)' },
    { startLevel: 110, label: 'Számok 4. csoport (110-112)' },
    { startLevel: 1,   label: 'Betűk 1. csoport (1-5)' },
    { startLevel: 6,   label: 'Betűk 2. csoport (6-10)' },
    { startLevel: 11,  label: 'Betűk 3. csoport (11-15)' },
    { startLevel: 16,  label: 'Betűk 4. csoport (16-20)' },
    { startLevel: 21,  label: 'Betűk 5. csoport (21-25)' },
    { startLevel: 26,  label: 'Betűk 6. csoport (26-30)' },
    { startLevel: 31,  label: 'Betűk 7. csoport (31-35)' },
    { startLevel: 36,  label: 'Betűk 8. csoport (36-40)' },
    { startLevel: 41,  label: 'Betűk 9. csoport (41-45)' },
    { startLevel: 46,  label: 'Betűk 10. csoport (46-50)' },
    { startLevel: 51,  label: 'Betűk 11. csoport (51-55)' },
    { startLevel: 56,  label: 'Betűk 12. csoport (56-60)' },
    { startLevel: 61,  label: 'Betűk 13. csoport (61-65)' },
    { startLevel: 66,  label: 'Betűk 14. csoport (66-70)' },
    { startLevel: 71,  label: 'Betűk 15. csoport (71-75)' },
    { startLevel: 76,  label: 'Betűk 16. csoport (76-80)' },
];

export function getLevelGroupKey(startLevel) {
    return `group_${startLevel}`;
}

function loadStats() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

function saveStats(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getGroupLeaderboard(groupKey) {
    const stats = loadStats();
    const group = stats[groupKey] || {};
    return Object.entries(group)
        .map(([name, entry]) => ({
            name,
            time:  typeof entry === 'object' && entry.time  !== undefined ? entry.time  : null,
            score: typeof entry === 'object' && entry.score !== undefined ? entry.score : 0,
            shipId: typeof entry === 'object' && entry.shipId !== undefined ? entry.shipId : null,
        }))
        .filter(e => e.time !== null)
        .sort((a, b) => a.time - b.time);
}

// Menti az eredményt ha jobb (rövidebb idő). Visszaadja a korábbi legjobb objektumot vagy null-t.
export function saveResult(groupKey, playerName, time, score, shipId) {
    const stats = loadStats();
    if (!stats[groupKey]) stats[groupKey] = {};

    const existing = stats[groupKey][playerName];
    const previous = (existing && typeof existing === 'object') ? existing : null;

    if (previous === null || time < previous.time) {
        stats[groupKey][playerName] = { time, score, shipId: shipId || null };
        saveStats(stats);
        console.log(`Mentve: ${playerName} | ${groupKey} | ${time.toFixed(2)}s | ${score}pt`);
    }

    return previous;
}

export function showStats(currentResult) {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('game').style.display = 'none';
    document.getElementById('levelInfo').style.display = 'none';
    document.getElementById('endScreen').style.display = 'none';
    document.getElementById('versionDetails').style.display = 'none';
    document.getElementById('backButtonScreen').style.display = 'none';
    document.getElementById('statsScreen').style.display = 'block';
    renderStats(currentResult);
}

export function hideStats() {
    document.getElementById('statsScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
}

function renderStats(currentResult) {
    const container = document.getElementById('statsContent');
    container.innerHTML = '';
    let anyGroupRendered = false;

    LEVEL_GROUPS.forEach(group => {
        const groupKey = getLevelGroupKey(group.startLevel);
        const leaderboard = getGroupLeaderboard(groupKey);
        const isCurrentGroup = currentResult && currentResult.groupKey === groupKey;

        if (leaderboard.length === 0 && !isCurrentGroup) return;
        anyGroupRendered = true;

        const section = document.createElement('div');
        section.className = 'statsGroup';

        const title = document.createElement('h3');
        title.textContent = group.label;
        section.appendChild(title);

        const table = document.createElement('table');
        table.className = 'statsTable';

        const header = document.createElement('tr');
        header.innerHTML = '<th>#</th><th colspan="2">Név</th><th>Idő</th><th>Pont</th>';
        table.appendChild(header);

        let rank = 0;
        let currentPlayerShownInTop = false;

        leaderboard.forEach(entry => {
            if (rank >= TOP_COUNT) return;
            const isCurrentPlayer = isCurrentGroup && entry.name === currentResult.playerName;
            let cssClass = '';
            if (isCurrentPlayer) {
                const improved = currentResult.previousBest === null ||
                    currentResult.time < currentResult.previousBest.time;
                cssClass = improved ? 'newResult' : 'oldResult';
            }
            table.appendChild(createRow(rank + 1, entry.name, entry.time, entry.score, entry.shipId, cssClass));
            if (isCurrentPlayer) currentPlayerShownInTop = true;
            rank++;
        });

        if (isCurrentGroup && currentResult.previousBest !== null &&
            currentResult.time < currentResult.previousBest.time) {
            table.appendChild(createRow(
                '—', currentResult.playerName + ' (előző)',
                currentResult.previousBest.time, currentResult.previousBest.score,
                currentResult.previousBest.shipId, 'oldResult'
            ));
        }

        if (isCurrentGroup && !currentPlayerShownInTop) {
            table.appendChild(createRow('—', currentResult.playerName,
                currentResult.time, currentResult.score, currentResult.shipId, 'newResult'));
            if (currentResult.previousBest !== null) {
                table.appendChild(createRow(
                    '—', currentResult.playerName + ' (előző)',
                    currentResult.previousBest.time, currentResult.previousBest.score,
                    currentResult.previousBest.shipId, 'oldResult'
                ));
            }
        }

        section.appendChild(table);
        container.appendChild(section);
    });

    if (!anyGroupRendered) {
        const empty = document.createElement('p');
        empty.className = 'statsEmpty';
        empty.textContent = 'Még nincs mentett eredmény.';
        container.appendChild(empty);
    }
}

function formatTime(seconds) {
    return seconds.toFixed(2) + ' s';
}

function createRow(rank, name, time, score, shipId, cssClass) {
    const row = document.createElement('tr');
    if (cssClass) row.className = cssClass;

    const rankCell = document.createElement('td');
    rankCell.textContent = rank;
    row.appendChild(rankCell);

    // Űrhajó kép cella
    const shipCell = document.createElement('td');
    shipCell.className = 'statsShipCell';
    if (shipId) {
        const img = document.createElement('img');
        img.src = `pictures/spaceship_${String(shipId).padStart(2, '0')}.png`;
        img.width = 30;
        img.height = 30;
        img.alt = '';
        shipCell.appendChild(img);
    }
    row.appendChild(shipCell);

    const nameCell = document.createElement('td');
    nameCell.textContent = name;
    row.appendChild(nameCell);

    const timeCell = document.createElement('td');
    timeCell.textContent = formatTime(time);
    row.appendChild(timeCell);

    const scoreCell = document.createElement('td');
    scoreCell.textContent = score + ' pt';
    row.appendChild(scoreCell);

    return row;
}
