import {copyFile,mkdir,readFile,writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';
import {createHash} from 'node:crypto';

const library='素材库';
const catalog=JSON.parse(await readFile(`${library}/catalog.json`,'utf8'));
const items=catalog.items.filter(item=>!item.id.startsWith('v014_'));

async function add(id,name,source,path,status='运行同源导出'){
 const target=`${library}/${path}`;
 await mkdir(dirname(target),{recursive:true});
 await copyFile(source,target);
 const data=await readFile(target);
 items.push({id:`v014_${id}`,name,path,source,status,sha256:createHash('sha256').update(data).digest('hex')});
}

const drawing='03_地图背景/远征插图v014/ashen-border.webp';
const audio='07_音频特效/章节原声v014';
await add('border','灰烬边境远征插画','public/assets/v014/ashen-border.webp',drawing);
const manifest=JSON.parse(await readFile('public/audio/v014/manifest.json','utf8'));
for(const entry of manifest.files)await add(entry.file,entry.description,`public/audio/v014/${entry.file}`,`${audio}/${entry.file}`);
await add('audio_manifest','原创音频清单','public/audio/v014/manifest.json',`${audio}/manifest.json`);
const mobile='05_游戏界面/运行截图/ui_briefing-844_v014.png';
const desktop='05_游戏界面/运行截图/ui_briefing-1280_v014.png';
const mixer='05_游戏界面/运行截图/ui_audio-mix_v014.png';
await add('screen_mobile','短横屏出征整备','artifacts/chromium-v014-briefing-844.png',mobile,'Chromium 触屏模拟截图');
await add('screen_desktop','桌面出征整备','artifacts/chromium-v014-briefing-1280.png',desktop,'Chromium 截图');
await add('screen_mix','战斗暂停的四路混音','artifacts/chromium-v014-sound.png',mixer,'Chromium 生产构建截图');
const html=`<!doctype html>
<html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>灰烬誓约 · 远征整备与章节原声</title>
<style>
body{margin:0;background:#0c131e;color:#ded6c9;font:16px/1.6 system-ui}main{max-width:1100px;margin:auto;padding:24px}h1,h2{color:#edcea1;font-family:serif}a{color:#b6d1df}img{display:block;max-width:100%;height:auto;margin:12px 0;border:1px solid #927755}.samples{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:12px}article{padding:14px;background:#152433}audio{width:100%;margin-top:6px}
</style>
<main><h1>远征整备与章节原声</h1><p>灰烬誓约 v0.14.0 · 2026-11-19</p>
<p><a href="../docs/版本记录/v0.14.0_远征整备与章节原声.md">来源、提示词与运行说明</a> · <a href="移动发布v013.html">v0.13 素材图鉴</a></p>
<h2>灰烬边境</h2><img src="${drawing}" alt="灰烬边境远征插画">
<h2>浏览器实测画面</h2><img src="${desktop}" alt="桌面出征整备"><img src="${mobile}" alt="844×390 模拟触屏整备"><img src="${mixer}" alt="战斗暂停状态下的四路混音设置">
<h2>原创配乐及首领音效试听</h2><p>每条素材独立试听。游戏会根据战况混合前两条同拍配乐。</p>
<div class="samples">${manifest.files.map(item=>`<article><strong>${item.description}</strong><br><small>${item.file} · ${item.duration} 秒</small><audio controls preload="none" src="${audio}/${item.file}"></audio></article>`).join('')}</div></main></html>`;
await writeFile(`${library}/远征整备与原声v014.html`,html);
await writeFile(`${library}/素材图鉴.html`,html);
await writeFile(`${library}/catalog.json`,JSON.stringify({...catalog,gameVersion:'0.14.0',updated:'2026-11-19',note:'远征绘画、章节原声、首领音效与出征整备截图；保留历史素材',items},null,2));
console.log(items.length,'asset entries');
