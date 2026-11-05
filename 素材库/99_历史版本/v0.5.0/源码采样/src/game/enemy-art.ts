import type {RigDefinition,RigPart,RigPose,RigTransform} from './rig-types';

/** Original v005 enemy layers. Source coordinates are 128×160, foot (64,150). */
const kinds=['zombie','wolf','crossbow','priest','raider','guard','boss','wraith','fanatic','bishop'];
const outline='#17202d';
const path=(d:string,fill:string,stroke=outline,width=1.3)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;
const line=(d:string,color='#c2b08d',width=1,opacity=1)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`;
const circle=(x:number,y:number,r:number,fill:string,stroke=outline)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width=".9"/>`;
const metal=(id:string)=>`url(#e-${id}-steel)`;
const mat=(id:string,name:string)=>`url(#e-${id}-${name})`;
function defs(id:string):string{return `<defs>
 <linearGradient id="e-${id}-steel" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="#b6bdba"/><stop offset=".27" stop-color="#586c79"/><stop offset=".48" stop-color="#9aa8ad"/><stop offset=".55" stop-color="#354b5b"/><stop offset="1" stop-color="#1b2a3b"/></linearGradient>
 <linearGradient id="e-${id}-iron" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#5e7081"/><stop offset=".4" stop-color="#2a3b50"/><stop offset="1" stop-color="#101e30"/></linearGradient>
 <linearGradient id="e-${id}-gold" x1="0" y1="0" x2="1" y2=".5"><stop stop-color="#d1bd89"/><stop offset=".45" stop-color="#907346"/><stop offset=".63" stop-color="#b7a16c"/><stop offset="1" stop-color="#493c33"/></linearGradient>
 <linearGradient id="e-${id}-red" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#86515c"/><stop offset=".45" stop-color="#512a3e"/><stop offset="1" stop-color="#211d30"/></linearGradient>
 <linearGradient id="e-${id}-blue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#5c7389"/><stop offset=".5" stop-color="#32465f"/><stop offset="1" stop-color="#15233b"/></linearGradient>
 <linearGradient id="e-${id}-leather" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#8a725c"/><stop offset=".45" stop-color="#51483f"/><stop offset="1" stop-color="#252b34"/></linearGradient>
 <linearGradient id="e-${id}-skin" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="${id==='zombie'?'#a4ae87':id==='wraith'?'#788c99':'#bfab92'}"/><stop offset=".55" stop-color="${id==='zombie'?'#697c62':'#8d796c'}"/><stop offset="1" stop-color="#4a4c4e"/></linearGradient>
 <linearGradient id="e-${id}-bone" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d3ceae"/><stop offset=".5" stop-color="#9c9f8e"/><stop offset="1" stop-color="#606c71"/></linearGradient>
 <linearGradient id="e-${id}-fur" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#809071"/><stop offset=".4" stop-color="#4d6156"/><stop offset="1" stop-color="#253846"/></linearGradient>
 <radialGradient id="e-${id}-gem"><stop stop-color="#eddcce"/><stop offset=".35" stop-color="${id==='wraith'?'#b0dce3':'#cf8d96'}"/><stop offset="1" stop-color="${id==='wraith'?'#326b8c':'#68263e'}"/></radialGradient>
 </defs>`;}
function layer(id:string,part:string,body:string,pivotX:number,pivotY:number,parent?:string):RigPart{
 return{id:part,parent,pivotX,pivotY,svg:`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="160" viewBox="0 0 128 160" data-enemy="${id}" data-part="${part}">${defs(id)}${body}</svg>`};
}
function segment(x:number,y:number,tx:number,ty:number,w:number,end:number,fill:string):string{
 const length=Math.hypot(tx-x,ty-y),nx=-(ty-y)/length,ny=(tx-x)/length;
 return path(`M${x+nx*w} ${y+ny*w}L${tx+nx*end} ${ty+ny*end}L${tx-nx*end} ${ty-ny*end}L${x-nx*w} ${y-ny*w}Z`,fill);
}
const rivets=(pts:[number,number][])=>pts.map(([x,y])=>circle(x,y,1.15,'#b8a075','#4a4840')).join('');
function chain(x:number,y:number,n:number):string{return Array.from({length:n},(_,i)=>`<ellipse cx="${x+(i%2?1:0)}" cy="${y+i*5}" rx="2.5" ry="3.5" fill="none" stroke="#9b9e9c" stroke-width="1"/>`).join('');}
function commonHead(id:string):string{
 if(id==='zombie')return path('M51 20L60 12L75 15L82 26L80 34L88 40L81 45L77 57L65 61L51 52L47 36Z',mat(id,'skin'))+path('M49 35L46 24L51 15L62 10L76 14L81 22L76 25L68 19L58 25L55 39Z','#424b43')+line('M55 28L62 29L64 36M71 22L69 31M77 46L69 47L66 51','#424d43',1.3)+path('M62 32L68 33L67 37L61 36Z','#c8c178')+path('M75 31L81 32L80 35L75 36Z','#c8c178')+line('M55 44L60 47L58 52M69 42L73 43M70 49V52M73 49V52','#493e3e',1)+line('M57 17L60 22M58 16L56 21','#b3a27d',.8);
 if(id==='wraith')return path('M42 46Q40 13 63 7Q87 8 92 44L79 62L56 64Z',mat(id,'blue'))+path('M50 43Q50 24 65 21Q81 23 83 44L75 55L58 54Z','#0d182a')+line('M53 35L61 37M70 36L79 33','#b2e1e8',1.8)+path('M61 42L68 41L72 48L66 53L61 49Z','#263b51')+line('M50 25Q47 47 56 54M76 18L86 40','#91a8b8',.8)+chain(48,48,3)+chain(84,46,3);
 if(id==='fanatic')return path('M50 18L64 8L81 20L84 37L77 53L65 62L52 52L47 35Z',mat(id,'bone'))+path('M48 21L54 12L63 6L77 13L84 24L77 26L68 18L61 21L54 29Z','#3b2d40')+line('M52 33L61 36L58 39M70 36L79 31L77 38','#532c3e',2)+path('M64 16L68 25L66 51L62 53L61 31Z',mat(id,'gold'))+line('M53 45L60 48M70 47L77 42M65 55L69 52','#617078',1)+rivets([[55,22],[77,23]]);
 if(id==='priest')return path('M43 45Q42 15 63 9Q85 11 90 42L82 61L49 61Z',mat(id,'red'))+path('M52 28L65 20L78 30L79 45L71 58L60 57L51 44Z',mat(id,'bone'))+path('M56 34L62 36L60 41L55 39Z','#562e3a')+path('M69 35L76 32L77 38L71 41Z','#562e3a')+path('M63 41L68 40L70 48L65 50L62 47Z','#53606a')+line('M59 51L71 50M63 51V56M67 51V55','#576069',.8)+line('M48 24L44 43L49 55M82 24L87 42L83 56','#b39763',1)+circle(66,19,2.5,mat(id,'gem'));
 if(id==='bishop')return path('M48 31L49 11L65 2L82 11L85 34L77 43L54 43Z',mat(id,'gold'))+path('M54 28L55 14L65 8L76 14L78 29Z',mat(id,'red'))+path('M64 5L68 8L69 24L66 31L63 25Z','#bfb789')+circle(66,19,3,mat(id,'gem'))+path('M54 34L62 28L77 32L83 42L80 49L86 53L78 57L75 65L65 70L55 61L50 47Z',mat(id,'skin'))+path('M53 35L58 31L59 43L54 56L48 60L49 44Z','#a5b2af')+path('M76 35L81 39L80 52L83 61L77 61L74 48Z','#b2bcaf')+line('M61 42L67 41M73 42L79 42M62 46L64 48M74 47L77 49M67 57L74 57M64 61L70 64M69 50L70 54','#504b4e',.85)+line('M57 38L61 36M76 37L79 39','#e0cfa4',.9);
 const boss=id==='boss',guard=id==='guard',raider=id==='raider';
 if(boss||guard||raider){
  let s=path(boss?'M46 25L52 11L71 7L89 19L92 38L85 51L67 61L49 51L43 37Z':guard?'M49 25L55 14L74 14L85 27L85 43L77 56L58 57L48 44Z':'M47 25L55 13L71 12L83 23L86 38L78 52L62 57L48 45Z',mat(id,'iron'));
  if(boss)s+=path('M49 18L35 7L32 2L45 5L58 18M82 15L91 5L101 2L95 13L87 25',mat(id,'bone'))+path('M51 25L68 18L84 26L86 42L76 49L75 57L61 58L58 49L49 42Z',metal(id));
  else if(guard)s+=path('M54 27L64 22L79 28L80 45L71 54L59 50L53 41Z',metal(id));
  else s+=path('M55 28L66 24L78 30L78 43L70 53L59 47L53 38Z',mat(id,'skin'));
  s+=path(boss?'M53 32L65 34L63 39L54 38ZM72 34L84 30L83 36L74 39Z':guard?'M55 34L63 35L63 39L55 39ZM69 35L78 33L78 38L69 39Z':'M56 34L63 35L62 38L55 37ZM70 34L77 32L77 36L70 38Z','#d39382');
  s+=line(boss?'M65 41L70 41L72 48L66 49M58 45L59 50M78 44L78 49M63 54H72':guard?'M66 30L67 48M59 44V47M73 43V47':'M65 39L66 44L71 44M58 43L62 48M69 49L74 46','#454b50',1);
  s+=line(boss?'M52 20L68 13L85 21M46 35L51 45M88 31L85 43':'M53 24L64 19L78 24', '#b29868',1.1)+rivets(boss?[[56,23],[79,23],[58,43],[79,42]]:[[56,29],[78,29]]);
  return s;
 }
 return path('M47 43Q41 19 59 11Q77 9 86 30L86 48L78 59L50 60Z','#34483d')+path('M56 25L67 19L78 27L82 39L78 45L85 49L78 54L72 61L61 58L53 47Z',mat(id,'skin'))+path('M55 44L78 43L82 50L73 62L61 58Z','#453746')+line('M59 34L66 33M73 35L79 34M64 46L72 48M59 40L61 43','#403f43',1)+line('M49 28Q49 18 60 16M81 27L86 40','#9b8b60',1)+path('M49 24L42 17L44 7L54 18Z','#6e8066');
}
function humanoid(id:string):RigDefinition{
 const parts:RigPart[]=[],heavy=['raider','guard','boss'].includes(id),caster=['priest','bishop','wraith'].includes(id),ghost=id==='wraith';
 const fill=heavy?mat(id,'iron'):id==='zombie'?mat(id,'leather'):id==='crossbow'?'#3b5148':mat(id,id==='wraith'?'blue':'red');
 const limb=heavy?metal(id):id==='zombie'?mat(id,'skin'):mat(id,'leather');
 const add=(part:string,body:string,x:number,y:number,parent?:string)=>parts.push(layer(id,part,body,x,y,parent));
 const wide=id==='boss'?10:id==='guard'?6:0;
 add('cape',path(caster?'M43 49Q26 74 26 128L20 146L39 139L48 151L62 140L77 151L89 139L108 147L99 122L91 53Z':heavy?'M41 44L24 67L20 132L38 127L47 145L64 127L83 141L100 130L94 62L80 42Z':'M44 49L29 73L26 126L40 117L49 139L62 120L80 134L90 118L89 60Z',mat(id,ghost?'blue':'red'))+line('M41 67L33 126M80 64L93 130',ghost?'#9ab3c2':'#a17779',1,.7),64,58,'body');
 if(!ghost){
  for(const [side,x,kx,ax] of [['rear',53,47,45],['front',73,77,80]] as const){
   add(`${side}Thigh`,segment(x,97,kx,121,heavy?7:5,heavy?6:4,fill)+circle(kx,121,heavy?6:4.7,limb),x,97);
   const shin=segment(kx,121,ax,144,heavy?5.5:3.5,heavy?5:3.5,limb)+path(`M${ax-6} 137L${ax+5} 138L${ax+4} 145L${ax+14} 148L${ax+13} 152H${ax-7}L${ax-8} 147Z`,heavy?metal(id):'#27323a')+line(`M${kx-3} 125L${kx+3} 127M${ax-3} 142L${ax+3} 142`,heavy?'#b4b9b6':'#998263',.8);
   add(`${side}Shin`,shin,kx,121,`${side}Thigh`);
  }
 }
 let body=path(`M${44-wide} 51L64 45L${84+wide} 54L${90+wide} 85L81 104L48 106L${35-wide} 85Z`,fill);
 if(heavy){
  body+=path(`M${43-wide} 58L62 66L${83+wide} 57L${88+wide} 80L72 93L51 91L${37-wide} 78Z`,metal(id))+path('M56 65L65 72L76 65L73 82L65 88L57 81Z',mat(id,'gold'))+line('M44 76L54 85M78 84L88 75M49 91L54 97M74 94L81 90','#b5c1bd',1)+rivets([[45-wide,64],[81+wide,63],[50,97],[77,95]]);
  body+=path(`M${40-wide} 52L${27-wide} 57L${27-wide} 71L42 77L53 65Z`,metal(id))+path(`M${82+wide} 52L${99+wide} 59L${106+wide} 73L91 79L77 65Z`,metal(id));
  if(id==='boss')body+=path('M29 56L23 44L32 49L39 62M98 58L108 45L108 60L102 69',mat(id,'bone'))+chain(42,78,5)+chain(87,78,5)+path('M57 86H75L78 101L64 110L53 99Z',mat(id,'iron'))+line('M60 91L69 95L63 102','#c5a97e',1.3);
 }else if(caster){
  body+=path('M47 52L63 69L81 51L84 61L70 85L58 86L43 62Z',mat(id,'gold'))+path('M57 70L68 65L75 78L67 89L58 83Z',mat(id,'gem'))+line('M44 87Q63 97 85 86M48 95L53 131M80 95L85 132','#b4a072',1.2);
  if(id==='bishop')body+=path('M37 54L45 46L53 56L49 71L36 72Z',mat(id,'gold'))+path('M83 53L93 49L103 65L95 75L81 66Z',mat(id,'gold'))+line('M46 108L55 116L52 125M74 108L79 116L75 126','#cab889',1.1);
  if(ghost)body+=path('M54 86L65 80L78 89L76 104L64 111L53 100Z',mat(id,'iron'))+circle(65,94,8,mat(id,'gem'))+line('M65 87V100M59 94H71','#bdc7b5',.8);
 }else{
  body+=path('M44 58L78 57L84 87L74 101L47 100L38 81Z',id==='zombie'?'#46584c':mat(id,'leather'))+line('M46 62L73 90M76 62L49 94','#ae966d',2.4)+circle(63,78,3,mat(id,'gold'))+line('M44 84L50 87M75 93L81 88','#b4a685',1);
  if(id==='zombie')body+=line('M46 71L55 73L57 80M65 91L69 96M76 65L79 73','#d3c4a2',1)+path('M45 89L51 87L55 96L52 105L43 101Z','#6e3d40');
 }
 body+=path('M45 98L81 95L84 103L48 109Z',mat(id,'leather'))+path('M60 97H72V107H60Z',mat(id,'gold'))+path('M63 100H69V104H63Z','#293946');
 // A transparent trunk pivot allows the cape to draw behind the chest and still follow its joints.
 add('body',path('M64 98h.01','none','none',0),64,98);
 add('chest',body,64,98,'body');
 const frontShoulder:[number,number]=[heavy?87:80,heavy?65:63],rearShoulder:[number,number]=[heavy?39:44,66];
 const frontElbow:[number,number]=id==='crossbow'?[86,80]:[heavy?95:88,84];
 const frontWrist:[number,number]=id==='crossbow'?[103,81]:caster?[100,96]:[heavy?104:97,103];
 const rearElbow:[number,number]=[36,87],rearWrist:[number,number]=caster?[40,99]:[40,106];
 for(const [side,shoulder,elbow,wrist] of [['rear',rearShoulder,rearElbow,rearWrist],['front',frontShoulder,frontElbow,frontWrist]] as const){
  add(`${side}UpperArm`,segment(...shoulder,...elbow,heavy?6.5:4.5,heavy?5.5:4,fill)+circle(...shoulder,heavy?6:4.5,limb),...shoulder,'body');
  const cuff=segment(elbow[0],elbow[1],wrist[0],wrist[1],heavy?5:3.8,heavy?4.5:3,limb)+circle(...elbow,heavy?5.4:4.1,limb)+circle(...wrist,heavy?4.7:3.5,mat(id,'skin'))+line(`M${elbow[0]-2} ${elbow[1]+4}L${wrist[0]-2} ${wrist[1]-4}`,heavy?'#bdc5bf':'#a48e6a',.8);
  add(`${side}Forearm`,cuff,...elbow,`${side}UpperArm`);
 }
 let weapon='';const [wx,wy]=frontWrist;
 if(id==='crossbow')weapon=path(`M${wx-13} ${wy-4}L${wx+14} ${wy-3}L${wx+18} ${wy+1}L${wx+14} ${wy+5}H${wx-6}L${wx-10} ${wy+13}L${wx-16} ${wy+10}L${wx-11} ${wy+1}Z`,mat(id,'leather'))+path(`M${wx+5} ${wy-22}Q${wx+21} ${wy} ${wx+6} ${wy+23}L${wx+1} ${wy+20}Q${wx+13} ${wy} ${wx+1} ${wy-19}Z`,mat(id,'gold'))+line(`M${wx+4} ${wy-20}L${wx+10} ${wy}L${wx+5} ${wy+21}M${wx-5} ${wy}H${wx+22}`,'#d5d6bb',1.2)+path(`M${wx+18} ${wy-3}L${wx+22} ${wy}L${wx+18} ${wy+3}Z`,metal(id));
 else if(caster)weapon=path(`M${wx+1} 37L${wx+5} 38L${wx+4} 148L${wx} 148Z`,mat(id,'leather'))+line(`M${wx+3} 52V139`,'#b29a6c',1)+path(`M${wx-6} 35L${wx-9} 22L${wx+3} 9L${wx+16} 22L${wx+11} 36L${wx+4} 42Z`,mat(id,'gold'))+path(`M${wx+3} 15L${wx+11} 24L${wx+3} 35L${wx-3} 24Z`,mat(id,'gem'))+line(`M${wx-2} 47H${wx+9}M${wx-1} 51H${wx+8}`,'#b6a477',1);
 else if(id==='raider')weapon=path(`M${wx-2} 54H${wx+3}V143L${wx} 147L${wx-3} 143Z`,mat(id,'leather'))+path(`M${wx-2} 44L${wx+13} 41L${wx+21} 55L${wx+17} 72L${wx+2} 67L${wx-5} 64L${wx-13} 69L${wx-19} 56L${wx-13} 45Z`,metal(id))+line(`M${wx+15} 46L${wx+18} 56L${wx+15} 66M${wx-16} 54L${wx-12} 47`,'#d9d9c7',1.1);
 else if(id==='boss')weapon=path(`M${wx-2} 63H${wx+3}V143L${wx} 147L${wx-3} 142Z`,mat(id,'leather'))+path(`M${wx-7} 25L${wx+13} 20L${wx+20} 39L${wx+17} 71L${wx-7} 79L${wx-12} 63Z`,metal(id))+line(`M${wx+12} 26L${wx+17} 40L${wx+14} 66L${wx-3} 72`,'#c7c9ba',1.2)+path(`M${wx-9} 43L${wx+7} 38L${wx+10} 57L${wx-7} 64Z`,mat(id,'iron'))+chain(wx-8,74,4);
 else if(id==='zombie')weapon=path(`M${wx-2} ${wy-5}L${wx+5} ${wy-35}L${wx+10} ${wy-33}L${wx+3} ${wy+4}L${wx-3} ${wy+8}Z`,mat(id,'leather'))+path(`M${wx+1} ${wy-35}L${wx+8} ${wy-45}L${wx+15} ${wy-39}L${wx+11} ${wy-28}Z`,metal(id))+line(`M${wx+4} ${wy-37}L${wx+10} ${wy-34}`,'#c1b99b',1);
 else weapon=path(`M${wx-3} ${wy-4}L${wx+1} ${wy-37}L${wx+7} ${wy-53}L${wx+11} ${wy-37}L${wx+4} ${wy-3}Z`,metal(id))+line(`M${wx+6} ${wy-42}L${wx} ${wy-8}`,'#d4d5bf',1)+path(`M${wx-10} ${wy-2}L${wx+11} ${wy-4}L${wx+12} ${wy+1}L${wx-9} ${wy+4}Z`,mat(id,'gold'))+path(`M${wx-3} ${wy+4}H${wx+3}V${wy+17}L${wx} ${wy+21}L${wx-4} ${wy+17}Z`,mat(id,'leather'));
 add('weapon',weapon,wx,wy,'frontForearm');
 if(id==='guard')add('shield',path('M18 84L41 74L63 82L62 118Q55 140 40 151Q23 136 18 117Z',mat(id,'gold'))+path('M23 88L41 80L58 86L57 117Q51 134 40 144Q28 132 23 115Z',mat(id,'iron'))+path('M38 85H44V136L40 141L37 133Z',metal(id))+line('M25 101L56 97M28 118L35 126M51 116L47 127','#b8a779',1.4)+rivets([[26,90],[54,89],[28,114],[53,112]]),...rearWrist,'rearForearm');
 if(id==='wraith')add('chains',chain(36,99,7)+chain(98,101,7)+line('M36 100Q25 119 39 132M98 101Q110 119 97 133','#a8b9bd',1),64,99,'body');
 add('head',commonHead(id),67,55,'body');
 return{width:128,height:160,footX:64,footY:150,parts};
}
function wolf():RigDefinition{
 const id='wolf',parts:RigPart[]=[],add=(part:string,body:string,x:number,y:number,parent?:string)=>parts.push(layer(id,part,body,x,y,parent));
 add('tail',path('M29 96Q12 91 4 107L10 114L8 124Q24 115 35 110Z',mat(id,'fur'))+line('M10 109L18 104L14 115','#99a48a',1),29,102,'body');
 for(const [name,hx,kx,foot,hy] of [['rearFar',37,29,27,107],['frontFar',87,83,86,107],['rearNear',45,42,37,109],['frontNear',97,96,99,106]] as const){
  add(`${name}Thigh`,segment(hx,hy,kx,129,5,3.7,mat(id,'fur'))+circle(kx,129,3.5,mat(id,'fur')),hx,hy);
  add(`${name}Shin`,segment(kx,129,foot,147,3.2,2.5,mat(id,'fur'))+path(`M${foot-4} 143L${foot+4} 144L${foot+8} 149L${foot+7} 153H${foot-6}Z`,mat(id,'fur'))+line(`M${foot+1} 148V151M${foot+4} 149V151`,'#b7bd9a',.7),kx,129,`${name}Thigh`);
 }
 add('body',path('M25 90L37 78L54 80L69 77L85 82L99 78L109 94L102 115L85 124L71 117L55 120L39 116L24 112Z',mat(id,'fur'))+path('M35 86L43 78L44 87L53 82L55 90L65 83L70 93L78 87L84 97L94 92L99 103L92 114L75 111L66 113L54 107L43 109Z','#64795e')+line('M35 100L43 98L40 104M56 93L64 96M73 106L81 109M54 114L61 113','#9eac86',1)+path('M84 83L92 72L98 78L107 80L109 98L101 114L94 107Z','#354c4b')+line('M87 88L97 100M91 84L102 96','#b5b494',.9),64,107);
 add('head',path('M92 80L91 64L100 69L109 64L114 78L121 82L125 91L122 100L110 101L100 97L93 91Z',mat(id,'fur'))+path('M98 79L105 74L114 80L119 89L111 95L101 91Z','#687c61')+path('M113 85L123 86L125 91L121 95L111 94Z','#8b9877')+path('M120 88L125 89L124 93L120 93Z','#1d2c33')+line('M102 81L109 80L110 83L103 84','#d5bd81',1.3)+line('M96 68L98 76M109 69L110 76M105 93L114 96L121 95','#243947',1)+path('M112 96L114 101L116 97M118 96L120 100L122 96','#d3ceb1','#6d776d',.65)+line('M96 87L99 93M101 89L104 96','#aa7c76',1),99,88,'body');
 return{width:128,height:160,footX:64,footY:150,parts};
}
const cache=new Map<string,RigDefinition>();
export function enemyRig(kind:string):RigDefinition{
 const id=kinds.includes(kind)?kind:'zombie';let rig=cache.get(id);if(!rig){rig=id==='wolf'?wolf():humanoid(id);cache.set(id,rig);}return rig;
}
const smooth=(p:number)=>{const x=Math.max(0,Math.min(1,p));return x*x*(3-2*x);};
function strike(phase:number):number{return phase<.24?-smooth(phase/.24)*.42:phase<.46?-.42+1.42*smooth((phase-.24)/.22):1-smooth((phase-.46)/.54);}
export function enemyRigMotion(kind:string,pose:RigPose,phase:number):RigTransform{
 const p=Math.max(0,Math.min(1,phase)),angle=p*Math.PI*2,s=Math.sin(angle),c=Math.cos(angle),result:RigTransform={parts:{}};
 const set=(part:string,a:number,x=0,y=0)=>{result.parts[part]={angle:a,x,y};};
 const ghost=kind==='wraith',caster=['priest','wraith','bishop'].includes(kind),heavy=['raider','guard','boss'].includes(kind);
 if(kind==='wolf'){
  if(pose==='move'){
   for(const [name,offset] of [['rearFar',.56],['frontFar',.12],['rearNear',0],['frontNear',.58]] as const){const q=Math.sin(angle+offset*Math.PI*2);set(`${name}Thigh`,q*22);set(`${name}Shin`,-q*13+Math.max(0,q)**2*30);}
   set('body',s*2,0,-(Math.sin(angle*2)**2)*2);set('head',-s*3);set('tail',-s*10);result.offsetY=-s*s*1.2;
  }else if(pose==='attack'||pose==='skill0'||pose==='skill1'){
   const k=strike(p);set('body',k*7,k*5,-Math.max(0,k)*2);set('head',-k*12);set('frontNearThigh',-k*24);set('frontNearShin',k*26);set('frontFarThigh',-k*18);set('frontFarShin',k*24);set('rearNearThigh',k*10);set('tail',k*9);
  }else if(pose==='hit'){const h=Math.sin(p*Math.PI);set('body',-h*7,-h*3);set('head',h*11);}
  else if(pose==='dead'){const h=smooth(p);set('body',h*13,0,h*7);for(const name of ['rearFar','frontFar','rearNear','frontNear']){set(`${name}Thigh`,-h*55);set(`${name}Shin`,h*55);}set('head',h*15);}
  else{set('body',s*.6,0,s*.5);set('head',s*1.3);set('tail',s*3);}
  return result;
 }
 if(pose==='move'){
  const stride=kind==='zombie'?12:kind==='fanatic'?20:kind==='bishop'?6:heavy?9:14;
  for(const [side,beat] of [['rear',s],['front',-s]] as const){set(`${side}Thigh`,beat*stride);set(`${side}Shin`,-beat*stride*.65+Math.max(0,beat)**2*18);}
  const sway=kind==='zombie'?s*3:kind==='fanatic'?5:ghost?0:heavy?1.5:0;
  set('body',sway,0,ghost?Math.sin(angle)*2:-s*s*1.4);set('head',-sway*.5+s*.7);set('cape',-s*3);
  set('rearUpperArm',ghost?-16+s*3:caster?s*3:heavy?-s*4:-s*8);set('rearForearm',caster?-15:Math.max(0,s)**2*8);
  set('frontUpperArm',kind==='crossbow'?s*2:caster?-s*2:heavy?s*3:s*8);set('frontForearm',kind==='crossbow'?-s*2:caster?-6:Math.max(0,-s)**2*8);
  if(kind==='zombie'){set('head',-4+s*3);set('frontForearm',-17+s*7);set('rearForearm',-8-c*6);}
  if(ghost){set('chains',s*5,0,-Math.sin(angle)*2);result.offsetY=-2+Math.sin(angle)*2;}
 }else if(pose==='attack'||pose==='skill0'||pose==='skill1'){
  const k=strike(p),lift=Math.sin(Math.PI*p);
  if(kind==='crossbow'){
   set('frontUpperArm',k*3);set('frontForearm',-k*6,k*-1,0);set('rearUpperArm',-lift*43);set('rearForearm',-lift*25);set('body',-k*2,k*-1.5,0);set('head',-k*2);
  }else if(caster){
   set('body',pose==='skill1'?-lift*3:k*2);set('frontUpperArm',pose==='skill1'?-lift*19:-lift*9);set('frontForearm',pose==='skill1'?-lift*19:-lift*13);
   set('rearUpperArm',-lift*(pose==='skill1'?77:44));set('rearForearm',lift*(pose==='skill1'?21:9));set('head',-lift*5);set('cape',lift*4);if(ghost)result.offsetY=-2-lift*3;
  }else if(kind==='guard'&&pose!=='attack'){
   set('body',k*7,k*3);set('rearUpperArm',-k*21);set('rearForearm',k*12);set('frontUpperArm',k*11);set('frontForearm',-k*13);set('frontThigh',-k*7);set('frontShin',k*8);
  }else{
   const range=kind==='boss'?42:kind==='raider'?45:kind==='fanatic'?39:29;
   set('frontUpperArm',k*range);set('frontForearm',k*(heavy?29:22));set('rearUpperArm',-k*(heavy?9:18));set('rearForearm',k*10);set('body',k*(heavy?4:6),k*1.7);set('head',-k*3);
   set('frontThigh',-k*5);set('frontShin',k*7);set('rearThigh',k*4);set('cape',k*5);
   if(pose==='skill1'){set('frontUpperArm',k*(range+12));set('frontForearm',k*34);set('body',k*7,k*2,-lift);}
  }
 }else if(pose==='hit'){
  const h=Math.sin(Math.PI*p);set('body',-h*7,-h*2.3);set('head',-h*6);set('frontUpperArm',h*8);set('rearUpperArm',-h*7);set('frontForearm',h*8);
 }else if(pose==='dead'){
  const h=smooth(p);set('body',h*65,-h*10,h*10);set('head',h*12);set('frontUpperArm',-h*31);set('frontForearm',h*34);set('rearUpperArm',h*22);set('rearForearm',h*25);set('rearThigh',h*42);set('rearShin',-h*49);set('frontThigh',-h*29);set('frontShin',h*57);set('cape',h*37);result.offsetY=h*3;
 }else{
  const breathing=Math.sin(angle),lean=kind==='zombie'?5:kind==='fanatic'?4:kind==='boss'?-1:0;
  set('body',lean+breathing*.5,0,breathing*.35);set('head',-lean*.45-breathing*.6);set('frontUpperArm',caster?-4+breathing:breathing*.7);set('frontForearm',caster?-3:0);set('rearUpperArm',ghost?-17+breathing*2:kind==='zombie'?-5:0);set('rearForearm',ghost?-18:kind==='zombie'?-11:0);set('cape',breathing*.8);
  if(ghost){result.offsetY=-2+breathing*1.4;set('chains',-breathing*2);}
 }
 return result;
}
/** Static reference is composed from the exact same rig and neutral motion as runtime. */
export function enemySvg(kind:string):string{
 const id=kinds.includes(kind)?kind:'zombie',rig=enemyRig(id),motion=enemyRigMotion(id,'idle',0);
 const body=(part:RigPart):string=>part.svg.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'').replace(/<defs>[\s\S]*?<\/defs>/,'');
 const node=(part:RigPart,parent?:RigPart):string=>{const t=motion.parts[part.id]??{},x=part.pivotX-(parent?.pivotX??0)+(t.x??0),y=part.pivotY-(parent?.pivotY??0)+(t.y??0);return `<g data-part="${part.id}" transform="translate(${x} ${y}) rotate(${t.angle??0})"><g transform="translate(${-part.pivotX} ${-part.pivotY})">${body(part)}</g>${rig.parts.filter(p=>p.parent===part.id).map(p=>node(p,part)).join('')}</g>`;};
 return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="160" viewBox="0 0 128 160" data-enemy="${id}" data-revision="v005">${defs(id)}<g transform="translate(${motion.offsetX??0} ${motion.offsetY??0}) rotate(${motion.rotation??0} 64 150)">${rig.parts.filter(p=>!p.parent).map(p=>node(p)).join('')}</g></svg>`;
}
