import Phaser from 'phaser';
import { Battle, FLOOR, STAGE_WIDTH, isBossKind } from '../core/battle';
import type { BattleEvent, Unit } from '../core/battle';
import { ENEMIES, HERO_ORDER } from '../core/data';
import { characterSvg, sceneSvg } from './art';
import { sound } from './audio';
import { heroSvg, HERO_POSE_FRAMES } from './hero-art';
import type { HeroPose } from './hero-art';
import { heroFrame, heroTextureKey } from './hero-motion';
const svgData=(svg:string)=>'data:image/svg+xml;base64,'+btoa(String.fromCharCode(...new TextEncoder().encode(svg)));
interface View {sprite:Phaser.GameObjects.Image;shadow:Phaser.GameObjects.Ellipse;bars:Phaser.GameObjects.Graphics;label:Phaser.GameObjects.Text}
export interface GameHandle { destroy():void; debug:boolean }
export interface Hooks {state(battle:Battle):void;event(event:BattleEvent):void;finish(battle:Battle):void}
export function mountGame(parent:HTMLElement,battle:Battle,hooks:Hooks):GameHandle {
 const handle:GameHandle={destroy(){game.destroy(true);},debug:false};
 class Field extends Phaser.Scene {
  views=new Map<string,View>(); effects!:Phaser.GameObjects.Graphics; range!:Phaser.GameObjects.Graphics; bg!:Phaser.GameObjects.TileSprite; follow!:Phaser.GameObjects.Zone;
  floating:Phaser.GameObjects.Text[]=[]; rings:Phaser.GameObjects.Ellipse[]=[]; textCursor=0; ringCursor=0; pulse=0; finished=false; gate!:Phaser.GameObjects.Text; marker?:{x:number;y:number;until:number};
  constructor(){super('field');}
  preload(){
   for(const kind of Object.keys(ENEMIES))this.load.svg(kind,svgData(characterSvg(kind)),{width:128,height:160});
   for(const kind of HERO_ORDER)for(const pose of Object.keys(HERO_POSE_FRAMES) as HeroPose[])for(let frame=0;frame<HERO_POSE_FRAMES[pose];frame++)this.load.svg(heroTextureKey(kind,pose,frame),svgData(heroSvg(kind,pose,frame)),{width:256,height:320});
   this.load.svg('background',svgData(sceneSvg(battle.level.theme)),{width:1920,height:720});
  }
  create(){
   this.bg=this.add.tileSprite(0,0,1280,720,'background').setOrigin(0).setScrollFactor(0).setDepth(-100);
   const road=this.add.graphics().setDepth(-50);
   const mapWidth=battle.level.waves.length*STAGE_WIDTH;
   // The collision band and visible stone causeway share FLOOR, so art cannot drift from movement bounds.
   road.fillStyle(0x060c14,.56).fillRect(0,325,mapWidth,FLOOR.top-325);
   road.fillStyle(0x060c14,.7).fillRect(0,FLOOR.bottom,mapWidth,720-FLOOR.bottom);
   road.fillStyle(0x27343e,.94).fillRect(0,FLOOR.top,mapWidth,FLOOR.bottom-FLOOR.top);
   for(let row=0;row<6;row++)for(let x=-80;x<mapWidth;x+=150){
    const tileX=x+(row%2)*75,y=FLOOR.top+5+row*42;
    road.fillStyle([0x35434c,0x303f49,0x39464d][(row+Math.floor((x+80)/150))%3],.82).fillRoundedRect(tileX,y,146,38,3);
    road.lineStyle(1,0x92a3a5,.08).strokeRoundedRect(tileX,y,146,38,3);
    if((row+Math.floor((x+80)/150))%4===0)road.lineStyle(1,0x111c24,.5).lineBetween(tileX+45,y+8,tileX+58,y+28);
   }
   for(const edge of [FLOOR.top,FLOOR.bottom]){
    road.fillStyle(0x81908a,.65).fillRect(0,edge-3,mapWidth,6);
    road.lineStyle(2,0xc1a66e,.82).lineBetween(0,edge,mapWidth,edge);
    for(let x=35;x<mapWidth;x+=120)road.lineStyle(2,0xe1c78b,.4).lineBetween(x,edge,x+24,edge);
   }
   for(let i=0;i<battle.level.waves.length;i++){
    for(const x of [i*STAGE_WIDTH+45,(i+1)*STAGE_WIDTH-42])for(const edge of [FLOOR.top-14,FLOOR.bottom+14]){
     road.fillStyle(0x15212a,1).fillRect(x-7,edge-9,14,18);road.fillStyle(0xdfaa55,.8).fillCircle(x,edge,4);
    }
   }
   this.effects=this.add.graphics().setDepth(750);this.range=this.add.graphics().setDepth(700);
   this.follow=this.add.zone(battle.active.x,360,1,1);
   this.cameras.main.setBounds(0,0,STAGE_WIDTH,720);this.cameras.main.startFollow(this.follow,true,.09,.09);
   this.gate=this.add.text(0,0,'',{fontFamily:'sans-serif',fontSize:'18px',color:'#ddc590',align:'center',backgroundColor:'#142024',padding:{x:16,y:12}}).setDepth(800).setOrigin(.5);
   this.input.on('pointerdown',(pointer:Phaser.Input.Pointer)=>{
    if(battle.paused)return;sound.unlock();const p=this.cameras.main.getWorldPoint(pointer.x,pointer.y);
    const hit=battle.enemies.filter(u=>Math.abs(u.x-p.x)<(isBossKind(u.kind)?60:42)&&p.y>=u.y-(isBossKind(u.kind)?170:115)&&p.y<u.y+14).sort((a,b)=>Math.abs(a.y-50-p.y)-Math.abs(b.y-50-p.y))[0];
    if(hit)battle.command({type:'attackTarget',id:hit.id});else battle.command({type:'move',point:p});
   });
  }
  makeView(u:Unit):View {
   const sprite=this.add.image(u.x,u.y,u.side==='hero'?heroTextureKey(u.kind,'idle',0):u.kind).setOrigin(.5,150/160);
   const shadow=this.add.ellipse(u.x,u.y,62,14,0x000000,.35);
   const bars=this.add.graphics();const label=this.add.text(0,0,u.name,{fontFamily:'sans-serif',fontSize:'13px',color:u.side==='hero'?'#dfdfcb':'#d2c1b4',stroke:'#101719',strokeThickness:3}).setOrigin(.5);
   const v={sprite,shadow,bars,label};this.views.set(u.id,v);return v;
  }
  update(_time:number,delta:number){
   if(battle.paused)this.tweens.pauseAll();else this.tweens.resumeAll();
   battle.advance(delta/1000);if(!battle.paused)this.pulse+=Math.min(delta,100)/1000;
   this.follow.setPosition(battle.active.x,360);this.cameras.main.setBounds(0,0,battle.stageEnd,720);this.bg.tilePositionX=this.cameras.main.scrollX*.45;
   for(const [id,v] of this.views)if(!battle.units.some(u=>u.id===id)){v.sprite.destroy();v.shadow.destroy();v.bars.destroy();v.label.destroy();this.views.delete(id);}
   for(const u of battle.units){
    const v=this.views.get(u.id)??this.makeView(u);const scale=u.side==='hero'?.42:isBossKind(u.kind)?1.1:u.kind==='wolf'?.62:.72;const bodyHeight=u.side==='hero'?320:160;
    if(u.side==='hero'){const frame=heroFrame(u,battle.time);if(v.sprite.texture.key!==frame.key)v.sprite.setTexture(frame.key);}
    const bob=u.side==='hero'?0:u.animation==='move'?Math.sin(this.pulse*15)*3:Math.sin(this.pulse*2)*.8;
    v.sprite.setPosition(u.x,u.y+(u.hp>0?bob:5)).setScale(scale*u.facing,scale).setAlpha(u.hp>0?1:.27).setDepth(u.y);
    v.sprite.setRotation(u.side==='hero'?0:u.hp<=0?Math.PI/2:u.animation==='attack'?u.facing*.13:u.animation==='move'?Math.sin(this.pulse*15)*.045:0);
    if(u.animation==='hit')v.sprite.setTint(0xffaaa0);else if(u.slowUntil>battle.time)v.sprite.setTint(0x99c7dc);else v.sprite.clearTint();
    v.shadow.setPosition(u.x,u.y+2).setDepth(u.y-2).setVisible(u.hp>0);
    v.bars.clear().setDepth(720);v.label.setPosition(u.x,u.y-bodyHeight*scale-18).setVisible(u.hp>0&&!isBossKind(u.kind)).setDepth(721);
    if(u.hp>0){const width=isBossKind(u.kind)?100:55,y=u.y-bodyHeight*scale-7;v.bars.fillStyle(0x101515,.85).fillRoundedRect(u.x-width/2-1,y-1,width+2,6,2);v.bars.fillStyle(u.side==='hero'?(u.hp/u.maxHp<.3?0xd88372:0x9eb38c):0xb97464,1).fillRect(u.x-width/2,y,width*u.hp/u.maxHp,4);if(u.shield>0)v.bars.fillStyle(0xa9c7de,1).fillRect(u.x-width/2,y+5,width*Math.min(1,u.shield/u.maxHp),2);}
   }
   this.drawEffects();this.processEvents();
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
   for(const u of battle.heroes)if(u.hp>0&&u.shield>0){g.lineStyle(2,0xa9d2e1,.65).strokeEllipse(u.x,u.y-43,72,100);}
   if(!battle.waveCleared){const x=battle.stageEnd-38;g.lineStyle(3,0xa88968,.65).lineBetween(x,FLOOR.top,x,FLOOR.bottom);for(let y=FLOOR.top+10;y<FLOOR.bottom;y+=28){g.lineStyle(2,0xc59d73,.5).lineBetween(x-6,y-6,x+6,y+6);}}
   const a=battle.active;if(a.hp>0){g.lineStyle(2,0xd9bc76,.9);g.strokeEllipse(a.x,a.y+3,70,21);g.fillStyle(0xd9bc76,.8);g.fillTriangle(a.x-5,a.y+23,a.x+5,a.y+23,a.x,a.y+16);}
   const selected=battle.enemies.find(u=>u.id===a.target);if(selected){g.lineStyle(2,0xee967d,.9);g.strokeEllipse(selected.x,selected.y,78,25);}
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
    if(e.type==='skill'){
     const color=e.kind==='mage'||e.kind==='meteor'?0x9bcdd8:e.kind==='enemy'||e.kind==='impact'?0xd47e5e:e.kind==='archer'?0x9fc393:e.kind==='assassin'?0xb49ad3:e.kind==='tank'?0x8cb9d4:0xd8c48d;
     this.ring(e.x,e.y,color,e.radius??70,e.kind==='meteor'?700:450);
    }
    if(e.type==='attack'){const target=battle.units.find(u=>u.id===e.target);if(target&&e.kind!=='archer'&&e.kind!=='crossbow'&&e.kind!=='mage'&&e.kind!=='priest')this.ring(target.x,target.y-40,target.side==='hero'?0xd87464:0xcdb47a,36,180);}
    if(e.type==='attack')sound.play(e.kind==='archer'||e.kind==='crossbow'?'arrow':e.kind==='mage'||e.kind==='priest'?'magic':'attack');
    else if(['damage','loot','skill','death'].includes(e.type))sound.play(e.type);
   }
  }
 }
 const game=new Phaser.Game({type:Phaser.AUTO,parent,width:1280,height:720,backgroundColor:'#101719',antialias:true,transparent:false,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},input:{activePointers:3},scene:Field,audio:{noAudio:true},fps:{target:60,smoothStep:true},render:{pixelArt:false,roundPixels:false}});
 return handle;
}
