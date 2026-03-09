#!/usr/bin/env node
/**
 * Patches tau-prolog's core.js for strict-mode ESM compatibility.
 *
 * tau-prolog assigns 8 implicit globals without var/let/const, which works
 * in Node.js CJS (sloppy mode) but throws ReferenceError when bundled as
 * strict-mode ESM by Vite/esbuild. This script adds var declarations.
 *
 * Run via: node scripts/patch-tau-prolog.js
 * Called automatically by the "postinstall" npm script.
 */
const fs = require('fs');
const path = require('path');

const corePath = path.join(__dirname, '..', 'node_modules', 'tau-prolog', 'modules', 'core.js');

if (!fs.existsSync(corePath)) {
  console.log('[patch-tau-prolog] tau-prolog not installed, skipping.');
  process.exit(0);
}

let source = fs.readFileSync(corePath, 'utf8');

const marker = '// Patched: declare implicit globals for strict-mode compatibility';
if (source.includes(marker)) {
  console.log('[patch-tau-prolog] Already patched, skipping.');
  process.exit(0);
}

const patch = [
  '',
  `\t${marker}`,
  '\tvar tau_file_system, tau_user_input, tau_user_output, tau_user_error;',
  '\tvar nodejs_file_system, nodejs_user_input, nodejs_user_output, nodejs_user_error;',
  '',
].join('\n');

source = source.replace('(function() {', '(function() {' + patch);

fs.writeFileSync(corePath, source, 'utf8');
console.log('[patch-tau-prolog] Patched core.js with var declarations for 8 implicit globals.');
