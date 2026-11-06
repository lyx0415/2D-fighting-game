import {test,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fixture} from '../src/core/progression';

test('历史十五种关节图鉴可播放暂停，非当前运行人物',async({page},info)=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/artifacts/rig-v007-preview.html');await expect(page.locator('#motion-lab article')).toHaveCount(15);
 const first=await page.locator('#motion-lab article').first().innerHTML();await page.waitForTimeout(80);expect(await page.locator('#motion-lab article').first().innerHTML()).not.toBe(first);
 await page.locator('#pause').click();const stopped=await page.locator('#motion-lab article').first().innerHTML();await page.waitForTimeout(80);expect(await page.locator('#motion-lab article').first().innerHTML()).toBe(stopped);
 await page.locator('#enemy-lineup').screenshot({path:`artifacts/${info.project.name}-v007-enemies.png`});await page.locator('#motion-lab').screenshot({path:`artifacts/${info.project.name}-v007-motion-lab.png`});
});

for(const size of [{width:1280,height:720},{width:844,height:390}])test(`地图主界面与次级整备 ${size.width}`,async({page},info)=>{
 await page.setViewportSize(size);await page.goto('/');await page.waitForFunction(()=>!!(window as any).__ASHEN__);await page.evaluate(s=>(window as any).__ASHEN__.setFixture(s,'growth'),fixture('growth'));
 await expect(page.locator('.sidebar')).toHaveCount(0);await expect(page.locator('.management-shell')).toHaveCount(0);await expect(page.locator('.chapter-node')).toHaveCount(10);
 const gap=await page.evaluate(()=>{const path=document.querySelector('.atlas-route path') as SVGPathElement,p=path.getPointAtLength(0),point=new DOMPoint(p.x,p.y).matrixTransform(path.getScreenCTM()!),node=document.querySelector('.chapter-node')!.getBoundingClientRect();return Math.hypot(point.x-node.x-node.width/2,point.y-node.y-node.height/2);});expect(gap).toBeLessThan(2);

 await page.screenshot({path:`artifacts/${info.project.name}-v007-hub-${size.width}.png`});
 await page.locator('[data-tab=gear]').click();await expect(page.locator('.management-shell')).toBeVisible();await expect(page.locator('.equipment-grid')).toBeVisible();await expect(page.locator('.embark-button')).toBeVisible();
 await page.locator('[data-tab=growth]').click();await expect(page.locator('.management-shell')).toContainText('英雄成长');await page.locator('.growth-roster [data-id=mage]').click();await expect(page.locator('.hero-detail')).toContainText('伊诺');
 await page.locator('[data-act=close-management]').click();await expect(page.locator('.management-shell')).toHaveCount(0);await expect(page.locator('.chapter-chart')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

test('连续关节实际播放，敌人动作与反馈，暂停冻结',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.waitForFunction(()=>!!(window as any).__ASHEN__);await page.evaluate(s=>{const d=(window as any).__ASHEN__;d.setFixture(s,'squad');d.launch(3);},fixture('squad'));await expect(page.locator('.party-button')).toHaveCount(4);
 await page.evaluate(()=>{const b=(window as any).__ASHEN__.getBattle();b.active.attackTimer=99;b.command({type:'move',point:{x:440,y:500}});});
 const first=await page.evaluate(()=>(window as any).__ASHEN__.getGame().inspect());await page.waitForTimeout(70);const second=await page.evaluate(()=>(window as any).__ASHEN__.getGame().inspect());expect(JSON.stringify(first.rigs[0])).not.toBe(JSON.stringify(second.rigs[0]));expect(second.rigs.some((r:any)=>r.id.startsWith('enemy-')&&r.renderer==='painted-sprite')).toBe(true);
 await page.evaluate(()=>{const b=(window as any).__ASHEN__.getBattle();b.active.move=undefined;b.active.lockUntil=0;b.active.cd=[0,0];const e=b.enemies[0];e.x=b.active.x+40;e.y=b.active.y;e.hp=999;e.attackTimer=99;e.speed=0;});await page.locator('#skill-0').click();if(await page.evaluate(()=>typeof globalThis.AudioContext!=='undefined'))await expect.poll(()=>page.evaluate(async()=>{const m=await import('/src/game/audio.ts' as string);return m.sound.context?.state;})).toBe('running');
 await expect.poll(()=>page.evaluate(()=>(window as any).__ASHEN__.getGame().inspect().cues.includes('sweep'))).toBe(true);await page.screenshot({path:`artifacts/${info.project.name}-v007-combat.png`});
 await page.locator('[data-act=pause]').click();const paused=await page.evaluate(()=>(window as any).__ASHEN__.getGame().inspect().rigs);await page.waitForTimeout(100);expect(await page.evaluate(()=>(window as any).__ASHEN__.getGame().inspect().rigs)).toEqual(paused);expect(errors).toEqual([]);
});

test('差异音效离线渲染有波形且无削波，导出试听WAV',async({page},info)=>{
 await page.goto('/');test.skip(await page.evaluate(()=>typeof globalThis.OfflineAudioContext==='undefined'),'当前Windows Playwright WebKit没有提供Web Audio API；不能据此替代Safari真机音频验证');const rendered=await page.evaluate(async()=>{
  const {AUDIO_CUES}=await import('/src/game/audio-cues.ts' as string),{renderCue}=await import('/src/game/audio.ts' as string),output=[];
  for(const cue of Object.keys(AUDIO_CUES)){const buffer=await renderCue(cue),samples=buffer.getChannelData(0);let peak=0,power=0;const pcm=[];for(const x of samples){peak=Math.max(peak,Math.abs(x));power+=x*x;pcm.push(Math.round(Math.max(-1,Math.min(1,x))*32767));}output.push({cue,peak,rms:Math.sqrt(power/samples.length),rate:buffer.sampleRate,pcm});}return output;
 });
 const hashes=new Set();if(info.project.name==='chromium')mkdirSync('artifacts/audio-v007',{recursive:true});
 for(const audio of rendered){expect(audio.peak).toBeGreaterThan(.01);expect(audio.peak).toBeLessThan(1);expect(audio.rms).toBeGreaterThan(.001);const body=Buffer.alloc(audio.pcm.length*2);audio.pcm.forEach((x:number,i:number)=>body.writeInt16LE(x,i*2));hashes.add(createHash('sha256').update(body).digest('hex'));
  if(info.project.name==='chromium'){const wav=Buffer.alloc(44+body.length);wav.write('RIFF');wav.writeUInt32LE(36+body.length,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(audio.rate,24);wav.writeUInt32LE(audio.rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(body.length,40);body.copy(wav,44);writeFileSync(`artifacts/audio-v007/${audio.cue}.wav`,wav);}
 }
 expect(hashes.size).toBe(rendered.length);writeFileSync(`artifacts/${info.project.name}-audio-v007-report.json`,JSON.stringify(rendered.map(({pcm,...r}:any)=>r),null,2));
});
