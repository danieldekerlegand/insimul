/**
 * InsimulClient — unified conversation client with pluggable providers.
 *
 * Orchestrates chat (LLM), TTS, and STT across server, browser, and local backends.
 * Consumers configure their preferred mix at construction time:
 *
 *   const client = new InsimulClient({
 *     chat: 'browser',   // WebLLM in-browser
 *     tts: 'browser',    // Kokoro WASM
 *     stt: 'none',       // disabled
 *   });
 *
 *   client.on({ onTextChunk, onAudioChunk, onComplete });
 *   client.setCharacter(npcId, worldId);
 *   await client.sendText("Hello!");
 */

import type {
  InsimulClientOptions,
  InsimulEventCallbacks,
  ConversationState,
  SendTextOptions,
  HealthCheckResponse,
  ChatProviderType,
  TTSProviderType,
  STTProviderType,
} from './types.js';
import type { ChatProvider } from './providers/chat/types.js';
import type { TTSProvider } from './providers/tts/types.js';
import type { STTProvider } from './providers/stt/types.js';
import { detectBestChatProvider, detectBestTTSProvider, detectBestSTTProvider } from './detect.js';

// ── Provider factories ──────────────────────────────────────────────────

async function createChatProvider(type: ChatProviderType, options: InsimulClientOptions): Promise<ChatProvider> {
  switch (type) {
    case 'server': {
      const { ServerChatProvider } = await import('./providers/chat/server-chat-provider.js');
      return new ServerChatProvider({
        serverUrl: options.serverUrl || 'http://localhost:8080',
        apiKey: options.apiKey,
        worldId: options.worldId,
        preferWebSocket: options.preferWebSocket ?? true,
        languageCode: options.languageCode,
      });
    }
    case 'browser': {
      const { BrowserChatProvider } = await import('./providers/chat/browser-chat-provider.js');
      return new BrowserChatProvider({
        llmModel: options.llmModel,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        onLoadProgress: options.onLoadProgress,
      });
    }
    case 'local': {
      const { LocalChatProvider } = await import('./providers/chat/local-chat-provider.js');
      return new LocalChatProvider();
    }
  }
}

async function createTTSProvider(type: TTSProviderType, _options: InsimulClientOptions): Promise<TTSProvider> {
  switch (type) {
    case 'server': {
      const { ServerTTSProvider } = await import('./providers/tts/server-tts-provider.js');
      return new ServerTTSProvider();
    }
    case 'browser': {
      const { BrowserTTSProvider } = await import('./providers/tts/browser-tts-provider.js');
      return new BrowserTTSProvider();
    }
    case 'local': {
      const { LocalTTSProvider } = await import('./providers/tts/local-tts-provider.js');
      return new LocalTTSProvider();
    }
    case 'none': {
      const { NoneTTSProvider } = await import('./providers/tts/none-tts-provider.js');
      return new NoneTTSProvider();
    }
  }
}

async function createSTTProvider(type: STTProviderType, options: InsimulClientOptions): Promise<STTProvider> {
  switch (type) {
    case 'server': {
      const { ServerSTTProvider } = await import('./providers/stt/server-stt-provider.js');
      return new ServerSTTProvider(options.serverUrl || 'http://localhost:8080', options.apiKey);
    }
    case 'browser': {
      const { BrowserSTTProvider } = await import('./providers/stt/browser-stt-provider.js');
      return new BrowserSTTProvider();
    }
    case 'local': {
      const { LocalSTTProvider } = await import('./providers/stt/local-stt-provider.js');
      return new LocalSTTProvider();
    }
    case 'none': {
      const { NoneSTTProvider } = await import('./providers/stt/none-stt-provider.js');
      return new NoneSTTProvider();
    }
  }
}

// ── InsimulClient ────────────────────────────────────────────────────────

export class InsimulClient {
  private chatProvider!: ChatProvider;
  private ttsProvider!: TTSProvider;
  private sttProvider!: STTProvider;
  private callbacks: InsimulEventCallbacks = {};
  private state: ConversationState = 'idle';
  private options: InsimulClientOptions;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  // Resolved provider types
  private chatType: ChatProviderType;
  private ttsType: TTSProviderType;
  private sttType: STTProviderType;

  constructor(options: InsimulClientOptions = {}) {
    this.options = options;

    // Resolve provider types
    this.chatType = typeof options.chat === 'string'
      ? options.chat
      : (options.chat && 'type' in options.chat) ? options.chat.type as ChatProviderType : detectBestChatProvider();

    this.ttsType = typeof options.tts === 'string'
      ? options.tts
      : (options.tts && 'type' in options.tts) ? options.tts.type as TTSProviderType : detectBestTTSProvider(this.chatType);

    this.sttType = typeof options.stt === 'string'
      ? options.stt
      : (options.stt && 'type' in options.stt) ? options.stt.type as STTProviderType : detectBestSTTProvider(this.chatType);

    // Use provided provider instances directly if given
    if (options.chat && typeof options.chat === 'object' && 'type' in options.chat) {
      this.chatProvider = options.chat as ChatProvider;
    }
    if (options.tts && typeof options.tts === 'object' && 'type' in options.tts) {
      this.ttsProvider = options.tts as TTSProvider;
    }
    if (options.stt && typeof options.stt === 'object' && 'type' in options.stt) {
      this.sttProvider = options.stt as STTProvider;
    }

    console.log(`[InsimulClient] Providers: chat=${this.chatType}, tts=${this.ttsType}, stt=${this.sttType}`);
  }

  // ── Provider access ───────────────────────────────────────────────────

  getChatProvider(): ChatProvider { return this.chatProvider; }
  getTTSProvider(): TTSProvider { return this.ttsProvider; }
  getSTTProvider(): STTProvider { return this.sttProvider; }
  getChatType(): ChatProviderType { return this.chatType; }
  getTTSType(): TTSProviderType { return this.ttsType; }
  getSTTType(): STTProviderType { return this.sttType; }

  // ── Callbacks ─────────────────────────────────────────────────────────

  on(callbacks: InsimulEventCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
    if (this.initialized) this.wireProviderCallbacks();
  }

  private wireProviderCallbacks(): void {
    this.chatProvider.setCallbacks({
      onTextChunk: (text, isFinal) => this.callbacks.onTextChunk?.(text, isFinal),
      onAudioChunk: (chunk) => this.callbacks.onAudioChunk?.(chunk),
      onFacialData: (data) => this.callbacks.onFacialData?.(data),
      onActionTrigger: (action) => this.callbacks.onActionTrigger?.(action),
      onMetadata: (type, content) => this.callbacks.onMetadata?.(type, content),
      onComplete: (fullText) => {
        // If TTS is not server-streamed and not disabled, synthesize after text completes
        if (this.ttsType !== 'server' && this.ttsType !== 'none' && fullText) {
          this.ttsProvider.synthesize(fullText).catch(err => {
            console.warn('[InsimulClient] TTS failed:', err);
          });
        }
        this.callbacks.onComplete?.(fullText);
      },
      onStateChange: (state) => this.setState(state as ConversationState),
      onError: (err) => this.callbacks.onError?.(err),
    });

    this.ttsProvider.setCallbacks({
      onAudioChunk: (chunk) => this.callbacks.onAudioChunk?.(chunk),
      onStart: () => this.setState('speaking'),
      onComplete: () => {
        if (this.state === 'speaking') this.setState('idle');
      },
      onError: (err) => this.callbacks.onError?.(err),
    });

    this.sttProvider.setCallbacks({
      onTranscript: (text, isFinal) => this.callbacks.onTranscript?.(text, isFinal),
      onError: (err) => this.callbacks.onError?.(err),
    });
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      // Create providers that weren't passed as instances
      if (!this.chatProvider) {
        this.chatProvider = await createChatProvider(this.chatType, this.options);
      }
      if (!this.ttsProvider) {
        this.ttsProvider = await createTTSProvider(this.ttsType, this.options);
      }
      if (!this.sttProvider) {
        this.sttProvider = await createSTTProvider(this.sttType, this.options);
      }

      // Wire callbacks
      this.wireProviderCallbacks();

      // Initialize all providers
      await Promise.all([
        this.chatProvider.initialize(),
        this.ttsProvider.initialize(),
        this.sttProvider.initialize(),
      ]);

      this.initialized = true;
      this.initPromise = null;
    })();

    return this.initPromise;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) await this.initialize();
  }

  setCharacter(characterId: string, worldId: string): void {
    if (this.chatProvider) {
      this.chatProvider.setCharacter(characterId, worldId);
    }

    if (this.options.systemPromptBuilder && this.chatProvider) {
      this.chatProvider.setSystemPrompt(this.options.systemPromptBuilder(characterId, worldId));
    }
  }

  /** Set TTS voice for the current character */
  setVoice(options: { gender?: string; language?: string; voiceId?: string }): void {
    if (this.ttsProvider) {
      this.ttsProvider.setVoice(options);
    }
  }

  getState(): ConversationState { return this.state; }

  private setState(state: ConversationState): void {
    if (this.state !== state) {
      this.state = state;
      this.callbacks.onStateChange?.(state);
    }
  }

  // ── Messaging ─────────────────────────────────────────────────────────

  async sendText(text: string, options?: SendTextOptions): Promise<string> {
    await this.ensureInitialized();
    return this.chatProvider.sendText(text, options?.languageCode || this.options.languageCode);
  }

  async sendAudio(audioBlob: Blob, options?: SendTextOptions): Promise<string> {
    await this.ensureInitialized();

    // Server handles STT+LLM+TTS in one pipeline
    if (this.chatType === 'server') {
      return this.chatProvider.sendAudio(audioBlob, options?.languageCode || this.options.languageCode);
    }

    // For browser/local: STT first, then sendText
    this.setState('listening');
    const transcript = await this.sttProvider.transcribe(audioBlob, options?.languageCode || this.options.languageCode);
    this.callbacks.onTranscript?.(transcript, true);

    if (!transcript) {
      this.setState('idle');
      return '';
    }

    return this.sendText(transcript, options);
  }

  abort(): void {
    this.chatProvider?.abort();
    this.ttsProvider?.abort();
    this.sttProvider?.abort();
    this.setState('idle');
  }

  async dispose(): Promise<void> {
    this.abort();
    await Promise.all([
      this.chatProvider?.dispose(),
      this.ttsProvider?.dispose(),
      this.sttProvider?.dispose(),
    ]);
    this.initialized = false;
  }

  // ── Utility ───────────────────────────────────────────────────────────

  async isAvailable(): Promise<boolean> {
    if (this.chatProvider) return this.chatProvider.isSupported();
    // Before initialization, check based on type
    switch (this.chatType) {
      case 'browser': return typeof navigator !== 'undefined' && !!(navigator as any).gpu;
      case 'local': return typeof window !== 'undefined' && !!(window as any).electronAPI?.aiAvailable;
      case 'server': return true;
    }
  }

  async healthCheck(): Promise<HealthCheckResponse> {
    if (this.chatType !== 'server') {
      return { healthy: this.chatProvider?.isReady() ?? false, version: '2.0.0' };
    }
    try {
      const serverUrl = this.options.serverUrl || 'http://localhost:8080';
      const res = await fetch(`${serverUrl}/api/conversation/health`, {
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) return await res.json();
      return { healthy: false, version: '0.0.0' };
    } catch {
      return { healthy: false, version: '0.0.0' };
    }
  }
}
