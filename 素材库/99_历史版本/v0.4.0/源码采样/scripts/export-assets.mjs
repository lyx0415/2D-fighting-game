import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { heroSvg, HERO_POSE_FRAMES } from '../src/game/hero-art.ts';
import { skillIconSvg } from '../src/game/skill-icons.ts';
import { chapterAtlasSvg } from '../src/game/chapter-map.ts';
import { characterSvg, sceneSvg, crestSvg, storySvg, equipmentSvg, legacyCharacterSvg, blade, pine, deadTree, ruin } from '../src/game/art.ts';
const root=resolve('素材库');
const helpers={blade,pine,deadTree,ruin};
const items=[];
async function svg(id,folder,name,content,status,source){const path=`${folder}/${id}.svg`;await mkdir(resolve(root,folder),{recursive:true});await writeFile(resolve(root,path),content,'utf8');items.push({id,name,path,status,source,sha256:createHash('sha256').update(content).digest('hex')});}
const wrap=(body,w=256,h=280)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const heroes={warrior:'雷恩·战士',archer:'薇拉·射手',mage:'伊诺·法师',tank:'布兰·坦克',assassin:'赛芙·刺客'};
const enemies={zombie:'蹒跚尸兵',wolf:'腐狼',crossbow:'教团弩手',priest:'黑潮祭司',raider:'精英掠夺者',guard:'精英盾卫',boss:'灰烬典狱长',wraith:'缚印怨灵',fanatic:'黑誓狂信徒',bishop:'黑潮主教·莫尔'};
for(const [id,name] of Object.entries(heroes)){
 await svg(`char_${id}_base_v001`,'01_人物/英雄',`${name}·旧版`,legacyCharacterSvg(id),'历史版本·未用于当前英雄',`src/game/art.ts#legacyCharacterSvg(${id})`);
 await svg(`char_${id}_base_v004`,'01_人物/英雄',name,characterSvg(id),'v004已接入·独立脸型与分组姿态',`src/game/hero-art.ts#heroSvg(${id})`);
 for(const [pose,count] of Object.entries(HERO_POSE_FRAMES))if(pose!=='idle')for(let frame=0;frame<count;frame++)await svg(`char_${id}_${pose}_${frame+1}_v004`,`01_人物/动作/${id}`,`${name}·${pose} ${frame+1}/${count}`,heroSvg(id,pose,frame),'v004已接入·有限帧矢量姿态',`src/game/hero-art.ts#heroSvg(${id},${pose},${frame})`);
}
for(const [id,name] of Object.entries(enemies))await svg(`enemy_${id}_base_v001`,'01_人物/敌人',name,characterSvg(id),'已接入·静态基形',`src/game/art.ts#characterSvg(${id})`);
for(const [id,name] of Object.entries({ash:'灰烬村道',forest:'雾林囚车',fortress:'黑石哨站',abbey:'无声修道院',crypt:'遗骨墓道'}))await svg(`map_${id}_full_v001`,'03_地图背景',name,sceneSvg(id),'已接入·完整背景',`src/game/art.ts#sceneSvg(${id})`);
await svg('ui_royal_seal_v001','05_游戏界面/标识','王印徽记',crestSvg(),'已接入·独立图形','src/game/art.ts#crestSvg');
for(let i=0;i<3;i++)await svg(`story_0${i+1}_v004`,'06_剧情插画',['公主与王印','教团掳掠','骑士追赶'][i],storySvg(i),'已接入·插画',`src/game/art.ts#storySvg(${i})`);
await svg('equip_sword_part_v001','02_装备/武器','誓约长剑部件',wrap(helpers.blade(128,180,0)),'已用部件·未作背包图标','src/game/art.ts#blade');
for(const [id,name,box] of [['archer','雾林长弓','94 28 34 104'],['mage','寒星法杖','90 0 35 150'],['tank','守望盾锤','88 55 38 92'],['assassin','夜行短刃','88 35 40 92']]){
 const cropped=legacyCharacterSvg(id).replace('width="128" height="160" viewBox="0 0 128 160"',`width="128" height="160" viewBox="${box}"`);
 await svg(`equip_${id}_crop_v001`,'02_装备/武器',`${name}·裁切参考`,cropped,'裁切参考·含手部或衣物，不作独立成品',`src/game/art.ts#characterSvg(${id})`);
}
await svg('equip_armor_crop_v001','02_装备/护甲','旅人锁甲·造型参考',legacyCharacterSvg('warrior').replace('viewBox="0 0 128 160"','viewBox="26 57 67 64"'),'裁切参考·非独立成品','src/game/art.ts#characterSvg(warrior)');
await svg('equip_charm_seal_reference_v001','02_装备/饰品','余烬吊坠·王印造型参考',crestSvg(),'旧版设计参考·现有独立吊坠图标见icon文件','src/game/art.ts#crestSvg');
await svg('obj_dead_tree_v001','04_物体/自然物','枯树',wrap(helpers.deadTree(128,245,1,'#273330')),'已用背景部件·未单独接入','src/game/art.ts#deadTree');
await svg('obj_pine_v001','04_物体/自然物','雾林松树',wrap(helpers.pine(128,250,1,'#2a4140')),'已用背景部件·未单独接入','src/game/art.ts#pine');
await svg('obj_ruin_v001','04_物体/建筑物','村庄废墟',wrap(helpers.ruin(40,250,165,160)),'已用背景部件·未单独接入','src/game/art.ts#ruin');
for(const [theme,transform,id,name,box] of [['forest','1110 312','prison_cart','囚车','-20 -100 220 190'],['fortress','765 348','prison_gate','监牢大门','-15 -250 385 270']]){
 const match=sceneSvg(theme).match(new RegExp('<g transform="translate\\('+transform+'\\)">([\\s\\S]*?)</g>'));
 if(!match)throw Error(`Missing object ${id}`);
 await svg(`obj_${id}_v001`,'04_物体/建筑物',name,`<svg xmlns="http://www.w3.org/2000/svg" width="385" height="270" viewBox="${box}">${match[1]}</svg>`,'已用背景部件·未单独接入',`src/game/art.ts#sceneSvg(${theme})`);
}
const previous=JSON.parse(await readFile(resolve(root,'99_历史版本/v0.3.0/catalog.json'),'utf8'));
for(const asset of previous.items){
 if(asset.path.startsWith('99_历史版本/')){items.push(asset);continue;}
 if(asset.id.endsWith('_v003')&&(asset.id.startsWith('char_')||asset.id.startsWith('ui_')||asset.id.startsWith('hero_'))||asset.id.startsWith('story_'))items.push({...asset,id:`history_v003_${asset.id}`,name:asset.name+'·v003对照',path:`99_历史版本/v0.3.0/${asset.path}`,status:'历史v0.3.0·已归档',source:`99_历史版本/v0.3.0/catalog.json#${asset.id}`});
}
for(const [srcPath,id,name] of [
 ['artifacts/chromium-title-1280.png','ui_title_reference_v004','标题界面'],
 ['artifacts/chromium-camp-1280.png','ui_camp_reference_v004','营地舆图'],
 ['artifacts/chromium-battle-844.png','ui_mobile_battle_reference_v004','手机横屏战斗'],
 ['artifacts/chromium-v004-heroes.png','ui_party_reference_v004','五职业与编队'],
 ['artifacts/chromium-v004-skill-mobile.png','ui_skill_reference_v004','手机职业技能徽印'],
 ['artifacts/chromium-v004-workshop-1280.png','ui_armory_reference_v004','三栏装备工坊'],
 ['artifacts/chromium-production-armory.png','ui_armory_production_reference_v004','生产版初始装备工坊']]){
 const path=`05_游戏界面/运行截图/${id}.png`;await mkdir(resolve(root,'05_游戏界面/运行截图'),{recursive:true});await copyFile(resolve(srcPath),resolve(root,path));const bytes=await readFile(resolve(root,path));items.push({id,name,path,status:srcPath.includes('production-')?'v004生产版运行参考截图·非UI切图':'v004开发版运行参考截图·非UI切图',source:srcPath,sha256:createHash('sha256').update(bytes).digest('hex')});
}
for(const [slot,hero,name] of [['weapon','warrior','誓约长剑'],['weapon','archer','雾林长弓'],['weapon','mage','寒星法杖'],['weapon','tank','守望盾锤'],['weapon','assassin','夜行双刃'],['armor',undefined,'旅人锁甲'],['charm',undefined,'余烬吊坠']]){
 const folder=slot==='weapon'?'武器':slot==='armor'?'护甲':'饰品';
 await svg(`equip_${slot}_${hero??'universal'}_icon_v001`,`02_装备/${folder}`,name,equipmentSvg(slot,hero),'已接入·独立装备图标',`src/game/art.ts#equipmentSvg(${slot},${hero??'universal'})`);
}
await svg('map_chapter1_atlas_v003','03_地图背景','第一章完整连线舆图',chapterAtlasSvg(),'v003已接入·章节地图底图','src/game/chapter-map.ts#chapterAtlasSvg');
for(const hero of Object.keys(heroes))for(let index=0;index<2;index++)await svg(`skill_${hero}_${index+1}_v003`,'05_游戏界面/技能图标',`${heroes[hero]}·${index?'大技能':'小技能'}`,skillIconSvg(hero,index),'v003已接入·职业专属图形',`src/game/skill-icons.ts#skillIconSvg(${hero},${index})`);
await mkdir(resolve(root,'01_人物/设计对照'),{recursive:true});
for(const [source,name,id] of [['artifacts/chromium-hero-v004-lineup.png','五职业v004面容与立绘','hero_lineup_v004'],['artifacts/chromium-hero-v004-poses.png','五职业80帧姿态预览','hero_poses_v004']]){
 const path=`01_人物/设计对照/${id}.png`;await copyFile(source,resolve(root,path));items.push({id,name,path,status:'v004同源矢量浏览器预览·有限帧姿态',source,sha256:createHash('sha256').update(await readFile(resolve(root,path))).digest('hex')});
}
await copyFile('artifacts/hero-v004-preview.html',resolve(root,'01_人物/设计对照/hero_motion_v004.html'));
const palette={background:'#070e18',panel:'#101c2a',gold:'#c8a66a',muted:'#91a0b1',metal:'#7f9192',outline:'#26363b',skin:'#d3b79c',qualityWhite:'#c8c8bc',qualityGreen:'#9fc18c',qualityBlue:'#8dbbd2'};
await mkdir(resolve(root,'00_规范'),{recursive:true});await writeFile(resolve(root,'00_规范/palette.json'),JSON.stringify(palette,null,2)+'\n');
await writeFile(resolve(root,'catalog.json'),JSON.stringify({version:1,gameVersion:JSON.parse(await readFile('package.json','utf8')).version,updated:'2026-10-30',runtimeSource:'src/game/art.ts',note:'本目录为现有资产导出与整理，游戏暂未改为从此目录加载。带crop/reference的文件为参考，不能当作已完成的独立游戏素材。',items},null,2)+'\n');
const sections=new Map();for(const i of items){const group=i.path.split('/')[0];if(!sections.has(group))sections.set(group,[]);sections.get(group).push(i);}
const html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>灰烬誓约·素材图鉴</title><style>body{margin:0;padding:32px;font:14px "Microsoft YaHei",sans-serif;background:#111819;color:#ded9c7}h1,h2{font-weight:400;color:#c6ac75}p{color:#a1ada4;line-height:1.8}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}article{padding:16px;background:#1a2322;border:1px solid #36463d}img{width:100%;height:180px;object-fit:contain;background:repeating-conic-gradient(#23332c 0% 25%,#1c2924 0% 50%) 50%/20px 20px}a{color:#c6ac75}small{display:block;line-height:1.8;color:#a0b19f;overflow-wrap:anywhere}</style><h1>灰烬誓约 / 素材图鉴</h1><p>2026-10-30 · 当前阶段：具象简美术。SVG可编辑。v004英雄256×320，每职业16帧/共80帧分组矢量姿态；旧版已归档，敌人仍为静态基形。<br>裁切参考、运行截图与独立资源均有状态标识；当前运行源仍是src/game/art.ts。完整清单见<a href="catalog.json">catalog.json</a>。</p>${[...sections].map(([group,list])=>`<h2>${group}</h2><div class="grid">${list.map(i=>`<article><a href="${i.path}"><img src="${i.path}" alt="${i.name}"></a><h3>${i.name}</h3><small>${i.id}<br>${i.status}<br>来源：${i.source}</small></article>`).join('')}</div>`).join('')}</html>`;
await writeFile(resolve(root,'素材图鉴.html'),html);console.log(`Exported ${items.length} assets to ${relative(process.cwd(),root)}`);
