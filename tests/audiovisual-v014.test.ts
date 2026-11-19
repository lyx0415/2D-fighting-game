import {expect,it} from 'vitest';
import {validSave} from '../src/core/save';
import {newSave} from '../src/core/progression';
import {combatCue} from '../src/game/audio-cues';
import {audioUrl} from '../src/game/audio-assets';
import {categoryForCue} from '../src/game/audio-mix';

it('版本 1 存档兼容旧混音，验证新音量的键、类型和范围',()=>{
 const old=newSave();
 expect(validSave(old)).toBe(true);
 expect(validSave({...old,settings:{volume:0,lastVolume:.73,audioLevels:{music:0,voices:1}}})).toBe(true);
 for(const audioLevels of [null,[],{music:'1'},{music:-1},{effects:NaN},{voice:1},{ambience:1.1}]){
  expect(validSave({...old,settings:{volume:.35,audioLevels}})).toBe(false);
 }
 expect(validSave({...old,settings:{volume:0,lastVolume:0}})).toBe(false);
});

it('两位首领分别使用高优先级预警与结算音，召唤保留原句',()=>{
 for(const [sourceKind,prefix] of [['boss','warden'],['bishop','bishop']] as const){
  const event={type:'skill',x:0,y:0,sourceKind} as const;
  const warning=combatCue({...event,phase:'cast',text:'预警'})!;
  expect(warning).toBe(prefix+'-warning');
  expect(categoryForCue(warning)).toBe('warning');
  expect(audioUrl(warning)).toBe('/audio/v014/'+warning+'.wav');
  expect(combatCue({...event,phase:'impact'})).toBe(prefix+'-impact');
  expect(combatCue({...event,phase:'cast',text:'裂隙召唤'})).toBe('doom');
 }
});
