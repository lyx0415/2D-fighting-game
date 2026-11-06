import {describe,it,expect} from 'vitest';
import {Battle} from '../src/core/battle';
import {fixture} from '../src/core/progression';
import {rigState} from '../src/game/hero-motion';
import {HERO_ORDER} from '../src/core/data';
import {visibleEquipment,newWorkshopView} from '../src/ui/workshop';

describe('职业动作与战斗状态',()=>{
 it('成功技能携带索引，失败技能不生成姿态，表现不延长操作锁',()=>{
  const b=new Battle(fixture('squad'),3,42);expect(b.cast(b.active,0)).toBe(false);expect(b.active.action).toBeUndefined();
  const enemy=b.enemies[0];enemy.x=b.active.x+40;enemy.y=b.active.y;
  expect(b.cast(b.active,0)).toBe(true);expect(rigState(b.active,b.time).pose).toBe('skill0');expect(b.active.lockUntil).toBe(.3);expect(b.active.cd[0]).toBe(6);
  const at=b.active.action;expect(b.cast(b.active,0)).toBe(false);expect(b.active.action).toBe(at);
  b.time=.31;expect(b.cast(b.active,1)).toBe(true);expect(rigState(b.active,b.time).pose).toBe('skill1');
 });
 it('按模拟时间取帧，切人保留动作/CD，移动和死亡优先于旧动作',()=>{
  const b=new Battle(fixture('squad'),3,42),u=b.active;expect(b.cast(u,1)).toBe(true);
  const first=rigState(u,0),middle=rigState(u,.4);expect(middle.phase).toBeGreaterThan(first.phase);b.paused=true;b.advance(1);expect(rigState(u,b.time)).toEqual(first);
  b.paused=false;b.command({type:'switchHero',id:'archer'});expect(rigState(u,0).pose).toBe('skill1');expect(u.cd[1]).toBe(20);
  u.animation='move';expect(rigState(u,.4).pose).toBe('move');u.hp=0;expect(rigState(u,.4).pose).toBe('dead');
 });
 it('五职业移动节奏各有定义，同等移动距离相位不同',()=>{
  const b=new Battle(fixture('growth'),3,42),u=b.active;const frames=new Set<number>();
  for(const hero of HERO_ORDER){u.kind=hero;u.animation='move';u.walkDistance=27;const f=rigState(u,.27);frames.add(f.phase);expect(f.pose).toBe('move');expect(f.phase).toBeGreaterThanOrEqual(0);expect(f.phase).toBeLessThan(1);}
  expect(frames.size).toBeGreaterThan(1);
 });
});
describe('工坊组合筛选',()=>{
 it('部位、品质、穿戴和职业筛选相交；切人重新计算适用武器',()=>{
  const s=fixture('growth'),v=newWorkshopView();v.slot='weapon';v.quality='blue';v.ownership='free';v.compatible=true;
  const assassin=visibleEquipment(s,'assassin',v);expect(assassin.length).toBe(1);expect(assassin[0].hero).toBe('assassin');
  expect(visibleEquipment(s,'warrior',v).every(i=>i.hero==='warrior')).toBe(true);
  v.quality='all';v.ownership='equipped';expect(visibleEquipment(s,'warrior',v)).toHaveLength(1);
 });
 it('纯筛选不改变存档或装备归属',()=>{
  const s=fixture('growth'),before=JSON.stringify(s),v=newWorkshopView();for(const hero of HERO_ORDER){v.compatible=true;visibleEquipment(s,hero,v);v.ownership='free';visibleEquipment(s,hero,v);}
  expect(JSON.stringify(s)).toBe(before);
 });
});
