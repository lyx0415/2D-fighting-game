import {test,expect} from '@playwright/test';
import {fixture} from '../src/core/progression';

for(const size of [{width:1280,height:720},{width:844,height:390}]){
 test(`工坊角色切换、组合筛选、换装和转交 ${size.width}`,async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize(size);await page.goto('/');await page.waitForFunction(()=>!!(window as any).__ASHEN__);
  const save=fixture('growth');await page.evaluate(s=>(window as any).__ASHEN__.setFixture(s,'growth'),save);await page.locator('[data-tab=gear]').click();
  await expect(page.locator('.gear-hero-tab')).toHaveCount(5);await expect(page.locator('#gear-hero')).toHaveCount(0);await expect(page.locator('.item-row')).toHaveCount(0);
  await page.locator('[data-act=gear-hero][data-id=assassin]').click();await expect(page.locator('.gear-character-title')).toContainText('赛芙');await expect(page.locator('[data-act=gear-hero][data-id=assassin]')).toHaveAttribute('aria-pressed','true');
  await page.locator('[data-act=gear-filter-toggle]').click();
  await page.locator('[data-filter=slot][data-value=weapon]').click();await page.locator('[data-filter=quality][data-value=blue]').click();await page.locator('[data-filter=ownership][data-value=free]').click();await page.locator('[data-act=gear-compatible]').click();
  await page.locator('[data-act=gear-filter-toggle]').click();
  await expect(page.locator('.equipment-cell')).toHaveCount(1);await expect(page.locator('.equipment-cell')).toHaveAttribute('aria-label',/夜行双刃/);await page.locator('.equipment-cell').click();
  await expect(page.locator('.equipment-comparison')).toContainText('赛芙');await page.locator('[data-act=equip]').click();await expect(page.locator('.gear-equipped .equipment-slot[data-slot=weapon]')).toContainText('稀有·夜行双刃');
  await expect(page.locator('.gear-empty')).toBeVisible();await expect(page.locator('.empty-detail')).toBeVisible();await page.locator('.warehouse-heading [data-act=gear-reset]').click();
  await page.locator('.gear-equipped .equipment-slot[data-slot=weapon] [data-act=gear-equipped]').click();await expect(page.locator('[data-act=sell]')).toBeDisabled();
  const coins=await page.evaluate(()=>(window as any).__ASHEN__.getSave().gold);await page.locator('[data-act=enhance]').click();expect(await page.evaluate(()=>(window as any).__ASHEN__.getSave().gold)).toBe(coins-40);await expect(page.locator('.gear-detail h2')).toContainText('+1');
  // Universal equipment remains owned until explicitly removed from its wearer.
  await page.locator('[data-act=gear-hero][data-id=warrior]').click();const armor=save.heroes[0].equipment.armor!;await page.locator(`[data-act=gear-item][data-item="${armor}"]`).click();await page.locator('[data-act=gear-hero][data-id=mage]').click();await page.locator(`[data-act=gear-item][data-item="${armor}"]`).click();await expect(page.locator('[data-act=equip]')).toBeDisabled();await expect(page.locator('.equipment-comparison')).toContainText('雷恩并卸下');
  await page.locator('[data-act=gear-hero][data-id=warrior]').click();await page.locator('[data-act=unequip][data-slot=armor]').click();await page.locator('[data-act=gear-hero][data-id=mage]').click();await page.locator(`[data-act=gear-item][data-item="${armor}"]`).click();await page.locator('[data-act=equip]').click();await expect(page.locator('.gear-equipped .equipment-slot[data-slot=armor]')).toContainText('旅人锁甲');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
  await page.screenshot({path:`artifacts/${info.project.name}-v007-workshop-${size.width}.png`,fullPage:true});
 });
}

test('五职业技能徽印、冷却与切换，手机点按不穿透',async({page},info)=>{
 await page.setViewportSize({width:844,height:390});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.waitForFunction(()=>!!(window as any).__ASHEN__);
 for(const hero of ['warrior','archer','mage','tank','assassin']){
  const save=fixture('growth');save.party=hero==='assassin'?['assassin','archer','mage','tank']:['warrior','archer','mage','tank'];save.leader=hero as typeof save.leader;
  await page.evaluate(s=>{const d=(window as any).__ASHEN__;d.setFixture(s,'growth');d.launch(3);},save);await expect(page.locator('.party-button')).toHaveCount(4);await expect(page.locator('.skill-dock')).toHaveAttribute('data-hero',hero);
  await page.evaluate(()=>{const b=(window as any).__ASHEN__.getBattle();for(const h of b.heroes){h.attackTimer=99;h.cd=[99,99];}b.active.cd=[0,0];b.active.lockUntil=0;const e=b.enemies[0];e.x=b.active.x+42;e.y=b.active.y;for(const t of b.enemies){t.attackTimer=99;t.specialTimer=99;t.speed=0;}});
  for(const n of [0,1]){const button=page.locator(`#skill-${n}`),box=(await button.boundingBox())!;expect(box.width).toBeGreaterThanOrEqual(48);expect(box.height).toBeGreaterThanOrEqual(48);expect(box.x+box.width).toBeLessThanOrEqual(844);expect(box.y+box.height).toBeLessThanOrEqual(390);await button.tap();await expect(button).toBeDisabled();}
  expect(await page.evaluate(()=>(window as any).__ASHEN__.getBattle().active.move)).toBeUndefined();
  const cd=await page.evaluate(()=>(window as any).__ASHEN__.getBattle().active.cd[1]);await page.locator('[data-act=switch][data-id=archer]').tap();await expect(page.locator('.skill-dock')).toHaveAttribute('data-hero','archer');expect(await page.evaluate(id=>(window as any).__ASHEN__.getBattle().heroes.find((h:any)=>h.id===id).cd[1],hero)).toBeLessThanOrEqual(cd);
  if(hero==='assassin')await page.screenshot({path:`artifacts/${info.project.name}-v007-skill-mobile.png`});
 }
 expect(errors).toEqual([]);
});
