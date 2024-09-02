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

// Modifica il punteggio parziale del giocatore
function modifyCount(playerName, amount) {
    const player = players.find(p => p.name === playerName);
    if (player) {
        if (!player[currentSection]) {
            player[currentSection] = { total: 0, partial: 0 };
        }
        player[currentSection].partial += amount;
        savePlayers();
        renderList();
    }
}

// Aggiungi un giocatore
function addPlayer() {
    const name = document.getElementById('newPlayerName').value;
    if (name && !players.find(p => p.name === name)) {
        players.push({ name });
        savePlayers();
        renderList();
        document.getElementById('newPlayerName').value = '';
    }
}

// Salva i dati dei giocatori in localStorage
function savePlayers() {
    localStorage.setItem('players', JSON.stringify(players));
}

// Mostra il modal di conferma eliminazione
function promptDelete(playerName) {
    playerToDelete = playerName;
    document.getElementById('deleteMessage').innerText = `Sei sicuro di voler eliminare ${playerName}?`;
    document.getElementById('deleteModal').style.display = 'block';
}

// Conferma l'eliminazione del giocatore
function confirmDelete() {
    const index = players.findIndex(p => p.name === playerToDelete);
    if (index > -1) {
        players.splice(index, 1);
        savePlayers();
        renderList();
        closeModal();
    }
}

// Chiudi il modal di eliminazione
function closeModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

// Mostra il modal di modifica
function promptEdit(playerName) {
    playerToEdit = playerName;
    document.getElementById('newPlayerNameEdit').value = playerName;
    document.getElementById('editModal').style.display = 'block';
}

// Conferma la modifica del nome del giocatore
function confirmEdit() {
    const newName = document.getElementById('newPlayerNameEdit').value;
    const player = players.find(p => p.name === playerToEdit);
    if (player && newName && !players.find(p => p.name === newName)) {
        player.name = newName;
        savePlayers();
        renderList();
        closeEditModal();
    }
}

// Chiudi il modal di modifica
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Mostra il modal di conferma reset
function promptResetRankings() {
    document.getElementById('resetModal').style.display = 'block';
}

// Conferma il reset della classifica
function confirmResetRankings() {
    players.forEach(player => {
        if (player[currentSection]) {
            player[currentSection].total = 0;
            player[currentSection].partial = 0;
        }
    });
    savePlayers();
    renderList();
    closeResetModal();
}

// Chiudi il modal di reset
function closeResetModal() {
    document.getElementById('resetModal').style.display = 'none';
}

// Aggiorna la classifica totale con i valori parziali
function updateRankings() {
    players.forEach(player => {
        if (player[currentSection]) {
            player[currentSection].total += player[currentSection].partial;
            player[currentSection].partial = 0; // Resetta il parziale dopo l'aggiornamento
        }
    });
    savePlayers();
    renderList();
}
