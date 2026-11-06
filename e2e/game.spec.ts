import { test,expect,Page } from '@playwright/test';
async function freshCamp(page:Page){await page.goto('/');await page.getByRole('button',{name:/踏上旅程/}).click();await page.getByRole('button',{name:'跳过序章 →'}).click();await expect(page.locator('.camp-content')).toBeVisible();}
async function start(page:Page){await page.locator('.chapter-node[data-level="1"]').click();await page.getByRole('button',{name:'出发 →',exact:true}).click();await expect(page.locator('canvas')).toBeVisible();await page.waitForFunction(()=>!!(window as any).__ASHEN__?.getBattle());}
async function fixture(page:Page,kind='growth'){await page.waitForFunction(()=>!!(window as any).__ASHEN__);await page.evaluate(k=>{const d=(window as any).__ASHEN__;d.setFixture(d.fixture(k),k);},kind);}
for(const size of [{width:1280,height:720},{width:1920,height:1080},{width:844,height:390},{width:915,height:412}]){
 test(`布局与基础流程 ${size.width}x${size.height}`,async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize(size);await page.goto('/');await page.screenshot({path:`artifacts/${info.project.name}-title-${size.width}.png`});await freshCamp(page);await page.screenshot({path:`artifacts/${info.project.name}-camp-${size.width}.png`,fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await start(page);await expect(page.locator('.party-button')).toHaveCount(1);await expect(page.locator('#skill-0')).toContainText('横扫');
  const bounds=await page.locator('canvas').boundingBox();expect(bounds).not.toBeNull();
  const before=await page.evaluate(()=>(window as any).__ASHEN__.getBattle().active.x);
  const px=bounds!.x+bounds!.width*.45,py=bounds!.y+bounds!.height*.72;
  if(size.width<1000)await page.touchscreen.tap(px,py);else await page.mouse.click(px,py);
  await page.waitForTimeout(500);expect(await page.evaluate(()=>(window as any).__ASHEN__.getBattle().active.x)).toBeGreaterThan(before);
  const skill=page.locator('#skill-1');expect((await skill.boundingBox())!.height).toBeGreaterThanOrEqual(48);await skill.click();await expect(skill).toBeDisabled();
  await page.screenshot({path:`artifacts/${info.project.name}-battle-${size.width}.png`});await page.getByRole('button',{name:'暂停',exact:true}).click();
  const time=await page.evaluate(()=>(window as any).__ASHEN__.getBattle().time);await page.waitForTimeout(180);expect(await page.evaluate(()=>(window as any).__ASHEN__.getBattle().time)).toBe(time);
  await page.getByRole('button',{name:'继续战斗 →'}).click();await page.reload();await page.locator('[data-act=continue]').click();await expect(page.locator('.camp-content')).toBeVisible();expect(errors).toEqual([]);
 });
}
test('编队、装备、金币强化与隔离存档',async({page})=>{
 await freshCamp(page);await fixture(page);await page.locator('[data-tab="heroes"]').click();await expect(page.locator('.hero-card')).toHaveCount(5);
 await page.locator('.hero-card').filter({has:page.locator('[data-id="warrior"]')}).getByRole('button',{name:'移出队伍'}).click();await page.locator('.hero-card').filter({has:page.locator('[data-id="assassin"]')}).getByRole('button',{name:'加入队伍'}).click();
 const party=await page.evaluate(()=>(window as any).__ASHEN__.getSave().party);expect(party).toContain('assassin');expect(party).not.toContain('warrior');
 await page.locator('[data-tab="gear"]').click();const gold=await page.evaluate(()=>(window as any).__ASHEN__.getSave().gold);await page.locator('[data-act="enhance"]').first().click();expect(await page.evaluate(()=>(window as any).__ASHEN__.getSave().gold)).toBe(gold-40);
 await page.locator('[data-act=gear-hero][data-id=assassin]').click();await page.getByRole('button',{name:/稀有·夜行双刃，武器/}).click();await page.locator('[data-act=equip]').click();await expect(page.locator('.equipment-slot').first()).toContainText('稀有·夜行双刃');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('ashen-oath.v1')!).heroes.length)).toBe(1);
});
test('四人切换、UI不穿透、Boss预警与结果幂等',async({page},info)=>{
 await freshCamp(page);await fixture(page,'squad');await page.evaluate(()=>(window as any).__ASHEN__.launch(3));await expect(page.locator('canvas')).toBeVisible();await expect(page.locator('.party-button')).toHaveCount(4);
 await page.getByRole('button',{name:'切换至薇拉'}).click();expect(await page.evaluate(()=>(window as any).__ASHEN__.getBattle().activeId)).toBe('archer');expect(await page.evaluate(()=>(window as any).__ASHEN__.getBattle().active.move)).toBeUndefined();
 await page.evaluate(()=>{const b=(window as any).__ASHEN__.getBattle();b.wave=2;b.spawnWave();b.active.x=4900;for(const u of b.heroes){u.x=4900;u.y=420;u.attackTimer=99;u.cd=[99,99];}b.enemies[0].x=5020;b.enemies[0].specialTimer=0;});
 await expect(page.locator('#boss-hud')).toBeVisible();await page.waitForTimeout(200);await page.screenshot({path:`artifacts/${info.project.name}-boss.png`});
 await page.evaluate(()=>{const b=(window as any).__ASHEN__.getBattle();for(const u of b.enemies)u.hp=0;});await expect(page.locator('.result-modal')).toBeVisible();const gold=await page.evaluate(()=>(window as any).__ASHEN__.getSave().gold);await page.waitForTimeout(200);expect(await page.evaluate(()=>(window as any).__ASHEN__.getSave().gold)).toBe(gold);await page.getByRole('button',{name:'下一关 →'}).click();await expect(page.locator('.prepare-modal')).toContainText('朝圣者旧道');await page.locator('[data-act=close]').click();await page.locator('[data-tab=heroes]').click();await expect(page.locator('.hero-card')).toHaveCount(5);
});
test('竖屏与切后台暂停',async({page})=>{
 await freshCamp(page);await start(page);await page.setViewportSize({width:390,height:844});await expect(page.locator('#rotation')).toBeVisible();await expect.poll(()=>page.evaluate(()=>(window as any).__ASHEN__.getBattle().paused)).toBe(true);await page.setViewportSize({width:844,height:390});await expect(page.getByRole('button',{name:'继续战斗 →'})).toBeVisible();await page.getByRole('button',{name:'继续战斗 →'}).click();await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect(page.locator('.pause-modal')).toBeVisible();
});
