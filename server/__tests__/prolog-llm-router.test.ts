/**
 * Prolog-LLM Router Tests
 *
 * Tests for greeting/farewell template routing with target language support.
 */

import { describe, it, expect } from 'vitest';
import { PrologLLMRouter } from '../services/prolog-llm-router.js';

describe('PrologLLMRouter', () => {
  const router = new PrologLLMRouter();

  describe('greeting templates', () => {
    it('should return English greeting by default', async () => {
      const result = await router.tryPrologFirst('world-1', 'greeting', { speakerId: 'npc-1' });
      expect(result.answered).toBe(true);
      expect(result.source).toBe('template');
      expect(result.confidence).toBe(0.6);
      // English templates
      const englishGreetings = ['Good day, traveler.', 'Well met!', 'Hello there.', 'Greetings, friend.', 'Welcome.'];
      expect(englishGreetings).toContain(result.answer);
    });

    it('should return French greeting when targetLanguage is French', async () => {
      const result = await router.tryPrologFirst('world-1', 'greeting', { speakerId: 'npc-1' }, 'fr');
      expect(result.answered).toBe(true);
      const frenchGreetings = ['Bonjour, voyageur.', 'Bienvenue!', 'Salut!', 'Bonjour, comment allez-vous?', 'Bonne journée!'];
      expect(frenchGreetings).toContain(result.answer);
    });

    it('should return Spanish greeting when targetLanguage is Spanish', async () => {
      const result = await router.tryPrologFirst('world-1', 'greeting', { speakerId: 'npc-1' }, 'es');
      expect(result.answered).toBe(true);
      const spanishGreetings = ['¡Buenos días, viajero!', '¡Bienvenido!', '¡Hola!', '¿Cómo estás?', '¡Buenas!'];
      expect(spanishGreetings).toContain(result.answer);
    });

    it('should return German greeting when targetLanguage is German', async () => {
      const result = await router.tryPrologFirst('world-1', 'greeting', { speakerId: 'npc-1' }, 'de');
      expect(result.answered).toBe(true);
      const germanGreetings = ['Guten Tag, Reisender.', 'Willkommen!', 'Hallo!', 'Grüß Gott!', 'Sei gegrüßt!'];
      expect(germanGreetings).toContain(result.answer);
    });

    it('should fall back to English for unsupported languages', async () => {
      const result = await router.tryPrologFirst('world-1', 'greeting', { speakerId: 'npc-1' }, 'ja');
      expect(result.answered).toBe(true);
      const englishGreetings = ['Good day, traveler.', 'Well met!', 'Hello there.', 'Greetings, friend.', 'Welcome.'];
      expect(englishGreetings).toContain(result.answer);
    });
  });

  describe('farewell templates', () => {
    it('should return English farewell by default', async () => {
      const result = await router.tryPrologFirst('world-1', 'farewell', {});
      expect(result.answered).toBe(true);
      const englishFarewells = ['Farewell, safe travels.', 'Until next time.', 'May your path be clear.', 'Take care out there.', 'Goodbye for now.'];
      expect(englishFarewells).toContain(result.answer);
    });

    it('should return French farewell when targetLanguage is French', async () => {
      const result = await router.tryPrologFirst('world-1', 'farewell', {}, 'fr');
      expect(result.answered).toBe(true);
      const frenchFarewells = ['Au revoir, bon voyage.', 'À bientôt!', 'Bonne route!', 'À la prochaine.', 'Portez-vous bien!'];
      expect(frenchFarewells).toContain(result.answer);
    });
  });

  describe('backwards compatibility', () => {
    it('should work without targetLanguage parameter', async () => {
      const result = await router.tryPrologFirst('world-1', 'greeting', { speakerId: 'npc-1' });
      expect(result.answered).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(0.6);
    });

    it('should return trade templates unchanged', async () => {
      const result = await router.tryPrologFirst('world-1', 'trade_offer', {});
      expect(result.answered).toBe(true);
      expect(result.source).toBe('template');
    });
  });
});
