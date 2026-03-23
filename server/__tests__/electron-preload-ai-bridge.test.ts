import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Read the preload template source for content validation
const preloadSource = fs.readFileSync(
  path.join(__dirname, '..', 'services', 'game-export', 'babylon', 'templates', 'electron-preload.js'),
  'utf-8'
);

describe('Electron preload AI bridge template', () => {
  describe('template content', () => {
    it('uses contextBridge.exposeInMainWorld', () => {
      expect(preloadSource).toContain("contextBridge.exposeInMainWorld('electronAPI'");
    });

    it('preserves the existing readFile bridge', () => {
      expect(preloadSource).toContain("readFile: (relativePath) => ipcRenderer.invoke('read-file', relativePath)");
    });

    it('exposes aiAvailable as a function', () => {
      expect(preloadSource).toContain('aiAvailable: ()');
    });

    it('exposes aiGenerate wrapping ai:generate IPC', () => {
      expect(preloadSource).toContain("ipcRenderer.invoke('ai:generate'");
    });

    it('exposes aiGenerateStream with streaming token support', () => {
      expect(preloadSource).toContain("ipcRenderer.invoke('ai:generate-stream'");
      expect(preloadSource).toContain('ai:stream-token:');
    });

    it('exposes aiTTS wrapping ai:tts IPC', () => {
      expect(preloadSource).toContain("ipcRenderer.invoke('ai:tts'");
    });

    it('exposes aiSTT wrapping ai:stt IPC', () => {
      expect(preloadSource).toContain("ipcRenderer.invoke('ai:stt'");
    });

    it('exposes aiStatus wrapping ai:status IPC', () => {
      expect(preloadSource).toContain("ipcRenderer.invoke('ai:status')");
    });

    it('does not enable nodeIntegration', () => {
      expect(preloadSource).not.toContain('nodeIntegration: true');
    });

    it('uses only contextBridge for renderer exposure', () => {
      // Should not use global or window assignments
      expect(preloadSource).not.toMatch(/\bglobal\.\w+\s*=/);
      expect(preloadSource).not.toMatch(/\bwindow\.\w+\s*=/);
    });
  });

  describe('simulated preload behavior', () => {
    let mockIpcRenderer: {
      invoke: ReturnType<typeof vi.fn>;
      on: ReturnType<typeof vi.fn>;
      removeListener: ReturnType<typeof vi.fn>;
    };
    let exposedAPI: Record<string, any>;

    beforeEach(() => {
      mockIpcRenderer = {
        invoke: vi.fn(),
        on: vi.fn(),
        removeListener: vi.fn(),
      };
      exposedAPI = {};

      // Simulate contextBridge.exposeInMainWorld by capturing the exposed object
      const mockContextBridge = {
        exposeInMainWorld: (_key: string, api: Record<string, any>) => {
          exposedAPI = api;
        },
      };

      // Build a mock require function for the preload script
      const mockRequire = (mod: string) => {
        if (mod === 'electron') {
          return { contextBridge: mockContextBridge, ipcRenderer: mockIpcRenderer };
        }
        throw new Error(`Unexpected require: ${mod}`);
      };

      // Execute the preload script in a sandboxed context
      const fn = new Function('require', preloadSource);
      fn(mockRequire);
    });

    it('exposes readFile function', () => {
      expect(typeof exposedAPI.readFile).toBe('function');
    });

    it('readFile calls ipcRenderer.invoke with read-file channel', async () => {
      mockIpcRenderer.invoke.mockResolvedValue('file contents');
      const result = await exposedAPI.readFile('data/world.json');
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('read-file', 'data/world.json');
      expect(result).toBe('file contents');
    });

    it('aiAvailable returns a cached promise resolving to boolean', async () => {
      mockIpcRenderer.invoke.mockResolvedValue({ loaded: true, modelName: 'phi-4', gpuLayers: 32, gpuType: 'metal' });
      const result = await exposedAPI.aiAvailable();
      expect(result).toBe(true);

      // Second call should return cached promise (no new invoke)
      mockIpcRenderer.invoke.mockClear();
      const result2 = await exposedAPI.aiAvailable();
      expect(result2).toBe(true);
      expect(mockIpcRenderer.invoke).not.toHaveBeenCalled();
    });

    it('aiAvailable returns false when ai:status fails', async () => {
      mockIpcRenderer.invoke.mockRejectedValue(new Error('No handler'));
      const result = await exposedAPI.aiAvailable();
      expect(result).toBe(false);
    });

    it('aiAvailable returns false when status.loaded is false', async () => {
      mockIpcRenderer.invoke.mockResolvedValue({ loaded: false });
      const result = await exposedAPI.aiAvailable();
      expect(result).toBe(false);
    });

    it('aiGenerate invokes ai:generate with prompt and options', async () => {
      mockIpcRenderer.invoke.mockResolvedValue('Hello, traveler!');
      const result = await exposedAPI.aiGenerate('Say hello', { temperature: 0.7 });
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('ai:generate', 'Say hello', { temperature: 0.7 });
      expect(result).toBe('Hello, traveler!');
    });

    it('aiGenerateStream registers listener and invokes ai:generate-stream', async () => {
      const onChunk = vi.fn();
      mockIpcRenderer.invoke.mockResolvedValue(undefined);

      // Start the stream
      const streamPromise = exposedAPI.aiGenerateStream('Say hello', { temperature: 0.7 }, onChunk);

      // Verify IPC listener was registered with unique channel
      expect(mockIpcRenderer.on).toHaveBeenCalledTimes(1);
      const [channel, handler] = mockIpcRenderer.on.mock.calls[0];
      expect(channel).toMatch(/^ai:stream-token:\d+$/);

      // Verify invoke was called
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
        'ai:generate-stream',
        'Say hello',
        { temperature: 0.7 },
        expect.any(Number)
      );

      // Simulate tokens arriving
      handler(null, { token: 'Hello' });
      handler(null, { token: ', ' });
      handler(null, { token: 'traveler!' });
      expect(onChunk).toHaveBeenCalledTimes(3);
      expect(onChunk).toHaveBeenCalledWith('Hello');
      expect(onChunk).toHaveBeenCalledWith(', ');
      expect(onChunk).toHaveBeenCalledWith('traveler!');

      // Signal done
      handler(null, { done: true, fullText: 'Hello, traveler!' });

      const result = await streamPromise;
      expect(result).toBe('Hello, traveler!');
      expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith(channel, handler);
    });

    it('aiGenerateStream rejects on error token', async () => {
      mockIpcRenderer.invoke.mockResolvedValue(undefined);

      const streamPromise = exposedAPI.aiGenerateStream('bad prompt', {}, vi.fn());

      const [channel, handler] = mockIpcRenderer.on.mock.calls[0];
      handler(null, { error: 'Model not loaded' });

      await expect(streamPromise).rejects.toThrow('Model not loaded');
      expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith(channel, handler);
    });

    it('aiGenerateStream rejects if invoke itself fails', async () => {
      mockIpcRenderer.invoke.mockRejectedValue(new Error('IPC failed'));

      const streamPromise = exposedAPI.aiGenerateStream('prompt', {}, vi.fn());
      await expect(streamPromise).rejects.toThrow('IPC failed');
    });

    it('aiGenerateStream uses unique IDs for concurrent streams', () => {
      mockIpcRenderer.invoke.mockResolvedValue(undefined);

      exposedAPI.aiGenerateStream('p1', {}, vi.fn());
      exposedAPI.aiGenerateStream('p2', {}, vi.fn());

      const channel1 = mockIpcRenderer.on.mock.calls[0][0];
      const channel2 = mockIpcRenderer.on.mock.calls[1][0];
      expect(channel1).not.toBe(channel2);
    });

    it('aiTTS invokes ai:tts with text, voice, speed', async () => {
      const audioBuf = new ArrayBuffer(100);
      mockIpcRenderer.invoke.mockResolvedValue(audioBuf);
      const result = await exposedAPI.aiTTS('Hello world', 'Kore', 1.0);
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('ai:tts', {
        text: 'Hello world',
        voice: 'Kore',
        speed: 1.0,
      });
      expect(result).toBe(audioBuf);
    });

    it('aiSTT invokes ai:stt with audio buffer and language hint', async () => {
      const audioBuf = new ArrayBuffer(200);
      mockIpcRenderer.invoke.mockResolvedValue({ text: 'hello', language: 'en' });
      const result = await exposedAPI.aiSTT(audioBuf, 'en-US');
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('ai:stt', {
        audio: audioBuf,
        languageHint: 'en-US',
      });
      expect(result).toEqual({ text: 'hello', language: 'en' });
    });

    it('aiStatus invokes ai:status and returns status object', async () => {
      const status = { loaded: true, modelName: 'phi-4-mini', gpuLayers: 32, gpuType: 'metal' };
      mockIpcRenderer.invoke.mockResolvedValue(status);
      const result = await exposedAPI.aiStatus();
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('ai:status');
      expect(result).toEqual(status);
    });
  });
});
