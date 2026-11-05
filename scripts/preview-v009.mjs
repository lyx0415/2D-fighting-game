import {readFile,writeFile,mkdir} from 'node:fs/promises';
let html=await readFile('素材库/展示与声景v009.html','utf8');
html=html.replaceAll('01_人物/多向待战v009/','/assets/v009/').replaceAll('07_音频特效/声景v009/','/audio/v009/').replaceAll('05_游戏界面/运行截图/','/素材库/05_游戏界面/运行截图/');
await mkdir('artifacts',{recursive:true});await writeFile('artifacts/showcase-v009.html',html);console.log('Preview /artifacts/showcase-v009.html');
