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
    if (res.status === 204) return null;
    return res.json();
}

// Eredmény mentése – visszaadja a korábbi legjobb rekordot vagy null-t
export async function saveResult(groupKey, playerName, time, score, shipId) {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // 1. Új futás mentése, visszakérjük az achieved_at-et
    const inserted = await supabaseFetch('leaderboard?select=achieved_at', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify({
            name: playerName,
            ship_id: shipId || null,
            score: score,
            time: time,
            achieved_at: now,
            mode: groupKey,
        }),
    });

    const savedAt = inserted && inserted[0] ? inserted[0].achieved_at : now;

    // 2. Összes korábbi futás lekérése – az éppen mentett kizárva
    const rows = await supabaseFetch(
        `leaderboard?mode=eq.${groupKey}&name=eq.${encodeURIComponent(playerName)}&achieved_at=neq.${encodeURIComponent(savedAt)}&order=score.desc,time.asc`
    );

    if (!rows || rows.length === 0) return null;

    // Legjobb korábbi eredmény JS-ben kiválasztva
    const previous = rows.reduce((best, row) => {
        if (!best) return row;
        if (row.score > best.score) return row;
        if (row.score === best.score && row.time < best.time) return row;
        return best;
    }, null);

    return previous ? {
        time: previous.time,
        score: previous.score,
        shipId: previous.ship_id,
    } : null;
}

// Ranglista lekérése egy csoporthoz – játékosonként csak a legjobb eredmény
// topCount: hány helyezett kell (endScreen: 10, statsScreen: 5)
export async function getGroupLeaderboard(groupKey, topCount) {
    const rows = await supabaseFetch(
        `leaderboard?mode=eq.${groupKey}&order=score.desc,time.asc`
    );
    if (!rows || rows.length === 0) return [];

    // Játékosonként csak a legjobb
    const best = {};
    rows.forEach(row => {
        if (!best[row.name]) {
            best[row.name] = row;
        } else {
            const cur = best[row.name];
            if (row.score > cur.score || (row.score === cur.score && row.time < cur.time)) {
                best[row.name] = row;
            }
        }
    });

    return Object.values(best)
        .sort((a, b) => b.score - a.score || a.time - b.time)
        .slice(0, topCount);
}

// Legutóbb frissített csoportok lekérése
async function getRecentlyUpdatedGroups() {
    const rows = await supabaseFetch(
        `leaderboard?select=mode,achieved_at&order=achieved_at.desc`
    );
    if (!rows) return [];

    const latest = {};
    rows.forEach(row => {
        if (!latest[row.mode]) latest[row.mode] = row.achieved_at;
    });

    return Object.entries(latest)
        .sort((a, b) => new Date(b[1]) - new Date(a[1]))
        .map(([mode]) => mode);
}

// Játék végi eredménylista az endScreen-en (top 10)
export async function showEndScreenStats(currentResult) {
    const container = document.getElementById('endStatsContent');
    if (!container) return;

    container.innerHTML = '<p class="statsLoading">Eredmények betöltése...</p>';

    try {
        const leaderboard = await getGroupLeaderboard(currentResult.groupKey, 10);
        container.innerHTML = '';

        const table = document.createElement('table');
        table.className = 'statsTable';

        const header = document.createElement('tr');
        header.innerHTML = '<th>#</th><th colspan="2">Név</th><th>Pont</th><th>Idő</th>';
        table.appendChild(header);

        let rank = 0;
        let currentPlayerShownInTop = false;

        leaderboard.forEach(entry => {
            const isCurrentPlayer = entry.name === currentResult.playerName;
            let cssClass = '';
            if (isCurrentPlayer) {
                const improved = currentResult.previousBest === null ||
                    currentResult.score > currentResult.previousBest.score ||
                    (currentResult.score === currentResult.previousBest.score &&
                     currentResult.time < currentResult.previousBest.time);
                cssClass = improved ? 'newResult' : 'currentResult';
            }
            table.appendChild(createRow(rank + 1, entry.name, entry.time, entry.score, entry.ship_id, null, cssClass));
            if (isCurrentPlayer) currentPlayerShownInTop = true;
            rank++;
        });

        // Korábbi legjobb megjelenítése ha javított
        if (currentResult.previousBest !== null) {
            const prev = currentResult.previousBest;
            const improved = currentResult.score > prev.score ||
                (currentResult.score === prev.score && currentResult.time < prev.time);
            if (improved) {
                table.appendChild(createRow('—', currentResult.playerName + ' (előző)',
                    prev.time, prev.score, prev.shipId, null, 'oldResult'));
            }
        }

        // Ha nem fért a top 10-be
        if (!currentPlayerShownInTop) {
            table.appendChild(createRow('—', currentResult.playerName,
                currentResult.time, currentResult.score, currentResult.shipId, null, 'newResult'));
            if (currentResult.previousBest !== null) {
                table.appendChild(createRow('—', currentResult.playerName + ' (előző)',
                    currentResult.previousBest.time, currentResult.previousBest.score,
                    currentResult.previousBest.shipId, null, 'oldResult'));
            }
        }

        container.appendChild(table);
    } catch (e) {
        container.innerHTML = '<p class="statsEmpty">Nem sikerült betölteni az eredményeket.</p>';
    }
}

// Teljes statisztika képernyő (top 5 / csoport)
export async function showStats(currentResult) {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('game').style.display = 'none';
    document.getElementById('levelInfo').style.display = 'none';
    document.getElementById('endScreen').style.display = 'none';
    document.getElementById('versionDetails').style.display = 'none';
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

    const recentOrder = await getRecentlyUpdatedGroups();

    if (currentResult && !recentOrder.includes(currentResult.groupKey)) {
        recentOrder.unshift(currentResult.groupKey);
    }

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

        const leaderboard = await getGroupLeaderboard(groupKey, 5);
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

        let rank = 0;
        let currentPlayerShownInTop = false;

        leaderboard.forEach(entry => {
            const isCurrentPlayer = isCurrentGroup && entry.name === currentResult.playerName;
            let cssClass = '';
            if (isCurrentPlayer) {
                const improved = currentResult.previousBest === null ||
                    currentResult.score > currentResult.previousBest.score ||
                    (currentResult.score === currentResult.previousBest.score &&
                     currentResult.time < currentResult.previousBest.time);
                cssClass = improved ? 'newResult' : 'currentResult';
            }
            table.appendChild(createRow(rank + 1, entry.name, entry.time, entry.score, entry.ship_id, entry.achieved_at, cssClass));
            if (isCurrentPlayer) currentPlayerShownInTop = true;
            rank++;
        });

        // Korábbi legjobb ha javított
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
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const cs = Math.round((seconds % 1) * 100);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(cs).padStart(2, '0')}`;
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
