import type { Unit } from '../core/battle';
import { HERO_POSE_FRAMES } from './hero-art';
import type { HeroPose } from './hero-art';

const walkCycle:Record<string,number>={warrior:.68,archer:.54,mage:.86,tank:.82,assassin:.44};
export const heroTextureKey=(kind:string,pose:HeroPose,frame:number)=>`${kind}:${pose}:${frame}`;
/** Uses simulation time so pausing freezes limbs as well as combat. */
export function heroFrame(unit:Unit,time:number):{pose:HeroPose;frame:number;key:string}{
 let pose:HeroPose='idle',frame=0;
 if(unit.hp<=0)pose='dead';
 else if(unit.animation==='move'){pose='move';frame=Math.floor(time/walkCycle[unit.kind]*HERO_POSE_FRAMES.move)%HERO_POSE_FRAMES.move;}
 else if(unit.action&&unit.action.end>time){
  pose=unit.action.kind;
  const progress=Math.max(0,(time-unit.action.start)/(unit.action.end-unit.action.start));
  frame=Math.min(HERO_POSE_FRAMES[pose]-1,Math.floor(progress*HERO_POSE_FRAMES[pose]));
 }else if(unit.animation==='hit')pose='hit';
 return{pose,frame,key:heroTextureKey(unit.kind,pose,frame)};
}
