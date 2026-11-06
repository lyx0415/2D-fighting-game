import {spatialGain,shouldVocalizeHurt} from './audio-mix';
import { unitScale, bodyHeight } from './unit-presentation';
import { prepareTerrain } from './terrain';
import Phaser from 'phaser';
import { Battle, FLOOR, STAGE_WIDTH, isBossKind } from '../core/battle';
import type { BattleEvent, Unit } from '../core/battle';
import { sound } from './audio';
import { rigState } from './hero-motion';
import { CombatEffects } from './combat-effects';
import { combatCue } from './audio-cues';
import { PaintedCharacter } from './painted-character';
import { PAINTED_HEROES, artUrl, paintedScene, paintedGround } from './art';
interface View {rig:PaintedCharacter;shadow:Phaser.GameObjects.Ellipse;bars:Phaser.GameObjects.Graphics;label:Phaser.GameObjects.Text}
export interface GameHandle { destroy():void; debug:boolean;inspect():unknown }
export interface Hooks {state(battle:Battle):void;event(event:BattleEvent):void;finish(battle:Battle):void;ready?():void;progress?(value:number):void}
export function mountGame(parent:HTMLElement,battle:Battle,hooks:Hooks):GameHandle {
 let field:Field|undefined;const handle:GameHandle={destroy(){game.destroy(true);},debug:false,inspect:()=>({cameraX:field?.cameras.main.scrollX??0,rigs:field?[...field.views].map(([id,v])=>({id,...v.rig.snapshot()})):[],effects:field?.combat.effects.map(f=>f.style)??[],cues:field?.lastCues??[]})};
 class Field extends Phaser.Scene {
  combat!:CombatEffects;lastCues:string[]=[];views=new Map<string,View>(); effects!:Phaser.GameObjects.Graphics; range!:Phaser.GameObjects.Graphics; bg!:Phaser.GameObjects.TileSprite; follow!:Phaser.GameObjects.Zone;
  floating:Phaser.GameObjects.Text[]=[]; rings:Phaser.GameObjects.Ellipse[]=[]; textCursor=0; ringCursor=0;lastShake=-10; pulse=0; finished=false; gate!:Phaser.GameObjects.Text; marker?:{x:number;y:number;until:number};
  constructor(){super('field');}
  preload(){
   this.load.on('progress',(value:number)=>hooks.progress?.(value));
   this.load.spritesheet('painted:stances','/assets/v009/stances.webp',{frameWidth:512,frameHeight:512});
   for(const kind of PAINTED_HEROES)this.load.spritesheet(`painted:${kind}`,artUrl(`sheet-${kind}`),{frameWidth:512,frameHeight:512});
   this.load.spritesheet('painted:enemies',artUrl('sheet-enemies'),{frameWidth:512,frameHeight:512});
   this.load.spritesheet('painted:props',artUrl('props'),{frameWidth:512,frameHeight:512});
   this.load.image('background',paintedScene(battle.level.theme));
   this.load.image('ground',paintedGround());
  }
  create(){
   field=this;this.combat=new CombatEffects(this);prepareTerrain(this,battle.level.theme);this.events.once('shutdown',()=>sound.syncSustains([]));
   this.bg=this.add.tileSprite(0,0,1280,720,'terrain:backdrop').setOrigin(0).setScrollFactor(0).setDepth(-100);
   const bgSource=this.textures.get('background').getSourceImage() as HTMLImageElement;
   this.bg.setTileScale(1920/bgSource.width,720/bgSource.height);
   const road=this.add.graphics().setDepth(-50),mapWidth=battle.level.waves.length*STAGE_WIDTH;
   this.add.tileSprite(0,FLOOR.top,mapWidth,FLOOR.bottom-FLOOR.top,'terrain:ground').setOrigin(0).setDepth(-60).setTint(({ash:0xe4c5a8,forest:0xc7d5c1,fortress:0xcbd1d5,abbey:0xc7c9cd,crypt:0xa6c4ca})[battle.level.theme]);
   // Terrain and decoration share world coordinates. Exterior is visibly blocked.
   road.fillStyle(0x030910,.36).fillRect(0,0,mapWidth,FLOOR.top);
   road.fillStyle(0x02070c,.48).fillRect(0,FLOOR.bottom,mapWidth,720-FLOOR.bottom);
   const earth=battle.level.theme==='forest'?0x8a9162:battle.level.theme==='crypt'?0x6c8990:0xa48b64;
   road.fillStyle(earth,.06).fillRect(0,FLOOR.top,mapWidth,FLOOR.bottom-FLOOR.top);
   for(const edge of [FLOOR.top,FLOOR.bottom]){
    road.fillStyle(0x080d11,.95).fillRect(0,edge===FLOOR.top?edge-12:edge,mapWidth,12);
    road.fillStyle(0x6c6c60,.9).fillRect(0,edge===FLOOR.top?edge-8:edge+2,mapWidth,5);
    road.lineStyle(2,0xc3ad7e,.65).lineBetween(0,edge,mapWidth,edge);
    for(let x=0;x<mapWidth;x+=37){const size=9+(x*7%13);road.fillStyle(x%3?0x4c5146:0x6f7160,.75).fillEllipse(x,edge+(edge===FLOOR.top?-3:4),size,6);}
    for(let x=55;x<mapWidth;x+=210){road.fillStyle(0xffd692,.8).fillCircle(x,edge,3);}
   }
   const decor:Record<string,number[]>={ash:[0,4,3,7],forest:[3,6,2,7],fortress:[1,4,0,2],abbey:[2,5,1,6],crypt:[5,1,2,6]};
   const palette=decor[battle.level.theme];
   for(let section=0;section<battle.level.waves.length;section++){
    for(let n=0;n<3;n++)this.add.image(section*STAGE_WIDTH+180+n*670,FLOOR.top-20,'painted:props',palette[(section+n)%palette.length]).setOrigin(.5,480/512).setScale(.23).setDepth(-30);
    for(let n=0;n<2;n++)this.add.image(section*STAGE_WIDTH+440+n*980,725,'painted:props',palette[(section+n+1)%palette.length]).setOrigin(.5,480/512).setScale(.19).setDepth(-15);
   }
   this.effects=this.add.graphics().setDepth(750);this.range=this.add.graphics().setDepth(700);
   this.follow=this.add.zone(battle.active.x,360,1,1);
   this.cameras.main.setBounds(0,0,STAGE_WIDTH,720);this.cameras.main.startFollow(this.follow,true,.09,.09);
   this.gate=this.add.text(0,0,'',{fontFamily:'sans-serif',fontSize:'18px',color:'#ddc590',align:'center',backgroundColor:'#142024',padding:{x:16,y:12}}).setDepth(800).setOrigin(.5);
   hooks.ready?.();
   this.input.on('pointerdown',(pointer:Phaser.Input.Pointer)=>{
    if(battle.paused)return;sound.unlock();const p=this.cameras.main.getWorldPoint(pointer.x,pointer.y);
    const hit=battle.enemies.filter(u=>Math.abs(u.x-p.x)<(isBossKind(u.kind)?62:30)&&p.y>=u.y-(bodyHeight(u)+12)&&p.y<u.y+14).sort((a,b)=>Math.abs(a.y-50-p.y)-Math.abs(b.y-50-p.y))[0];
    if(hit)battle.command({type:'attackTarget',id:hit.id});else battle.command({type:'move',point:p});
   });
  }
  makeView(u:Unit):View {
   const rig=new PaintedCharacter(this,u.kind,({ash:0xf0e3d2,forest:0xdde9d7,fortress:0xe1e4e3,abbey:0xe7e0d8,crypt:0xd3e4e9})[battle.level.theme]);const initial=rigState(u,battle.time);rig.update({parts:{}},.05,initial.pose,initial.phase);
   const shadow=this.add.ellipse(u.x,u.y,34,8,0x000000,.43);
   const bars=this.add.graphics();const label=this.add.text(0,0,u.name,{fontFamily:'sans-serif',fontSize:'11px',color:u.side==='hero'?'#dfdfcb':'#d2c1b4',stroke:'#101719',strokeThickness:3}).setOrigin(.5);
   const v={rig,shadow,bars,label};this.views.set(u.id,v);return v;
  }
  update(_time:number,delta:number){
   if(battle.paused)this.tweens.pauseAll();else this.tweens.resumeAll();
   battle.advance(delta/1000);if(!battle.paused)this.pulse+=Math.min(delta,100)/1000;
   this.follow.setPosition(battle.active.x,360);this.cameras.main.setBounds(0,0,battle.stageEnd,720);this.bg.tilePositionX=this.cameras.main.scrollX;
   for(const [id,v] of this.views)if(!battle.units.some(u=>u.id===id)){v.rig.destroy();v.shadow.destroy();v.bars.destroy();v.label.destroy();this.views.delete(id);}
   for(const u of battle.units){
    const v=this.views.get(u.id)??this.makeView(u);const scale=unitScale(u);
    const state=rigState(u,battle.time);v.rig.update({parts:{}},battle.paused?0:Math.min(delta/1000,.05),state.pose,state.phase);v.rig.place(u,scale,battle.time);
    v.shadow.setDisplaySize(isBossKind(u.kind)?64:u.side==='hero'?28:25,isBossKind(u.kind)?14:7).setPosition(u.x,u.y+2).setDepth(u.y-2).setVisible(u.hp>0);
    v.bars.clear().setDepth(720);v.label.setPosition(u.x,u.y-bodyHeight(u)-18).setVisible(u.hp>0&&!isBossKind(u.kind)).setDepth(721);
    if(u.hp>0){const width=isBossKind(u.kind)?86:46,y=u.y-bodyHeight(u)-7;v.bars.fillStyle(0x101515,.85).fillRoundedRect(u.x-width/2-1,y-1,width+2,6,2);v.bars.fillStyle(u.side==='hero'?(u.hp/u.maxHp<.3?0xd88372:0x9eb38c):0xb97464,1).fillRect(u.x-width/2,y,width*u.hp/u.maxHp,4);if(u.shield>0)v.bars.fillStyle(0xa9c7de,1).fillRect(u.x-width/2,y+5,width*Math.min(1,u.shield/u.maxHp),2);}
   }
   this.drawEffects();this.processEvents();this.combat.draw(battle.time,battle.units,battle.hazards);
   sound.syncSustains(battle.status==='playing'?battle.heroes.filter(u=>u.hp>0).flatMap(u=>[...(u.shield>0&&u.shieldUntil>battle.time?[{id:u.id+':ward',cue:'wardSustain'}]:[]),...(u.reductionUntil>battle.time?[{id:u.id+':oath',cue:'oathSustain'}]:[])]):[]);
   this.gate.setVisible((battle.waveCleared||battle.waitingForAdvance)&&battle.status==='playing').setPosition(battle.waitingForAdvance?battle.wave*STAGE_WIDTH+1070:battle.stageEnd-120,485).setText(battle.waitingForAdvance?'前方敌军\n沿石道向右 →':'战区清空\n继续向右 →');
   hooks.state(battle);
   if(battle.status!=='playing'&&!this.finished){this.finished=true;hooks.finish(battle);}
  }
  drawEffects(){
   const g=this.effects;g.clear();this.range.clear();
   for(const h of battle.hazards){const progress=Phaser.Math.Clamp((battle.time-h.start)/(h.end-h.start),0,1);g.fillStyle(0xb84a38,.18+progress*.24).lineStyle(2,0xf18b6d,.8);
    if(h.shape==='circle'){g.fillCircle(h.x,h.y,h.radius);g.strokeCircle(h.x,h.y,h.radius);g.lineStyle(3,0xffc29a,.8);g.beginPath();g.arc(h.x,h.y,h.radius*progress,0,Math.PI*2);g.strokePath();}
    else{const points:Phaser.Math.Vector2[]=[];if(h.shape==='cone'){points.push(new Phaser.Math.Vector2(h.x,h.y));for(let a=-Math.PI/3;a<=Math.PI/3+.01;a+=Math.PI/18)points.push(new Phaser.Math.Vector2(h.x+Math.cos(h.angle+a)*h.radius,h.y+Math.sin(h.angle+a)*h.radius));}
     else{for(const [f,s] of [[0,-h.width/2],[h.length,-h.width/2],[h.length,h.width/2],[0,h.width/2]])points.push(new Phaser.Math.Vector2(h.x+f*Math.cos(h.angle)-s*Math.sin(h.angle),h.y+f*Math.sin(h.angle)+s*Math.cos(h.angle)));}g.fillPoints(points,true);g.strokePoints(points,true);}
   }
   if(!battle.waveCleared){const x=battle.stageEnd-38;g.lineStyle(3,0xa88968,.65).lineBetween(x,FLOOR.top,x,FLOOR.bottom);for(let y=FLOOR.top+10;y<FLOOR.bottom;y+=28){g.lineStyle(2,0xc59d73,.5).lineBetween(x-6,y-6,x+6,y+6);}}
   const a=battle.active;if(a.hp>0){g.lineStyle(2,0xd9bc76,.9);g.strokeEllipse(a.x,a.y+3,35,11);g.fillStyle(0xd9bc76,.8);g.fillTriangle(a.x-5,a.y+23,a.x+5,a.y+23,a.x,a.y+16);}
   const selected=battle.enemies.find(u=>u.id===a.target);if(selected){g.lineStyle(2,0xee967d,.9);g.strokeEllipse(selected.x,selected.y,42,13);}
   for(const p of battle.projectiles){g.fillStyle(p.kind==='magic'?0x9bd4e0:0xe5c48a,1);g.fillCircle(p.x,p.y-35,p.kind==='magic'?5:3);const t=battle.units.find(u=>u.id===p.target);if(t){const angle=Math.atan2(t.y-p.y,t.x-p.x);g.lineStyle(2,0xd7c6a5,.7).lineBetween(p.x,p.y-35,p.x-Math.cos(angle)*15,p.y-35-Math.sin(angle)*15);}}
   if(this.marker&&this.marker.until>battle.time){g.lineStyle(2,0xe4c995,.8);g.strokeEllipse(this.marker.x,this.marker.y,28,12);g.lineBetween(this.marker.x-8,this.marker.y,this.marker.x+8,this.marker.y);}
   if(handle.debug){for(const u of battle.units.filter(u=>u.hp>0)){this.range.lineStyle(1,u.side==='hero'?0x7ab8cc:0xd47878,.35).strokeCircle(u.x,u.y,u.range);this.range.strokeCircle(u.x,u.y,13);}}
  }
  ring(x:number,y:number,color:number,radius:number,duration=450,collect=false){
   let effect=this.rings.find(v=>!v.active);
   if(!effect){if(this.rings.length<24){effect=this.add.ellipse(0,0,10,5);this.rings.push(effect);}else effect=this.rings[this.ringCursor++%24];}
   this.tweens.killTweensOf(effect);effect.setActive(true).setVisible(true).setScale(1).setPosition(x,y).setAlpha(1).setDepth(730).setFillStyle(color,collect?.8:.13).setStrokeStyle(collect?0:2,color,.7).setDisplaySize(collect?9:10,collect?9:5);
   this.tweens.add({targets:effect,...(collect?{x:battle.active.x,y:battle.active.y-45}:{displayWidth:radius*2,displayHeight:radius*.8}),alpha:0,duration,onComplete:()=>effect!.setActive(false).setVisible(false)});
  }
  processEvents(){
   for(const e of battle.events.splice(0)){
    hooks.event(e);
    if(e.type==='marker'){this.marker={x:e.x,y:e.y,until:battle.time+1.2};continue;}
    if(['damage','heal','loot'].includes(e.type)){
     const text=e.text??`${e.type==='heal'?'+':''}${Math.round(e.value??0)}`;const color=e.type==='heal'?'#b0d8a1':e.type==='loot'?'#dfc38b':e.kind==='hero'?'#e7a595':'#e8dfc9';
     let label=this.floating.find(v=>!v.active);if(!label){if(this.floating.length<30){label=this.add.text(0,0,'',{fontFamily:'sans-serif',stroke:'#101719',strokeThickness:3}).setDepth(900).setOrigin(.5);this.floating.push(label);}else label=this.floating[this.textCursor++%30];}
     this.tweens.killTweensOf(label);label.setText(text).setPosition(e.x,e.y-85).setColor(color).setFontSize(e.type==='damage'?17:14).setAlpha(1).setActive(true).setVisible(true);this.tweens.add({targets:label,y:label.y-38,alpha:0,duration:1000,onComplete:()=>label!.setActive(false).setVisible(false)});
     if(e.type==='loot')this.ring(e.x,e.y-10,e.kind==='blue'?0x8dbbd2:e.kind==='green'?0x9fc18c:0xdfc38b,12,650,true);
    }
    this.combat.add(e,battle.units,battle.time);
    if(!battle.paused&&battle.time-this.lastShake>.4&&((e.type==='skill'&&e.phase==='impact'&&isBossKind(e.sourceKind??''))||(e.type==='damage'&&e.skillIndex!==undefined&&(e.value??0)>60))){this.lastShake=battle.time;this.cameras.main.shake(85,.0015);}
    if(e.type==='skill'&&e.phase==='telegraph')this.ring(e.x,e.y,0xebc57d,e.radius??120,700);
    if(e.type==='damage'&&e.target===battle.activeId&&shouldVocalizeHurt(e.value??0,battle.active.hp,battle.active.maxHp))sound.play(e.targetKind+'Hurt','hurt');
    if(e.type==='skill'&&e.phase==='cast'&&e.skillIndex===1&&e.source===battle.activeId&&PAINTED_HEROES.includes(e.sourceKind??''))sound.play(e.sourceKind+'Exert','voice');
    const cue=combatCue(e);if(cue){sound.play(cue,e.type==='attack'?'attack':e.type==='damage'&&e.skillIndex===undefined?'impact':e.type==='skill'||e.skillIndex!==undefined?'skill':'ui',spatialGain(Math.hypot(e.x-battle.active.x,e.y-battle.active.y)));this.lastCues.push(cue);if(this.lastCues.length>24)this.lastCues.shift();}

   }
  }
 }
 const game=new Phaser.Game({type:Phaser.AUTO,parent,width:1280,height:720,backgroundColor:'#101719',antialias:true,transparent:false,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},input:{activePointers:3},scene:Field,audio:{noAudio:true},fps:{target:60,smoothStep:true},render:{pixelArt:false,roundPixels:false}});
 return handle;
}
