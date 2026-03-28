import { describe, it, expect } from 'vitest';
import { stripSystemMarkers } from '../language/progress';

describe('stripSystemMarkers', () => {
  it('removes complete GRAMMAR_FEEDBACK blocks', () => {
    const input = 'Hello! **GRAMMAR_FEEDBACK**\nStatus: correct\nErrors: 0\n**END_GRAMMAR**';
    expect(stripSystemMarkers(input)).toBe('Hello!');
  });

  it('removes complete QUEST_ASSIGN blocks', () => {
    const input = 'Welcome! **QUEST_ASSIGN**\nquest_id: abc\ntitle: Test\n**END_QUEST** Goodbye!';
    expect(stripSystemMarkers(input)).toBe('Welcome!  Goodbye!');
  });

  it('removes multiple blocks of different types', () => {
    const input =
      'Hi there! **GRAMMAR_FEEDBACK**\nStatus: corrected\nErrors: 1\n**END_GRAMMAR** Nice. **QUEST_ASSIGN**\nquest: test\n**END_QUEST** Bye!';
    expect(stripSystemMarkers(input)).toBe('Hi there!  Nice.  Bye!');
  });

  it('removes partial/incomplete GRAMMAR_FEEDBACK block (streaming)', () => {
    const input = 'Bonjour! **GRAMMAR_FEEDBACK**\nStatus: correct\nErr';
    expect(stripSystemMarkers(input)).toBe('Bonjour!');
  });

  it('removes partial/incomplete QUEST_ASSIGN block (streaming)', () => {
    const input = 'Hey! **QUEST_ASSIGN**\nquest_id:';
    expect(stripSystemMarkers(input)).toBe('Hey!');
  });

  it('removes orphaned END_GRAMMAR marker', () => {
    const input = 'Some text **END_GRAMMAR** more text';
    expect(stripSystemMarkers(input)).toBe('Some text  more text');
  });

  it('removes orphaned END_QUEST marker', () => {
    const input = '**END_QUEST** trailing';
    expect(stripSystemMarkers(input)).toBe('trailing');
  });

  it('returns original text when no markers present', () => {
    const input = 'Just a normal response with no markers.';
    expect(stripSystemMarkers(input)).toBe('Just a normal response with no markers.');
  });

  it('handles empty string', () => {
    expect(stripSystemMarkers('')).toBe('');
  });

  it('handles multiple GRAMMAR_FEEDBACK blocks', () => {
    const input =
      'A **GRAMMAR_FEEDBACK**\nfoo\n**END_GRAMMAR** B **GRAMMAR_FEEDBACK**\nbar\n**END_GRAMMAR** C';
    expect(stripSystemMarkers(input)).toBe('A  B  C');
  });
});
