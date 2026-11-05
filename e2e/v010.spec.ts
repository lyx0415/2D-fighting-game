import {test,expect} from '@playwright/test';
import {fixture} from '../src/core/progression';

test('修习、角色切换、重载保存、重置与战斗加成',async({page},info)=>{
 await page.goto('/');await page.waitForFunction(()=>!!(window as any).__ASHEN__);
 await page.evaluate(s=>localStorage.setItem('ashen-oath.v1',JSON.stringify(s)),fixture('growth'));await page.reload();await page.locator('[data-act=continue]').click();
 await page.locator('[data-tab=growth]').click();await expect(page.locator('[data-budget=talent]')).toContainText('9');
 await page.locator('[data-act=train-talent][data-talent=force]').click();await page.locator('[data-act=train-skill][data-index="0"]').click();
 await expect(page.locator('[data-budget=talent]')).toContainText('8');await expect(page.locator('[data-budget=skill]')).toContainText('4');
 await page.locator('.training-grid').evaluate(el=>{const container=document.querySelector('.management-content')!;container.scrollTop+=el.getBoundingClientRect().top-container.getBoundingClientRect().top-8;});
 await page.screenshot({path:`artifacts/${info.project.name}-v010-training.png`});
 await page.locator('.growth-roster [data-id=mage]').click();await expect(page.locator('[data-budget=talent]')).toContainText('9');await page.locator('.growth-roster [data-id=warrior]').click();await expect(page.locator('[data-budget=talent]')).toContainText('8');
 await page.reload();await page.locator('[data-act=continue]').click();await page.locator('[data-tab=growth]').click();await expect(page.locator('[data-budget=talent]')).toContainText('8');
 await page.evaluate(()=>(window as any).__ASHEN__.launch(1));await expect(page.locator('.party-button')).toHaveCount(4);await expect(page.locator('#skill-0')).toContainText('Lv.2');
 expect(await page.evaluate(()=>(window as any).__ASHEN__.getBattle().active.skillRanks)).toEqual([1,0]);
 await page.screenshot({path:`artifacts/${info.project.name}-v010-battle.png`});
 await page.locator('[data-act=pause]').click();await page.locator('[data-act=abandon]').click();await page.locator('[data-act=camp]').click();await page.locator('[data-tab=growth]').click();await page.locator('[data-act=reset-training]').click();await expect(page.locator('[data-budget=talent]')).toContainText('9');await expect(page.locator('[data-budget=skill]')).toContainText('5');
});

test('五场景有独立走道层，人物缩小，声音混音分组',async({page},info)=>{
 await page.goto('/');await page.waitForFunction(()=>!!(window as any).__ASHEN__);await page.evaluate(s=>(window as any).__ASHEN__.setFixture(s,'growth'),fixture('growth'));
 for(const level of [1,2,3,4,8]){await page.evaluate(n=>(window as any).__ASHEN__.launch(n),level);await expect(page.locator('.party-button')).toHaveCount(4);const rigs=await page.evaluate(()=>(window as any).__ASHEN__.getGame().inspect().rigs);expect(rigs[0].scale).toBe(.185);await page.screenshot({path:`artifacts/${info.project.name}-v010-terrain-${level}.png`});}
 const mix=await page.evaluate(async()=>{const {sound}=await import('/src/game/audio.ts' as string);sound.play('bladeSwing','attack');sound.play('sweep','skill');sound.play('warriorExert','voice');return sound.inspect().mix;});expect(mix.attack).toBeLessThan(mix.skill*.35);
 await page.setViewportSize({width:844,height:390});await page.screenshot({path:`artifacts/${info.project.name}-v010-mobile.png`});
});
