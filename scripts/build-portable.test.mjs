import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildPortable } from './build-portable.mjs';

test('portable HTML bundles actual JS, CSS and icon rather than external local assets',()=>{
  const temp=mkdtempSync(join(tmpdir(),'conquest-portable-'));
  try{
    mkdirSync(join(temp,'assets'));
    writeFileSync(join(temp,'index.html'),`<!doctype html><html><head>
      <link rel="icon" href="./favicon.svg" type="image/svg+xml">
      <script type="module" crossorigin src="/Conquest/assets/index-123.js"></script>
      <link rel="stylesheet" crossorigin href="/Conquest/assets/index-123.css">
      </head><body><div id="app"></div></body></html>`);
    writeFileSync(join(temp,'assets','index-123.js'),"document.querySelector('#app').textContent='Playable';");
    writeFileSync(join(temp,'assets','index-123.css'),'body { background:#000; }');
    writeFileSync(join(temp,'favicon.svg'),'<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    const output=join(temp,'test-playable.html');
    const result=buildPortable(temp,output);
    assert.equal(result.scripts,1);
    assert.equal(result.styles,1);
    const html=readFileSync(output,'utf8');
    assert.match(html,/textContent='Playable'/);
    assert.match(html,/body \{ background:#000; \}/);
    assert.match(html,/data:image\/svg\+xml;base64,/);
    assert.doesNotMatch(html,/src="\/Conquest\/assets/);
    assert.doesNotMatch(html,/href="\/Conquest\/assets/);
    assert.match(html,/portable-single-file/);
  }finally{rmSync(temp,{recursive:true,force:true});}
});
