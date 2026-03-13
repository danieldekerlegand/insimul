/**
 * Audio utilities for voice chat — silence detection and ready beep.
 */

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
