/**
 * WebSocket infrastructure for real-time voice chat.
 *
 * Manages WebSocket connections, voice chat rooms, and audio streaming
 * between clients via the `ws` package attached to the existing HTTP server.
 */
import { WebSocketServer, WebSocket, RawData } from 'ws';
import type { Server as HttpServer, IncomingMessage } from 'http';
import { URL } from 'url';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VoiceClient {
  id: string;
  ws: WebSocket;
  roomId: string | null;
  characterId: string | null;
  worldId: string | null;
  muted: boolean;
  joinedAt: number;
}

export interface VoiceRoom {
  id: string;
  worldId: string;
  clients: Map<string, VoiceClient>;
  createdAt: number;
  maxClients: number;
}

/** Messages sent from client to server */
export type ClientMessage =
  | { type: 'join'; roomId: string; worldId: string; characterId?: string }
  | { type: 'leave' }
  | { type: 'audio'; data: string } // base64-encoded audio chunk
  | { type: 'mute'; muted: boolean }
  | { type: 'ping' };

/** Messages sent from server to client */
export type ServerMessage =
  | { type: 'joined'; roomId: string; clientId: string; peers: string[] }
  | { type: 'peer_joined'; clientId: string; characterId: string | null }
  | { type: 'peer_left'; clientId: string }
  | { type: 'audio'; fromClientId: string; data: string }
  | { type: 'peer_muted'; clientId: string; muted: boolean }
  | { type: 'error'; message: string }
  | { type: 'pong' };

// ─── Voice Chat Manager ─────────────────────────────────────────────────────

export class VoiceChatManager {
  private wss: WebSocketServer | null = null;
  private clients = new Map<string, VoiceClient>();
  private rooms = new Map<string, VoiceRoom>();
  private clientIdCounter = 0;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  readonly maxClientsPerRoom: number;
  readonly heartbeatMs: number;

  constructor(opts?: { maxClientsPerRoom?: number; heartbeatMs?: number }) {
    this.maxClientsPerRoom = opts?.maxClientsPerRoom ?? 10;
    this.heartbeatMs = opts?.heartbeatMs ?? 30_000;
  }

  /** Attach to an existing HTTP server on path `/ws/voice` */
  attach(server: HttpServer): WebSocketServer {
    this.wss = new WebSocketServer({
      server,
      path: '/ws/voice',
    });

    this.wss.on('connection', (ws, req) => this.handleConnection(ws, req));

    // Heartbeat to detect stale connections
    this.heartbeatInterval = setInterval(() => this.heartbeat(), this.heartbeatMs);

    return this.wss;
  }

  /** Graceful shutdown */
  close(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Disconnect all clients
    for (const client of Array.from(this.clients.values())) {
      this.removeClientFromRoom(client);
      client.ws.close(1001, 'Server shutting down');
    }
    this.clients.clear();
    this.rooms.clear();

    return new Promise((resolve, reject) => {
      if (!this.wss) return resolve();
      this.wss.close((err) => (err ? reject(err) : resolve()));
    });
  }

  // ─── Connection handling ────────────────────────────────────────────

  private handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const clientId = `vc_${++this.clientIdCounter}_${Date.now()}`;

    const client: VoiceClient = {
      id: clientId,
      ws,
      roomId: null,
      characterId: null,
      worldId: null,
      muted: false,
      joinedAt: Date.now(),
    };
    this.clients.set(clientId, client);

    // Mark socket as alive for heartbeat
    (ws as any).__alive = true;
    ws.on('pong', () => { (ws as any).__alive = true; });

    ws.on('message', (raw) => this.handleMessage(client, raw));
    ws.on('close', () => this.handleDisconnect(client));
    ws.on('error', () => this.handleDisconnect(client));
  }

  private handleMessage(client: VoiceClient, raw: RawData): void {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      this.send(client, { type: 'error', message: 'Invalid JSON' });
      return;
    }

    switch (msg.type) {
      case 'join':
        this.handleJoin(client, msg);
        break;
      case 'leave':
        this.handleLeave(client);
        break;
      case 'audio':
        this.handleAudio(client, msg);
        break;
      case 'mute':
        this.handleMute(client, msg);
        break;
      case 'ping':
        this.send(client, { type: 'pong' });
        break;
      default:
        this.send(client, { type: 'error', message: 'Unknown message type' });
    }
  }

  // ─── Room operations ────────────────────────────────────────────────

  private handleJoin(client: VoiceClient, msg: Extract<ClientMessage, { type: 'join' }>): void {
    // Leave current room first
    if (client.roomId) {
      this.removeClientFromRoom(client);
    }

    const room = this.getOrCreateRoom(msg.roomId, msg.worldId);

    if (room.clients.size >= room.maxClients) {
      this.send(client, { type: 'error', message: 'Room is full' });
      return;
    }

    client.roomId = msg.roomId;
    client.worldId = msg.worldId;
    client.characterId = msg.characterId ?? null;
    room.clients.set(client.id, client);

    // Notify the joining client
    const peers = Array.from(room.clients.keys()).filter((id) => id !== client.id);
    this.send(client, { type: 'joined', roomId: msg.roomId, clientId: client.id, peers });

    // Notify existing peers
    this.broadcastToRoom(room, client.id, {
      type: 'peer_joined',
      clientId: client.id,
      characterId: client.characterId,
    });
  }

  private handleLeave(client: VoiceClient): void {
    this.removeClientFromRoom(client);
  }

  private handleAudio(client: VoiceClient, msg: Extract<ClientMessage, { type: 'audio' }>): void {
    if (!client.roomId || client.muted) return;

    const room = this.rooms.get(client.roomId);
    if (!room) return;

    // Relay audio to all other clients in the room
    this.broadcastToRoom(room, client.id, {
      type: 'audio',
      fromClientId: client.id,
      data: msg.data,
    });
  }

  private handleMute(client: VoiceClient, msg: Extract<ClientMessage, { type: 'mute' }>): void {
    client.muted = msg.muted;

    if (!client.roomId) return;
    const room = this.rooms.get(client.roomId);
    if (!room) return;

    this.broadcastToRoom(room, client.id, {
      type: 'peer_muted',
      clientId: client.id,
      muted: msg.muted,
    });
  }

  private handleDisconnect(client: VoiceClient): void {
    this.removeClientFromRoom(client);
    this.clients.delete(client.id);
  }

  // ─── Helpers ────────────────────────────────────────────────────────

  private getOrCreateRoom(roomId: string, worldId: string): VoiceRoom {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = {
        id: roomId,
        worldId,
        clients: new Map(),
        createdAt: Date.now(),
        maxClients: this.maxClientsPerRoom,
      };
      this.rooms.set(roomId, room);
    }
    return room;
  }

  private removeClientFromRoom(client: VoiceClient): void {
    if (!client.roomId) return;

    const room = this.rooms.get(client.roomId);
    if (room) {
      room.clients.delete(client.id);

      // Notify remaining peers
      this.broadcastToRoom(room, null, {
        type: 'peer_left',
        clientId: client.id,
      });

      // Clean up empty rooms
      if (room.clients.size === 0) {
        this.rooms.delete(room.id);
      }
    }

    client.roomId = null;
  }

  private send(client: VoiceClient, msg: ServerMessage): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(msg));
    }
  }

  private broadcastToRoom(room: VoiceRoom, excludeClientId: string | null, msg: ServerMessage): void {
    const payload = JSON.stringify(msg);
    for (const [id, peer] of Array.from(room.clients.entries())) {
      if (id !== excludeClientId && peer.ws.readyState === WebSocket.OPEN) {
        peer.ws.send(payload);
      }
    }
  }

  private heartbeat(): void {
    if (!this.wss) return;
    for (const ws of Array.from(this.wss.clients)) {
      if ((ws as any).__alive === false) {
        ws.terminate();
        continue;
      }
      (ws as any).__alive = false;
      ws.ping();
    }
  }

  // ─── Accessors (useful for monitoring / tests) ──────────────────────

  get clientCount(): number {
    return this.clients.size;
  }

  get roomCount(): number {
    return this.rooms.size;
  }

  getRoom(roomId: string): VoiceRoom | undefined {
    return this.rooms.get(roomId);
  }

  getRoomClientIds(roomId: string): string[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.clients.keys()) : [];
  }
}

/** Singleton instance */
export const voiceChatManager = new VoiceChatManager();
