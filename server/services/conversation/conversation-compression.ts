import { getGenAI, isGeminiConfigured, GEMINI_MODELS } from '../../config/gemini.js';

/**
 * A message in Gemini's conversation format.
 */
export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

/**
 * Options for conversation compression.
 */
export interface CompressionOptions {
  /** Total message count threshold before compression kicks in (default: 20) */
  threshold?: number;
  /** Number of recent messages to keep uncompressed (default: 10) */
  keepRecent?: number;
}

const DEFAULT_THRESHOLD = 20;
const DEFAULT_KEEP_RECENT = 10;

/**
 * Compresses a conversation history by summarizing older messages
 * and keeping recent ones intact. When the message count exceeds
 * the threshold, older messages are replaced with a summary.
 *
 * Returns the original messages unchanged if below threshold or
 * if Gemini is unavailable.
 */
export async function compressConversationHistory(
  messages: GeminiMessage[],
  options: CompressionOptions = {}
): Promise<GeminiMessage[]> {
  const threshold = options.threshold ?? DEFAULT_THRESHOLD;
  const keepRecent = options.keepRecent ?? DEFAULT_KEEP_RECENT;

  if (messages.length <= threshold) {
    return messages;
  }

  const splitIndex = messages.length - keepRecent;
  const olderMessages = messages.slice(0, splitIndex);
  const recentMessages = messages.slice(splitIndex);

  const summary = await summarizeMessages(olderMessages);
  if (!summary) {
    // Fallback: just keep recent messages if summarization fails
    return recentMessages;
  }

  // Inject summary as a context-setting exchange at the start
  const summaryMessages: GeminiMessage[] = [
    {
      role: 'user',
      parts: [{ text: `[Previous conversation summary: ${summary}]` }]
    },
    {
      role: 'model',
      parts: [{ text: 'I understand the context from our previous conversation. Let me continue from where we left off.' }]
    }
  ];

  return [...summaryMessages, ...recentMessages];
}

/**
 * Summarizes a list of messages into a concise text summary.
 * Returns null if summarization fails or Gemini is unavailable.
 */
async function summarizeMessages(messages: GeminiMessage[]): Promise<string | null> {
  if (!isGeminiConfigured() || messages.length === 0) {
    return null;
  }

  const transcript = messages
    .map(msg => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      const text = msg.parts.map(p => p.text).join(' ');
      return `${role}: ${text}`;
    })
    .join('\n');

  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: GEMINI_MODELS.FLASH,
      config: {
        systemInstruction: 'You are a conversation summarizer. Produce a concise summary of the conversation that preserves key topics, decisions, character details, and any important context needed to continue the conversation naturally. Keep the summary under 200 words.',
      },
      contents: `Summarize this conversation:\n\n${transcript}`
    });

    const text = (response as any).text as string | undefined;
    return text?.trim() || null;
  } catch (error) {
    console.error('[ConversationCompression] Summarization failed:', error);
    return null;
  }
}

/**
 * Compresses plain text conversation history (used by language chat).
 * Takes an array of {role, content} messages and returns compressed text.
 */
export async function compressTextHistory(
  messages: { role: string; content: string; inLanguage?: string | null }[],
  languageName: string,
  options: CompressionOptions = {}
): Promise<string> {
  const threshold = options.threshold ?? DEFAULT_THRESHOLD;
  const keepRecent = options.keepRecent ?? DEFAULT_KEEP_RECENT;

  if (messages.length <= threshold) {
    return formatTextHistory(messages, languageName);
  }

  const splitIndex = messages.length - keepRecent;
  const olderMessages = messages.slice(0, splitIndex);
  const recentMessages = messages.slice(splitIndex);

  const geminiMessages: GeminiMessage[] = olderMessages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content + (msg.inLanguage ? ` (${languageName}: ${msg.inLanguage})` : '') }]
  }));

  const summary = await summarizeMessages(geminiMessages);
  const recentText = formatTextHistory(recentMessages, languageName);

  if (!summary) {
    return recentText;
  }

  return `[Earlier conversation summary: ${summary}]\n\n${recentText}`;
}

function formatTextHistory(
  messages: { role: string; content: string; inLanguage?: string | null }[],
  languageName: string
): string {
  return messages
    .map(msg => {
      const roleLabel = msg.role === 'user' ? 'User' : 'Assistant';
      const base = `${roleLabel}: ${msg.content}`;
      if (msg.inLanguage) {
        return `${base}\n(${languageName}): ${msg.inLanguage}`;
      }
      return base;
    })
    .join('\n\n');
}
