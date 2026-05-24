// Web Audio API Sound Engine
// Aligned with soulextract.com design system volumes

class SoundEngine {
  private audioContext: AudioContext | null = null;
  private volume = 0.3; // soulextract global volume
  private muted = false;
  private bgAudioRef: HTMLAudioElement | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  getVolume(): number {
    return this.volume;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted && this.bgAudioRef) {
      this.bgAudioRef.pause();
    } else if (!muted && this.bgAudioRef) {
      this.bgAudioRef.play().catch(() => {});
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', gainValue?: number) {
    if (this.muted) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    const vol = (gainValue ?? this.volume) * this.volume;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  /**
   * Plays an audio file from the public folder.
   * Falls back to the provided synthetic callback if the file fails to load.
   * Respects the muted state — no sound plays when muted.
   */
  private playAudioFile(src: string, volume: number, fallback: () => void) {
    if (this.muted) return;
    const audio = new Audio(src);
    audio.volume = volume * this.volume;
    audio.play().catch(() => {
      // Autoplay blocked or file not found — fall back to synthetic sound
      fallback();
    });
    audio.addEventListener('error', () => {
      // File failed to load — fall back to synthetic sound
      fallback();
    });
  }

  // ─── Background Music ────────────────────────────────────────────────

  playBGM() {
    if (this.muted) return;
    if (this.bgAudioRef) {
      // Already playing or paused — just resume
      if (!this.muted) {
        this.bgAudioRef.play().catch(() => {});
      }
      return;
    }

    const audio = new Audio('/audio/bg.mp4');
    audio.loop = true;
    audio.volume = 0.3 * this.volume; // soulextract BGM volume
    this.bgAudioRef = audio;

    audio.play().catch(() => {
      // Autoplay blocked — will be retried on next user interaction via setMuted or explicit call
    });
  }

  stopBGM() {
    if (this.bgAudioRef) {
      this.bgAudioRef.pause();
      this.bgAudioRef.currentTime = 0;
      this.bgAudioRef = null;
    }
  }

  // ─── Rocket Sound Effects ────────────────────────────────────────────

  playRocketLaunch() {
    this.playAudioFile('/audio/rocketlaunch.mp4', 0.6, () => this.launch());
  }

  playRocketCrash() {
    this.playAudioFile('/audio/rocketcrash.mp4', 0.6, () => this.crash());
  }

  // ─── Hatch / Landing Sound ─────────────────────────────────────────

  playHatch() {
    this.playAudioFile('/audio/hatch.mp3', 0.7, () => this.success());
  }

  // ─── V1 Sound Effects (file-based) ───────────────────────────────────

  playDeploy() {
    this.playAudioFile('/audio/deploy.mp3', 0.6, () => this.success());
  }

  playExpand() {
    this.playAudioFile('/audio/expand.mp3', 0.6, () => this.achievement());
  }

  playFade() {
    this.playAudioFile('/audio/fade.mp3', 0.6, () => this.failure());
  }

  playHoverFile() {
    this.playAudioFile('/audio/hover.mp3', 0.5, () => this.hover());
  }

  playStart() {
    this.playAudioFile('/audio/start.mp3', 0.15, () => this.success()); // soulextract start volume override
  }

  playTransmission() {
    this.playAudioFile('/audio/transmission.mp3', 0.6, () => this.achievement());
  }

  playTypingFile() {
    this.playAudioFile('/audio/typing.mp3', 0.5, () => this.type());
  }

  playClickFile() {
    this.playAudioFile('/audio/click.mp3', 0.5, () => this.click());
  }

  playLogo() {
    this.playAudioFile('/audio/logo.mp3', 0.3, () => this.success()); // soulextract logo volume
  }

  // ─── Canonical Public Methods ────────────────────────────────────────
  // These are the methods all components should call for hover/click sounds.

  /** Canonical hover sound — all components should call this for hover effects */
  playHover() {
    this.playHoverFile();
  }

  /** Canonical click sound — all components should call this for click effects */
  playClick() {
    this.playClickFile();
  }

  /** Transition sound — used when transitioning between pages */
  playTransitionSound() {
    this.playDeploy();
  }

  // ─── Convenience aliases (file-based with synthetic fallback) ────────

  playClick() {
    this.playClickFile();
  }

  playHover() {
    this.playHoverFile();
  }

  // ─── Synthetic Sound Effects (original) ──────────────────────────────

  click() {
    this.playTone(800, 0.08, 'square', 0.15);
  }

  hover() {
    this.playTone(1200, 0.04, 'sine', 0.08);
  }

  type() {
    this.playTone(600 + Math.random() * 400, 0.05, 'square', 0.08);
  }

  /**
   * Sci-fi per-letter typing click — digital terminal / holographic interface sound
   * Used by TypingText for each character reveal and by input fields on each keystroke
   * Produces a brief electronic chirp that sounds like a spaceship terminal
   */
  playTypeClick() {
    if (this.muted) return;
    const ctx = this.getContext();

    // Layer 1: Short digital chirp — a quick sine sweep from high to mid frequency
    // This gives the "data transmission" feel
    const chirp = ctx.createOscillator();
    const chirpGain = ctx.createGain();
    chirp.type = 'sine';
    const baseFreq = 1800 + Math.random() * 1200; // randomize between 1800-3000Hz
    chirp.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    chirp.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, ctx.currentTime + 0.03);
    chirpGain.gain.setValueAtTime(this.volume * 0.12, ctx.currentTime);
    chirpGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
    chirp.connect(chirpGain);
    chirpGain.connect(ctx.destination);
    chirp.start(ctx.currentTime);
    chirp.stop(ctx.currentTime + 0.035);

    // Layer 2: Tiny noise burst — the "digital artifact" texture
    const noiseSize = Math.floor(ctx.sampleRate * 0.015); // 15ms
    const noiseBuffer = ctx.createBuffer(1, noiseSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseSize; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseSize * 0.12));
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(3000 + Math.random() * 2000, ctx.currentTime);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(this.volume * 0.08, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(ctx.currentTime);
    noiseSource.stop(ctx.currentTime + 0.015);

    // Layer 3: Subtle sub-bass "thump" — gives weight, like a relay closing
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(80 + Math.random() * 40, ctx.currentTime);
    subGain.gain.setValueAtTime(this.volume * 0.07, ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);
    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(ctx.currentTime);
    sub.stop(ctx.currentTime + 0.025);
  }

  success() {
    if (this.muted) return;
    const ctx = this.getContext();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  }

  failure() {
    if (this.muted) return;
    const ctx = this.getContext();
    const notes = [392, 311.13]; // G4, Eb4
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2);
      gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.3);
    });
  }

  /**
   * Error buzzer — harsh dual-tone buzz for wrong simulation results
   * Sounds like an alarm / denial buzzer: low buzzy tone + high dissonant tone
   */
  errorBuzzer() {
    if (this.muted) return;
    const ctx = this.getContext();

    // Layer 1: Low buzzy square wave — the "buzzer" base
    const buzz = ctx.createOscillator();
    const buzzGain = ctx.createGain();
    buzz.type = 'square';
    buzz.frequency.setValueAtTime(150, ctx.currentTime);
    buzzGain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);
    buzzGain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime + 0.15);
    buzzGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    buzz.connect(buzzGain);
    buzzGain.connect(ctx.destination);
    buzz.start(ctx.currentTime);
    buzz.stop(ctx.currentTime + 0.35);

    // Layer 2: Dissonant high tone — the "alarm" sting
    const alarm = ctx.createOscillator();
    const alarmGain = ctx.createGain();
    alarm.type = 'sawtooth';
    alarm.frequency.setValueAtTime(520, ctx.currentTime);
    alarm.frequency.setValueAtTime(480, ctx.currentTime + 0.1);
    alarm.frequency.setValueAtTime(520, ctx.currentTime + 0.2);
    alarmGain.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime);
    alarmGain.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime + 0.2);
    alarmGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    alarm.connect(alarmGain);
    alarmGain.connect(ctx.destination);
    alarm.start(ctx.currentTime);
    alarm.stop(ctx.currentTime + 0.4);

    // Layer 3: Quick noise burst — digital "rejected" texture
    const noiseSize = Math.floor(ctx.sampleRate * 0.06);
    const noiseBuffer = ctx.createBuffer(1, noiseSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseSize; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseSize * 0.3));
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(800, ctx.currentTime);
    noiseFilter.Q.setValueAtTime(2, ctx.currentTime);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(ctx.currentTime);
    noiseSource.stop(ctx.currentTime + 0.06);
  }

  achievement() {
    if (this.muted) return;
    const ctx = this.getContext();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.4);
    });
  }

  launch() {
    if (this.muted) return;
    const ctx = this.getContext();
    // Noise-like rising sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 2);
    gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    gain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime + 1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 2.5);

    // Rumble
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(40, ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(60, ctx.currentTime + 2);
    gain2.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 2.5);
  }

  /**
   * Sci-fi confirmation chirp — "chhh" sound for when something is confirmed/granted
   * White noise burst + rising tone = that satisfying "access granted" feel
   */
  confirmChirp() {
    if (this.muted) return;
    const ctx = this.getContext();

    // Layer 1: Short noise burst — the "chhh" texture
    const noiseSize = Math.floor(ctx.sampleRate * 0.08); // 80ms
    const noiseBuffer = ctx.createBuffer(1, noiseSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseSize; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseSize * 0.25));
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2500, ctx.currentTime);
    noiseFilter.Q.setValueAtTime(1.5, ctx.currentTime);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(this.volume * 0.35, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(ctx.currentTime);
    noiseSource.stop(ctx.currentTime + 0.08);

    // Layer 2: Rising chirp tone — the "confirmed" sweep
    const chirp = ctx.createOscillator();
    const chirpGain = ctx.createGain();
    chirp.type = 'sine';
    chirp.frequency.setValueAtTime(800, ctx.currentTime);
    chirp.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.06);
    chirpGain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);
    chirpGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    chirp.connect(chirpGain);
    chirpGain.connect(ctx.destination);
    chirp.start(ctx.currentTime);
    chirp.stop(ctx.currentTime + 0.1);

    // Layer 3: Quick high ping — the satisfying "ding" on top
    const ping = ctx.createOscillator();
    const pingGain = ctx.createGain();
    ping.type = 'sine';
    ping.frequency.setValueAtTime(2200, ctx.currentTime + 0.04);
    pingGain.gain.setValueAtTime(0, ctx.currentTime);
    pingGain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime + 0.04);
    pingGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    ping.connect(pingGain);
    pingGain.connect(ctx.destination);
    ping.start(ctx.currentTime + 0.04);
    ping.stop(ctx.currentTime + 0.15);
  }

  countdown() {
    this.playTone(440, 0.15, 'square', 0.2);
  }

  crash() {
    if (this.muted) return;
    const ctx = this.getContext();
    // Explosion-like noise burst
    const bufferSize = ctx.sampleRate * 0.8;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.8);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);

    // Low boom
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.6);
    oscGain.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  }
}

export const soundEngine = new SoundEngine();
