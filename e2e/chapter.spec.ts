import {test,expect} from '@playwright/test';
import {fixture} from '../src/core/progression';
test('旧版第三关存档自动续接第四关，地图展示十关',async({page},info)=>{
 const old=fixture('squad');old.unlocked=3;old.cleared=[1,2,3];const inventory=JSON.stringify(old.inventory);
 await page.goto('/');await page.evaluate(s=>localStorage.setItem('ashen-oath.v1',JSON.stringify(s)),old);await page.reload();await page.locator('[data-act=continue]').click();await expect(page.locator('.chapter-node')).toHaveCount(10);await expect(page.locator('.expedition-brief')).toContainText('朝圣者旧道');
 expect(await page.evaluate(()=>JSON.stringify((window as any).__ASHEN__.getSave().inventory))).toBe(inventory);
 await page.locator('.chapter-node[data-level="4"]').click();await page.locator('[data-act=start]').click();await expect(page.locator('.party-button')).toHaveCount(4);await page.screenshot({path:`artifacts/${info.project.name}-chapter-level4.png`});
});
test('修道院与墓道可开战，新增敌人资源无加载错误',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.waitForFunction(()=>!!(window as any).__ASHEN__);
 for(const level of [5,7]){await page.evaluate(n=>{const d=(window as any).__ASHEN__;d.setFixture(d.fixture('growth'),'growth');d.launch(n);},level);await expect(page.locator('.party-button')).toHaveCount(4);await page.waitForTimeout(350);await page.screenshot({path:`artifacts/${info.project.name}-chapter-level${level}.png`});}
 expect(errors).toEqual([]);
});
test('章节Boss独立名称、圆阵预警与结尾展示',async({page},info)=>{
 await page.goto('/');await page.waitForFunction(()=>!!(window as any).__ASHEN__);await page.evaluate(()=>{const d=(window as any).__ASHEN__,s=d.fixture('growth');s.cleared=s.cleared.filter((n:number)=>n!==10);d.setFixture(s,'chapter');d.launch(10);});await expect(page.locator('.party-button')).toHaveCount(4);
 await page.evaluate(()=>{const b=(window as any).__ASHEN__.getBattle();b.wave=2;b.spawnWave();for(const [i,h] of b.heroes.entries()){h.x=4860+i*55;h.y=440+(i%2)*80;h.attackTimer=99;h.cd=[99,99];}b.enemies[0].x=5110;b.enemies[0].specialTimer=0;});
 await expect(page.locator('#boss-hud')).toContainText('黑潮主教·莫尔');await page.waitForTimeout(200);expect(await page.evaluate(()=>(window as any).__ASHEN__.getBattle().hazards[0].name)).toBe('黑潮圆阵');await page.screenshot({path:`artifacts/${info.project.name}-chapter-bishop.png`});
 await page.evaluate(()=>{const b=(window as any).__ASHEN__.getBattle();for(const e of b.enemies)e.hp=0;});await expect(page.locator('.result-modal')).toContainText('第一章·灰烬边境 完');await page.locator('[data-act=camp]').click();await expect(page.locator('.expedition-brief')).toContainText('第一章完成');await expect(page.locator('.chapter-node[data-level="10"]')).toHaveAttribute('aria-label',/已通关/);
});
test('生产版修道院可实际加载并开战',async({page},info)=>{
 const s=fixture('growth');s.cleared=s.cleared.filter(n=>n!==10);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173/');await page.evaluate(s=>localStorage.setItem('ashen-oath.v1',JSON.stringify(s)),s);await page.reload();await page.locator('[data-act=continue]').click();await page.locator('.chapter-node[data-level="10"]').click();await page.locator('[data-act=start]').click();await expect(page.locator('.party-button')).toHaveCount(4);await expect(page.locator('.battle-location')).toContainText('黑潮圣殿');expect(await page.evaluate(()=>'__ASHEN__'in window)).toBe(false);await page.waitForTimeout(300);await page.screenshot({path:`artifacts/${info.project.name}-chapter-production.png`});expect(errors).toEqual([]);
});
