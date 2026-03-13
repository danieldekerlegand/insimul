import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Send, Volume2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { buildGreeting, buildLanguageAwareSystemPrompt, extractLanguageFluencies, getLanguageBCP47 } from '@shared/language/language-utils';
import type { WorldLanguageContext } from '@shared/language/language-utils';
import { buildWorldLanguageContext } from '@shared/language/language-utils';
import { parseGrammarFeedbackBlock } from '@shared/language/language-progress';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { processRecordedAudio } from '@/lib/audio-utils';

export interface Character {
  id: string;
  firstName: string;
  lastName: string;
  age: number | null;
  gender: string;
  occupation: string | null;
  personality: Record<string, any>;
  [key: string]: any;
}

interface Truth {
  id: string;
  title: string;
  content: string;
  entryType: string;
  timestep: number;
  [key: string]: any;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CharacterChatDialogProps {
  character: Character | null;
  truths: Truth[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CharacterChatDialog({ character, truths, open, onOpenChange }: CharacterChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [worldLangContext, setWorldLangContext] = useState<WorldLanguageContext | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingSendRef = useRef(false);

  // Determine speech recognition language from world context
  const sttLang = worldLangContext?.targetLanguage
    ? getLanguageBCP47(worldLangContext.targetLanguage)
    : 'en-US';

  const {
    isListening: isRecording,
    interimTranscript,
    finalTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ lang: sttLang });

  // When final transcript arrives, populate input and auto-send
  useEffect(() => {
    if (finalTranscript && !pendingSendRef.current) {
      setInputText(finalTranscript);
      pendingSendRef.current = true;
    }
  }, [finalTranscript]);

  // Show interim results while speaking
  useEffect(() => {
    if (isRecording && interimTranscript) {
      setInputText(interimTranscript);
    }
  }, [isRecording, interimTranscript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && character) {
      // Fetch world language context
      if (character.worldId) {
        Promise.all([
          fetch(`/api/worlds/${character.worldId}`).then(r => r.ok ? r.json() : null),
          fetch(`/api/worlds/${character.worldId}/languages`).then(r => r.ok ? r.json() : []),
        ]).then(([world, languages]) => {
          setWorldLangContext(buildWorldLanguageContext(
            languages,
            world?.gameType || world?.worldType,
            world?.targetLanguage,
          ));
        }).catch(err => console.error('Failed to fetch world language context:', err));
      }

      // Build greeting dynamically based on all language fluencies
      const greeting = buildGreeting(character, truths);
      
      setMessages([{
        role: 'assistant',
        content: greeting,
        timestamp: new Date()
      }]);
    } else {
      setMessages([]);
      setInputText('');
    }
  }, [open, character, truths]);

  const buildSystemPrompt = () => {
    if (!character) return '';
    return buildLanguageAwareSystemPrompt(character, truths, worldLangContext || undefined);
  };

  const buildConversationHistory = (userMessage: string) => {
    const conversationHistory = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    conversationHistory.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });
    return conversationHistory;
  };

  const sendMessageToGemini = async (userMessage: string): Promise<string> => {
    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt: buildSystemPrompt(),
        messages: buildConversationHistory(userMessage),
        temperature: 0.8,
        maxTokens: 2048
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Failed to get response from Gemini (${response.status})`);
    }

    return await response.json();
  };

  /**
   * Stream a response from Gemini via SSE. Calls onChunk with each text chunk
   * and returns the full raw response for post-processing.
   */
  const sendMessageStreaming = async (
    userMessage: string,
    onChunk: (chunk: string) => void
  ): Promise<string> => {
    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt: buildSystemPrompt(),
        messages: buildConversationHistory(userMessage),
        temperature: 0.8,
        maxTokens: 2048,
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Failed to get response from Gemini (${response.status})`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response stream available');

    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      // Keep the last potentially incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6);
        if (payload === '[DONE]') continue;

        try {
          const event = JSON.parse(payload);
          if (event.type === 'chunk' && event.text) {
            onChunk(event.text);
          } else if (event.type === 'sentence' && event.text) {
            onChunk(event.text);
          } else if (event.type === 'done') {
            fullResponse = event.response;
          } else if (event.type === 'error') {
            throw new Error(event.error);
          }
        } catch (e) {
          if (e instanceof SyntaxError) continue; // skip malformed JSON
          throw e;
        }
      }
    }

    return fullResponse;
  };

  /** Single-call native audio chat: sends audio/text to Gemini, gets text + audio back */
  const sendNativeAudioChat = async (
    options: { audioData?: string; textMessage?: string }
  ): Promise<{ response: string; cleanedResponse: string; audio?: string; audioMimeType?: string }> => {
    const systemPrompt = buildSystemPrompt();
    const history = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch('/api/gemini/native-audio-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...options,
        systemPrompt,
        history,
        voice: character?.gender === 'female' ? 'Kore' : 'Charon',
        temperature: 0.8,
        maxTokens: 2048,
        returnAudio: true,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Native audio chat failed (${response.status})`);
    }

    return response.json();
  };

  const textToSpeech = async (text: string): Promise<Blob> => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: character?.gender === 'female' ? 'Kore' : 'Charon',
          gender: character?.gender || 'neutral'
        })
      });

      if (!response.ok) {
        console.warn('Server TTS failed, falling back to browser TTS');
        // Fallback to browser's Web Speech API
        return await browserTextToSpeech(text);
      }

      return await response.blob();
    } catch (error) {
      console.warn('TTS error, using browser fallback:', error);
      return await browserTextToSpeech(text);
    }
  };

  const browserTextToSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const fluencies = extractLanguageFluencies(truths);
    const dominantLang = fluencies[0]?.language || 'English';
    const langCode = getLanguageBCP47(dominantLang);
    utterance.lang = langCode;
    utterance.rate = 0.9;
    const voices = speechSynthesis.getVoices();
    const langPrefix = langCode.split('-')[0];
    const matchedVoice = voices.find(v => v.lang.startsWith(langPrefix));
    if (matchedVoice) utterance.voice = matchedVoice;
    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  const playAudio = async (audioBlob: Blob) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    setIsSpeaking(true);
    audio.onended = () => {
      setIsSpeaking(false);
      URL.revokeObjectURL(audioUrl);
    };

    await audio.play();
  };

  const parseAndCreateQuest = async (response: string): Promise<string> => {
    // Check if response contains a quest assignment
    const questMatch = response.match(/\*\*QUEST_ASSIGN\*\*[\s\S]*?\*\*END_QUEST\*\*/);

    if (!questMatch || !character) {
      return response;
    }

    const questBlock = questMatch[0];
    const titleMatch = questBlock.match(/Title:\s*(.+)/);
    const descMatch = questBlock.match(/Description:\s*(.+)/);
    const typeMatch = questBlock.match(/Type:\s*(\w+)/);
    const difficultyMatch = questBlock.match(/Difficulty:\s*(\w+)/);

    if (titleMatch && descMatch && typeMatch && difficultyMatch) {
      try {
        // Fetch world to determine game type
        const worldResponse = await fetch(`/api/worlds/${character.worldId}`);
        const world = await worldResponse.json();

        // Determine experience reward based on difficulty and game type
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

        // Create the quest with proper game type handling
        await fetch(`/api/worlds/${character.worldId}/quests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assignedTo: 'Player', // Default player name
            assignedBy: `${character.firstName} ${character.lastName}`,
            assignedByCharacterId: character.id,
            title: titleMatch[1].trim(),
            description: descMatch[1].trim(),
            questType: typeMatch[1].trim().toLowerCase(),
            difficulty: difficulty,
            targetLanguage: world.targetLanguage || 'English',
            conversationContext: response,
            status: 'active',
            experienceReward,
            gameType: world.gameType || world.worldType || 'language-learning',
          })
        });

        toast({
          title: 'New Quest Assigned!',
          description: `${character.firstName} has assigned you: "${titleMatch[1].trim()}"`,
        });
      } catch (error) {
        console.error('Failed to create quest:', error);
        toast({
          title: 'Quest Assignment Failed',
          description: 'Could not create quest. Please try again.',
          variant: 'destructive',
        });
      }
    }

    // Return response with quest markers removed for display
    const cleanedResponse = response.replace(/\*\*QUEST_ASSIGN\*\*[\s\S]*?\*\*END_QUEST\*\*/, '').trim();

    // If the response is empty after removing quest markers, return a default message
    if (!cleanedResponse) {
      return "I've assigned you a new quest! Check the Quests tab to see the details.";
    }

    return cleanedResponse;
  };

  const createAutomaticQuest = async (userMessage: string, characterResponse: string) => {
    if (!character) return;

    // Extract key words and phrases from the conversation
    const conversationText = `${userMessage} ${characterResponse}`;

    // Determine quest type based on conversation content
    let questType = 'vocabulary';
    let title = '';
    let description = '';
    let completionCriteria: Record<string, any> = {};
    let progress: Record<string, any> = {};

    // Check for questions about location
    if (conversationText.match(/où|where|bibliothèque|library|restaurant|café|magasin|store/i)) {
      questType = 'vocabulary';
      title = 'Learn Location Vocabulary';
      description = 'Practice asking for and giving directions to common places in French';
      completionCriteria = {
        type: 'vocabulary_usage',
        category: 'locations',
        targetWords: ['bibliothèque', 'restaurant', 'café', 'magasin', 'parc', 'école', 'hôtel', 'gare', 'banque', 'musée'],
        requiredCount: 10,
        description: 'Use 10 different location-related vocabulary words in conversation'
      };
      progress = {
        wordsUsed: [],
        currentCount: 0
      };
    }
    // Check for greetings
    else if (conversationText.match(/bonjour|hello|salut|comment|ça va|how are you/i)) {
      questType = 'conversation';
      title = 'Master French Greetings';
      description = 'Practice common French greetings and polite expressions';
      completionCriteria = {
        type: 'conversation_turns',
        requiredTurns: 5,
        keywords: ['bonjour', 'bonsoir', 'au revoir', 'merci', 's\'il vous plaît', 'comment allez-vous'],
        description: 'Complete 5 conversation exchanges using polite French greetings'
      };
      progress = {
        turnsCompleted: 0,
        keywordsUsed: []
      };
    }
    // Check for questions
    else if (conversationText.match(/\?|pourquoi|comment|quand|qui|what|why|how|when|who/i)) {
      questType = 'grammar';
      title = 'Form Questions in French';
      description = 'Learn to ask questions using French question words and inversion';
      completionCriteria = {
        type: 'grammar_pattern',
        patterns: ['pourquoi', 'comment', 'quand', 'où', 'qui', 'que', 'quel'],
        requiredCount: 5,
        description: 'Ask 5 questions using different French question words'
      };
      progress = {
        patternsUsed: [],
        currentCount: 0
      };
    }
    // Check for past/future tense
    else if (conversationText.match(/était|été|sera|will|was|yesterday|tomorrow|hier|demain/i)) {
      questType = 'grammar';
      title = 'Practice French Verb Tenses';
      description = 'Learn to use past and future tenses in French conversation';
      completionCriteria = {
        type: 'grammar_tenses',
        tenses: ['passé composé', 'imparfait', 'futur simple'],
        requiredCount: 3,
        description: 'Use past or future tense verbs in 3 different sentences'
      };
      progress = {
        tensesUsed: [],
        sentenceCount: 0
      };
    }
    // Check for food-related vocabulary
    else if (conversationText.match(/manger|nourriture|pain|fromage|viande|légume|fruit|eat|food|bread|cheese|meat|vegetable|fruit/i)) {
      questType = 'vocabulary';
      title = 'Food Vocabulary Practice';
      description = 'Learn and use French food-related vocabulary';
      completionCriteria = {
        type: 'vocabulary_usage',
        category: 'food',
        targetWords: ['pain', 'fromage', 'viande', 'poisson', 'légume', 'fruit', 'eau', 'café', 'thé', 'vin'],
        requiredCount: 10,
        description: 'Use 10 different food-related vocabulary words in conversation'
      };
      progress = {
        wordsUsed: [],
        currentCount: 0
      };
    }
    // Default: vocabulary from the conversation
    else {
      questType = 'vocabulary';
      title = 'Expand Your French Vocabulary';
      description = `Practice words and phrases from your conversation with ${character.firstName}`;
      completionCriteria = {
        type: 'conversation_engagement',
        requiredMessages: 8,
        description: 'Continue the conversation with 8 meaningful messages'
      };
      progress = {
        messagesCount: 0
      };
    }

    try {
      await fetch(`/api/worlds/${character.worldId}/quests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedTo: 'Player',
          assignedBy: `${character.firstName} ${character.lastName}`,
          assignedByCharacterId: character.id,
          title: title,
          description: description,
          questType: questType,
          difficulty: 'beginner',
          targetLanguage: worldLangContext?.targetLanguage || 'English',
          conversationContext: `User: ${userMessage}\n${character.firstName}: ${characterResponse}`,
          status: 'active',
          experienceReward: 10,
          completionCriteria: completionCriteria,
          progress: progress
        })
      });

      console.log('Automatic quest created:', title);
    } catch (error) {
      console.error('Failed to create automatic quest:', error);
    }
  };

  const updateQuestProgress = async (userMessage: string) => {
    if (!character) return;

    try {
      // Fetch active quests for this character
      const response = await fetch(`/api/worlds/${character.worldId}/quests`);
      if (!response.ok) return;

      const allQuests = await response.json();
      const activeQuests = allQuests.filter((q: any) =>
        q.status === 'active' && q.assignedByCharacterId === character.id
      );

      for (const quest of activeQuests) {
        if (!quest.completionCriteria || !quest.progress) continue;

        const criteria = quest.completionCriteria;
        let progress = { ...quest.progress };
        let updated = false;
        let completed = false;

        const messageLower = userMessage.toLowerCase();

        switch (criteria.type) {
          case 'vocabulary_usage':
            // Check if user message contains any target words
            if (criteria.targetWords) {
              const newWords = criteria.targetWords.filter((word: string) =>
                messageLower.includes(word.toLowerCase()) &&
                !progress.wordsUsed?.includes(word)
              );

              if (newWords.length > 0) {
                progress.wordsUsed = [...(progress.wordsUsed || []), ...newWords];
                progress.currentCount = progress.wordsUsed.length;
                updated = true;

                if (progress.currentCount >= criteria.requiredCount) {
                  completed = true;
                }
              }
            }
            break;

          case 'conversation_turns':
            progress.turnsCompleted = (progress.turnsCompleted || 0) + 1;

            // Check for keywords
            if (criteria.keywords) {
              const newKeywords = criteria.keywords.filter((keyword: string) =>
                messageLower.includes(keyword.toLowerCase()) &&
                !progress.keywordsUsed?.includes(keyword)
              );
              if (newKeywords.length > 0) {
                progress.keywordsUsed = [...(progress.keywordsUsed || []), ...newKeywords];
              }
            }

            updated = true;
            if (progress.turnsCompleted >= criteria.requiredTurns) {
              completed = true;
            }
            break;

          case 'grammar_pattern':
            // Check for question patterns
            if (criteria.patterns) {
              const newPatterns = criteria.patterns.filter((pattern: string) =>
                messageLower.includes(pattern.toLowerCase()) &&
                !progress.patternsUsed?.includes(pattern)
              );

              if (newPatterns.length > 0) {
                progress.patternsUsed = [...(progress.patternsUsed || []), ...newPatterns];
                progress.currentCount = progress.patternsUsed.length;
                updated = true;

                if (progress.currentCount >= criteria.requiredCount) {
                  completed = true;
                }
              }
            }
            break;

          case 'conversation_engagement':
            progress.messagesCount = (progress.messagesCount || 0) + 1;
            updated = true;

            if (progress.messagesCount >= criteria.requiredMessages) {
              completed = true;
            }
            break;
        }

        // Update quest if progress changed
        if (updated) {
          await fetch(`/api/quests/${quest.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              progress,
              status: completed ? 'completed' : 'active',
              completedAt: completed ? new Date() : null
            })
          });

          if (completed) {
            toast({
              title: 'Quest Completed! 🎉',
              description: `You've completed: ${quest.title}`,
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to update quest progress:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsProcessing(true);

    // Add user message
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Update quest progress based on user message
      await updateQuestProgress(userMessage);

      // Add a placeholder assistant message that will be updated as chunks stream in
      const placeholderMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, placeholderMessage]);

      // Stream the AI response, updating the placeholder message with each chunk
      const aiResponse = await sendMessageStreaming(userMessage, (chunk) => {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: last.content + chunk };
          }
          return updated;
        });
      });

      // Parse and create quest if present
      const afterQuestClean = await parseAndCreateQuest(aiResponse);

      // Strip grammar feedback markers for language-learning games
      const isLangLearning = worldLangContext?.gameType === 'language-learning' ||
                             worldLangContext?.gameType === 'educational';
      const { cleanedResponse: displayResponse } = isLangLearning
        ? parseGrammarFeedbackBlock(afterQuestClean)
        : { cleanedResponse: afterQuestClean };

      // Update the streamed message with the cleaned version (markers removed)
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === 'assistant') {
          updated[updated.length - 1] = { ...last, content: displayResponse };
        }
        return updated;
      });

      // Convert to speech and play (without markers)
      try {
        const responseAudioBlob = await textToSpeech(displayResponse);
        await playAudio(responseAudioBlob);
      } catch {
        browserTextToSpeech(displayResponse);
      }

      // Automatically create a quest based on the conversation
      await createAutomaticQuest(userMessage, displayResponse);

    } catch (error) {
      // Remove empty placeholder message on error
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant' && !last.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process message',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-send once speech recognition produces a final transcript
  const handleVoiceSend = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;

    setIsProcessing(true);
    try {
      const userMessage: Message = {
        role: 'user',
        content: transcript,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Add placeholder and stream the response
      setMessages(prev => [...prev, { role: 'assistant' as const, content: '', timestamp: new Date() }]);

      const aiResponse = await sendMessageStreaming(transcript, (chunk) => {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: last.content + chunk };
          }
          return updated;
        });
      });

      // Strip grammar feedback markers for language-learning games
      const isVoiceLangLearning = worldLangContext?.gameType === 'language-learning' ||
                                  worldLangContext?.gameType === 'educational';
      const { cleanedResponse: voiceDisplayResponse } = isVoiceLangLearning
        ? parseGrammarFeedbackBlock(aiResponse)
        : { cleanedResponse: aiResponse };

      // Update with cleaned version
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === 'assistant') {
          updated[updated.length - 1] = { ...last, content: voiceDisplayResponse };
        }
        return updated;
      });

      // Convert to speech and play (without markers)
      try {
        const responseAudioBlob = await textToSpeech(voiceDisplayResponse);
        await playAudio(responseAudioBlob);
      } catch {
        browserTextToSpeech(voiceDisplayResponse);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process speech',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      setInputText('');
    }
  }, [worldLangContext, toast]);

  // Trigger auto-send when pending
  useEffect(() => {
    if (pendingSendRef.current && finalTranscript.trim() && !isRecording) {
      pendingSendRef.current = false;
      handleVoiceSend(finalTranscript);
      resetTranscript();
    }
  }, [finalTranscript, isRecording, handleVoiceSend, resetTranscript]);

  const handleStartRecording = () => {
    resetTranscript();
    setInputText('');
    startListening();
  };

  const handleStopRecording = () => {
    stopListening();
  };

  /** Handle native audio I/O: sends raw audio blob to Gemini, gets text + audio back */
  const handleNativeAudioSend = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert blob to base64 for the native audio API
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.includes(',') ? result.split(',')[1] : result;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Single native audio call: audio in → text + audio out
      const result = await sendNativeAudioChat({
        audioData: base64Audio,
      });

      // Use the cleaned response for display
      const isNativeLangLearning = worldLangContext?.gameType === 'language-learning' ||
                                    worldLangContext?.gameType === 'educational';
      const { cleanedResponse: nativeDisplayResponse } = isNativeLangLearning
        ? parseGrammarFeedbackBlock(result.cleanedResponse || result.response)
        : { cleanedResponse: result.cleanedResponse || result.response };

      // Add a placeholder for the user message (Gemini transcribed internally)
      const userMsg: Message = {
        role: 'user',
        content: '[Voice message]',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMsg]);

      const aiMessage: Message = {
        role: 'assistant',
        content: nativeDisplayResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Play audio response if available
      if (result.audio) {
        const audioBytes = Uint8Array.from(atob(result.audio), c => c.charCodeAt(0));
        const responseBlob = new Blob([audioBytes], { type: result.audioMimeType || 'audio/wav' });
        await playAudio(responseBlob);
      } else {
        // Fallback to TTS if native audio not available
        const responseAudioBlob = await textToSpeech(nativeDisplayResponse);
        await playAudio(responseAudioBlob);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process native audio',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [worldLangContext, toast]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!character) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            Talk with {character.firstName} {character.lastName}
          </DialogTitle>
          <DialogDescription>
            Have a voice conversation with {character.firstName}. Click the microphone to speak or type your message.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 h-[400px]">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/10 text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isProcessing && (!messages.length || messages[messages.length - 1].role !== 'assistant' || !messages[messages.length - 1].content) && (
              <div className="flex justify-start">
                <div className="bg-slate-200 dark:bg-slate-700 rounded-lg px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message or use the microphone..."
            className="flex-1 min-h-[60px] max-h-[120px]"
            disabled={isProcessing || isRecording}
          />
          <div className="flex flex-col gap-2">
            <Button
              size="icon"
              variant={isRecording ? 'destructive' : 'outline'}
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={isProcessing}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isProcessing || isRecording}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isSpeaking && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span>{character.firstName} is speaking...</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
