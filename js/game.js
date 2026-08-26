/**
 * Serpentine Quest (貪食蛇大冒險) - Core Game Engine
 * HTML5 Canvas rendering, 60fps loop, particle system, input buffer & responsive canvas.
 */

class SerpentineGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    // Grid Configuration
    this.gridSize = 20; // 20x20 grid
    this.tileCount = 20;
    this.tileSize = 24; // dynamically computed based on canvas size

    // Game States
    this.STATE = {
      IDLE: 'IDLE',
      PLAYING: 'PLAYING',
      PAUSED: 'PAUSED',
      GAMEOVER: 'GAMEOVER'
    };
    this.currentState = this.STATE.IDLE;

    // Snake properties
    this.snake = [];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.inputQueue = [];

    // Food properties
    this.food = { x: 15, y: 10, type: 'normal' };
    this.goldenFood = null; // Spawns periodically
    this.goldenTimer = 0;
    this.goldenDuration = 400; // frames (~7-8s)

    // Score and Statistics
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('serpentine_highscore') || '0', 10);
    this.applesEaten = 0;
    this.goldenEaten = 0;
    this.isNewRecord = false;

    // Difficulty Settings (tick intervals in ms)
    this.difficulty = localStorage.getItem('serpentine_diff') || 'normal';
    this.speedMap = {
      easy: 145,
      normal: 110,
      hard: 75
    };

    // Skin Color Themes
    this.currentSkin = localStorage.getItem('serpentine_skin') || 'neon';
    this.skins = {
      neon: {
        name: '霓虹綠 (經典)',
        head: '#4ade80',
        body1: '#22c55e',
        body2: '#16a34a',
        glow: 'rgba(74, 222, 128, 0.6)',
        eye: '#081425'
      },
      cyan: {
        name: '賽博青藍',
        head: '#38bdf8',
        body1: '#0284c7',
        body2: '#0369a1',
        glow: 'rgba(56, 189, 248, 0.6)',
        eye: '#081425'
      },
      blaze: {
        name: '烈焰熔岩',
        head: '#fb923c',
        body1: '#ea580c',
        body2: '#c2410c',
        glow: 'rgba(251, 146, 60, 0.6)',
        eye: '#2b0c03'
      },
      pink: {
        name: '夢幻粉櫻',
        head: '#f472b6',
        body1: '#db2777',
        body2: '#9d174d',
        glow: 'rgba(244, 114, 182, 0.6)',
        eye: '#250718'
      },
      gold: {
        name: '璀璨星金',
        head: '#fde047',
        body1: '#eab308',
        body2: '#ca8a04',
        glow: 'rgba(250, 204, 21, 0.7)',
        eye: '#2d1a00'
      }
    };

    // Visual FX (Particles, Popups & Screen Shake)
    this.particles = [];
    this.floatingTexts = [];
    this.shakeDuration = 0;
    this.shakeMagnitude = 0;

    // Timing & Loop
    this.lastTickTime = 0;
    this.animFrameId = null;
    this.pulseAngle = 0;

    // Audio helper
    this.sound = window.soundManager;

    // Resize and initial setup
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.reset();
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height) || 480;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;

    this.ctx.scale(dpr, dpr);
    this.displaySize = size;
    this.tileSize = size / this.tileCount;
  }

  reset() {
    this.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.inputQueue = [];
    this.score = 0;
    this.applesEaten = 0;
    this.goldenEaten = 0;
    this.goldenFood = null;
    this.goldenTimer = 0;
    this.particles = [];
    this.floatingTexts = [];
    this.isNewRecord = false;
    this.spawnFood();
    this.updateScoreUI();
  }

  start() {
    this.reset();
    this.currentState = this.STATE.PLAYING;
    this.lastTickTime = performance.now();
    if (!this.animFrameId) {
      this.loop(performance.now());
    }
    if (this.onStateChange) this.onStateChange(this.currentState);
  }

  pause() {
    if (this.currentState === this.STATE.PLAYING) {
      this.currentState = this.STATE.PAUSED;
      if (this.onStateChange) this.onStateChange(this.currentState);
    }
  }

  resume() {
    if (this.currentState === this.STATE.PAUSED) {
      this.currentState = this.STATE.PLAYING;
      this.lastTickTime = performance.now();
      if (this.onStateChange) this.onStateChange(this.currentState);
    }
  }

  togglePause() {
    if (this.currentState === this.STATE.PLAYING) {
      this.pause();
    } else if (this.currentState === this.STATE.PAUSED) {
      this.resume();
    }
  }

  setDifficulty(diff) {
    if (this.speedMap[diff]) {
      this.difficulty = diff;
      localStorage.setItem('serpentine_diff', diff);
    }
  }

  setSkin(skinKey) {
    if (this.skins[skinKey]) {
      this.currentSkin = skinKey;
      localStorage.setItem('serpentine_skin', skinKey);
    }
  }

  getCurrentSpeed() {
    const base = this.speedMap[this.difficulty] || 110;
    // Slight speedup as score grows (max 35% speedup)
    const acceleration = Math.min(35, Math.floor(this.score * 0.8));
    return Math.max(50, base - acceleration);
  }

  // Queue steering direction with 180° turn prevention
  changeDirection(dirX, dirY) {
    if (this.currentState !== this.STATE.PLAYING) return;

    // Get the most recent intended direction
    const lastDir = this.inputQueue.length > 0
      ? this.inputQueue[this.inputQueue.length - 1]
      : this.direction;

    // Cannot reverse directly into opposite direction
    if (dirX === -lastDir.x && dirY === -lastDir.y) return;
    // Cannot duplicate same direction
    if (dirX === lastDir.x && dirY === lastDir.y) return;

    // Limit buffer to 2 commands
    if (this.inputQueue.length < 2) {
      this.inputQueue.push({ x: dirX, y: dirY });
    }
  }

  // Food Spawner (avoids snake body)
  spawnFood() {
    let newPos;
    let collision;
    let attempts = 0;

    do {
      newPos = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount)
      };

      collision = this.snake.some(segment => segment.x === newPos.x && segment.y === newPos.y);
      if (this.goldenFood && this.goldenFood.x === newPos.x && this.goldenFood.y === newPos.y) {
        collision = true;
      }
      attempts++;
    } while (collision && attempts < 100);

    this.food = { ...newPos, type: 'normal' };
  }

  spawnGoldenFood() {
    if (this.goldenFood) return;

    let newPos;
    let collision;
    let attempts = 0;

    do {
      newPos = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount)
      };

      collision = this.snake.some(segment => segment.x === newPos.x && segment.y === newPos.y) ||
                  (this.food.x === newPos.x && this.food.y === newPos.y);
      attempts++;
    } while (collision && attempts < 100);

    this.goldenFood = { ...newPos, type: 'golden' };
    this.goldenTimer = this.goldenDuration;
  }

  // Core Tick (Discrete Grid Update)
  tick() {
    if (this.currentState !== this.STATE.PLAYING) return;

    // Dequeue next direction if available
    if (this.inputQueue.length > 0) {
      const next = this.inputQueue.shift();
      if (!(next.x === -this.direction.x && next.y === -this.direction.y)) {
        this.direction = next;
      }
    }

    const head = { ...this.snake[0] };
    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y
    };

    // 1. Boundary Wall Collision Check
    if (
      newHead.x < 0 ||
      newHead.x >= this.tileCount ||
      newHead.y < 0 ||
      newHead.y >= this.tileCount
    ) {
      this.gameOver('hit_wall');
      return;
    }

    // 2. Self Body Collision Check
    // (Ignore the tail tip because it will move forward unless food is eaten)
    for (let i = 0; i < this.snake.length - 1; i++) {
      if (this.snake[i].x === newHead.x && this.snake[i].y === newHead.y) {
        this.gameOver('hit_self');
        return;
      }
    }

    // Move snake forward
    this.snake.unshift(newHead);

    let ateFood = false;

    // Check Normal Food Collision
    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score += 1;
      this.applesEaten += 1;
      ateFood = true;

      if (this.sound) this.sound.playEat();
      this.createFoodBurst(this.food.x, this.food.y, '#f43f5e', 14);
      this.addFloatingText('+1', this.food.x, this.food.y, '#4ade80');

      this.spawnFood();

      // Golden Food Spawning Chance (every ~5 regular apples or 15% random chance)
      if (!this.goldenFood && (this.applesEaten % 5 === 0 || Math.random() < 0.18)) {
        this.spawnGoldenFood();
      }
    }

    // Check Golden Food Collision
    if (this.goldenFood && newHead.x === this.goldenFood.x && newHead.y === this.goldenFood.y) {
      const bonus = 5;
      this.score += bonus;
      this.goldenEaten += 1;
      ateFood = true;

      if (this.sound) this.sound.playGoldenEat();
      this.createFoodBurst(this.goldenFood.x, this.goldenFood.y, '#fbbf24', 24);
      this.addFloatingText(`+${bonus} BONUS!`, this.goldenFood.x, this.goldenFood.y, '#fbbf24', true);

      this.goldenFood = null;
      this.goldenTimer = 0;
    }

    // If no food was eaten this tick, pop tail segment
    if (!ateFood) {
      this.snake.pop();
    }

    // Update High Score tracking in real time
    if (this.score > this.highScore) {
      if (!this.isNewRecord && this.highScore > 0) {
        this.isNewRecord = true;
        if (this.sound) this.sound.playNewHighScore();
        this.addFloatingText('👑 NEW RECORD!', newHead.x, newHead.y, '#f59e0b', true);
      }
      this.highScore = this.score;
      localStorage.setItem('serpentine_highscore', this.highScore.toString());
    }

    this.updateScoreUI();
  }

  // Visual Effects & Particle Generators
  createFoodBurst(gridX, gridY, color, count = 16) {
    const px = (gridX + 0.5) * this.tileSize;
    const py = (gridY + 0.5) * this.tileSize;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3.5,
        color: color,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.03,
        gravity: 0.08
      });
    }
  }

  createDeathBurst() {
    const skin = this.skins[this.currentSkin] || this.skins.neon;
    this.snake.forEach((seg, index) => {
      const px = (seg.x + 0.5) * this.tileSize;
      const py = (seg.y + 0.5) * this.tileSize;
      const count = index === 0 ? 12 : 5;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        this.particles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 2 + Math.random() * 3,
          color: index === 0 ? skin.head : skin.body1,
          alpha: 1,
          decay: 0.015 + Math.random() * 0.02,
          gravity: 0.05
        });
      }
    });
  }

  addFloatingText(text, gridX, gridY, color, isBold = false) {
    this.floatingTexts.push({
      text: text,
      x: (gridX + 0.5) * this.tileSize,
      y: (gridY + 0.5) * this.tileSize,
      vy: -1.2,
      alpha: 1,
      decay: 0.02,
      color: color,
      scale: isBold ? 1.3 : 1.0
    });
  }

  triggerScreenShake(magnitude = 6, duration = 12) {
    this.shakeMagnitude = magnitude;
    this.shakeDuration = duration;
  }

  gameOver(reason) {
    this.currentState = this.STATE.GAMEOVER;
    if (this.sound) this.sound.playDie();
    this.triggerScreenShake(8, 16);
    this.createDeathBurst();

    if (this.onGameOver) {
      this.onGameOver({
        score: this.score,
        highScore: this.highScore,
        apples: this.applesEaten,
        golden: this.goldenEaten,
        length: this.snake.length,
        isNewRecord: this.isNewRecord,
        reason: reason
      });
    }
  }

  updateScoreUI() {
    const scoreEl = document.getElementById('currentScore');
    const highEl = document.getElementById('highScore');
    if (scoreEl) scoreEl.textContent = this.score;
    if (highEl) highEl.textContent = this.highScore;
  }

  // Main Render Loop
  loop(currentTime) {
    this.animFrameId = requestAnimationFrame(time => this.loop(time));

    // Handle Game Logic Tick
    if (this.currentState === this.STATE.PLAYING) {
      const speed = this.getCurrentSpeed();
      if (currentTime - this.lastTickTime >= speed) {
        this.tick();
        this.lastTickTime = currentTime;
      }
    }

    // Golden Food Countdown
    if (this.goldenFood && this.currentState === this.STATE.PLAYING) {
      this.goldenTimer--;
      if (this.goldenTimer <= 0) {
        this.createFoodBurst(this.goldenFood.x, this.goldenFood.y, '#94a3b8', 8);
        this.goldenFood = null;
      }
    }

    // Breathing pulse timer for animation
    this.pulseAngle += 0.05;

    // Render Canvas Frame
    this.render();
  }

  // Draw Arena, Snake, Food, FX
  render() {
    const ctx = this.ctx;
    const size = this.displaySize;
    const ts = this.tileSize;

    ctx.save();

    // 1. Screen Shake Transform
    if (this.shakeDuration > 0) {
      const offsetX = (Math.random() - 0.5) * this.shakeMagnitude;
      const offsetY = (Math.random() - 0.5) * this.shakeMagnitude;
      ctx.translate(offsetX, offsetY);
      this.shakeDuration--;
    }

    // 2. Clear Background
    ctx.fillStyle = '#081425';
    ctx.fillRect(0, 0, size, size);

    // 3. Draw Cyber Grid
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= this.tileCount; i++) {
      ctx.beginPath();
      ctx.moveTo(i * ts, 0);
      ctx.lineTo(i * ts, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * ts);
      ctx.lineTo(size, i * ts);
      ctx.stroke();
    }

    // 4. Draw Normal Food (Red Apple with Leaf & Glow)
    this.drawFood(this.food, '#f43f5e');

    // 5. Draw Golden Food (if active)
    if (this.goldenFood) {
      this.drawGoldenFood(this.goldenFood);
    }

    // 6. Draw Snake (if alive)
    if (this.snake.length > 0 && this.currentState !== this.STATE.GAMEOVER) {
      this.drawSnake();
    }

    // 7. Draw Particles
    this.renderParticles();

    // 8. Draw Floating Popups
    this.renderFloatingTexts();

    ctx.restore();
  }

  drawFood(food, baseColor) {
    const ctx = this.ctx;
    const ts = this.tileSize;
    const cx = (food.x + 0.5) * ts;
    const cy = (food.y + 0.5) * ts;
    const radius = (ts * 0.42) * (1 + Math.sin(this.pulseAngle) * 0.06);

    ctx.save();

    // Glowing Halo
    const gradient = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.8);
    gradient.addColorStop(0, 'rgba(244, 63, 94, 0.4)');
    gradient.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Apple Body
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Apple Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(cx - radius * 0.3, cy - radius * 0.3, radius * 0.28, 0, Math.PI * 2);
    ctx.fill();

    // Apple Stem & Leaf
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius * 0.8);
    ctx.quadraticCurveTo(cx - 2, cy - radius * 1.3, cx + 2, cy - radius * 1.4);
    ctx.stroke();

    // Cute Green Leaf
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(cx + radius * 0.35, cy - radius * 0.9, radius * 0.3, radius * 0.16, 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawGoldenFood(food) {
    const ctx = this.ctx;
    const ts = this.tileSize;
    const cx = (food.x + 0.5) * ts;
    const cy = (food.y + 0.5) * ts;
    const radius = (ts * 0.44) * (1 + Math.sin(this.pulseAngle * 1.8) * 0.1);

    ctx.save();

    // Golden Radiant Halo
    const gradient = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 2.2);
    gradient.addColorStop(0, 'rgba(251, 191, 36, 0.7)');
    gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Golden Body
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner Star or Sparkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - radius * 0.3, cy - radius * 0.3, radius * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Countdown ring indicator
    const progress = this.goldenTimer / this.goldenDuration;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.35, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress, false);
    ctx.stroke();

    ctx.restore();
  }

  drawSnake() {
    const ctx = this.ctx;
    const ts = this.tileSize;
    const skin = this.skins[this.currentSkin] || this.skins.neon;

    // Draw Body Segments (from tail to head)
    for (let i = this.snake.length - 1; i >= 0; i--) {
      const seg = this.snake[i];
      const cx = (seg.x + 0.5) * ts;
      const cy = (seg.y + 0.5) * ts;
      const isHead = (i === 0);
      const isTail = (i === this.snake.length - 1);

      ctx.save();

      if (isHead) {
        // Snake Head Glowing Aura
        ctx.shadowColor = skin.glow;
        ctx.shadowBlur = 14;

        ctx.fillStyle = skin.head;
        ctx.beginPath();
        ctx.arc(cx, cy, ts * 0.44, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0; // reset glow

        // Cute Animated Eyes (facing movement direction)
        this.drawSnakeEyes(cx, cy, ts * 0.44, this.direction, skin.eye);
      } else {
        // Snake Body Segment with Rounded Pills and subtle gradient
        const t = i / this.snake.length;
        const segmentRadius = isTail ? ts * 0.32 : ts * 0.40 * (1 - t * 0.15);

        ctx.fillStyle = i % 2 === 0 ? skin.body1 : skin.body2;
        ctx.beginPath();
        ctx.arc(cx, cy, segmentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Subtle Segment Core Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(cx, cy, segmentRadius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  drawSnakeEyes(cx, cy, headRadius, dir, pupilColor) {
    const ctx = this.ctx;
    const eyeRadius = headRadius * 0.28;
    const pupilRadius = eyeRadius * 0.55;

    // Calculate eye positions perpendicular to direction
    const perpX = -dir.y;
    const perpY = dir.x;
    const spread = headRadius * 0.48;
    const forward = headRadius * 0.25;

    const eye1X = cx + forward * dir.x + spread * perpX;
    const eye1Y = cy + forward * dir.y + spread * perpY;

    const eye2X = cx + forward * dir.x - spread * perpX;
    const eye2Y = cy + forward * dir.y - spread * perpY;

    [ [eye1X, eye1Y], [eye2X, eye2Y] ].forEach(([ex, ey]) => {
      // Sclera (White)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex, ey, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Pupil (Offset in direction of movement)
      const px = ex + dir.x * (eyeRadius * 0.4);
      const py = ey + dir.y * (eyeRadius * 0.4);
      ctx.fillStyle = pupilColor;
      ctx.beginPath();
      ctx.arc(px, py, pupilRadius, 0, Math.PI * 2);
      ctx.fill();

      // Eye Sparkle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px - pupilRadius * 0.3, py - pupilRadius * 0.3, pupilRadius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderParticles() {
    const ctx = this.ctx;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  renderFloatingTexts() {
    const ctx = this.ctx;
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= ft.decay;

      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = `bold ${Math.floor(16 * ft.scale)}px Fredoka, Quicksand, sans-serif`;
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}

// Global Serpentine Game Instance
window.SerpentineGame = SerpentineGame;
