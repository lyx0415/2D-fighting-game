import { describe,it,expect } from 'vitest';
import { newSave,recruit,heroStats,equipmentStats,addItem,equip,unequip,enhance,sell,gainXp,settle,rng,rollQuality,fixture } from '../src/core/progression';
import { loadSave,writeSave,SAVE_KEY,validSave } from '../src/core/save';
import type { BattleReward } from '../src/core/types';
const reward=(runId='r1',levelId=1):BattleReward=>({runId,levelId,gold:60,items:[],recruits:['archer']});
describe('成长与奖励',()=>{
 it('新手拥有完整白装，属性顺序正确',()=>{const s=newSave();expect(heroStats(s,'warrior')).toEqual({hp:365,atk:33,armor:19});expect(validSave(s)).toBe(true);});
 it('升级按初始属性线性成长，满级截断经验',()=>{const s=newSave();gainXp(s.heroes[0],270);expect(s.heroes[0]).toMatchObject({level:4,xp:0});expect(heroStats(s,'warrior')).toEqual({hp:480,atk:39,armor:25});gainXp(s.heroes[0],99999);expect(s.heroes[0]).toMatchObject({level:10,xp:0});});
 it('同件装备不能同时给两人使用，武器有职业限制',()=>{const s=newSave();recruit(s,'archer');const id=s.heroes[0].equipment.armor!;expect(equip(s,'archer',id)).toContain('卸下');unequip(s,'warrior','armor');expect(equip(s,'archer',id)).toBe(null);const weapon=s.heroes[0].equipment.weapon!;unequip(s,'warrior','weapon');expect(equip(s,'archer',weapon)).toContain('职业');expect(validSave(s)).toBe(true);});
 it('强化不足不扣钱；成功率100%，上限+3',()=>{const s=newSave(),id=s.inventory[0].id;expect(enhance(s,id)).toBe('金币不足');s.gold=240;for(let i=0;i<3;i++)expect(enhance(s,id)).toBeNull();expect(s.gold).toBe(0);expect(s.inventory[0].plus).toBe(3);expect(enhance(s,id)).toContain('上限');expect(equipmentStats(s.inventory[0]).atk).toBe(7);});
 it('已穿戴不能出售，出售稀有装备仅给基础价',()=>{const s=newSave();expect(sell(s,s.inventory[0].id)).toContain('不能');const i=addItem(s,{slot:'charm',quality:'blue',plus:3});expect(sell(s,i.id)).toBeNull();expect(s.gold).toBe(60);expect(s.inventory).toHaveLength(3);});
 it('结算幂等，首通只发一次，重玩仍给普通奖励',()=>{const s=newSave();const r=settle(s,reward());expect(r?.first).toBe(true);expect(s.heroes).toHaveLength(2);expect(s.heroes.every(h=>h.level===2)).toBe(true);expect(s.gold).toBe(140);expect(settle(s,reward())).toBeNull();expect(s.gold).toBe(140);expect(settle(s,reward('r2'))?.first).toBe(false);expect(s.inventory).toHaveLength(7);expect(s.unlocked).toBe(2);});
 it('新伙伴与最高等级一致后再发本关经验，候补也升级',()=>{const s=fixture('growth');s.heroes.forEach(h=>{h.level=3;h.xp=0;});s.heroes[4].level=1;settle(s,{...reward(),levelId:3,recruits:[]});expect(s.heroes[4].level).toBe(2);});
 it('不能结算未解锁关卡',()=>expect(settle(newSave(),reward('x',3))).toBeNull());
 it('三种测试档结构有效',()=>{for(const k of ['new','squad','growth'] as const)expect(validSave(fixture(k))).toBe(true);});
 it('同种子生成相同随机序列及品质',()=>{const a=rng(123),b=rng(123);expect(Array.from({length:100},()=>rollQuality(3,a))).toEqual(Array.from({length:100},()=>rollQuality(3,b)));});
 it('品质概率在大样本下符合配置',()=>{for(const [level,probs] of [[1,[.8,.2,0]],[2,[.55,.4,.05]],[3,[.3,.55,.15]]] as const){const random=rng(31),counts={white:0,green:0,blue:0};for(let i=0;i<20000;i++)counts[rollQuality(level,random)]++;(['white','green','blue'] as const).forEach((q,i)=>expect(Math.abs(counts[q]/20000-probs[i])).toBeLessThan(.015));}});
});
class MemoryStorage{map=new Map<string,string>();getItem(k:string){return this.map.get(k)??null;}setItem(k:string,v:string){this.map.set(k,v);}removeItem(k:string){this.map.delete(k);}}
describe('存档',()=>{
 it('正常保存读取，保留上一份有效备份',()=>{const m=new MemoryStorage(),s=newSave();expect(writeSave(m,s)).toBeNull();s.gold=80;writeSave(m,s);expect(loadSave(m).save?.gold).toBe(80);expect(JSON.parse(m.getItem(`${SAVE_KEY}.backup`)!).gold).toBe(0);});
 it('主档损坏从备份恢复，且不覆盖原始坏档',()=>{const m=new MemoryStorage();writeSave(m,newSave());writeSave(m,newSave());m.setItem(SAVE_KEY,'broken');const x=loadSave(m);expect(x.notice).toContain('备份');expect(x.save).not.toBeNull();expect(m.getItem(SAVE_KEY)).toBe('broken');});
 it('两份坏档提示重建，不静默覆盖',()=>{const m=new MemoryStorage();m.setItem(SAVE_KEY,'bad');expect(loadSave(m).notice).toContain('无法读取');expect(loadSave(m).save).toBeNull();expect(m.getItem(SAVE_KEY)).toBe('bad');});
 it('存储拒绝读写仍有可解释错误',()=>{const m={getItem(){throw Error('denied');},setItem(){throw Error('denied');},removeItem(){}};expect(loadSave(m).notice).toContain('存储');expect(writeSave(m,newSave())).toContain('保存失败');});
 it('拒绝重复装备归属和无效队伍',()=>{const s=fixture('squad');s.heroes[1].equipment.armor=s.heroes[0].equipment.armor;expect(validSave(s)).toBe(false);const t=newSave();t.party=[];expect(validSave(t)).toBe(false);});
 it('调试档与普通档隔离',()=>{const m=new MemoryStorage();writeSave(m,newSave());writeSave(m,fixture('growth'),`${SAVE_KEY}.debug`);expect(loadSave(m).save?.heroes).toHaveLength(1);});
});

describe('第一章扩展与兼容',()=>{
 it('旧版第三关通关存档继续至第四关，装备金币不变',()=>{const m=new MemoryStorage(),s=fixture('squad');s.cleared=[1,2,3];s.unlocked=3;const inventory=JSON.stringify(s.inventory);writeSave(m,s);const restored=loadSave(m).save!;expect(restored.unlocked).toBe(4);expect(restored.gold).toBe(s.gold);expect(JSON.stringify(restored.inventory)).toBe(inventory);});
 it('未通关第三关的旧档不能跳关',()=>{const m=new MemoryStorage(),s=fixture('squad');writeSave(m,s);expect(loadSave(m).save!.unlocked).toBe(3);});
 it('完整章解锁停在第十关，重玩首通奖励不会重复',()=>{const s=fixture('growth');s.cleared=s.cleared.filter(n=>n!==10);const a=settle(s,{...reward('final1',10),recruits:[]});expect(a?.first).toBe(true);expect(s.unlocked).toBe(10);expect(settle(s,{...reward('final2',10),recruits:[]})?.first).toBe(false);expect(validSave(s)).toBe(true);});
 it('新上限之上等级与不存在关卡仍拒绝',()=>{const s=fixture('growth');s.heroes[0].level=11;expect(validSave(s)).toBe(false);s.heroes[0].level=10;s.unlocked=11;expect(validSave(s)).toBe(false);});
});
