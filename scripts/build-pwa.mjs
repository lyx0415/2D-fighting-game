import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
async function walk(dir){const out=[];for(const f of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+f.name;if(f.isDirectory())out.push(...await walk(p));else out.push(p);}return out;}
const all=await walk('dist');
const files=all.filter(p=>p==='dist/index.html'||/dist\/assets\/(?!v\d{3}\/)/.test(p)||/dist\/assets\/v(008|009|010|012)\/[^/]+\.webp$/.test(p)||/dist\/audio\/v012\/[^/]+\.wav$/.test(p)||/dist\/(icons\/|manifest.webmanifest)/.test(p));
const hash=createHash('sha256');for(const f of files)hash.update(await readFile(f));const version=hash.digest('hex').slice(0,12);
const urls=files.map(p=>'./'+p.slice(5));
const sw=`const CACHE='ashen-release-${version}',FILES=${JSON.stringify(urls)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ashen-release-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;try{return await fetch(e.request);}catch(error){if(e.request.mode==='navigate')return c.match('./index.html');throw error;}}));});`;
await writeFile('dist/sw.js',sw);await writeFile('artifacts/pwa-build.json',JSON.stringify({cache:version,files:urls,bytes:(await Promise.all(files.map(async f=>(await readFile(f)).length))).reduce((a,b)=>a+b,0)},null,2));console.log('PWA precache:',files.length,'files');
