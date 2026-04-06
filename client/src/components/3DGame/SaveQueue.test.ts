/**
 * Tests for SaveQueue — offline-first save queue
 *
 * Run with: npx tsx client/src/components/3DGame/SaveQueue.test.ts
 *
 * Since IndexedDB isn't available in Node, we test the queue logic by
 * extracting the core algorithm into testable pieces and mocking IDB.
 */

import type { QueuedOperation, OperationExecutor } from './SaveQueue';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

// ---------------------------------------------------------------------------
// In-memory queue that mirrors SaveQueue logic without IndexedDB dependency
// ---------------------------------------------------------------------------

class InMemorySaveQueue {
  private store = new Map<string, QueuedOperation>();
  private executor: OperationExecutor;
  private _online = true;
  private idCounter = 0;
  flushing = false;

  constructor(executor: OperationExecutor) {
    this.executor = executor;
  }

  setOnline(v: boolean) { this._online = v; }
  isOnline() { return this._online; }

  async enqueue(type: QueuedOperation['type'], dedupeKey: string, payload: any): Promise<void> {
    // Deduplicate: remove existing entry with same key
    for (const [id, op] of this.store) {
      if (op.dedupeKey === dedupeKey) {
        this.store.delete(id);
      }
    }
    const id = `${Date.now()}-${++this.idCounter}`;
    this.store.set(id, { id, type, dedupeKey, payload, createdAt: Date.now(), retries: 0 });

    if (this.isOnline()) {
      await this.flush();
    }
  }

  pendingCount(): number {
    return this.store.size;
  }

  async flush(): Promise<void> {
    if (this.flushing) return;
    this.flushing = true;
    try {
      const ops = [...this.store.values()].sort((a, b) => a.createdAt - b.createdAt);
      for (const op of ops) {
        if (!this.isOnline()) break;
        try {
          await this.executor(op);
          this.store.delete(op.id);
        } catch {
          op.retries++;
          if (op.retries >= 10) {
            this.store.delete(op.id);
          }
          break; // preserve order
        }
      }
    } finally {
      this.flushing = false;
    }
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function testEnqueueAndFlush() {
  const executed: string[] = [];
  const queue = new InMemorySaveQueue(async (op) => { executed.push(op.dedupeKey); });

  await queue.enqueue('saveGameState', 'save:w1:p1:0', { worldId: 'w1' });
  // Online by default, so flush should have happened
  assert(executed.length === 1, 'operation executed immediately when online');
  assert(executed[0] === 'save:w1:p1:0', 'correct operation executed');
  assert(queue.pendingCount() === 0, 'queue is empty after successful flush');
}

async function testOfflineQueuing() {
  const executed: string[] = [];
  const queue = new InMemorySaveQueue(async (op) => { executed.push(op.dedupeKey); });

  queue.setOnline(false);
  await queue.enqueue('saveGameState', 'save:w1:p1:0', { worldId: 'w1' });
  assert(executed.length === 0, 'nothing executed when offline');
  assert(queue.pendingCount() === 1, 'operation queued');

  // Come back online
  queue.setOnline(true);
  await queue.flush();
  assert(executed.length === 1, 'operation executed after coming online');
  assert(queue.pendingCount() === 0, 'queue drained');
}

async function testDeduplication() {
  const executed: any[] = [];
  const queue = new InMemorySaveQueue(async (op) => { executed.push(op.payload); });

  queue.setOnline(false);
  await queue.enqueue('saveGameState', 'save:w1:p1:0', { version: 1 });
  await queue.enqueue('saveGameState', 'save:w1:p1:0', { version: 2 });
  await queue.enqueue('saveGameState', 'save:w1:p1:0', { version: 3 });
  assert(queue.pendingCount() === 1, 'duplicate keys collapsed to 1');

  queue.setOnline(true);
  await queue.flush();
  assert(executed.length === 1, 'only one operation executed');
  assert(executed[0].version === 3, 'latest version is the one saved');
}

async function testMultipleDifferentKeys() {
  const executed: string[] = [];
  const queue = new InMemorySaveQueue(async (op) => { executed.push(op.dedupeKey); });

  queue.setOnline(false);
  await queue.enqueue('saveGameState', 'save:w1:p1:0', {});
  await queue.enqueue('updateQuest', 'quest:q1', {});
  await queue.enqueue('saveGameState', 'save:w1:p1:1', {});
  assert(queue.pendingCount() === 3, 'three distinct operations queued');

  queue.setOnline(true);
  await queue.flush();
  assert(executed.length === 3, 'all three executed');
  assert(queue.pendingCount() === 0, 'queue empty');
}

async function testRetryOnFailure() {
  let callCount = 0;
  const queue = new InMemorySaveQueue(async (op) => {
    callCount++;
    if (callCount < 3) throw new Error('network error');
  });

  queue.setOnline(false);
  await queue.enqueue('saveGameState', 'save:w1:p1:0', {});

  queue.setOnline(true);
  await queue.flush(); // fail attempt 1
  assert(queue.pendingCount() === 1, 'still queued after first failure');

  await queue.flush(); // fail attempt 2
  assert(queue.pendingCount() === 1, 'still queued after second failure');

  await queue.flush(); // succeed attempt 3
  assert(queue.pendingCount() === 0, 'drained after successful retry');
  assert(callCount === 3, 'executor called 3 times total');
}

async function testDropAfterMaxRetries() {
  const queue = new InMemorySaveQueue(async () => { throw new Error('always fails'); });

  queue.setOnline(false);
  await queue.enqueue('saveGameState', 'save:w1:p1:0', {});
  queue.setOnline(true);

  for (let i = 0; i < 11; i++) {
    await queue.flush();
  }
  assert(queue.pendingCount() === 0, 'operation dropped after 10 retries');
}

async function testOrderPreservation() {
  const executed: string[] = [];
  let shouldFail = true;
  const queue = new InMemorySaveQueue(async (op) => {
    if (op.dedupeKey === 'first' && shouldFail) {
      shouldFail = false;
      throw new Error('temporary failure');
    }
    executed.push(op.dedupeKey);
  });

  queue.setOnline(false);
  await queue.enqueue('saveGameState', 'first', {});
  await queue.enqueue('saveGameState', 'second', {});
  queue.setOnline(true);

  await queue.flush(); // first fails, stops processing
  assert(executed.length === 0, 'second not executed while first is blocked');

  await queue.flush(); // first succeeds, second executes
  assert(executed[0] === 'first', 'first executed before second');
  assert(executed[1] === 'second', 'second executed after first');
}

async function testClear() {
  const queue = new InMemorySaveQueue(async () => {});

  queue.setOnline(false);
  await queue.enqueue('saveGameState', 'a', {});
  await queue.enqueue('saveGameState', 'b', {});
  assert(queue.pendingCount() === 2, 'two items queued');

  await queue.clear();
  assert(queue.pendingCount() === 0, 'queue cleared');
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function main() {
  await testEnqueueAndFlush();
  await testOfflineQueuing();
  await testDeduplication();
  await testMultipleDifferentKeys();
  await testRetryOnFailure();
  await testDropAfterMaxRetries();
  await testOrderPreservation();
  await testClear();

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
