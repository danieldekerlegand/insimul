import { getGenAI, isGeminiConfigured, GEMINI_MODELS } from "../config/gemini.js";

/**
 * Gemini Native Audio I/O for single-call voice chat.
 *
 * Instead of the 3-step flow (STT → text chat → TTS), this sends audio
 * directly to Gemini and receives both text and audio in a single API call.
 */

export interface NativeAudioChatRequest {
  /** Base64-encoded audio input */
  audioData: string;
  /** MIME type of the audio input (e.g., 'audio/webm', 'audio/wav') */
  mimeType: string;
  /** System prompt for the character */
  systemPrompt: string;
  /** Conversation history in Gemini format */
  history: Array<{ role: string; parts: Array<{ text: string }> }>;
  /** Voice name for audio output (Kore, Charon, Aoede, Puck) */
  voice?: string;
  /** Temperature for generation */
  temperature?: number;
  /** Max output tokens */
  maxTokens?: number;
  /** Emotional tone to apply to speech (e.g., 'happy', 'sad', 'angry') */
  emotionalTone?: string;
}

export interface NativeAudioChatResponse {
  /** Text transcript of the model's response */
  text: string;
  /** Base64-encoded audio of the model's response (PCM 24kHz) */
  audioData: string | null;
  /** MIME type of the audio output */
  audioMimeType: string;
}

/**
 * Send audio to Gemini and receive both text and audio response in a single call.
 * Uses Gemini's native audio I/O with responseModalities: ['AUDIO', 'TEXT'].
 */
export async function nativeAudioChat(request: NativeAudioChatRequest): Promise<NativeAudioChatResponse> {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API key is not configured");
  }

  const client = getGenAI();
  const voice = request.voice || 'Kore';
  const temperature = request.temperature ?? 0.7;
  const maxTokens = request.maxTokens ?? 1000;

  // Build conversation contents: system prompt + history + audio message
  const contents: any[] = [];

  // System prompt as first user message (roleplay pattern)
  contents.push({
    role: 'user',
    parts: [{ text: request.systemPrompt }]
  });
  contents.push({
    role: 'model',
    parts: [{ text: 'I understand. I will roleplay as this character.' }]
  });

  // Add conversation history
  for (const msg of request.history) {
    contents.push({
      role: msg.role,
      parts: msg.parts
    });
  }

  // Add audio input as the final user message
  contents.push({
    role: 'user',
    parts: [{
      inlineData: {
        data: request.audioData,
        mimeType: request.mimeType,
      }
    }]
  });

  // First call: get text response (for display and quest parsing)
  const textResponse = await client.models.generateContent({
    model: GEMINI_MODELS.FLASH,
    contents,
    config: {
      temperature,
      maxOutputTokens: maxTokens,
      responseModalities: ['TEXT'],
    },
  });

  const responseText = textResponse.text || '';

  // Second call: get audio response using the text we got
  // We replace the audio input with the transcript + ask for audio output of the model's response
  let audioData: string | null = null;
  const audioMimeType = 'audio/wav';

  if (responseText.trim()) {
    try {
      // Strip system markers from the text before synthesizing
      const cleanedText = responseText
        .replace(/\*\*GRAMMAR_FEEDBACK\*\*[\s\S]*?\*\*END_GRAMMAR\*\*/g, '')
        .replace(/\*\*QUEST_ASSIGN\*\*[\s\S]*?\*\*END_QUEST\*\*/g, '')
        .trim();

      if (cleanedText) {
        const toneDirective = request.emotionalTone && request.emotionalTone !== 'neutral'
          ? ` with a ${request.emotionalTone} tone`
          : '';
        const audioResponse = await client.models.generateContent({
          model: GEMINI_MODELS.FLASH,
          contents: `Say the following text naturally${toneDirective}, in character: "${cleanedText}"`,
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voice,
                }
              }
            },
          },
        });

        // Extract audio from response parts
        const candidates = audioResponse.candidates;
        if (candidates && candidates.length > 0) {
          const parts = candidates[0].content?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.inlineData?.data) {
                audioData = part.inlineData.data;
                break;
              }
            }
          }
        }
      }
    } catch (audioError) {
      console.error('[NativeAudio] Audio generation failed, returning text only:', audioError);
    }
  }

  return {
    text: responseText,
    audioData,
    audioMimeType,
  };
}

/**
 * Text-only chat using the same native audio pipeline for consistency.
 * Sends text, returns text + optional audio.
 */
export async function nativeTextToAudioChat(
  textMessage: string,
  systemPrompt: string,
  history: Array<{ role: string; parts: Array<{ text: string }> }>,
  voice: string = 'Kore',
  temperature: number = 0.7,
  maxTokens: number = 1000,
  emotionalTone?: string,
): Promise<NativeAudioChatResponse> {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API key is not configured");
  }

  const client = getGenAI();

  // Build conversation contents
  const contents: any[] = [];

  contents.push({
    role: 'user',
    parts: [{ text: systemPrompt }]
  });
  contents.push({
    role: 'model',
    parts: [{ text: 'I understand. I will roleplay as this character.' }]
  });

  for (const msg of history) {
    contents.push({
      role: msg.role,
      parts: msg.parts
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: textMessage }]
  });

  // Get text response
  const textResponse = await client.models.generateContent({
    model: GEMINI_MODELS.FLASH,
    contents,
    config: {
      temperature,
      maxOutputTokens: maxTokens,
      responseModalities: ['TEXT'],
    },
  });

  const responseText = textResponse.text || '';

  // Generate audio from the cleaned response
  let audioData: string | null = null;
  const audioMimeType = 'audio/wav';

  if (responseText.trim()) {
    try {
      const cleanedText = responseText
        .replace(/\*\*GRAMMAR_FEEDBACK\*\*[\s\S]*?\*\*END_GRAMMAR\*\*/g, '')
        .replace(/\*\*QUEST_ASSIGN\*\*[\s\S]*?\*\*END_QUEST\*\*/g, '')
        .trim();

      if (cleanedText) {
        const toneDirective = emotionalTone && emotionalTone !== 'neutral'
          ? ` with a ${emotionalTone} tone`
          : '';
        const audioResponse = await client.models.generateContent({
          model: GEMINI_MODELS.FLASH,
          contents: `Say the following text naturally${toneDirective}, in character: "${cleanedText}"`,
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voice,
                }
              }
            },
          },
        });

        const candidates = audioResponse.candidates;
        if (candidates && candidates.length > 0) {
          const parts = candidates[0].content?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.inlineData?.data) {
                audioData = part.inlineData.data;
                break;
              }
            }
          }
        }
      }
    } catch (audioError) {
      console.error('[NativeAudio] Audio generation failed:', audioError);
    }
  }

  return {
    text: responseText,
    audioData,
    audioMimeType,
  };
}
