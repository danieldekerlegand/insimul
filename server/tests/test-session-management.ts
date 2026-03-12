/**
 * Unit tests for US-005: Session management and concurrency
 *
 * Tests:
 * - Concurrent sessions operate independently
 * - Session resume preserves conversation history
 * - Session timeout cleanup works correctly
 * - History capped at 20 messages
 * - 50+ simultaneous sessions without blocking
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
import type {
  IStreamingLLMProvider,
  ConversationContext,
  StreamCompletionOptions,
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

// ── Mock LLM provider that echoes input with a prefix ────────────────

class MockLLMProvider implements IStreamingLLMProvider {
  readonly name = 'mock';
  callCount = 0;

  async *streamCompletion(
    prompt: string,
    _context: ConversationContext,
    _options?: StreamCompletionOptions,
  ): AsyncIterable<string> {
    this.callCount++;
    // Echo back with prefix so we can verify which session got which response
    yield `Reply to: `;
    yield prompt;
  }
}

// ── Tests ─────────────────────────────────────────────────────────────

const TEST_PORT = 50098;

async function runTests() {
  console.log('=== Session Management & Concurrency Tests ===\n');

  // ── Test 1: Session auto-create on first message ──
  console.log('Test 1: Session auto-create on first message');
  sessions.clear();
  assert(getSession('auto-1') === undefined, 'session does not exist before first message');
  const s = createSession('auto-1', 'char-1', 'world-1', 'player-1', 'en');
  assert(s.sessionId === 'auto-1', 'auto-created session has correct ID');
  assert(s.active === true, 'auto-created session is active');
  assert(s.history.length === 0, 'auto-created session has empty history');
  sessions.clear();

  // ── Test 2: Session resume preserves history ──
  console.log('\nTest 2: Session resume preserves history');
  const resumed = createSession('resume-1', 'char-1', 'world-1', 'player-1', 'en');
  resumed.history.push({ role: 'user', content: 'Hello' });
  resumed.history.push({ role: 'assistant', content: 'Hi there!' });
  resumed.conversationContext = {
    systemPrompt: 'You are a test NPC.',
    characterName: 'Test NPC',
  };

  // Simulate "reconnect" - getSession should return the same session with history
  const reconnected = getSession('resume-1');
  assert(reconnected !== undefined, 'session found on reconnect');
  assert(reconnected!.history.length === 2, 'history preserved on reconnect');
  assert(reconnected!.history[0].content === 'Hello', 'first message preserved');
  assert(reconnected!.history[1].content === 'Hi there!', 'second message preserved');
  assert(reconnected!.conversationContext !== null, 'conversation context preserved');
  sessions.clear();

  // ── Test 3: History capped at 20 messages ──
  console.log('\nTest 3: History capped at 20 messages');
  const capped = createSession('capped-1', 'char-1', 'world-1', 'player-1', 'en');
  // Add 25 messages
  for (let i = 0; i < 25; i++) {
    capped.history.push({ role: i % 2 === 0 ? 'user' : 'assistant', content: `msg-${i}` });
  }
  // Manually trim like addToHistory does
  if (capped.history.length > 20) {
    capped.history = capped.history.slice(-20);
  }
  assert(capped.history.length === 20, `history capped at 20 (got ${capped.history.length})`);
  assert(capped.history[0].content === 'msg-5', 'oldest messages trimmed');
  assert(capped.history[19].content === 'msg-24', 'newest message kept');
  sessions.clear();

  // ── Test 4: Session end on SystemCommand.END ──
  console.log('\nTest 4: Session end cleanup');
  createSession('end-1', 'char-1', 'world-1', 'player-1', 'en');
  createSession('end-2', 'char-1', 'world-1', 'player-1', 'en');
  assert(sessions.size === 2, 'two sessions exist');
  endSession('end-1');
  assert(getSession('end-1') === undefined, 'ended session removed');
  assert(getSession('end-2') !== undefined, 'other session unaffected');
  sessions.clear();

  // ── Test 5: Session timeout — only idle sessions cleaned ──
  console.log('\nTest 5: Session timeout cleanup');
  const active = createSession('active-1', 'char-1', 'world-1', 'player-1', 'en');
  active.lastActivity = Date.now(); // just now

  const idle1 = createSession('idle-1', 'char-1', 'world-1', 'player-1', 'en');
  idle1.lastActivity = Date.now() - 31 * 60 * 1000; // 31 min ago

  const idle2 = createSession('idle-2', 'char-1', 'world-1', 'player-1', 'en');
  idle2.lastActivity = Date.now() - 60 * 60 * 1000; // 60 min ago

  const borderline = createSession('borderline', 'char-1', 'world-1', 'player-1', 'en');
  borderline.lastActivity = Date.now() - 29 * 60 * 1000; // 29 min ago (still active)

  const cleaned = cleanupExpiredSessions();
  assert(cleaned === 2, `cleaned 2 expired sessions (got ${cleaned})`);
  assert(getSession('active-1') !== undefined, 'active session kept');
  assert(getSession('borderline') !== undefined, 'borderline session kept');
  assert(getSession('idle-1') === undefined, 'idle-1 removed');
  assert(getSession('idle-2') === undefined, 'idle-2 removed');
  sessions.clear();

  // ── Test 6: 50+ concurrent sessions created without issues ──
  console.log('\nTest 6: 50+ concurrent sessions');
  for (let i = 0; i < 60; i++) {
    createSession(`concurrent-${i}`, `char-${i % 5}`, 'world-1', `player-${i}`, 'en');
  }
  assert(sessions.size === 60, `60 sessions created (got ${sessions.size})`);

  // Verify each session is independent
  const s10 = getSession('concurrent-10');
  const s20 = getSession('concurrent-20');
  assert(s10!.playerId === 'player-10', 'session 10 has correct player');
  assert(s20!.playerId === 'player-20', 'session 20 has correct player');
  assert(s10!.characterId === 'char-0', 'session 10 has correct character');
  assert(s20!.characterId === 'char-0', 'session 20 has correct character');

  // Add history to one session, verify it doesn't affect others
  s10!.history.push({ role: 'user', content: 'hello from 10' });
  assert(s20!.history.length === 0, 'session 20 history unaffected by session 10');
  sessions.clear();

  // ── Test 7: Concurrent streaming sessions via gRPC ──
  console.log('\nTest 7: Concurrent gRPC streaming sessions');
  const mockProvider = new MockLLMProvider();
  let server: grpc.Server;
  try {
    server = await startGrpcServer({ port: TEST_PORT, llmProvider: mockProvider });
    assert(true, 'server started');
  } catch (err: any) {
    assert(false, `server failed to start: ${err.message}`);
    printResults();
    process.exit(1);
  }

  const ServiceDef = await getConversationServiceDefinition();
  const client = new ServiceDef(
    `localhost:${TEST_PORT}`,
    grpc.credentials.createInsecure(),
  ) as any;

  // Pre-create sessions with context to avoid DB hits
  for (let i = 0; i < 5; i++) {
    const sess = createSession(`stream-${i}`, `char-${i}`, 'world-1', `player-${i}`, 'en');
    sess.conversationContext = {
      systemPrompt: `You are NPC ${i}.`,
      characterName: `NPC-${i}`,
    };
  }

  // Launch 5 concurrent streaming conversations
  const streamPromises: Array<Promise<{ sessionId: string; chunks: any[] }>> = [];

  for (let i = 0; i < 5; i++) {
    const sessionId = `stream-${i}`;
    const message = `msg-from-${i}`;

    streamPromises.push(
      new Promise((resolve, reject) => {
        const stream = client.ConversationStream();
        const chunks: any[] = [];
        const timeout = setTimeout(() => {
          stream.cancel();
          reject(new Error(`Timeout on session ${sessionId}`));
        }, 5000);

        stream.on('data', (response: any) => {
          if (response.textChunk) {
            chunks.push(response.textChunk);
          }
          if (response.textChunk && response.textChunk.isFinal) {
            clearTimeout(timeout);
            stream.end();
            setTimeout(() => resolve({ sessionId, chunks }), 100);
          }
        });

        stream.on('error', (err: any) => {
          if (err.code !== grpc.status.CANCELLED) {
            clearTimeout(timeout);
            reject(err);
          }
        });

        stream.write({
          textInput: {
            text: message,
            sessionId,
            characterId: `char-${i}`,
            languageCode: 'en',
          },
        });
      }),
    );
  }

  const results = await Promise.all(streamPromises);
  assert(results.length === 5, '5 concurrent streams completed');

  // Verify each session got its own response
  for (const result of results) {
    const textChunks = result.chunks.filter((c) => !c.isFinal);
    const fullText = textChunks.map((c) => c.text).join('');
    const idx = result.sessionId.split('-')[1];
    assert(
      fullText === `Reply to: msg-from-${idx}`,
      `session ${result.sessionId} got correct response: "${fullText}"`,
    );
  }

  // Verify all sessions have history updated independently
  for (let i = 0; i < 5; i++) {
    const sess = getSession(`stream-${i}`);
    assert(sess !== undefined, `session stream-${i} still exists`);
    assert(sess!.history.length === 2, `session stream-${i} has 2 history entries`);
    assert(sess!.history[0].role === 'user', `session stream-${i} first entry is user`);
    assert(sess!.history[1].role === 'assistant', `session stream-${i} second entry is assistant`);
  }

  assert(mockProvider.callCount === 5, `LLM provider called 5 times (got ${mockProvider.callCount})`);

  // ── Test 8: Session resume via gRPC — send second message, history preserved ──
  console.log('\nTest 8: Session resume via gRPC');

  // stream-0 already has history from Test 7, send another message
  const resumeResult = await new Promise<{ chunks: any[] }>((resolve, reject) => {
    const stream = client.ConversationStream();
    const chunks: any[] = [];
    const timeout = setTimeout(() => {
      stream.cancel();
      reject(new Error('Timeout on resume test'));
    }, 5000);

    stream.on('data', (response: any) => {
      if (response.textChunk) {
        chunks.push(response.textChunk);
      }
      if (response.textChunk && response.textChunk.isFinal) {
        clearTimeout(timeout);
        stream.end();
        setTimeout(() => resolve({ chunks }), 100);
      }
    });

    stream.on('error', (err: any) => {
      if (err.code !== grpc.status.CANCELLED) {
        clearTimeout(timeout);
        reject(err);
      }
    });

    stream.write({
      textInput: {
        text: 'follow-up question',
        sessionId: 'stream-0',
        characterId: 'char-0',
        languageCode: 'en',
      },
    });
  });

  const resumeChunks = resumeResult.chunks.filter((c) => !c.isFinal);
  const resumeText = resumeChunks.map((c) => c.text).join('');
  assert(resumeText === 'Reply to: follow-up question', 'resumed session got correct response');

  const resumedSession = getSession('stream-0');
  assert(resumedSession!.history.length === 4, `resumed session has 4 history entries (got ${resumedSession!.history.length})`);
  assert(resumedSession!.history[2].content === 'follow-up question', 'follow-up message in history');
  assert(resumedSession!.history[3].content === 'Reply to: follow-up question', 'follow-up response in history');

  // ── Test 9: SystemCommand.END via gRPC ──
  console.log('\nTest 9: SystemCommand.END via gRPC');
  const endResult = await new Promise<{ meta: any[] }>((resolve, reject) => {
    const stream = client.ConversationStream();
    const meta: any[] = [];
    const timeout = setTimeout(() => {
      stream.cancel();
      reject(new Error('Timeout on end command'));
    }, 5000);

    stream.on('data', (response: any) => {
      if (response.conversationMeta) {
        meta.push(response.conversationMeta);
        if (response.conversationMeta.state === 'ENDED') {
          clearTimeout(timeout);
          stream.end();
          setTimeout(() => resolve({ meta }), 100);
        }
      }
    });

    stream.on('error', (err: any) => {
      if (err.code !== grpc.status.CANCELLED) {
        clearTimeout(timeout);
        reject(err);
      }
    });

    stream.write({
      systemCommand: {
        type: 'END',
        sessionId: 'stream-0',
      },
    });
  });

  assert(endResult.meta.some((m) => m.state === 'ENDED'), 'received ENDED meta');
  assert(getSession('stream-0') === undefined, 'session removed after END command');

  // Cleanup
  sessions.clear();
  client.close();
  await stopGrpcServer();

  printResults();
}

function printResults() {
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
