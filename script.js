let currentSection = 'presenze';
const players = JSON.parse(localStorage.getItem('players')) || [];
let playerToDelete = null;
let playerToEdit = null;

// Visualizza la sezione corrente
function showSection(section) {
    document.getElementById('presenzeSection').style.display = 'none';
    document.getElementById('golSection').style.display = 'none';
    document.getElementById('addPlayerSection').style.display = 'none';
    document.getElementById(section + 'Section').style.display = 'block';
    currentSection = section;
    if (section !== 'addPlayer') renderList();
}

// Mostra la lista dei giocatori
function renderList() {
    const ul = document.getElementById(currentSection + 'List');
    ul.innerHTML = '';

    const sortedPlayers = [...players].sort((a, b) => (b[currentSection]?.total || 0) - (a[currentSection]?.total || 0));

    sortedPlayers.forEach(player => {
        const li = document.createElement('li');
        li.innerHTML = 
            `<div class="player-info">
                <span class="player-name">${player.name}</span>
                <span class="player-ranking">${player[currentSection]?.total || 0}</span>
                <span class="player-controls">
                    <button onclick="modifyCount('${player.name}', 1)">+</button>
                    <span class="player-number">${player[currentSection]?.partial || 0}</span>
                    <button onclick="modifyCount('${player.name}', -1)">-</button>
                    <button onclick="promptEdit('${player.name}')">Modifica</button>
                    <button onclick="promptDelete('${player.name}')">Elimina</button>
                </span>
            </div>`;
        ul.appendChild(li);
    });
}

// Modifica il punteggio del giocatore
function modifyCount(playerName, amount) {
    const player = players.find(p => p.name === playerName);
    if (player) {
        if (!player[currentSection]) {
            player[currentSection] = { total: 0, partial: 0 };
        }
        player[currentSection].partial = Math.max(0, (player[currentSection].partial || 0) + amount);
        renderList();
    }
}

// Aggiungi un nuovo giocatore
function addPlayer() {
    const playerName = document.getElementById('newPlayerName').value;
    if (playerName && !players.find(p => p.name === playerName)) {
        players.push({ name: playerName, presenze: { total: 0, partial: 0 }, gol: { total: 0, partial: 0 } });
        localStorage.setItem('players', JSON.stringify(players));
        document.getElementById('newPlayerName').value = '';
        showSection('presenze');
    }
}

// Prompt per confermare eliminazione giocatore
function promptDelete(playerName) {
    playerToDelete = playerName;
    document.getElementById('deleteMessage').innerText = `Vuoi eliminare il giocatore ${playerName}?`;
    document.getElementById('deleteModal').style.display = 'block';
}

// Conferma eliminazione giocatore
function confirmDelete() {
    players.splice(players.findIndex(p => p.name === playerToDelete), 1);
    localStorage.setItem('players', JSON.stringify(players));
    renderList();
    closeModal();
}

// Prompt per modificare il nome del giocatore
function promptEdit(playerName) {
    playerToEdit = playerName;
    document.getElementById('newPlayerNameEdit').value = playerName;
    document.getElementById('editModal').style.display = 'block';
}

// Conferma modifica del nome del giocatore
function confirmEdit() {
    const newName = document.getElementById('newPlayerNameEdit').value;
    if (newName && newName !== playerToEdit && !players.find(p => p.name === newName)) {
        const player = players.find(p => p.name === playerToEdit);
        player.name = newName;
        localStorage.setItem('players', JSON.stringify(players));
        renderList();
        closeEditModal();
    }
}

// Chiudi il modale
function closeModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

// Chiudi il modale di modifica
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Prompt per azzerare la classifica
function promptResetRankings() {
    document.getElementById('resetModal').style.display = 'block';
}

// Conferma azzeramento classifica
function confirmResetRankings() {
    players.forEach(player => {
        player[currentSection].total = 0;
        player[currentSection].partial = 0;
    });
    localStorage.setItem('players', JSON.stringify(players));
    renderList();
    closeResetModal();
}

// Chiudi il modale di reset
function closeResetModal() {
    document.getElementById('resetModal').style.display = 'none';
}

// Aggiorna la classifica (aggiunge i punteggi parziali al totale)
function updateRankings() {
    players.forEach(player => {
        if (!player[currentSection]) {
            player[currentSection] = { total: 0, partial: 0 };
        }
        player[currentSection].total += player[currentSection].partial;
        player[currentSection].partial = 0;
    });
    localStorage.setItem('players', JSON.stringify(players));
    renderList();
}

// Mostra inizialmente la sezione presenze
document.getElementById('appSection').style.display = 'block';
showSection('presenze');
