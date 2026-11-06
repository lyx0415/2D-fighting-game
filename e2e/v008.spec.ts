import {test,expect} from '@playwright/test';
import {fixture} from '../src/core/progression';

test('绘制素材进入主屏、五英雄与真实帧动画',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.waitForFunction(()=>!!(window as any).__ASHEN__);
 await page.evaluate(s=>(window as any).__ASHEN__.setFixture(s,'growth'),fixture('growth'));
 await expect(page.locator('.atlas-art')).toHaveAttribute('src','/assets/v008/chapter.webp');
 await expect.poll(()=>page.locator('.atlas-art').evaluate((e:HTMLImageElement)=>e.complete&&e.naturalWidth===3000)).toBe(true);
 await page.screenshot({path:`artifacts/${info.project.name}-v008-map.png`});
 await page.locator('[data-tab=heroes]').click();
 await expect.poll(()=>page.locator('.hero-portrait img').evaluateAll(images=>images.every(i=>(i as HTMLImageElement).naturalWidth===512&&(i as HTMLImageElement).src.includes('/assets/v009/')))).toBe(true);
 await page.screenshot({path:`artifacts/${info.project.name}-v008-roster.png`});
 await page.evaluate(()=>{const d=(window as any).__ASHEN__;d.launch(1);});
 await expect(page.locator('.party-button')).toHaveCount(4);
 await expect.poll(()=>page.evaluate(()=>(window as any).__ASHEN__.getGame().inspect().rigs.length)).toBeGreaterThan(4);
 expect(await page.evaluate(()=>(window as any).__ASHEN__.getGame().inspect().rigs.every((r:any)=>r.renderer==='painted-sprite'))).toBe(true);
 await page.evaluate(()=>{const b=(window as any).__ASHEN__.getBattle();b.command({type:'move',point:{x:700,y:510}});});
 await expect.poll(()=>page.evaluate(()=>(window as any).__ASHEN__.getGame().inspect().rigs[0].pose)).toBe('move');
 const first=await page.evaluate(()=>(window as any).__ASHEN__.getGame().inspect().rigs[0].frame);
 await expect.poll(()=>page.evaluate(()=>(window as any).__ASHEN__.getGame().inspect().rigs[0].frame)).not.toBe(first);
 await page.screenshot({path:`artifacts/${info.project.name}-v008-battle.png`});
 await page.locator('[data-act=pause]').click();const paused=await page.evaluate(()=>(window as any).__ASHEN__.getGame().inspect().rigs);await page.waitForTimeout(120);expect(await page.evaluate(()=>(window as any).__ASHEN__.getGame().inspect().rigs)).toEqual(paused);expect(errors).toEqual([]);
});

test('五场景实际加载与移动端绘制战斗',async({page},info)=>{
 await page.setViewportSize({width:844,height:390});await page.goto('/');await page.waitForFunction(()=>!!(window as any).__ASHEN__);
 await page.evaluate(s=>(window as any).__ASHEN__.setFixture(s,'growth'),fixture('growth'));
 for(const [level,theme] of [[1,'ash'],[2,'forest'],[3,'fortress'],[5,'abbey'],[7,'crypt']] as const){
  const response=await page.request.get(`/assets/v008/scene-${theme}.webp`);expect(response.ok()).toBe(true);
  await page.evaluate(n=>(window as any).__ASHEN__.launch(n),level);
  await expect.poll(()=>page.evaluate(()=>(window as any).__ASHEN__.getGame().inspect().rigs.length)).toBeGreaterThan(0);
  await page.screenshot({path:`artifacts/${info.project.name}-v008-${theme}-844.png`});
 }
});

test('七张图集80帧均可解码、透明与边缘完整',async({page})=>{
 await page.goto('/');const result=await page.evaluate(async()=>{
  const sheets=['warrior','archer','mage','tank','assassin','enemies','props'];const problems:string[]=[];
  for(const id of sheets){const im=new Image();im.src=`/assets/v008/${id==='props'?'props':'sheet-'+id}.webp`;await im.decode();if(im.width!==2048||im.height!==(id==='props'?1024:1536))problems.push(id+' size');
   const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d')!;
   for(let i=0;i<(id==='props'?8:12);i++){g.clearRect(0,0,512,512);g.drawImage(im,i%4*512,Math.floor(i/4)*512,512,512,0,0,512,512);const d=g.getImageData(0,0,512,512).data;let count=0;for(let j=3;j<d.length;j+=4)if(d[j]>20)count++;
    if(count<1000)problems.push(id+' empty '+i);
    for(let j=0;j<512;j++)if(d[(j*512)*4+3]>20||d[(j*512+511)*4+3]>20||d[j*4+3]>20||d[(511*512+j)*4+3]>20){problems.push(id+' clipped '+i);break;}
   }
  }return problems;
 });expect(result).toEqual([]);
});
