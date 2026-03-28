/**
 * Tests for STT language hint feature.
 * Verifies that speechToText builds the correct prompt when a language hint is provided.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Gemini config before importing the module under test
const mockGenerateContent = vi.fn().mockResolvedValue({ text: 'transcribed text' });
const mockGenAI = {
  models: { generateContent: mockGenerateContent },
  files: { upload: vi.fn().mockResolvedValue({ uri: 'gs://fake-uri' }) },
};

vi.mock('../config/gemini.js', () => ({
  getGenAI: () => mockGenAI,
  isGeminiConfigured: () => true,
  getGeminiApiKey: () => 'fake-key',
  GEMINI_MODELS: { PRO: 'gemini-3.1-pro-preview', FLASH: 'gemini-3.1-flash-lite-preview', SPEECH: 'gemini-3.1-flash-preview-tts', LIVE: 'gemini-3.1-flash-live' },
}));

import { speechToText } from '../services/tts-stt.js';

describe('speechToText language hint', () => {
  const fakeAudio = Buffer.from('fake-audio-data');

  beforeEach(() => {
    mockGenerateContent.mockClear();
    mockGenerateContent.mockResolvedValue({ text: 'transcribed text' });
  });

  it('uses generic prompt when no language hint is provided', async () => {
    await speechToText(fakeAudio, 'audio/wav');

    expect(mockGenerateContent).toHaveBeenCalledOnce();
    const call = mockGenerateContent.mock.calls[0][0];
    expect(call.contents[0]).toBe('Generate a transcript of this audio.');
  });

  it('includes language hint in prompt when provided', async () => {
    await speechToText(fakeAudio, 'audio/wav', 'French');

    expect(mockGenerateContent).toHaveBeenCalledOnce();
    const call = mockGenerateContent.mock.calls[0][0];
    expect(call.contents[0]).toContain('French');
    expect(call.contents[0]).toContain('Transcribe in the original language');
  });

  it('includes language hint in prompt for Spanish', async () => {
    await speechToText(fakeAudio, 'audio/webm', 'Spanish');

    const call = mockGenerateContent.mock.calls[0][0];
    expect(call.contents[0]).toContain('Spanish');
  });

  it('returns the transcript from Gemini response', async () => {
    mockGenerateContent.mockResolvedValue({ text: 'Bonjour le monde' });

    const result = await speechToText(fakeAudio, 'audio/wav', 'French');
    expect(result).toBe('Bonjour le monde');
  });

  it('returns empty string when Gemini returns no text', async () => {
    mockGenerateContent.mockResolvedValue({ text: '' });

    const result = await speechToText(fakeAudio, 'audio/wav');
    expect(result).toBe('');
  });

  it('passes correct mime type and audio data to Gemini', async () => {
    await speechToText(fakeAudio, 'audio/webm');

    const call = mockGenerateContent.mock.calls[0][0];
    expect(call.contents[1].inlineData.mimeType).toBe('audio/webm');
    expect(call.contents[1].inlineData.data).toBe(fakeAudio.toString('base64'));
  });
});
