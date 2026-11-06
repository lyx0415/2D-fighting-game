import {CONTRACTS,allowedContract,type Contract} from './expedition';
import { skillRanks, skillPower, skillCooldown } from './training';
import { ENEMIES, HEROES, LEVELS } from './data';
import { heroStats, recruit, rng, rollQuality } from './progression';
import type { BattleReward, Command, EnemyId, EquipmentInstance, HeroId, Point, SaveData } from './types';

export const STAGE_WIDTH=2200;
export const FLOOR={top:360,bottom:620};
export interface Unit extends Point {
 id:string; kind:HeroId|EnemyId; side:'hero'|'enemy'; name:string; hp:number; maxHp:number; atk:number; armor:number; range:number; interval:number; speed:number;
 cd:[number,number]; attackTimer:number; lockUntil:number; shield:number; shieldUntil:number; reductionUntil:number; slowUntil:number; stunUntil:number; tauntUntil:number; tauntedBy?:string;
 move?:Point; target?:string; facing:number; animation:'idle'|'move'|'attack'|'hit'|'dead'; animUntil:number; ai:string; specialTimer:number; specialStep:number; enraged:boolean; summoned:boolean; dropped:boolean;
 skillRanks?:[number,number];
 action?:{kind:'attack'|'skill0'|'skill1';start:number;end:number};walkDistance?:number;hitAt?:number;
}
export interface Hazard extends Point { id:number; source:string; shape:'circle'|'rect'|'cone'; radius:number; length:number; width:number; angle:number; start:number; end:number; multiplier:number; name:string; charge?:boolean }
export interface Projectile extends Point { id:number; source:string; target:string; speed:number; multiplier:number; kind:string;skillIndex?:0|1 }
export interface BattleEvent extends Point { type:'damage'|'heal'|'skill'|'loot'|'message'|'attack'|'death'|'marker'|'phase'; text?:string; color?:string; kind?:string; target?:string; value?:number; radius?:number;source?:string;sourceKind?:string;targetKind?:string;skillIndex?:0|1;phase?:'cast'|'impact'|'telegraph';shape?:Hazard['shape'];length?:number;width?:number;angle?:number }
interface Delayed { at:number; source:string; target?:string; point?:Point; multiplier:number; radius?:number; projectile?:boolean; slow?:boolean; stun?:boolean; kind:string;skillIndex?:0|1 }
export function isBossKind(kind:string):boolean {return kind==='boss'||kind==='bishop';}
export function distance(a:Point,b:Point):number {return Math.hypot(a.x-b.x,a.y-b.y);}
export function damageAmount(atk:number,multiplier:number,armor:number,reduction=0):number {return Math.max(1,Math.round(atk*multiplier*100/(100+armor)*(1-reduction)));}
export function inHazard(p:Point,h:Hazard,padding=0):boolean {
 const dx=p.x-h.x,dy=p.y-h.y;
 if(h.shape==='circle')return Math.hypot(dx,dy)<=h.radius+padding;
 const forward=dx*Math.cos(h.angle)+dy*Math.sin(h.angle),side=-dx*Math.sin(h.angle)+dy*Math.cos(h.angle);
 if(h.shape==='cone')return forward>=-padding&&Math.hypot(dx,dy)<=h.radius+padding&&Math.abs(Math.atan2(side,forward))<=Math.PI/3;
 return forward>=-padding&&forward<=h.length+padding&&Math.abs(side)<=h.width/2+padding;
}
export class Battle {
 nextCurse=12;
 readonly contract:Contract;
 queuedSkill?:{hero:string;index:0|1;expires:number};
 readonly level; readonly original:SaveData; readonly reward:BattleReward; readonly random:()=>number;
 units:Unit[]=[]; hazards:Hazard[]=[]; projectiles:Projectile[]=[]; events:BattleEvent[]=[]; pending:Delayed[]=[];
 statistics={heroDamage:0,shieldAbsorbed:0,enemiesDefeated:0};
 time=0; wave=0; waveCleared=false; reservesSpawned=false; status:'playing'|'won'|'lost'='playing'; activeId=''; paused=false; accumulator=0; aiAccumulator=0; serial=0;
 constructor(save:SaveData,levelId:number,seed=Date.now(),runId:string=globalThis.crypto?.randomUUID?.()??`run-${Date.now()}-${seed}`,contract:Contract='story'){
  this.contract=allowedContract(save,levelId,contract);this.original=structuredClone(save);this.level=LEVELS[levelId-1];if(!this.level||levelId>save.unlocked)throw new Error('关卡尚未解锁');this.random=rng(seed);
  this.reward={runId,levelId,gold:0,items:[],recruits:[]};
  save.party.forEach((id,i)=>this.addHero(id,210-i*38,455+(i%2)*65));this.activeId=save.leader;this.spawnWave();
  this.message(this.level.hint);
 }
 get active():Unit {return this.units.find(u=>u.id===this.activeId)!;}
 get heroes():Unit[]{return this.units.filter(u=>u.side==='hero');}
 get enemies():Unit[]{return this.units.filter(u=>u.side==='enemy'&&u.hp>0);}
 get hasReserves():boolean{return (this.level.reinforcements?.[this.wave]?.length??0)>0;}
 get waitingForAdvance():boolean{return !this.waveCleared&&this.enemies.length===0&&this.hasReserves&&!this.reservesSpawned;}
 get encounter():number{return this.reservesSpawned?2:1;}
 get stageEnd():number{return (this.wave+1)*STAGE_WIDTH;}
 emit(event:BattleEvent):void {this.events.push(event);if(this.events.length>150)this.events.splice(0,this.events.length-150);}
 message(text:string):void {this.emit({type:'message',x:0,y:0,text});}
 private baseUnit(id:string,kind:Unit['kind'],side:Unit['side'],point:Point,stats:{hp:number;atk:number;armor:number;range:number;interval:number;speed:number;name:string}):Unit {
  return {...point,...stats,id,kind,side,maxHp:stats.hp,cd:[0,0],attackTimer:.3,lockUntil:0,shield:0,shieldUntil:0,reductionUntil:0,slowUntil:0,stunUntil:0,tauntUntil:0,facing:side==='hero'?1:-1,animation:'idle',animUntil:0,ai:'待命',specialTimer:isBossKind(kind)?4:5,specialStep:0,enraged:false,summoned:false,dropped:false};
 }
 private addHero(id:HeroId,x:number,y:number):void {
  if(this.units.some(u=>u.id===id))return;
  const temp=structuredClone(this.original);if(!temp.heroes.some(h=>h.id===id))recruit(temp,id);
  const u=this.baseUnit(id,id,'hero',{x,y},{...HEROES[id],...heroStats(temp,id)});u.skillRanks=[...skillRanks(temp.heroes.find(h=>h.id===id)!)];this.units.push(u);
 }
 private addEnemy(kind:EnemyId,x:number,y:number,summoned=false):void {
  if(this.enemies.length>=16)return;
  const def=ENEMIES[kind],factor=def.rank==='boss'?1:(this.level.id<=3?[1,1.25,1.6][this.level.id-1]:1.6+.18*(this.level.id-3));
  const attackFactor=def.rank==='boss'?1:(this.level.id<=3?factor:1.6+.10*(this.level.id-3));
  const u=this.baseUnit(`enemy-${++this.serial}`,kind,'enemy',{x,y},{...def,hp:Math.round(def.hp*factor*CONTRACTS[this.contract].hp),atk:Math.round(def.atk*attackFactor*CONTRACTS[this.contract].atk)});u.summoned=summoned;this.units.push(u);
 }
 private spawnWave():void {
  this.waveCleared=false;this.reservesSpawned=false;this.hazards=[];this.projectiles=[];this.pending=[];
  this.units=this.units.filter(u=>u.side==='hero');
  this.level.waves[this.wave].forEach((kind,i)=>this.addEnemy(kind,this.wave*STAGE_WIDTH+700+(i%3)*105,405+Math.floor(i/3)*85+(i%2)*60));
  this.emit({type:'phase',x:0,y:0,text:`战区 ${this.wave+1} / ${this.level.waves.length}`});
 }
 command(command:Command):boolean {
  if(this.paused||this.status!=='playing')return false;
  if(command.type==='switchHero'){
   const next=this.heroes.find(u=>u.id===command.id&&u.hp>0);if(!next)return false;
   if(next.id===this.activeId)return true;this.active.move=undefined;this.active.target=undefined;
   this.queuedSkill=undefined;this.activeId=next.id;next.move=undefined;next.target=undefined;next.ai='玩家';return true;
  }
  const u=this.active;if(!u||u.hp<=0)return false;
  if(command.type==='move'){if(command.point.y<FLOOR.top||command.point.y>FLOOR.bottom){this.message('请点击石道内移动；金线和路缘标记了可行走范围');return false;}this.queuedSkill=undefined;u.target=undefined;u.move=this.clampPoint(command.point);this.emit({type:'marker',...u.move});return true;}
  if(command.type==='attackTarget'){const t=this.enemies.find(e=>e.id===command.id);if(!t)return false;u.target=t.id;u.move=undefined;return true;}
  if(u.lockUntil>this.time&&u.cd[command.index]<=0&&u.stunUntil<=this.time){
   // A short normal-attack animation must not swallow a player's skill tap.
   this.queuedSkill={hero:u.id,index:command.index,expires:this.time+1};return true;
  }
  return this.cast(u,command.index);
 }
 private clampPoint(p:Point):Point{return{x:Math.max(45,Math.min(this.stageEnd-38,p.x)),y:Math.max(FLOOR.top,Math.min(FLOOR.bottom,p.y))};}
 private closest(u:Unit,range=Infinity):Unit|undefined {
  const candidates=this.units.filter(t=>t.side!==u.side&&t.hp>0&&distance(u,t)<=range);
  const forced=this.units.find(t=>t.id===u.tauntedBy&&t.hp>0&&u.tauntUntil>this.time&&distance(u,t)<=range);if(forced)return forced;
  const selected=this.units.find(t=>t.id===u.target&&t.hp>0&&t.side!==u.side&&distance(u,t)<=range);if(selected)return selected;
  if(u.side==='hero'&&u.id!==this.activeId){const focus=candidates.find(t=>t.id===this.active.target);if(focus)return focus;}
  return candidates.sort((a,b)=>{
   const weight=(t:Unit)=>u.kind==='assassin'&&['crossbow','priest'].includes(t.kind)?-250:0;
   return distance(u,a)+weight(a)-distance(u,b)-weight(b);
  })[0];
 }
 cast(u:Unit,index:0|1):boolean {
  if(u.hp<=0||u.cd[index]>0||u.lockUntil>this.time||u.stunUntil>this.time)return false;
  const def=HEROES[u.kind as HeroId],skill=def.skills[index];
  const own=(u.kind==='warrior'||u.kind==='tank')&&index===1;
  const target=own?undefined:this.closest(u,skill.range);
  if(!own&&!target){if(u.id===this.activeId)this.message('射程内没有可施放的目标');return false;}
  const power=skillPower(u.skillRanks?.[index]);
  u.cd[index]=skillCooldown(skill.cd,u.skillRanks?.[index]);u.lockUntil=this.time+.3;u.animation='attack';u.animUntil=this.time+.3;
  u.action={kind:index===0?'skill0':'skill1',start:this.time,end:this.time+(index===0?.5:.7)};
  if(target)u.facing=target.x>=u.x?1:-1;
  this.emit({type:'skill',x:u.x,y:u.y,text:skill.name,kind:u.kind,source:u.id,sourceKind:u.kind,skillIndex:index,phase:'cast',target:target?.id,radius:own?120:70});
  const area=(p:Point,r:number,m:number,delay=0,slow=false,stun=false)=>this.pending.push({at:this.time+delay,source:u.id,point:{...p},radius:r,multiplier:m*power,slow,stun,kind:u.kind,skillIndex:index});
  if(u.kind==='warrior'){
   if(index===0)area(u,100,1.6);else{u.shield=u.maxHp*.3*power;u.shieldUntil=this.time+6;}
  }else if(u.kind==='archer'){
   if(index===0)for(let i=0;i<3;i++)this.pending.push({at:this.time+i*.13,source:u.id,target:target!.id,multiplier:.75*power,projectile:true,kind:'arrow',skillIndex:index});
   else for(let i=0;i<3;i++)area(target!,140,1,.2+i*.3);
  }else if(u.kind==='mage'){
   if(index===0)area(target!,110,1.4,0,true);else{area(target!,150,3.6,.7);this.emit({type:'skill',...target!,text:'陨火',radius:150,kind:'meteor',source:u.id,sourceKind:u.kind,skillIndex:index,phase:'telegraph'});}
  }else if(u.kind==='tank'){
   if(index===0)area(u,100,1,0,false,true);else{u.reductionUntil=this.time+5;for(const e of this.enemies)if(distance(e,u)<=220){e.tauntedBy=u.id;e.tauntUntil=this.time+5;}}
  }else{
   if(index===0){const p=this.clampPoint({x:target!.x-45*u.facing,y:target!.y});u.x=p.x;u.y=p.y;}
   this.pending.push({at:this.time+.1,source:u.id,target:target!.id,multiplier:(index===0?1.8:target!.hp/target!.maxHp<.35?4.8:3.2)*power,kind:'blade',skillIndex:index});
  }
  return true;
 }
 advance(seconds:number):void {
  if(this.paused||this.status!=='playing')return;
  this.accumulator+=Math.min(seconds,.25);
  while(this.accumulator>=1/60&&this.status==='playing'){this.step(1/60);this.accumulator-=1/60;}
 }
 step(dt=1/60):void {
  if(this.paused||this.status!=='playing')return;this.time+=dt;this.aiAccumulator+=dt;const decide=this.aiAccumulator>=.1;if(decide)this.aiAccumulator=0;
  for(const u of this.units){u.cd=[Math.max(0,u.cd[0]-dt),Math.max(0,u.cd[1]-dt)];u.attackTimer-=dt;u.specialTimer-=dt;if(u.shieldUntil<=this.time)u.shield=0;if(u.animUntil<=this.time)u.animation=u.hp>0?'idle':'dead';if(u.target&&!this.units.some(t=>t.id===u.target&&t.hp>0))u.target=undefined;}
  if(this.hasReserves&&!this.reservesSpawned&&this.active.x>=this.wave*STAGE_WIDTH+1130){
   this.reservesSpawned=true;
   this.level.reinforcements![this.wave].forEach((kind,i)=>this.addEnemy(kind,this.wave*STAGE_WIDTH+1670+(i%3)*110,405+Math.floor(i/3)*85+(i%2)*65));
   this.message('前方敌军现身！第二次遭遇，注意远程和侧翼。');
  }
  if(this.queuedSkill){const q=this.queuedSkill,u=this.units.find(u=>u.id===q.hero);if(!u||u.id!==this.activeId||u.hp<=0||q.expires<this.time)this.queuedSkill=undefined;else if(u.lockUntil<=this.time&&u.stunUntil<=this.time){this.queuedSkill=undefined;this.cast(u,q.index);}}
  if(this.contract==='nightfall'&&this.time>=this.nextCurse){this.nextCurse=this.time+12;const source=this.enemies[0];if(source){this.hazards.push({id:++this.serial,source:source.id,x:this.active.x,y:this.active.y,shape:'circle',radius:76,length:0,width:0,angle:0,start:this.time,end:this.time+1.8,multiplier:.65,name:'余烬诅咒'});this.message('长夜契约 · 余烬诅咒锁定，离开脚下圆阵！');}}
  this.resolveDelayed();this.updateProjectiles(dt);this.updateHazards();
  for(const u of this.units){if(u.hp<=0||u.stunUntil>this.time||u.lockUntil>this.time)continue;
   if(u.side==='hero')this.heroTick(u,dt,decide);else this.enemyTick(u,dt);
  }
  this.separate();
  for(const u of this.units){if(u.hp<=0&&!u.dropped){u.dropped=true;u.animation='dead';this.emit({type:'death',x:u.x,y:u.y,kind:u.kind});if(u.side==='enemy')this.drop(u);}}
  if(this.heroes.every(u=>u.hp<=0)){this.status='lost';return;}
  if(this.active.hp<=0){this.activeId=this.heroes.find(u=>u.hp>0)!.id;this.active.move=undefined;this.active.target=undefined;this.message(`已切换至${this.active.name}`);}
  if(!this.waveCleared&&this.enemies.length===0&&(!this.hasReserves||this.reservesSpawned)){this.waveCleared=true;this.clearWave();}
  if(this.waveCleared&&this.status==='playing'&&this.active.x>=this.stageEnd-95){this.wave++;this.spawnWave();this.active.move=undefined;this.message(`进入战区 ${this.wave+1}。注意敌人的攻击预警。`);}
 }
 private moveToward(u:Unit,p:Point,dt:number):void {
  const d=distance(u,p);if(d<3){if(u.move===p)u.move=undefined;return;}
  const slow=u.slowUntil>this.time?(isBossKind(u.kind)?.8:.6):1;
  const travel=Math.min(d,u.speed*slow*dt);u.x+=(p.x-u.x)/d*travel;u.y+=(p.y-u.y)/d*travel;u.walkDistance=(u.walkDistance??0)+travel;
  const c=this.clampPoint(u);u.x=c.x;u.y=c.y;u.facing=p.x>u.x?1:p.x<u.x?-1:u.facing;u.animation='move';
 }
 private heroTick(u:Unit,dt:number,decide:boolean):void {
  const manual=u.id===this.activeId;
  if(manual){u.ai='玩家';if(u.move){this.moveToward(u,u.move,dt);return;}const t=this.closest(u,u.target?Infinity:u.range);if(t){if(distance(u,t)>u.range)this.moveToward(u,t,dt);else this.basic(u,t);}return;}
  const danger=this.hazards.find(h=>this.time-h.start>=.35&&inHazard(u,h,15));
  if(danger){u.ai='躲避预警';const options=[{x:u.x,y:FLOOR.top},{x:u.x,y:FLOOR.bottom},{x:danger.x-danger.radius-60,y:u.y},{x:danger.x+danger.radius+60,y:u.y}].map(p=>this.clampPoint(p)).filter(p=>!inHazard(p,danger,20));const p=options.sort((a,b)=>distance(a,u)-distance(b,u))[0];if(p){this.moveToward(u,p,dt);return;}}
  if(distance(u,this.active)>420){u.ai='归队';this.moveToward(u,this.active,dt);return;}
  const t=this.closest(u);
  if(!t){u.ai='跟随';const i=this.heroes.indexOf(u);const p=this.clampPoint({x:this.active.x-70-(i%2)*45,y:this.active.y+(i%2?65:-65)});if(distance(u,p)>40)this.moveToward(u,p,dt);return;}
  if(decide){
   const close=this.enemies.filter(e=>distance(e,u)<220);
   const big=u.kind==='warrior'?u.hp<u.maxHp*.55:u.kind==='tank'?close.some(e=>this.closest(e)?.id!==u.id):ENEMIES[t.kind as EnemyId].rank!=='normal'||this.enemies.filter(e=>distance(e,t)<140).length>=3;
   if(big&&this.cast(u,1)){u.ai='大技能';return;}if(this.cast(u,0)){u.ai='小技能';return;}
  }
  u.ai='攻击';
  if(u.range>150&&distance(u,t)<100){const away=this.clampPoint({x:u.x+(u.x-t.x)*2,y:u.y+(u.y-t.y)*2});this.moveToward(u,away,dt);}
  else if(distance(u,t)>u.range*.9)this.moveToward(u,t,dt);else this.basic(u,t);
 }
 private enemyTick(u:Unit,dt:number):void {
  const target=this.closest(u);if(!target)return;u.target=target.id;
  if(isBossKind(u.kind)&&!u.enraged&&u.hp<=u.maxHp*.5){u.enraged=true;this.message(`${u.name}进入狂怒！攻击节奏加快。`);this.emit({type:'phase',x:u.x,y:u.y,text:'第二阶段 · 狂怒'});}
  if(u.specialTimer<=0){
   if(u.kind==='priest'){const ally=this.enemies.filter(e=>distance(e,u)<=320&&e.hp<e.maxHp).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(ally){const amount=Math.min(ally.maxHp-ally.hp,Math.round(ally.maxHp*.1));ally.hp+=amount;this.emit({type:'heal',...ally,value:amount});u.action={kind:'skill0',start:this.time,end:this.time+.5};this.emit({type:'skill',x:u.x,y:u.y,source:u.id,sourceKind:u.kind,target:ally.id,kind:u.kind,phase:'cast',text:'黑潮愈合'});}u.specialTimer=6;}
   else if(['boss','bishop','guard','raider','wraith'].includes(u.kind)){this.special(u,target);return;}
  }
  if(u.range>150&&distance(u,target)<110){this.moveToward(u,this.clampPoint({x:u.x+(u.x-target.x)*2,y:u.y+(u.y-target.y)*2}),dt);}
  else if(distance(u,target)>u.range)this.moveToward(u,target,dt);else this.basic(u,target);
 }
 private basic(u:Unit,t:Unit):void {
  if(u.attackTimer>0)return;u.attackTimer=u.interval;u.lockUntil=this.time+(u.side==='enemy'?.35:.16);u.facing=t.x>=u.x?1:-1;u.animation='attack';u.animUntil=this.time+.25;
  // The presentation window does not extend the existing combat lock or damage timing.
  if(!u.action||u.action.end<=this.time||u.action.kind==='attack')u.action={kind:'attack',start:this.time,end:this.time+(u.side==='enemy'?.58:.36)};
  this.emit({type:'attack',x:u.x,y:u.y,kind:u.kind,source:u.id,sourceKind:u.kind,target:t.id});
  this.pending.push({at:this.time+(u.side==='enemy'?.35:.1),source:u.id,target:t.id,multiplier:1,projectile:u.range>150,kind:u.range>150?(['mage','priest','wraith','bishop'].includes(u.kind)?'magic':'arrow'):'melee'});
 }
 private special(u:Unit,t:Unit):void {
  u.action={kind:u.specialStep%2?'skill1':'skill0',start:this.time,end:this.time+1.4};
  const angle=Math.atan2(t.y-u.y,t.x-u.x),base={id:++this.serial,x:u.x,y:u.y,source:u.id,angle,start:this.time,radius:160,length:380,width:105,multiplier:1.5};
  if(u.kind==='wraith'){
   this.hazards.push({...base,x:t.x,y:t.y,radius:82,shape:'circle',end:this.time+1.2,multiplier:.9,name:'缚印诅咒'});u.lockUntil=this.time+1.4;u.specialTimer=6.5;u.action!.end=u.lockUntil;
   this.emit({type:'skill',x:t.x,y:t.y,text:'缚印诅咒',kind:'enemy',source:u.id,sourceKind:u.kind,phase:'cast'});return;
  }
  if(u.kind==='bishop'){
   const step=u.specialStep++%3;
   if(step===2){if(!this.enemies.some(e=>e.summoned)){this.addEnemy('wraith',u.x-100,420,true);this.addEnemy('fanatic',u.x+100,565,true);this.message('莫尔召来了裂隙仆从，优先处理怨灵。');this.emit({type:'skill',x:u.x,y:u.y,source:u.id,sourceKind:u.kind,kind:'enemy',phase:'cast',text:'裂隙召唤'});}u.specialTimer=u.enraged?3.8:5;return;}
   const delay=step===0?1.5:1.25;
   this.hazards.push({...base,...(step===0?{x:t.x,y:t.y}:{}),radius:125,length:490,width:100,shape:step===0?'circle':'rect',end:this.time+delay,multiplier:step===0?1.35:1.6,name:step===0?'黑潮圆阵':'逆誓裂隙'});
   u.lockUntil=this.time+delay+.25;u.specialTimer=delay+(u.enraged?3.8:5);u.action!.end=u.lockUntil;this.emit({type:'skill',x:u.x,y:u.y,text:step===0?'黑潮圆阵':'逆誓裂隙',kind:'enemy',source:u.id,sourceKind:u.kind,phase:'cast'});return;
  }
  if(u.kind==='boss'){
   const step=u.specialStep++%3;
   if(step===2){if(!this.enemies.some(e=>e.summoned)){this.addEnemy('zombie',u.x-90,405,true);this.addEnemy('zombie',u.x+90,570,true);this.message('典狱长召唤了狱卒');this.emit({type:'skill',x:u.x,y:u.y,source:u.id,sourceKind:u.kind,kind:'enemy',phase:'cast',text:'召唤狱卒'});}u.specialTimer=u.enraged?4:5;return;}
   const delay=step===0?1.2:1.5;this.hazards.push({...base,shape:step===0?'rect':'circle',end:this.time+delay,multiplier:step===0?1.5:1.2,name:step===0?'裂地斩':'锁链震荡'});u.lockUntil=this.time+delay+.2;u.specialTimer=delay+(u.enraged?4:5);u.action!.end=u.lockUntil;
  }else{
   const delay=u.kind==='guard'?1:.9;this.hazards.push({...base,shape:u.kind==='guard'?'rect':'cone',radius:130,length:260,width:90,end:this.time+delay,name:u.kind==='guard'?'盾卫冲撞':'扇形重击',charge:u.kind==='guard'});u.lockUntil=this.time+delay+.2;u.specialTimer=6+delay;u.action!.end=u.lockUntil;
  }
  this.emit({type:'skill',x:u.x,y:u.y,text:this.hazards[this.hazards.length-1].name,kind:'enemy',source:u.id,sourceKind:u.kind,phase:'cast'});
 }
 private hit(source:Unit,target:Unit,multiplier:number,skillIndex?:0|1):void {
  if(target.hp<=0)return;
  let value=damageAmount(source.atk,multiplier,target.armor,target.reductionUntil>this.time?.4*skillPower(target.skillRanks?.[1]):0);
  const absorbed=Math.min(target.shield,value);target.shield-=absorbed;value-=absorbed;if(target.side==='hero'){this.statistics.heroDamage+=Math.min(target.hp,value);this.statistics.shieldAbsorbed+=absorbed;}target.hp=Math.max(0,target.hp-value);
  if(target.hp>0){target.hitAt=this.time;target.animation='hit';target.animUntil=this.time+.12;}
  this.emit({type:'damage',x:target.x,y:target.y,value,text:absorbed>0?`${value} · 护盾${Math.round(absorbed)}`:undefined,kind:target.side,source:source.id,sourceKind:source.kind,target:target.id,targetKind:target.kind,skillIndex});
 }
 private resolveDelayed():void {
  const ready=this.pending.filter(a=>a.at<=this.time);this.pending=this.pending.filter(a=>a.at>this.time);
  for(const a of ready){const source=this.units.find(u=>u.id===a.source);if(!source)continue;
   if(a.point){this.emit({type:'skill',...a.point,kind:a.kind,radius:a.radius,source:source.id,sourceKind:source.kind,skillIndex:a.skillIndex,phase:'impact'});for(const t of this.units.filter(t=>t.side!==source.side&&t.hp>0&&distance(t,a.point!)<=a.radius!)){this.hit(source,t,a.multiplier,a.skillIndex);if(a.slow)t.slowUntil=this.time+2;if(a.stun&&!isBossKind(t.kind))t.stunUntil=this.time+1;}}
   else{const t=this.units.find(t=>t.id===a.target&&t.hp>0);if(!t)continue;if(a.projectile){this.projectiles.push({id:++this.serial,x:source.x,y:source.y,source:source.id,target:t.id,speed:600,multiplier:a.multiplier,kind:a.kind,skillIndex:a.skillIndex});}
   else if(a.kind==='blade'||distance(source,t)<=source.range+18)this.hit(source,t,a.multiplier,a.skillIndex);}
  }
 }
 private updateProjectiles(dt:number):void {
  this.projectiles=this.projectiles.filter(p=>{const t=this.units.find(u=>u.id===p.target&&u.hp>0),s=this.units.find(u=>u.id===p.source);if(!t||!s)return false;const d=distance(p,t),travel=p.speed*dt;if(d<=travel+12){this.hit(s,t,p.multiplier,p.skillIndex);return false;}p.x+=(t.x-p.x)/d*travel;p.y+=(t.y-p.y)/d*travel;return true;});
 }
 private updateHazards():void {
  this.hazards=this.hazards.filter(h=>{const source=this.units.find(u=>u.id===h.source);if(!source||source.hp<=0)return false;if(h.end>this.time)return true;for(const t of this.heroes)if(t.hp>0&&inHazard(t,h))this.hit(source,t,h.multiplier);if(h.charge){const p=this.clampPoint({x:h.x+Math.cos(h.angle)*h.length,y:h.y+Math.sin(h.angle)*h.length});source.x=p.x;source.y=p.y;}this.emit({type:'skill',x:h.x,y:h.y,kind:'impact',radius:h.radius,shape:h.shape,length:h.length,width:h.width,angle:h.angle,source:source.id,sourceKind:source.kind,phase:'impact'});return false;});
 }
 private separate():void {
  const alive=this.units.filter(u=>u.hp>0);
  for(let i=0;i<alive.length;i++)for(let j=i+1;j<alive.length;j++){const a=alive[i],b=alive[j],d=distance(a,b);if(d<25){const dx=d<.01?1:(a.x-b.x)/d,dy=d<.01?0:(a.y-b.y)/d;const push=(25-d)*.12;for(const [u,sign] of [[a,1],[b,-1]] as const){const p=this.clampPoint({x:u.x+dx*push*sign,y:u.y+dy*push*sign});u.x=p.x;u.y=p.y;}}}
 }
 private drop(u:Unit):void {
  this.statistics.enemiesDefeated++;
  const rank=ENEMIES[u.kind as EnemyId].rank,coins=rank==='boss'?80:rank==='elite'?20:5;this.reward.gold+=coins;this.emit({type:'loot',x:u.x,y:u.y,value:coins,text:`+${coins}`,kind:'gold'});
  if(this.random()<(rank==='boss'?1:rank==='elite'?.5:.08)){
   const slot=(['weapon','armor','charm'] as const)[Math.floor(this.random()*3)];const hero=this.heroes[Math.floor(this.random()*this.heroes.length)].kind as HeroId;
   const item:Omit<EquipmentInstance,'id'>={slot,quality:rollQuality(this.level.id,this.random),plus:0,...(slot==='weapon'?{hero}:{})};this.reward.items.push(item);this.emit({type:'loot',x:u.x+20,y:u.y,text:'装备',kind:item.quality});
  }
 }
 private clearWave():void {
  const bossAhead=this.level.waves[this.wave+1]?.some(isBossKind)??false;
  const recovery=bossAhead?.35:.08;
  for(const u of this.heroes){const revived=u.hp<=0;u.hp=revived?u.maxHp*.35:Math.min(u.maxHp,u.hp+u.maxHp*recovery);if(revived){u.dropped=false;u.move=undefined;u.target=undefined;u.stunUntil=0;u.slowUntil=0;}u.animation='idle';}
  if(this.wave===0&&(this.level.id===1||this.level.id===2)){
   const id:HeroId=this.level.id===1?'archer':'mage';if(!this.original.heroes.some(h=>h.id===id)){this.reward.recruits.push(id);if(this.heroes.length<4)this.addHero(id,this.active.x-60,this.active.y+45>FLOOR.bottom?this.active.y-45:this.active.y+45);this.message(`${HEROES[id].name}加入了队伍！点击头像可以切换操控。`);}
  }
  if(this.wave===this.level.waves.length-1){const id:HeroId|undefined=this.level.id===2?'tank':this.level.id===3?'assassin':undefined;if(id&&!this.original.heroes.some(h=>h.id===id))this.reward.recruits.push(id);this.status='won';}
  else this.message(bossAhead?'王印余火恢复了35%生命。前方是Boss，准备后沿石道前进 →':'整节已清空，恢复8%生命。沿右侧石道继续前进 →');
 }
 /** Development/test helper; production UI never exposes this method. */
 debugNextWave():void {this.reservesSpawned=true;for(const u of this.enemies)u.hp=0;this.step();}
}
