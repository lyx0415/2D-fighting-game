import {readFile,writeFile,mkdir} from 'node:fs/promises';
let html=await readFile('素材库/修习与战斗v010.html','utf8');
html=html.replaceAll('03_地图背景/独立石道v010/','/assets/v010/').replaceAll('07_音频特效/职业修习v010/','/audio/v010/').replaceAll('05_游戏界面/运行截图/','/素材库/05_游戏界面/运行截图/');
await mkdir('artifacts',{recursive:true});await writeFile('artifacts/showcase-v010.html',html);console.log('Preview /artifacts/showcase-v010.html');
