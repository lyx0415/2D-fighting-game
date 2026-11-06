import { validTraining } from './training';
import { HERO_ORDER, LEVELS, MAX_LEVEL } from './data';
import type { SaveData } from './types';
export const SAVE_KEY='ashen-oath.v1';
export interface StorageLike { getItem(key:string):string|null;setItem(key:string,value:string):void;removeItem(key:string):void }
export function validSave(value:unknown):value is SaveData {
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const s=value as SaveData;
 if(s.version!==1||!Array.isArray(s.heroes)||!s.heroes.length||s.heroes.length>5||!Array.isArray(s.inventory)||!Array.isArray(s.party)||!Array.isArray(s.cleared)||!Array.isArray(s.settlements))return false;
 const integer=(n:number,min:number,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
 if(!integer(s.gold,0)||!integer(s.unlocked,1,LEVELS.length)||!integer(s.nextItem,1)||!s.settings||typeof s.settings!=='object'||Array.isArray(s.settings)||!Number.isFinite(s.settings.volume)||s.settings.volume<0||s.settings.volume>1)return false;
 if(s.settings.leftHanded!==undefined&&typeof s.settings.leftHanded!=='boolean')return false;
 if(s.settings.audioProfile!==undefined&&!['grounded','feral','mystic'].includes(s.settings.audioProfile)||s.settings.exertions!==undefined&&typeof s.settings.exertions!=='boolean')return false;
 if(!s.heroes.every(h=>h&&typeof h==='object'&&HERO_ORDER.includes(h.id)&&integer(h.level,1,MAX_LEVEL)&&integer(h.xp,0)&&h.equipment&&typeof h.equipment==='object'&&!Array.isArray(h.equipment)&&validTraining(h)))return false;
 if(new Set(s.heroes.map(h=>h.id)).size!==s.heroes.length||s.party.length<1||s.party.length>4||new Set(s.party).size!==s.party.length||!s.party.every(id=>s.heroes.some(h=>h.id===id))||!s.party.includes(s.leader))return false;
 if(!s.inventory.every(i=>i&&typeof i.id==='string'&&/^item-\d+$/.test(i.id)&&['weapon','armor','charm'].includes(i.slot)&&['white','green','blue'].includes(i.quality)&&integer(i.plus,0,3)&&(i.hero===undefined?i.slot!=='weapon':HERO_ORDER.includes(i.hero))))return false;
 if(new Set(s.inventory.map(i=>i.id)).size!==s.inventory.length||s.inventory.some(i=>Number(i.id.slice(5))>=s.nextItem))return false;
 if(s.records!==undefined&&(!s.records||typeof s.records!=='object'||Array.isArray(s.records)||!Object.entries(s.records).every(([key,v])=>/^([1-9]|10):(story|veteran|nightfall)$/.test(key)&&v&&integer(v.stars,1,3)&&Number.isFinite(v.bestTime)&&v.bestTime>=0&&integer(v.wins,1))))return false;
 const inventoryById=new Map(s.inventory.map(item=>[item.id,item]));
 const used=new Set<string>();for(const h of s.heroes)for(const [slot,id] of Object.entries(h.equipment)){const i=inventoryById.get(id);if(!i||i.slot!==slot||used.has(i.id)||(slot==='weapon'&&i.hero!==h.id))return false;used.add(i.id);}
 return s.cleared.every(n=>integer(n,1,LEVELS.length))&&s.settlements.every(id=>typeof id==='string');
}
export function unlockContinuation(save:SaveData):SaveData {
 // Version-1 saves keep their inventory and IDs; extend only a cleared frontier.
 while(save.unlocked<LEVELS.length&&save.cleared.includes(save.unlocked))save.unlocked++;
 return save;
}
function parse(raw:string|null):SaveData|null {try {const v=JSON.parse(raw??'null');return validSave(v)?v:null;}catch{return null;}}
export function loadBackup(storage:StorageLike,key=SAVE_KEY):SaveData|null {
 try {
  const backup=parse(storage.getItem(`${key}.backup`));
  return backup?unlockContinuation(backup):null;
 } catch {return null;}
}
export function loadSave(storage:StorageLike,key=SAVE_KEY):{save:SaveData|null;notice:string} {
 try{const raw=storage.getItem(key),save=parse(raw);if(save)return{save:unlockContinuation(save),notice:''};const backup=parse(storage.getItem(`${key}.backup`));if(backup)return{save:unlockContinuation(backup),notice:'主存档损坏，已读取上一份有效备份。'};return{save:null,notice:raw?'存档无法读取。原始数据已保留；选择新游戏可确认重建。':''};}catch{return{save:null,notice:'浏览器阻止了本地存储，本次进度只能暂存在内存中。'};}
}
export function writeSave(storage:StorageLike,save:SaveData,key=SAVE_KEY):string|null {
 try{if(!validSave(save))return '存档校验失败，未覆盖现有进度';const old=storage.getItem(key),serialized=JSON.stringify(save);if(old===serialized)return null;if(parse(old))storage.setItem(`${key}.backup`,old!);storage.setItem(key,serialized);return null;}catch{return '保存失败：浏览器存储不可用或空间不足，请不要关闭页面。';}
}
