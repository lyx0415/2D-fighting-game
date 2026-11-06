import {test,expect} from '@playwright/test';

test('历史矢量五职业80采样可解码，非当前运行素材',async({page},info)=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/artifacts/hero-v007-preview.html');await expect(page.locator('.frame img')).toHaveCount(80);
 await expect.poll(()=>page.locator('img').evaluateAll(images=>images.every(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0))).toBe(true);
 const clipped=await page.locator('.frame img').evaluateAll(images=>images.flatMap(i=>{
  const image=i as HTMLImageElement,c=document.createElement('canvas');c.width=256;c.height=320;const g=c.getContext('2d')!;g.drawImage(image,0,0,256,320);const pixels=g.getImageData(0,0,256,320).data;
  for(let y=0;y<320;y++)for(const x of [0,255])if(pixels[(y*256+x)*4+3]>12)return[image.alt];
  for(let x=0;x<256;x++)for(const y of [0,319])if(pixels[(y*256+x)*4+3]>12)return[image.alt];return[];
 }));
 expect(clipped).toEqual([]);
 await page.locator('#lineup').screenshot({path:`artifacts/${info.project.name}-hero-v007-lineup.png`});await page.locator('#poses').screenshot({path:`artifacts/${info.project.name}-hero-v007-poses.png`});
});
