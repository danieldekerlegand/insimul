import { describe, it, expect } from 'vitest';
import { detectHagglingIntent } from '../language/haggling-detection';

describe('detectHagglingIntent', () => {
  it('returns false for empty or blank messages', () => {
    expect(detectHagglingIntent('')).toBe(false);
    expect(detectHagglingIntent('   ')).toBe(false);
  });

  it('returns false for non-price messages', () => {
    expect(detectHagglingIntent('Hello, how are you?')).toBe(false);
    expect(detectHagglingIntent('I like this weather')).toBe(false);
    expect(detectHagglingIntent('Tell me about your family')).toBe(false);
  });

  // ── English keywords ──────────────────────────────────────────────────

  it('detects English price keywords', () => {
    expect(detectHagglingIntent('How much does this cost?')).toBe(true);
    expect(detectHagglingIntent('Can I get a discount?')).toBe(true);
    expect(detectHagglingIntent("That's too expensive")).toBe(true);
    expect(detectHagglingIntent('Can you lower the price?')).toBe(true);
  });

  it('detects English negotiation phrases', () => {
    expect(detectHagglingIntent("I'd like to haggle")).toBe(true);
    expect(detectHagglingIntent('Can we negotiate?')).toBe(true);
    expect(detectHagglingIntent("Let's make a deal")).toBe(true);
    expect(detectHagglingIntent('Is that your best price?')).toBe(true);
  });

  it('is case-insensitive for English', () => {
    expect(detectHagglingIntent('DISCOUNT please')).toBe(true);
    expect(detectHagglingIntent('Price check')).toBe(true);
  });

  // ── French keywords ───────────────────────────────────────────────────

  it('detects French price vocabulary', () => {
    expect(detectHagglingIntent("C'est trop cher")).toBe(true);
    expect(detectHagglingIntent('Quel est le prix?')).toBe(true);
    expect(detectHagglingIntent('Une réduction, peut-être?')).toBe(true);
    expect(detectHagglingIntent('Je voudrais marchander')).toBe(true);
    expect(detectHagglingIntent('Moins cher, svp')).toBe(true);
  });

  it('detects French with target language hint', () => {
    expect(detectHagglingIntent('Combien coûte ceci?', 'French')).toBe(true);
    expect(detectHagglingIntent('Un rabais?', 'French')).toBe(true);
  });

  // ── Spanish keywords ──────────────────────────────────────────────────

  it('detects Spanish price vocabulary', () => {
    expect(detectHagglingIntent('Es muy caro')).toBe(true);
    expect(detectHagglingIntent('Cuánto cuesta?')).toBe(true);
    expect(detectHagglingIntent('Un descuento por favor')).toBe(true);
    expect(detectHagglingIntent('Quiero regatear')).toBe(true);
  });

  // ── German keywords ───────────────────────────────────────────────────

  it('detects German price vocabulary', () => {
    expect(detectHagglingIntent('Das ist zu teuer')).toBe(true);
    expect(detectHagglingIntent('Wie viel kostet das?')).toBe(true);
    expect(detectHagglingIntent('Gibt es einen Rabatt?')).toBe(true);
  });

  // ── Italian keywords ──────────────────────────────────────────────────

  it('detects Italian price vocabulary', () => {
    expect(detectHagglingIntent('Quanto costa?')).toBe(true);
    expect(detectHagglingIntent('Troppo caro')).toBe(true);
    expect(detectHagglingIntent('Uno sconto?')).toBe(true);
  });

  // ── Numeric patterns (currency amounts) ───────────────────────────────

  it('detects numeric price patterns', () => {
    expect(detectHagglingIntent('I will pay 5 euros')).toBe(true);
    expect(detectHagglingIntent('10 dollars is too much')).toBe(true);
    expect(detectHagglingIntent('50% off?')).toBe(true);
    expect(detectHagglingIntent('3 gold coins')).toBe(true);
  });

  it('does not match bare numbers without currency', () => {
    expect(detectHagglingIntent('I have 3 cats')).toBe(false);
    expect(detectHagglingIntent('It is 5 meters tall')).toBe(false);
  });
});
