#!/usr/bin/env node
'use strict';
// Generate cup/index.html from matches.js. --out <dir> overrides target (tests).
const fs = require('node:fs');
const path = require('node:path');
const render = require('./render.js');
const lib = require('./lib.js');
const rawMatches = require('./matches.js');
const channels = require('./channels.js');
const matches = lib.withChannels(rawMatches, channels);

function outDir() {
  // No --out: write into this source dir (Task: generate the live /cup page).
  const i = process.argv.indexOf('--out');
  if (i === -1) return __dirname;
  const dir = process.argv[i + 1];
  if (!dir) { console.error('--out requires a directory argument'); process.exit(1); }
  return dir;
}

function main() {
  const out = outDir();
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), render.renderPage(matches));
  console.log(`Generated /cup page (${matches.length} matches) into ${out}`);
}

main();
