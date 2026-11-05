import { HEROES } from './data';
import type { HeroId, HeroProgress, SaveData, TalentId } from './types';

export const TALENTS = {
 vitality:{name:'坚韧',icon:'♡',description:'每点增加职业初始生命的5%'},
 force:{name:'锋芒',icon:'⚔',description:'每点增加2点攻击'},
 guard:{name:'铁壁',icon:'⬡',description:'每点增加2点护甲'},
} as const;
export const talentRanks=(hero:HeroProgress)=>hero.talents??{vitality:0,force:0,guard:0};
export const skillRanks=(hero:HeroProgress):[number,number]=>hero.skillRanks??[0,0];
export const talentPoints=(hero:HeroProgress)=>hero.level-1-Object.values(talentRanks(hero)).reduce((a,b)=>a+b,0);
export const skillPoints=(hero:HeroProgress)=>Math.floor(hero.level/2)-skillRanks(hero).reduce((a,b)=>a+b,0);
export const skillPower=(rank=0)=>1+.08*rank;
export const skillCooldown=(base:number,rank=0)=>Math.round(base*(1-.04*rank)*100)/100;
export function validTraining(hero:HeroProgress):boolean {
 if(hero.talents!==undefined){const t=hero.talents;if(!t||typeof t!=='object'||Array.isArray(t)||Object.keys(t).length!==3||!Object.keys(TALENTS).every(k=>Object.hasOwn(t,k)&&Number.isInteger(t[k as TalentId])&&t[k as TalentId]>=0&&t[k as TalentId]<=5))return false;}
 if(hero.skillRanks!==undefined&&(!Array.isArray(hero.skillRanks)||hero.skillRanks.length!==2||!hero.skillRanks.every(n=>Number.isInteger(n)&&n>=0&&n<=3)))return false;
 return talentPoints(hero)>=0&&skillPoints(hero)>=0;
}
export function trainTalent(save:SaveData,id:HeroId,key:TalentId):string|null {
 const h=save.heroes.find(h=>h.id===id);if(!h||!Object.hasOwn(TALENTS,key))return '天赋或角色不存在';
 if(talentRanks(h)[key]>=5)return '此天赋已达上限';if(talentPoints(h)<1)return '天赋点不足，升级可获得更多点数';
 h.talents={...talentRanks(h),[key]:talentRanks(h)[key]+1};return null;
}
export function trainSkill(save:SaveData,id:HeroId,index:0|1):string|null {
 const h=save.heroes.find(h=>h.id===id);if(!h||![0,1].includes(index))return '技能或角色不存在';
 if(skillRanks(h)[index]>=3)return '此技能已达4级';if(skillPoints(h)<1)return '技能点不足，偶数等级可获得技能点';
 const ranks:[number,number]=[...skillRanks(h)];ranks[index]++;h.skillRanks=ranks;return null;
}
export function resetTraining(save:SaveData,id:HeroId):void {const h=save.heroes.find(h=>h.id===id);if(h){delete h.talents;delete h.skillRanks;}}
export function talentBonus(hero:HeroProgress){const t=talentRanks(hero);return{hp:Math.round(HEROES[hero.id].hp*.05*t.vitality),atk:2*t.force,armor:2*t.guard};}
