/** Original, editable relief atlas. All landmarks and paths share this coordinate space. */
export const CHAPTER_MAP={width:3000,height:680} as const;
export const CHAPTER_POINTS=[
 {x:150,y:450},{x:450,y:390},{x:750,y:460},{x:1050,y:365},{x:1350,y:435},
 {x:1650,y:360},{x:1950,y:465},{x:2250,y:380},{x:2550,y:445},{x:2850,y:350}
];
const routeD=(a:{x:number;y:number},b:{x:number;y:number})=>`M${a.x} ${a.y}C${a.x+135} ${a.y} ${b.x-135} ${b.y} ${b.x} ${b.y}`;
export function chapterRouteSvg(unlocked:number):string{
 return `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 ${CHAPTER_MAP.width} ${CHAPTER_MAP.height}" aria-hidden="true">${CHAPTER_POINTS.slice(1).map((p,i)=>{const d=routeD(CHAPTER_POINTS[i],p);return `<path d="${d}" fill="none" stroke="#070e16" stroke-width="12" stroke-linecap="round" opacity=".82"/><path d="${d}" fill="none" stroke="${i+1<unlocked?'#d0b57b':'#74818a'}" stroke-width="3.3" stroke-linecap="round" stroke-dasharray="${i+1<unlocked?'0':'5 10'}" opacity="${i+1<unlocked?.94:.55}"/>`;}).join('')}</svg>`;
}

const p=(d:string,fill:string,stroke='#243540',width=1)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;
const l=(d:string,stroke='#a7b1ac',width=1,opacity=1)=>`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" opacity="${opacity}" stroke-linejoin="round" stroke-linecap="round"/>`;
const group=(x:number,y:number,body:string,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})">${body}</g>`;
const shadow=(x:number,y:number,rx:number,ry:number)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#040c13" opacity=".38"/>`;
function block(x:number,y:number,w:number,h:number,depth=18,front='url(#a-wall)',side='url(#a-wall-side)',top='#6b7777'):string{
 return p(`M${x} ${y}l${depth}-${depth*.52}h${w}l-${depth} ${depth*.52}Z`,top,'#a6afa6',.8)+p(`M${x+w} ${y}l${depth}-${depth*.52}v${h}l-${depth} ${depth*.52}Z`,side,'#293d49',1)+p(`M${x} ${y}h${w}v${h}h-${w}Z`,front,'#7b898b',1);
}
function windowArch(x:number,y:number,w=12,h=25,lit=false):string{
 return p(`M${x} ${y+h}V${y+w*.5}Q${x+w*.5} ${y-w*.65} ${x+w} ${y+w*.5}V${y+h}Z`,lit?'url(#a-candle)':'#0a1925','#ada98a',.8)+l(`M${x+w*.5} ${y+3}V${y+h}M${x+1} ${y+h*.58}H${x+w-1}`,'#45565f',.8);
}
function roof(x:number,y:number,w:number,h:number,depth=23,red=false):string{
 const color=red?'url(#a-red-roof)':'url(#a-roof)';
 return p(`M${x-8} ${y}L${x+w*.5} ${y-h}L${x+w+8} ${y}Z`,color,'#a5ad9e',1.2)+p(`M${x+w*.5} ${y-h}l${depth}-${depth*.5}L${x+w+depth+8} ${y-depth*.5}L${x+w+8} ${y}Z`,red?'#472a36':'#223847','#5a7180',.9)+l(`M${x-6} ${y-1}L${x+w*.5} ${y-h+3}L${x+w+6} ${y-1}`,'#d4bd8b',1.6,.65)+l(`M${x+w*.2} ${y-10}L${x+w*.5} ${y-h+9}M${x+w*.36} ${y-4}L${x+w*.61} ${y-h+14}`,'#738d9a',1,.55);
}
function terrace(x:number,y:number,rx:number,ry:number):string{
 return shadow(x+17,y+12,rx+11,ry+4)+`<ellipse cx="${x}" cy="${y+9}" rx="${rx}" ry="${ry}" fill="#1a2b35" stroke="#263e48"/>`+`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#a-stone-pad)" stroke="#7a8580" stroke-width="1.1"/>`+l(`M${x-rx*.65} ${y+ry*.65}Q${x} ${y+ry*1.3} ${x+rx*.7} ${y+ry*.55}`,'#87948d',1,.4);
}
function ashVillage():string{
 let s=terrace(0,26,110,36);
 s+=block(-73,-42,61,69,18,'url(#a-burn-wall)');s+=roof(-73,-42,61,39,18,true);
 s+=p('M-62-40L-50-66L-42-59L-45-44Z','#0a1821','#111e28',.8)+p('M-66 22V-9L-53-15L-42-9V22Z','#07131c','#6c655b',1);
 s+=l('M-70-25H-17M-70-10H-17M-39-39V23M-72 10L-19-19','#444f4e',2,.85);
 s+=block(-5,-7,54,49,19,'#5c5c50');s+=roof(-5,-7,54,31,19);
 s+=windowArch(8,4,11,21,true)+p('M31 41V18H45V41Z','#0b1b25','#a19574',1);
 s+=p('M43-58L61-65L77-55V-10H43Z','#35444a','#7d8884',1)+p('M40-57L59-83L81-55Z','#172a34','#8b8e79',1.2);
 s+=l('M51-48V-22M66-49V-24M48-15H72','#e1b97b',2,.5);
 s+=p('M-99 31l14-12l17 6l-6 10Z','#7b6a56','#2c3539',1)+p('M64 36l24-8l14 12l-21 5Z','#39484a','#748280',.8);
 s+=l('M-36-75Q-55-104-27-118Q-11-128-25-145M-32-87Q-11-108-20-120','#8d9c96',8,.08);
 s+=l('M-13 51l22-8M-35 46l16-9M52 51l13-4','#b8a07a',1,.35);
 return group(150,320,s);
}
function prisonCart():string{
 let s=terrace(4,21,112,34);
 s+=p('M-76 5L-57-3L65 0L89 17L64 28L-64 22Z','#263e43','#7b8b81',1.2);
 s+=block(-60,-55,110,57,26,'#4a534c','#25393c','#58665c');
 s+=p('M-69-54L-49-73L58-71L83-58L52-43L-59-42Z','url(#a-green-roof)','#8c9986',1);
 s+=p('M-48-47H37V-3H-48Z','#0b1c23','#a49f7a',1.2);
 for(let x=-40;x<37;x+=14)s+=l(`M${x}-45V-5`,'#9ea58d',2.4,.85);
 s+=l('M-46-25H36M-46-8H36','#687d75',2);
 s+=p('M50-44l25-11v47L50 3Z','#10272b','#9da487',1);
 s+=l('M58-45V-6M66-49V-11','#839787',2);
 for(const x of [-37,43])s+=`<ellipse cx="${x}" cy="22" rx="18" ry="21" fill="#122731" stroke="#9c9976" stroke-width="3"/>`+l(`M${x} 3V41M${x-15} 21H${x+15}M${x-11} 8L${x+11} 35M${x-11} 35L${x+11} 8`,'#716e59',2);
 s+=l('M61 12L109 19L121 13M108 19L121 31','#7a806a',4);
 s+=p('M-17-28Q-3-40 10-28V-6H-17Z','#62848a','#1c3541',1)+`<circle cx="-4" cy="-34" r="6" fill="#a6aaa0"/>`;
 s+=l('M-112 25Q-73 5-35 13T72 20T125 8','#b7d1c6',12,.07);
 s+=p('M-89 2L-86-39L-75-42L-72 0Z','#263d3f','#74857b',1)+l('M-80-38V-60M-82-54L-94-61M-81-48L-69-56','#8c9d8a',2);
 return group(450,271,s);
}
function blackKeep():string{
 let s=terrace(0,26,117,40);
 s+=p('M-106 5L-74-18L76-22L114 4L99 44L-88 47Z','#2a3e46','#75858a',1.3);
 s+=block(-71,-72,126,94,29);
 s+=block(-98,-93,35,109,18,'#4f626b');s+=block(46,-107,35,128,21,'#425865');
 s+=p('M-102-96V-111H-91V-100H-81V-111H-69V-97ZM43-110V-124H54V-113H65V-124H84V-110Z','#6c797a','#b0b7a6',1);
 s+=p('M-27 23V-23Q0-66 27-23V23Z','#071520','#b1a679',1.5);
 s+=l('M-18-22V20M-7-33V20M7-33V20M18-22V20M-22-7H23','#4d5f65',2);
 s+=windowArch(-88,-73,11,28,true)+windowArch(59,-87,11,31,true)+windowArch(-50,-51,12,27);
 s+=p('M-64-74V-88H-49V-78H-34V-88H-19V-78H-4V-88H11V-78H27V-88H42V-74Z','#60737a','#a2aaa2',1);
 s+=l('M-94-39H-67M-67-18H-31M34-37H57M49-50H82M-64-57H-48','#9cacaa',1,.55);
 s+=p('M67-126V-171L104-159L67-144Z','#7a3c49','#ccb179',1)+l('M67-171V-119','#d1bc8a',2);
 s+=p('M-117 42l26-5l11 17l-39 3ZM92 49l18-4l14 11l-31 7Z','#273c46','#6e8188',1);
 return group(750,313,s);
}
function pilgrimBridge():string{
 let s=shadow(15,44,123,30);
 s+=p('M-128 15Q-50-34 115 5L130 28Q13 1-113 45Z','#244858','#7599a0',1);
 s+=l('M-120 35Q-15-5 121 20M-109 46Q-3 12 112 35','#7ba6ad',2,.25);
 s+=p('M-111-4L-86-18L103-4L117 15L92 31L-102 13Z','#82928b','#b6b5a0',1.1);
 s+=p('M-102 13L92 31V62L66 54V38Q45 21 25 39V53L-10 51V31Q-31 14-53 31V49L-84 43V25Z','url(#a-wall-side)','#708183',1.1);
 s+=l('M-96 2L93 19M-82-11L-84 39M-12-6V17M51-3V21','#c1c3ab',1,.7);
 s+=block(-68,-86,25,70,15,'#627577');s+=block(43,-76,25,71,15,'#627577');
 s+=p('M-72-83Q-10-170 74-69L62-62Q-9-140-59-76Z','url(#a-wall)','#acb9ae',1.2);
 s+=l('M-57-97L-49-86M-30-122L-25-108M3-124V-110M31-113L24-102M54-94L44-85','#314b58',2,.8);
 s+=p('M-19-134L-2-146L15-134L9-116H-12Z','#9a9e88','#d1c19a',1);
 s+=l('M-3-139V-122M-10-132H6','#455866',1.5);
 s+=p('M85-8l16-35l-2-28l9-12l11 15l-4 24l10 39Z','#51676b','#8c9c95',1)+`<circle cx="107" cy="-91" r="8" fill="#82928d" stroke="#bac2ae"/>`;
 s+=l('M102-66L96-49L116-47M107-82V-68','#aab5a5',1.3);
 return group(1050,248,s);
}
function cloister():string{
 let s=terrace(0,30,127,43);
 s+=block(-100,-55,143,44,28,'#5d6e6b','#2d414c','#84938b');s+=roof(-100,-55,143,36,28);
 s+=block(-100,-12,31,66,22,'#5c716f');s+=roof(-100,-12,31,20,22);
 s+=block(45,-10,31,66,22,'#4c6468');s+=roof(45,-10,31,20,22);
 s+=p('M-68-6L44-1L73 17L-43 14Z','#7e8b7e','#abb19d',1);
 s+=p('M-65 4L42 10L44 45L-64 39Z','#233d43','#536e70',1);
 for(const x of [-85,-57,-29,-1,27])s+=windowArch(x,-45,15,29,x===-29);
 for(const x of [-92,53])s+=windowArch(x,10,14,31,true);
 s+=p('M-58 45L36 50L64 35L-33 30Z','#778c7c','#a4ac91',.9)+p('M-43 35L-18 19L16 22L32 41L5 53Z','#304d45','#6c8e72',1);
 s+=`<ellipse cx="-4" cy="34" rx="23" ry="10" fill="#8d9c86" stroke="#bfbaa0"/><ellipse cx="-4" cy="32" rx="18" ry="7" fill="#315259"/>`+p('M-10 30V7H2V31Z','#a3ab8e','#d4c7a0',.8);
 s+=p('M-17 7L-3-5L9 7L-3 14Z','#adab89','#d3c397',.8);
 s+=l('M-116 40l14-3M83 48l18-4M-109 51l22-1','#a0aa91',1,.45);
 return group(1350,292,s);
}
function bellTower():string{
 let s=terrace(0,28,103,34);
 s+=block(-43,-119,71,141,25,'#5e7178','#253e50','#8b9996');
 s+=p('M-52-120L-9-192L38-119Z','url(#a-roof)','#b1b3a2',1.3)+p('M-9-192L12-203L62-130L38-119Z','#203a4f','#6b8695',1);
 s+=l('M-9-190V-218M-18-209H0','#cbb889',2);
 s+=block(-48,-96,81,7,26,'#919e98','#40566b','#b4baa7');
 s+=p('M-31-101V-133Q-8-168 15-133V-101Z','#0b1c2a','#b8b9a1',1.2);
 s+=p('M-23-112Q-27-137-8-141Q11-137 7-112L15-106H-31Z','url(#a-brass)','#d4bf87',1.2)+l('M-9-141V-147M-12-103V-96','#c7b07c',2);
 s+=`<ellipse cx="-8" cy="-55" rx="22" ry="25" fill="#213945" stroke="#c3b688" stroke-width="2"/><ellipse cx="-8" cy="-55" rx="17" ry="20" fill="#3d5054" stroke="#6f8585"/>`+l('M-8-74V-54L3-47M-24-55H-20M5-55H9M-8-38V-34','#d1c395',1.7);
 s+=windowArch(-20,-14,21,34,true)+l('M-36-83H27M-36-28H27M34-114V16','#a4b3ad',1,.55);
 s+=p('M-80 20L-52 10L-42 22L-64 34ZM37 20L73 4L88 16L58 37Z','#4c6063','#8c9a90',1);
 s+=l('M-64 17L43 29M-48 25L61 13','#625743',2,.65);
 return group(1650,278,s);
}
function cryptGate():string{
 let s=terrace(0,36,123,38);
 s+=p('M-124 33L-111-40L-83-65L-44-76L-7-112L40-88L77-53L112-19L128 31L88 49Z','url(#a-crypt-rock)','#6f8189',1.1);
 s+=p('M-112-8L-80-52L-51-53L-61-21L-96 24Z','#405560','#647782',.8)+p('M-7-110L14-59L60-24L40-88Z','#64757c','#7f8d8f',.8)+p('M59-62L75-8L115 22L108-19Z','#1b3342','#465e6b',.8);
 s+=p('M-62 40V-17Q-3-121 57-17V40Z','#718085','#b6b9a6',1.4)+p('M-43 40V-11Q-3-83 38-11V40Z','#081521','#3f5a69',3);
 s+=l('M-55-11L-43-6M-42-39L-31-30M-20-60L-17-46M4-65V-49M26-54L22-39M45-34L34-26M53-10L39-5','#354e5d',2);
 s+=p('M-20-81Q-2-100 16-81L14-63L4-55H-10L-20-65Z','#b0b5a1','#d2ccb0',1)+p('M-14-80L-5-82L-6-73L-14-72ZM2-82L11-80L11-72L3-73Z','#304451','#3d4d53',.7)+l('M-5-65H6M0-72L-2-68H2','#5b6a6a',1);
 s+=p('M-34 44L29 44L47 59L-50 59Z','#586e75','#9ba7a1',1)+l('M-45 54H41M-33 48H29','#243d4a',1.5);
 s+=l('M-92 33l10-22l-3-25M-81 12l19-7M87 40L78 17L86-3','#82928c',2,.75);
 s+=`<circle cx="-56" cy="18" r="4" fill="#a8cbd0" opacity=".5"/><circle cx="48" cy="20" r="4" fill="#a8cbd0" opacity=".5"/>`;
 return group(1950,300,s);
}
function altar():string{
 let s=terrace(0,37,120,35);
 s+=p('M-89 11L-22-23L77 4L96 34L26 69L-74 43Z','#465b65','#a0aea9',1.3)+p('M-74 43L26 69L96 34V49L27 84L-74 57Z','#1e3543','#5e7681',1);
 s+=p('M-76 12L-21-15L66 9L78 30L23 56L-62 34Z','#647779','#bdbea5',1)+`<ellipse cy="19" rx="51" ry="24" fill="#25394a" stroke="#ac91a0" stroke-width="1.4"/><ellipse cy="19" rx="38" ry="16" fill="#372d45" stroke="#b287a0" stroke-width=".8"/>`;
 s+=l('M-35 10L25 29L-20 34L19 3L6 39Z','#cf9cad',1.4,.85);
 for(const [x,y,h] of [[-80,-14,79],[62,-6,105],[-42,-43,56]] as number[][]){s+=block(x,y-h,13,h,12,'#4a5868','#1d3143','#a5aaa1');s+=p(`M${x-4} ${y-h}L${x+7} ${y-h-24}L${x+17} ${y-h}Z`,'#53596e','#b19fa5',1);s+=l(`M${x+5} ${y-h+14}v20`,'#c18da4',1.3,.75);}
 s+=p('M-9 4L-17-25L0-63L18-27L10 4Z','url(#a-crystal)','#d8b2c1',1.3)+l('M0-57L-4-24L1-3M-12-27L1-18L14-27','#e9cad4',1.2,.8);
 s+=`<ellipse cy="-18" rx="37" ry="58" fill="url(#a-violet-glow)"/>`;
 s+=l('M-104 40Q-55 25-41 51M48 57Q72 36 106 36','#9695a4',2,.35);
 return group(2250,253,s);
}
function dawnCourt():string{
 let s=terrace(0,35,128,43);
 s+=p('M-107 13L-33-20L92 12L115 40L40 72L-88 45Z','#6b7b77','#b1b69d',1)+p('M-88 45L40 72L115 40V48L41 82L-88 55Z','#344c50','#6b8382',1);
 s+=p('M-77 18L-28-6L68 18L80 39L32 58L-63 36Z','#405d5e','#9cae9e',1)+l('M-56 15L43 44M-29 3L67 31M-60 35L2 3M-20 47L40 16','#9eab93',1,.55);
 s+=`<ellipse cx="0" cy="25" rx="41" ry="17" fill="#95a18c" stroke="#d0c5a2" stroke-width="1.2"/><ellipse cx="0" cy="23" rx="32" ry="12" fill="#31575d" stroke="#7ca09b"/>`;
 s+=p('M-9 23V-17H9V23Z','url(#a-wall)','#c0c5aa',1)+`<ellipse cy="-18" rx="25" ry="9" fill="#98a792" stroke="#d6ca9d"/>`+p('M-5-19L-12-44L0-58L13-44L6-19Z','#c2ba91','#e0d1a3',1);
 s+=l('M-10-38Q-28-7-25 18M11-38Q29-7 25 18','#adcfd1',1.3,.65);
 s+=block(-103,-58,17,74,13,'#82938a');s+=block(82,-42,17,75,13,'#697f7a');
 s+=p('M-108-58h28v-8h-28ZM77-42h28v-8H77Z','#acb59a','#d2c69e',1)+l('M-98-50V8M87-35V27','#bec7af',1.4,.6);
 s+=p('M-114-2Q-130-18-117-36Q-97-25-107-9Z','#526f57','#8ca57d',.9)+p('M106 11Q123-7 116-24Q97-20 102 5Z','#526f57','#8ca57d',.9);
 s+=l('M-111-34L-112 5M112-22L108 16','#b9ac82',1,.65);
 return group(2550,288,s);
}
function cathedral():string{
 let s=terrace(0,51,136,48);
 s+=p('M-126 32L-78 6L99 7L133 37L108 69L-99 74Z','#253744','#7d8a8d',1.2);
 s+=block(-83,-75,145,118,29,'url(#a-cathedral-wall)','#19293d','#657582');
 s+=block(-109,-116,35,145,20,'#3d4a62','#152438','#748092');s+=block(65,-130,35,164,21,'#344159','#122034','#68768a');
 s+=p('M-116-116L-91-192L-67-116Z','url(#a-slate-violet)','#a6a2b3',1.1)+p('M59-130L83-213L109-130Z','url(#a-slate-violet)','#a6a2b3',1.1);
 s+=p('M-91-191L-78-197L-51-126L-67-116Z','#15283c','#4e6174',.8)+p('M83-212L97-218L129-141L109-130Z','#102137','#4b5a72',.8);
 s+=p('M-90-76L-11-155L70-76Z','url(#a-slate-violet)','#b1a5a7',1.4)+p('M-11-155L12-170L94-91L70-76Z','#1c2b43','#657187',1);
 s+=p('M-69 42V-73L-9-131L49-73V42Z','url(#a-cathedral-wall)','#a5aaa4',1.3);
 s+=`<ellipse cx="-8" cy="-69" rx="24" ry="26" fill="#7a4d69" stroke="#c7af97" stroke-width="2"/><ellipse cx="-8" cy="-69" rx="17" ry="19" fill="#b17c9a" opacity=".5"/>`+l('M-8-94V-44M-31-69H15M-25-87L10-51M-26-51L10-87','#d1b593',1.4,.85);
 s+=p('M-33 42V-5Q-8-44 17-5V42Z','#081324','#ac9da0',2)+l('M-26-4L-8-28L10-4M-17 0V38M-2-9V38','#705b73',1.6,.8);
 for(const [x,y] of [[-101,-93],[74,-106],[-57,-24],[30,-24]])s+=windowArch(x,y,14,37,true);
 s+=l('M-91-198V-224M-99-214H-83M84-219V-244M76-234H92M-9-155V-180M-18-170H0','#b6aa8d',2,.85);
 s+=p('M-41 48L21 48L44 64L-62 64Z','#536472','#a3acaa',1)+l('M-56 60H38M-45 54H27','#213747',1.5);
 s+=p('M-125 19L-135-25L-126-49L-118-30L-118 23ZM115 27L110-20L119-48L128-23L126 26Z','#304453','#7e8b8b',1);
 return group(2840,264,s);
}

/** Several authored tree silhouettes and irregular groups replace the former stamp grid. */
function tree(x:number,y:number,s:number,type:number):string{
 let art=shadow(6,14,21,7);
 if(type===0){
  art+=p('M-4 15L-2-37H3L6 15Z','#463f38','#263439',.8)+l('M0-36L-14-52M1-23L20-44M0-9L-17-26M-11-47L-8-63M12-36L24-35','#857b64',2);
 }else if(type===1){
  art+=p('M-3 16V-26H4V16Z','#51483d','#273a3b',.8)+p('M-2-72L-17-51L-11-47L-27-25L-17-23L-34-3L-6-1L0 8L10-2L30-5L18-23L23-26L11-43L15-46Z','url(#a-pine)','#5a7972',.9)+l('M-2-63L1-4M-9-32L-21-17M4-38L15-26','#8b9f85',1,.35);
 }else if(type===2){
  art+=p('M-5 17L-2-30H4L8 17Z','#595345','#263c3e',1)+p('M-5-60Q-28-70-31-45Q-50-35-32-18Q-39 4-15 3Q3 21 17 3Q44 8 39-17Q54-39 30-45Q25-71 6-60Z','url(#a-canopy)','#56786c',.9)+p('M-21-44Q-5-60 13-47Q32-44 28-25Q7-36-9-23Q-28-26-21-44Z','#547e68','#3c6558',.5)+l('M-1-23L0 8M-11-5L-3-10M6-5L14-13','#8fa58a',1,.38);
 }else{
  art+=p('M-5 16L-3-30H2L6 16Z','#495343','#263c3c',.8)+p('M-1-84Q-20-65-15-49Q-31-23-17-5Q-17 14 2 12Q24 15 19-8Q33-30 16-50Q15-72-1-84Z','url(#a-cypress)','#607d74',.8)+l('M-1-71V4M-8-42L-3-30M5-27L1-13','#96a98f',1,.28);
 }
 return group(x,y,art,s);
}
function vegetation():string{
 const placements:[number,number,number,number][]=[
  [39,269,.78,0],[88,217,.7,0],[225,276,.62,0],[270,190,.7,0],[311,238,.82,2],[352,171,.7,1],
  [392,217,.89,1],[435,164,.86,2],[482,178,.7,3],[520,225,.8,1],[562,176,.72,2],[599,225,.9,3],
  [334,287,.62,2],[365,256,.67,3],[538,280,.64,2],[620,302,.66,1],[646,238,.7,3],
  [857,267,.56,0],[883,221,.6,0],[942,171,.58,1],[1167,256,.72,3],[1201,207,.66,2],
  [1244,156,.76,3],[1489,216,.71,2],[1512,176,.55,3],[1560,196,.74,3],[1724,196,.5,0],
  [1818,280,.69,0],[1855,206,.54,0],[2071,248,.64,0],[2134,181,.77,3],[2180,215,.55,0],
  [2368,239,.61,3],[2430,180,.69,2],[2474,191,.6,3],[2624,242,.58,2],[2682,196,.7,0],
  [2915,306,.52,0],[2953,252,.59,0]
 ];
 return placements.sort((a,b)=>a[1]-b[1]).map(([x,y,s,t])=>tree(x,y,s,t)).join('');
}
function distantRidges():string{
 const ridgeShapes=[
  'M0 84L26 61L44 64L77 16L95 37L114 27L140 52L160 45L190 83Z',
  'M0 78L31 51L51 57L76 40L94 5L115 34L134 31L171 62L196 57L222 87Z',
  'M0 85L30 68L54 28L74 45L96 37L118 20L144 48L163 40L196 83Z',
  'M0 82L20 45L38 54L70 20L86 26L108 9L129 38L146 33L176 60L201 62L218 88Z'
 ];
 const placements=[[17,77,1.18,0],[315,51,1.25,1],[686,78,1.1,2],[1000,40,1.24,3],[1362,66,1.23,0],[1740,51,1.25,2],[2100,44,1.12,1],[2452,54,1.18,3],[2747,25,1.13,2]];
 return placements.map(([x,y,s,n])=>group(x,y,p(ridgeShapes[n],'url(#a-ridge)','#536a76',.7)+p(n===1?'M94 5L91 70L52 86L76 40Z':'M77 16L86 63L144 84L114 27L95 37Z','#405765','#324c5b',.6)+l(n===2?'M54 28L72 61L98 58L118 20M72 61L58 83':'M77 16L66 51L44 64M95 37L104 70L140 82','#9aa9a7',1,.24),s)).join('');
}
function ground():string{
 let stones='';
 for(let i=0;i<85;i++){
  const x=35+(i*337)%2940,y=210+(i*83)%320;
  if(CHAPTER_POINTS.some(q=>Math.hypot(q.x-x,(q.y-y)*1.4)<75))continue;
  const w=5+i%7;stones+=p(`M${x} ${y}l${w}-3l${w*.6} 4l-${w} 3Z`,i%3===0?'#7b7b66':'#425b60','#293f49',.5);
 }
 let strata='';
 for(let i=0;i<26;i++){const x=28+i*116,y=547+Math.sin(i*.8)*14;strata+=p(`M${x} ${y}l42-8l38 15l-9 46l-28 17l-40-13Z`,i%3===0?'#233b47':'#19323f','#314d59',.6)+l(`M${x+12} ${y+21}l43 4M${x+16} ${y+38}l25 5`,'#68818a',.8,.24);}
 const earth='M-10 208Q153 179 271 212T529 195T789 211T1024 180T1260 210T1520 187T1787 205T2034 178T2290 203T2565 174T3010 184V543Q2810 591 2630 552T2325 566T2020 553T1720 576T1410 552T1110 575T800 550T500 575T190 553L-10 574Z';
 return p('M-10 249H3010V607Q2810 642 2630 608T2325 618T2020 613T1720 628T1410 610T1110 626T800 604T500 625T190 609L-10 631Z','#102633','#2c4653',1)+strata+p(earth,'url(#a-earth)','#7c8e88',1.1)+l('M24 543Q200 528 337 553T629 544T932 551T1211 547T1517 549T1810 551T2119 547T2412 551T2700 544T2973 533','#9b9c82',1.5,.36)+stones;
}
function river():string{
 const d='M292-15C280 44 744 69 861 161S1117 156 1199 206S1140 278 1073 318S970 393 1009 466S1122 517 1159 632';
 return `<path d="${d}" fill="none" stroke="#0c1c27" stroke-width="52" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#345d6a" stroke-width="35" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#71999c" stroke-width="1.2" opacity=".6"/>`+l('M875 171Q924 194 972 188M1067 328Q1020 360 1008 390M1029 480Q1051 505 1080 513M1136 568L1148 591','#adc1b1',2,.33);
}
function foreground():string{
 let s='';
 for(const [x,y] of [[85,587],[340,604],[680,575],[1470,601],[1800,580],[2105,607],[2370,579],[2737,598]]){
  s+=p(`M${x} ${y}l13-15l23 4l9 14l-17 7Z`,'#18313e','#516b75',.8)+l(`M${x+5} ${y-1}l12-7l18 2`,'#82918b',.9,.3);
 }
 s+=l('M1220 558Q1280 532 1330 557M1500 578Q1550 548 1600 564M2284 550Q2326 528 2388 550','#b4beb2',13,.035);
 return s;
}
function defs():string{
 return `<defs>
 <linearGradient id="a-sky" x2="0" y2="1"><stop stop-color="#101d2b"/><stop offset=".6" stop-color="#17303b"/><stop offset="1" stop-color="#07131f"/></linearGradient>
 <radialGradient id="a-vignette"><stop stop-color="#294653" stop-opacity="0"/><stop offset=".78" stop-color="#07141f" stop-opacity=".08"/><stop offset="1" stop-color="#020b16" stop-opacity=".65"/></radialGradient>
 <linearGradient id="a-earth" x1="0" y1="0" x2=".95" y2=".9"><stop stop-color="#425c59"/><stop offset=".25" stop-color="#2c4a48"/><stop offset=".52" stop-color="#354b4d"/><stop offset=".78" stop-color="#303e4b"/><stop offset="1" stop-color="#242d43"/></linearGradient>
 <linearGradient id="a-ridge" x2=".8" y2="1"><stop stop-color="#485d6b"/><stop offset=".5" stop-color="#263f50"/><stop offset="1" stop-color="#162d3c"/></linearGradient>
 <linearGradient id="a-wall" x2=".8" y2="1"><stop stop-color="#9aa79c"/><stop offset=".35" stop-color="#677d7d"/><stop offset="1" stop-color="#3a5661"/></linearGradient>
 <linearGradient id="a-wall-side" x2="1" y2="1"><stop stop-color="#455f6d"/><stop offset="1" stop-color="#203b4c"/></linearGradient>
 <linearGradient id="a-roof" x2=".7" y2="1"><stop stop-color="#7c939a"/><stop offset=".45" stop-color="#466976"/><stop offset="1" stop-color="#233e50"/></linearGradient>
 <linearGradient id="a-red-roof" x2=".9" y2="1"><stop stop-color="#97755f"/><stop offset=".4" stop-color="#6d494b"/><stop offset="1" stop-color="#372c3a"/></linearGradient>
 <linearGradient id="a-green-roof" x2=".6" y2="1"><stop stop-color="#7f9b83"/><stop offset=".5" stop-color="#4d7165"/><stop offset="1" stop-color="#253f40"/></linearGradient>
 <linearGradient id="a-burn-wall" x2=".8" y2="1"><stop stop-color="#7d7967"/><stop offset=".4" stop-color="#4d554e"/><stop offset="1" stop-color="#273d43"/></linearGradient>
 <linearGradient id="a-stone-pad" x2=".75" y2="1"><stop stop-color="#647875"/><stop offset=".5" stop-color="#3d5558"/><stop offset="1" stop-color="#2a424e"/></linearGradient>
 <linearGradient id="a-pine" x2=".9" y2=".7"><stop stop-color="#648576"/><stop offset=".4" stop-color="#375d52"/><stop offset="1" stop-color="#203f42"/></linearGradient>
 <linearGradient id="a-canopy" x2=".8" y2=".9"><stop stop-color="#668969"/><stop offset=".4" stop-color="#3f6a57"/><stop offset="1" stop-color="#203e3e"/></linearGradient>
 <linearGradient id="a-cypress" x2="1" y2=".4"><stop stop-color="#628373"/><stop offset=".4" stop-color="#3a5c52"/><stop offset="1" stop-color="#1d3d3f"/></linearGradient>
 <linearGradient id="a-candle" x2=".3" y2="1"><stop stop-color="#f5d89a"/><stop offset=".4" stop-color="#d7ae69"/><stop offset="1" stop-color="#735343"/></linearGradient>
 <linearGradient id="a-brass" x2="1" y2=".7"><stop stop-color="#e5ce8f"/><stop offset=".5" stop-color="#b5985e"/><stop offset="1" stop-color="#6b694e"/></linearGradient>
 <linearGradient id="a-crypt-rock" x2="1" y2=".8"><stop stop-color="#536972"/><stop offset=".45" stop-color="#354e5d"/><stop offset="1" stop-color="#1a3043"/></linearGradient>
 <linearGradient id="a-crystal" x2="1" y2=".6"><stop stop-color="#e0bbcf"/><stop offset=".36" stop-color="#ac789e"/><stop offset=".42" stop-color="#765b89"/><stop offset="1" stop-color="#303554"/></linearGradient>
 <radialGradient id="a-violet-glow"><stop stop-color="#b58db9" stop-opacity=".24"/><stop offset="1" stop-color="#ad82ae" stop-opacity="0"/></radialGradient>
 <linearGradient id="a-cathedral-wall" x2=".8" y2="1"><stop stop-color="#7a8090"/><stop offset=".4" stop-color="#49586f"/><stop offset="1" stop-color="#24364e"/></linearGradient>
 <linearGradient id="a-slate-violet" x2=".9" y2=".9"><stop stop-color="#928ca0"/><stop offset=".4" stop-color="#586580"/><stop offset="1" stop-color="#23344d"/></linearGradient>
 </defs>`;
}
let cachedAtlas='';
export function chapterAtlasSvg():string{
 if(cachedAtlas)return cachedAtlas;
 const routeBed=CHAPTER_POINTS.slice(1).map((q,i)=>`<path d="${routeD(CHAPTER_POINTS[i],q)}" fill="none" stroke="#839084" stroke-width="38" opacity=".16" stroke-linecap="round"/>`).join('');
 const platforms=CHAPTER_POINTS.map(q=>terrace(q.x,q.y,43,20)).join('');
 cachedAtlas=`<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" width="${CHAPTER_MAP.width}" height="${CHAPTER_MAP.height}" viewBox="0 0 ${CHAPTER_MAP.width} ${CHAPTER_MAP.height}" data-art-version="006">${defs()}<rect width="3000" height="680" fill="url(#a-sky)"/>
 <g opacity=".65">${distantRidges()}</g>${ground()}${river()}
 <g opacity=".12">${l('M0 191Q310 145 626 170T1210 163T1820 151T2420 159T3000 143','#b3c5bb',20)}${l('M42 200Q361 176 669 195T1272 185T1870 176T2450 180T2990 168','#b3c5bb',9)}</g>
 ${routeBed}${vegetation()}
 <g data-landmark="1">${ashVillage()}</g><g data-landmark="2">${prisonCart()}</g><g data-landmark="3">${blackKeep()}</g><g data-landmark="4">${pilgrimBridge()}</g><g data-landmark="5">${cloister()}</g><g data-landmark="6">${bellTower()}</g><g data-landmark="7">${cryptGate()}</g><g data-landmark="8">${altar()}</g><g data-landmark="9">${dawnCourt()}</g><g data-landmark="10">${cathedral()}</g>
 ${platforms}${foreground()}
 <g font-family="Palatino Linotype,Georgia,serif" fill="#bfba9b" letter-spacing="6" opacity=".6"><text x="128" y="91" font-size="21">THE EMBER MARCH</text><text x="1245" y="91" font-size="20">THE SILENT ABBEY</text><text x="2333" y="79" font-size="20">THE BLACK TIDE</text></g>
 <g font-family="STZhongsong,SimSun,serif" fill="#a3ada0" letter-spacing="5" opacity=".52"><text x="136" y="119" font-size="12">灰 烬 边 境</text><text x="1251" y="117" font-size="12">无 声 修 道 院</text><text x="2342" y="106" font-size="12">王 印 的 阴 影</text></g>
 <g transform="translate(2830 563)" opacity=".55" stroke="#b6a87d" fill="none"><circle r="32" stroke-width=".6"/><circle r="24" stroke-width=".5"/>${p('M0-46L7-8L0 0L-7-8ZM46 0L8 7L0 0L8-7ZM0 46L-7 8L0 0L7 8ZM-46 0L-8-7L0 0L-8 7Z','#c0af7d','#a38f68',.6)}<text y="-52" text-anchor="middle" fill="#d0bd8c" stroke="none" font-size="12" font-family="Georgia">N</text></g>
 <rect width="3000" height="680" fill="url(#a-vignette)"/><rect x="11" y="11" width="2978" height="658" rx="4" fill="none" stroke="#9a8a62" opacity=".4"/>${l('M11 55V11H55M2945 11H2989V55M11 625V669H55M2945 669H2989V625','#c8b180',2,.8)}</svg>`;
 return cachedAtlas;
}
