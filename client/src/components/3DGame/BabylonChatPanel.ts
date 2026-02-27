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
import { buildGreeting, buildLanguageAwareSystemPrompt, extractLanguageFluencies, getLanguageBCP47 } from "@shared/language-utils";
import type { WorldLanguageContext } from "@shared/language-utils";
import { LanguageProgressTracker } from "./LanguageProgressTracker";

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
  private advancedTexture: AdvancedDynamicTexture;
  private scene: Scene;
  private chatContainer: Rectangle | null = null;
  private messagesPanel: StackPanel | null = null;
  private inputText: InputText | null = null;
  private character: Character | null = null;
  private truths: Truth[] = [];
  private world: World | null = null;
  private worldLanguageContext: WorldLanguageContext | null = null;
  private languageTracker: LanguageProgressTracker | null = null;
  private messages: Message[] = [];
  private isVisible = false;

  // Audio
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private isRecording = false;
  private isProcessing = false;
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
  private pendingTurnInQuests: any[] = [];

  constructor(advancedTexture: AdvancedDynamicTexture, scene: Scene) {
    this.advancedTexture = advancedTexture;
    this.scene = scene;
    this.talkingIndicator = new NPCTalkingIndicator(scene);
  }

  public show(character: Character, truths: Truth[], npcMesh?: Mesh) {
    this.character = character;
    this.truths = truths;
    this.npcMesh = npcMesh || null;
    this.isVisible = true;

    // Notify that conversation started with this NPC (for quest tracking)
    if (this.onNPCConversationStarted) {
      this.onNPCConversationStarted(character.id);
    }

    // Fetch world data for context
    this.fetchWorldData(character.worldId);

    // Check for quests ready to turn in from this NPC
    this.checkQuestTurnIn(character.id, character.worldId);

    if (this.chatContainer) {
      this.chatContainer.isVisible = true;
      this.initializeChat(truths);
      return;
    }

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
        const primary = languages.find((l: any) => l.isPrimary) || null;
        this.worldLanguageContext = {
          targetLanguage: this.world?.targetLanguage || 'English',
          worldLanguages: languages,
          primaryLanguage: primary,
          gameType: this.world?.gameType || this.world?.worldType,
        };
      }
    } catch (error) {
      console.error('Failed to fetch world data:', error);
    }
  }

  public hide() {
    this.isVisible = false;
    if (this.chatContainer) {
      this.chatContainer.isVisible = false;
    }
    if (this.dialogueActions) {
      this.dialogueActions.hide();
    }
    // End language tracking conversation and log results
    if (this.languageTracker) {
      const result = this.languageTracker.endConversation();
      if (result && result.gain > 0) {
        console.log(`[LanguageTracker] Fluency: ${result.previousFluency.toFixed(1)} → ${result.newFluency.toFixed(1)} (+${result.gain.toFixed(2)})`);
        if (result.bonuses.length > 0) {
          console.log(`[LanguageTracker] Bonuses: ${result.bonuses.join(', ')}`);
        }
      }
    }
    // Hide talking indicator
    if (this.talkingIndicator && this.character) {
      this.talkingIndicator.hide(this.character.id);
    }
    this.stopAllAudio();
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

    // Initialize language progress tracker if world has a target language
    if (this.world?.targetLanguage && this.world.targetLanguage !== 'English') {
      this.languageTracker = new LanguageProgressTracker(
        'player',
        this.character.worldId,
        this.world.targetLanguage
      );
      if (this.worldLanguageContext) {
        this.languageTracker.setWorldLanguageContext(this.worldLanguageContext);
      }
      this.languageTracker.startConversation(this.character.id, `${this.character.firstName} ${this.character.lastName}`);
      this.languageTracker.setOnNewWordLearned((entry) => {
        console.log(`[LanguageTracker] New word learned: ${entry.word} (${entry.meaning})`);
      });
      this.languageTracker.setOnWordMastered((entry) => {
        console.log(`[LanguageTracker] Word mastered: ${entry.word}!`);
      });
    }

    // Build greeting dynamically based on all language fluencies
    const greeting = buildGreeting(this.character, truths, this.world?.targetLanguage);

    this.messages = [{
      role: 'assistant',
      content: greeting,
      timestamp: new Date()
    }];

    this.updateMessagesDisplay();
  }

  private createChatUI() {
    // Main container
    this.chatContainer = new Rectangle("chatContainer");
    this.chatContainer.width = "600px";
    this.chatContainer.height = "500px";
    this.chatContainer.background = "rgba(0, 0, 0, 0.95)";
    this.chatContainer.color = "white";
    this.chatContainer.thickness = 2;
    this.chatContainer.cornerRadius = 10;
    this.chatContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.chatContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

    const mainStack = new StackPanel();
    mainStack.width = "100%";
    mainStack.height = "100%";
    this.chatContainer.addControl(mainStack);

    // Header
    const header = new Rectangle("chatHeader");
    header.width = "100%";
    header.height = "60px";
    header.background = "rgba(30, 30, 30, 0.9)";
    header.thickness = 0;
    mainStack.addControl(header);

    const headerStack = new StackPanel();
    headerStack.width = "100%";
    headerStack.paddingTop = "10px";
    header.addControl(headerStack);

    const titleText = new TextBlock();
    titleText.text = this.character ? `💬 ${this.character.firstName} ${this.character.lastName}` : "Chat";
    titleText.color = "white";
    titleText.fontSize = 20;
    titleText.height = "30px";
    titleText.fontWeight = "bold";
    headerStack.addControl(titleText);

    const subtitleText = new TextBlock();
    subtitleText.text = "Press TAB to toggle voice mode";
    subtitleText.color = "#888";
    subtitleText.fontSize = 12;
    subtitleText.height = "20px";
    headerStack.addControl(subtitleText);

    // Close button
    const closeBtn = Button.CreateSimpleButton("closeChat", "✕");
    closeBtn.width = "40px";
    closeBtn.height = "40px";
    closeBtn.color = "white";
    closeBtn.background = "rgba(255, 50, 50, 0.8)";
    closeBtn.cornerRadius = 5;
    closeBtn.fontSize = 20;
    closeBtn.top = "10px";
    closeBtn.left = "-10px";
    closeBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    closeBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    closeBtn.onPointerClickObservable.add(() => {
      this.hide();
      this.onClose?.();
    });
    header.addControl(closeBtn);

    // Messages scroll area
    const scrollViewer = new ScrollViewer("chatScroll");
    scrollViewer.width = "100%";
    scrollViewer.height = "240px";
    scrollViewer.paddingTop = "10px";
    scrollViewer.paddingBottom = "10px";
    scrollViewer.background = "rgba(20, 20, 20, 0.5)";
    mainStack.addControl(scrollViewer);

    this.messagesPanel = new StackPanel("messagesPanel");
    this.messagesPanel.width = "100%";
    scrollViewer.addControl(this.messagesPanel);

    // Actions container (for dialogue actions)
    this.actionsContainer = new Container("actionsContainer");
    this.actionsContainer.width = "100%";
    this.actionsContainer.height = "100px";
    this.actionsContainer.background = "transparent";
    this.actionsContainer.paddingLeft = "10px";
    this.actionsContainer.paddingRight = "10px";
    mainStack.addControl(this.actionsContainer);

    // Input area
    const inputContainer = new Rectangle("inputContainer");
    inputContainer.width = "100%";
    inputContainer.height = "100px";
    inputContainer.background = "rgba(30, 30, 30, 0.9)";
    inputContainer.thickness = 0;
    mainStack.addControl(inputContainer);

    const inputStack = new StackPanel();
    inputStack.isVertical = false;
    inputStack.width = "100%";
    inputStack.height = "100%";
    inputStack.paddingLeft = "10px";
    inputStack.paddingRight = "10px";
    inputStack.paddingTop = "10px";
    inputStack.paddingBottom = "10px";
    inputContainer.addControl(inputStack);

    // Text input
    this.inputText = new InputText("chatInput");
    this.inputText.width = "480px";
    this.inputText.height = "80px";
    this.inputText.color = "white";
    this.inputText.background = "rgba(50, 50, 50, 0.8)";
    this.inputText.placeholderText = "Type your message...";
    this.inputText.placeholderColor = "#666";
    this.inputText.fontSize = 14;
    this.inputText.paddingLeft = "10px";
    this.inputText.paddingRight = "10px";
    this.inputText.onTextChangedObservable.add(() => {
      // Auto-resize not needed for Babylon GUI
    });
    inputStack.addControl(this.inputText);

    // Buttons container
    const buttonsStack = new StackPanel();
    buttonsStack.width = "100px";
    buttonsStack.paddingLeft = "10px";
    inputStack.addControl(buttonsStack);

    // Mic button
    const micBtn = Button.CreateSimpleButton("micBtn", "🎤");
    micBtn.width = "100%";
    micBtn.height = "35px";
    micBtn.color = "white";
    micBtn.background = this.isRecording ? "rgba(255, 50, 50, 0.8)" : "rgba(60, 60, 60, 0.8)";
    micBtn.cornerRadius = 5;
    micBtn.fontSize = 16;
    micBtn.paddingBottom = "5px";
    micBtn.onPointerClickObservable.add(() => {
      if (this.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    });
    buttonsStack.addControl(micBtn);

    // Send button
    const sendBtn = Button.CreateSimpleButton("sendBtn", "📤 Send");
    sendBtn.width = "100%";
    sendBtn.height = "35px";
    sendBtn.color = "white";
    sendBtn.background = "rgba(30, 150, 255, 0.8)";
    sendBtn.cornerRadius = 5;
    sendBtn.fontSize = 14;
    sendBtn.paddingTop = "5px";
    sendBtn.onPointerClickObservable.add(() => {
      this.sendMessage();
    });
    buttonsStack.addControl(sendBtn);

    this.advancedTexture.addControl(this.chatContainer);
  }

  private updateMessagesDisplay() {
    if (!this.messagesPanel) return;

    this.messagesPanel.clearControls();

    this.messages.forEach((message, index) => {
      const messageContainer = new Rectangle(`msg-${index}`);
      messageContainer.width = "95%";
      messageContainer.height = "auto";
      messageContainer.thickness = 0;
      messageContainer.paddingTop = "5px";
      messageContainer.paddingBottom = "5px";
      messageContainer.horizontalAlignment = message.role === 'user'
        ? Control.HORIZONTAL_ALIGNMENT_RIGHT
        : Control.HORIZONTAL_ALIGNMENT_LEFT;

      const messageBubble = new Rectangle(`bubble-${index}`);
      messageBubble.width = "80%";
      messageBubble.adaptHeightToChildren = true;
      messageBubble.background = message.role === 'user' ? "rgba(30, 150, 255, 0.9)" : "rgba(60, 60, 60, 0.9)";
      messageBubble.cornerRadius = 10;
      messageBubble.thickness = 0;
      messageBubble.paddingTop = "10px";
      messageBubble.paddingBottom = "10px";
      messageBubble.paddingLeft = "15px";
      messageBubble.paddingRight = "15px";
      messageBubble.horizontalAlignment = message.role === 'user'
        ? Control.HORIZONTAL_ALIGNMENT_RIGHT
        : Control.HORIZONTAL_ALIGNMENT_LEFT;
      messageContainer.addControl(messageBubble);

      const messageStack = new StackPanel();
      messageStack.width = "100%";
      messageBubble.addControl(messageStack);

      const messageText = new TextBlock();
      messageText.text = message.content;
      messageText.color = "white";
      messageText.fontSize = 14;
      messageText.textWrapping = TextWrapping.WordWrap;
      messageText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      messageText.resizeToFit = true;
      messageStack.addControl(messageText);

      const timeText = new TextBlock();
      timeText.text = message.timestamp.toLocaleTimeString();
      timeText.color = "rgba(255, 255, 255, 0.6)";
      timeText.fontSize = 10;
      timeText.height = "15px";
      timeText.textHorizontalAlignment = message.role === 'user'
        ? Control.HORIZONTAL_ALIGNMENT_RIGHT
        : Control.HORIZONTAL_ALIGNMENT_LEFT;
      timeText.paddingTop = "5px";
      messageStack.addControl(timeText);

      this.messagesPanel!.addControl(messageContainer);
    });

    // Scroll to bottom (not directly possible in Babylon GUI, but we add new messages at bottom)
  }

  private async sendMessage() {
    if (!this.inputText || !this.character || this.isProcessing) return;

    const userMessage = this.inputText.text.trim();
    if (!userMessage) return;

    this.inputText.text = "";
    this.isProcessing = true;

    // Add user message
    this.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });
    this.updateMessagesDisplay();

    try {
      // Send to Gemini API
      const aiResponse = await this.sendToGemini(userMessage);

      // Parse and create quest if present in response
      let cleanedResponse = await this.parseAndCreateQuest(aiResponse);

      // Parse grammar feedback for language-learning games only
      const isLanguageLearning = this.world?.gameType === 'language-learning' ||
                                 this.world?.gameType === 'educational' ||
                                 this.world?.worldType === 'language-learning' ||
                                 this.world?.worldType === 'educational';

      if (this.languageTracker) {
        if (isLanguageLearning) {
          const { feedback, cleanedResponse: afterGrammarClean } =
            this.languageTracker.parseGrammarFeedback(cleanedResponse);
          cleanedResponse = afterGrammarClean;

          if (feedback) {
            this.languageTracker.recordGrammarFeedback(feedback);

            if (feedback.status === 'corrected' && feedback.errors.length > 0) {
              console.log(`[LanguageTracker] Grammar corrections: ${feedback.errors.length}`);
              feedback.errors.forEach(err => {
                console.log(`  - ${err.pattern}: "${err.incorrect}" -> "${err.corrected}"`);
              });
            } else if (feedback.status === 'correct') {
              console.log('[LanguageTracker] Grammar: correct!');
            }
          }
        }

        // Analyze vocabulary usage
        this.languageTracker.analyzePlayerMessage(userMessage);
        this.languageTracker.analyzeNPCResponse(cleanedResponse);
      }

      // Add AI response (with quest and grammar markers removed)
      this.messages.push({
        role: 'assistant',
        content: cleanedResponse,
        timestamp: new Date()
      });
      this.updateMessagesDisplay();

      // Track vocabulary usage for quests
      this.trackQuestProgress(userMessage, cleanedResponse);

      // Convert to speech and play (without markers)
      await this.textToSpeech(cleanedResponse);

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

  private async sendToGemini(userMessage: string): Promise<string> {
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
        maxTokens: 2048
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from AI');
    }

    const data = await response.json();
    return data.response;
  }

  private buildSystemPrompt(): string {
    if (!this.character) return '';
    return buildLanguageAwareSystemPrompt(
      this.character,
      this.truths,
      this.worldLanguageContext || undefined
    );
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

  private async playAudio(audioBlob: Blob) {
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
    };

    await audio.play();
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
        try {
          const transcript = await this.speechToText(audioBlob);
          if (this.inputText) {
            this.inputText.text = transcript;
          }
          await this.sendMessage();
        } catch (error) {
          console.error('Speech to text error:', error);
        } finally {
          this.isProcessing = false;
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (error) {
      console.error('Microphone error:', error);
    }
  }

  private stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
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

  public setOnQuestTurnedIn(callback: (questId: string, rewards: any) => void) {
    this.onQuestTurnedIn = callback;
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
      this.advancedTexture.removeControl(dialog);
    });
    mainStack.addControl(closeBtn);

    this.advancedTexture.addControl(dialog);
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
        this.advancedTexture.removeControl(dialog);
        
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

    this.advancedTexture.addControl(celebration);

    // Auto-remove after 2.5 seconds
    setTimeout(() => {
      this.advancedTexture.removeControl(celebration);
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

    this.advancedTexture.addControl(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      this.advancedTexture.removeControl(notification);
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
    if (this.chatContainer) {
      this.advancedTexture.removeControl(this.chatContainer);
    }
  }
}
