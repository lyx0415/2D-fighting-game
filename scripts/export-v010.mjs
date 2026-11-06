import {readFile,writeFile,mkdir,copyFile,readdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
const lib=resolve('素材库'),base=JSON.parse(await readFile('artifacts/v009-before-v010/catalog.json','utf8'));
const items=[...base.items];
async function add(id,name,source,path,status){
 const bytes=await readFile(source);await mkdir(dirname(resolve(lib,path)),{recursive:true});
 if(resolve(source)!==resolve(lib,path))await copyFile(source,resolve(lib,path));
 items.push({id,name,path,source,status,sha256:createHash('sha256').update(bytes).digest('hex')});
}
const audio=JSON.parse(await readFile('public/audio/v010/manifest.json','utf8'));
for(const f of audio.files)await add('v010_audio_'+f.id,f.id,'public/audio/v010/'+f.file,'07_音频特效/职业修习v010/'+f.file,'已接入；本地DSP/jsfxr，发力为SAPI合成，非真人录音');
for(const name of await readdir('public/audio/v010/source'))await add('v010_audio_source_'+name,name,'public/audio/v010/source/'+name,'07_音频特效/职业修习v010/合成原稿/'+name,'原稿与来源，非额外运行cue');
for(const name of ['ground.webp','manifest.json'])await add('v010_ground_'+name,name,'public/assets/v010/'+name,'03_地图背景/独立石道v010/'+name,'运行石道纹理及哈希；场景仍使用v008背景');
for(const name of await readdir('素材库/08_生成原稿/v010'))await add('v010_raw_'+name,name,'素材库/08_生成原稿/v010/'+name,'08_生成原稿/v010/'+name,'内置image_gen原稿与提示词');
await add('v010_audio_manifest','音频清单','public/audio/v010/manifest.json','07_音频特效/职业修习v010/manifest.json','50运行WAV哈希、时长、来源');
for(const name of ['training','battle','mobile',...['1','2','3','4','8'].map(n=>'terrain-'+n)])await add('v010_ui_'+name,name,'artifacts/chromium-v010-'+name+'.png','05_游戏界面/运行截图/ui_'+name+'_v010.png','实际浏览器夹具截图；手机为视口模拟');
const cues=[['战士 / 钢刃破空、护盾回响',['sweep','ward','warriorExert']],['射手 / 木弦连发、箭雨风切',['volley','arrowRain','archerExert']],['法师 / 寒霜碎裂、陨火蓄力和爆发',['frost','meteorCast','fireHit','mageExert']],['坦克 / 盾面震动、低频誓言',['shieldBash','oath','tankExert']],['刺客 / 暗影掠过、短刃切入',['shadow','execute','assassinExert']]];
const html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>灰烬誓约 v010 · 修习与职业声景</title><style>body{margin:32px;background:#0a1420;color:#dbc99d;font:14px 'Microsoft YaHei',sans-serif}h1,h2{font-family:Georgia,serif;font-weight:400;letter-spacing:2px}p{line-height:1.9;color:#a2b3c1}a{color:#d8bd83}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}article{background:#152433;border:1px solid #585641;padding:22px}audio{width:100%;min-height:48px}img{max-width:100%;display:block;margin:18px 0}small{display:block;color:#93a9b8;margin:12px 0}code{color:#c6b47f}@media(max-width:800px){.grid{grid-template-columns:1fr}body{margin:16px}}</style><h1>灰烬誓约 / v0.10.0</h1><p>普攻出手增益0.15、普通命中0.12、技能0.57（统一主音量之前）；限制连续叠加，五职业成功施法时偶尔触发合成发力。天赋和技能升级位于英雄成长。建筑背景与真实石道路面分层，人物再缩小约15%。<a href="catalog.json">完整素材索引</a> · <a href="展示与声景v009.html">v009历史对照</a></p><h2>成长与战斗 / 实际测试截图</h2><img src="05_游戏界面/运行截图/ui_training_v010.png" alt="天赋和战技修习"><img src="05_游戏界面/运行截图/ui_battle_v010.png" alt="战斗道路"><h2>五职业技能与发力试听</h2><p>发力声为本机SAPI合成与降调处理，非真人配音。此处原始文件不包含游戏内混音衰减，试听请从低音量开始。文件分析与浏览器解码不能代表真人听感验收。</p><div class="grid">${cues.map(([label,ids])=>`<article><h2>${label}</h2>${ids.map(id=>`<small>${id}</small><audio controls preload="none" src="07_音频特效/职业修习v010/${id}.wav"></audio>`).join('')}</article>`).join('')}</div><h2>独立石道纹理 / 原生比例取带，按主题调色</h2><img src="03_地图背景/独立石道v010/ground.webp" alt="可行走石道纹理"><h2>五主题边界 / 浏览器截图</h2>${['1','2','3','4','8'].map(n=>`<img src="05_游戏界面/运行截图/ui_terrain-${n}_v010.png" alt="关卡${n}道路边界">`).join('')}<h2>手机横屏视口模拟</h2><img src="05_游戏界面/运行截图/ui_mobile_v010.png" alt="844×390模拟"><p>图像原稿与完整prompt：08_生成原稿/v010。真源为public/assets/v010、public/audio/v010；旧背景/动作/立绘继续使用v008/v009。文件记录见catalog，规则和验证见项目docs。</p></html>`;
await writeFile(resolve(lib,'修习与战斗v010.html'),html);await writeFile(resolve(lib,'素材图鉴.html'),html);
await writeFile(resolve(lib,'catalog.json'),JSON.stringify({...base,gameVersion:'0.10.0',updated:'2026-10-31',runtimeSource:'src/game/art.ts + public/assets/v008,v009,v010 + public/audio/v010',note:'v010独立路面、缩小单位、职业声景和营地修习；旧文件保留为历史对照。',items},null,2));
console.log('Exported',items.length,'catalog entries');
