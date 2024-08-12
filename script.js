let currentSection = 'presenze';
const players = JSON.parse(localStorage.getItem('players')) || [];
let playerToDelete = null;
let playerToEdit = null;
let currentUser = null;

// Controlla se l'utente è autenticato e aggiorna l'interfaccia
function checkLogin() {
    const loggedIn = localStorage.getItem('logged_in');
    if (loggedIn === 'true') {
        currentUser = localStorage.getItem('currentUser');
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('appSection').style.display = 'block';
        showSection('presenze');
        updateUIForUser();
    } else {
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('appSection').style.display = 'none';
    }
}

// Effettua il login e salva lo stato nel localStorage
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if ((username === 'calcetto' && password === 'pizzicotto') || (username === 'calcetto' && password === 'topplayer')) {
        currentUser = password === 'topplayer' ? 'admin' : 'player';
        localStorage.setItem('logged_in', 'true');
        localStorage.setItem('currentUser', currentUser);
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('appSection').style.display = 'block';
        showSection('presenze');
        updateUIForUser();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function showSection(section) {
    document.getElementById('presenzeSection').style.display = 'none';
    document.getElementById('golSection').style.display = 'none';
    document.getElementById('addPlayerSection').style.display = 'none';
    document.getElementById(section + 'Section').style.display = 'block';
    currentSection = section;
    if (section !== 'addPlayer') renderList();
    updateUIForUser(); // Assicurati che la UI sia aggiornata per il tipo di utente corrente
}

function renderList() {
    const ul = document.getElementById(currentSection + 'List');
    ul.innerHTML = '';

    // Ordinamento dei giocatori in base ai punti della sezione corrente (presenze o gol)
    const sortedPlayers = [...players].sort((a, b) => (b[currentSection]?.total || 0) - (a[currentSection]?.total || 0));

    sortedPlayers.forEach(player => {
        const li = document.createElement('li');
        li.innerHTML = 
            `<div class="player-info">
                <span class="player-name">${player.name}</span>
                <span class="player-ranking">${player[currentSection]?.total || 0}</span>
                <span class="player-controls">
                    <button onclick="checkAdminAccess(() => modifyCount('${player.name}', 1))">+</button>
                    <span class="player-number">${player[currentSection]?.partial || 0}</span>
                    <button onclick="checkAdminAccess(() => modifyCount('${player.name}', -1))">-</button>
                    <button onclick="checkAdminAccess(() => promptEdit('${player.name}'))">Modifica</button>
                    <button onclick="checkAdminAccess(() => promptDelete('${player.name}'))">Elimina</button>
                </span>
            </div>`;
        ul.appendChild(li);
    });
}

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

function addPlayer() {
    const playerName = document.getElementById('newPlayerName').value;
    if (playerName && !players.find(p => p.name === playerName)) {
        players.push({ name: playerName, presenze: { total: 0, partial: 0 }, gol: { total: 0, partial: 0 } });
        localStorage.setItem('players', JSON.stringify(players));
        document.getElementById('newPlayerName').value = '';
        renderList();
    }
}

function promptDelete(playerName) {
    playerToDelete = playerName;
    document.getElementById('deleteMessage').textContent = `Sei sicuro di voler eliminare ${playerName}?`;
    document.getElementById('deleteModal').style.display = 'block';
}

function confirmDelete() {
    players.splice(players.findIndex(p => p.name === playerToDelete), 1);
    localStorage.setItem('players', JSON.stringify(players));
    closeModal();
    renderList();
}

function promptEdit(playerName) {
    playerToEdit = playerName;
    document.getElementById('newPlayerNameEdit').value = playerName;
    document.getElementById('editModal').style.display = 'block';
}

function confirmEdit() {
    const newName = document.getElementById('newPlayerNameEdit').value;
    if (newName && !players.find(p => p.name === newName)) {
        const player = players.find(p => p.name === playerToEdit);
        if (player) {
            player.name = newName;
            localStorage.setItem('players', JSON.stringify(players));
            closeEditModal();
            renderList();
        }
    }
}

function updateRankings() {
    players.forEach(player => {
        if (player[currentSection]) {
            player[currentSection].total += player[currentSection].partial;
            player[currentSection].partial = 0;
        }
    });
    players.sort((a, b) => b[currentSection].total - a[currentSection].total);
    localStorage.setItem('players', JSON.stringify(players));
    renderList();
}

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

function promptLogout() {
    document.getElementById('logoutModal').style.display = 'block';
}

function confirmLogout() {
    currentUser = null;
    localStorage.removeItem('logged_in'); // Rimuove il flag di login
    localStorage.removeItem('currentUser'); // Rimuove il tipo di utente
    document.getElementById('appSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
    closeLogoutModal();
}

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

function checkAdminAccess(action) {
    if (currentUser === 'admin') {
        action();
    } else {
        alert('Soltanto l\'amministratore può effettuare questa modifica.');
    }
}

function updateUIForUser() {
    if (currentUser === 'player') {
        document.querySelectorAll('.player-controls button').forEach(button => button.style.display = 'none');
        document.querySelectorAll('.player-number').forEach(span => span.style.display = 'none');
        document.getElementById('addPlayerButton').style.display = 'none';
        document.querySelectorAll('#presenzeSection button, #golSection button').forEach(button => {
            if (button.textContent.includes('Classifica') || button.textContent.includes('Azzera')) {
                button.style.display = 'none';
            }
        });
    } else if (currentUser === 'admin') {
        // Mostra i pulsanti per l'amministratore
        document.querySelectorAll('.player-controls button').forEach(button => button.style.display = 'inline-block');
        document.querySelectorAll('.player-number').forEach(span => span.style.display = 'inline-block');
        document.getElementById('addPlayerButton').style.display = 'inline-block';
        document.querySelectorAll('#presenzeSection button, #golSection button').forEach(button => {
            if (button.textContent.includes('Classifica') || button.textContent.includes('Azzera')) {
                button.style.display = 'inline-block';
            }
        });
    }
}

// Controlla lo stato di login all'avvio
checkLogin();
