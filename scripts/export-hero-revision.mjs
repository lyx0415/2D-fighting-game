import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {heroSvg,heroPortraitSvg,heroRig,HERO_POSE_FRAMES} from '../src/game/hero-art.ts';
import {storySvg} from '../src/game/art.ts';
const root=resolve('素材库'),old=JSON.parse(await readFile(resolve(root,'99_历史版本/v0.6.0/catalog.json'),'utf8'));
const heroes={warrior:'雷恩',archer:'薇拉',mage:'伊诺',tank:'布兰',assassin:'赛芙'};
const changed=i=>!i.path.startsWith('99_')&&(i.id.startsWith('char_')&&!i.id.endsWith('v001')||i.id.startsWith('portrait_')||Object.keys(heroes).some(h=>i.id.startsWith(`rig_${h}_`))||i.id.startsWith('hero_')||i.id.startsWith('story_')||i.id.startsWith('ui_')&&i.id.includes('reference'));
const items=old.items.map(i=>changed(i)?{...i,id:'history_v006_'+i.id,path:'99_历史版本/v0.6.0/'+i.path,status:'历史v006·重绘前对照'}:i);
async function put(id,folder,name,body,source){const path=`${folder}/${id}.svg`;await mkdir(resolve(root,folder),{recursive:true});await writeFile(resolve(root,path),body);items.push({id,name,path,status:'v007运行同源·暗黑中世纪重绘',source,sha256:createHash('sha256').update(body).digest('hex')});}
for(const [id,name] of Object.entries(heroes)){
 await put(`char_${id}_base_v007`,'01_人物/英雄',name,heroSvg(id),'src/game/hero-art.ts#heroSvg');
 for(const [pose,n] of Object.entries(HERO_POSE_FRAMES))if(pose!=='idle')for(let f=0;f<n;f++)await put(`char_${id}_${pose}_${f+1}_v007`,`01_人物/动作/${id}`,`${name} ${pose} ${f+1}`,heroSvg(id,pose,f),'src/game/hero-art.ts#heroSvg');
 for(const view of ['front','threeQuarter','profile'])await put(`portrait_${id}_${view}_v007`,'01_人物/面容角度',`${name} ${view}`,heroPortraitSvg(id,view),'src/game/hero-art.ts#heroPortraitSvg');
 const rig=heroRig(id),manifest={kind:id,...rig,parts:[]};
 for(const part of rig.parts){const asset=`rig_${id}_${part.id}_v007`;await put(asset,`01_人物/关节分层/英雄/${id}`,`${name} ${part.id}`,part.svg,'src/game/hero-art.ts#heroRig');const {svg,...fields}=part;manifest.parts.push({...fields,path:asset+'.svg'});}
 await writeFile(resolve(root,`01_人物/关节分层/英雄/${id}/rig_v007.json`),JSON.stringify(manifest,null,2));
}
for(let i=0;i<3;i++)await put(`story_0${i+1}_v007`,'06_剧情插画',`序章${i+1}`,storySvg(i),'src/game/art.ts#storySvg');
for(const [source,id,folder] of [
 ['chromium-hero-v007-lineup.png','hero_lineup_v007','01_人物/设计对照'],['chromium-hero-v007-poses.png','hero_poses_v007','01_人物/设计对照'],['chromium-hero-v007-faces.png','hero_faces_v007','01_人物/设计对照'],
 ['chromium-v007-heroes.png','ui_party_reference_v007','05_游戏界面/运行截图'],['chromium-production-battle.png','ui_battle_reference_v007','05_游戏界面/运行截图']]){
 const path=`${folder}/${id}.png`;await copyFile('artifacts/'+source,resolve(root,path));items.push({id,name:id,path,status:'v007实际浏览器截图·非UI切片',source:'artifacts/'+source,sha256:createHash('sha256').update(await readFile(resolve(root,path))).digest('hex')});
}
for(const name of ['hero','rig'])await copyFile(`artifacts/${name}-v007-preview.html`,resolve(root,`01_人物/设计对照/${name}_motion_v007.html`));
await writeFile(resolve(root,'catalog.json'),JSON.stringify({...old,gameVersion:'0.7.0',updated:'2026-10-30',items},null,2));
const current=items.filter(i=>i.status.startsWith('v007'));
await writeFile(resolve(root,'人物重绘v007.html'),`<!doctype html><meta charset="utf-8"><title>灰烬誓约·人物重绘v007</title><style>body{background:#10151a;color:#c2b69e;font:15px sans-serif;margin:30px}a{color:#c7ad76}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}article{background:#1b2229;padding:15px}img{width:100%;height:270px;object-fit:contain}</style><h1>人物重绘 v007</h1><p>暗钢、旧皮、灰麻与自然面容。<a href="01_人物/设计对照/rig_motion_v007.html">连续动作预览</a> · <a href="01_人物/设计对照/hero_motion_v007.html">面容与姿态</a> · <a href="catalog.json">全量清单</a></p><div class="grid">${current.filter(i=>i.id.includes('_base_')||i.id.startsWith('portrait_')).map(i=>`<article><img src="${i.path}"><p>${i.name}</p></article>`).join('')}</div>`);
let gallery=await readFile(resolve(root,'素材图鉴.html'),'utf8');gallery=gallery.replace('<h1>','<p><a href="人物重绘v007.html">进入最新v007人物重绘与动作图鉴</a>（下方为v006归档索引，完整最新清单见catalog.json）</p><h1>');await writeFile(resolve(root,'素材图鉴.html'),gallery);
console.log('Exported v007 hero revision, catalog:',items.length);
