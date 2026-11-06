import {test,expect} from '@playwright/test';
import {fixture} from '../src/core/progression';

test('章节入场约一秒、期间不受伤，缩小人物和多角度形象',async({page},info)=>{
 await page.goto('/');await page.waitForFunction(()=>!!(window as any).__ASHEN__);
 await page.evaluate(s=>(window as any).__ASHEN__.setFixture(s,'growth'),fixture('growth'));
 await page.locator('[data-tab=heroes]').click();await expect.poll(()=>page.locator('.hero-portrait img').evaluateAll(imgs=>imgs.every(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).src.includes('/assets/v009/')))).toBe(true);
 await page.screenshot({path:`artifacts/${info.project.name}-v009-roster.png`});
 await page.evaluate(()=>{(window as any).__entryStart=performance.now();(window as any).__ASHEN__.launch(1);});
 await expect(page.locator('.chapter-loading')).toBeVisible();expect(await page.evaluate(()=>(window as any).__ASHEN__.getBattle().time)).toBe(0);
 await page.screenshot({path:`artifacts/${info.project.name}-v009-entry.png`});
 await expect(page.locator('.party-button')).toHaveCount(4);await expect(page.locator('.chapter-loading')).toHaveCount(0);
 expect(await page.evaluate(()=>performance.now()-(window as any).__entryStart)).toBeGreaterThanOrEqual(1000);
 await expect.poll(()=>page.evaluate(()=>(window as any).__ASHEN__.getBattle().time)).toBeGreaterThan(0);
 const rigs=await page.evaluate(()=>(window as any).__ASHEN__.getGame().inspect().rigs);expect(rigs[0].scale).toBe(.185);expect(rigs[0].texture).toBe('painted:stances');
 await page.screenshot({path:`artifacts/${info.project.name}-v009-battle.png`});
 const canvas=(await page.locator('canvas').boundingBox())!;
 await page.touchscreen.tap(canvas.x+canvas.width*.1,canvas.y+canvas.height*.35);expect(await page.evaluate(()=>(window as any).__ASHEN__.getBattle().active.move)).toBeUndefined();
 await page.touchscreen.tap(canvas.x+canvas.width*.7,canvas.y+canvas.height*.75);expect(await page.evaluate(()=>(window as any).__ASHEN__.getBattle().active.move)).toBeTruthy();
 await page.locator('[data-act=pause]').click();expect(await page.evaluate(async()=>{const {sound}=await import('/src/game/audio.ts' as string);return sound.inspect().paused;})).toBe(true);
});

test('入场中失焦保持暂停，恢复由玩家决定',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>!!(window as any).__ASHEN__);
 await page.evaluate(s=>{(window as any).__ASHEN__.setFixture(s,'squad');(window as any).__ASHEN__.launch(3);window.dispatchEvent(new Event('blur'));},fixture('squad'));
 await expect(page.locator('.chapter-loading')).toHaveCount(0);await expect(page.locator('.pause-modal')).toBeVisible();expect(await page.evaluate(()=>(window as any).__ASHEN__.getBattle().paused)).toBe(true);
 await page.locator('[data-act=resume]').click();expect(await page.evaluate(()=>(window as any).__ASHEN__.getBattle().paused)).toBe(false);
});

test('差异声音文件完整、实际解码与环境声切换',async({page},info)=>{
 await page.goto('/');await page.locator('[data-act=settings]').click();
 const manifest=await (await page.request.get('/audio/v010/manifest.json')).json();expect(manifest.files.filter((f:any)=>!f.id.startsWith('ambient-')).length).toBe(44);expect(new Set(manifest.files.map((f:any)=>f.sha256)).size).toBe(50);
 for(const file of manifest.files){expect(file.peak).toBeLessThan(1);expect(file.rms).toBeGreaterThan(.002);const response=await page.request.get('/audio/v010/'+file.file);expect(response.ok()).toBe(true);expect((await response.body()).subarray(0,4).toString()).toBe('RIFF');}
 const supported=await page.evaluate(()=>typeof AudioContext!=='undefined');
 if(supported){await expect.poll(()=>page.evaluate(async()=>{const {sound}=await import('/src/game/audio.ts' as string);return sound.inspect().decoded.length;})).toBeGreaterThanOrEqual(44);}
 await page.evaluate(async()=>{const {sound}=await import('/src/game/audio.ts' as string);sound.setAmbience('forest');});
 await expect.poll(()=>page.evaluate(async()=>{const {sound}=await import('/src/game/audio.ts' as string);return sound.inspect().ambientActive;})).toBe(true);
 await page.locator('#volume').evaluate((el:HTMLInputElement)=>{el.value='0';el.dispatchEvent(new Event('change',{bubbles:true}));});expect(await page.evaluate(async()=>{const {sound}=await import('/src/game/audio.ts' as string);return sound.inspect().volume;})).toBe(0);
 test.info().annotations.push({type:'audio-backend',description:supported?'WebAudio decoding verified':'HTMLAudio fallback verified; no WebAudio API in this Windows runtime'});
});
