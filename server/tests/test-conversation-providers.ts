/**
 * Unit tests for conversation service LLM providers
 *
 * Tests:
 * - Provider registry registers and resolves providers
 * - GeminiStreamingProvider instantiates with correct name
 * - Registry throws on unknown provider
 * - Custom provider can be registered and retrieved
 */

import {
  registerProvider,
  getProvider,
  listProviders,
} from '../services/conversation/providers/provider-registry.js';
import { GeminiStreamingProvider } from '../services/conversation/providers/gemini-provider.js';
import type {
  IStreamingLLMProvider,
  ConversationContext,
} from '../services/conversation/providers/llm-provider.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  PASS: ${message}`);
    passed++;
  } else {
    console.error(`  FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('=== Conversation Provider Tests ===\n');

  // Test 1: Gemini provider is registered by default
  console.log('Test 1: Default provider registration');
  const providers = listProviders();
  assert(providers.includes('gemini'), 'gemini provider is registered');

  // Test 2: getProvider resolves gemini (will fail without API key, but should instantiate)
  console.log('\nTest 2: GeminiStreamingProvider instantiation');
  const gemini = new GeminiStreamingProvider();
  assert(gemini.name === 'gemini', 'provider name is "gemini"');
  assert(typeof gemini.streamCompletion === 'function', 'streamCompletion is a function');

  // Test 3: Custom provider registration
  console.log('\nTest 3: Custom provider registration');
  const mockProvider: IStreamingLLMProvider = {
    name: 'mock',
    async *streamCompletion(
      prompt: string,
      _context: ConversationContext,
    ): AsyncIterable<string> {
      yield `mock response to: ${prompt}`;
    },
  };
  registerProvider('mock', () => mockProvider);
  const resolved = getProvider('mock');
  assert(resolved.name === 'mock', 'custom provider resolves correctly');

  // Test 4: Mock provider streams tokens
  console.log('\nTest 4: Mock provider streaming');
  const tokens: string[] = [];
  for await (const token of resolved.streamCompletion('hello', {
    systemPrompt: 'test',
  })) {
    tokens.push(token);
  }
  assert(tokens.length === 1, 'mock provider yielded one token');
  assert(tokens[0] === 'mock response to: hello', 'token content is correct');

  // Test 5: Unknown provider throws
  console.log('\nTest 5: Unknown provider error');
  let threw = false;
  try {
    getProvider('nonexistent');
  } catch {
    threw = true;
  }
  assert(threw, 'getProvider throws for unknown provider');

  // Test 6: LLM_PROVIDER env var fallback
  console.log('\nTest 6: LLM_PROVIDER env var');
  const origEnv = process.env.LLM_PROVIDER;
  process.env.LLM_PROVIDER = 'mock';
  const envResolved = getProvider();
  assert(envResolved.name === 'mock', 'getProvider() uses LLM_PROVIDER env var');
  if (origEnv !== undefined) {
    process.env.LLM_PROVIDER = origEnv;
  } else {
    delete process.env.LLM_PROVIDER;
  }

  // Summary
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  return failed === 0;
}

runTests()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((err) => {
    console.error('Test runner error:', err);
    process.exit(1);
  });
