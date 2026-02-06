/**
 * Audio Manager
 *
 * Manages game audio including footsteps, ambient sounds, combat effects,
 * interaction sounds, and background music. Supports loading audio from
 * asset collections or falling back to default sounds.
 */

import { Scene, Sound, Vector3 } from '@babylonjs/core';
import type { VisualAsset } from '@shared/schema.ts';

export type AudioRole = 'footstep' | 'ambient' | 'combat' | 'interact' | 'music';

export interface AudioConfig {
  footstep?: string;
  ambient?: string;
  combat?: string;
  interact?: string;
  music?: string;
}

interface LoadedSound {
  sound: Sound;
  role: AudioRole;
  assetId?: string;
}

export class AudioManager {
  private scene: Scene;
  private sounds: Map<string, LoadedSound> = new Map();
  private ambientSounds: Sound[] = [];
  private musicTrack: Sound | null = null;
  
  // Volume levels (0-1)
  private masterVolume: number = 1.0;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.5;
  private ambientVolume: number = 0.6;

  // State
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Initialize audio manager with audio config from asset collection
   * @param audioConfig - Map of audio roles to asset IDs
   * @param worldAssets - Array of visual assets from the world
   */
  public async initialize(
    audioConfig: AudioConfig | null,
    worldAssets: VisualAsset[]
  ): Promise<void> {
    if (this.isInitialized) {
      console.warn('[AudioManager] Already initialized');
      return;
    }

    console.log('[AudioManager] Initializing audio system');

    if (audioConfig) {
      await this.loadAudioFromConfig(audioConfig, worldAssets);
    }

    this.isInitialized = true;
    console.log('[AudioManager] Audio system initialized');
  }

  /**
   * Load audio assets from the audio config
   */
  private async loadAudioFromConfig(
    audioConfig: AudioConfig,
    worldAssets: VisualAsset[]
  ): Promise<void> {
    const findAsset = (id: string | undefined): VisualAsset | null => {
      if (!id) return null;
      return worldAssets.find((a) => a.id === id) || null;
    };

    // Load each audio role
    const roles: AudioRole[] = ['footstep', 'ambient', 'combat', 'interact', 'music'];
    
    for (const role of roles) {
      const assetId = audioConfig[role];
      const asset = findAsset(assetId);
      
      if (asset && asset.filePath) {
        try {
          await this.loadSound(role, asset.filePath, assetId);
          console.log(`[AudioManager] Loaded ${role} audio from asset collection`);
        } catch (error) {
          console.warn(`[AudioManager] Failed to load ${role} audio:`, error);
        }
      }
    }
  }

  /**
   * Load a sound for a specific role
   */
  private loadSound(role: AudioRole, filePath: string, assetId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = filePath.startsWith('/') ? filePath : '/' + filePath;
      const soundName = `audio_${role}_${assetId || 'default'}`;

      const options: any = {
        loop: role === 'ambient' || role === 'music',
        autoplay: false,
        volume: this.getVolumeForRole(role)
      };

      const sound = new Sound(
        soundName,
        url,
        this.scene,
        () => {
          this.sounds.set(soundName, { sound, role, assetId });
          
          if (role === 'ambient') {
            this.ambientSounds.push(sound);
          } else if (role === 'music') {
            this.musicTrack = sound;
          }
          
          resolve();
        },
        options
      );

      sound.onended = () => {
        if (role !== 'ambient' && role !== 'music') {
          // One-shot sounds can be cleaned up or replayed
        }
      };
    });
  }

  /**
   * Get volume level for a specific role
   */
  private getVolumeForRole(role: AudioRole): number {
    if (this.isMuted) return 0;
    
    const baseVolume = this.masterVolume;
    
    switch (role) {
      case 'footstep':
      case 'combat':
      case 'interact':
        return baseVolume * this.sfxVolume;
      case 'ambient':
        return baseVolume * this.ambientVolume;
      case 'music':
        return baseVolume * this.musicVolume;
      default:
        return baseVolume;
    }
  }

  /**
   * Play a sound by role
   * @param role - The audio role to play
   * @param position - Optional 3D position for spatial audio
   */
  public playSound(role: AudioRole, position?: Vector3): void {
    const soundEntry = Array.from(this.sounds.values()).find(s => s.role === role);
    
    if (!soundEntry) {
      // console.warn(`[AudioManager] No sound loaded for role: ${role}`);
      return;
    }

    const sound = soundEntry.sound;

    if (position) {
      sound.setPosition(position);
      sound.spatialSound = true;
      sound.distanceModel = 'exponential';
      sound.rolloffFactor = 2;
      sound.maxDistance = 50;
    }

    if (!sound.isPlaying) {
      sound.play();
    }
  }

  /**
   * Play a one-shot sound effect (creates a new instance)
   * @param role - The audio role
   * @param position - Optional 3D position
   */
  public playSoundOneShot(role: AudioRole, position?: Vector3): void {
    const soundEntry = Array.from(this.sounds.values()).find(s => s.role === role);
    
    if (!soundEntry) {
      return;
    }

    // Clone the sound for one-shot playback
    const clone = soundEntry.sound.clone();
    if (clone) {
      clone.autoplay = false;
      
      if (position) {
        clone.setPosition(position);
        clone.spatialSound = true;
      }

      clone.onended = () => {
        clone.dispose();
      };

      clone.play();
    }
  }

  /**
   * Play footstep sound
   */
  public playFootstep(position?: Vector3): void {
    this.playSoundOneShot('footstep', position);
  }

  /**
   * Play combat sound
   */
  public playCombatSound(position?: Vector3): void {
    this.playSoundOneShot('combat', position);
  }

  /**
   * Play interaction sound
   */
  public playInteractSound(position?: Vector3): void {
    this.playSoundOneShot('interact', position);
  }

  /**
   * Start ambient audio
   */
  public startAmbient(): void {
    for (const sound of this.ambientSounds) {
      if (!sound.isPlaying) {
        sound.play();
      }
    }
  }

  /**
   * Stop ambient audio
   */
  public stopAmbient(): void {
    for (const sound of this.ambientSounds) {
      if (sound.isPlaying) {
        sound.stop();
      }
    }
  }

  /**
   * Start background music
   */
  public startMusic(): void {
    if (this.musicTrack && !this.musicTrack.isPlaying) {
      this.musicTrack.play();
    }
  }

  /**
   * Stop background music
   */
  public stopMusic(): void {
    if (this.musicTrack && this.musicTrack.isPlaying) {
      this.musicTrack.stop();
    }
  }

  /**
   * Pause all audio
   */
  public pauseAll(): void {
    this.sounds.forEach(({ sound }) => {
      if (sound.isPlaying) {
        sound.pause();
      }
    });
  }

  /**
   * Resume all audio
   */
  public resumeAll(): void {
    this.sounds.forEach(({ sound }) => {
      if (sound.isPaused) {
        sound.play();
      }
    });
  }

  /**
   * Set master volume
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  /**
   * Set SFX volume
   */
  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  /**
   * Set music volume
   */
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicTrack) {
      this.musicTrack.setVolume(this.getVolumeForRole('music'));
    }
  }

  /**
   * Set ambient volume
   */
  public setAmbientVolume(volume: number): void {
    this.ambientVolume = Math.max(0, Math.min(1, volume));
    for (const sound of this.ambientSounds) {
      sound.setVolume(this.getVolumeForRole('ambient'));
    }
  }

  /**
   * Toggle mute
   */
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.updateAllVolumes();
    return this.isMuted;
  }

  /**
   * Set mute state
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.updateAllVolumes();
  }

  /**
   * Update volumes for all loaded sounds
   */
  private updateAllVolumes(): void {
    this.sounds.forEach(({ sound, role }) => {
      sound.setVolume(this.getVolumeForRole(role));
    });
  }

  /**
   * Load a sound dynamically (e.g., from a quest or event)
   */
  public async loadDynamicSound(
    name: string,
    filePath: string,
    role: AudioRole,
    options?: { loop?: boolean; autoplay?: boolean; volume?: number }
  ): Promise<Sound | null> {
    return new Promise((resolve) => {
      const url = filePath.startsWith('/') ? filePath : '/' + filePath;

      const sound = new Sound(
        name,
        url,
        this.scene,
        () => {
          this.sounds.set(name, { sound, role });
          resolve(sound);
        },
        {
          loop: options?.loop ?? false,
          autoplay: options?.autoplay ?? false,
          volume: options?.volume ?? this.getVolumeForRole(role)
        }
      );
    });
  }

  /**
   * Get audio state for UI
   */
  public getAudioState(): {
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    ambientVolume: number;
    isMuted: boolean;
    isPlaying: { ambient: boolean; music: boolean };
  } {
    return {
      masterVolume: this.masterVolume,
      sfxVolume: this.sfxVolume,
      musicVolume: this.musicVolume,
      ambientVolume: this.ambientVolume,
      isMuted: this.isMuted,
      isPlaying: {
        ambient: this.ambientSounds.some(s => s.isPlaying),
        music: this.musicTrack?.isPlaying ?? false
      }
    };
  }

  /**
   * Dispose of all audio resources
   */
  public dispose(): void {
    console.log('[AudioManager] Disposing audio resources');

    this.sounds.forEach(({ sound }) => {
      sound.dispose();
    });
    this.sounds.clear();
    this.ambientSounds = [];
    this.musicTrack = null;
    this.isInitialized = false;
  }
}
