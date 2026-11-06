import {test,expect} from '@playwright/test';
import {fixture} from '../src/core/progression';

test('音色三方案试听与发力开关保存',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-act=settings]').click();
 const manifest=await (await page.request.get('/audio/v011/manifest.json')).json();expect(manifest.files).toHaveLength(72);for(const f of manifest.files){const response=await page.request.get('/audio/v011/'+f.file);expect(response.ok()).toBe(true);expect((await response.body()).subarray(0,4).toString()).toBe('RIFF');}
 for(const profile of ['grounded','feral','mystic']){await page.locator(`[data-profile=${profile}]`).click();await page.locator('[data-act=audio-preview][data-cue=warriorExert]').click();expect(await page.evaluate(async()=>{const {sound}=await import('/src/game/audio.ts' as string);return sound.inspect().profile;})).toBe(profile);}
 await page.locator('[data-act=exertions]').click();await expect(page.locator('[data-act=exertions]')).toContainText('关闭');await page.screenshot({path:`artifacts/${info.project.name}-v011-audio.png`});
 await page.reload();await page.locator('[data-act=settings]').click();await expect(page.locator('[data-profile=mystic]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('[data-act=exertions]')).toContainText('关闭');expect(errors).toEqual([]);
});

for(const size of [{width:1280,height:720},{width:844,height:390}])test(`紧凑整备、搜索和修习 ${size.width}`,async({page},info)=>{
 await page.setViewportSize(size);await page.goto('/');await page.waitForFunction(()=>!!(window as any).__ASHEN__);await page.evaluate(s=>(window as any).__ASHEN__.setFixture(s,'growth'),fixture('growth'));await page.locator('[data-tab=gear]').click();
 for(const selector of ['#gear-search','[data-act=gear-filter-toggle]','.warehouse-heading [data-act=gear-reset]'])expect((await page.locator(selector).boundingBox())!.height).toBeGreaterThanOrEqual(48);
 await page.locator('#gear-search').fill('夜行');await page.locator('#gear-search').press('Enter');await page.locator('#gear-search').blur();await expect(page.locator('.equipment-cell')).toHaveCount(2);await page.locator('.warehouse-heading [data-act=gear-reset]').click();
 await expect(page.locator('[data-act=gear-hero][data-id=mage]')).toBeVisible();await page.screenshot({path:`artifacts/${info.project.name}-v011-workshop-${size.width}.png`});
 await page.locator('[data-tab=growth]').click();await page.locator('[data-act=train-talent][data-talent=force]').click();await expect(page.locator('[data-budget=talent]')).toContainText('8');await expect(page.locator('[data-act=reset-training]')).toBeVisible();await expect(page.locator('.growth-roster')).toBeVisible();await page.screenshot({path:`artifacts/${info.project.name}-v011-training-${size.width}.png`});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

test('防御持续声与特效跟随状态，暂停和退场回收',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.waitForFunction(()=>!!(window as any).__ASHEN__);await page.evaluate(s=>{const d=(window as any).__ASHEN__;d.setFixture(s,'growth');d.launch(3);},fixture('growth'));await expect(page.locator('.party-button')).toHaveCount(4);
 await page.locator('#skill-1').click();await expect.poll(()=>page.evaluate(async()=>{const {sound}=await import('/src/game/audio.ts' as string);return sound.inspect().sustains;})).toContain('warrior:ward');await page.waitForTimeout(700);
 await page.screenshot({path:`artifacts/${info.project.name}-v011-ward.png`});await page.locator('[data-act=pause]').click();expect(await page.evaluate(async()=>{const {sound}=await import('/src/game/audio.ts' as string);return sound.inspect().paused;})).toBe(true);
 await page.locator('[data-act=resume]').click();await page.evaluate(()=>{const b=(window as any).__ASHEN__.getBattle();b.active.shield=0;});await expect.poll(()=>page.evaluate(async()=>{const {sound}=await import('/src/game/audio.ts' as string);return sound.inspect().sustains;})).not.toContain('warrior:ward');
 await page.locator('[data-act=pause]').click();await page.locator('[data-act=abandon]').click();await page.locator('[data-act=camp]').click();await expect.poll(()=>page.evaluate(async()=>{const {sound}=await import('/src/game/audio.ts' as string);return sound.inspect().sustains.length;})).toBe(0);expect(errors).toEqual([]);
});

test('Boss体型、蓄力预警与冲击特效实际绘制',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.waitForFunction(()=>!!(window as any).__ASHEN__);await page.evaluate(s=>{const d=(window as any).__ASHEN__;d.setFixture(s,'growth');d.launch(3);},fixture('growth'));await expect(page.locator('.party-button')).toHaveCount(4);
 await page.evaluate(()=>{const b=(window as any).__ASHEN__.getBattle();b.debugNextWave();b.active.x=b.stageEnd-50;b.step();b.debugNextWave();b.active.x=b.stageEnd-50;b.step();for(const u of b.heroes){u.x=b.wave*2200+500;u.y=500;u.attackTimer=99;u.cd=[99,99];u.stunUntil=99;}b.active.stunUntil=0;const boss=b.enemies[0];boss.specialTimer=.05;boss.x=b.active.x+170;boss.y=500;boss.attackTimer=99;});
 await expect.poll(()=>page.evaluate(()=>(window as any).__ASHEN__.getBattle().hazards.length)).toBeGreaterThan(0);await expect.poll(()=>page.evaluate(()=>Math.abs((window as any).__ASHEN__.getGame().inspect().cameraX-((window as any).__ASHEN__.getBattle().active.x-640)))).toBeLessThan(30);await page.screenshot({path:`artifacts/${info.project.name}-v011-boss.png`});await page.waitForTimeout(900);await page.screenshot({path:`artifacts/${info.project.name}-v011-boss-impact.png`});expect(await page.evaluate(()=>(window as any).__ASHEN__.getGame().inspect().rigs.find((r:any)=>r.kind==='boss').scale)).toBe(.39);expect(errors).toEqual([]);
});
