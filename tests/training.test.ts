import {HEROES} from '../src/core/data';
import {describe,it,expect} from 'vitest';
import {fixture,heroStats,gainXp} from '../src/core/progression';
import {Battle} from '../src/core/battle';
import {validSave,loadSave,SAVE_KEY} from '../src/core/save';
import {talentPoints,skillPoints,trainTalent,trainSkill,resetTraining,skillCooldown} from '../src/core/training';
import {MIX_GAIN,categoryForCue} from '../src/game/audio-mix';

describe('营地修习与旧进度兼容',()=>{
 it('旧高等级档获得未分配点数，读取不改变旧档',()=>{const s=fixture('growth'),before=JSON.stringify(s);expect(validSave(s)).toBe(true);expect(talentPoints(s.heroes[0])).toBe(9);expect(skillPoints(s.heroes[0])).toBe(5);expect(JSON.stringify(s)).toBe(before);});
 it('升级和偶数等级按总等级派发点数',()=>{const s=fixture('new'),h=s.heroes[0];expect(trainTalent(s,h.id,'force')).toBeTruthy();expect(trainSkill(s,h.id,0)).toBeTruthy();gainXp(h,60);expect(h.level).toBe(2);expect(talentPoints(h)).toBe(1);expect(skillPoints(h)).toBe(1);});
 it('加点按职业初始值提供生命与固定攻防',()=>{const s=fixture('growth'),base=heroStats(s,'warrior');for(const k of ['vitality','force','guard'] as const)expect(trainTalent(s,'warrior',k)).toBeNull();const after=heroStats(s,'warrior');expect(after).toEqual({hp:base.hp+16,atk:base.atk+2,armor:base.armor+2});});
 it('点数与上限不能超支，失败原子化',()=>{const s=fixture('squad');expect(trainTalent(s,'warrior','force')).toBeNull();expect(trainTalent(s,'warrior','force')).toBeNull();const before=JSON.stringify(s);expect(trainTalent(s,'warrior','force')).toBeTruthy();expect(JSON.stringify(s)).toBe(before);const g=fixture('growth');for(let i=0;i<5;i++)trainTalent(g,'warrior','guard');expect(trainTalent(g,'warrior','guard')).toBeTruthy();for(let i=0;i<3;i++)trainSkill(g,'warrior',0);expect(trainSkill(g,'warrior',0)).toBeTruthy();});
 it('免费重置恢复点数和属性，不改变资产',()=>{const s=fixture('growth'),before=JSON.stringify(s);trainTalent(s,'warrior','force');trainSkill(s,'warrior',1);resetTraining(s,'warrior');expect(JSON.stringify(s)).toBe(before);resetTraining(s,'warrior');expect(talentPoints(s.heroes[0])).toBe(9);});
 it('非法点数分配拒绝并从有效备份恢复',()=>{const good=fixture('squad'),bad=structuredClone(good);bad.heroes[0].talents={vitality:5,force:0,guard:0};expect(validSave(bad)).toBe(false);const store={getItem:(k:string)=>JSON.stringify(k===SAVE_KEY?bad:good),setItem:()=>{},removeItem:()=>{}};expect(loadSave(store).notice).toContain('备份');bad.heroes[0].talents=undefined;bad.heroes[0].skillRanks=[2,0];expect(validSave(bad)).toBe(false);});
 it('重复读取和重置不增发点数',()=>{const s=fixture('growth');trainTalent(s,'warrior','force');trainSkill(s,'warrior',0);for(let n=0;n<4;n++){const restored=JSON.parse(JSON.stringify(s));expect(validSave(restored)).toBe(true);expect(talentPoints(restored.heroes[0])).toBe(8);expect(skillPoints(restored.heroes[0])).toBe(4);}});
});
describe('技能修习作用于真实战斗',()=>{
 it.each([['warrior',0],['archer',0],['archer',1],['mage',0],['mage',1],['tank',0],['assassin',0],['assassin',1]] as const)('%s 技能%s的不同伤害管线均应用修习', (id,index)=>{
  const run=(trained:boolean)=>{const s=fixture('growth');s.party=[id];s.leader=id;if(trained)trainSkill(s,id,index);const b=new Battle(s,1,12),u=b.active,e=b.enemies[0];for(const enemy of b.enemies)enemy.hp=0;e.hp=e.maxHp=10000;e.x=u.x+30;e.y=u.y;e.stunUntil=99;u.attackTimer=99;expect(b.cast(u,index)).toBe(true);expect(u.cd[index]).toBe(skillCooldown(HEROES[id].skills[index].cd,trained?1:0));for(let i=0;i<120;i++)b.step();return 10000-e.hp;};
  const base=run(false),upgraded=run(true);expect(base).toBeGreaterThan(0);expect(upgraded).toBeGreaterThan(base);expect(Math.abs(upgraded-base*1.08)).toBeLessThan(4);
 });
 it('横扫效力与CD更新，战斗快照隔离营地变化',()=>{const s=fixture('growth');trainSkill(s,'warrior',0);const b=new Battle(s,1,17);const u=b.active,e=b.enemies[0];e.x=u.x+30;e.y=u.y;e.hp=e.maxHp=1000;u.attackTimer=99;for(const h of b.heroes)if(h!==u)h.hp=0;expect(b.cast(u,0)).toBe(true);expect(u.cd[0]).toBe(skillCooldown(6,1));b.step();expect(1000-e.hp).toBe(Math.round(u.atk*1.6*1.08*100/(100+e.armor)));resetTraining(s,'warrior');expect(u.skillRanks).toEqual([1,0]);});
 it('不屈护盾与守护誓言受技能等级影响',()=>{const s=fixture('growth');trainSkill(s,'warrior',1);trainSkill(s,'tank',1);const b=new Battle(s,1,10);expect(b.cast(b.active,1)).toBe(true);expect(b.active.shield).toBeCloseTo(b.active.maxHp*.3*1.08);const tank=b.heroes.find(h=>h.kind==='tank')!;expect(b.cast(tank,1)).toBe(true);const e=b.enemies[0];e.atk=100;b.pending.push({at:0,source:e.id,target:tank.id,multiplier:1,kind:'blade'});const hp=tank.hp;b.step();expect(hp-tank.hp).toBe(Math.round(100*100/(100+tank.armor)*(1-.4*1.08)));});
 it('无目标不会消耗升级后的CD',()=>{const s=fixture('growth');trainSkill(s,'warrior',0);const b=new Battle(s,1);expect(b.cast(b.active,0)).toBe(false);expect(b.active.cd[0]).toBe(0);});
});
it('普通攻击和普通命中明显低于技能，发力声有独立分组',()=>{expect(MIX_GAIN.attack).toBeLessThan(MIX_GAIN.skill*.35);expect(MIX_GAIN.impact).toBeLessThan(MIX_GAIN.skill*.35);expect(categoryForCue('warriorExert')).toBe('voice');expect(categoryForCue('bladeSwing')).toBe('attack');});
