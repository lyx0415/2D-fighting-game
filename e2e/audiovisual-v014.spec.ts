import {test,expect} from '@playwright/test';
import {fixture} from '../src/core/progression';
import type {SaveData} from '../src/core/types';
import type {Sound} from '../src/game/audio';

const saveKey='ashen-oath.v1';

for(const size of [{width:1280,height:720},{width:844,height:390},{width:390,height:844}]){
 test(`出征整备展示真实敌情并往返工坊和修习 ${size.width}`,async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize(size);
  await page.goto('/');
  await page.evaluate(([key,save])=>localStorage.setItem(key,JSON.stringify(save)),[saveKey,fixture('growth')] as const);
  await page.reload();
  await page.locator('[data-act=continue]').tap();
  await page.locator('.chapter-node[data-level="1"]').tap();
  await expect(page.locator('.briefing-cover')).toHaveCSS('background-image',/v014\/ashen-border/);
  await expect.poll(()=>page.evaluate(async()=>{const image=new Image();image.src='/assets/v014/ashen-border.webp';await image.decode();return image.naturalWidth;})).toBe(1536);
  const footer=page.locator('[data-act=start]');
  await expect(footer).toBeInViewport({ratio:1});
  if(size.width>390){
   await expect(page.locator('[data-act=briefing-gear]')).toBeInViewport({ratio:1});
   await expect(page.locator('.briefing-intel summary')).toBeInViewport({ratio:1});
  }
  expect((await footer.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  await page.screenshot({path:`artifacts/${info.project.name}-v014-briefing-${size.width}.png`});
  await page.locator('.briefing-intel summary').tap();
  await expect(page.locator('.briefing-intel .enemy-ledger')).toContainText('蹒跚尸兵');
  await page.locator('[data-contract=veteran]').tap();
  await page.locator('[data-act=set-leader][data-id=archer]').tap();
  await expect(page.locator('.briefing-rewards')).toContainText('薇拉');
  await page.locator('[data-act=briefing-gear]').tap();
  await expect(page.locator('.equipment-grid')).toBeVisible();
  await page.locator('[data-act=return-briefing]').tap();
  await expect(page.locator('[data-contract=veteran]')).toHaveAttribute('aria-pressed','true');
  await page.locator('[data-act=briefing-growth]').tap();
  await expect(page.locator('.training-grid')).toBeVisible();
  await expect(page.locator('.growth-summary')).toContainText('薇拉');
  await page.locator('[data-talent=vitality]').tap();
  await page.locator('[data-act=return-briefing]').tap();
  await expect(page.locator('.briefing-rewards')).toContainText('薇拉');
  await expect(page.locator('[data-act=briefing-growth]')).toContainText('55 点可分配');
  await expect(footer).toBeInViewport({ratio:1});
  expect(errors).toEqual([]);
 });
}

test('生产短横屏支持战斗暂停混音、音量恢复和跨刷新持久化',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.setViewportSize({width:844,height:390});
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('[data-act=new]').tap();
 await page.locator('[data-act=skip-story]').tap();
 await page.locator('.chapter-node[data-level="1"]').tap();
 const portrait=page.locator('.briefing-hero img');
 await expect(portrait).toHaveCount(1);
 await expect(portrait).toBeInViewport();
 await page.locator('[data-act=start]').tap();
 await expect(page.locator('.party-button')).toHaveCount(1);
 await page.locator('[data-act=pause]').tap();
 await page.locator('.pause-modal [data-act=settings]').tap();
 await page.locator('#volume').fill('0.65');
 await page.locator('#mix-music').fill('0.25');
 for(const input of ['volume','mix-music'])await page.locator('#'+input).dispatchEvent('change');
 await expect(page.locator('output[for=mix-music]')).toHaveText('25%');
 await page.screenshot({path:`artifacts/${info.project.name}-v014-sound.png`});
 await page.keyboard.press('Escape');
 await expect(page.locator('.pause-modal')).toBeVisible();
 await page.locator('.pause-modal [data-act=sound]').tap();
 await page.locator('.pause-modal [data-act=sound]').tap();
 await page.locator('[data-act=resume]').tap();
 await expect(page.locator('.pause-modal')).toHaveCount(0);
 await expect(page.locator('[data-act=skill]').first()).toBeVisible();
 await page.reload();
 await page.locator('[data-act=settings]').tap();
 await expect(page.locator('#volume')).toHaveValue('0.65');
 await expect(page.locator('#mix-music')).toHaveValue('0.25');
 const save=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!) as SaveData,saveKey);
 expect(save.settings.volume).toBe(.65);
 expect(errors).toEqual([]);
});

test('首领战触发配乐分层，预警与落地通过不同采样',async({page})=>{
 await page.goto('/');
 await page.evaluate(([key,save])=>localStorage.setItem(key,JSON.stringify(save)),[saveKey,fixture('squad')] as const);
 await page.reload();
 await page.locator('[data-act=continue]').tap();
 const state=()=>page.evaluate(async():Promise<ReturnType<Sound['inspect']>>=>(await import('/src/game/audio.ts' as string)).sound.inspect());
 await expect.poll(async()=>(await state()).score.stems).toBeGreaterThan(0);
 await page.locator('.chapter-node[data-level="3"]').tap();
 await page.locator('[data-act=start]').tap();
 await expect(page.locator('.party-button')).toHaveCount(4);
 await expect.poll(async()=>(await state()).score.mode).toBe('combat');
 await page.evaluate(()=>{
  const battle=(window as any).__ASHEN__.getBattle();
  battle.debugNextWave();
 });
 await expect.poll(async()=>(await state()).score.mode).toBe('travel');
 await page.evaluate(()=>{
  const battle=(window as any).__ASHEN__.getBattle();
  let active=battle.active;
  active.x=battle.stageEnd-50;active.move={x:battle.stageEnd+50,y:active.y};battle.step();
  battle.debugNextWave();active.x=battle.stageEnd-50;active.move={x:battle.stageEnd+50,y:active.y};battle.step();
  const boss=battle.enemies.find((enemy:any)=>enemy.kind==='boss');
  if(boss){boss.specialTimer=0;boss.x=active.x+125;boss.y=active.y;}
 });
 await expect.poll(async()=>(await state()).score.mode).toBe('boss');
 await expect.poll(async()=>(await state()).recent.map(e=>e.sample)).toContain('warden-warning');
 await expect.poll(async()=>(await state()).recent.map(e=>e.sample)).toContain('warden-impact');
 await page.locator('[data-act=pause]').tap();
 await expect.poll(async()=>(await state()).score.paused).toBe(true);
});
