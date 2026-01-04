function openGame(gameId) {
    // Hide Hub
    document.getElementById('game-hub').classList.add('hidden');
    document.getElementById('game-hub').classList.remove('active-section');

    // Hide Main Header when in game
    const header = document.getElementById('main-header');
    if (header) header.style.display = 'none';

    // Show selected game section
    const gameSection = document.getElementById(`game-${gameId}`);
    if (gameSection) {
        gameSection.classList.remove('hidden');
        gameSection.classList.add('active-section');
    }
}

function goHome() {
    // Hide active section
    const activeSection = document.querySelector('.active-section');
    if (activeSection) {
        activeSection.classList.add('hidden');
        activeSection.classList.remove('active-section');
    }

    // Show Hub
    const hub = document.getElementById('game-hub');
    hub.classList.remove('hidden');
    hub.classList.add('active-section');

    // Show Main Header again
    const header = document.getElementById('main-header');
    if (header) header.style.display = 'block';

    // Stop game loops if running
    if (typeof stopSnakeGame === 'function') stopSnakeGame();
    if (typeof stopLockpickGame === 'function') stopLockpickGame();
    // Maze usually stops on its own or needs a stop function? 
    // It uses an interval variable in its own closure, but we might want to expose a stop.
    // For now, most games reset on 'play' being clicked again.

    // Close any open settings modal
    document.querySelectorAll('.settings-modal').forEach(el => el.classList.add('hidden'));
}

function toggleSettings(gameId) {
    const modal = document.getElementById(`settings-${gameId}`);
    if (modal) {
        if (modal.classList.contains('hidden')) {
            modal.classList.remove('hidden');
        } else {
            modal.classList.add('hidden');
        }
    }
}

// Close modal when clicking outside content (overlay)
window.onclick = function (event) {
    if (event.target.classList.contains('settings-modal')) {
        event.target.classList.add('hidden');
    }
}
