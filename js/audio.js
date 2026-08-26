/**
 * Serpentine Quest - Web Audio Sound FX System
 * Zero external audio dependencies - 100% synthesized, low latency & lightweight!
 */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('serpentine_muted') === 'true';
    this.volume = 0.25;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('serpentine_muted', this.isMuted);
    return this.isMuted;
  }

  // Play a simple custom note with envelope
  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.2, pitchSlide = null) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (pitchSlide) {
        osc.frequency.exponentialRampToValueAtTime(pitchSlide, this.ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(gainVal * this.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // Normal food eaten sound (Upward cheerful chime)
  playEat() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Golden / Star apple eaten sound (Sparkling Arpeggio)
  playGoldenEat() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.18, 0.25);
      }, idx * 45);
    });
  }

  // Crash / Game Over sound
  playDie() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.45);

    gain.gain.setValueAtTime(0.35 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.46);
  }

  // Direction turn / step click (very subtle)
  playTurn() {
    if (this.isMuted) return;
    this.playTone(600, 'sine', 0.03, 0.05, 400);
  }

  // Button click in UI
  playClick() {
    if (this.isMuted) return;
    this.playTone(800, 'sine', 0.06, 0.15, 600);
  }

  // New High Score fanfare
  playNewHighScore() {
    if (this.isMuted) return;
    const chords = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
    chords.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.35, 0.3);
      }, idx * 90);
    });
  }
}

// Global Sound Instance
window.soundManager = new SoundManager();
