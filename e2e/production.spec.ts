import {test,expect} from '@playwright/test';
test('生产包真实开战，无调试入口、无运行错误',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');await expect(page.locator('.dev-panel')).toHaveCount(0);expect(await page.evaluate(()=>'__ASHEN__' in window)).toBe(false);
 await page.locator('[data-act="new"]').click();await page.locator('[data-act="skip-story"]').click();await page.locator('[data-tab="gear"]').click();await expect(page.locator('.equipment-cell img')).toHaveCount(3);
 expect(await page.locator('.equipment-cell img').evaluateAll(images=>images.every(i=>(i as HTMLImageElement).naturalWidth>0))).toBe(true);
 await page.screenshot({path:`artifacts/${info.project.name}-production-armory.png`,fullPage:true});await page.locator('[data-tab="map"]').click();await page.locator('.chapter-node[data-level="1"]').click();await page.locator('[data-act="start"]').click();await expect(page.locator('.party-button')).toHaveCount(1);await expect(page.locator('#skill-0')).toContainText('横扫');await page.waitForTimeout(700);await page.screenshot({path:`artifacts/${info.project.name}-production-battle.png`});expect(errors).toEqual([]);
});
