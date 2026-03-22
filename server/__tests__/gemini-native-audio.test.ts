/**
 * Tests for Gemini Native Audio I/O service.
 *
 * These tests mock the Gemini API client to verify the service
 * correctly constructs requests and processes responses.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the gemini config module
vi.mock('../config/gemini.js', () => ({
  isGeminiConfigured: vi.fn(() => true),
  getGenAI: vi.fn(),
  GEMINI_MODELS: {
    PRO: 'gemini-3.1-pro-preview',
    FLASH: 'gemini-3.1-flash-lite-preview',
    SPEECH: 'gemini-2.5-flash-preview-tts',
  },
}));

import { nativeAudioChat, nativeTextToAudioChat } from '../services/gemini-native-audio.js';
import { isGeminiConfigured, getGenAI } from '../config/gemini.js';

describe('gemini-native-audio', () => {
  const mockGenerateContent = vi.fn();
  const mockClient = {
    models: {
      generateContent: mockGenerateContent,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getGenAI as any).mockReturnValue(mockClient);
    (isGeminiConfigured as any).mockReturnValue(true);
  });

  describe('nativeAudioChat', () => {
    it('throws when Gemini is not configured', async () => {
      (isGeminiConfigured as any).mockReturnValue(false);

      await expect(nativeAudioChat({
        audioData: 'base64audio',
        mimeType: 'audio/webm',
        systemPrompt: 'You are a test character.',
        history: [],
      })).rejects.toThrow('Gemini API key is not configured');
    });

    it('sends audio input and returns text + audio response', async () => {
      // First call: text response
      mockGenerateContent.mockResolvedValueOnce({
        text: 'Hello, traveler!',
      });
      // Second call: audio response
      mockGenerateContent.mockResolvedValueOnce({
        candidates: [{
          content: {
            parts: [{
              inlineData: {
                data: 'bW9ja19hdWRpb19kYXRh', // base64 "mock_audio_data"
                mimeType: 'audio/wav',
              }
            }]
          }
        }],
      });

      const result = await nativeAudioChat({
        audioData: 'dGVzdF9hdWRpbw==',
        mimeType: 'audio/webm',
        systemPrompt: 'You are a friendly NPC.',
        history: [],
        voice: 'Kore',
        temperature: 0.8,
        maxTokens: 500,
      });

      expect(result.text).toBe('Hello, traveler!');
      expect(result.audioData).toBe('bW9ja19hdWRpb19kYXRh');
      expect(result.audioMimeType).toBe('audio/wav');

      // Verify text generation call
      const textCall = mockGenerateContent.mock.calls[0][0];
      expect(textCall.model).toBe('gemini-3.1-flash-lite-preview');
      expect(textCall.config.responseModalities).toEqual(['TEXT']);
      expect(textCall.config.temperature).toBe(0.8);
      expect(textCall.config.maxOutputTokens).toBe(500);

      // Verify contents include system prompt + audio
      const contents = textCall.contents;
      expect(contents[0].role).toBe('user');
      expect(contents[0].parts[0].text).toBe('You are a friendly NPC.');
      expect(contents[1].role).toBe('model');

      // Last content should be the audio input
      const lastContent = contents[contents.length - 1];
      expect(lastContent.role).toBe('user');
      expect(lastContent.parts[0].inlineData.data).toBe('dGVzdF9hdWRpbw==');
      expect(lastContent.parts[0].inlineData.mimeType).toBe('audio/webm');

      // Verify audio generation call
      const audioCall = mockGenerateContent.mock.calls[1][0];
      expect(audioCall.config.responseModalities).toEqual(['AUDIO']);
      expect(audioCall.config.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName).toBe('Kore');
    });

    it('includes conversation history in the request', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: 'Response' });
      mockGenerateContent.mockResolvedValueOnce({
        candidates: [{ content: { parts: [{ inlineData: { data: 'audio' } }] } }],
      });

      await nativeAudioChat({
        audioData: 'audio_data',
        mimeType: 'audio/webm',
        systemPrompt: 'System prompt',
        history: [
          { role: 'user', parts: [{ text: 'Hello' }] },
          { role: 'model', parts: [{ text: 'Hi there' }] },
        ],
      });

      const contents = mockGenerateContent.mock.calls[0][0].contents;
      // system prompt (user) + system ack (model) + 2 history + audio = 5
      expect(contents).toHaveLength(5);
      expect(contents[2].parts[0].text).toBe('Hello');
      expect(contents[3].parts[0].text).toBe('Hi there');
    });

    it('returns null audio when audio generation fails', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: 'Hello!' });
      mockGenerateContent.mockRejectedValueOnce(new Error('Audio generation failed'));

      const result = await nativeAudioChat({
        audioData: 'audio_data',
        mimeType: 'audio/webm',
        systemPrompt: 'Test',
        history: [],
      });

      expect(result.text).toBe('Hello!');
      expect(result.audioData).toBeNull();
    });

    it('returns null audio when text response is empty', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: '' });

      const result = await nativeAudioChat({
        audioData: 'audio_data',
        mimeType: 'audio/webm',
        systemPrompt: 'Test',
        history: [],
      });

      expect(result.text).toBe('');
      expect(result.audioData).toBeNull();
      // Should only have made one call (text), not two
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('strips system markers before generating audio', async () => {
      const textWithMarkers = 'Hello! **GRAMMAR_FEEDBACK**correction here**END_GRAMMAR** **QUEST_ASSIGN**quest data**END_QUEST**';
      mockGenerateContent.mockResolvedValueOnce({ text: textWithMarkers });
      mockGenerateContent.mockResolvedValueOnce({
        candidates: [{ content: { parts: [{ inlineData: { data: 'audio' } }] } }],
      });

      await nativeAudioChat({
        audioData: 'audio_data',
        mimeType: 'audio/webm',
        systemPrompt: 'Test',
        history: [],
      });

      // The audio call should use cleaned text
      const audioCallContent = mockGenerateContent.mock.calls[1][0].contents;
      expect(audioCallContent).not.toContain('GRAMMAR_FEEDBACK');
      expect(audioCallContent).not.toContain('QUEST_ASSIGN');
      expect(audioCallContent).toContain('Hello!');
    });

    it('uses default voice and temperature when not specified', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: 'Hi' });
      mockGenerateContent.mockResolvedValueOnce({
        candidates: [{ content: { parts: [{ inlineData: { data: 'audio' } }] } }],
      });

      await nativeAudioChat({
        audioData: 'audio_data',
        mimeType: 'audio/webm',
        systemPrompt: 'Test',
        history: [],
      });

      const textCall = mockGenerateContent.mock.calls[0][0];
      expect(textCall.config.temperature).toBe(0.7);
      expect(textCall.config.maxOutputTokens).toBe(1000);

      const audioCall = mockGenerateContent.mock.calls[1][0];
      expect(audioCall.config.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName).toBe('Kore');
    });
  });

  describe('nativeTextToAudioChat', () => {
    it('throws when Gemini is not configured', async () => {
      (isGeminiConfigured as any).mockReturnValue(false);

      await expect(nativeTextToAudioChat(
        'Hello', 'System prompt', []
      )).rejects.toThrow('Gemini API key is not configured');
    });

    it('sends text and returns text + audio response', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: 'Bonjour!' });
      mockGenerateContent.mockResolvedValueOnce({
        candidates: [{
          content: {
            parts: [{
              inlineData: {
                data: 'audio_base64',
                mimeType: 'audio/wav',
              }
            }]
          }
        }],
      });

      const result = await nativeTextToAudioChat(
        'Hello there',
        'You are a French tutor.',
        [{ role: 'user', parts: [{ text: 'Bonjour' }] }],
        'Charon',
        0.9,
        2000,
      );

      expect(result.text).toBe('Bonjour!');
      expect(result.audioData).toBe('audio_base64');

      // Verify text call includes the text message
      const textCall = mockGenerateContent.mock.calls[0][0];
      const contents = textCall.contents;
      const lastContent = contents[contents.length - 1];
      expect(lastContent.parts[0].text).toBe('Hello there');
      expect(textCall.config.temperature).toBe(0.9);
      expect(textCall.config.maxOutputTokens).toBe(2000);

      // Verify audio call uses correct voice
      const audioCall = mockGenerateContent.mock.calls[1][0];
      expect(audioCall.config.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName).toBe('Charon');
    });

    it('returns null audio when generation fails gracefully', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: 'Response text' });
      mockGenerateContent.mockRejectedValueOnce(new Error('Network error'));

      const result = await nativeTextToAudioChat('Hello', 'System', []);

      expect(result.text).toBe('Response text');
      expect(result.audioData).toBeNull();
    });
  });
});
