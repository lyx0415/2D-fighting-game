import Phaser from 'phaser';
import type {Unit} from '../core/battle';
import type {RigTransform} from './rig-types';
import {PAINTED_HEROES,PAINTED_ENEMIES} from './raster-art';

/** Authored pose frames with simulation-clock playback. Pausing freezes frame and motion. */
export class PaintedCharacter {
 readonly root:Phaser.GameObjects.Container;
 readonly image:Phaser.GameObjects.Image;
 private pose='idle';private phase=0;private frame=0;
 constructor(scene:Phaser.Scene,readonly kind:string,private ambientTint=0xffffff){
  const hero=PAINTED_HEROES.includes(kind);
  this.root=scene.add.container(0,0);
  this.image=scene.add.image(-256,-480,hero?`painted:${kind}`:'painted:enemies',hero?0:PAINTED_ENEMIES.indexOf(kind)).setOrigin(0);
  this.root.add(this.image);
 }
 update(_pose:RigTransform,_dt:number,name='idle',phase=0){
  this.pose=name;this.phase=phase;
  if(PAINTED_HEROES.includes(this.kind)){
   const frames:Record<string,number[]>={idle:[0,11],move:[1,2,3,4],attack:[5,5,6,6,0],skill0:[5,7,7,0],skill1:[5,8,8,0],hit:[9],dead:[10]};
   const sequence=frames[name]??frames.idle;
   this.frame=sequence[Math.min(sequence.length-1,Math.floor(Math.max(0,Math.min(.999,phase))*sequence.length))];
  }else{
   this.frame=PAINTED_ENEMIES.indexOf(this.kind);
   if(['attack','skill0','skill1'].includes(name)&&phase>.3&&phase<.8){if(this.kind==='boss')this.frame=10;if(this.kind==='bishop')this.frame=11;}
  }
  if(PAINTED_HEROES.includes(this.kind)&&name==='idle'){this.frame=12;this.image.setTexture('painted:stances',PAINTED_HEROES.indexOf(this.kind));}
  else this.image.setTexture(PAINTED_HEROES.includes(this.kind)?`painted:${this.kind}`:'painted:enemies',this.frame);
 }
 place(unit:Unit,scale:number,time:number){
  const hero=PAINTED_HEROES.includes(this.kind),action=['attack','skill0','skill1'].includes(this.pose);
  const impulse=action?Math.sin(this.phase*Math.PI):0;
  const bob=hero?0:this.pose==='move'?Math.sin(this.phase*Math.PI*2)*2:0;
  this.root.setPosition(unit.x+unit.facing*impulse*(hero?3:8),unit.y+bob).setScale(scale*unit.facing,scale).setDepth(unit.y).setAlpha(unit.hp>0?1:.4);
  this.root.setAngle(!hero?(this.pose==='dead'?unit.facing*65:action?unit.facing*impulse*4:0):0);
  const hit=unit.hitAt!==undefined&&time-unit.hitAt<.1;
  if(hero&&this.pose==='idle'&&unit.hp<unit.maxHp*.4){this.frame=13;this.image.setFrame(PAINTED_HEROES.indexOf(this.kind)+5);}
  this.image.setTint(hit?0xffbdac:unit.slowUntil>time?0xb7dbea:this.ambientTint);
 }
 snapshot(){return{kind:this.kind,renderer:'painted-sprite',pose:this.pose,frame:this.frame,texture:this.image.texture.key,phase:this.phase,x:this.root.x,y:this.root.y,scale:Math.abs(this.root.scaleX),joints:[]};}
 destroy(){this.root.destroy(true);}
}
