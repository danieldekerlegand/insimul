/**
 * Tests for Electron Whisper STT Service
 *
 * Tests the WhisperSTTService, WAV helpers, and language mapping
 * exported from exports/babylon-example/electron/whisper-stt.js.
 * Mocks _invokeWhisper to avoid requiring actual whisper.cpp binary.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { join } from 'node:path';

// Import the module under test (no electron dependency)
const {
  WhisperSTTService,
  buildWavHeader,
  wrapPcmAsWav,
  bcp47ToWhisperLang,
} = require('../../exports/babylon-example/electron/whisper-stt');

// ── WAV Helper Tests ─────────────────────────────────────────────────

describe('Electron Whisper STT — WAV Helpers', () => {
  describe('buildWavHeader', () => {
    it('produces a 44-byte WAV header', () => {
      const header = buildWavHeader(1000, 16000, 1);
      expect(header.length).toBe(44);
    });

    it('starts with RIFF magic', () => {
      const header = buildWavHeader(1000, 16000, 1);
      expect(header.toString('ascii', 0, 4)).toBe('RIFF');
    });

    it('contains WAVE format', () => {
      const header = buildWavHeader(1000, 16000, 1);
      expect(header.toString('ascii', 8, 12)).toBe('WAVE');
    });

    it('encodes correct file and data sizes', () => {
      const pcmSize = 32000;
      const header = buildWavHeader(pcmSize, 16000, 1);
      expect(header.readUInt32LE(4)).toBe(36 + pcmSize);
      expect(header.readUInt32LE(40)).toBe(pcmSize);
    });

    it('encodes correct sample rate and channels', () => {
      const header = buildWavHeader(1000, 44100, 2);
      expect(header.readUInt32LE(24)).toBe(44100);
      expect(header.readUInt16LE(22)).toBe(2);
    });

    it('sets PCM format and 16-bit samples', () => {
      const header = buildWavHeader(1000, 16000, 1);
      expect(header.readUInt16LE(20)).toBe(1);
      expect(header.readUInt16LE(34)).toBe(16);
    });

    it('calculates correct byte rate', () => {
      const header = buildWavHeader(1000, 16000, 1);
      expect(header.readUInt32LE(28)).toBe(32000);
    });
  });

  describe('wrapPcmAsWav', () => {
    it('prepends 44-byte header to PCM data', () => {
      const pcm = Buffer.alloc(100, 0x42);
      const wav = wrapPcmAsWav(pcm);
      expect(wav.length).toBe(44 + 100);
    });

    it('preserves PCM data after header', () => {
      const pcm = Buffer.from([1, 2, 3, 4, 5]);
      const wav = wrapPcmAsWav(pcm);
      expect(Buffer.compare(wav.slice(44), pcm)).toBe(0);
    });

    it('uses default 16kHz mono', () => {
      const pcm = Buffer.alloc(10);
      const wav = wrapPcmAsWav(pcm);
      expect(wav.readUInt32LE(24)).toBe(16000);
      expect(wav.readUInt16LE(22)).toBe(1);
    });
  });
});

// ── Language Mapping Tests ───────────────────────────────────────────

describe('Electron Whisper STT — Language Mapping', () => {
  it('maps standard BCP-47 codes', () => {
    expect(bcp47ToWhisperLang('en')).toBe('en');
    expect(bcp47ToWhisperLang('fr')).toBe('fr');
    expect(bcp47ToWhisperLang('es')).toBe('es');
    expect(bcp47ToWhisperLang('ja')).toBe('ja');
  });

  it('maps regional BCP-47 codes', () => {
    expect(bcp47ToWhisperLang('en-US')).toBe('en');
    expect(bcp47ToWhisperLang('fr-FR')).toBe('fr');
    expect(bcp47ToWhisperLang('es-MX')).toBe('es');
    expect(bcp47ToWhisperLang('zh-CN')).toBe('zh');
  });

  it('is case-insensitive', () => {
    expect(bcp47ToWhisperLang('EN-US')).toBe('en');
    expect(bcp47ToWhisperLang('Fr-Ca')).toBe('fr');
  });

  it('returns undefined for unknown codes', () => {
    expect(bcp47ToWhisperLang('xx-YY')).toBeUndefined();
    expect(bcp47ToWhisperLang('tlk')).toBeUndefined();
  });
});

// ── WhisperSTTService Tests ─────────────────────────────────────────

describe('WhisperSTTService', () => {
  let service: InstanceType<typeof WhisperSTTService>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WhisperSTTService();
  });

  describe('construction', () => {
    it('starts unavailable', () => {
      expect(service.available).toBe(false);
    });

    it('has default binary path', () => {
      expect(service.binaryPath).toBe('whisper-cpp');
    });
  });

  describe('init', () => {
    it('sets available=false when model file is missing', async () => {
      await service.init('/nonexistent/path', { apiMode: 'local' });
      expect(service.available).toBe(false);
    });

    it('uses default model path when not specified', async () => {
      await service.init('/app', {});
      expect(service.modelPath).toBe(join('/app', 'ai/models/whisper-base.bin'));
    });

    it('uses custom model path from config', async () => {
      await service.init('/app', { whisperModelPath: 'custom/model.bin' });
      expect(service.modelPath).toBe(join('/app', 'custom/model.bin'));
    });

    it('uses custom binary path from config', async () => {
      await service.init('/app', { whisperBinaryPath: '/usr/local/bin/whisper' });
      expect(service.binaryPath).toBe('/usr/local/bin/whisper');
    });
  });

  describe('transcribe', () => {
    beforeEach(() => {
      service.available = true;
      service.modelPath = '/models/whisper-base.bin';
      service.binaryPath = 'whisper-cpp';
    });

    it('returns empty result when not available', async () => {
      service.available = false;
      const result = await service.transcribe(Buffer.alloc(100), 'en');
      expect(result).toEqual({ text: '', language: '' });
    });

    it('returns transcribed text from whisper', async () => {
      vi.spyOn(service, '_invokeWhisper').mockResolvedValue('Hello world');

      const result = await service.transcribe(Buffer.alloc(100), 'en-US');
      expect(result.text).toBe('Hello world');
      expect(result.language).toBe('en-US');
    });

    it('passes language hint to _invokeWhisper', async () => {
      const spy = vi.spyOn(service, '_invokeWhisper').mockResolvedValue('Bonjour');

      await service.transcribe(Buffer.alloc(100), 'fr-FR');

      expect(spy).toHaveBeenCalledWith(expect.any(String), 'fr');
    });

    it('passes undefined language for unknown BCP-47 codes', async () => {
      const spy = vi.spyOn(service, '_invokeWhisper').mockResolvedValue('text');

      await service.transcribe(Buffer.alloc(100), 'xx-YY');

      expect(spy).toHaveBeenCalledWith(expect.any(String), undefined);
    });

    it('omits language when no hint provided', async () => {
      const spy = vi.spyOn(service, '_invokeWhisper').mockResolvedValue('text');

      await service.transcribe(Buffer.alloc(100));

      expect(spy).toHaveBeenCalledWith(expect.any(String), undefined);
    });

    it('returns empty on whisper error (graceful failure)', async () => {
      vi.spyOn(service, '_invokeWhisper').mockRejectedValue(
        new Error('[WhisperSTT] whisper.cpp exited with code 1'),
      );

      const result = await service.transcribe(Buffer.alloc(100));
      expect(result).toEqual({ text: '', language: '' });
    });

    it('accepts ArrayBuffer input', async () => {
      vi.spyOn(service, '_invokeWhisper').mockResolvedValue('from arraybuffer');

      const arrayBuffer = new ArrayBuffer(100);
      const result = await service.transcribe(arrayBuffer);
      expect(result.text).toBe('from arraybuffer');
    });

    it('defaults language to "en" when no hint given', async () => {
      vi.spyOn(service, '_invokeWhisper').mockResolvedValue('hello');

      const result = await service.transcribe(Buffer.alloc(100));
      expect(result.language).toBe('en');
    });

    it('trims whitespace from transcription', async () => {
      vi.spyOn(service, '_invokeWhisper').mockResolvedValue('  hello world  ');

      const result = await service.transcribe(Buffer.alloc(100));
      expect(result.text).toBe('hello world');
    });

    it('serializes concurrent requests', async () => {
      let callCount = 0;
      vi.spyOn(service, '_invokeWhisper').mockImplementation(async () => {
        callCount++;
        return `result-${callCount}`;
      });

      const [r1, r2] = await Promise.all([
        service.transcribe(Buffer.alloc(50)),
        service.transcribe(Buffer.alloc(50)),
      ]);

      expect(r1.text).toBe('result-1');
      expect(r2.text).toBe('result-2');
    });
  });
});
