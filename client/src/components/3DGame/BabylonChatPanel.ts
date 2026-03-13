import {
  AdvancedDynamicTexture,
  Button,
  Container,
  Control,
  InputText,
  Rectangle,
  ScrollViewer,
  StackPanel,
  TextBlock,
  TextWrapping
} from "@babylonjs/gui";
import { Scene, Mesh } from "@babylonjs/core";
import { BabylonDialogueActions } from "./BabylonDialogueActions.ts";
import { Action } from "./types/actions";
import { NPCTalkingIndicator } from "./NPCTalkingIndicator";
import { buildGreeting, buildLanguageAwareSystemPrompt, buildWorldLanguageContext, extractLanguageFluencies, getLanguageBCP47 } from "@shared/language/language-utils";
import type { WorldLanguageContext } from "@shared/language/language-utils";
import { LanguageProgressTracker } from "./LanguageProgressTracker";
import { scorePronunciation, formatPronunciationFeedback } from "@shared/language/pronunciation-scoring";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Character {
  id: string;
  worldId: string;
  firstName: string;
  lastName: string;
  age?: number | null;
  gender?: string;
  occupation?: string | null;
  personality?: Record<string, any>;
  currentLocation?: string;
  friendIds?: string[];
  coworkerIds?: string[];
  spouseId?: string | null;
  [key: string]: any;
}

interface Truth {
  id: string;
  title?: string;
  content: string;
  entryType: string;
  timestep: number;
  characterId?: string;
  sourceData?: Record<string, any>;
  [key: string]: any;
}

interface World {
  id: string;
  name: string;
  worldType?: string;
  gameType?: string;
  targetLanguage?: string;
  description?: string;
  [key: string]: any;
}

export class BabylonChatPanel {
  private _advancedTexture: AdvancedDynamicTexture;
  private scene: Scene;
  private chatContainer: Rectangle | null = null;
  private messagesScrollViewer: ScrollViewer | null = null;
  private messagesStack: StackPanel | null = null;
  private inputText: InputText | null = null;
  private inputContainer: Container | null = null;
  private micButton: Button | null = null; // Store reference to mic button
  private titleText: TextBlock | null = null; // Store reference to title text
  private loadingIndicator: TextBlock | null = null; // Loading indicator
  /** Cached message TextBlock controls indexed by position — avoids full rebuild */
  private _messageControls: Map<number, TextBlock> = new Map();
  /** Smooth scroll animation frame handle */
  private _scrollAnimFrame: number | null = null;
  private streamingResponse: TextBlock | null = null; // Streaming response text
  private character: Character | null = null;
  private truths: Truth[] = [];
  private world: World | null = null;
  private worldLanguageContext: WorldLanguageContext | null = null;
  private playerInventoryContext: string = '';
  private languageTracker: LanguageProgressTracker | null = null;
  private messages: Message[] = [];
  private isVisible = false;
  private _enterKeyHandler: ((e: KeyboardEvent) => void) | null = null;
  private _inputFocused = false;
  private isProcessing = false;
  private _hintTimer: ReturnType<typeof setTimeout> | null = null;
  private _hintShown = false;
  private _patienceTimer: ReturnType<typeof setTimeout> | null = null;
  private _sessionGrammarErrors: Map<string, number> = new Map(); // pattern -> error count this session
  private _grammarFocusShown: Set<string> = new Set(); // patterns already shown focus popup

  // Audio queue for sentence-level TTS playback
  private audioQueue: { index: number; blob: Blob }[] = [];
  private isPlayingQueue = false;

  // Audio
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private isRecording = false;
  private isSpeaking = false;

  // Dialogue Actions
  private dialogueActions: BabylonDialogueActions | null = null;
  private actionsContainer: Container | null = null;
  private availableActions: Action[] = [];
  private playerEnergy: number = 100;

  // Talking Indicator
  private talkingIndicator: NPCTalkingIndicator | null = null;
  private npcMesh: Mesh | null = null;

  // Callbacks
  private onClose: (() => void) | null = null;
  private onQuestAssigned: ((questData: any) => void) | null = null;
  private onActionSelect: ((actionId: string) => void) | null = null;
  private onVocabularyUsed: ((word: string) => void) | null = null;
  private onConversationTurn: ((keywords: string[]) => void) | null = null;
  private onNPCConversationStarted: ((npcId: string) => void) | null = null;
  private onQuestTurnedIn: ((questId: string, rewards: any) => void) | null = null;
  private onNPCSpeechUpdate: ((text: string) => void) | null = null;
  private onFluencyGain: ((fluency: number, gain: number) => void) | null = null;
  private onConversationSummary: ((result: any) => void) | null = null;
  private onDialogueRating: ((messageIndex: number, rating: number) => void) | null = null;
  private pendingTurnInQuests: any[] = [];

  // Expose advancedTexture for debugging
  public get advancedTexture() {
    return this._advancedTexture;
  }

  constructor(advancedTexture: AdvancedDynamicTexture, scene: Scene) {
    this._advancedTexture = advancedTexture;
    this.scene = scene;
    this.talkingIndicator = new NPCTalkingIndicator(scene);
    
    // Test if GUI texture is working
    console.log('[ChatPanel] Constructor - advancedTexture:', advancedTexture);
    console.log('[ChatPanel] Constructor - scene:', scene);
    console.log('[ChatPanel] Constructor - rootContainer children:', advancedTexture.rootContainer.children.length);
    
    // Add window resize listener
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  public show(character: Character, truths: Truth[], npcMesh?: Mesh) {
    console.log('[ChatPanel] SHOW() called for:', character.firstName, character.lastName);
    console.log('[ChatPanel] Current time:', Date.now());
    this.character = character;
    this.truths = truths;
    this.npcMesh = npcMesh || null;
    this.isVisible = true;
    
    // Clear previous messages for new conversation
    this.messages = [];
    console.log('[ChatPanel] Cleared previous messages');

    // Notify that conversation started with this NPC (for quest tracking)
    if (this.onNPCConversationStarted) {
      this.onNPCConversationStarted(character.id);
    }

    // Fetch world data for context
    this.fetchWorldData(character.worldId);

    // Check for quests ready to turn in from this NPC
    this.checkQuestTurnIn(character.id, character.worldId);

    if (this.chatContainer) {
      // Chat container already exists, just update and show it
      console.log('[ChatPanel] Chat container exists, updating...');
      this.chatContainer.isVisible = true;
      this.chatContainer.alpha = 1;
      
      // Update the character name in the header
      if (this.titleText) {
        this.titleText.text = `${character.firstName} ${character.lastName}`;
        console.log('[ChatPanel] Updated title to:', this.titleText.text);
      }
      
      this.initializeChat(truths);
      this._advancedTexture.markAsDirty();
      return;
    }

    // Create the chat UI for the first time
    console.log('[ChatPanel] Creating chat UI for first time...');
    this.createChatUI();
    this.initializeChat(truths);
  }

  private async fetchWorldData(worldId: string) {
    try {
      const [worldRes, langRes] = await Promise.all([
        fetch(`/api/worlds/${worldId}`),
        fetch(`/api/worlds/${worldId}/languages`),
      ]);

      if (worldRes.ok) {
        this.world = await worldRes.json();
      }

      if (langRes.ok) {
        const languages = await langRes.json();
        this.worldLanguageContext = buildWorldLanguageContext(
          languages,
          this.world?.gameType || this.world?.worldType,
          this.world?.targetLanguage,
        );
      }
    } catch (error) {
      console.error('Failed to fetch world data:', error);
    }
  }

  private handleResize() {
    if (this.chatContainer && this.isVisible) {
      console.log('[ChatPanel] Handling resize, refreshing GUI');
      this._advancedTexture.markAsDirty();
    }
  }

  public hide(userInitiated: boolean = false) {
    console.log('[ChatPanel] Hide() called - was isVisible:', this.isVisible, 'userInitiated:', userInitiated);
    console.log('[ChatPanel] Call stack:', new Error().stack);
    this.clearHintTimer();
    this.isVisible = false;
    if (this.chatContainer) {
      this.chatContainer.isVisible = false;
      console.log('[ChatPanel] Chat container set to invisible');
    }
    if (this.dialogueActions) {
      this.dialogueActions.hide();
    }
    if (this._enterKeyHandler) {
      window.removeEventListener("keydown", this._enterKeyHandler);
      this._enterKeyHandler = null;
    }
    // End language tracking conversation and log results
    if (this.languageTracker) {
      const result = this.languageTracker.endConversation();
      if (result && result.gain > 0) {
        console.log(`[LanguageTracker] Fluency: ${result.previousFluency.toFixed(1)} → ${result.newFluency.toFixed(1)} (+${result.gain.toFixed(2)})`);
        if (result.bonuses.length > 0) {
          console.log(`[LanguageTracker] Bonuses: ${result.bonuses.join(", ")}`);
        }
        // Fire conversation summary callback
        this.onConversationSummary?.(result);
      }
    }
    // Hide talking indicator
    if (this.talkingIndicator && this.character) {
      this.talkingIndicator.hide(this.character.id);
    }
    this.stopAllAudio();
    
    // Only call onClose if user-initiated
    if (userInitiated) {
      console.log('[ChatPanel] Calling onClose callback');
      this.onClose?.();
    }
  }

  private stopAllAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
    this.isSpeaking = false;
  }

  private initializeChat(truths: Truth[]) {
    if (!this.character) return;

    // Initialize language progress tracker from world languages or legacy targetLanguage
    const learningLang = this.worldLanguageContext?.learningTargetLanguage?.name
      || this.worldLanguageContext?.targetLanguage
      || this.world?.targetLanguage;
    if (learningLang && learningLang !== 'English') {
      this.languageTracker = new LanguageProgressTracker(
        'player',
        this.character.worldId,
        learningLang
      );
    }

    // Add welcome message if no messages exist
    if (this.messages.length === 0) {
      this.messages.push({
        role: 'assistant',
        content: `Hello! I'm ${this.character.firstName}. How can I help you today?`,
        timestamp: new Date()
      });
    }

    // Build greeting dynamically based on all language fluencies
    const greeting = buildGreeting(this.character, truths, this.world?.targetLanguage);

    // Add greeting as first message if not already present
    if (this.messages.length === 1 && this.messages[0].content.includes("How can I help you")) {
      // Replace the generic welcome with the specific greeting
      this.messages[0] = {
        role: 'assistant',
        content: greeting,
        timestamp: new Date()
      };
    } else if (this.messages.length === 0) {
      // Add greeting if no messages at all
      this.messages.push({
        role: 'assistant',
        content: greeting,
        timestamp: new Date()
      });
    }

    // Set up language tracker callbacks
    if (this.languageTracker) {
      if (this.worldLanguageContext) {
        this.languageTracker.setWorldLanguageContext(this.worldLanguageContext);
      }
      this.languageTracker.setOnFluencyGain((result) => {
        console.log(`[LanguageTracker] Fluency: ${result.previousFluency.toFixed(1)} → ${result.newFluency.toFixed(1)} (+${result.gain.toFixed(2)})`);
        this._proficiencyDirty = true;
        this._cachedSystemPrompt = null; // Force prompt rebuild next message
        this.onFluencyGain?.(result.newFluency, result.gain);
      });
      this.languageTracker.setOnWordMastered((entry) => {
        console.log(`[LanguageTracker] Word mastered: ${entry.word}!`);
        this._proficiencyDirty = true;
      });
    }

    this.updateMessagesDisplay();
  }

  private createChatUI() {
    console.log('[ChatPanel] Creating chat UI...');

    // Main container - compact panel at bottom right
    this.chatContainer = new Rectangle("chatContainer");
    this.chatContainer.width = "320px";
    this.chatContainer.height = "350px";
    this.chatContainer.background = "rgba(0, 0, 0, 0.65)";
    this.chatContainer.color = "rgba(255, 255, 255, 0.5)";
    this.chatContainer.thickness = 1;
    this.chatContainer.cornerRadius = 8;
    this.chatContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.chatContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.chatContainer.zIndex = 10000;
    this.chatContainer.isVisible = true;
    this.chatContainer.alpha = 1;

    // Add to texture
    this._advancedTexture.addControl(this.chatContainer);

    // Use a vertical StackPanel layout instead of absolute pixel positioning
    const mainLayout = new StackPanel("chatMainLayout");
    mainLayout.width = "100%";
    mainLayout.height = "100%";
    mainLayout.isVertical = true;
    this.chatContainer.addControl(mainLayout);

    // Header with character name
    const header = new Rectangle("chatHeader");
    header.width = "100%";
    header.height = "32px";
    header.background = "rgba(20, 20, 20, 0.6)";
    header.thickness = 0;
    header.cornerRadius = 5;
    mainLayout.addControl(header);

    this.titleText = new TextBlock();
    this.titleText.text = this.character ? `${this.character.firstName} ${this.character.lastName}` : "Chat";
    this.titleText.color = "white";
    this.titleText.fontSize = 13;
    this.titleText.fontWeight = "bold";
    this.titleText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.titleText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    this.titleText.name = "chatTitle";
    header.addControl(this.titleText);

    // Close button
    const closeBtn = Button.CreateSimpleButton("closeChat", "X");
    closeBtn.width = "24px";
    closeBtn.height = "24px";
    closeBtn.color = "white";
    closeBtn.background = "rgba(255, 50, 50, 0.8)";
    closeBtn.cornerRadius = 5;
    closeBtn.fontSize = 12;
    closeBtn.left = "-4px";
    closeBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    closeBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    closeBtn.onPointerClickObservable.add(() => {
      this.hide(true);
    });
    header.addControl(closeBtn);

    // Messages area — ScrollViewer wrapping a StackPanel
    // Height is "stretch" — fills remaining space between header (32px) and input (36px)
    const messagesOuter = new Rectangle("messagesOuter");
    messagesOuter.width = "92%";
    messagesOuter.height = "282px";
    messagesOuter.background = "rgba(10, 10, 10, 0.3)";
    messagesOuter.thickness = 0;
    messagesOuter.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    mainLayout.addControl(messagesOuter);

    const scrollViewer = new ScrollViewer("messagesScroll");
    scrollViewer.width = "100%";
    scrollViewer.height = "100%";
    scrollViewer.thickness = 0;
    scrollViewer.barSize = 8;
    scrollViewer.barColor = "rgba(255, 255, 255, 0.4)";
    scrollViewer.barBackground = "transparent";
    scrollViewer.wheelPrecision = 3;
    messagesOuter.addControl(scrollViewer);
    this.messagesScrollViewer = scrollViewer;

    const messagesStack = new StackPanel("messagesStack");
    messagesStack.width = "100%";
    messagesStack.isVertical = true;
    messagesStack.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    messagesStack.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    messagesStack.adaptHeightToChildren = true;
    scrollViewer.addControl(messagesStack);
    this.messagesStack = messagesStack;

    // Input area at the bottom
    const inputArea = new Rectangle("inputArea");
    inputArea.width = "92%";
    inputArea.height = "36px";
    inputArea.background = "rgba(20, 20, 20, 0.5)";
    inputArea.thickness = 0;
    inputArea.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    mainLayout.addControl(inputArea);

    // Input text field
    this.inputText = new InputText("chatInput");
    this.inputText.width = "58%";
    this.inputText.height = "26px";
    this.inputText.color = "white";
    this.inputText.fontSize = 12;
    this.inputText.background = "rgba(60, 60, 60, 0.5)";
    this.inputText.thickness = 1;
    this.inputText.left = "4px";
    this.inputText.text = "Type your message...";
    this.inputText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.inputText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    this.inputText.paddingLeft = "10px";

    this.inputText.onFocusObservable.add(() => {
      if (this.inputText && this.inputText.text === "Type your message...") {
        this.inputText.text = "";
      }
      this._inputFocused = true;
    });

    this.inputText.onBlurObservable.add(() => {
      if (this.inputText && this.inputText.text === "") {
        this.inputText.text = "Type your message...";
      }
      this._inputFocused = false;
    });

    inputArea.addControl(this.inputText);

    // Microphone button
    this.micButton = Button.CreateSimpleButton("micBtn", "Mic");
    this.micButton.width = "26px";
    this.micButton.height = "26px";
    this.micButton.color = "white";
    this.micButton.background = this.isRecording ? "rgba(255, 50, 50, 0.8)" : "rgba(60, 60, 60, 0.5)";
    this.micButton.cornerRadius = 4;
    this.micButton.fontSize = 9;
    this.micButton.left = "60%";
    this.micButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.micButton.onPointerClickObservable.add(() => {
      if (this.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    });
    inputArea.addControl(this.micButton);

    // Send button
    const sendBtn = Button.CreateSimpleButton("sendBtn", "Send");
    sendBtn.width = "28%";
    sendBtn.height = "26px";
    sendBtn.color = "white";
    sendBtn.background = "rgba(30, 150, 255, 0.6)";
    sendBtn.cornerRadius = 4;
    sendBtn.fontSize = 12;
    sendBtn.left = "-4px";
    sendBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    sendBtn.onPointerClickObservable.add(() => {
      this.sendMessage();
    });
    inputArea.addControl(sendBtn);

    // Enter key handler
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter" && this._inputFocused) {
        this.sendMessage();
      }
    };
    this._enterKeyHandler = handleEnter;
    window.addEventListener("keydown", handleEnter);

    // Loading indicator (initially hidden) — lives outside the scroll stack
    this.loadingIndicator = new TextBlock("loadingIndicator");
    this.loadingIndicator.text = "NPC is thinking...";
    this.loadingIndicator.color = "#888";
    this.loadingIndicator.fontSize = 11;
    this.loadingIndicator.height = "16px";
    this.loadingIndicator.isVisible = false;
    this.messagesStack.addControl(this.loadingIndicator);

    console.log('[ChatPanel] Chat UI created');
  }
  
  /** Determine the display color for a message based on role and content prefix. */
  private getMessageColor(msg: Message): string {
    if (msg.role === 'user') return "#87CEEB";
    const content = msg.content || '';
    if (content.startsWith('✓ ')) return "#4CAF50";       // Correct grammar
    if (content.startsWith('✎ Tip: ')) return "#FFC107";  // Grammar corrections
    if (content.startsWith('📖 Grammar Focus')) return "#FF9800"; // Grammar focus
    return "rgba(255, 255, 255, 0.9)";
  }

  /** Create a styled TextBlock for a message at the given index. */
  private createMessageControl(index: number): TextBlock {
    const msg = this.messages[index];
    const messageText = new TextBlock(`msg-${index}`);
    messageText.text = msg.content || ' ';
    messageText.color = this.getMessageColor(msg);
    messageText.fontSize = 12;
    messageText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    messageText.textWrapping = TextWrapping.WordWrap;
    messageText.resizeToFit = true;
    messageText.width = "95%";
    messageText.paddingLeft = "8px";
    messageText.paddingRight = "8px";
    messageText.paddingTop = "3px";
    messageText.paddingBottom = "3px";
    return messageText;
  }

  /** Create a row of 1-5 star rating buttons for an NPC message. */
  private createRatingRow(messageIndex: number): StackPanel {
    const row = new StackPanel(`rating-${messageIndex}`);
    row.isVertical = false;
    row.height = "18px";
    row.paddingLeft = "8px";
    row.paddingBottom = "2px";
    row.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

    const label = new TextBlock(`rateLabel-${messageIndex}`, "Rate:");
    label.fontSize = 9;
    label.color = "#666";
    label.width = "30px";
    label.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    row.addControl(label);

    for (let star = 1; star <= 5; star++) {
      const btn = Button.CreateSimpleButton(`star-${messageIndex}-${star}`, "★");
      btn.width = "18px";
      btn.height = "16px";
      btn.fontSize = 11;
      btn.color = "#555";
      btn.thickness = 0;
      btn.background = "transparent";
      btn.onPointerEnterObservable.add(() => { btn.color = "#FFD700"; });
      btn.onPointerOutObservable.add(() => { btn.color = "#555"; });
      btn.onPointerClickObservable.add(() => {
        // Highlight selected stars
        for (let s = 1; s <= 5; s++) {
          const siblingBtn = row.getChildByName(`star-${messageIndex}-${s}`) as Button | null;
          if (siblingBtn) {
            const textBlock = siblingBtn.children?.[0] as TextBlock | undefined;
            if (textBlock) textBlock.color = s <= star ? "#FFD700" : "#555";
          }
        }
        // Fire callback
        if (this.onDialogueRating) {
          this.onDialogueRating(messageIndex, star);
        }
      });
      row.addControl(btn);
    }

    return row;
  }

  private displayMessages() {
    if (!this.messagesStack) return;

    // Incremental: only add controls for messages that don't have cached controls yet
    const existingCount = this._messageControls.size;

    // If messages were removed (e.g. feedback auto-cleanup), do a full rebuild
    if (existingCount > this.messages.length) {
      // Remove all cached controls
      this._messageControls.forEach((ctrl) => {
        this.messagesStack!.removeControl(ctrl);
      });
      this._messageControls.clear();
    }

    // Ensure loading indicator is at the end
    if (this.loadingIndicator && this.loadingIndicator.parent === this.messagesStack) {
      this.messagesStack.removeControl(this.loadingIndicator);
    }

    // Add only new message controls
    const startIdx = this._messageControls.size;
    for (let i = startIdx; i < this.messages.length; i++) {
      const ctrl = this.createMessageControl(i);
      this._messageControls.set(i, ctrl);
      this.messagesStack.addControl(ctrl);

      // Add rating buttons after NPC messages (not system messages)
      if (this.messages[i].role === 'assistant' && !this.messages[i].content.startsWith('✓ ') && !this.messages[i].content.startsWith('✎ ')) {
        const ratingRow = this.createRatingRow(i);
        this.messagesStack.addControl(ratingRow);
      }
    }

    // Re-add loading indicator at the end
    if (this.loadingIndicator) {
      this.messagesStack.addControl(this.loadingIndicator);
    }

    // Auto-scroll to bottom
    this.scrollToBottom();
  }

  /**
   * Update the text of the last message control in-place (for streaming).
   * Uses the control cache for O(1) lookup.
   */
  private updateLastMessageText(text: string) {
    if (!this.messagesStack) return;

    const lastIdx = this.messages.length - 1;
    const cached = this._messageControls.get(lastIdx);
    if (cached) {
      cached.text = text || ' ';
      this.scrollToBottom();
      return;
    }
    // Fallback to full rebuild
    this.displayMessages();
  }

  /**
   * Scroll the messages ScrollViewer to the bottom with smooth animation.
   */
  private scrollToBottom() {
    if (!this.messagesScrollViewer) return;

    // Cancel any in-progress scroll animation
    if (this._scrollAnimFrame !== null) {
      cancelAnimationFrame(this._scrollAnimFrame);
      this._scrollAnimFrame = null;
    }

    // Defer to next frame so layout has been computed
    setTimeout(() => {
      if (!this.messagesScrollViewer?.verticalBar) return;

      const bar = this.messagesScrollViewer.verticalBar;
      const start = bar.value;
      const target = 1;

      // If already at bottom or close, snap immediately
      if (target - start < 0.05) {
        bar.value = target;
        return;
      }

      // Smooth scroll over ~200ms (roughly 12 frames at 60fps)
      const duration = 200;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        bar.value = start + (target - start) * eased;

        if (t < 1) {
          this._scrollAnimFrame = requestAnimationFrame(animate);
        } else {
          this._scrollAnimFrame = null;
        }
      };

      this._scrollAnimFrame = requestAnimationFrame(animate);
    }, 0);
  }

  private updateMessagesDisplay() {
    this.displayMessages();
  }

  private displayGrammarFeedback(text: string, isCorrect: boolean) {
    // Show as a styled tip in the messages area
    const prefix = isCorrect ? '✓ ' : '✎ Tip: ';
    const color = isCorrect ? '#4CAF50' : '#FFC107';

    // Add as a system-style message that will be displayed
    this.messages.push({
      role: 'assistant',
      content: `${prefix}${text}`,
      timestamp: new Date(),
    });
    this.updateMessagesDisplay();

    // Auto-remove the feedback message after 8 seconds to avoid clutter
    const feedbackIdx = this.messages.length - 1;
    setTimeout(() => {
      if (this.messages[feedbackIdx]?.content.startsWith(prefix)) {
        this.messages.splice(feedbackIdx, 1);
        this.updateMessagesDisplay();
      }
    }, 8000);
  }

  /**
   * Show a "Grammar Focus" popup when the player makes the same error 3+ times.
   * Displayed as a persistent message with a rule explanation.
   */
  private showGrammarFocusPopup(pattern: string, explanation: string, example: string) {
    const focusMsg = `📖 Grammar Focus: ${pattern}\n${explanation}\nCorrect form: "${example}"\n(This pattern has come up several times — practice makes perfect!)`;

    this.messages.push({
      role: 'assistant',
      content: focusMsg,
      timestamp: new Date(),
    });
    this.updateMessagesDisplay();

    // Auto-remove after 15 seconds (longer than normal feedback)
    const idx = this.messages.length - 1;
    setTimeout(() => {
      if (this.messages[idx]?.content.startsWith('📖 Grammar Focus')) {
        this.messages.splice(idx, 1);
        this.updateMessagesDisplay();
      }
    }, 15000);
  }

  private async sendMessage() {
    if (!this.inputText || !this.character || this.isProcessing) return;

    const userMessage = this.inputText.text.trim();
    if (!userMessage) return;

    this.clearHintTimer();
    this._hintShown = false;
    this.inputText.text = "Type your message...";
    this.isProcessing = true;

    // Add user message
    this.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });
    this.updateMessagesDisplay();

    // Show loading indicator
    if (this.loadingIndicator) {
      this.loadingIndicator.isVisible = true;
    }

    try {
      // Add a placeholder assistant message for streaming
      const placeholderMsg = {
        role: 'assistant' as const,
        content: '',
        timestamp: new Date()
      };
      this.messages.push(placeholderMsg);
      this.updateMessagesDisplay();

      // Stream response from Gemini
      const aiResponse = await this.sendToGeminiStreaming(userMessage, (partialText: string) => {
        placeholderMsg.content = partialText;
        this.updateLastMessageText(partialText);
        this.onNPCSpeechUpdate?.(partialText);
      });

      // Hide loading indicator
      if (this.loadingIndicator) {
        this.loadingIndicator.isVisible = false;
      }

      // Parse and create quest if present in response
      const cleanedResponse = await this.parseAndCreateQuest(aiResponse.text);

      // Analyze vocabulary usage
      if (this.languageTracker) {
        this.languageTracker.analyzePlayerMessage(userMessage);
        this.languageTracker.analyzeNPCResponse(cleanedResponse);
      }

      // Request grammar analysis asynchronously (separate LLM call, doesn't block dialogue)
      const isLanguageLearning = this.world?.gameType === 'language-learning' ||
                                 this.world?.gameType === 'educational' ||
                                 this.world?.worldType === 'language-learning' ||
                                 this.world?.worldType === 'educational';
      if (isLanguageLearning && this.languageTracker && this.worldLanguageContext?.targetLanguage) {
        this.requestGrammarAnalysis(userMessage, cleanedResponse);
      }

      // Update final cleaned message content and do full display rebuild
      placeholderMsg.content = cleanedResponse;
      this.updateMessagesDisplay();

      // Track vocabulary usage for quests
      this.trackQuestProgress(userMessage, cleanedResponse);

      // Wait for queued sentence audio to finish, or fall back to full TTS
      if (this.audioQueue.length > 0) {
        // Audio queue playback was started during streaming; wait for it to drain
        while (this.isPlayingQueue) {
          await new Promise(r => setTimeout(r, 100));
        }
      } else {
        await this.textToSpeech(cleanedResponse);
      }

      // Start hint timer for beginner players
      this.startHintTimer();

    } catch (error) {
      console.error('Chat error:', error);
      this.messages.push({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      });
      this.updateMessagesDisplay();
    } finally {
      this.isProcessing = false;
    }
  }

  private startHintTimer() {
    this.clearHintTimer();
    if (!this.languageTracker) return;

    const fluency = this.languageTracker.getFluency();
    const occupation = this.character?.occupation?.toLowerCase() || '';

    // Determine NPC patience based on occupation difficulty
    // Patient occupations (teacher, innkeeper, shopkeeper) wait much longer
    const patientOccupations = ['teacher', 'innkeeper', 'shopkeeper', 'bartender', 'healer', 'priest'];
    const impatientOccupations = ['scholar', 'noble', 'merchant', 'guard', 'captain', 'lord', 'duke'];
    const isPatient = patientOccupations.some(o => occupation.includes(o));
    const isImpatient = impatientOccupations.some(o => occupation.includes(o));

    // Hint timer: only for beginner/elementary players
    if (fluency < 40 && !this._hintShown) {
      const hintDelay = fluency < 20 ? 10000 : 15000;
      this._hintTimer = setTimeout(() => {
        if (!this.isProcessing && this.isVisible && this.character) {
          this._hintShown = true;
          this.messages.push({
            role: 'assistant',
            content: fluency < 20
              ? `(Don't worry, take your time! You can try saying something simple like "hello" or ask me a question in English.)`
              : `(Need a hint? Try using some of the words I just used, or ask me to repeat something!)`,
            timestamp: new Date()
          });
          this.updateMessagesDisplay();
        }
      }, hintDelay);
    }

    // Patience timer: NPC walks away if player is silent too long
    // Patient NPCs: 60s, Neutral NPCs: 30s, Impatient NPCs: 20s
    // Beginners get extra time
    const basePatienceMs = isPatient ? 60000 : isImpatient ? 20000 : 30000;
    const patienceMs = fluency < 20 ? basePatienceMs * 1.5 : basePatienceMs;

    this._patienceTimer = setTimeout(() => {
      if (!this.isProcessing && this.isVisible && this.character) {
        const farewell = isImpatient
          ? `*${this.character.firstName} looks distracted and turns to leave* "I must attend to other matters. Perhaps we can speak another time."`
          : isPatient
          ? `*${this.character.firstName} smiles warmly* "I should get back to work, but come talk to me anytime! You're doing great!"`
          : `*${this.character.firstName} nods politely* "Well, it was nice chatting. I'll be around if you need me."`;
        this.messages.push({
          role: 'assistant',
          content: farewell,
          timestamp: new Date()
        });
        this.updateMessagesDisplay();
        // Auto-close after a short delay so the player can read the farewell
        setTimeout(() => {
          if (this.isVisible) this.hide(true);
        }, 3000);
      }
    }, patienceMs);
  }

  private clearHintTimer() {
    if (this._hintTimer) {
      clearTimeout(this._hintTimer);
      this._hintTimer = null;
    }
    if (this._patienceTimer) {
      clearTimeout(this._patienceTimer);
      this._patienceTimer = null;
    }
  }

  /**
   * Stream a chat response from Gemini via SSE.
   * Calls onChunk with the accumulated text as each token arrives.
   */
  private async sendToGeminiStreaming(
    userMessage: string,
    onChunk: (partialText: string) => void
  ): Promise<{text: string, audio?: string}> {
    if (!this.character) throw new Error('No character selected');

    const systemPrompt = this.buildSystemPrompt();
    const conversationHistory = this.messages
      .filter(m => m.content) // skip empty placeholder
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

    // Ensure the last entry is the user message
    if (!conversationHistory.length || conversationHistory[conversationHistory.length - 1].parts[0].text !== userMessage) {
      conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });
    }

    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt,
        messages: conversationHistory,
        temperature: 0.8,
        maxTokens: 2048,
        returnAudio: true,
        voice: this.character?.gender === 'female' ? 'Kore' : 'Charon',
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from AI');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullText = '';
    // Reset audio queue for this response
    this.audioQueue = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.text) {
            fullText += parsed.text;
            // Strip system markers before displaying to the player
            const displayText = fullText
              .replace(/\*\*GRAMMAR_FEEDBACK\*\*[\s\S]*?\*\*END_GRAMMAR\*\*/g, '')
              .replace(/\*\*QUEST_ASSIGN\*\*[\s\S]*?\*\*END_QUEST\*\*/g, '')
              // Also strip partial/incomplete marker blocks mid-stream
              .replace(/\*\*GRAMMAR_FEEDBACK\*\*[\s\S]*$/g, '')
              .replace(/\*\*QUEST_ASSIGN\*\*[\s\S]*$/g, '')
              .trim();
            onChunk(displayText);
          }
          if (parsed.audio) {
            // Sentence-level audio chunk — queue for sequential playback
            const audioBytes = Uint8Array.from(atob(parsed.audio), c => c.charCodeAt(0));
            const audioBlob = new Blob([audioBytes], { type: 'audio/mp3' });
            const idx = parsed.sentenceIndex ?? this.audioQueue.length;
            this.audioQueue.push({ index: idx, blob: audioBlob });
            // Start playing immediately if this is the first chunk
            if (!this.isPlayingQueue) {
              this.playAudioQueue();
            }
          }
          if (parsed.error) {
            console.error('[ChatPanel] Stream error:', parsed.error);
          }
        } catch {
          // Skip invalid JSON lines
        }
      }
    }

    return { text: fullText };
  }

  /**
   * Play queued sentence audio blobs in order.
   * Audio chunks arrive asynchronously from parallel TTS;
   * this drains them sequentially so sentences play in order.
   */
  private async playAudioQueue(): Promise<void> {
    if (this.isPlayingQueue) return;
    this.isPlayingQueue = true;
    // Sort by sentence index
    this.audioQueue.sort((a, b) => a.index - b.index);
    let nextIndex = 0;

    while (nextIndex < this.audioQueue.length || this.isProcessing) {
      const entry = this.audioQueue.find(e => e.index === nextIndex);
      if (entry) {
        await this.playAudio(entry.blob);
        nextIndex++;
      } else {
        // Wait briefly for the next chunk to arrive
        await new Promise(r => setTimeout(r, 100));
      }
    }
    // Drain any remaining chunks that arrived after processing finished
    this.audioQueue.sort((a, b) => a.index - b.index);
    for (const entry of this.audioQueue.filter(e => e.index >= nextIndex)) {
      await this.playAudio(entry.blob);
    }
    this.isPlayingQueue = false;
  }

  private async streamAudioResponse(audioBlob: Blob, responseText: TextBlock): Promise<void> {
    if (!this.character) throw new Error('No character selected');

    // Convert blob to base64
    const fileReader = new FileReader();
    await new Promise((resolve, reject) => {
      fileReader.onload = resolve;
      fileReader.onerror = reject;
      fileReader.readAsDataURL(audioBlob);
    });
    const base64Audio = fileReader.result as string;
    
    const systemPrompt = this.buildSystemPrompt();
    const conversationHistory = this.messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt,
        messages: conversationHistory,
        audioInput: base64Audio,
        temperature: 0.8,
        maxTokens: 2048,
        returnAudio: true,
        voice: this.character?.gender === 'female' ? 'Kore' : 'Charon',
        stream: true // Enable streaming
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from AI');
    }

    const streamReader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let audioBuffer = "";

    while (true) {
      const { done, value } = await streamReader!.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullText += parsed.text;
              responseText.text = fullText;
              // Force GUI update
              this._advancedTexture.markAsDirty();
            }
            if (parsed.audio) {
              audioBuffer += parsed.audio;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    // Play accumulated audio if available
    if (audioBuffer) {
      const audioBytes = Uint8Array.from(atob(audioBuffer), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBytes], { type: 'audio/mp3' });
      await this.playAudio(audioBlob);
    }
  }

  private async sendAudioToGemini(audioBlob: Blob): Promise<{text: string, audio?: string, userTranscript?: string}> {
    if (!this.character) throw new Error('No character selected');

    // Convert blob to base64
    const fileReader2 = new FileReader();
    await new Promise((resolve, reject) => {
      fileReader2.onload = resolve;
      fileReader2.onerror = reject;
      fileReader2.readAsDataURL(audioBlob);
    });
    const base64Audio = fileReader2.result as string;
    
    const systemPrompt = this.buildSystemPrompt();
    const conversationHistory = this.messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt,
        messages: conversationHistory,
        audioInput: base64Audio, // Send audio directly
        temperature: 0.8,
        maxTokens: 2048,
        returnAudio: true, // Request audio in the response
        voice: this.character?.gender === 'female' ? 'Kore' : 'Charon',
        stream: false // Set to true for streaming responses
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from AI');
    }

    const data = await response.json();
    return {
      text: data.response,
      audio: data.audio, // Base64 encoded audio
      userTranscript: data.userTranscript // Transcript of user's audio
    };
  }

  private async sendToGemini(userMessage: string): Promise<{text: string, audio?: string}> {
    if (!this.character) throw new Error('No character selected');

    const systemPrompt = this.buildSystemPrompt();
    const conversationHistory = this.messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    conversationHistory.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt,
        messages: conversationHistory,
        temperature: 0.8,
        maxTokens: 2048,
        returnAudio: true, // Request audio in the response
        voice: this.character?.gender === 'female' ? 'Kore' : 'Charon'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from AI');
    }

    const data = await response.json();
    return {
      text: data.response,
      audio: data.audio // Base64 encoded audio
    };
  }

  private _cachedSystemPrompt: string | null = null;
  private _systemPromptCharId: string | null = null;
  private _proficiencyDirty = false;

  private buildSystemPrompt(): string {
    if (!this.character) return '';
    // Return cached prompt if character hasn't changed
    if (this._cachedSystemPrompt && this._systemPromptCharId === this.character.id) {
      // Rebuild if inventory context or proficiency data changed
      if (!this.playerInventoryContext && !this._proficiencyDirty) return this._cachedSystemPrompt;
    }
    this._proficiencyDirty = false;
    const proficiency = this.languageTracker?.getPlayerProficiency() || undefined;
    let prompt = buildLanguageAwareSystemPrompt(
      this.character,
      this.truths,
      this.worldLanguageContext || undefined,
      this.world ? {
        id: this.world.id,
        name: this.world.name,
        worldType: this.world.worldType,
        gameType: this.world.gameType,
        description: this.world.description,
        targetLanguage: this.world.targetLanguage,
      } : undefined,
      proficiency
    );
    if (this.playerInventoryContext) {
      prompt += this.playerInventoryContext;
    }
    this._cachedSystemPrompt = prompt;
    this._systemPromptCharId = this.character.id as string;
    return prompt;
  }

  /**
   * Request grammar analysis from a separate LLM call.
   * Runs in the background — doesn't block dialogue display or TTS.
   */
  private async requestGrammarAnalysis(playerMessage: string, npcResponse: string): Promise<void> {
    try {
      const res = await fetch('/api/gemini/grammar-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerMessage,
          npcResponse,
          targetLanguage: this.worldLanguageContext?.targetLanguage || 'Spanish',
        }),
      });

      if (!res.ok) return;
      const data = await res.json();

      if (!data || !this.languageTracker) return;

      const feedback = {
        status: data.status as 'correct' | 'corrected' | 'no_target_language',
        errors: (data.errors || []).map((e: any) => ({
          pattern: e.pattern || 'unknown',
          incorrect: e.incorrect || '',
          corrected: e.corrected || '',
          explanation: e.explanation || '',
        })),
        errorCount: data.errors?.length || 0,
        timestamp: Date.now(),
      };

      this.languageTracker.recordGrammarFeedback(feedback);

      if (feedback.status === 'corrected' && feedback.errors.length > 0) {
        console.log(`[GrammarAnalysis] Grammar corrections: ${feedback.errors.length}`);
        const corrections = feedback.errors.map((err: any) =>
          `"${err.incorrect}" → "${err.corrected}" (${err.explanation})`
        ).join('\n');
        this.displayGrammarFeedback(corrections, false);

        // Track repeated grammar errors — show focus popup after 3 errors of same type
        for (const err of feedback.errors) {
          const count = (this._sessionGrammarErrors.get(err.pattern) || 0) + 1;
          this._sessionGrammarErrors.set(err.pattern, count);
          if (count >= 3 && !this._grammarFocusShown.has(err.pattern)) {
            this._grammarFocusShown.add(err.pattern);
            this.showGrammarFocusPopup(err.pattern, err.explanation, err.corrected);
          }
        }
      } else if (feedback.status === 'correct') {
        console.log('[GrammarAnalysis] Grammar: correct!');
        this.displayGrammarFeedback('Great grammar!', true);
      }
    } catch (err) {
      console.warn('[GrammarAnalysis] Failed:', err);
    }
  }

  private async textToSpeech(text: string) {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: this.character?.gender === 'female' ? 'Kore' : 'Charon',
          gender: this.character?.gender || 'neutral'
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        await this.playAudio(audioBlob);
      } else {
        // Fallback to browser TTS
        this.browserTextToSpeech(text);
      }
    } catch (error) {
      console.error('TTS error:', error);
      this.browserTextToSpeech(text);
    }
  }

  private browserTextToSpeech(text: string) {
    if (!('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);

    // Dynamically detect the character's dominant language for TTS
    const fluencies = extractLanguageFluencies(this.truths);
    const dominantLang = fluencies[0]?.language || 'English';
    const langCode = getLanguageBCP47(dominantLang);
    utterance.lang = langCode;
    utterance.rate = 0.9;

    const voices = speechSynthesis.getVoices();
    const langPrefix = langCode.split('-')[0];
    const voice = voices.find(v => v.lang.startsWith(langPrefix));
    if (voice) utterance.voice = voice;

    this.isSpeaking = true;

    // Show talking indicator
    if (this.talkingIndicator && this.character && this.npcMesh) {
      this.talkingIndicator.show(this.character.id, this.npcMesh);
    }

    utterance.onend = () => {
      this.isSpeaking = false;

      // Hide talking indicator
      if (this.talkingIndicator && this.character) {
        this.talkingIndicator.hide(this.character.id);
      }
    };

    speechSynthesis.speak(utterance);
  }

  private playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      this.isSpeaking = true;

      // Show talking indicator
      if (this.talkingIndicator && this.character && this.npcMesh) {
        this.talkingIndicator.show(this.character.id, this.npcMesh);
      }

      audio.onended = () => {
        this.isSpeaking = false;
        URL.revokeObjectURL(audioUrl);

        // Hide talking indicator
        if (this.talkingIndicator && this.character) {
          this.talkingIndicator.hide(this.character.id);
        }
        resolve();
      };

      audio.onerror = (e) => {
        this.isSpeaking = false;
        URL.revokeObjectURL(audioUrl);
        if (this.talkingIndicator && this.character) {
          this.talkingIndicator.hide(this.character.id);
        }
        reject(e);
      };

      audio.play().catch(reject);
    });
  }

  private async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        this.isProcessing = true;
        
        // Update input text to show processing
        if (this.inputText) {
          this.inputText.text = "🔄 Transcribing audio...";
          this.inputText.color = "#ffd93d";
        }
        
        // Show thinking indicator
        if (this.loadingIndicator) {
          this.loadingIndicator.isVisible = true;
        }
        
        try {
          // First try to send audio directly to Gemini
          let response: { text: string; audio?: string; userTranscript?: string };
          let userTranscript: string;
          
          try {
            // Get transcript first so we can show it immediately
            userTranscript = await this.speechToText(audioBlob);
            
            // Show user message right away
            this.messages.push({
              role: 'user',
              content: userTranscript,
              timestamp: new Date()
            });
            this.updateMessagesDisplay();
            
            // Update input to show thinking status
            if (this.inputText) {
              this.inputText.text = "NPC is thinking...";
              this.inputText.color = "#ffd93d";
            }
            
            // Now send to Gemini
            const textResponse = await this.sendToGemini(userTranscript);
            response = {
              ...textResponse,
              userTranscript: userTranscript
            };
          } catch (e) {
            console.log('Direct audio API failed, falling back to speech-to-text');
            // Fallback to speech-to-text then text chat
            userTranscript = await this.speechToText(audioBlob);
            
            // Show user message right away
            this.messages.push({
              role: 'user',
              content: userTranscript,
              timestamp: new Date()
            });
            this.updateMessagesDisplay();
            
            // Update input to show thinking status
            if (this.inputText) {
              this.inputText.text = "NPC is thinking...";
              this.inputText.color = "#ffd93d";
            }
            
            const textResponse = await this.sendToGemini(userTranscript);
            response = {
              ...textResponse,
              userTranscript: userTranscript
            };
          }
          
          // NPC response is now pure dialogue (no embedded markers)
          const voiceCleanedResponse = response.text;

          // Add AI response
          this.messages.push({
            role: 'assistant',
            content: voiceCleanedResponse,
            timestamp: new Date()
          });
          this.updateMessagesDisplay();
          // Notify speech bubble overlay of NPC's words
          this.onNPCSpeechUpdate?.(voiceCleanedResponse);

          // Request grammar analysis asynchronously (separate LLM call)
          const isLangLearning = this.world?.gameType === 'language-learning' ||
                                 this.world?.gameType === 'educational' ||
                                 this.world?.worldType === 'language-learning' ||
                                 this.world?.worldType === 'educational';
          if (isLangLearning && this.languageTracker && this.worldLanguageContext?.targetLanguage) {
            this.requestGrammarAnalysis(userTranscript, voiceCleanedResponse);
          }

          // Play audio if available
          if (response.audio) {
            const audioBytes = Uint8Array.from(atob(response.audio), c => c.charCodeAt(0));
            const audioBlob = new Blob([audioBytes], { type: 'audio/mp3' });
            await this.playAudio(audioBlob);
          } else {
            // Fallback to TTS
            await this.textToSpeech(voiceCleanedResponse);
          }
          
          // Hide thinking indicator
          if (this.loadingIndicator) {
            this.loadingIndicator.isVisible = false;
          }
          
          // Reset input
          if (this.inputText) {
            this.inputText.text = "Type your message...";
            this.inputText.color = "white";
          }
          
        } catch (error) {
          console.error('Audio processing error:', error);
          
          // Hide thinking indicator on error
          if (this.loadingIndicator) {
            this.loadingIndicator.isVisible = false;
          }
          
          // Reset input on error
          if (this.inputText) {
            this.inputText.text = "Type your message...";
            this.inputText.color = "white";
          }
        } finally {
          this.isProcessing = false;
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      
      // Update mic button appearance
      if (this.micButton) {
        this.micButton.background = "rgba(255, 50, 50, 0.8)";
        this.micButton.color = "white";
      }
      
      // Update input text to show recording
      if (this.inputText) {
        this.inputText.text = "🎤 Recording...";
        this.inputText.color = "#ff6b6b";
      }
    } catch (error) {
      console.error('Microphone error:', error);
    }
  }

  private stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      
      // Update mic button appearance
      if (this.micButton) {
        this.micButton.background = "rgba(60, 60, 60, 0.8)";
        this.micButton.color = "white";
      }
    }
  }

  private async speechToText(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await fetch('/api/stt', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to convert speech to text');
    }

    const data = await response.json();
    return data.transcript;
  }

  /**
   * Pronunciation practice: play a phrase via TTS, then record player's attempt
   * and score accuracy. Called when NPC offers a pronunciation challenge.
   */
  public async practicePronunciation(phrase: string): Promise<void> {
    // Show the phrase to practice
    this.messages.push({
      role: 'assistant',
      content: `🗣️ Repeat after me: "${phrase}"`,
      timestamp: new Date(),
    });
    this.updateMessagesDisplay();

    // Play the phrase via TTS so player can hear correct pronunciation
    await this.textToSpeech(phrase);

    // Wait a moment, then auto-start recording
    await new Promise(resolve => setTimeout(resolve, 500));

    this.messages.push({
      role: 'assistant',
      content: '🎤 Your turn! Recording...',
      timestamp: new Date(),
    });
    this.updateMessagesDisplay();

    // Record player's attempt
    try {
      const audioBlob = await this.recordPronunciationAttempt(5000); // 5 second max
      const transcript = await this.speechToText(audioBlob);

      // Score the pronunciation
      const result = scorePronunciation(phrase, transcript);
      const feedbackMsg = formatPronunciationFeedback(result);

      // Show detailed feedback
      this.messages.push({
        role: 'assistant',
        content: feedbackMsg,
        timestamp: new Date(),
      });

      // Show word-level detail for close/missed words
      const issues = result.wordResults.filter(w => w.match === 'close' || w.match === 'missed');
      if (issues.length > 0 && result.overallScore < 90) {
        const details = issues.map(w => {
          if (w.match === 'missed') return `"${w.expected}" — not detected`;
          return `"${w.spoken}" → "${w.expected}"`;
        }).join('\n');
        this.messages.push({
          role: 'assistant',
          content: details,
          timestamp: new Date(),
        });
      }

      this.updateMessagesDisplay();

      // Track pronunciation practice in language tracker
      if (this.languageTracker) {
        this.languageTracker.analyzePlayerMessage(transcript);
      }
    } catch (error) {
      console.error('Pronunciation practice error:', error);
      this.messages.push({
        role: 'assistant',
        content: '⚠️ Could not capture audio. Try again!',
        timestamp: new Date(),
      });
      this.updateMessagesDisplay();
    }
  }

  /**
   * Record audio for a fixed duration and return the blob.
   */
  private recordPronunciationAttempt(maxDurationMs: number): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };

        recorder.onstop = () => {
          stream.getTracks().forEach(track => track.stop());
          resolve(new Blob(chunks, { type: 'audio/webm' }));
        };

        recorder.onerror = () => {
          stream.getTracks().forEach(track => track.stop());
          reject(new Error('Recording failed'));
        };

        recorder.start();

        // Update mic button visual
        if (this.micButton) {
          this.micButton.background = "rgba(255, 50, 50, 0.8)";
        }

        // Auto-stop after duration
        setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
          if (this.micButton) {
            this.micButton.background = "rgba(100, 100, 100, 0.6)";
          }
        }, maxDurationMs);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Speak a single word via TTS (for vocabulary pronunciation).
   * Returns a promise that resolves when speech is complete.
   */
  public async speakWord(word: string): Promise<void> {
    await this.textToSpeech(word);
  }

  /**
   * Track quest progress from conversation
   */
  private trackQuestProgress(userMessage: string, aiResponse: string) {
    // Extract words from both messages
    const combinedText = `${userMessage} ${aiResponse}`;
    const words = combinedText.toLowerCase()
      .replace(/[^\wà-ÿ\s]/gi, '') // Keep accented characters
      .split(/\s+/)
      .filter(word => word.length > 3); // Only words longer than 3 chars

    // Track vocabulary usage
    if (this.onVocabularyUsed) {
      // Deduplicate words
      const uniqueWords = Array.from(new Set(words));
      uniqueWords.forEach(word => {
        this.onVocabularyUsed!(word);
      });
    }

    // Extract keywords for conversation tracking
    const keywords = words.filter(word => {
      // French greeting/polite keywords
      const importantWords = [
        'bonjour', 'bonsoir', 'salut', 'au revoir', 'merci', 'pardon',
        'comment', 'pourquoi', 'quand', 'où', 'qui', 'que', 'quel',
        'sil', 'vous', 'plaît', 'allez'
      ];
      return importantWords.includes(word);
    });

    // Track conversation turn if we have keywords
    if (this.onConversationTurn && keywords.length > 0) {
      this.onConversationTurn(keywords);
    }
  }

  public getLanguageTracker(): import('./LanguageProgressTracker').LanguageProgressTracker | null {
    return this.languageTracker;
  }

  public setOnClose(callback: () => void) {
    this.onClose = callback;
  }

  public setOnQuestAssigned(callback: (questData: any) => void) {
    this.onQuestAssigned = callback;
  }

  public setOnActionSelect(callback: (actionId: string) => void) {
    this.onActionSelect = callback;
  }

  public setOnVocabularyUsed(callback: (word: string) => void) {
    this.onVocabularyUsed = callback;
  }

  public setOnConversationTurn(callback: (keywords: string[]) => void) {
    this.onConversationTurn = callback;
  }

  public setOnNPCConversationStarted(callback: (npcId: string) => void) {
    this.onNPCConversationStarted = callback;
  }

  public setOnNPCSpeechUpdate(callback: (text: string) => void) {
    this.onNPCSpeechUpdate = callback;
  }

  public setPlayerInventoryContext(items: Array<{ name: string; type: string; quantity: number }>, gold: number) {
    if (items.length === 0 && gold === 0) {
      this.playerInventoryContext = '';
      return;
    }
    const itemList = items.map(i => `${i.name} (x${i.quantity})`).join(', ');
    this.playerInventoryContext = `\nThe player currently has ${gold} gold${items.length > 0 ? ` and carries: ${itemList}` : ''}.`;
  }

  public setOnQuestTurnedIn(callback: (questId: string, rewards: any) => void) {
    this.onQuestTurnedIn = callback;
  }

  public setOnFluencyGain(callback: (fluency: number, gain: number) => void) {
    this.onFluencyGain = callback;
  }

  public setOnConversationSummary(callback: (result: any) => void) {
    this.onConversationSummary = callback;
  }

  /** Set callback for when the player rates an NPC dialogue response (1-5 stars). */
  public setOnDialogueRating(callback: (messageIndex: number, rating: number) => void) {
    this.onDialogueRating = callback;
  }

  private _onExternalNewWord: ((entry: any) => void) | null = null;
  private _onExternalWordMastered: ((entry: any) => void) | null = null;
  private _onExternalGrammarFeedback: ((feedback: any) => void) | null = null;

  public setOnNewWordLearned(callback: (entry: any) => void) {
    this._onExternalNewWord = callback;
    if (this.languageTracker) {
      const orig = this.languageTracker['onNewWordLearned'];
      this.languageTracker.setOnNewWordLearned((entry) => {
        orig?.(entry);
        callback(entry);
      });
    }
  }

  public setOnWordMastered(callback: (entry: any) => void) {
    this._onExternalWordMastered = callback;
    // The tracker's onWordMastered is set during initLanguageTracking.
    // We chain it after.
    if (this.languageTracker) {
      const orig = this.languageTracker['onWordMastered'];
      this.languageTracker.setOnWordMastered((entry) => {
        orig?.(entry);
        callback(entry);
      });
    }
  }

  public setOnGrammarFeedbackExternal(callback: (feedback: any) => void) {
    this._onExternalGrammarFeedback = callback;
    if (this.languageTracker) {
      const orig = this.languageTracker['onGrammarFeedback'];
      this.languageTracker.setOnGrammarFeedback((feedback) => {
        orig?.(feedback);
        callback(feedback);
      });
    }
  }

  /**
   * Check if any quests from this NPC are ready to turn in
   */
  private async checkQuestTurnIn(npcId: string, worldId: string) {
    try {
      const response = await fetch(`/api/worlds/${worldId}/quests`);
      if (!response.ok) return;

      const quests = await response.json();
      
      // Find quests assigned by this NPC that are ready to turn in
      // A quest is ready when status is 'active' but all objectives are complete
      const turnInQuests = quests.filter((quest: any) => {
        if (quest.assignedByCharacterId !== npcId) return false;
        if (quest.status !== 'active') return false;
        
        // Check if all objectives are complete
        if (quest.objectives && Array.isArray(quest.objectives)) {
          return quest.objectives.every((obj: any) => obj.isCompleted || obj.completed);
        }
        
        // Check progress-based completion
        if (quest.completionCriteria && quest.progress) {
          return this.isQuestComplete(quest);
        }
        
        return false;
      });

      if (turnInQuests.length > 0) {
        this.pendingTurnInQuests = turnInQuests;
        this.showQuestTurnInDialog(turnInQuests);
      }
    } catch (error) {
      console.error('[BabylonChatPanel] Failed to check quest turn-in:', error);
    }
  }

  /**
   * Check if a quest's progress-based criteria are complete
   */
  private isQuestComplete(quest: any): boolean {
    const criteria = quest.completionCriteria;
    const progress = quest.progress;
    
    if (!criteria || !progress) return false;

    switch (criteria.type) {
      case 'vocabulary_usage':
        return (progress.currentCount || 0) >= (criteria.requiredCount || 10);
      case 'conversation_turns':
        return (progress.turnsCompleted || 0) >= (criteria.requiredTurns || 5);
      case 'grammar_pattern':
        return (progress.currentCount || 0) >= (criteria.requiredCount || 5);
      case 'conversation_engagement':
        return (progress.messagesCount || 0) >= (criteria.requiredMessages || 8);
      default:
        return false;
    }
  }

  /**
   * Show dialog for turning in completed quests
   */
  private showQuestTurnInDialog(quests: any[]) {
    const dialog = new Rectangle('questTurnInDialog');
    dialog.width = '400px';
    dialog.height = `${100 + quests.length * 80}px`;
    dialog.background = 'rgba(20, 60, 100, 0.98)';
    dialog.color = '#4a9eff';
    dialog.thickness = 3;
    dialog.cornerRadius = 15;
    dialog.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    dialog.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    dialog.zIndex = 100;

    const mainStack = new StackPanel();
    mainStack.width = '100%';
    mainStack.paddingTop = '15px';
    mainStack.paddingBottom = '15px';
    dialog.addControl(mainStack);

    // Title
    const title = new TextBlock();
    title.text = '✅ Quest Complete!';
    title.color = '#4aff4a';
    title.fontSize = 22;
    title.fontWeight = 'bold';
    title.height = '35px';
    mainStack.addControl(title);

    // Quest list
    quests.forEach((quest, index) => {
      const questRow = new Rectangle(`turnInQuest_${index}`);
      questRow.width = '90%';
      questRow.height = '70px';
      questRow.background = 'rgba(255, 255, 255, 0.1)';
      questRow.cornerRadius = 8;
      questRow.thickness = 0;
      questRow.paddingTop = '5px';
      questRow.paddingBottom = '5px';
      mainStack.addControl(questRow);

      const questStack = new StackPanel();
      questStack.width = '100%';
      questRow.addControl(questStack);

      const questTitle = new TextBlock();
      questTitle.text = quest.title || 'Untitled Quest';
      questTitle.color = 'white';
      questTitle.fontSize = 16;
      questTitle.fontWeight = 'bold';
      questTitle.height = '25px';
      questTitle.paddingTop = '8px';
      questStack.addControl(questTitle);

      const rewardText = new TextBlock();
      rewardText.text = `🎁 Reward: ${quest.experienceReward || 0} XP`;
      rewardText.color = '#ffd700';
      rewardText.fontSize = 14;
      rewardText.height = '20px';
      questStack.addControl(rewardText);

      const turnInBtn = Button.CreateSimpleButton(`turnIn_${index}`, '📜 Turn In');
      turnInBtn.width = '100px';
      turnInBtn.height = '25px';
      turnInBtn.color = 'white';
      turnInBtn.background = 'rgba(50, 200, 100, 0.9)';
      turnInBtn.cornerRadius = 5;
      turnInBtn.fontSize = 12;
      turnInBtn.onPointerClickObservable.add(() => {
        this.turnInQuest(quest, dialog);
      });
      questStack.addControl(turnInBtn);
    });

    // Close button
    const closeBtn = Button.CreateSimpleButton('closeTurnIn', 'Later');
    closeBtn.width = '100px';
    closeBtn.height = '30px';
    closeBtn.color = 'white';
    closeBtn.background = 'rgba(100, 100, 100, 0.8)';
    closeBtn.cornerRadius = 5;
    closeBtn.fontSize = 14;
    closeBtn.paddingTop = '10px';
    closeBtn.onPointerClickObservable.add(() => {
      this._advancedTexture.removeControl(dialog);
    });
    mainStack.addControl(closeBtn);

    this._advancedTexture.addControl(dialog);
  }

  /**
   * Complete quest turn-in via API
   */
  private async turnInQuest(quest: any, dialog: Rectangle) {
    try {
      const response = await fetch(`/api/quests/${quest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          completedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        // Show completion celebration
        this.showQuestCompletionCelebration(quest);
        
        // Remove dialog
        this._advancedTexture.removeControl(dialog);
        
        // Notify callback
        if (this.onQuestTurnedIn) {
          this.onQuestTurnedIn(quest.id, {
            experienceReward: quest.experienceReward,
            itemRewards: quest.itemRewards,
          });
        }

        // Remove from pending
        this.pendingTurnInQuests = this.pendingTurnInQuests.filter(q => q.id !== quest.id);
      } else {
        console.error('[BabylonChatPanel] Failed to turn in quest');
      }
    } catch (error) {
      console.error('[BabylonChatPanel] Error turning in quest:', error);
    }
  }

  /**
   * Show celebration animation when quest is turned in
   */
  private showQuestCompletionCelebration(quest: any) {
    const celebration = new Rectangle('questCelebration');
    celebration.width = '350px';
    celebration.height = '120px';
    celebration.background = 'rgba(50, 200, 100, 0.95)';
    celebration.color = '#2ecc71';
    celebration.thickness = 3;
    celebration.cornerRadius = 15;
    celebration.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    celebration.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    celebration.zIndex = 200;

    const stack = new StackPanel();
    stack.width = '100%';
    stack.paddingTop = '15px';
    celebration.addControl(stack);

    const emoji = new TextBlock();
    emoji.text = '🎉';
    emoji.fontSize = 40;
    emoji.height = '50px';
    stack.addControl(emoji);

    const titleText = new TextBlock();
    titleText.text = 'Quest Completed!';
    titleText.color = 'white';
    titleText.fontSize = 20;
    titleText.fontWeight = 'bold';
    titleText.height = '30px';
    stack.addControl(titleText);

    const rewardText = new TextBlock();
    rewardText.text = `+${quest.experienceReward || 0} XP`;
    rewardText.color = '#ffd700';
    rewardText.fontSize = 18;
    rewardText.height = '25px';
    stack.addControl(rewardText);

    this._advancedTexture.addControl(celebration);

    // Auto-remove after 2.5 seconds
    setTimeout(() => {
      this._advancedTexture.removeControl(celebration);
    }, 2500);
  }

  /**
   * Parse AI response for quest assignment markers and create quest
   */
  private async parseAndCreateQuest(response: string): Promise<string> {
    const questMatch = response.match(/\*\*QUEST_ASSIGN\*\*[\s\S]*?\*\*END_QUEST\*\*/);

    if (!questMatch || !this.character) {
      return response;
    }

    const questBlock = questMatch[0];
    const titleMatch = questBlock.match(/Title:\s*(.+)/);
    const descMatch = questBlock.match(/Description:\s*(.+)/);
    const typeMatch = questBlock.match(/Type:\s*(\w+)/);
    const difficultyMatch = questBlock.match(/Difficulty:\s*(\w+)/);
    const objectivesMatch = questBlock.match(/Objectives?:\s*(.+)/);
    const rewardsMatch = questBlock.match(/Rewards?:\s*(.+)/);

    if (titleMatch && descMatch && typeMatch && difficultyMatch) {
      try {
        // Determine experience reward based on difficulty
        let experienceReward = 50;
        const difficulty = difficultyMatch[1].trim().toLowerCase();

        // Language learning difficulties
        if (difficulty === 'beginner') experienceReward = 10;
        else if (difficulty === 'intermediate') experienceReward = 25;
        else if (difficulty === 'advanced') experienceReward = 50;
        // RPG difficulties
        else if (difficulty === 'easy') experienceReward = 50;
        else if (difficulty === 'normal') experienceReward = 100;
        else if (difficulty === 'hard') experienceReward = 200;
        else if (difficulty === 'legendary') experienceReward = 500;

        // Parse objectives from the quest block
        const parsedObjectives: { description: string; type?: string }[] = [];
        if (objectivesMatch) {
          const objText = objectivesMatch[1].trim();
          // Split by comma, semicolon, or numbered list
          const parts = objText.split(/[;,]|\d+\.\s+/).filter(p => p.trim());
          for (const part of parts) {
            parsedObjectives.push({ description: part.trim() });
          }
        }

        const questData = {
          assignedTo: 'Player',
          assignedBy: `${this.character.firstName} ${this.character.lastName}`,
          assignedByCharacterId: this.character.id,
          title: titleMatch[1].trim(),
          description: descMatch[1].trim(),
          questType: typeMatch[1].trim().toLowerCase(),
          difficulty: difficulty,
          targetLanguage: this.world?.targetLanguage || 'English',
          conversationContext: response,
          status: 'active',
          experienceReward,
          gameType: this.world?.gameType || this.world?.worldType || 'language-learning',
          objectives: parsedObjectives.length > 0 ? parsedObjectives : undefined,
          rewards: rewardsMatch ? rewardsMatch[1].trim() : undefined,
        };

        // Create the quest via API
        const createResponse = await fetch(`/api/worlds/${this.character.worldId}/quests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(questData)
        });

        if (createResponse.ok) {
          const createdQuest = await createResponse.json();
          console.log('[BabylonChatPanel] Quest created:', createdQuest);

          // Notify quest assigned callback
          if (this.onQuestAssigned) {
            this.onQuestAssigned(createdQuest);
          }

          // Show notification in chat
          this.showQuestNotification(titleMatch[1].trim());
        }
      } catch (error) {
        console.error('[BabylonChatPanel] Failed to create quest:', error);
      }
    }

    // Return response with quest markers removed
    const cleanedResponse = response.replace(/\*\*QUEST_ASSIGN\*\*[\s\S]*?\*\*END_QUEST\*\*/, '').trim();
    return cleanedResponse || "I've assigned you a new quest! Check your quest log to see the details.";
  }

  /**
   * Show a visual notification when a quest is assigned
   */
  private showQuestNotification(questTitle: string) {
    // Create a temporary notification panel
    const notification = new Rectangle('questNotification');
    notification.width = '300px';
    notification.height = '60px';
    notification.background = 'rgba(50, 200, 100, 0.95)';
    notification.color = 'white';
    notification.thickness = 2;
    notification.cornerRadius = 10;
    notification.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    notification.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    notification.top = '80px';

    const notifStack = new StackPanel();
    notifStack.width = '100%';
    notification.addControl(notifStack);

    const titleText = new TextBlock();
    titleText.text = '📜 New Quest!';
    titleText.color = 'white';
    titleText.fontSize = 16;
    titleText.fontWeight = 'bold';
    titleText.height = '25px';
    titleText.paddingTop = '8px';
    notifStack.addControl(titleText);

    const questText = new TextBlock();
    questText.text = questTitle;
    questText.color = 'white';
    questText.fontSize = 14;
    questText.height = '25px';
    questText.textWrapping = TextWrapping.Ellipsis;
    notifStack.addControl(questText);

    this._advancedTexture.addControl(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      this._advancedTexture.removeControl(notification);
    }, 3000);
  }

  /**
   * Set available dialogue actions for the current conversation
   */
  public setDialogueActions(actions: Action[], playerEnergy: number) {
    this.availableActions = actions;
    this.playerEnergy = playerEnergy;

    if (this.isVisible && this.actionsContainer && actions.length > 0) {
      if (!this.dialogueActions) {
        this.dialogueActions = new BabylonDialogueActions();
      }

      this.dialogueActions.show(
        this.actionsContainer,
        actions,
        playerEnergy,
        (actionId: string) => {
          this.onActionSelect?.(actionId);
        }
      );
    }
  }

  /**
   * Update dialogue actions (e.g., when player energy changes)
   */
  public updateDialogueActions(playerEnergy: number) {
    this.playerEnergy = playerEnergy;
    if (this.dialogueActions && this.dialogueActions.isVisible()) {
      this.dialogueActions.update(this.availableActions, playerEnergy);
    }
  }

  public dispose() {
    this.stopAllAudio();
    if (this.dialogueActions) {
      this.dialogueActions.hide();
      this.dialogueActions = null;
    }
    if (this.talkingIndicator) {
      this.talkingIndicator.dispose();
      this.talkingIndicator = null;
    }
    if (this._scrollAnimFrame !== null) {
      cancelAnimationFrame(this._scrollAnimFrame);
      this._scrollAnimFrame = null;
    }
    this._messageControls.clear();
    if (this.chatContainer) {
      this._advancedTexture.removeControl(this.chatContainer);
    }
    // Remove resize listener
    window.removeEventListener('resize', this.handleResize);
  }
}
