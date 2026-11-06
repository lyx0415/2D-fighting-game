import type {BattleEvent,Unit} from '../core/battle';
export type EffectStyle='slash'|'pierce'|'arcane'|'hammer'|'claw'|'frost'|'fire'|'meteor'|'ward'|'shield'|'shadow'|'execute'|'rain'|'volley'|'doom'|'metal'|'blood';
export function effectStyle(e:BattleEvent):EffectStyle|undefined {
 const kind=e.sourceKind??e.kind??'';
 if(e.type==='damage')return kind==='mage'?(e.skillIndex===1?'fire':e.skillIndex===0?'frost':'arcane'):['archer','crossbow'].includes(kind)?'pierce':kind==='assassin'?'execute':['tank','guard','boss','raider'].includes(e.targetKind??'')?'metal':'blood';
 if(e.type==='skill'){
  if(e.phase==='telegraph')return kind==='mage'&&e.skillIndex===1?'meteor':undefined;
  if(kind==='warrior')return e.skillIndex===1?'ward':'slash';
  if(kind==='archer')return e.skillIndex===1?'rain':'volley';
  if(kind==='mage')return e.skillIndex===1?(e.phase==='impact'?'fire':'arcane'):'frost';
  if(kind==='tank')return e.skillIndex===1?'ward':'shield';
  if(kind==='assassin')return e.skillIndex===1?'execute':'shadow';return 'doom';
 }
 if(e.type==='attack')return kind==='mage'?'arcane':['archer','crossbow'].includes(kind)?'pierce':kind==='tank'?'hammer':['wolf','zombie'].includes(kind)?'claw':['priest','wraith','bishop'].includes(kind)?'doom':kind==='assassin'?'execute':'slash';
}
export function planEffect(e:BattleEvent,units:Unit[],time:number){
 const style=effectStyle(e);if(!style)return;
 const target=units.find(u=>u.id===e.target),source=units.find(u=>u.id===e.source);
 const centered=e.type==='skill'&&e.phase==='cast'&&['rain','frost'].includes(style);
 return {style,x:centered?(target?.x??e.x):e.x,y:centered?(target?.y??e.y):e.y,tx:target?.x??e.x,ty:target?.y??e.y,start:time,
  duration:e.type==='damage'?.28:e.type==='attack'?.25:style==='meteor'?.7:style==='frost'?2:style==='rain'?1.1:style==='fire'?1.2:style==='doom'?1.1:.65,
  radius:centered?(style==='rain'?140:110):e.radius??55,facing:source?.facing??1,impact:e.phase==='impact'||e.type==='damage',cast:e.type==='skill',shape:e.shape,length:e.length??380,width:e.width??105,angle:e.angle??0};
}
