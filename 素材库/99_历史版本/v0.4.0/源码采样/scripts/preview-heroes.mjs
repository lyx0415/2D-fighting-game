import {writeFile,mkdir} from 'node:fs/promises';
import {heroSvg,HERO_POSE_FRAMES} from '../src/game/hero-art.ts';
const names={warrior:'雷恩 · 战士',archer:'薇拉 · 射手',mage:'伊诺 · 法师',tank:'布兰 · 坦克',assassin:'赛芙 · 刺客'};
const notes={warrior:'方颌 · 宽眉骨 · 钢刃重步',archer:'柔和颊线 · 轻步张弓',mage:'修长面容 · 秘仪举杖',tank:'宽厚方脸 · 老兵重盾',assassin:'窄颌高颧 · 伏身双刃'};
const poseNames={idle:'待机',move:'行走',attack:'普攻',skill0:'小技能',skill1:'大技能',hit:'受击',dead:'倒地'};
const url=svg=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
let html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>灰烬誓约 · 英雄v004姿态图鉴</title><style>
*{box-sizing:border-box}body{margin:0;background:#091421;color:#d7c39b;font:13px "Microsoft YaHei",sans-serif;padding:30px;width:1440px}h1{font:30px "SimSun",serif;letter-spacing:5px;margin:0 0 12px}p{font-size:11px;color:#93a8ba;line-height:1.8}#lineup{padding:24px;background:radial-gradient(ellipse at 50% 30%,#263c50,#0b1827 65%);border:1px solid #816d48}.roster{display:grid;grid-template-columns:repeat(5,1fr);gap:15px}.portrait{text-align:center;border:1px solid #344a60;background:#0b182580;padding:14px}.face{height:106px;width:118px;object-fit:contain;background:#192a3c;border:1px solid #6f654b}.full{display:block;width:192px;height:240px;object-fit:contain;margin:auto}.portrait h2{font:20px "SimSun",serif;letter-spacing:2px}.portrait p{font-size:10px}.motion-row{margin-top:25px;padding:20px;border:1px solid #354b60;background:#101f30}.motion-row h2{font:22px "SimSun",serif}.frames{display:grid;grid-template-columns:repeat(16,1fr);gap:3px}.frame{background:#0b1725;text-align:center;min-width:0;border:1px solid #2a3b4c}.frame img{width:100%;height:auto}.frame small{display:block;font-size:8px;color:#a5b5c2;padding:6px 0;white-space:nowrap}.motion-row p{margin:0 0 15px}a{color:#d7bc88}
</style><section id="lineup"><h1>灰烬誓约 / 英雄 v004</h1><p>职业面容与肢体姿态 · 原创可编辑矢量 · 256 × 320 / 脚底 (128, 300)</p><div class="roster">`;
for(const [id,name] of Object.entries(names)){
 const svg=heroSvg(id),face=svg.replace('width="256" height="320" viewBox="0 0 256 320"','width="118" height="106" viewBox="94 22 65 82"');
 html+=`<article class="portrait"><img class="face" src="${url(face)}" alt="${name}面容"/><img class="full" src="${url(svg)}" alt="${name}"/><h2>${name}</h2><p>${notes[id]}</p></article>`;
}
html+='</div></section><section id="poses">';
for(const [id,name] of Object.entries(names)){
 html+=`<section class="motion-row"><h2>${name}</h2><p>待机 1 · 行走 4 · 普攻 3 · 小技能 3 · 大技能 3 · 受击 1 · 倒地 1</p><div class="frames">`;
 for(const [pose,count] of Object.entries(HERO_POSE_FRAMES))for(let frame=0;frame<count;frame++)html+=`<div class="frame"><img src="${url(heroSvg(id,pose,frame))}" alt="${name} ${poseNames[pose]} ${frame+1}"/><small>${poseNames[pose]} ${frame+1}/${count}</small></div>`;
 html+='</div></section>';
}
html+='</section><p>本图为有限帧矢量姿态；运行时按战斗模拟时钟播放，暂停时冻结。不是骨骼动画或逐帧手绘资源。场景接入见 src/game/scene.ts、src/game/hero-motion.ts。</p></html>';
await mkdir('artifacts',{recursive:true});await writeFile('artifacts/hero-v004-preview.html',html);
console.log('Generated hero-v004-preview.html: 80 frames and 5 face details');
