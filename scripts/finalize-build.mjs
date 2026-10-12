import { existsSync, renameSync, readFileSync } from 'node:fs';

/** Vite emits index.source.html since production serves a different root file. */
const source='dist/index.source.html';
const destination='dist/index.html';
if (!existsSync(source)) throw new Error('Missing Vite output: '+source);
const html=readFileSync(source,'utf8');
if(!html.includes('<script') || !html.includes('assets/'))
  throw new Error('Refusing incomplete production HTML');
renameSync(source,destination);
console.log('Compiled source entrypoint to '+destination);
