import {test,expect} from '@playwright/test';
test('音色图鉴同一cue三版本切换、音量与循环可用',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/artifacts/showcase-v011.html');await expect(page.locator('.profile-card')).toHaveCount(3);
 await expect(page.locator('.profile-card[data-profile=grounded] audio')).toHaveAttribute('src','/audio/v011/grounded/warriorExert.wav');await page.locator('#cue').selectOption('wardSustain');await page.locator('#loop').check();
 for(const profile of ['grounded','feral','mystic']){const player=page.locator(`.profile-card[data-profile=${profile}] audio`);await expect(player).toHaveAttribute('src',`/audio/v011/${profile}/wardSustain.wav`);expect(await player.evaluate((a:HTMLAudioElement)=>a.loop)).toBe(true);}
 await page.locator('#cue').selectOption('fireHit');expect(await page.locator('audio').first().evaluate((a:HTMLAudioElement)=>a.loop)).toBe(false);await page.locator('#audition-volume').evaluate((el:HTMLInputElement)=>{el.value='.25';el.dispatchEvent(new Event('input',{bubbles:true}));});expect(await page.locator('audio').first().evaluate((a:HTMLAudioElement)=>a.volume)).toBe(.25);expect(errors).toEqual([]);
});
