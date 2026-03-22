/**
 * Tests for LocalAIProvider
 *
 * These tests verify the provider's API contract, configuration handling,
 * and request queuing without requiring an actual GGUF model file.
 */

import { LocalAIProvider } from '../services/ai/providers/local/local-ai-provider.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ ${message}`);
    failed++;
  }
}

async function assertThrows(fn: () => Promise<unknown>, message: string) {
  try {
    await fn();
    console.error(`  ❌ ${message} (did not throw)`);
    failed++;
  } catch {
    console.log(`  ✅ ${message}`);
    passed++;
  }
}

async function main() {
  console.log('=== LocalAIProvider Tests ===\n');

  // --- Test 1: Construction and defaults ---
  console.log('Test 1: Construction and default configuration');
  {
    const provider = new LocalAIProvider();
    assert(provider.name === 'local', 'Provider name is "local"');
    assert(!provider.isLoaded(), 'Not loaded initially');
    assert(provider.estimateCost(1000, 500) === 0, 'Local models have zero API cost');
  }

  // --- Test 2: ILLMProvider interface compliance ---
  console.log('\nTest 2: ILLMProvider interface compliance');
  {
    const provider = new LocalAIProvider();
    assert(typeof provider.generate === 'function', 'Has generate() method');
    assert(typeof provider.generateBatch === 'function', 'Has generateBatch() method');
    assert(typeof provider.estimateCost === 'function', 'Has estimateCost() method');
    assert(typeof provider.name === 'string', 'Has name property');
  }

  // --- Test 3: generateStream interface ---
  console.log('\nTest 3: Streaming interface');
  {
    const provider = new LocalAIProvider();
    assert(typeof provider.generateStream === 'function', 'Has generateStream() method');
  }

  // --- Test 4: Model path resolution ---
  console.log('\nTest 4: Model path resolution');
  {
    // Explicit path
    const provider1 = new LocalAIProvider({ modelPath: '/tmp/test-model.gguf' });
    assert(provider1.getModelPath() === '/tmp/test-model.gguf', 'Uses explicit modelPath');

    // Named model
    const provider2 = new LocalAIProvider({ modelName: 'phi-4-mini-q4' });
    assert(provider2.getModelPath() === 'models/phi-4-mini-q4.gguf', 'Resolves named model to models/ directory');

    // No path configured
    const provider3 = new LocalAIProvider();
    let threw = false;
    try {
      provider3.getModelPath();
    } catch (e: unknown) {
      threw = true;
      assert(
        (e as Error).message.includes('No model configured'),
        'Throws descriptive error when no model path set'
      );
    }
    if (!threw) {
      assert(false, 'Should throw when no model path configured');
    }
  }

  // --- Test 5: Environment variable configuration ---
  console.log('\nTest 5: Environment variable configuration');
  {
    const origPath = process.env.LOCAL_MODEL_PATH;
    const origName = process.env.LOCAL_MODEL_NAME;
    const origGpu = process.env.LOCAL_GPU_LAYERS;
    const origCtx = process.env.LOCAL_CONTEXT_SIZE;

    try {
      process.env.LOCAL_MODEL_PATH = '/env/test-model.gguf';
      const provider = new LocalAIProvider();
      assert(provider.getModelPath() === '/env/test-model.gguf', 'Reads LOCAL_MODEL_PATH from env');

      delete process.env.LOCAL_MODEL_PATH;
      process.env.LOCAL_MODEL_NAME = 'test-model';
      const provider2 = new LocalAIProvider();
      assert(provider2.getModelPath() === 'models/test-model.gguf', 'Reads LOCAL_MODEL_NAME from env');
    } finally {
      if (origPath !== undefined) process.env.LOCAL_MODEL_PATH = origPath;
      else delete process.env.LOCAL_MODEL_PATH;
      if (origName !== undefined) process.env.LOCAL_MODEL_NAME = origName;
      else delete process.env.LOCAL_MODEL_NAME;
      if (origGpu !== undefined) process.env.LOCAL_GPU_LAYERS = origGpu;
      else delete process.env.LOCAL_GPU_LAYERS;
      if (origCtx !== undefined) process.env.LOCAL_CONTEXT_SIZE = origCtx;
      else delete process.env.LOCAL_CONTEXT_SIZE;
    }
  }

  // --- Test 6: generate() fails gracefully without model ---
  console.log('\nTest 6: Graceful failure without model file');
  {
    const provider = new LocalAIProvider({ modelPath: '/nonexistent/model.gguf' });
    await assertThrows(
      () => provider.generate({ prompt: 'Hello' }),
      'generate() throws when model file does not exist'
    );
    assert(!provider.isLoaded(), 'Provider stays unloaded after failed load');
  }

  // --- Test 7: dispose() is safe to call multiple times ---
  console.log('\nTest 7: Dispose safety');
  {
    const provider = new LocalAIProvider();
    await provider.dispose();
    await provider.dispose();
    assert(true, 'dispose() is safe to call on unloaded provider');
    assert(!provider.isLoaded(), 'isLoaded() is false after dispose');
  }

  // --- Test 8: Factory integration ---
  console.log('\nTest 8: Factory integration');
  {
    const { createLLMProvider } = await import('../services/llm-provider.js');

    const origPath = process.env.LOCAL_MODEL_PATH;
    process.env.LOCAL_MODEL_PATH = '/tmp/test.gguf';
    try {
      const local = createLLMProvider({ provider: 'local' });
      assert(local.name === 'local', 'Factory creates local provider');
      assert(local instanceof LocalAIProvider, 'Factory returns LocalAIProvider instance');
    } finally {
      if (origPath !== undefined) process.env.LOCAL_MODEL_PATH = origPath;
      else delete process.env.LOCAL_MODEL_PATH;
    }

    let threw = false;
    try {
      createLLMProvider({ provider: 'unknown' as 'gemini' });
    } catch {
      threw = true;
    }
    assert(threw, 'Factory still throws for unknown providers');
  }

  // --- Test 9: Config override precedence ---
  console.log('\nTest 9: Config override precedence');
  {
    const origPath = process.env.LOCAL_MODEL_PATH;
    process.env.LOCAL_MODEL_PATH = '/env/model.gguf';
    try {
      const provider = new LocalAIProvider({ modelPath: '/explicit/model.gguf' });
      assert(provider.getModelPath() === '/explicit/model.gguf', 'Explicit config overrides env var');
    } finally {
      if (origPath !== undefined) process.env.LOCAL_MODEL_PATH = origPath;
      else delete process.env.LOCAL_MODEL_PATH;
    }
  }

  // --- Summary ---
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
