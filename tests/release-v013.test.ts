import {describe,it,expect} from 'vitest';
import {newSave,fixture,settle} from '../src/core/progression';
import {Battle} from '../src/core/battle';
import {CONTRACTS,allowedContract,recordVictory} from '../src/core/expedition';
import {exportProgress,importProgress} from '../src/core/transfer';
import {validSave} from '../src/core/save';
describe('移动发布候选',()=>{
 it('旧档兼容、传输往返、损坏和超大内容拒绝',()=>{const s=fixture('squad');expect(importProgress(exportProgress(s))).toEqual(s);expect(importProgress(JSON.stringify(s))).toEqual(s);expect(()=>importProgress('{}')).toThrow();expect(()=>importProgress('x'.repeat(1024*1024+1))).toThrow();expect(()=>importProgress('{')).toThrow();});
 it('契约只开放已通关关卡，强化同样作用于召唤敌军而不改英雄',()=>{const s=newSave();expect(allowedContract(s,1,'nightfall')).toBe('story');const a=new Battle(s,1,1,'a','nightfall');expect(a.contract).toBe('story');s.cleared=[1];const b=new Battle(s,1,1,'b','nightfall');expect(b.enemies[0].maxHp).toBe(Math.round(a.enemies[0].maxHp*1.4));expect(b.enemies[0].atk).toBe(Math.round(a.enemies[0].atk*1.22));expect(b.active.hp).toBe(a.active.hp);expect(CONTRACTS.nightfall.gold).toBe(.4);});
 it('战绩按关卡契约独立保留最高星与最快用时，校验不接受非法记录',()=>{const s=newSave();expect(recordVictory(s,1,'story',250,1,1)).toBe(3);recordVictory(s,1,'story',400,0,1);recordVictory(s,1,'veteran',310,1,1);expect(s.records?.['1:story']).toEqual({stars:3,bestTime:250,wins:2});expect(s.records?.['1:veteran'].stars).toBe(2);expect(validSave(s)).toBe(true);s.records!['99:story']={stars:9,bestTime:-1,wins:0};expect(validSave(s)).toBe(false);});
 it('长夜诅咒提前1.8秒锁定，走出圆阵不受伤',()=>{const s=newSave();s.cleared=[1];const b=new Battle(s,1,1,'curse','nightfall');b.time=12;b.step();const h=b.hazards.find(h=>h.name==='余烬诅咒')!;expect(h).toBeDefined();expect(h.end-h.start).toBeCloseTo(1.8);const hp=b.active.hp;b.active.x=45;b.active.y=620;b.active.move=undefined;b.time=h.end-.001;b.step();expect(b.active.hp).toBe(hp);expect(b.hazards.some(h=>h.name==='余烬诅咒')).toBe(false);});
 it('结算幂等继续阻止奖励重复领取',()=>{const s=newSave();const r={runId:'v013',levelId:1,gold:120,items:[],recruits:[]};expect(settle(s,r)).not.toBeNull();const gold=s.gold;expect(settle(s,r)).toBeNull();expect(s.gold).toBe(gold);});
});
