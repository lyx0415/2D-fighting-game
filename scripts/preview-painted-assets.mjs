import {readFile,writeFile,mkdir} from 'node:fs/promises';
const manifest=JSON.parse(await readFile('public/assets/v008/manifest.json','utf8'));
let html=await readFile('素材库/绘制美术v008.html','utf8');
for(const file of manifest.files){
 const folder=file.path==='props.webp'?'04_物体/绘制v008':file.path.startsWith('scene-')||file.path==='chapter.webp'?'03_地图背景/绘制v008':file.path.startsWith('portrait-')?'01_人物/绘制立绘v008':'01_人物/绘制动作图集v008';
 html=html.replaceAll(`${folder}/${file.path}`,`/assets/v008/${file.path}`);
}
await mkdir('artifacts',{recursive:true});await writeFile('artifacts/painted-v008-preview.html',html);
console.log('Painted preview: /artifacts/painted-v008-preview.html');
