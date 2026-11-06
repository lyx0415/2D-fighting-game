import Phaser from 'phaser';
import type {Unit} from '../core/battle';
import type {RigDefinition,RigTransform} from './rig-types';
export {rigState} from './hero-motion';
export const rigTexture=(kind:string,id:string)=>`rig:${kind}:${id}`;
export class CharacterRig {
 readonly root:Phaser.GameObjects.Container;readonly nodes=new Map<string,Phaser.GameObjects.Container>();readonly images:Phaser.GameObjects.Image[]=[];
 private tintColor=0xffffff;private offset={x:0,y:0,angle:0};
 private poseName='';private transition=1;private from=new Map<string,{x:number;y:number;angle:number}>();private fromOffset={x:0,y:0,angle:0};
 constructor(scene:Phaser.Scene,kind:string,readonly definition:RigDefinition){
  this.root=scene.add.container(0,0);
  // Create every joint before attaching; drawing order comes from the asset definition.
  for(const p of definition.parts){const node=scene.add.container(0,0),image=scene.add.image(-p.pivotX,-p.pivotY,rigTexture(kind,p.id)).setOrigin(0);node.add(image);this.images.push(image);this.nodes.set(p.id,node);}
  for(const p of definition.parts){const parent=definition.parts.find(q=>q.id===p.parent);const node=this.nodes.get(p.id)!;node.setPosition(p.pivotX-(parent?.pivotX??definition.footX),p.pivotY-(parent?.pivotY??definition.footY));(p.parent?this.nodes.get(p.parent)!:this.root).add(node);}
 }
 update(pose:RigTransform,dt:number,name='idle'):void{
  if(name!==this.poseName){this.transition=this.poseName?0:1;this.poseName=name;this.from=new Map([...this.nodes].map(([id,n])=>[id,{x:n.x,y:n.y,angle:n.angle}]));this.fromOffset={...this.offset};}
  this.transition=Math.min(1,this.transition+Math.min(.05,dt)/(name==='hit'?.055:.11));
  const alpha=this.transition*this.transition*(3-2*this.transition);
  for(const part of this.definition.parts){const n=this.nodes.get(part.id)!,parent=this.definition.parts.find(p=>p.id===part.parent),target=pose.parts[part.id]??{};
   const x=part.pivotX-(parent?.pivotX??this.definition.footX)+(target.x??0),y=part.pivotY-(parent?.pivotY??this.definition.footY)+(target.y??0);
   const from=this.from.get(part.id)!;n.x=Phaser.Math.Linear(from.x,x,alpha);n.y=Phaser.Math.Linear(from.y,y,alpha);n.angle=from.angle+Phaser.Math.Angle.ShortestBetween(from.angle,target.angle??0)*alpha;
  }
  this.offset.x=Phaser.Math.Linear(this.fromOffset.x,pose.offsetX??0,alpha);this.offset.y=Phaser.Math.Linear(this.fromOffset.y,pose.offsetY??0,alpha);this.offset.angle=Phaser.Math.Linear(this.fromOffset.angle,pose.rotation??0,alpha);
 }
 place(unit:Unit,scale:number,time:number):void{
  const recoil=unit.hitAt!==undefined?Math.max(0,1-(time-unit.hitAt)/.15):0;
  this.root.setPosition(unit.x+(this.offset.x*scale*unit.facing-unit.facing*Math.sin(recoil*Math.PI)*3),unit.y+this.offset.y*scale).setScale(scale*unit.facing,scale).setAngle(this.offset.angle*unit.facing).setAlpha(unit.hp>0?1:.32).setDepth(unit.y);
  const tint=unit.animation==='hit'?0xffc4b8:unit.slowUntil>time?0xadd8e9:0xffffff;
  if(tint!==this.tintColor){this.tintColor=tint;for(const image of this.images)image.setTint(tint);}
 }
 snapshot(){return{joints:[...this.nodes].map(([id,n])=>({id,x:n.x,y:n.y,angle:n.angle})),x:this.root.x,y:this.root.y};}
 destroy(){this.root.destroy(true);}
}
