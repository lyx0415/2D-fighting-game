import {writeFileSync} from 'node:fs';
import { test,expect,Locator } from '@playwright/test';
const total=process.env.ASHEN_FULL_CHAPTER==='1'?10:3;
test(`新存档用真实鼠标输入走完${total}关，无注入伤害或奖励`,async({page},info)=>{
 test.skip(info.project.name!=='chromium','完整实时时长在Chromium验证；WebKit运行独立交互矩阵');test.setTimeout(total*180000);
 await page.goto('/');await page.locator('[data-act="new"]').click();await page.locator('[data-act="skip-story"]').click();
 const records:{level:number;seconds:number}[]=[];
 // Battle can finish between a status read and a pointer action. A result overlay
 // is expected at that boundary; other click failures must still fail the test.
 const clickDuringBattle=async(button:Locator)=>{
  if(await page.evaluate(()=>(window as any).__ASHEN__.getBattle().status!=='playing'))return;
  try{await button.click({timeout:1000});}
  catch(error){
   const index=Number(await button.getAttribute('data-index'));
   const state=await page.evaluate(i=>{const b=(window as any).__ASHEN__.getBattle();return{playing:b.status==='playing',cd:b.active.cd[i],queued:b.queuedSkill?.index===i};},index);
   // A buffered tap or automatic hero switch can change CD after isEnabled().
   // Only that observed state transition or a finished battle is an allowed race.
   if(state.playing&&state.cd<=0&&!state.queued)throw error;
  }
 };

 for(let level=1;level<=total;level++){
  await page.locator('[data-tab="gear"]').click();
  // Use only earned items, through actual inventory UI actions.
  const ids=await page.evaluate(()=>(window as any).__ASHEN__.getSave().heroes.map((h:any)=>h.id));
  for(const hero of ids){await page.locator(`[data-act=gear-hero][data-id=${hero}]`).click();for(const slot of ['weapon','armor','charm']){const best=await page.evaluate(({hero,slot})=>{const s=(window as any).__ASHEN__.getSave(),h=s.heroes.find((h:any)=>h.id===hero);const factor:any={white:1,green:1.4,blue:2};const candidates=s.inventory.filter((i:any)=>i.slot===slot&&(slot!=='weapon'||i.hero===hero)&&!s.heroes.some((owner:any)=>Object.values(owner.equipment).includes(i.id)));const score=(i:any)=>factor[i.quality]*(1+i.plus*.1);const current=s.inventory.find((i:any)=>i.id===h.equipment[slot]);candidates.sort((a:any,b:any)=>score(b)-score(a));return candidates[0]&&(!current||score(candidates[0])>score(current))?candidates[0].id:null;},{hero,slot});if(best){await page.locator(`[data-act=gear-item][data-item="${best}"]`).click();await page.locator(`[data-act=equip][data-item="${best}"]`).click();}}}
  await page.locator('[data-act=gear-hero][data-id=warrior]').click();
  // Spend only normally earned coins on the selected warrior's weapon.
  for(let n=0;n<3;n++){const available=await page.evaluate(()=>{const s=(window as any).__ASHEN__.getSave(),h=s.heroes[0],i=s.inventory.find((i:any)=>i.id===h.equipment.weapon);return i.plus<3&&s.gold>=[40,80,120][i.plus]?i.id:null;});if(!available)break;await page.locator(`[data-act=gear-item][data-item="${available}"]`).click();await page.locator(`[data-act=enhance][data-item="${available}"]`).click();}
  await page.locator('[data-tab="map"]').click();await page.locator(`.chapter-node[data-level="${level}"]`).click();await page.locator('[data-act="start"]').click();await expect(page.locator('.party-button').first()).toBeVisible();
  const canvas=page.locator('canvas');
  for(let i=0;i<600;i++){
   const state=await page.evaluate(()=>{const b=(window as any).__ASHEN__.getBattle(),a=b.active;const hazards=b.hazards.map((h:any)=>({...h}));return{status:b.status,seconds:b.time,a:{x:a.x,y:a.y,hp:a.hp,maxHp:a.maxHp,kind:a.kind},end:b.stageEnd,clear:b.waveCleared||b.waitingForAdvance,targets:b.enemies.map((e:any)=>({x:e.x,y:e.y,kind:e.kind})),hazards};});
   if(state.status!=='playing'){expect(state.status).toBe('won');records.push({level,seconds:Math.round(state.seconds)});console.log('POINTER_LEVEL',level,Math.round(state.seconds));break;}
   const box=(await canvas.boundingBox())!,cam=Math.max(0,Math.min(state.end-1280,state.a.x-640));
   const contains=(p:{x:number;y:number},h:any)=>{const dx=p.x-h.x,dy=p.y-h.y;if(h.shape==='circle')return Math.hypot(dx,dy)<h.radius+20;const f=dx*Math.cos(h.angle)+dy*Math.sin(h.angle),s=-dx*Math.sin(h.angle)+dy*Math.cos(h.angle);return h.shape==='cone'?f>=0&&Math.hypot(dx,dy)<h.radius+20&&Math.abs(Math.atan2(s,f))<Math.PI/3:f>=-20&&f<h.length+20&&Math.abs(s)<h.width/2+20;};
   const danger=state.hazards.find((h:any)=>contains(state.a,h));let target:{x:number;y:number}|undefined;
   if(danger){target=[{x:state.a.x,y:365},{x:state.a.x,y:610},{x:danger.x-200,y:state.a.y},{x:danger.x+450,y:state.a.y}].filter(p=>p.x>45&&p.x<state.end-40&&!contains(p,danger)).sort((p,q)=>Math.hypot(p.x-state.a.x,p.y-state.a.y)-Math.hypot(q.x-state.a.x,q.y-state.a.y))[0];}
   else if(state.clear)target={x:Math.min(state.end-42,cam+1190),y:490};
   else {const e=state.targets.sort((p:any,q:any)=>Math.hypot(p.x-state.a.x,p.y-state.a.y)-Math.hypot(q.x-state.a.x,q.y-state.a.y))[0];if(e)target={x:e.x,y:e.y-45};}
   if(target){const px=box.x+Math.max(30,Math.min(1240,target.x-cam))/1280*box.width,py=box.y+target.y/720*box.height;await page.mouse.click(px,py);}
   if(!danger&&!state.clear){const small=page.locator('#skill-0');if(await small.isEnabled())await clickDuringBattle(small);if(state.a.hp<state.a.maxHp*.6||state.a.kind!=='warrior'){const big=page.locator('#skill-1');if(await big.isEnabled())await clickDuringBattle(big);}}
   await page.waitForTimeout(170);
  }
  await expect(page.locator('.result-modal')).toBeVisible();await page.screenshot({path:`artifacts/campaign-level-${level}.png`});await page.locator('[data-act="camp"]').click();
 }
 expect(await page.evaluate(()=>(window as any).__ASHEN__.getSave().heroes.length)).toBe(5);expect(records).toHaveLength(total);console.log('REAL_POINTER_CAMPAIGN',JSON.stringify(records));writeFileSync(`artifacts/campaign-${total}levels-v0.5.0.json`,JSON.stringify({version:'0.5.0',date:'2026-10-30',method:'真实鼠标操作，仅观察状态，未注入伤害或资源',records},null,2));await page.locator('[data-tab="heroes"]').click();await page.screenshot({path:'artifacts/campaign-five-heroes.png',fullPage:true});
});
