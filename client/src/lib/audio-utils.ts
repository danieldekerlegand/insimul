/**
 * Audio utilities for voice chat — silence detection, ready beep, and VAD.
 */

export interface VADOptions {
  /** RMS energy threshold to consider as speech (0-1). Default: 0.015 */
  speechThreshold?: number;
  /** Seconds of silence before triggering speech end. Default: 1.5 */
  silenceDuration?: number;
  /** How often to sample audio energy in ms. Default: 50 */
  pollIntervalMs?: number;
  /** Called when speech is first detected after silence. */
  onSpeechStart?: () => void;
  /** Called when silence persists for silenceDuration after speech. */
  onSpeechEnd?: () => void;
  /** Called each poll with the current RMS energy level (0-1). */
  onEnergyChange?: (energy: number) => void;
}

/**
 * Voice Activity Detector using Web Audio API AnalyserNode.
 * Monitors a MediaStream for speech start/end events based on RMS energy.
 */
export class VoiceActivityDetector {
  private analyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private dataArray: Float32Array | null = null;

  private _isSpeaking = false;
  private silenceStartTime: number | null = null;

  private readonly speechThreshold: number;
  private readonly silenceDuration: number;
  private readonly pollIntervalMs: number;
  private readonly onSpeechStart?: () => void;
  private readonly onSpeechEnd?: () => void;
  private readonly onEnergyChange?: (energy: number) => void;

  /** Whether speech is currently detected. */
  get isSpeaking(): boolean {
    return this._isSpeaking;
  }

  constructor(options: VADOptions = {}) {
    this.speechThreshold = options.speechThreshold ?? 0.015;
    this.silenceDuration = options.silenceDuration ?? 1.5;
    this.pollIntervalMs = options.pollIntervalMs ?? 50;
    this.onSpeechStart = options.onSpeechStart;
    this.onSpeechEnd = options.onSpeechEnd;
    this.onEnergyChange = options.onEnergyChange;
  }

  /**
   * Start monitoring the given MediaStream for voice activity.
   * Call destroy() to stop and release resources.
   */
  start(stream: MediaStream): void {
    this.destroy();

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.sourceNode = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.sourceNode.connect(this.analyser);

    this.dataArray = new Float32Array(this.analyser.fftSize);
    this._isSpeaking = false;
    this.silenceStartTime = null;

    this.pollTimer = setInterval(() => this.poll(), this.pollIntervalMs);
  }

  /** Stop monitoring and release all audio resources. */
  destroy(): void {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.sourceNode?.disconnect();
    this.sourceNode = null;
    this.analyser = null;
    this.dataArray = null;
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
    }
    this.audioContext = null;
    this._isSpeaking = false;
    this.silenceStartTime = null;
  }

  /** Calculate RMS energy from the current analyser data. Exposed for testing. */
  computeRMS(): number {
    if (!this.analyser || !this.dataArray) return 0;
    this.analyser.getFloatTimeDomainData(this.dataArray);
    let sumSquares = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sumSquares += this.dataArray[i] * this.dataArray[i];
    }
    return Math.sqrt(sumSquares / this.dataArray.length);
  }

  private poll(): void {
    const energy = this.computeRMS();
    this.onEnergyChange?.(energy);

    const now = Date.now();

    if (energy >= this.speechThreshold) {
      // Speech detected
      this.silenceStartTime = null;
      if (!this._isSpeaking) {
        this._isSpeaking = true;
        this.onSpeechStart?.();
      }
    } else {
      // Below threshold — silence
      if (this._isSpeaking) {
        if (this.silenceStartTime === null) {
          this.silenceStartTime = now;
        } else if (now - this.silenceStartTime >= this.silenceDuration * 1000) {
          this._isSpeaking = false;
          this.silenceStartTime = null;
          this.onSpeechEnd?.();
        }
      }
    }
  }
}

/**
 * Check if an audio blob contains actual speech by measuring RMS energy.
 * Returns true if the audio is likely silence/noise (no speech detected).
 */
export async function isSilentAudio(audioBlob: Blob, threshold = 0.01): Promise<boolean> {
  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    try {
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);

      // Calculate RMS energy
      let sumSquares = 0;
      for (let i = 0; i < channelData.length; i++) {
        sumSquares += channelData[i] * channelData[i];
      }
      const rms = Math.sqrt(sumSquares / channelData.length);

      return rms < threshold;
    } finally {
      await audioContext.close();
    }
  } catch {
    // If we can't analyze the audio, assume it has speech
    return false;
  }
}

/**
 * Play a short beep to indicate recording readiness.
 */
export function playReadyBeep(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 880; // A5
      oscillator.type = 'sine';
      gainNode.gain.value = 0.15;

      // Quick fade out
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);

      oscillator.onended = () => {
        audioContext.close();
        resolve();
      };
    } catch {
      resolve();
    }
  });
}
