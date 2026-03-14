/**
 * Tests for the VoiceChatManager WebSocket infrastructure.
 *
 * Verifies:
 * - WebSocket server attaches to HTTP server
 * - Clients can connect and join rooms
 * - Audio is relayed to peers in the same room
 * - Mute/unmute broadcasts to peers
 * - Clients leaving/disconnecting notify peers and clean up rooms
 * - Room capacity limits are enforced
 * - Heartbeat / ping-pong works
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import http from 'http';
import WebSocket from 'ws';
import { VoiceChatManager } from '../services/voice-websocket.js';

type ServerMessage = {
  type: string;
  [key: string]: any;
};

function createTestServer(): http.Server {
  return http.createServer();
}

function waitForMessage(ws: WebSocket): Promise<ServerMessage> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timed out waiting for message')), 5000);
    ws.once('message', (data) => {
      clearTimeout(timeout);
      resolve(JSON.parse(data.toString()));
    });
  });
}

function waitForOpen(ws: WebSocket): Promise<void> {
  return new Promise((resolve) => {
    if (ws.readyState === WebSocket.OPEN) return resolve();
    ws.once('open', resolve);
  });
}

function waitForClose(ws: WebSocket): Promise<void> {
  return new Promise((resolve) => {
    if (ws.readyState === WebSocket.CLOSED) return resolve();
    ws.once('close', resolve);
  });
}

function connectClient(port: number): WebSocket {
  return new WebSocket(`ws://127.0.0.1:${port}/ws/voice`);
}

describe('VoiceChatManager', () => {
  let server: http.Server;
  let manager: VoiceChatManager;
  let port: number;
  const clients: WebSocket[] = [];

  beforeEach(async () => {
    server = createTestServer();
    manager = new VoiceChatManager({ maxClientsPerRoom: 3, heartbeatMs: 60_000 });
    manager.attach(server);

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        port = (server.address() as { port: number }).port;
        resolve();
      });
    });
  });

  afterEach(async () => {
    // Close all test clients
    for (const ws of clients) {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    }
    clients.length = 0;

    await manager.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  function connect(): WebSocket {
    const ws = connectClient(port);
    clients.push(ws);
    return ws;
  }

  it('accepts WebSocket connections', async () => {
    const ws = connect();
    await waitForOpen(ws);
    expect(ws.readyState).toBe(WebSocket.OPEN);
    expect(manager.clientCount).toBe(1);
  });

  it('allows a client to join a room and receive confirmation', async () => {
    const ws = connect();
    await waitForOpen(ws);

    ws.send(JSON.stringify({ type: 'join', roomId: 'room1', worldId: 'world1' }));
    const msg = await waitForMessage(ws);

    expect(msg.type).toBe('joined');
    expect(msg.roomId).toBe('room1');
    expect(msg.clientId).toBeDefined();
    expect(msg.peers).toEqual([]);
    expect(manager.roomCount).toBe(1);
  });

  it('notifies existing peers when a new client joins', async () => {
    const ws1 = connect();
    const ws2 = connect();
    await Promise.all([waitForOpen(ws1), waitForOpen(ws2)]);

    // Client 1 joins
    ws1.send(JSON.stringify({ type: 'join', roomId: 'room1', worldId: 'world1' }));
    const joinMsg1 = await waitForMessage(ws1);
    expect(joinMsg1.type).toBe('joined');

    // Client 2 joins — client 1 should get peer_joined
    ws2.send(JSON.stringify({ type: 'join', roomId: 'room1', worldId: 'world1', characterId: 'char1' }));

    const [joinMsg2, peerJoinedMsg] = await Promise.all([
      waitForMessage(ws2),
      waitForMessage(ws1),
    ]);

    expect(joinMsg2.type).toBe('joined');
    expect(joinMsg2.peers).toHaveLength(1);
    expect(peerJoinedMsg.type).toBe('peer_joined');
    expect(peerJoinedMsg.characterId).toBe('char1');
  });

  it('relays audio data to peers in the same room', async () => {
    const ws1 = connect();
    const ws2 = connect();
    await Promise.all([waitForOpen(ws1), waitForOpen(ws2)]);

    // Both join room1
    ws1.send(JSON.stringify({ type: 'join', roomId: 'room1', worldId: 'w1' }));
    await waitForMessage(ws1);
    ws2.send(JSON.stringify({ type: 'join', roomId: 'room1', worldId: 'w1' }));
    await waitForMessage(ws2);
    // Drain peer_joined from ws1
    await waitForMessage(ws1);

    // Client 1 sends audio
    ws1.send(JSON.stringify({ type: 'audio', data: 'dGVzdC1hdWRpbw==' }));
    const audioMsg = await waitForMessage(ws2);

    expect(audioMsg.type).toBe('audio');
    expect(audioMsg.data).toBe('dGVzdC1hdWRpbw==');
    expect(audioMsg.fromClientId).toBeDefined();
  });

  it('does not relay audio from muted clients', async () => {
    const ws1 = connect();
    const ws2 = connect();
    await Promise.all([waitForOpen(ws1), waitForOpen(ws2)]);

    ws1.send(JSON.stringify({ type: 'join', roomId: 'room1', worldId: 'w1' }));
    await waitForMessage(ws1);
    ws2.send(JSON.stringify({ type: 'join', roomId: 'room1', worldId: 'w1' }));
    await waitForMessage(ws2);
    await waitForMessage(ws1); // drain peer_joined

    // Mute client 1
    ws1.send(JSON.stringify({ type: 'mute', muted: true }));
    const muteMsg = await waitForMessage(ws2);
    expect(muteMsg.type).toBe('peer_muted');
    expect(muteMsg.muted).toBe(true);

    // Client 1 sends audio while muted — ws2 should not receive it
    ws1.send(JSON.stringify({ type: 'audio', data: 'c2lsZW50' }));

    // Send a ping from ws1 to flush — ws2 should only get pong on ws1, nothing on ws2
    ws1.send(JSON.stringify({ type: 'ping' }));
    const pongMsg = await waitForMessage(ws1);
    expect(pongMsg.type).toBe('pong');

    // If ws2 had received audio, it would be in the buffer — check by sending ping to ws2
    ws2.send(JSON.stringify({ type: 'ping' }));
    const ws2Pong = await waitForMessage(ws2);
    expect(ws2Pong.type).toBe('pong'); // No audio message before this
  });

  it('notifies peers when a client disconnects', async () => {
    const ws1 = connect();
    const ws2 = connect();
    await Promise.all([waitForOpen(ws1), waitForOpen(ws2)]);

    ws1.send(JSON.stringify({ type: 'join', roomId: 'room1', worldId: 'w1' }));
    await waitForMessage(ws1);
    ws2.send(JSON.stringify({ type: 'join', roomId: 'room1', worldId: 'w1' }));
    await waitForMessage(ws2);
    await waitForMessage(ws1); // drain peer_joined

    // Disconnect client 2
    ws2.close();
    const peerLeftMsg = await waitForMessage(ws1);
    expect(peerLeftMsg.type).toBe('peer_left');
    expect(peerLeftMsg.clientId).toBeDefined();
  });

  it('cleans up empty rooms after all clients leave', async () => {
    const ws1 = connect();
    await waitForOpen(ws1);

    ws1.send(JSON.stringify({ type: 'join', roomId: 'room1', worldId: 'w1' }));
    await waitForMessage(ws1);
    expect(manager.roomCount).toBe(1);

    ws1.send(JSON.stringify({ type: 'leave' }));
    // Allow async processing
    await new Promise((r) => setTimeout(r, 50));
    expect(manager.roomCount).toBe(0);
  });

  it('enforces room capacity limits', async () => {
    // maxClientsPerRoom is 3 for this test suite
    const sockets = [connect(), connect(), connect(), connect()];
    await Promise.all(sockets.map(waitForOpen));

    // First 3 join successfully
    for (let i = 0; i < 3; i++) {
      sockets[i].send(JSON.stringify({ type: 'join', roomId: 'room1', worldId: 'w1' }));
      const msg = await waitForMessage(sockets[i]);
      expect(msg.type).toBe('joined');
      // Drain peer_joined notifications for earlier clients
      for (let j = 0; j < i; j++) {
        await waitForMessage(sockets[j]);
      }
    }

    // 4th client should get error
    sockets[3].send(JSON.stringify({ type: 'join', roomId: 'room1', worldId: 'w1' }));
    const errorMsg = await waitForMessage(sockets[3]);
    expect(errorMsg.type).toBe('error');
    expect(errorMsg.message).toBe('Room is full');
  });

  it('handles invalid JSON gracefully', async () => {
    const ws = connect();
    await waitForOpen(ws);

    ws.send('not valid json{{{');
    const msg = await waitForMessage(ws);
    expect(msg.type).toBe('error');
    expect(msg.message).toBe('Invalid JSON');
  });

  it('responds to ping with pong', async () => {
    const ws = connect();
    await waitForOpen(ws);

    ws.send(JSON.stringify({ type: 'ping' }));
    const msg = await waitForMessage(ws);
    expect(msg.type).toBe('pong');
  });

  it('does not relay audio across different rooms', async () => {
    const ws1 = connect();
    const ws2 = connect();
    await Promise.all([waitForOpen(ws1), waitForOpen(ws2)]);

    ws1.send(JSON.stringify({ type: 'join', roomId: 'room1', worldId: 'w1' }));
    await waitForMessage(ws1);
    ws2.send(JSON.stringify({ type: 'join', roomId: 'room2', worldId: 'w1' }));
    await waitForMessage(ws2);

    // Client 1 sends audio in room1
    ws1.send(JSON.stringify({ type: 'audio', data: 'cm9vbTEtYXVkaW8=' }));

    // ws2 in room2 should not get it — verify by pinging
    ws2.send(JSON.stringify({ type: 'ping' }));
    const msg = await waitForMessage(ws2);
    expect(msg.type).toBe('pong');
  });

  it('allows switching rooms', async () => {
    const ws1 = connect();
    const ws2 = connect();
    await Promise.all([waitForOpen(ws1), waitForOpen(ws2)]);

    // ws2 joins room1
    ws2.send(JSON.stringify({ type: 'join', roomId: 'room1', worldId: 'w1' }));
    await waitForMessage(ws2);

    // ws1 joins room1
    ws1.send(JSON.stringify({ type: 'join', roomId: 'room1', worldId: 'w1' }));
    await waitForMessage(ws1);
    await waitForMessage(ws2); // peer_joined

    // ws1 switches to room2 — ws2 should get peer_left
    ws1.send(JSON.stringify({ type: 'join', roomId: 'room2', worldId: 'w1' }));
    const [joinMsg, peerLeftMsg] = await Promise.all([
      waitForMessage(ws1),
      waitForMessage(ws2),
    ]);

    expect(joinMsg.type).toBe('joined');
    expect(joinMsg.roomId).toBe('room2');
    expect(peerLeftMsg.type).toBe('peer_left');
  });
});
