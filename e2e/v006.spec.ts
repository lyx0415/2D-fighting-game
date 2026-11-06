import { test, expect } from '@playwright/test';
import { fixture } from '../src/core/progression';

for(const size of [{width:1280,height:720},{width:1920,height:1080},{width:844,height:390},{width:915,height:412}])test(`宽幅舆图、营地纵向入口与平移 ${size.width}`,async({page},info)=>{
 await page.setViewportSize(size);await page.goto('/');await page.waitForFunction(()=>!!(window as any).__ASHEN__);
 const save=fixture('growth');save.unlocked=4;save.cleared=[1,2,3];
 await page.evaluate(s=>(window as any).__ASHEN__.setFixture(s,'growth'),save);
 const viewport=page.locator('.chapter-atlas-scroll'),atlas=page.locator('.chapter-atlas');
 await expect(page.locator('.chapter-node')).toHaveCount(10);
 const geometry=await page.evaluate(()=>{
  const atlas=document.querySelector('.chapter-atlas')!.getBoundingClientRect(),frame=document.querySelector('.chapter-atlas-scroll')!.getBoundingClientRect(),nav=document.querySelector('.war-table nav')!.getBoundingClientRect(),buttons=[...document.querySelectorAll('.dock-action')].map(b=>b.getBoundingClientRect());
  const nodes=[...document.querySelectorAll('.chapter-node')].map(n=>n.getBoundingClientRect());
  return{ratio:atlas.width/atlas.height,wide:atlas.width>frame.width,gap:nodes[1].x-nodes[0].x,nav:nav.width/innerWidth,buttons:buttons.map(b=>({width:b.width,height:b.height,x:b.x,right:b.right,y:b.y,bottom:b.bottom})),body:document.documentElement.scrollWidth<=innerWidth+1};
 });
 expect(geometry.ratio).toBeCloseTo(3000/680,2);expect(geometry.wide).toBe(true);expect(geometry.gap).toBeGreaterThanOrEqual(184);expect(geometry.nav).toBeGreaterThan(.08);expect(geometry.nav).toBeLessThan(.19);expect(geometry.body).toBe(true);
 geometry.buttons.forEach((b,i)=>{expect(b.width).toBeGreaterThanOrEqual(48);expect(b.height).toBeGreaterThanOrEqual(48);if(i)expect(b.y).toBeGreaterThanOrEqual(geometry.buttons[i-1].bottom);});
 const before=await viewport.evaluate(el=>el.scrollLeft);await page.getByRole('button',{name:'向右浏览地图'}).click();await expect.poll(()=>viewport.evaluate(el=>el.scrollLeft)).toBeGreaterThan(before+100);
 await page.getByRole('button',{name:'定位当前关卡'}).click();
 await expect.poll(()=>viewport.evaluate(el=>el.scrollLeft)).toBeCloseTo(before,0);
 const bounds=await viewport.boundingBox();
 await page.mouse.move(bounds!.x+bounds!.width*.7,bounds!.y+70);await page.mouse.down();await page.mouse.move(bounds!.x+bounds!.width*.7,30);await page.mouse.up();await page.mouse.move(bounds!.x+bounds!.width*.3,bounds!.y+70);expect(await viewport.evaluate(el=>el.scrollLeft)).toBeCloseTo(before,0);
 await page.mouse.move(bounds!.x+bounds!.width*.7,bounds!.y+70);await page.mouse.down();await page.mouse.move(bounds!.x+bounds!.width*.3,bounds!.y+70,{steps:8});await page.mouse.up();
 await expect.poll(()=>viewport.evaluate(el=>el.scrollLeft)).toBeGreaterThan(before+100);await expect(page.locator('.prepare-modal')).toHaveCount(0);
 const dragged=await viewport.evaluate(el=>el.scrollLeft);await page.locator('[data-tab=gear]').click();await page.locator('[data-act=close-management]').click();await expect.poll(()=>viewport.evaluate(el=>el.scrollLeft)).toBeCloseTo(dragged,0);
 await page.getByRole('button',{name:'定位当前关卡'}).click();
 const gap=await page.evaluate(()=>{const path=document.querySelector('.atlas-route path') as SVGPathElement,p=path.getPointAtLength(0),point=new DOMPoint(p.x,p.y).matrixTransform(path.getScreenCTM()!),node=document.querySelector('.chapter-node')!.getBoundingClientRect();return Math.hypot(point.x-node.x-node.width/2,point.y-node.y-node.height/2);});expect(gap).toBeLessThan(2);
 await page.screenshot({path:`artifacts/${info.project.name}-v007-atlas-${size.width}.png`});
 await page.locator('.chapter-node[data-level="4"]').click();await expect(page.locator('.prepare-modal')).toContainText('朝圣者旧道');
 expect(await atlas.count()).toBe(1);
});

test('历史五英雄十五角度矢量接口保持同源，非当前运行人物',async({page},info)=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/artifacts/hero-v007-preview.html');await expect(page.locator('.face-card img')).toHaveCount(15);
 await expect.poll(()=>page.locator('.face-card img').evaluateAll(list=>list.every(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0&&decodeURIComponent((i as HTMLImageElement).src.split(',')[1]).includes('width="128" height="144"')))).toBe(true);
 const faces=await page.locator('.face-card img').evaluateAll(list=>list.map(i=>({hero:(i as HTMLElement).dataset.hero,view:(i as HTMLElement).dataset.view,svg:decodeURIComponent((i as HTMLImageElement).src.split(',')[1])})));
 for(const hero of ['warrior','archer','mage','tank','assassin']){const own=faces.filter(f=>f.hero===hero);expect(new Set(own.map(f=>f.svg.replace(/data-face-view="[^"]*"|data-head-view="[^"]*"/g,''))).size).toBe(3);}
 await page.locator('#face-views').screenshot({path:`artifacts/${info.project.name}-hero-v007-faces.png`});
 await page.goto('/');const match=await page.evaluate(async()=>{const art=await import('/src/game/hero-art.ts' as string),rig=await import('/src/game/hero-rig.ts' as string);return ['warrior','archer','mage','tank','assassin'].every(id=>{const view=id==='tank'?'front':'threeQuarter',portrait=art.heroPortraitSvg(id,view),head=rig.heroRig(id).parts.find((p:any)=>p.id==='head').svg;const match=portrait.match(/<g data-head-view[\s\S]*<\/g>/);return match&&head.includes(match[0]);});});expect(match).toBe(true);
});
