/**
 * Serpentine Quest (貪食蛇大冒險) - Application Controller & Event Wiring
 * Manages UI overlays, keyboard inputs, virtual D-pad, touch gestures, skins & modals.
 */

document.addEventListener('DOMContentLoaded', () => {
  const game = new SerpentineGame('gameCanvas');
  const sound = window.soundManager;

  // DOM Elements
  const startOverlay = document.getElementById('startOverlay');
  const pauseOverlay = document.getElementById('pauseOverlay');
  const gameOverOverlay = document.getElementById('gameOverOverlay');

  const startBtn = document.getElementById('startBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const restartBtn = document.getElementById('restartBtn');
  const playAgainBtn = document.getElementById('playAgainBtn');

  const pauseBtn = document.getElementById('pauseBtn');
  const soundBtn = document.getElementById('soundBtn');
  const soundIcon = document.getElementById('soundIcon');
  const settingsBtn = document.getElementById('settingsBtn');
  const infoBtn = document.getElementById('infoBtn');

  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const infoModal = document.getElementById('infoModal');
  const closeInfoBtn = document.getElementById('closeInfoBtn');

  // Stats DOM elements in Game Over screen
  const finalScoreEl = document.getElementById('finalScore');
  const finalHighScoreEl = document.getElementById('finalHighScore');
  const finalApplesEl = document.getElementById('finalApples');
  const finalLengthEl = document.getElementById('finalLength');
  const newRecordBadge = document.getElementById('newRecordBadge');
  const gameOverReason = document.getElementById('gameOverReason');

  // Sync sound icon with initial state
  updateSoundUI();

  function updateSoundUI() {
    if (sound.isMuted) {
      soundIcon.className = 'fa-solid fa-volume-xmark';
      soundBtn.classList.remove('active');
    } else {
      soundIcon.className = 'fa-solid fa-volume-high';
      soundBtn.classList.add('active');
    }
  }

  soundBtn.addEventListener('click', () => {
    sound.toggleMute();
    updateSoundUI();
    if (!sound.isMuted) sound.playClick();
  });

  // Setup State Change Listeners
  game.onStateChange = (state) => {
    if (state === game.STATE.PLAYING) {
      startOverlay.classList.remove('active');
      pauseOverlay.classList.remove('active');
      gameOverOverlay.classList.remove('active');
      pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else if (state === game.STATE.PAUSED) {
      pauseOverlay.classList.add('active');
      pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
  };

  game.onGameOver = (data) => {
    finalScoreEl.textContent = data.score;
    finalHighScoreEl.textContent = data.highScore;
    finalApplesEl.textContent = data.apples + (data.golden > 0 ? ` (+${data.golden} ⭐)` : '');
    finalLengthEl.textContent = data.length;

    if (data.isNewRecord) {
      newRecordBadge.style.display = 'inline-flex';
    } else {
      newRecordBadge.style.display = 'none';
    }

    if (data.reason === 'hit_wall') {
      gameOverReason.textContent = 'Oops! 撞到競技場邊界了！';
    } else if (data.reason === 'hit_self') {
      gameOverReason.textContent = 'Oops! 咬到自己的尾巴了！';
    } else {
      gameOverReason.textContent = '遊戲結束，再接再厲！';
    }

    pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    gameOverOverlay.classList.add('active');
  };

  // Button Interactions
  startBtn.addEventListener('click', () => {
    sound.playClick();
    game.start();
  });

  resumeBtn.addEventListener('click', () => {
    sound.playClick();
    game.resume();
  });

  restartBtn.addEventListener('click', () => {
    sound.playClick();
    game.start();
  });

  playAgainBtn.addEventListener('click', () => {
    sound.playClick();
    game.start();
  });

  pauseBtn.addEventListener('click', () => {
    sound.playClick();
    game.togglePause();
  });

  // Settings Modal Handlers
  settingsBtn.addEventListener('click', () => {
    sound.playClick();
    if (game.currentState === game.STATE.PLAYING) {
      game.pause();
    }
    settingsModal.classList.add('active');
  });

  closeSettingsBtn.addEventListener('click', () => {
    sound.playClick();
    settingsModal.classList.remove('active');
  });

  // Info Modal Handlers
  infoBtn.addEventListener('click', () => {
    sound.playClick();
    if (game.currentState === game.STATE.PLAYING) {
      game.pause();
    }
    infoModal.classList.add('active');
  });

  closeInfoBtn.addEventListener('click', () => {
    sound.playClick();
    infoModal.classList.remove('active');
  });

  // Close modals on clicking backdrop
  [settingsModal, infoModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        sound.playClick();
        modal.classList.remove('active');
      }
    });
  });

  // Difficulty Selector Setup
  const diffButtons = document.querySelectorAll('.option-btn[data-diff]');
  diffButtons.forEach(btn => {
    if (btn.getAttribute('data-diff') === game.difficulty) {
      btn.classList.add('selected');
    }
    btn.addEventListener('click', () => {
      sound.playClick();
      diffButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      game.setDifficulty(btn.getAttribute('data-diff'));
    });
  });

  // Skin Selector Setup
  const skinButtons = document.querySelectorAll('.skin-item[data-skin]');
  skinButtons.forEach(btn => {
    if (btn.getAttribute('data-skin') === game.currentSkin) {
      btn.classList.add('selected');
    }
    btn.addEventListener('click', () => {
      sound.playClick();
      skinButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      game.setSkin(btn.getAttribute('data-skin'));
    });
  });

  // Keyboard Controls
  window.addEventListener('keydown', (e) => {
    // Prevent default scrolling for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    if (e.repeat) return; // Prevent key repeat spam

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        triggerDirection(0, -1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        triggerDirection(0, 1);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        triggerDirection(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        triggerDirection(1, 0);
        break;
      case ' ':
      case 'p':
      case 'P':
        if (game.currentState === game.STATE.IDLE) {
          game.start();
        } else if (game.currentState === game.STATE.GAMEOVER) {
          game.start();
        } else {
          game.togglePause();
        }
        break;
      case 'r':
      case 'R':
        game.start();
        break;
      case 'm':
      case 'M':
        sound.toggleMute();
        updateSoundUI();
        break;
    }
  });

  function triggerDirection(dx, dy) {
    if (game.currentState === game.STATE.IDLE || game.currentState === game.STATE.GAMEOVER) {
      game.start();
    }
    game.changeDirection(dx, dy);
    sound.playTurn();
    if (navigator.vibrate) {
      navigator.vibrate(10); // subtle haptic feedback on mobile
    }
  }

  // Mobile Virtual D-Pad Controller
  const dpadUp = document.getElementById('dpadUp');
  const dpadDown = document.getElementById('dpadDown');
  const dpadLeft = document.getElementById('dpadLeft');
  const dpadRight = document.getElementById('dpadRight');

  const setupDpadButton = (btn, dx, dy) => {
    if (!btn) return;
    const handlePress = (e) => {
      e.preventDefault();
      btn.classList.add('pressed');
      triggerDirection(dx, dy);
    };
    const handleRelease = () => {
      btn.classList.remove('pressed');
    };

    btn.addEventListener('touchstart', handlePress, { passive: false });
    btn.addEventListener('touchend', handleRelease);
    btn.addEventListener('mousedown', handlePress);
    btn.addEventListener('mouseup', handleRelease);
    btn.addEventListener('mouseleave', handleRelease);
  };

  setupDpadButton(dpadUp, 0, -1);
  setupDpadButton(dpadDown, 0, 1);
  setupDpadButton(dpadLeft, -1, 0);
  setupDpadButton(dpadRight, 1, 0);

  // Mobile Swipe Gestures on Canvas
  let touchStartX = 0;
  let touchStartY = 0;
  const canvas = document.getElementById('gameCanvas');

  canvas.parentElement.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  canvas.parentElement.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 1) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      const threshold = 25; // minimum swipe distance

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > threshold) {
          triggerDirection(diffX > 0 ? 1 : -1, 0);
        }
      } else {
        if (Math.abs(diffY) > threshold) {
          triggerDirection(0, diffY > 0 ? 1 : -1);
        }
      }
    }
  }, { passive: true });
});
