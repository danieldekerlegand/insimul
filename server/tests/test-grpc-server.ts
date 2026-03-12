/**
 * Unit tests for gRPC conversation server
 *
 * Tests:
 * - Server starts and binds to port
 * - Health check responds with healthy=true
 * - Text streaming: mock LLM provider yields tokens, verify TextChunk messages arrive incrementally
 * - Session management: create, resume, end
 * - Graceful shutdown
 */

import * as grpc from '@grpc/grpc-js';
import {
  startGrpcServer,
  stopGrpcServer,
  getSession,
  createSession,
  endSession,
  cleanupExpiredSessions,
  sessions,
} from '../services/conversation/grpc-server.js';
import { getConversationServiceDefinition } from '../services/conversation/proto-loader.js';
import type { IStreamingLLMProvider, ConversationContext, StreamCompletionOptions } from '../services/conversation/providers/llm-provider.js';

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

// ── Mock LLM provider ─────────────────────────────────────────────────

class MockLLMProvider implements IStreamingLLMProvider {
  readonly name = 'mock';

  async *streamCompletion(
    _prompt: string,
    _context: ConversationContext,
    _options?: StreamCompletionOptions,
  ): AsyncIterable<string> {
    yield 'Hello';
    yield ' there';
    yield ', traveler!';
  }
}

// ── Tests ─────────────────────────────────────────────────────────────

const TEST_PORT = 50099; // Use non-default port for tests

async function runTests() {
  console.log('=== gRPC Server Tests ===\n');

  // Test 1: Session store operations (no server needed)
  console.log('Test 1: Session store operations');
  const s1 = createSession('sess-1', 'char-1', 'world-1', 'player-1', 'en');
  assert(s1.sessionId === 'sess-1', 'session created with correct ID');
  assert(s1.active === true, 'session starts active');
  assert(s1.history.length === 0, 'session starts with empty history');

  const fetched = getSession('sess-1');
  assert(fetched !== undefined, 'getSession returns created session');
  assert(fetched!.characterId === 'char-1', 'session has correct characterId');

  endSession('sess-1');
  assert(getSession('sess-1') === undefined, 'session removed after endSession');

  // Test 2: Session timeout cleanup
  console.log('\nTest 2: Session timeout cleanup');
  const s2 = createSession('sess-old', 'char-1', 'world-1', 'player-1', 'en');
  s2.lastActivity = Date.now() - 31 * 60 * 1000; // 31 minutes ago
  createSession('sess-new', 'char-1', 'world-1', 'player-1', 'en');
  const cleaned = cleanupExpiredSessions();
  assert(cleaned === 1, 'cleaned 1 expired session');
  assert(getSession('sess-old') === undefined, 'old session removed');
  assert(getSession('sess-new') !== undefined, 'new session kept');
  sessions.clear();

  // Test 3: Server starts and binds
  console.log('\nTest 3: Server starts and binds to port');
  const mockProvider = new MockLLMProvider();
  let server: grpc.Server;
  try {
    server = await startGrpcServer({ port: TEST_PORT, llmProvider: mockProvider });
    assert(true, 'server started successfully');
  } catch (err: any) {
    assert(false, `server failed to start: ${err.message}`);
    console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
    process.exit(1);
  }

  // Test 4: Health check via gRPC client
  console.log('\nTest 4: Health check RPC');
  const ServiceDef = await getConversationServiceDefinition();
  const client = new ServiceDef(
    `localhost:${TEST_PORT}`,
    grpc.credentials.createInsecure(),
  ) as any;

  const healthResult = await new Promise<any>((resolve, reject) => {
    client.HealthCheck({}, (err: any, response: any) => {
      if (err) reject(err);
      else resolve(response);
    });
  });
  assert(healthResult.healthy === true, 'health check returns healthy=true');
  assert(typeof healthResult.version === 'string', 'health check returns version string');

  // Test 5: Text streaming — mock LLM sends tokens incrementally
  console.log('\nTest 5: Streaming text chunks arrive incrementally');

  // Pre-create session with worldId so context-manager doesn't try to hit DB
  createSession('test-stream', 'char-1', 'world-1', 'player-1', 'en');
  const testSession = getSession('test-stream')!;
  testSession.conversationContext = {
    systemPrompt: 'You are a test NPC.',
    characterName: 'Test NPC',
  };

  const receivedChunks: any[] = [];
  const receivedMeta: any[] = [];

  await new Promise<void>((resolve, reject) => {
    const stream = client.ConversationStream();
    const timeout = setTimeout(() => {
      stream.cancel();
      reject(new Error('Timeout waiting for streaming response'));
    }, 5000);

    stream.on('data', (response: any) => {
      if (response.textChunk) {
        receivedChunks.push(response.textChunk);
      }
      if (response.conversationMeta) {
        receivedMeta.push(response.conversationMeta);
      }

      // When we get the final text chunk, end the stream
      if (response.textChunk && response.textChunk.isFinal) {
        clearTimeout(timeout);
        stream.end();
        // Small delay to let stream close cleanly
        setTimeout(resolve, 100);
      }
    });

    stream.on('error', (err: any) => {
      if (err.code !== grpc.status.CANCELLED) {
        clearTimeout(timeout);
        reject(err);
      }
    });

    // Send a text input
    stream.write({
      textInput: {
        text: 'Hello NPC!',
        sessionId: 'test-stream',
        characterId: 'char-1',
        languageCode: 'en',
      },
    });
  });

  // Verify streaming behavior
  const textChunks = receivedChunks.filter((c) => !c.isFinal);
  const finalChunks = receivedChunks.filter((c) => c.isFinal);
  assert(textChunks.length === 3, `received 3 text token chunks (got ${textChunks.length})`);
  assert(textChunks[0].text === 'Hello', 'first token is "Hello"');
  assert(textChunks[1].text === ' there', 'second token is " there"');
  assert(textChunks[2].text === ', traveler!', 'third token is ", traveler!"');
  assert(finalChunks.length === 1, 'received 1 final marker chunk');
  assert(receivedMeta.some((m) => m.state === 'ACTIVE'), 'received ACTIVE meta');

  // Test 6: Session history updated after streaming
  console.log('\nTest 6: Session history updated');
  const updatedSession = getSession('test-stream');
  assert(updatedSession !== undefined, 'session still exists');
  assert(updatedSession!.history.length === 2, `history has 2 entries (got ${updatedSession!.history.length})`);
  assert(updatedSession!.history[0].role === 'user', 'first entry is user');
  assert(updatedSession!.history[1].role === 'assistant', 'second entry is assistant');
  assert(updatedSession!.history[1].content === 'Hello there, traveler!', 'assistant response concatenated');

  // Cleanup
  sessions.clear();
  client.close();
  await stopGrpcServer();

  // Test 7: Server stops cleanly
  console.log('\nTest 7: Server stops cleanly');
  assert(true, 'stopGrpcServer completed without error');

  // Summary
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
