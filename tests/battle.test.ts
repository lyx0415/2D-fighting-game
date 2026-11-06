import {writeFileSync} from 'node:fs';
import { describe,it,expect } from 'vitest';
import { Battle,damageAmount,distance,inHazard,FLOOR,STAGE_WIDTH } from '../src/core/battle';
import { fixture,newSave,settle,enhance,equip,equipmentStats,ownerOf } from '../src/core/progression';
import type { Hazard } from '../src/core/battle';
function tick(b:Battle,seconds:number){for(let i=0;i<seconds*60&&b.status==='playing';i++)b.step();}
describe('战斗规则',()=>{
 it('地面移动取消追击，移动期间不自动攻击',()=>{const b=new Battle(newSave(),1,1);b.enemies[0].x=b.active.x+30;b.enemies[0].y=b.active.y;b.command({type:'attackTarget',id:b.enemies[0].id});b.command({type:'move',point:{x:500,y:550}});expect(b.active.target).toBeUndefined();tick(b,.2);expect(b.active.x).toBeGreaterThan(210);expect(b.active.attackTimer).toBeLessThan(.3);});
 it('锁定追击，进入射程后攻击',()=>{const b=new Battle(newSave(),1,1);b.command({type:'attackTarget',id:b.enemies[0].id});tick(b,4);expect(b.enemies.some(u=>u.hp<u.maxHp)).toBe(true);});
 it('无目标或超距技能不进CD',()=>{const b=new Battle(newSave(),1,1);expect(b.command({type:'castSkill',index:0})).toBe(false);expect(b.active.cd[0]).toBe(0);expect(b.command({type:'castSkill',index:1})).toBe(true);expect(b.active.shield).toBeCloseTo(b.active.maxHp*.3);});
 it('成功施法即开始CD，连点不重复施法',()=>{const b=new Battle(newSave(),1,1);b.enemies[0].x=b.active.x+40;b.enemies[0].y=b.active.y;expect(b.command({type:'castSkill',index:0})).toBe(true);expect(b.command({type:'castSkill',index:0})).toBe(false);expect(b.pending.filter(p=>p.kind==='warrior')).toHaveLength(1);tick(b,.05);expect(b.enemies[0].hp).toBeLessThan(b.enemies[0].maxHp);});
 it('施法动作期间移动指令保留并延后执行',()=>{const b=new Battle(newSave(),1,1);b.command({type:'castSkill',index:1});b.command({type:'move',point:{x:500,y:500}});const x=b.active.x;tick(b,.15);expect(b.active.x).toBe(x);tick(b,.25);expect(b.active.x).toBeGreaterThan(x);});
 it('切换清除新角色AI追击，不重置技能',()=>{const b=new Battle(fixture('squad'),3,1);b.command({type:'castSkill',index:1});b.command({type:'switchHero',id:'archer'});expect(b.active.id).toBe('archer');expect(b.active.target).toBeUndefined();expect(b.heroes[0].cd[1]).toBe(20);});
 it('主动倒地自动切换，禁止切换至倒地角色',()=>{const b=new Battle(fixture('squad'),3,1);b.active.hp=0;b.step();expect(b.active.id).toBe('archer');expect(b.command({type:'switchHero',id:'warrior'})).toBe(false);});
 it('同一步双灭优先失败且不恢复队员',()=>{const b=new Battle(newSave(),1,1);b.active.hp=0;b.reservesSpawned=true;b.enemies.forEach(u=>u.hp=0);b.step();expect(b.status).toBe('lost');expect(b.reward.recruits).toHaveLength(0);});
 it('临时营救不污染存档，重复步不重复生成波次',()=>{const save=newSave(),b=new Battle(save,1,1);b.reservesSpawned=true;b.enemies.forEach(u=>u.hp=0);b.step();expect(b.heroes).toHaveLength(2);expect(save.heroes).toHaveLength(1);expect(b.reward.recruits).toEqual(['archer']);tick(b,1);expect(b.heroes).toHaveLength(2);expect(b.wave).toBe(0);b.active.x=b.stageEnd-60;b.step();expect(b.wave).toBe(1);expect(b.enemies).toHaveLength(3);});
 it('复活后清除尸体标记和旧控制，能够再次产生倒地事件',()=>{const b=new Battle(fixture('squad'),1,42);const ally=b.heroes[1];ally.hp=0;ally.dropped=true;ally.stunUntil=999;ally.slowUntil=999;ally.target='old';b.reservesSpawned=true;b.enemies.forEach(e=>e.hp=0);b.step();expect(ally.hp).toBeCloseTo(ally.maxHp*.35);expect(ally.dropped).toBe(false);expect(ally.target).toBeUndefined();expect(ally.stunUntil).toBe(0);ally.hp=0;b.events=[];b.step();expect(b.events.filter(e=>e.type==='death'&&e.kind==='archer')).toHaveLength(1);});
 it('重玩不重复生成已招募伙伴',()=>{const b=new Battle(fixture('squad'),1,1);b.reservesSpawned=true;b.enemies.forEach(u=>u.hp=0);b.step();expect(b.heroes).toHaveLength(4);expect(b.reward.recruits).toHaveLength(0);});
 it('护甲与减伤公式稳定，伤害至少1',()=>{expect(damageAmount(100,1.5,50,.4)).toBe(60);expect(damageAmount(1,.1,999)).toBe(1);});
 it('Boss预警在截止前不伤害，预警位置锁定',()=>{const b=new Battle(fixture('squad'),3,1);b.wave=2;(b as any).spawnWave();const boss=b.enemies[0];boss.x=500;boss.y=480;boss.specialTimer=0;const h=b.active;h.x=590;h.y=480;b.step();expect(b.hazards).toHaveLength(1);const hazard={...b.hazards[0]};const hp=h.hp;boss.attackTimer=10;b.heroes.slice(1).forEach(u=>u.x=50);h.attackTimer=10;tick(b,.5);expect(h.hp).toBe(hp);expect(b.hazards[0].angle).toBe(hazard.angle);h.y=FLOOR.top;tick(b,.8);expect(h.hp).toBe(hp);});
 it('Boss半血切阶段且不会同时执行两个特殊技能',()=>{const b=new Battle(fixture('squad'),3,1);b.wave=2;(b as any).spawnWave();const boss=b.enemies[0];boss.hp=boss.maxHp*.49;boss.specialTimer=0;b.step();expect(boss.enraged).toBe(true);tick(b,.6);expect(b.hazards.length).toBeLessThanOrEqual(1);});
 it('投射物命中时结算，目标先死后不会追踪尸体',()=>{const b=new Battle(fixture('squad'),1,1);const a=b.heroes[1],t=b.enemies[0];a.x=500;a.y=t.y;t.x=700;a.attackTimer=0;b.command({type:'switchHero',id:a.id});tick(b,.15);expect(b.projectiles.length).toBeGreaterThan(0);expect(t.hp).toBe(t.maxHp);t.hp=0;b.step();expect(b.projectiles.some(p=>p.target===t.id)).toBe(false);});
 it('暂停冻结模拟、CD与输入',()=>{const b=new Battle(newSave(),1,1);b.paused=true;b.advance(1);expect(b.time).toBe(0);expect(b.command({type:'move',point:{x:500,y:500}})).toBe(false);});
 it('危险范围支持二维矩形及圆形判断',()=>{const h:Hazard={id:1,source:'x',x:0,y:0,shape:'rect',length:100,width:40,radius:50,angle:0,start:0,end:1,multiplier:1,name:'x'};expect(inHazard({x:50,y:10},h)).toBe(true);expect(inHazard({x:50,y:35},h)).toBe(false);});
});
export function playCampaign(seed:number,count=3){
 const save=newSave();const report:unknown[]=[];
 for(let level=1;level<=count;level++){
  // Upgrade only with normally earned coins; no drops, damage or health are injected.
  for(const h of save.heroes)for(const slot of ['weapon','armor','charm'] as const){const score=(i:any)=>{const st=equipmentStats(i);return st.atk*6+st.hp*.2+st.armor;};const current=save.inventory.find(i=>i.id===h.equipment[slot]);const best=save.inventory.filter(i=>i.slot===slot&&!ownerOf(save,i.id)&&(slot!=='weapon'||i.hero===h.id)).sort((a,b)=>score(b)-score(a))[0];if(best&&(!current||score(best)>score(current)))equip(save,h.id,best.id);}
  for(const h of save.heroes)for(const slot of ['weapon','armor','charm'] as const){const id=h.equipment[slot]!;while(!enhance(save,id)){} }
  const b=new Battle(save,level,seed,`campaign-${seed}-${level}`);let control=0;
  for(let frames=0;frames<60*480&&b.status==='playing';frames++){
   if(frames%6===0){const a=b.active;const hazard=b.hazards.find(h=>inHazard(a,h,15));
    if(hazard){const candidates=[{x:a.x,y:FLOOR.top},{x:a.x,y:FLOOR.bottom},{x:hazard.x-190,y:a.y},{x:hazard.x+450,y:a.y}].filter(p=>p.x>45&&p.x<b.stageEnd-40&&b.hazards.every(h=>!inHazard(p,h,20)));candidates.sort((p,q)=>distance(p,a)-distance(q,a));if(candidates[0])b.command({type:'move',point:candidates[0]});}
    else if(b.waveCleared||b.waitingForAdvance)b.command({type:'move',point:{x:b.stageEnd-40,y:490}});
    else {const t=b.enemies.slice().sort((p,q)=>distance(p,a)-distance(q,a))[0];if(t)b.command({type:'attackTarget',id:t.id});b.command({type:'castSkill',index:0});if(a.hp<a.maxHp*.6||a.kind!=='warrior')b.command({type:'castSkill',index:1});}
    control++;
   }
   b.step();
  }
  report.push({level,status:b.status,seconds:Math.round(b.time),hp:b.heroes.map(h=>[h.kind,Math.ceil(h.hp)]),levelBefore:save.heroes[0].level,gold:b.reward.gold,damageTaken:Math.round(b.statistics.heroDamage)});
  if(b.status!=='won')return {ok:false,report,save};settle(save,b.reward);
 }
 return {ok:true,report,save};
}
describe('不刷关的三关实战模拟',()=>{
 it('普通点按策略从新档走完三关并招募五人',()=>{const result=playCampaign(42);console.info('CAMPAIGN',JSON.stringify(result.report));expect(result.ok).toBe(true);expect(result.save.heroes).toHaveLength(5);expect(result.save.cleared).toEqual([1,2,3]);});
 it('多个随机种子下仍能正常通关',()=>{for(const seed of [7,128,2026]){const result=playCampaign(seed);expect(result.ok,JSON.stringify(result.report)).toBe(true);}});
});

describe('完整第一章',()=>{
 it('四个随机种子从新档连续打通十关，不注入资源或刷关',()=>{const records:unknown[]=[];for(const seed of [42,7,128,2026]){const r=playCampaign(seed,10);records.push({seed,won:r.ok,levels:r.report});writeFileSync('artifacts/balance-v0.3.0-2026-10-30.json',JSON.stringify({version:'0.3.0',method:'正常掉落换装、金币强化、主动技能与避让，未注入资源',records},null,2));console.info('CHAPTER',seed,JSON.stringify(r.report));expect(r.ok,JSON.stringify(r.report)).toBe(true);expect(r.save.unlocked).toBe(10);expect(r.save.cleared).toHaveLength(10);expect(r.save.heroes).toHaveLength(5);}});
 it('主教脚下圆阵锁定位置，狂怒切换与召唤受约束',()=>{const s=fixture('growth'),b=new Battle(s,10,42);b.wave=2;(b as any).spawnWave();const boss=b.enemies[0];expect(boss.kind).toBe('bishop');boss.specialTimer=0;b.step();expect(b.hazards).toHaveLength(1);expect(b.hazards[0].name).toBe('黑潮圆阵');const x=b.hazards[0].x;b.active.x+=100;tick(b,.2);expect(b.hazards[0].x).toBe(x);boss.hp=boss.maxHp*.49;boss.lockUntil=0;tick(b,.1);expect(boss.enraged).toBe(true);expect(b.hazards.filter(h=>h.source===boss.id).length).toBeLessThanOrEqual(1);});
 it('怨灵预警延迟生效，施法者死亡后取消危险区',()=>{const b=new Battle(fixture('growth'),5,42);b.wave=1;(b as any).spawnWave();const w=b.enemies.find(e=>e.kind==='wraith')!;w.specialTimer=0;b.step();expect(b.hazards.some(h=>h.source===w.id)).toBe(true);const hp=b.active.hp;tick(b,.3);expect(b.active.hp).toBe(hp);w.hp=0;b.step();expect(b.hazards.some(h=>h.source===w.id)).toBe(false);});
});

describe('v0.3战区长度、增援与威胁',()=>{
 it('每节延长到2200，清掉前阵仍需推进到后阵，增援只生成一次',()=>{const b=new Battle(newSave(),1,42);expect(STAGE_WIDTH).toBe(2200);b.enemies.forEach(u=>u.hp=0);b.step();expect(b.waveCleared).toBe(false);expect(b.waitingForAdvance).toBe(true);expect(b.heroes).toHaveLength(1);b.active.x=1135;b.step();expect(b.reservesSpawned).toBe(true);expect(b.enemies).toHaveLength(2);tick(b,.3);expect(b.enemies).toHaveLength(2);b.enemies.forEach(u=>u.hp=0);b.step();expect(b.waveCleared).toBe(true);expect(b.heroes).toHaveLength(2);});
 it('小兵能对不防御的一级战士造成明显伤害',()=>{const b=new Battle(newSave(),1,42),hero=b.active;hero.attackTimer=99;hero.cd=[99,99];b.enemies.forEach((e,i)=>{e.x=hero.x+35+i*10;e.y=hero.y;});tick(b,4);expect(hero.hp).toBeLessThan(hero.maxHp*.8);expect(b.statistics.heroDamage).toBeGreaterThan(70);});
 it('普通整节休整只恢复8%，Boss前恢复35%',()=>{const b=new Battle(fixture('squad'),3,42),h=b.active;h.hp=100;b.reservesSpawned=true;b.enemies.forEach(u=>u.hp=0);b.step();expect(h.hp).toBeCloseTo(100+h.maxHp*.08);b.wave=1;(b as any).spawnWave();h.hp=100;b.reservesSpawned=true;b.enemies.forEach(u=>u.hp=0);b.step();expect(h.hp).toBeCloseTo(100+h.maxHp*.35);});
 it('路外点击不设置目的地，石道内点击正常移动',()=>{const b=new Battle(newSave(),1,42);expect(b.command({type:'move',point:{x:500,y:FLOOR.top-30}})).toBe(false);expect(b.active.move).toBeUndefined();expect(b.command({type:'move',point:{x:500,y:FLOOR.bottom}})).toBe(true);});
});

describe('技能点按缓冲',()=>{
 it('普攻动作中点击技能，动作结束后正常施放并进入CD',()=>{const b=new Battle(newSave(),1,42);b.enemies[0].x=b.active.x+40;b.enemies[0].y=b.active.y;b.active.attackTimer=0;b.step();expect(b.active.lockUntil).toBeGreaterThan(b.time);expect(b.command({type:'castSkill',index:1})).toBe(true);expect(b.queuedSkill?.index).toBe(1);tick(b,.3);expect(b.active.shield).toBeGreaterThan(0);expect(b.active.cd[1]).toBeGreaterThan(19);expect(b.queuedSkill).toBeUndefined();});
 it('移动或切人取消尚未释放的技能，不把技能错误交给原AI',()=>{const b=new Battle(fixture('squad'),1,42);b.active.lockUntil=1;b.command({type:'castSkill',index:1});b.command({type:'move',point:{x:400,y:500}});expect(b.queuedSkill).toBeUndefined();expect(b.active.cd[1]).toBe(0);b.command({type:'castSkill',index:1});b.command({type:'switchHero',id:'archer'});expect(b.queuedSkill).toBeUndefined();});
});
