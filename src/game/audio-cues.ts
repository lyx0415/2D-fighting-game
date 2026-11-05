import type {BattleEvent} from '../core/battle';
export interface AudioLayer {wave:OscillatorType|'noise';frequency:number;end?:number;duration:number;gain:number;delay?:number;filter?:number}
const tone=(frequency:number,end:number,duration:number,gain=.2,wave:OscillatorType='sine',delay=0):AudioLayer=>({wave,frequency,end,duration,gain,delay});
const noise=(filter:number,duration:number,gain=.2,delay=0):AudioLayer=>({wave:'noise',frequency:filter,filter,duration,gain,delay});
export const AUDIO_CUES:Record<string,AudioLayer[]>={
 entry:[noise(650,.6,.13),tone(146.83,146.83,.8,.09),tone(220,220,.6,.06,'sine',.14)],
 click:[tone(630,390,.045,.12)],
 bladeSwing:[noise(2800,.16,.16),tone(190,80,.15,.12,'triangle')],
 bowRelease:[tone(280,150,.12,.18,'triangle'),noise(4200,.13,.1,.025)],
 arcaneBolt:[tone(540,1040,.2,.14),tone(810,1560,.18,.06,'sine',.035)],
 hammerSwing:[noise(650,.23,.18),tone(125,58,.23,.15,'triangle')],
 daggerSwing:[noise(5400,.085,.16),tone(420,150,.09,.07,'triangle')],
 claw:[noise(1600,.13,.16),tone(110,70,.1,.13,'sawtooth')],
 bite:[noise(750,.1,.2),tone(180,65,.12,.12,'triangle')],
 crossbow:[noise(3300,.07,.2),tone(460,180,.085,.14,'square')],
 chant:[tone(190,240,.38,.1),tone(286,360,.35,.08,'sine',.04)],
 cleave:[noise(1100,.3,.22),tone(100,45,.3,.2,'triangle')],
 doom:[tone(120,75,.65,.15,'sawtooth'),tone(181,113,.6,.09,'sine',.05),noise(600,.5,.12)],
 sweep:[noise(3600,.28,.22),tone(260,95,.22,.16,'triangle')],
 ward:[tone(330,660,.48,.12),tone(495,990,.44,.08,'sine',.04),noise(1600,.08,.07)],
 volley:[0,.12,.24].flatMap(t=>[tone(300,165,.1,.13,'triangle',t),noise(4100,.08,.09,t)]),
 arrowRain:[tone(720,1080,.35,.08),...[0,.1,.2,.3].map(t=>noise(4800,.15,.09,t))],
 frost:[noise(6300,.38,.15),tone(1350,2100,.34,.07),tone(1800,2700,.26,.04,'sine',.08)],
 meteorCast:[tone(150,540,.65,.14,'triangle'),noise(900,.6,.15),tone(225,810,.5,.06,'sine',.08)],
 shieldBash:[tone(205,60,.24,.24,'triangle'),tone(920,440,.17,.1,'sine'),noise(1800,.13,.19)],
 oath:[tone(220,440,.6,.13),tone(330,660,.55,.1,'sine',.04),tone(440,880,.5,.05,'sine',.08)],
 shadow:[noise(7200,.15,.12),tone(700,100,.24,.13,'triangle')],
 execute:[noise(5500,.12,.2),tone(380,85,.15,.13,'triangle'),noise(2700,.18,.13,.11)],
 metalHit:[tone(1450,700,.13,.11),tone(2150,1150,.085,.07),noise(2600,.075,.18)],
 fleshHit:[noise(480,.09,.21),tone(105,45,.095,.18,'triangle')],
 arrowHit:[noise(1700,.09,.16),tone(340,120,.11,.12,'triangle')],
 frostHit:[noise(6900,.14,.12),tone(2100,1250,.15,.07)],
 fireHit:[noise(700,.4,.25),tone(80,28,.35,.22,'triangle')],
 bladeHit:[noise(3900,.12,.18),tone(760,200,.1,.07,'triangle')],
 magicHit:[tone(960,360,.18,.12),noise(2800,.12,.12)],
 loot:[tone(880,1320,.17,.11),tone(1320,1760,.16,.07,'sine',.06)],
 death:[tone(90,35,.26,.13,'triangle'),noise(450,.17,.1)],
 won:[0,.12,.24].map((t,i)=>tone([330,440,660][i],[660,880,1320][i],.45,.1,'sine',t)),
 lost:[tone(165,82,.65,.12,'triangle'),tone(123,61,.6,.06,'sine',.1)]
};
const attack:Record<string,string>={warrior:'bladeSwing',archer:'bowRelease',mage:'arcaneBolt',tank:'hammerSwing',assassin:'daggerSwing',zombie:'claw',wolf:'bite',crossbow:'crossbow',priest:'chant',raider:'cleave',guard:'hammerSwing',boss:'cleave',wraith:'chant',fanatic:'daggerSwing',bishop:'doom'};
const skill:Record<string,[string,string]>={warrior:['sweep','ward'],archer:['volley','arrowRain'],mage:['frost','meteorCast'],tank:['shieldBash','oath'],assassin:['shadow','execute']};
export function combatCue(event:BattleEvent):string|undefined{
 if(event.type==='attack')return attack[event.sourceKind??event.kind??'']??'claw';
 if(event.type==='skill'){
  if(event.phase==='telegraph')return undefined;
  if(event.phase==='impact')return event.sourceKind==='mage'&&event.skillIndex===1?'fireHit':undefined;
  return skill[event.sourceKind??event.kind??'']?.[event.skillIndex??0]??'doom';
 }
 if(event.type==='damage'){
  if(event.sourceKind==='mage')return event.skillIndex===0?'frostHit':event.skillIndex===1?'fireHit':'magicHit';
  if(['archer','crossbow'].includes(event.sourceKind??''))return'arrowHit';
  if(event.sourceKind==='assassin')return'bladeHit';
  return ['warrior','tank','guard','boss','raider'].includes(event.targetKind??'')?'metalHit':'fleshHit';
 }
 if(['loot','death'].includes(event.type))return event.type;
 return undefined;
}
