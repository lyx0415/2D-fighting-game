import { talentBonus } from './training';
import { ENHANCE_COST, MAX_LEVEL, HEROES, HERO_ORDER, LEVELS, QUALITY, SLOT_NAMES, WEAPON_NAMES, XP_THRESHOLDS } from './data';
import type { BattleReward, EquipmentInstance, HeroId, HeroProgress, Quality, SaveData, Slot, Stats } from './types';
export function newSave(): SaveData {
 const save: SaveData = {version:1,heroes:[],party:['warrior'],leader:'warrior',inventory:[],gold:0,unlocked:1,cleared:[],settlements:[],settings:{volume:.35},nextItem:1};
 recruit(save,'warrior',1); return save;
}
export function addItem(save: SaveData, item: Omit<EquipmentInstance,'id'>): EquipmentInstance {
 const result = {...item,id:`item-${save.nextItem++}`}; save.inventory.push(result); return result;
}
export function recruit(save: SaveData, id: HeroId, level?: number): boolean {
 if(save.heroes.some(h=>h.id===id)) return false;
 const h: HeroProgress = {id,level:level ?? Math.max(1,...save.heroes.map(h=>h.level)),xp:0,equipment:{}};
 save.heroes.push(h);
 for(const slot of ['weapon','armor','charm'] as Slot[]) h.equipment[slot]=addItem(save,{slot,quality:'white',plus:0,...(slot==='weapon'?{hero:id}:{})}).id;
 if(save.party.length<4 && !save.party.includes(id)) save.party.push(id);
 return true;
}
export function equipmentStats(item: EquipmentInstance): Stats {
 const base = item.slot==='weapon'?{hp:0,atk:5,armor:0}:item.slot==='armor'?{hp:30,atk:0,armor:4}:{hp:15,atk:2,armor:0};
 return Object.fromEntries(Object.entries(base).map(([k,v])=>[k,Math.round(v*QUALITY[item.quality].factor*(1+item.plus*.1))])) as unknown as Stats;
}
export function heroStats(save: SaveData, id: HeroId): Stats {
 const h=save.heroes.find(h=>h.id===id)!; const base=HEROES[id];
 const stats={hp:Math.round(base.hp*(1+.12*(h.level-1))),atk:Math.round(base.atk*(1+.08*(h.level-1))),armor:base.armor+2*(h.level-1)};
 for(const itemId of Object.values(h.equipment)) {const item=save.inventory.find(i=>i.id===itemId);if(item){const x=equipmentStats(item);stats.hp+=x.hp;stats.atk+=x.atk;stats.armor+=x.armor;}}
 const bonus=talentBonus(h);stats.hp+=bonus.hp;stats.atk+=bonus.atk;stats.armor+=bonus.armor;
 return stats;
}
export function itemName(item: EquipmentInstance): string {return `${QUALITY[item.quality].name}·${item.slot==='weapon'?WEAPON_NAMES[item.hero!] : item.slot==='armor'?'旅人锁甲':'余烬吊坠'}${item.plus?` +${item.plus}`:''}`;}
export function ownerOf(save: SaveData, itemId: string): HeroProgress|undefined {return save.heroes.find(h=>Object.values(h.equipment).includes(itemId));}
export function equip(save: SaveData, hero: HeroId, itemId: string): string|null {
 const h=save.heroes.find(h=>h.id===hero),item=save.inventory.find(i=>i.id===itemId);
 if(!h||!item)return '装备或角色不存在'; if(ownerOf(save,itemId))return '请先从当前角色卸下装备';
 if(item.slot==='weapon'&&item.hero!==hero)return '该武器不适合此职业'; h.equipment[item.slot]=item.id;return null;
}
export function unequip(save: SaveData, hero: HeroId, slot: Slot): void {const h=save.heroes.find(h=>h.id===hero);if(h)delete h.equipment[slot];}
export function enhance(save: SaveData,id:string): string|null {const i=save.inventory.find(i=>i.id===id);if(!i)return '装备不存在';if(i.plus>=3)return '已强化至上限';const cost=ENHANCE_COST[i.plus];if(save.gold<cost)return '金币不足';save.gold-=cost;i.plus++;return null;}
export function sell(save: SaveData,id:string): string|null {const i=save.inventory.find(i=>i.id===id);if(!i)return '装备不存在';if(ownerOf(save,id))return '已穿戴装备不能出售';save.gold+=QUALITY[i.quality].price;save.inventory=save.inventory.filter(i=>i.id!==id);return null;}
export function gainXp(hero: HeroProgress,amount:number):void {hero.xp+=amount;while(hero.level<MAX_LEVEL&&hero.xp>=XP_THRESHOLDS[hero.level-1]){hero.xp-=XP_THRESHOLDS[hero.level-1];hero.level++;}if(hero.level===MAX_LEVEL)hero.xp=0;}
export function settle(save:SaveData,reward:BattleReward): {first:boolean;recruits:HeroId[];gold:number;items:EquipmentInstance[]}|null {
 if(save.settlements.includes(reward.runId))return null;
 const level=LEVELS[reward.levelId-1];if(!level||reward.levelId>save.unlocked)return null;
 const first=!save.cleared.includes(level.id), recruits:HeroId[]=[];
 const startingLevel=Math.max(...save.heroes.map(h=>h.level));
 for(const id of reward.recruits)if(recruit(save,id,startingLevel))recruits.push(id);
 for(const h of save.heroes)gainXp(h,level.xp);
 const items=reward.items.map(i=>addItem(save,i));if(first)items.push(addItem(save,{...level.guarantee,plus:0}));
 const gold=reward.gold+level.gold;save.gold+=gold;save.unlocked=Math.max(save.unlocked,Math.min(LEVELS.length,level.id+1));
 if(first)save.cleared.push(level.id);save.settlements.push(reward.runId);return {first,recruits,gold,items};
}
export function rng(seed:number):()=>number {let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
export function rollQuality(level:number,random:()=>number):Quality {const r=random();return level===1?(r<.8?'white':'green'):level===2?(r<.55?'white':r<.95?'green':'blue'):(r<.3?'white':r<.85?'green':'blue');}
export function fixture(kind:'new'|'squad'|'growth'):SaveData {const s=newSave();if(kind==='new')return s;for(const id of HERO_ORDER.slice(1,kind==='squad'?4:5))recruit(s,id);for(const h of s.heroes)h.level=kind==='squad'?3:MAX_LEVEL;s.unlocked=kind==='growth'?LEVELS.length:3;s.cleared=kind==='growth'?LEVELS.map(l=>l.id):[1,2];s.gold=kind==='growth'?3000:250;for(const i of s.inventory)i.quality=i.slot==='weapon'?'green':'white';if(kind==='growth')for(const slot of Object.keys(SLOT_NAMES) as Slot[])addItem(s,{slot,quality:'blue',plus:0,...(slot==='weapon'?{hero:'assassin' as HeroId}:{})});return s;}
