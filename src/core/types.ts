export type HeroId = 'warrior' | 'archer' | 'mage' | 'tank' | 'assassin';
export type EnemyId = 'zombie' | 'wolf' | 'crossbow' | 'priest' | 'raider' | 'guard' | 'boss' | 'wraith' | 'fanatic' | 'bishop';
export type Slot = 'weapon' | 'armor' | 'charm';
export type Quality = 'white' | 'green' | 'blue';
export type AudioProfile = 'grounded' | 'feral' | 'mystic';
export interface Stats { hp: number; atk: number; armor: number }
export interface SkillDefinition { name: string; cd: number; range: number; description: string }
export interface HeroDefinition extends Stats { id: HeroId; name: string; role: string; color: string; range: number; interval: number; speed: number; skills: [SkillDefinition, SkillDefinition]; bio: string }
export interface EnemyDefinition extends Stats { name: string; range: number; interval: number; speed: number; rank: 'normal' | 'elite' | 'boss' }
export type TalentId = 'vitality' | 'force' | 'guard';
export interface HeroProgress { id: HeroId; level: number; xp: number; equipment: Partial<Record<Slot, string>>; talents?: Record<TalentId,number>; skillRanks?: [number,number] }
export interface EquipmentInstance { id: string; slot: Slot; quality: Quality; hero?: HeroId; plus: number }
export interface LevelDefinition { id: number; name: string; subtitle: string; theme: 'ash' | 'forest' | 'fortress' | 'abbey' | 'crypt'; waves: EnemyId[][]; reinforcements?: EnemyId[][]; xp: number; gold: number; intro: string; outro: string; hint: string; guarantee: Pick<EquipmentInstance, 'slot' | 'quality' | 'hero'> }
export interface SaveData { records?: Record<string,{stars:number;bestTime:number;wins:number}>; version: 1; heroes: HeroProgress[]; party: HeroId[]; leader: HeroId; inventory: EquipmentInstance[]; gold: number; unlocked: number; cleared: number[]; settlements: string[]; settings: { leftHanded?:boolean; volume: number; audioProfile?: AudioProfile; exertions?: boolean }; nextItem: number }
export interface BattleReward { runId: string; levelId: number; gold: number; items: Omit<EquipmentInstance, 'id'>[]; recruits: HeroId[] }
export interface Point { x: number; y: number }
export type Command = { type: 'move'; point: Point } | { type: 'attackTarget'; id: string } | { type: 'castSkill'; index: 0 | 1 } | { type: 'switchHero'; id: string };
