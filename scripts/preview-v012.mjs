import {readFile,writeFile} from 'node:fs/promises';
const html=(await readFile('素材库/原声与营地v012.html','utf8')).replaceAll('07_音频特效/录音重制v012/','/audio/v012/').replaceAll('07_音频特效/音色对比v011/','/audio/v011/').replaceAll('07_音频特效/职业修习v010/','/audio/v010/').replaceAll('05_游戏界面/运行截图/','/素材库/05_游戏界面/运行截图/');
await writeFile('artifacts/showcase-v012.html',html);console.log('Preview /artifacts/showcase-v012.html');
