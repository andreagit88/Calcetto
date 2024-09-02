let currentSection = 'presenze';
const players = JSON.parse(localStorage.getItem('players')) || [];
let playerToDelete = null;
let playerToEdit = null;
let currentUser = 'admin'; // Forzato per test, assicurati che venga settato correttamente nel tuo codice

// Mostra la sezione selezionata
function showSection(section) {
    document.getElementById('presenzeSection').style.display = 'none';
    document.getElementById('golSection').style.display = 'none';
    document.getElementById('addPlayerSection').style.display = 'none';
    document.getElementById(section + 'Section').style.display = 'block';
    currentSection = section;
    if (section !== 'addPlayer') renderList();
}

// Rende la lista dei giocatori visibile
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

// Aggiunge un giocatore alla lista
function addPlayer() {
    const newPlayerName = document.getElementById('newPlayerName').value.trim();
    if (newPlayerName && !players.find(p => p.name === newPlayerName)) {
        const newPlayer = {
            name: newPlayerName,
            presenze: { total: 0, partial: 0 },
            gol: { total: 0, partial: 0 }
        };
        players.push(newPlayer);
        localStorage.setItem('players', JSON.stringify(players));
        document.getElementById('newPlayerName').value = '';
        showSection(currentSection); // Rende visibile la sezione corrente
    } else {
        alert('Nome del giocatore già esistente o non valido.');
    }
}

// Modifica il contatore per presenze o gol
function modifyCount(playerName, increment) {
    const player = players.find(p => p.name === playerName);
    if (player) {
        if (currentSection === 'presenze') {
            player.presenze.partial += increment;
        } else {
            player.gol.partial += increment;
        }
        localStorage.setItem('players', JSON.stringify(players));
        renderList();
    }
}

// Chiede conferma prima di azzerare la classifica
function promptResetRankings() {
    document.getElementById('resetModal').style.display = 'block';
}

function confirmResetRankings() {
    players.forEach(player => {
        if (player[currentSection]) {
            player[currentSection].total = 0;
            player[currentSection].partial = 0;
        }
    });
    localStorage.setItem('players', JSON.stringify(players));
    closeResetModal();
    renderList();
}

// Mostra il modale per eliminare un giocatore
function promptDelete(playerName) {
    playerToDelete = playerName;
    document.getElementById('deleteMessage').textContent = `Sei sicuro di voler eliminare ${playerName}?`;
    document.getElementById('deleteModal').style.display = 'block';
}

// Conferma l'eliminazione del giocatore
function confirmDelete() {
    players.splice(players.findIndex(p => p.name === playerToDelete), 1);
    localStorage.setItem('players', JSON.stringify(players));
    closeModal();
    renderList();
}

// Mostra il modale per modificare il nome del giocatore
function promptEdit(playerName) {
    playerToEdit = playerName;
    document.getElementById('newPlayerNameEdit').value = playerName;
    document.getElementById('editModal').style.display = 'block';
}

// Conferma la modifica del nome del giocatore
function confirmEdit() {
    const newName = document.getElementById('newPlayerNameEdit').value.trim();
    if (newName && !players.find(p => p.name === newName)) {
        const player = players.find(p => p.name === playerToEdit);
        if (player) {
            player.name = newName;
            localStorage.setItem('players', JSON.stringify(players));
            closeEditModal();
            renderList();
        }
    } else {
        alert('Nome del giocatore già esistente o non valido.');
    }
}

// Aggiorna la classifica
function updateRankings() {
    players.forEach(player => {
        if (player[currentSection]) {
            player[currentSection].total += player[currentSection].partial;
            player[currentSection].partial = 0;
        }
    });
    players.sort((a, b) => (b[currentSection].total || 0) - (a[currentSection].total || 0));
    localStorage.setItem('players', JSON.stringify(players));
    renderList();
}

// Chiudi i modali
function closeModal() {
    document.getElementById('deleteModal').style.display = 'none';
    playerToDelete = null;
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    playerToEdit = null;
}

function closeResetModal() {
    document.getElementById('resetModal').style.display = 'none';
}

function closeLogoutModal() {
    document.getElementById('logoutModal').style.display = 'none';
}
