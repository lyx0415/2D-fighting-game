import {readFile,writeFile} from 'node:fs/promises';
const html=(await readFile('素材库/声景与整备v011.html','utf8')).replaceAll('07_音频特效/音色对比v011/','/audio/v011/').replaceAll('05_游戏界面/运行截图/','/素材库/05_游戏界面/运行截图/');
await writeFile('artifacts/showcase-v011.html',html);console.log('Preview /artifacts/showcase-v011.html');
