import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const temp=resolve('.cache/build-tmp');mkdirSync(temp,{recursive:true});
const env={...process.env,TEMP:temp,TMP:temp};
for(const [script,args] of [['node_modules/typescript/bin/tsc',['--noEmit']],['node_modules/vite/bin/vite.js',['build']]]){
 const result=spawnSync(process.execPath,[script,...args],{stdio:'inherit',env});
 if(result.error)throw result.error;if(result.status!==0)process.exit(result.status??1);
}

await import('./build-pwa.mjs');
