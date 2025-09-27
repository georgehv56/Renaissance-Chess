class SoundService {
  private moveSound: HTMLAudioElement;
  private captureSound: HTMLAudioElement;
  private checkSound: HTMLAudioElement;
  private endSound: HTMLAudioElement;
  private isUnlocked = false;

  constructor() {
    this.moveSound = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3');
    this.captureSound = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3');
    this.checkSound = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3');
    this.endSound = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-end.mp3');
    
    // Preload sounds
    this.moveSound.load();
    this.captureSound.load();
    this.checkSound.load();
    this.endSound.load();
  }

  public unlockAudio() {
    if (this.isUnlocked) return;
    
    // Play all sounds muted to unlock them for autoplay policies
    const sounds = [this.moveSound, this.captureSound, this.checkSound, this.endSound];
    sounds.forEach(sound => {
      const originalVolume = sound.volume;
      const originalMuted = sound.muted;
      sound.volume = 0;
      sound.muted = true;
      sound.play().then(() => {
        sound.pause();
        sound.currentTime = 0;
        sound.volume = originalVolume;
        sound.muted = originalMuted;
      }).catch(() => {
        // Restore settings even if play fails
        sound.volume = originalVolume;
        sound.muted = originalMuted;
      });
    });
    
    this.isUnlocked = true;
  }

  private playSound(audio: HTMLAudioElement) {
    audio.currentTime = 0;
    audio.play().catch(error => console.error("Error playing sound:", error));
  }

  public playMove() {
    this.playSound(this.moveSound);
  }

  public playCapture() {
    this.playSound(this.captureSound);
  }

  public playCheck() {
    this.playSound(this.checkSound);
  }

  public playEnd() {
    this.playSound(this.endSound);
  }
}

export const soundService = new SoundService();