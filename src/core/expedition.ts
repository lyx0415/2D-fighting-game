import type {SaveData} from './types';
export const CONTRACTS={story:{name:'誓约之路',hp:1,atk:1,gold:0,description:'原版剧情难度 · 营救同伴，推进主线'},veteran:{name:'铁誓试炼',hp:1.2,atk:1.12,gold:.2,description:'敌生命+20% / 攻击+12% · 金币+20%'},nightfall:{name:'长夜远征',hp:1.4,atk:1.22,gold:.4,description:'敌生命+40% / 攻击+22% · 每12秒余烬诅咒 · 金币+40%'}} as const;
export type Contract=keyof typeof CONTRACTS;
export function allowedContract(save:SaveData,level:number,mode:Contract):Contract{return mode==='story'||save.cleared.includes(level)?mode:'story';}
export function recordVictory(save:SaveData,level:number,mode:Contract,time:number,survivors:number,total:number){
 const stars=1+Number(survivors===total)+Number(time<=300);const key=`${level}:${mode}`;
 const old=save.records?.[key];save.records??={};save.records[key]={stars:Math.max(stars,old?.stars??0),bestTime:Math.min(time,old?.bestTime??Infinity),wins:(old?.wins??0)+1};return stars;
}
