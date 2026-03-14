/**
 * Client-side WebSocket hook for real-time voice chat.
 *
 * Provides connect/disconnect, room join/leave, audio send/receive,
 * and mute controls over a WebSocket connection to `/ws/voice`.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Types (mirror server types) ─────────────────────────────────────────────

type ClientMessage =
  | { type: 'join'; roomId: string; worldId: string; characterId?: string }
  | { type: 'leave' }
  | { type: 'audio'; data: string }
  | { type: 'mute'; muted: boolean }
  | { type: 'ping' };

type ServerMessage =
  | { type: 'joined'; roomId: string; clientId: string; peers: string[] }
  | { type: 'peer_joined'; clientId: string; characterId: string | null }
  | { type: 'peer_left'; clientId: string }
  | { type: 'audio'; fromClientId: string; data: string }
  | { type: 'peer_muted'; clientId: string; muted: boolean }
  | { type: 'error'; message: string }
  | { type: 'pong' };

export type VoiceConnectionState = 'disconnected' | 'connecting' | 'connected' | 'in_room';

export interface VoicePeer {
  clientId: string;
  characterId: string | null;
  muted: boolean;
}

export interface UseVoiceWebSocketOptions {
  /** Called when audio data is received from a peer */
  onAudio?: (fromClientId: string, audioBase64: string) => void;
  /** Called on connection errors */
  onError?: (message: string) => void;
  /** Ping interval in ms (default 25000) */
  pingIntervalMs?: number;
  /** Reconnect delay in ms (default 3000) */
  reconnectDelayMs?: number;
  /** Max reconnect attempts (default 5) */
  maxReconnectAttempts?: number;
}

export interface UseVoiceWebSocketReturn {
  state: VoiceConnectionState;
  clientId: string | null;
  roomId: string | null;
  peers: VoicePeer[];
  muted: boolean;
  connect: () => void;
  disconnect: () => void;
  joinRoom: (roomId: string, worldId: string, characterId?: string) => void;
  leaveRoom: () => void;
  sendAudio: (audioBase64: string) => void;
  setMuted: (muted: boolean) => void;
}

export function useVoiceWebSocket(opts: UseVoiceWebSocketOptions = {}): UseVoiceWebSocketReturn {
  const {
    onAudio,
    onError,
    pingIntervalMs = 25_000,
    reconnectDelayMs = 3_000,
    maxReconnectAttempts = 5,
  } = opts;

  const [state, setState] = useState<VoiceConnectionState>('disconnected');
  const [clientId, setClientId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [peers, setPeers] = useState<VoicePeer[]>([]);
  const [muted, setMutedState] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalClose = useRef(false);

  // Stable refs for callbacks
  const onAudioRef = useRef(onAudio);
  onAudioRef.current = onAudio;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    let msg: ServerMessage;
    try {
      msg = JSON.parse(event.data);
    } catch {
      return;
    }

    switch (msg.type) {
      case 'joined':
        setClientId(msg.clientId);
        setRoomId(msg.roomId);
        setPeers(msg.peers.map((id) => ({ clientId: id, characterId: null, muted: false })));
        setState('in_room');
        break;

      case 'peer_joined':
        setPeers((prev) => [
          ...prev,
          { clientId: msg.clientId, characterId: msg.characterId, muted: false },
        ]);
        break;

      case 'peer_left':
        setPeers((prev) => prev.filter((p) => p.clientId !== msg.clientId));
        break;

      case 'audio':
        onAudioRef.current?.(msg.fromClientId, msg.data);
        break;

      case 'peer_muted':
        setPeers((prev) =>
          prev.map((p) =>
            p.clientId === msg.clientId ? { ...p, muted: msg.muted } : p,
          ),
        );
        break;

      case 'error':
        onErrorRef.current?.(msg.message);
        break;

      case 'pong':
        // heartbeat acknowledged
        break;
    }
  }, []);

  const startPing = useCallback(() => {
    pingRef.current = setInterval(() => send({ type: 'ping' }), pingIntervalMs);
  }, [send, pingIntervalMs]);

  const stopPing = useCallback(() => {
    if (pingRef.current) {
      clearInterval(pingRef.current);
      pingRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    intentionalClose.current = false;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/ws/voice`;

    setState('connecting');
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setState('connected');
      reconnectAttempts.current = 0;
      startPing();
    };

    ws.onmessage = handleMessage;

    ws.onclose = () => {
      stopPing();
      setState('disconnected');
      setClientId(null);
      setRoomId(null);
      setPeers([]);

      // Auto-reconnect unless intentionally closed
      if (!intentionalClose.current && reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        reconnectTimer.current = setTimeout(connect, reconnectDelayMs);
      }
    };

    ws.onerror = () => {
      onErrorRef.current?.('WebSocket connection error');
    };
  }, [handleMessage, startPing, stopPing, reconnectDelayMs, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    intentionalClose.current = true;
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    stopPing();
    wsRef.current?.close();
    wsRef.current = null;
    setState('disconnected');
    setClientId(null);
    setRoomId(null);
    setPeers([]);
  }, [stopPing]);

  const joinRoom = useCallback(
    (rid: string, worldId: string, characterId?: string) => {
      send({ type: 'join', roomId: rid, worldId, characterId });
    },
    [send],
  );

  const leaveRoom = useCallback(() => {
    send({ type: 'leave' });
    setRoomId(null);
    setPeers([]);
    setState((prev) => (prev === 'in_room' ? 'connected' : prev));
  }, [send]);

  const sendAudio = useCallback(
    (audioBase64: string) => {
      if (!muted) {
        send({ type: 'audio', data: audioBase64 });
      }
    },
    [send, muted],
  );

  const setMuted = useCallback(
    (m: boolean) => {
      setMutedState(m);
      send({ type: 'mute', muted: m });
    },
    [send],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intentionalClose.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      stopPing();
      wsRef.current?.close();
    };
  }, [stopPing]);

  return {
    state,
    clientId,
    roomId,
    peers,
    muted,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendAudio,
    setMuted,
  };
}
