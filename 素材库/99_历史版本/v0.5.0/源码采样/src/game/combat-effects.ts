import Phaser from 'phaser';
import type {BattleEvent,Unit} from '../core/battle';
export type EffectStyle='slash'|'pierce'|'arcane'|'hammer'|'claw'|'frost'|'fire'|'ward'|'shield'|'shadow'|'execute'|'rain'|'volley'|'doom'|'metal'|'blood';
export function effectStyle(e:BattleEvent):EffectStyle|undefined{
 const kind=e.sourceKind??e.kind??'';
 if(e.type==='damage')return kind==='mage'?(e.skillIndex===1?'fire':e.skillIndex===0?'frost':'arcane'):['archer','crossbow'].includes(kind)?'pierce':kind==='assassin'?'execute':['tank','guard','boss','raider'].includes(e.targetKind??'')?'metal':'blood';
 if(e.type==='skill'){
  if(e.phase==='telegraph')return undefined;
  if(kind==='warrior')return e.skillIndex===1?'ward':'slash';
  if(kind==='archer')return e.skillIndex===1?'rain':'volley';
  if(kind==='mage')return e.skillIndex===1?'fire':'frost';
  if(kind==='tank')return e.skillIndex===1?'ward':'shield';
  if(kind==='assassin')return e.skillIndex===1?'execute':'shadow';return'doom';
 }
 if(e.type==='attack')return kind==='mage'?'arcane':['archer','crossbow'].includes(kind)?'pierce':kind==='tank'?'hammer':kind==='wolf'||kind==='zombie'?'claw':['priest','wraith','bishop'].includes(kind)?'doom':kind==='assassin'?'execute':'slash';
 return undefined;
}
interface Fx {style:EffectStyle;x:number;y:number;tx:number;ty:number;start:number;duration:number;radius:number;facing:number;impact:boolean;cast:boolean}
const colors:Record<EffectStyle,number>={slash:0xf0cf8a,pierce:0xc9dfad,arcane:0x99dcf0,hammer:0xe7c794,claw:0xd68a70,frost:0xb7edff,fire:0xffb15d,ward:0xf5dba0,shield:0xc1d8ed,shadow:0x9e7bd5,execute:0xdbc0f2,rain:0xb7dba0,volley:0xd5eac0,doom:0xc9768e,metal:0xffd9a0,blood:0xe69b87};
export class CombatEffects {
 readonly graphics:Phaser.GameObjects.Graphics;effects:Fx[]=[];
 constructor(scene:Phaser.Scene){this.graphics=scene.add.graphics().setDepth(710);}
 add(e:BattleEvent,units:Unit[],time:number):void{
  const style=effectStyle(e);if(!style)return;const source=units.find(u=>u.id===e.source),target=units.find(u=>u.id===e.target);
  this.effects.push({style,x:e.x,y:e.y-38,tx:target?.x??e.x,ty:(target?.y??e.y)-38,start:time,duration:e.type==='damage'?.23:e.type==='attack'?.22:style==='fire'?.7:.48,radius:e.radius??55,facing:source?.facing??1,impact:e.phase==='impact'||e.type==='damage',cast:e.type==='skill'});
  if(this.effects.length>64)this.effects.splice(0,this.effects.length-64);
 }
 draw(time:number):void{
  const g=this.graphics;g.clear();this.effects=this.effects.filter(f=>time-f.start<f.duration);
  for(const f of this.effects){const p=Math.max(0,(time-f.start)/f.duration),fade=(1-p),c=colors[f.style];g.lineStyle(2,c,fade*.8);
   const impact=f.impact,x=f.x,y=f.y;
   if(f.style==='slash'||f.style==='execute'||f.style==='claw'){
    const count=f.style==='claw'?3:f.style==='execute'?2:1;
    for(let n=0;n<count;n++){const xx=x+n*8-8,yy=y+n*5;g.lineStyle(f.cast?4:2,c,fade);g.beginPath();g.arc(xx,yy,30+p*40,(f.facing>0?-.95:2.2)+(n%2)*.6,(f.facing>0?.7:4)+(n%2)*.6);g.strokePath();}
   }else if(f.style==='pierce'||f.style==='volley'||f.style==='rain'){
    const count=f.style==='rain'?7:f.style==='volley'?3:1;
    for(let n=0;n<count;n++){const dx=(n-(count-1)/2)*20,yy=y-(1-p)*65;g.lineStyle(2,c,fade);if(f.style==='rain')g.lineBetween(x+dx+24,yy-35,x+dx,yy+10);else{const px=x+(f.tx-x)*p;g.lineBetween(px-18*f.facing,y-3+n*5,px+10*f.facing,y+n*5);}}
   }else if(f.style==='ward'||f.style==='shield'){
    g.lineStyle(3,c,fade*.7).strokeEllipse(x,y+10,65+p*80,85+p*45);g.lineStyle(1,c,fade*.5).strokeEllipse(x,y+10,83+p*80,105+p*45);
    for(let n=0;n<6;n++){const a=n*Math.PI/3+p*.4;g.fillStyle(c,fade*.7).fillCircle(x+Math.cos(a)*(40+p*20),y+10+Math.sin(a)*48,2);}
   }else if(f.style==='fire'){
    const r=impact?Math.min(f.radius,150):35;
    g.fillStyle(0xef7536,fade*.15).fillEllipse(x,y+30,r*2*p+20,r*.8*p+12);
    for(let n=0;n<11;n++){const a=n*2.4,xx=x+Math.cos(a)*r*p,yy=y+30+Math.sin(a)*r*.3*p-p*50;g.fillStyle(n%2?0xffcb76:0xf48241,fade*.8).fillTriangle(xx-4*fade,yy+12*fade,xx+4*fade,yy+12*fade,xx,yy-12*fade);}
   }else if(f.style==='frost'){
    const r=impact?Math.min(125,f.radius):44;g.lineStyle(2,c,fade*.7).strokeEllipse(x,y+28,r*2*p+15,r*.7*p+8);
    for(let n=0;n<8;n++){const a=n*Math.PI/4,xx=x+Math.cos(a)*r*p,yy=y+Math.sin(a)*r*.45*p;g.lineBetween(xx-5,yy,xx+5,yy).lineBetween(xx,yy-7,xx,yy+7).lineBetween(xx-3,yy-4,xx+3,yy+4);}
   }else if(f.style==='shadow'){
    for(let n=0;n<4;n++)g.lineStyle(5-n,c,fade*(.6-n*.1)).lineBetween(x-n*14*f.facing,y-12+n*4,x+(45+p*65)*f.facing,y+10+n*4);
   }else if(f.style==='arcane'||f.style==='doom'){
    g.lineStyle(2,c,fade*.7).strokeEllipse(x,y+22,25+p*95,10+p*35);
    for(let n=0;n<6;n++){const a=n*Math.PI/3+p*2,xx=x+Math.cos(a)*(16+p*35),yy=y+Math.sin(a)*(16+p*35);g.fillStyle(c,fade).fillCircle(xx,yy,2.5*fade);g.lineBetween(xx,yy,xx,yy-9);}
   }else{
    for(let n=0;n<7;n++){const a=n*2.4,rr=8+p*(f.style==='hammer'?45:25),xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr*.7;g.lineStyle(n%2?2:1,c,fade).lineBetween(xx,yy,xx+Math.cos(a)*9*fade,yy+Math.sin(a)*9*fade);}
    if(f.style==='hammer')g.lineStyle(2,c,fade*.5).strokeEllipse(x,y+36,20+p*100,8+p*30);
   }
  }
 }
}
