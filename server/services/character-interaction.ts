/**
 * Character interaction service.
 *
 * Uses the ILLMProvider interface so any registered provider (Gemini, OpenAI,
 * Anthropic, local) can be swapped in without changing callers.
 */

import { storage } from "../db/storage.js";
import { getLLMProvider, type ILLMProvider } from './llm-provider.js';

/**
 * Generate a character response using the configured LLM provider.
 */
export async function getCharacterResponse(
  userQuery: string,
  charID: string,
  provider?: ILLMProvider,
): Promise<{ response: string; audio: string | null }> {
  const llm = provider ?? getLLMProvider();

  if (!llm.isConfigured()) {
    return { response: "[AI provider not configured]", audio: null };
  }

  try {
    const character = await storage.getCharacter(charID);

    let characterContext = `Character ID: ${charID}`;
    if (character) {
      characterContext = `
Character Name: ${character.firstName} ${character.lastName || ''}
Character Description: ${character.description || 'No description available'}
Personality Traits: ${character.personalityTraits?.join(', ') || 'Not specified'}
Background: ${character.backstory || 'Not specified'}
`;
    }

    const response = await llm.generate({
      prompt: `${characterContext}\n\nUser Query: ${userQuery}\n\nRespond in character, maintaining consistency with the character's personality and background.`,
    });

    return { response: response.text, audio: null };
  } catch (error) {
    console.error("Character response error:", error);
    return {
      response: `[AI error: ${error instanceof Error ? error.message : 'Unknown error'}]`,
      audio: null,
    };
  }
}

/**
 * Get character actions based on current context.
 */
export async function getCharacterActions(charID: string): Promise<string[]> {
  try {
    const character = await storage.getCharacter(charID);

    if (!character) {
      return ["introduce_self", "observe", "wait"];
    }

    const actions = ["speak", "move", "interact", "observe", "think"];

    if (character.personalityTraits?.includes("aggressive")) {
      actions.push("confront", "challenge");
    }
    if (character.personalityTraits?.includes("friendly")) {
      actions.push("greet", "help");
    }
    if (character.personalityTraits?.includes("cunning")) {
      actions.push("scheme", "deceive");
    }

    return actions;
  } catch (error) {
    console.error("Get actions error:", error);
    return ["wait"];
  }
}

/**
 * Get action response for a specific action.
 */
export async function getActionResponse(
  charID: string,
  action: string,
  context?: string,
  provider?: ILLMProvider,
): Promise<string> {
  const llm = provider ?? getLLMProvider();

  if (!llm.isConfigured()) {
    return "The character performs the action.";
  }

  try {
    const character = await storage.getCharacter(charID);

    const characterContext = character ? `
Character: ${character.firstName} ${character.lastName || ''}
Personality: ${character.personalityTraits?.join(', ') || 'Not specified'}
` : `Character ID: ${charID}`;

    const response = await llm.generate({
      prompt: `${characterContext}
Action: ${action}
Context: ${context || 'No additional context'}

Generate a brief narrative description of how this character performs this action, staying true to their personality.`,
    });

    return response.text;
  } catch (error) {
    console.error("Action response error:", error);
    return "The character performs the action.";
  }
}

/**
 * List narrative sections for a character.
 */
export function listNarrativeSections(): Array<{ section: string }> {
  return [
    { section: "Introduction" },
    { section: "Rising Action" },
    { section: "Conflict" },
    { section: "Climax" },
    { section: "Resolution" },
    { section: "Epilogue" },
  ];
}

/**
 * List narrative triggers for a character.
 */
export function listNarrativeTriggers(): Array<{ trigger: string }> {
  return [
    { trigger: "Scene Start" },
    { trigger: "Character Entry" },
    { trigger: "Dialogue Begin" },
    { trigger: "Action Initiated" },
    { trigger: "Conflict Escalation" },
    { trigger: "Resolution Reached" },
    { trigger: "Scene End" },
  ];
}
