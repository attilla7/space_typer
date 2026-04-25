// stats.js

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const HEADERS = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
};

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

// Supabase REST API hívás
async function supabaseFetch(path, options = {}) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        ...options,
        headers: { ...HEADERS, ...(options.headers || {}) },
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Supabase hiba: ${res.status} ${err}`);
    }
    // 204 No Content esetén nincs body
    if (res.status === 204) return null;
    return res.json();
}

// Minden eredmény mentése (statisztika célra minden futás bekerül)
// Visszaadja a korábbi legjobb rekordot vagy null-t
export async function saveResult(groupKey, playerName, time, score, shipId) {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // 1. Mindig mentjük az új futást
    await supabaseFetch('leaderboard', {
        method: 'POST',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({
            name: playerName,
            ship_id: shipId || null,
            score: score,
            time: time,
            achieved_at: now,
            mode: groupKey,
        }),
    });

    // 2. Lekérjük a játékos eddigi legjobb eredményét ebben a csoportban
    // (az éppen mentett sor előtti legjobb – azaz ahol score nagyobb VAGY
    //  score egyenlő és time kisebb, de ez bonyolult lenne SQL-ben,
    //  ezért lekérjük az összes korábbi sort és JS-ben döntünk)
    const rows = await supabaseFetch(
        `leaderboard?mode=eq.${groupKey}&name=eq.${encodeURIComponent(playerName)}&order=score.desc,time.asc`
    );

    // Az éppen mentett sor a legújabb – a "korábbi legjobb" a többi sor közül a legjobb
    // (score desc, time asc rendben az első ami NEM az éppen mentett)
    const previous = rows && rows.length > 1 ? rows[1] : null;

    return previous ? {
        time: previous.time,
        score: previous.score,
        shipId: previous.ship_id,
    } : null;
}

// Ranglista lekérése egy csoporthoz – játékosonként csak a legjobb eredmény
// Rendezés: score desc, time asc
async function getGroupLeaderboard(groupKey) {
    const rows = await supabaseFetch(
        `leaderboard?mode=eq.${groupKey}&order=score.desc,time.asc`
    );
    if (!rows || rows.length === 0) return [];

    // Játékosonként csak a legjobb (score desc, time asc sorrendben az első)
    const best = {};
    rows.forEach(row => {
        if (!best[row.name]) {
            best[row.name] = row;
        } else {
            const current = best[row.name];
            const isBetter = row.score > current.score ||
                (row.score === current.score && row.time < current.time);
            if (isBetter) best[row.name] = row;
        }
    });

    return Object.values(best)
        .sort((a, b) => b.score - a.score || a.time - b.time);
}

// Legutóbb frissített csoportok lekérése (az eredménylista sorrendjéhez)
async function getRecentlyUpdatedGroups() {
    const rows = await supabaseFetch(
        `leaderboard?select=mode,achieved_at&order=achieved_at.desc`
    );
    if (!rows) return [];

    // Csoportonként a legutóbbi achieved_at
    const latest = {};
    rows.forEach(row => {
        if (!latest[row.mode]) latest[row.mode] = row.achieved_at;
    });

    // Rendezve legutóbbi szerint
    return Object.entries(latest)
        .sort((a, b) => new Date(b[1]) - new Date(a[1]))
        .map(([mode]) => mode);
}

// Statisztika képernyő megjelenítése
// currentResult: { groupKey, playerName, time, score, shipId, previousBest } vagy null
export async function showStats(currentResult) {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('game').style.display = 'none';
    document.getElementById('levelInfo').style.display = 'none';
    document.getElementById('endScreen').style.display = 'none';
    document.getElementById('versionDetails').style.display = 'none';
    document.getElementById('backButtonScreen').style.display = 'none';
    document.getElementById('statsScreen').style.display = 'block';

    const container = document.getElementById('statsContent');
    container.innerHTML = '<p class="statsLoading">Eredmények betöltése...</p>';

    try {
        await renderStats(currentResult);
    } catch (e) {
        container.innerHTML = '<p class="statsEmpty">Nem sikerült betölteni az eredményeket.</p>';
    }
}

export function hideStats() {
    document.getElementById('statsScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
}

async function renderStats(currentResult) {
    const container = document.getElementById('statsContent');
    container.innerHTML = '';

    // Csoportok sorrendje: legutóbb frissített elöl
    const recentOrder = await getRecentlyUpdatedGroups();

    // Ha az aktuális csoport nincs a listában, adjuk hozzá az elejére
    if (currentResult && !recentOrder.includes(currentResult.groupKey)) {
        recentOrder.unshift(currentResult.groupKey);
    }

    // Csak azokat a csoportokat mutatjuk amikben van adat (+ aktuális csoport)
    const groupsToShow = recentOrder.filter(key =>
        LEVEL_GROUPS.find(g => getLevelGroupKey(g.startLevel) === key)
    );

    if (groupsToShow.length === 0) {
        container.innerHTML = '<p class="statsEmpty">Még nincs mentett eredmény.</p>';
        return;
    }

    for (const groupKey of groupsToShow) {
        const groupDef = LEVEL_GROUPS.find(g => getLevelGroupKey(g.startLevel) === groupKey);
        if (!groupDef) continue;

        const leaderboard = await getGroupLeaderboard(groupKey);
        const isCurrentGroup = currentResult && currentResult.groupKey === groupKey;

        if (leaderboard.length === 0 && !isCurrentGroup) continue;

        const section = document.createElement('div');
        section.className = 'statsGroup';

        const title = document.createElement('h3');
        title.textContent = groupDef.label;
        section.appendChild(title);

        const table = document.createElement('table');
        table.className = 'statsTable';

        const header = document.createElement('tr');
        header.innerHTML = '<th>#</th><th colspan="2">Név</th><th>Pont</th><th>Idő</th><th>Dátum</th>';
        table.appendChild(header);

        const TOP_COUNT = 5;
        let rank = 0;
        let currentPlayerShownInTop = false;

        leaderboard.forEach(entry => {
            if (rank >= TOP_COUNT) return;
            const isCurrentPlayer = isCurrentGroup && entry.name === currentResult.playerName;
            let cssClass = '';
            if (isCurrentPlayer) {
                const improved = currentResult.previousBest === null ||
                    currentResult.score > currentResult.previousBest.score ||
                    (currentResult.score === currentResult.previousBest.score &&
                     currentResult.time < currentResult.previousBest.time);
                cssClass = improved ? 'newResult' : 'oldResult';
            }
            table.appendChild(createRow(rank + 1, entry.name, entry.time, entry.score, entry.ship_id, entry.achieved_at, cssClass));
            if (isCurrentPlayer) currentPlayerShownInTop = true;
            rank++;
        });

        // Régi legjobb külön sorban ha javított
        if (isCurrentGroup && currentResult.previousBest !== null) {
            const prev = currentResult.previousBest;
            const improved = currentResult.score > prev.score ||
                (currentResult.score === prev.score && currentResult.time < prev.time);
            if (improved) {
                table.appendChild(createRow('—', currentResult.playerName + ' (előző)',
                    prev.time, prev.score, prev.shipId, null, 'oldResult'));
            }
        }

        // Ha nem fért a top 5-be
        if (isCurrentGroup && !currentPlayerShownInTop) {
            table.appendChild(createRow('—', currentResult.playerName,
                currentResult.time, currentResult.score, currentResult.shipId, null, 'newResult'));
            if (currentResult.previousBest !== null) {
                table.appendChild(createRow('—', currentResult.playerName + ' (előző)',
                    currentResult.previousBest.time, currentResult.previousBest.score,
                    currentResult.previousBest.shipId, null, 'oldResult'));
            }
        }

        section.appendChild(table);
        container.appendChild(section);
    }
}

function formatTime(seconds) {
    return seconds.toFixed(2) + ' s';
}

function formatDate(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    const hh   = String(d.getHours()).padStart(2, '0');
    const min  = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function createRow(rank, name, time, score, shipId, achievedAt, cssClass) {
    const row = document.createElement('tr');
    if (cssClass) row.className = cssClass;

    const rankCell = document.createElement('td');
    rankCell.textContent = rank;
    row.appendChild(rankCell);

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

    const scoreCell = document.createElement('td');
    scoreCell.textContent = score + ' pt';
    row.appendChild(scoreCell);

    const timeCell = document.createElement('td');
    timeCell.textContent = formatTime(time);
    row.appendChild(timeCell);

    const dateCell = document.createElement('td');
    dateCell.textContent = formatDate(achievedAt);
    dateCell.className = 'statsDateCell';
    row.appendChild(dateCell);

    return row;
}
