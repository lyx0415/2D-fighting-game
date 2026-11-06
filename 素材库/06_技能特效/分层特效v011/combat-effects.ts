import Phaser from 'phaser';
import {isBossKind,type BattleEvent,type Unit,type Hazard} from '../core/battle';
import {effectStyle,planEffect,type EffectStyle} from './effect-plan';
import {bodyHeight} from './unit-presentation';
export {effectStyle};
type Fx=NonNullable<ReturnType<typeof planEffect>>;
const colors:Record<EffectStyle,number>={slash:0xf0cf8a,pierce:0xc9dfad,arcane:0x99dcf0,hammer:0xe7c794,claw:0xd68a70,frost:0xb7edff,fire:0xffb15d,meteor:0xffb15d,ward:0xf5dba0,shield:0xc1d8ed,shadow:0x9e7bd5,execute:0xdbc0f2,rain:0xb7dba0,volley:0xd5eac0,doom:0xc9768e,metal:0xffd9a0,blood:0xe69b87};
export class CombatEffects {
 readonly graphics:Phaser.GameObjects.Graphics;readonly floor:Phaser.GameObjects.Graphics;readonly light:Phaser.GameObjects.Graphics;effects:Fx[]=[];
 constructor(scene:Phaser.Scene){this.floor=scene.add.graphics().setDepth(345);this.graphics=scene.add.graphics().setDepth(710);this.light=scene.add.graphics().setDepth(711).setBlendMode(Phaser.BlendModes.ADD);}
 add(e:BattleEvent,units:Unit[],time:number){const effect=planEffect(e,units,time);if(effect)this.effects.push(effect);if(this.effects.length>64)this.effects.splice(0,this.effects.length-64);}
 private rune(x:number,y:number,r:number,color:number,alpha:number,rotation:number){
  const g=this.floor;g.lineStyle(1,color,alpha).strokeEllipse(x,y,r*2,r*.58);
  for(let n=0;n<8;n++){const a=n*Math.PI/4+rotation,xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r*.29;g.lineBetween(xx-2,yy-4,xx+2,yy+4);g.lineBetween(xx+2,yy,xx+5,yy-3);}
 }
 private sparks(x:number,y:number,color:number,p:number,count=12,spread=55){
  const g=this.light,fade=1-p;
  for(let n=0;n<count;n++){const a=n*2.399,travel=(.4+(n%4)/5)*spread*p,xx=x+Math.cos(a)*travel,yy=y+Math.sin(a)*travel*.6+p*p*18;
   g.lineStyle(n%3?1:2,color,fade*.75).lineBetween(xx,yy,xx+Math.cos(a)*7*fade,yy+Math.sin(a)*7*fade);}
 }
 draw(time:number,units:Unit[]=[],hazards:Hazard[]=[]){
  const g=this.graphics,l=this.light,floor=this.floor;g.clear();l.clear();floor.clear();this.effects=this.effects.filter(f=>time-f.start<f.duration);
  for(const unit of units.filter(u=>u.hp>0)){
   const x=unit.x,y=unit.y,height=bodyHeight(unit),phase=time*2;
   if(isBossKind(unit.kind)){
    const c=unit.enraged?0xeb7058:unit.kind==='bishop'?0xa084d5:0xc08053;
    this.rune(x,y+1,unit.kind==='bishop'?62:55,c,.25+Math.sin(phase)*.08,-time*.12);
    for(let n=0;n<9;n++){const t=(time*.35+n/9)%1,xx=x+Math.sin(n*7.3)*45,yy=y-t*height;l.fillStyle(c,(1-t)*.24).fillCircle(xx,yy,1.5+t*1.5);}
    if(unit.action&&unit.action.end>time&&unit.action.kind!=='attack')l.lineStyle(3,c,.3+.15*Math.sin(time*10)).strokeEllipse(x,y-height*.5,76,90);
   }
   if(unit.shield>0&&unit.shieldUntil>time||unit.reductionUntil>time){
    const guarding=unit.reductionUntil>time,c=guarding?0x9ebedb:0xf0cf8d,remaining=guarding?unit.reductionUntil-time:unit.shieldUntil-time;
    const a=Math.min(1,remaining/.4),radius=guarding?42:33;
    floor.fillStyle(c,.065*a).fillEllipse(x,y,radius*2.5,radius*.8);this.rune(x,y,radius,c,.55*a,time*.28);
    const points=Array.from({length:7},(_,n)=>{const angle=-Math.PI/2+n*Math.PI/3;return new Phaser.Math.Vector2(x+Math.cos(angle)*radius*.75,y-height*.48+Math.sin(angle)*height*.55);});
    g.fillStyle(c,.04*a).fillPoints(points,true).lineStyle(guarding?3:1.5,c,.5*a).strokePoints(points,true);
    l.lineStyle(1,c,.24*a).strokeEllipse(x,y-height*.47,radius*1.8,height*1.12);
    for(let n=0;n<5;n++){const t=(time*.6+n/5)%1;l.fillStyle(c,(1-t)*.4*a).fillCircle(x+Math.sin(n*5)*radius*.8,y-t*height,1.5);}
   }
   if(unit.slowUntil>time){this.rune(x,y,24,0xa3dfed,.3,0);for(let n=0;n<5;n++){const xx=x+Math.cos(n*2.4)*22;g.fillStyle(0xa3dfed,.25).fillTriangle(xx-3,y,xx+3,y,xx,y-8-n%3*3);}}
  }
  for(const h of hazards){const p=Math.max(0,Math.min(1,(time-h.start)/(h.end-h.start))),c=0xf2a07c;this.rune(h.x,h.y,Math.min(h.radius,52),c,.25+p*.25,-time);
   if(h.shape==='circle')for(let n=0;n<12;n++){const a=n*Math.PI/6;l.lineStyle(1,c,p*.5).lineBetween(h.x+Math.cos(a)*(h.radius-8),h.y+Math.sin(a)*(h.radius-8),h.x+Math.cos(a)*h.radius,h.y+Math.sin(a)*h.radius);}
   else for(let n=1;n<5;n++){const x=h.x+Math.cos(h.angle)*h.length*n/5,y=h.y+Math.sin(h.angle)*h.length*n/5;l.lineStyle(1,c,p*.45).lineBetween(x-8*Math.cos(h.angle+.6),y-8*Math.sin(h.angle+.6),x,y).lineBetween(x,y,x-8*Math.cos(h.angle-.6),y-8*Math.sin(h.angle-.6));}
  }
  for(const f of this.effects){
   const p=Math.max(0,(time-f.start)/f.duration),fade=1-p,c=colors[f.style],x=f.x,y=f.y-30,impact=f.impact;
   if(f.style==='slash'||f.style==='execute'||f.style==='claw'){
    const count=f.style==='claw'?3:f.style==='execute'?2:1,r=f.cast?68:31;
    for(let n=0;n<count;n++){const a=(f.facing>0?-1.4:1.7)+n*.45,xx=x+n*5*f.facing;
     for(let layer=0;layer<3;layer++){g.lineStyle(Math.max(1,(f.cast?7:4)-layer*2),c,fade*(.25+layer*.2)).beginPath();g.arc(xx,y,r+p*15-layer*5,a+p*.5,a+1.9+p*.5);g.strokePath();}
     l.lineStyle(1,0xfff1cf,fade*.7).beginPath();l.arc(xx,y,r+p*15,a+.2+p*.5,a+1.4+p*.5);l.strokePath();}
    if(impact)this.sparks(x,y,c,p,10,35);
   }else if(['pierce','volley','rain'].includes(f.style)){
    const count=f.style==='rain'?11:f.style==='volley'?3:1;
    for(let n=0;n<count;n++){const start=(n%4)*.12,t=Math.max(0,Math.min(1,(p-start)/(1-start))),dx=(n-(count-1)/2)*18;
     if(f.style==='rain'){const xx=x+dx+35*(1-t),yy=y-125*(1-t);g.lineStyle(2,c,fade).lineBetween(xx+16,yy-32,xx,yy);l.lineStyle(1,0xe2edcf,fade*.6).lineBetween(xx+24,yy-49,xx+4,yy-8);if(t>.7)this.sparks(x+dx,y+20,c,(t-.7)/.3,3,14);}
     else{const xx=x+(f.tx-x)*t;g.lineStyle(2,c,fade).lineBetween(xx-18*f.facing,y+n*5,xx+8*f.facing,y+n*5);l.lineStyle(1,c,fade*.5).lineBetween(xx-38*f.facing,y+n*5,xx,y+n*5);}}
   }else if(f.style==='meteor'){
    const xx=x+180*(1-p),yy=f.y-320*(1-p)-15;
    l.lineStyle(10,0xff8947,.18).lineBetween(xx+70,yy-120,xx,yy);l.lineStyle(4,0xffcb86,.7).lineBetween(xx+42,yy-72,xx,yy);g.fillStyle(0x72412d,.9).fillEllipse(xx,yy,24,35);l.fillStyle(0xffcb78,.7).fillEllipse(xx,yy+4,12,23);this.rune(x,f.y,f.radius,0xffad6c,.2+p*.4,0);
   }else if(f.style==='ward'||f.style==='shield'||f.style==='hammer'){
    const r=(f.style==='ward'?30:40)+p*(f.cast?90:40);floor.lineStyle(3,c,fade*.55).strokeEllipse(x,f.y,r*2,r*.65);floor.lineStyle(1,c,fade*.3).strokeEllipse(x,f.y,r*2.3,r*.75);this.sparks(x,y,c,p,14,55);
    if(f.style==='shield')for(let n=0;n<7;n++){const a=n*Math.PI/3;g.lineStyle(2,c,fade*.65).lineBetween(x+Math.cos(a)*r*.3,f.y+Math.sin(a)*r*.13,x+Math.cos(a)*r,f.y+Math.sin(a)*r*.4);}
   }else if(f.style==='fire'){
    const r=impact?Math.min(f.radius,150):30;floor.fillStyle(0x55211b,fade*.4).fillEllipse(x,f.y,r*2,r*.7);floor.lineStyle(3,c,fade*.7).strokeEllipse(x,f.y,r*2*Math.min(1,p*4),r*.65*Math.min(1,p*4));
    for(let n=0;n<18;n++){const a=n*2.399,xx=x+Math.cos(a)*r*Math.min(1,p*2),yy=f.y+Math.sin(a)*r*.3-p*70;g.fillStyle(n%2?0xe97838:0xf8bf70,fade*.55).fillTriangle(xx-5*fade,yy+12,xx+5*fade,yy+12,xx,yy-20*fade);l.fillStyle(c,fade*.5).fillCircle(xx,yy,2+3*fade);}this.sparks(x,y,0xffd594,p,18,r);
   }else if(f.style==='frost'){
    const r=Math.min(110,f.radius),rise=Math.min(1,p*5);this.rune(x,f.y,r*rise,c,fade*.4,time*.1);
    for(let n=0;n<12;n++){const a=n*2.399,xx=x+Math.cos(a)*r*.8*rise,yy=f.y+Math.sin(a)*r*.3*rise,size=(8+n%4*4)*rise;g.fillStyle(n%2?0x78aaba:0xc4f0f3,fade*.5).fillTriangle(xx-4,yy,xx+5,yy,xx+2,yy-size);l.lineStyle(1,c,fade*.6).lineBetween(xx,yy,xx+2,yy-size);}
   }else if(f.style==='shadow'){
    for(let n=0;n<6;n++){const xx=x+(f.tx-x)*p-n*7*f.facing,yy=y+(f.ty-f.y)*p;g.lineStyle(7-n,c,fade*(.35-n*.04)).lineBetween(xx-25*f.facing,yy+5+n*3,xx+20*f.facing,yy+n*3);}this.sparks(f.tx,f.ty-25,c,p,8,30);
   }else if(f.style==='doom'){
    this.rune(x,f.y,Math.min(f.radius,160)*(p*.6+.4),c,fade*.65,time*.4);
    if(f.shape==='rect'||f.shape==='cone'){
     const length=f.shape==='cone'?f.radius:f.length;
     for(let n=0;n<9;n++){const along=length*Math.min(1,p*3)*(n+1)/9,xx=x+Math.cos(f.angle)*along,yy=f.y+Math.sin(f.angle)*along;g.lineStyle(3,c,fade*.8).lineBetween(xx,yy,xx+Math.cos(f.angle+1.2)*12,yy+Math.sin(f.angle+1.2)*12);l.lineStyle(1,0xffbf9c,fade*.7).lineBetween(xx,yy,xx-12*Math.cos(f.angle),yy-12*Math.sin(f.angle));}
    }else for(let n=0;n<10;n++){const a=n*Math.PI/5,rr=Math.min(f.radius,160)*p,xx=x+Math.cos(a)*rr,yy=f.y+Math.sin(a)*rr*.55;l.lineStyle(2,c,fade*.55).lineBetween(xx,yy,xx,yy-25*fade);}
    this.sparks(x,y,c,p,12,65);
   }else if(f.style==='arcane'){
    this.rune(x,f.y,18+p*35,c,fade*.45,time);
    for(let n=0;n<7;n++){const a=n*Math.PI*2/7+p*3,xx=x+Math.cos(a)*(12+p*26),yy=y+Math.sin(a)*(12+p*26);l.fillStyle(c,fade*.65).fillCircle(xx,yy,2);}
   }else this.sparks(x,y,c,p,f.style==='metal'?14:8,f.style==='metal'?45:23);
  }
 }
}
