/**
 * Prolog Syntax Highlighter
 *
 * Renders Prolog code with syntax highlighting for:
 * - Keywords (:-  \+  is  not  findall  etc.)
 * - Variables (uppercase start)
 * - Atoms (lowercase start)
 * - Numbers
 * - Comments (% ...)
 * - Strings ('...')
 * - Operators (>=  =<  =:=  \=  etc.)
 */

import { useMemo } from 'react';

interface PrologSyntaxHighlightProps {
  code: string;
  className?: string;
}

// Token types
type TokenType = 'comment' | 'keyword' | 'variable' | 'number' | 'string' | 'operator' | 'predicate' | 'text' | 'punctuation';

interface Token {
  type: TokenType;
  value: string;
}

const KEYWORDS = new Set([
  'is', 'not', 'mod', 'rem', 'div', 'true', 'false', 'fail',
  'findall', 'bagof', 'setof', 'assert', 'retract', 'asserta', 'assertz',
  'retractall', 'abolish', 'dynamic', 'discontiguous', 'module', 'use_module',
  'length', 'append', 'member', 'msort', 'sort', 'last', 'nth0', 'nth1',
  'write', 'writeln', 'nl', 'read', 'atom', 'number', 'integer', 'float',
  'atom_string', 'atom_chars', 'char_code', 'sub_atom',
  'abs', 'max', 'min', 'succ', 'plus',
]);

const OPERATORS = new Set([
  ':-', '?-', '-->', ',', ';', '->', '\\+', '\\=', '\\==',
  '=:=', '=\\=', '=<', '>=', '<', '>', '=', '==',
  '+', '-', '*', '/', '//', '**',
  '@<', '@>', '@=<', '@>=',
  '!', '|',
]);

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // Comments
    if (code[i] === '%') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = code.length;
      tokens.push({ type: 'comment', value: code.slice(i, end) });
      i = end;
      continue;
    }

    // Block comments
    if (code[i] === '/' && code[i + 1] === '*') {
      let end = code.indexOf('*/', i + 2);
      if (end === -1) end = code.length;
      else end += 2;
      tokens.push({ type: 'comment', value: code.slice(i, end) });
      i = end;
      continue;
    }

    // Strings (single-quoted atoms)
    if (code[i] === "'") {
      let end = i + 1;
      while (end < code.length && code[end] !== "'") {
        if (code[end] === '\\') end++; // escape
        end++;
      }
      end = Math.min(end + 1, code.length);
      tokens.push({ type: 'string', value: code.slice(i, end) });
      i = end;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(code[i]) || (code[i] === '-' && i + 1 < code.length && /[0-9]/.test(code[i + 1]) && (i === 0 || /[\s(,]/.test(code[i - 1])))) {
      let end = i;
      if (code[end] === '-') end++;
      while (end < code.length && /[0-9.]/.test(code[end])) end++;
      tokens.push({ type: 'number', value: code.slice(i, end) });
      i = end;
      continue;
    }

    // Variables (start with uppercase or _)
    if (/[A-Z_]/.test(code[i])) {
      let end = i;
      while (end < code.length && /[a-zA-Z0-9_]/.test(code[end])) end++;
      tokens.push({ type: 'variable', value: code.slice(i, end) });
      i = end;
      continue;
    }

    // Atoms / keywords / predicates (start with lowercase)
    if (/[a-z]/.test(code[i])) {
      let end = i;
      while (end < code.length && /[a-zA-Z0-9_]/.test(code[end])) end++;
      const word = code.slice(i, end);
      if (KEYWORDS.has(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (end < code.length && code[end] === '(') {
        tokens.push({ type: 'predicate', value: word });
      } else {
        tokens.push({ type: 'text', value: word });
      }
      i = end;
      continue;
    }

    // Multi-char operators
    let matchedOp = '';
    OPERATORS.forEach(op => {
      if (code.startsWith(op, i) && op.length > matchedOp.length) {
        matchedOp = op;
      }
    });
    if (matchedOp) {
      tokens.push({ type: 'operator', value: matchedOp });
      i += matchedOp.length;
      continue;
    }

    // Punctuation
    if ('()[]{}.,;|!'.includes(code[i])) {
      tokens.push({ type: 'punctuation', value: code[i] });
      i++;
      continue;
    }

    // Whitespace and other
    tokens.push({ type: 'text', value: code[i] });
    i++;
  }

  return tokens;
}

const TOKEN_STYLES: Record<TokenType, string> = {
  comment: 'text-gray-500 italic',
  keyword: 'text-purple-500 dark:text-purple-400 font-semibold',
  variable: 'text-amber-600 dark:text-amber-400',
  number: 'text-cyan-600 dark:text-cyan-400',
  string: 'text-green-600 dark:text-green-400',
  operator: 'text-red-500 dark:text-red-400',
  predicate: 'text-blue-600 dark:text-blue-400',
  text: '',
  punctuation: 'text-gray-400',
};

export function PrologSyntaxHighlight({ code, className = '' }: PrologSyntaxHighlightProps) {
  const tokens = useMemo(() => tokenize(code), [code]);

  return (
    <pre className={`text-sm font-mono whitespace-pre-wrap break-all ${className}`}>
      <code>
        {tokens.map((token, i) => (
          <span key={i} className={TOKEN_STYLES[token.type]}>
            {token.value}
          </span>
        ))}
      </code>
    </pre>
  );
}
