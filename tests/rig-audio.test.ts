import {describe,it,expect} from 'vitest';
import {heroRig,heroRigMotion} from '../src/game/hero-rig';
import {enemyRig,enemyRigMotion} from '../src/game/enemy-art';
import {HERO_ORDER,ENEMIES} from '../src/core/data';
import type {RigPose} from '../src/game/rig-types';
import {AUDIO_CUES,combatCue} from '../src/game/audio-cues';
import {Battle} from '../src/core/battle';
import {fixture} from '../src/core/progression';

describe('连续关节与差异音效',()=>{
 it('十五种rig关节均能找到父节点，没有循环或非有限运动',()=>{
  for(const kind of [...HERO_ORDER,...Object.keys(ENEMIES)]){
   const hero=HERO_ORDER.includes(kind as typeof HERO_ORDER[number]),rig=hero?heroRig(kind):enemyRig(kind),sample=hero?heroRigMotion:enemyRigMotion;
   expect(new Set(rig.parts.map(p=>p.id)).size).toBe(rig.parts.length);
   for(const part of rig.parts){let current=part;const seen=new Set([part.id]);while(current.parent){const parent=rig.parts.find(p=>p.id===current.parent);expect(parent).toBeDefined();expect(seen.has(parent!.id)).toBe(false);seen.add(parent!.id);current=parent!;}}
   for(const pose of ['idle','move','attack','skill0','skill1','hit','dead'] as RigPose[])for(let n=0;n<=40;n++){
    const motion=sample(kind,pose,n/40);for(const part of Object.values(motion.parts))for(const value of Object.values(part))expect(Number.isFinite(value)).toBe(true);
   }
  }
 });
 it('小步采样连续，循环步态首尾衔接且不是阶梯取整',()=>{
  for(const kind of HERO_ORDER){const a=heroRigMotion(kind,'move',.241),b=heroRigMotion(kind,'move',.242);let changed=false;
   for(const id of Object.keys(a.parts)){const da=a.parts[id].angle??0,db=b.parts[id]?.angle??0;expect(Math.abs(da-db)).toBeLessThan(10);if(Math.abs(da-db)>.0001)changed=true;}
   expect(changed).toBe(true);
   const start=heroRigMotion(kind,'move',.0001),end=heroRigMotion(kind,'move',.9999);for(const id of Object.keys(start.parts))expect(Math.abs((start.parts[id].angle??0)-(end.parts[id]?.angle??0))).toBeLessThan(3);
  }
 });
 it('五职业两技能音色各异，命中区分材质和伤害来源',()=>{
  const skills=HERO_ORDER.flatMap(kind=>[0,1].map(index=>combatCue({type:'skill',x:0,y:0,sourceKind:kind,skillIndex:index as 0|1,phase:'cast'})));
  expect(new Set(skills).size).toBe(10);for(const cue of skills)expect(AUDIO_CUES[cue!].length).toBeGreaterThan(0);
  expect(combatCue({type:'damage',x:0,y:0,sourceKind:'mage',skillIndex:0,targetKind:'zombie'})).toBe('frostHit');
  expect(combatCue({type:'damage',x:0,y:0,sourceKind:'zombie',targetKind:'tank'})).toBe('metalHit');
  expect(combatCue({type:'skill',x:0,y:0,sourceKind:'mage',phase:'telegraph'})).toBeUndefined();
 });
 it('实际技能命中携带来源、索引和目标材质，CD数值不变',()=>{
  const b=new Battle(fixture('squad'),3,42),enemy=b.enemies[0];enemy.x=b.active.x+40;enemy.y=b.active.y;b.events=[];expect(b.cast(b.active,0)).toBe(true);b.step();
  const hit=b.events.find(e=>e.type==='damage');expect(hit).toMatchObject({sourceKind:'warrior',targetKind:enemy.kind,skillIndex:0,target:enemy.id});expect(b.active.cd[0]).toBeCloseTo(6-1/60);
 });
});
