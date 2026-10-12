import { readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Builds a self-contained HTML playtest from Vite's production dist/.
 * Intended for iPhone Files/Safari and desktop browsers when Pages isn't live.
 * Does not change the actual game, saves, or the normal web build.
 */
export function buildPortable(distDirectory, outputFile) {
  const root=resolve(distDirectory);
  let html=readFileSync(join(root,'index.html'),'utf8');
  let scripts=0,styles=0;
  const asset=(url)=>{
    const path=url.split(/[?#]/)[0].replace(/^\/(?:Conquest\/)?/,'');
    const file=resolve(root,path);
    if(!file.startsWith(root+'/'))throw new Error('Refusing asset outside dist: '+url);
    statSync(file);
    return readFileSync(file,'utf8');
  };
  html=html.replace(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi,(_,url)=>{
    const js=asset(url).replace(/<\/script/gi,'<\\/script');
    scripts++;
    return '<script type="module">\n'+js+'\n</script>';
  });
  html=html.replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi,tag=>{
    const match=tag.match(/href=["']([^"']+)["']/i);
    if(!match)throw new Error('Missing CSS href in '+tag);
    styles++;
    return '<style>\n'+asset(match[1]).replace(/<\/style/gi,'<\\/style')+'\n</style>';
  });
  html=html.replace(/<link\b[^>]*\brel=["']icon["'][^>]*>/gi,tag=>{
    const match=tag.match(/href=["']([^"']+)["']/i);
    if(!match)return '';
    const icon=Buffer.from(asset(match[1]),'utf8').toString('base64');
    return '<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,'+icon+'">';
  });
  if(scripts!==1||styles<1)throw new Error('Unexpected Vite dist: script='+scripts+' stylesheet='+styles);
  const banner='<meta name="conquest-build" content="portable-single-file">';
  html=html.replace('</head>',banner+'\n</head>');
  mkdirSync(dirname(resolve(outputFile)),{recursive:true});
  writeFileSync(outputFile,html);
  return {outputFile,bytes:Buffer.byteLength(html),scripts,styles};
}

if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const dist=process.argv[2]||'dist';
  const output=process.argv[3]||join(dist,'Conquest-Portable.html');
  const done=buildPortable(dist,output);
  process.stdout.write(JSON.stringify(done)+'\n');
}
