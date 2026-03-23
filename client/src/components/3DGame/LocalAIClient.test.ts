/**
 * Tests for LocalAIClient — renderer-side Electron AI abstraction
 *
 * Run with: npx tsx client/src/components/3DGame/LocalAIClient.test.ts
 *
 * Mocks window.electronAPI to test all code paths without Electron.
 */

import { LocalAIClient } from './LocalAIClient';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

// ── Mock helpers ────────────────────────────────────────────────────────────

function setupMockElectronAPI(overrides: Record<string, any> = {}) {
  (globalThis as any).window = {
    electronAPI: {
      aiAvailable: true,
      aiGenerate: async (prompt: string, opts?: any) => `response to: ${prompt}`,
      aiGenerateStream: async (prompt: string, opts: any, onChunk: (t: string) => void) => {
        const tokens = ['Hello', ' ', 'world'];
        for (const t of tokens) onChunk(t);
        return tokens.join('');
      },
      aiTTS: async (text: string, voice?: string) => new ArrayBuffer(16),
      aiSTT: async (buf: ArrayBuffer, hint?: string) => ({ text: 'transcribed', language: 'en' }),
      aiStatus: async () => ({ loaded: true, modelName: 'phi-4-mini', gpuLayers: 32, gpuType: 'Metal' }),
      ...overrides,
    },
  };
}

function clearMockElectronAPI() {
  delete (globalThis as any).window;
}

// ── Tests ───────────────────────────────────────────────────────────────────

function testIsAvailableWhenPresent() {
  console.log('\n— isAvailable when electronAPI present —');
  setupMockElectronAPI();
  assert(LocalAIClient.isAvailable() === true, 'returns true when aiAvailable is true');
  clearMockElectronAPI();
}

function testIsAvailableWhenAbsent() {
  console.log('\n— isAvailable when no electronAPI —');
  clearMockElectronAPI();
  assert(LocalAIClient.isAvailable() === false, 'returns false when window is undefined');

  (globalThis as any).window = {};
  assert(LocalAIClient.isAvailable() === false, 'returns false when electronAPI missing');

  (globalThis as any).window = { electronAPI: { aiAvailable: false } };
  assert(LocalAIClient.isAvailable() === false, 'returns false when aiAvailable is false');
  clearMockElectronAPI();
}

async function testGenerate() {
  console.log('\n— generate —');
  setupMockElectronAPI();
  const client = new LocalAIClient();
  const result = await client.generate('test prompt');
  assert(result === 'response to: test prompt', 'returns generated text');
  clearMockElectronAPI();
}

async function testGenerateWithOptions() {
  console.log('\n— generate with options —');
  let capturedOpts: any = null;
  setupMockElectronAPI({
    aiGenerate: async (_p: string, opts: any) => {
      capturedOpts = opts;
      return 'ok';
    },
  });
  const client = new LocalAIClient();
  await client.generate('p', { systemPrompt: 'sys', temperature: 0.5, maxTokens: 100 });
  assert(capturedOpts?.systemPrompt === 'sys', 'passes systemPrompt');
  assert(capturedOpts?.temperature === 0.5, 'passes temperature');
  assert(capturedOpts?.maxTokens === 100, 'passes maxTokens');
  clearMockElectronAPI();
}

async function testGenerateStream() {
  console.log('\n— generateStream —');
  setupMockElectronAPI();
  const client = new LocalAIClient();
  const tokens: string[] = [];
  const result = await client.generateStream('test', {}, (token) => tokens.push(token));
  assert(result === 'Hello world', 'returns full accumulated text');
  assert(tokens.length === 3, 'called onToken for each token');
  assert(tokens.join('') === 'Hello world', 'tokens accumulate correctly');
  clearMockElectronAPI();
}

async function testGenerateStreamNoCallback() {
  console.log('\n— generateStream without callback —');
  setupMockElectronAPI();
  const client = new LocalAIClient();
  const result = await client.generateStream('test');
  assert(result === 'Hello world', 'works without onToken callback');
  clearMockElectronAPI();
}

async function testTextToSpeech() {
  console.log('\n— textToSpeech —');
  setupMockElectronAPI();
  const client = new LocalAIClient();
  const blob = await client.textToSpeech('hello', 'Kore');
  assert(blob instanceof Blob, 'returns a Blob');
  assert(blob.type === 'audio/wav', 'blob has audio/wav type');
  assert(blob.size === 16, 'blob contains the ArrayBuffer data');
  clearMockElectronAPI();
}

async function testSpeechToText() {
  console.log('\n— speechToText —');
  setupMockElectronAPI();
  const client = new LocalAIClient();
  const audioBlob = new Blob([new ArrayBuffer(8)], { type: 'audio/webm' });
  const result = await client.speechToText(audioBlob, 'en');
  assert(result.text === 'transcribed', 'returns transcribed text');
  assert(result.language === 'en', 'returns language');
  clearMockElectronAPI();
}

async function testSpeechToTextConvertsBlob() {
  console.log('\n— speechToText converts Blob to ArrayBuffer —');
  let receivedBuffer: any = null;
  setupMockElectronAPI({
    aiSTT: async (buf: ArrayBuffer) => {
      receivedBuffer = buf;
      return { text: 'ok', language: 'en' };
    },
  });
  const client = new LocalAIClient();
  const audioBlob = new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/webm' });
  await client.speechToText(audioBlob);
  assert(receivedBuffer instanceof ArrayBuffer, 'converts Blob to ArrayBuffer before sending');
  assert(receivedBuffer.byteLength === 3, 'ArrayBuffer has correct size');
  clearMockElectronAPI();
}

async function testGetStatus() {
  console.log('\n— getStatus —');
  setupMockElectronAPI();
  const client = new LocalAIClient();
  const status = await client.getStatus();
  assert(status.loaded === true, 'loaded is true');
  assert(status.modelName === 'phi-4-mini', 'modelName correct');
  assert(status.gpuType === 'Metal', 'gpuType correct');
  clearMockElectronAPI();
}

async function testThrowsWhenNotAvailable() {
  console.log('\n— throws when AI not available —');
  clearMockElectronAPI();
  const client = new LocalAIClient();

  let threw = false;
  try {
    await client.generate('test');
  } catch (e: any) {
    threw = true;
    assert(e.message.includes('not available'), 'error message mentions not available');
  }
  assert(threw, 'generate() throws when AI unavailable');

  threw = false;
  try {
    await client.generateStream('test');
  } catch {
    threw = true;
  }
  assert(threw, 'generateStream() throws when AI unavailable');

  threw = false;
  try {
    await client.textToSpeech('test');
  } catch {
    threw = true;
  }
  assert(threw, 'textToSpeech() throws when AI unavailable');

  threw = false;
  try {
    await client.speechToText(new Blob([]));
  } catch {
    threw = true;
  }
  assert(threw, 'speechToText() throws when AI unavailable');

  threw = false;
  try {
    await client.getStatus();
  } catch {
    threw = true;
  }
  assert(threw, 'getStatus() throws when AI unavailable');
}

// ── Runner ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('LocalAIClient tests\n====================');
  try {
    testIsAvailableWhenPresent();
    testIsAvailableWhenAbsent();
    await testGenerate();
    await testGenerateWithOptions();
    await testGenerateStream();
    await testGenerateStreamNoCallback();
    await testTextToSpeech();
    await testSpeechToText();
    await testSpeechToTextConvertsBlob();
    await testGetStatus();
    await testThrowsWhenNotAvailable();

    console.log(`\n${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

main();
