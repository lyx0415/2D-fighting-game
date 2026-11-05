import {paintedPortrait} from './raster-art.ts';
export {paintedScene,paintedGround,menuBackground,artUrl,PAINTED_HEROES,PAINTED_ENEMIES} from './raster-art.ts';
import {enemySvg} from './enemy-art.ts';
import { heroSvg } from './hero-art.ts';
/** Runtime art entry: v008 local generated textures; vector helpers retained for UI and archives. */
const SVG_OPEN = '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="160" viewBox="0 0 128 160">';
const metal = '#7f9192';
const edge = '#26363b';
const gold = '#c4a370';
const skin = '#d3b79c';

function line(d: string, color = '#28363b', width = 3): string {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function chain(x: number, y: number, count: number): string {
  return Array.from({ length: count }, (_, i) => `<ellipse cx="${x + Math.sin(i) * 3}" cy="${y + i * 7}" rx="3" ry="5" fill="none" stroke="#a7a18a" stroke-width="2"/>`).join('');
}
function blade(x: number, y: number, angle = 0): string {
  return `<g transform="translate(${x} ${y}) rotate(${angle})"><path d="M-4 5 L-4-38 L0-49 L5-38 L4 5Z" fill="#d0dcda" stroke="#34494b" stroke-width="2"/><path d="M0-43V3" stroke="#fff4cd" opacity=".7"/><path d="M-12 7H12M0 9V23" stroke="${gold}" stroke-width="5"/><circle cy="24" r="4" fill="#6c4937"/></g>`;
}
function boots(color = '#293639'): string {
  return `<path d="M45 105 L60 105 L58 139 L63 146 L60 151 L36 151 L37 145 L43 136Z" fill="${color}" stroke="${edge}" stroke-width="3"/><path d="M66 107 L80 106 L85 139 L96 145 L95 150 L71 150 L67 138Z" fill="${color}" stroke="${edge}" stroke-width="3"/><path d="M41 136L57 139M71 139L86 137" stroke="#718080" stroke-width="3"/>`;
}
function head(hood = '', helmet = false): string {
  return `<g>${hood ? `<path d="M43 51Q36 24 59 18Q83 20 83 51L70 62Z" fill="${hood}" stroke="${edge}" stroke-width="3"/>` : ''}<path d="M49 27Q67 17 76 32L76 43L83 49L75 53L74 66L59 69L48 57Z" fill="${skin}" stroke="${edge}" stroke-width="2.5"/>${helmet ? `<path d="M43 43L44 26L58 16L74 24L81 43L71 40L71 59L64 63L59 43Z" fill="${metal}" stroke="${edge}" stroke-width="3"/><path d="M60 19V39M47 33L74 31" stroke="#d1d7ca" stroke-width="2"/><path d="M65 43L80 42L77 48L65 49Z" fill="#16272a"/>` : `<path d="M47 49Q40 22 59 21Q76 18 78 34L68 31L59 38L54 51Z" fill="#392f2b"/><path d="M70 43H76" stroke="#332d2a" stroke-width="2"/>`}</g>`;
}

/** Right-facing figures. Shared dimensions and foot anchor: (64, 150). */
export function characterSvg(kind:string):string {
 return ['warrior','archer','mage','tank','assassin'].includes(kind)?heroSvg(kind):['zombie','wolf','crossbow','priest','raider','guard','boss','wraith','fanatic','bishop'].includes(kind)?enemySvg(kind):legacyCharacterSvg(kind);
}
export function legacyCharacterSvg(kind: string): string {
  if(['wraith','fanatic','bishop'].includes(kind))return chapterEnemySvg(kind);
  const shadow = '<ellipse cx="65" cy="150" rx="34" ry="6" fill="#050c10" opacity=".42"/>';
  let art = '';
  switch (kind) {
    case 'warrior':
      art = `<path d="M45 58Q27 87 22 128L48 135L64 91Z" fill="#693c37" stroke="#352e2d" stroke-width="3"/>${boots()}${head('', true)}<path d="M46 60L67 66L80 61L88 99L77 118L45 114L38 85Z" fill="${metal}" stroke="${edge}" stroke-width="3"/><path d="M48 65L63 80L77 67M45 92L80 92M55 95V109M70 95V110" fill="none" stroke="#c2c5af" stroke-width="3"/><path d="M41 65L28 73L32 86L47 84M78 64L91 68L94 83L81 84" fill="#a2ad9f" stroke="${edge}" stroke-width="3"/><path d="M84 83L94 102L106 96" fill="none" stroke="${metal}" stroke-width="12"/><circle cx="107" cy="96" r="6" fill="${skin}"/>${blade(109, 86, 15)}<path d="M39 83L31 109L41 116" fill="none" stroke="#526a6b" stroke-width="10"/><path d="M40 103L79 102" stroke="#624d39" stroke-width="7"/><rect x="57" y="99" width="10" height="8" rx="1" fill="${gold}"/>`;
      break;
    case 'archer':
      art = `<path d="M38 53L26 128L55 115L74 59Z" fill="#354d45" stroke="#1f3330" stroke-width="3"/><path d="M28 57L36 111" stroke="#7b583d" stroke-width="12"/>${line('M25 40L36 89M31 38L41 87M37 42L44 89', '#a6a38c', 2)}${boots('#403b30')}${head('#4e6451')}<path d="M45 62L70 63L82 85L76 117L43 115L36 79Z" fill="#626c50" stroke="#263d35" stroke-width="3"/><path d="M47 68L73 110M41 97L78 97" stroke="#a58b62" stroke-width="6"/><path d="M77 75L96 88L108 69M45 75L73 86L98 80" fill="none" stroke="#79836b" stroke-width="10" stroke-linecap="round"/><circle cx="105" cy="71" r="5" fill="${skin}"/><path d="M108 38Q137 79 108 121" fill="none" stroke="#c5a46d" stroke-width="5"/><path d="M108 38L102 78L108 121" fill="none" stroke="#e4d9b4" stroke-width="1.5"/>${line('M81 80L125 80', '#c4bc9c', 2)}<path d="M123 77L128 80L123 83" fill="#c9d6cd"/>`;
      break;
    case 'mage':
    case 'priest': {
      const evil = kind === 'priest';
      const robe = evil ? '#603c4c' : '#405e70';
      const glow = evil ? '#e37583' : '#8bd4d3';
      art = `<path d="M44 58L31 148L91 148L78 61Z" fill="${robe}" stroke="#20343c" stroke-width="3"/><path d="M50 72L47 140M61 73L65 144M73 73L84 140" fill="none" stroke="${evil ? '#945968' : '#668b94'}" stroke-width="4"/>${head(robe)}<path d="M39 64L25 100L42 111L53 77M77 66L94 91L107 85" fill="none" stroke="${robe}" stroke-width="14"/><path d="M44 65L60 80L76 65M40 117L82 117M34 144L90 144" fill="none" stroke="${gold}" stroke-width="3"/><circle cx="62" cy="88" r="5" fill="${glow}"/><path d="M108 143L105 31" stroke="#8a7960" stroke-width="5"/><path d="M94 27L105 10L116 27L106 41Z" fill="${glow}" stroke="${gold}" stroke-width="3"/><path d="M104 18L100 28L107 33" fill="none" stroke="#e7fff5" stroke-width="2"/><circle cx="105" cy="26" r="21" fill="${glow}" opacity=".12"/><circle cx="106" cy="85" r="6" fill="${skin}"/>`;
      break;
    }
    case 'tank':
    case 'guard': {
      const evil = kind === 'guard';
      art = `${boots('#3b494c')}${head('', true)}<path d="M38 59L77 59L89 106L77 122L38 118L27 82Z" fill="${evil ? '#596065' : '#667b7b'}" stroke="${edge}" stroke-width="4"/><path d="M40 62L55 93L73 65" fill="none" stroke="${gold}" stroke-width="4"/><path d="M33 62L23 73L26 91L44 83M77 61L96 72L91 90L76 83" fill="#8f9990" stroke="${edge}" stroke-width="3"/><path d="M90 87L102 102" stroke="#63787b" stroke-width="12"/><path d="M103 71L106 131" stroke="#9c8055" stroke-width="6"/><path d="M91 65L115 65L120 83L91 85Z" fill="#b0b6a7" stroke="${edge}" stroke-width="3"/><path d="M25 83L61 78L64 117Q47 137 28 122Z" fill="${evil ? '#624647' : '#3c5a5c'}" stroke="${gold}" stroke-width="4"/><path d="M43 86V123M30 99L58 97" stroke="${gold}" stroke-width="3"/><path d="M38 103L44 92L50 103L44 113Z" fill="#b5c6b6"/>`;
      break;
    }
    case 'assassin':
      art = `<path d="M41 54L25 118L48 102L62 60Z" fill="#3d3d51"/>${boots('#333440')}${head('#434254')}<path d="M44 61L70 62L80 90L76 116L43 118L36 87Z" fill="#4d4b5b" stroke="#222d38" stroke-width="3"/><path d="M46 68L73 105M70 66L43 107" stroke="#a69a7b" stroke-width="4"/><path d="M55 49L81 48L74 65L55 61Z" fill="#343a47"/><path d="M40 77L29 103L40 112M78 77L92 100L107 95" fill="none" stroke="#515364" stroke-width="11"/><path d="M43 105L77 105" stroke="#9f8968" stroke-width="7"/>${blade(109, 88, 52)}<g transform="translate(32 106) rotate(-40) scale(.65)">${blade(0, 0)}</g><path d="M48 64L37 61L23 75L30 78Z" fill="#77617c"/>`;
      break;
    case 'zombie':
      art = `${boots('#383d39')}<path d="M40 60L64 63L80 73L78 113L64 126L40 113L33 81Z" fill="#485245" stroke="#28352f" stroke-width="3"/><path d="M42 67L55 91L76 72M47 99L69 108" fill="none" stroke="#7c7960" stroke-width="3"/><path d="M42 64L36 94L46 111M75 72L91 89L113 84" fill="none" stroke="#7d8f70" stroke-width="10"/><path d="M47 26L67 23L78 38L74 58L59 66L45 54Z" fill="#8f9c76" stroke="#324138" stroke-width="3"/><path d="M45 32L49 22L68 18L77 30L63 28L60 38Z" fill="#343e32"/><path d="M68 39L78 38" stroke="#e8b66b" stroke-width="3"/><path d="M61 54L72 54M56 46L58 50" stroke="#364336" stroke-width="3"/><path d="M38 113L45 103L49 117L56 110L64 126" fill="#252e29"/>`;
      break;
    case 'wolf':
      art = `<path d="M24 105L8 96L15 116L30 121" fill="#455448" stroke="#293c35" stroke-width="3"/><path d="M26 112L23 143L18 149L36 149L43 121M71 117L74 143L69 149L88 149L90 117" fill="#536051" stroke="#273b32" stroke-width="3"/><path d="M23 112Q42 83 73 97L89 83L104 90L111 109L122 117L110 130L94 127L81 119L48 129L24 125Z" fill="#65725e" stroke="#263a31" stroke-width="3"/><path d="M86 95L84 76L98 91M102 96L106 81L112 104" fill="#53604d" stroke="#263a31" stroke-width="3"/><path d="M30 103L40 92L45 101L54 89L60 101L68 96" fill="#8e9573"/><path d="M103 111L111 108" stroke="#f0c773" stroke-width="3"/><path d="M108 122L116 125L110 128" fill="#e2d8bb"/><path d="M32 116L40 112M49 109L58 111M67 110L74 114" stroke="#34493e" stroke-width="4"/>`;
      break;
    case 'crossbow':
      art = `${boots('#3c3a36')}${head('#554c43')}<path d="M43 61L73 64L82 109L70 119L40 114L33 80Z" fill="#655c4b" stroke="#333b33" stroke-width="3"/><path d="M45 66L69 105M39 100L77 100" stroke="#9a7c55" stroke-width="5"/><path d="M39 76L54 95L81 88M76 75L89 90L105 87" fill="none" stroke="#776d58" stroke-width="11"/><path d="M70 87L119 83" stroke="#8f6b43" stroke-width="9"/><path d="M109 64Q99 85 116 107" fill="none" stroke="#abb0a0" stroke-width="5"/><path d="M109 64L117 83L116 107" fill="none" stroke="#d6c9a2" stroke-width="1.5"/><path d="M94 80L126 77" stroke="#b3bdad" stroke-width="2"/>`;
      break;
    case 'raider':
      art = `${boots('#4f4640')}${head('', true)}<path d="M35 60L78 62L90 106L79 121L35 117L27 83Z" fill="#6c5950" stroke="#343b37" stroke-width="3"/><path d="M30 67L19 73L25 91L44 81M75 64L94 72L99 89L78 85" fill="#8a8874" stroke="#333b35" stroke-width="3"/><path d="M39 66L75 109M38 99L83 99" stroke="#baa078" stroke-width="5"/><path d="M90 85L101 106" stroke="#887963" stroke-width="12"/><path d="M103 128L109 44" stroke="#9c8057" stroke-width="7"/><path d="M106 40Q119 49 124 64L111 72L104 61L92 64L87 48Z" fill="#c0c4ad" stroke="#34443b" stroke-width="3"/><path d="M50 23L42 11L41 33M68 23L80 12L78 35" fill="#a59a76" stroke="#3e4338" stroke-width="3"/>`;
      break;
    case 'boss':
      art = `<path d="M35 45L14 133L46 142L67 90L93 142L113 134L91 44Z" fill="#4f3038" stroke="#252e31" stroke-width="3"/><path d="M34 104L55 103L54 139L63 150L28 150L29 140ZM72 104L94 102L99 137L112 150L75 150L72 140Z" fill="#425257" stroke="#1d2b30" stroke-width="4"/><path d="M31 53L83 47L99 90L88 118L35 118L23 85Z" fill="#62747a" stroke="#1a2b31" stroke-width="4"/><path d="M42 57L62 84L83 56M35 95L91 95M46 101L47 114M73 99L76 115" fill="none" stroke="#b0a481" stroke-width="4"/><path d="M29 48L11 57L9 82L37 79L44 60M83 46L106 51L117 75L91 81L78 61" fill="#879186" stroke="#23343a" stroke-width="4"/><path d="M16 57L7 40L26 51M100 54L115 37L110 65" fill="#c0af86" stroke="#3a443c" stroke-width="3"/><path d="M45 22L53 9L73 10L84 26L82 48L66 58L48 45Z" fill="#a0a89b" stroke="#23343a" stroke-width="4"/><path d="M47 24L35 8L45 5L58 20M74 18L86 4L93 7L83 30" fill="#bdaa80" stroke="#34433c" stroke-width="3"/><path d="M52 30L81 28L77 38L57 40Z" fill="#21272b"/><path d="M61 33L76 32" stroke="#e7a46f" stroke-width="3"/><path d="M65 38L67 53" stroke="#354247" stroke-width="4"/><path d="M98 75L111 99M22 79L17 107" stroke="#7d8b82" stroke-width="15"/>${chain(18, 99, 6)}${chain(107, 98, 6)}<path d="M102 143L122 144L125 156L103 157Z" fill="#7b8580" stroke="#293c40" stroke-width="3"/><path d="M12 137L26 140L30 153L9 155Z" fill="#7b8580" stroke="#293c40" stroke-width="3"/><circle cx="62" cy="86" r="9" fill="#413637" stroke="#b49866" stroke-width="3"/><path d="M62 80V92M57 86H67" stroke="#d1b684" stroke-width="2"/>`;
      break;
    default:
      return characterSvg('warrior');
  }
  return `${SVG_OPEN}${shadow}${art}</svg>`;
}

const random = (i: number) => { const value = Math.sin(i * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); };
function pine(x: number, y: number, scale: number, color: string): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="${color}"><path d="M-5 0L-7-140L5-140L9 0Z"/><path d="M0-240L-48-153L-24-160L-69-97L-32-108L-88-43L-34-55L-57-18L64-19L38-57L88-43L39-111L65-94L23-164L48-151Z"/></g>`;
}
function deadTree(x: number, y: number, scale: number, color: string): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})" stroke="${color}" stroke-linecap="square" fill="none"><path d="M0 0L-7-75L7-136L-3-218" stroke-width="15"/><path d="M-5-72L-44-121L-56-183M-43-119L-87-143M5-130L50-166L57-206M45-162L76-163M0-180L-27-207" stroke-width="8"/></g>`;
}
function ruin(x: number, y: number, w: number, h: number): string {
  return `<g transform="translate(${x} ${y})"><path d="M0 0V-${h - 17}L${w * .24}-${h - 32}L${w * .4}-${h + 25}L${w * .6}-${h - 5}L${w}-${h - 18}V0Z" fill="#273435" stroke="#47504a" stroke-width="3"/><path d="M${w * .36} 0V-${h * .5}Q${w * .5}-${h * .7} ${w * .64}-${h * .5}V0Z" fill="#111c20"/><path d="M${w * .4}-${h * .76}V-${h * .9}H${w * .58}V-${h * .74}Z" fill="#101c20"/><path d="M8-${h * .25}H${w * .26}M${w * .72}-${h * .4}H${w - 5}M8-${h * .65}H${w * .23}" stroke="#53605a" stroke-width="3" opacity=".55"/></g>`;
}

/** Original seamless atmospheric setting; combat ground occupies y=340..620. */
export function sceneSvg(theme: string): string {
  if(theme==='abbey'||theme==='crypt')return chapterSceneSvg(theme);
  const forest = theme === 'forest';
  const fortress = theme === 'fortress';
  const top = forest ? '#13272a' : fortress ? '#18272f' : '#252d2d';
  const horizon = forest ? '#637367' : fortress ? '#77817b' : '#8c8871';
  let back = '';
  let mid = '';
  if (forest) {
    for (let i = 0; i < 30; i++) back += pine(i * 72 - 30, 350, .65 + random(i) * .6, '#2a4140');
    for (let i = 0; i < 15; i++) mid += deadTree(i * 143 + 10, 365, .7 + random(i + 50) * .7, '#213937');
    mid += '<g transform="translate(1110 312)"><path d="M0 43H170L154 8L5 0Z" fill="#283936" stroke="#716a50" stroke-width="4"/><path d="M10 0V-82H141V9M37-79V7M65-79V7M94-79V7M122-79V7" fill="none" stroke="#626b5c" stroke-width="6"/><circle cx="27" cy="48" r="23" fill="#23312d" stroke="#8a7b59" stroke-width="5"/><circle cx="143" cy="48" r="23" fill="#23312d" stroke="#8a7b59" stroke-width="5"/><path d="M26 26V70M5 48H49M143 26V70M122 48H165" stroke="#645e49" stroke-width="3"/></g>';
  } else if (fortress) {
    back += '<path d="M0 330V190H70V151H105V191H160V133H197V190H250V190H310V152H350V191H420V110H458V191H524V154H562V192H635V116H675V191H740V153H778V191H850V118H890V190H960V151H996V192H1070V120H1110V190H1180V151H1219V192H1280V130H1320V190H1400V150H1440V192H1510V120H1549V191H1630V151H1671V192H1740V130H1780V190H1850V154H1890V191H1920V330Z" fill="#35474b"/>';
    for (let i = 0; i < 11; i++) {
      const x = i * 190;
      mid += `<g transform="translate(${x} 348)"><path d="M0 0V-136H160V0Z" fill="#3e4e4e" stroke="#6d776b" stroke-width="2"/><path d="M42 0V-75Q80-140 118-75V0Z" fill="#16292f"/><path d="M54 0V-75M80-92V0M106-75V0" stroke="#748074" stroke-width="5"/><path d="M0-44H33M127-44H160M0-93H33M127-93H160" stroke="#728074" opacity=".35" stroke-width="3"/></g>`;
    }
    mid += '<g transform="translate(765 348)"><path d="M0 0V-215H50V-238H85V-215H270V-238H305V-215H355V0Z" fill="#415251" stroke="#7b8270" stroke-width="4"/><path d="M90 0V-106Q178-239 265-106V0Z" fill="#102129" stroke="#929783" stroke-width="8"/><path d="M112 0V-118M144-154V0M178-167V0M211-154V0M243-118V0" stroke="#566d6c" stroke-width="7"/><path d="M91-42H263M91-91H263" stroke="#667a72" stroke-width="7"/><path d="M153-201L178-222L204-201L178-181Z" fill="#c1a777"/></g>';
  } else {
    back += '<path d="M0 338L0 267L90 265L94 228L159 226L170 266L230 274L235 236L307 217L326 267L410 269L416 226L460 190L502 229L511 270L591 265L596 220L634 188L670 223L674 271L770 268L775 232L813 200L853 236L860 267L952 268L959 198L1000 126L1038 196L1046 266L1145 266L1151 222L1202 204L1255 226L1260 271L1363 265L1370 224L1414 193L1460 227L1467 269L1540 272L1549 230L1610 210L1681 229L1687 270L1786 265L1800 223L1862 226L1870 270L1920 273L1920 338Z" fill="#3b4440"/>';
    [120, 520, 1160, 1640].forEach((x, i) => mid += ruin(x, 355, 165 + i * 10, 160 + i % 2 * 80));
    mid += deadTree(50, 370, 1.3, '#273330') + deadTree(810, 360, 1.15, '#273330') + deadTree(1510, 357, 1.2, '#273330');
    [310, 700, 1380, 1820].forEach(x => mid += `<g transform="translate(${x} 350)"><ellipse cy="-8" rx="45" ry="35" fill="url(#ember)"/><path d="M-13 0Q-30-23-12-35Q-13-18-3-26Q9-53 10-64Q35-32 20-18Q27-6 13 0Z" fill="#d19c62" opacity=".7"/><path d="M-3 0Q-15-13 4-32Q4-14 12-8L8 0Z" fill="#ead2a0" opacity=".9"/><path d="M-24 3L21-3M-18-4L28 4" stroke="#302d25" stroke-width="8"/></g>`);
  }
  let ground = '';
  for (let i = 0; i < 130; i++) {
    const x = random(i + 70) * 1920;
    const y = 370 + random(i + 400) * 300;
    const size = 4 + random(i + 800) * 13;
    ground += `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l${size.toFixed(1)} -2l${(size * .6).toFixed(1)} 4l-${size.toFixed(1)} 2Z" fill="${i % 3 === 0 ? '#86806a' : '#233532'}" opacity="${.15 + random(i + 1) * .12}"/>`;
  }
  let foreground = '';
  for (let i = 0; i < 20; i++) {
    const x = i * 104 + random(i) * 40;
    foreground += `<path d="M${x} 720L${x - 7} 669L${x + 7} 698L${x + 12} 644L${x + 20} 702L${x + 39} 676L${x + 28} 720Z" fill="#102522" opacity=".65"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="720" viewBox="0 0 1920 720"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${top}"/><stop offset="1" stop-color="${horizon}"/></linearGradient><linearGradient id="earth" x2="0" y2="1"><stop stop-color="${forest ? '#41554a' : '#505b50'}"/><stop offset="1" stop-color="#1f3430"/></linearGradient><linearGradient id="fog" x2="0" y2="1"><stop stop-color="#bdc5a9" stop-opacity="0"/><stop offset=".55" stop-color="#bbc4ad" stop-opacity=".13"/><stop offset="1" stop-color="#bbc4ad" stop-opacity="0"/></linearGradient><radialGradient id="moon"><stop stop-color="#e4d9b1" stop-opacity=".2"/><stop offset="1" stop-color="#d5d1aa" stop-opacity="0"/></radialGradient><radialGradient id="ember"><stop stop-color="#df9f59" stop-opacity=".35"/><stop offset="1" stop-color="#df9f59" stop-opacity="0"/></radialGradient></defs><rect width="1920" height="400" fill="url(#sky)"/><circle cx="1430" cy="104" r="144" fill="url(#moon)"/><circle cx="1430" cy="104" r="36" fill="#c2c8b0" opacity=".35"/><path d="M0 248Q180 185 360 248T720 248T1080 248T1440 248T1800 248L1920 270V400H0Z" fill="#42544f" opacity=".4"/>${back}<path d="M0 331Q240 310 480 329T960 329T1440 329T1920 331V400H0Z" fill="#324640"/>${mid}<rect y="352" width="1920" height="368" fill="url(#earth)"/><path d="M0 480Q290 443 480 476T960 476T1440 476T1920 480" fill="none" stroke="#858271" stroke-width="135" opacity=".13"/><path d="M0 543Q290 502 480 535T960 535T1440 535T1920 543" fill="none" stroke="#d1bea0" stroke-width="2" opacity=".06"/>${ground}<rect y="240" width="1920" height="220" fill="url(#fog)"/>${foreground}<path d="M0 697Q120 665 240 697T480 697T720 697T960 697T1200 697T1440 697T1680 697T1920 697V720H0Z" fill="#102825" opacity=".7"/></svg>`;
}

export function crestSvg(): string {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="190" viewBox="0 0 160 190"><defs><linearGradient id="seal" x2="0" y2="1"><stop stop-color="#e8d5a4"/><stop offset="1" stop-color="#92764c"/></linearGradient></defs><path d="M80 8L137 40L132 111Q124 150 80 179Q36 150 28 111L23 40Z" fill="#192a2c" stroke="url(#seal)" stroke-width="3"/><path d="M80 20L125 47L120 110Q112 141 80 165Q48 141 40 110L35 47Z" fill="none" stroke="#95815d" stroke-width="1"/><path d="M57 93L45 55L68 68L80 43L92 68L115 55L103 93Z" fill="url(#seal)"/><path d="M57 103H103M66 113H94" stroke="url(#seal)" stroke-width="5"/><path d="M80 116L89 133L80 147L71 133Z" fill="url(#seal)"/><circle cx="80" cy="80" r="7" fill="#4c7270"/><path d="M13 78L4 87L14 97M147 78L156 87L146 97" fill="none" stroke="#b79b69" stroke-width="2"/></svg>';
}

export function portraitData(kind: string): string {
  const image=paintedPortrait(kind);if(image)return image;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(characterSvg(kind))}`;
}

/** Three self-contained story illustrations, without baked-in text. */
export function storySvg(index: number): string {
  const scene = sceneSvg(index === 1 ? 'fortress' : 'ash').replace('<svg ', '<svg x="0" y="0" ');
  const vignette = '<defs><radialGradient id="storyShade"><stop offset=".25" stop-color="#101a1d" stop-opacity="0"/><stop offset="1" stop-color="#101a1d" stop-opacity=".9"/></radialGradient></defs><rect width="1920" height="720" fill="url(#storyShade)"/>';
  let subject = '';
  if (index === 0) {
    subject = '<g transform="translate(875 155) scale(2.3)"><path d="M20 90L-10 190H108L73 88Z" fill="#6f6d76" stroke="#b8a787" stroke-width="3"/><path d="M40 62L57 62L65 95L31 95Z" fill="#8d8891"/><path d="M35 23Q51 11 64 28L65 48L55 66L40 59L32 43Z" fill="#d1bda3"/><path d="M30 30Q27 8 51 7Q78 10 71 46L64 42L60 23L43 29L33 47L26 54Z" fill="#bea67a"/><path d="M29 18L25 3L42 10L51-2L59 11L77 3L72 22Z" fill="#d4bb84"/><path d="M31 83L21 111L47 124M63 83L80 112L54 124" fill="none" stroke="#a49a9b" stroke-width="12"/><circle cx="50" cy="124" r="15" fill="#d7bf81"/><path d="M50 114L56 123L50 133L44 123Z" fill="#4e6c67"/></g>';
  } else if (index === 1) {
    subject = `<g transform="translate(950 260) scale(2.7)">${characterSvg('priest').replace('<svg ', '<svg x="0" y="0" ')}</g><g transform="translate(690 315) scale(2.2)">${characterSvg('guard').replace('<svg ', '<svg x="0" y="0" ')}</g><path d="M755 535Q930 625 1135 520" fill="none" stroke="#aa9873" stroke-width="6" stroke-dasharray="10 7"/>`;
  } else {
    subject = `<g transform="translate(795 180) scale(1.55)">${characterSvg('warrior').replace('<svg ', '<svg x="0" y="0" ')}</g><path d="M1060 610Q1290 590 1500 465" fill="none" stroke="#c5aa79" stroke-width="3" stroke-dasharray="9 20" opacity=".45"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="720" viewBox="0 0 1920 720">${scene}${vignette}${subject}</svg>`;
}
/** Standalone inventory artwork, sharing the characters' metal, outline and old-gold palette. */
export function equipmentSvg(slot: 'weapon'|'armor'|'charm', hero='warrior'): string {
 const stroke='#26363b';let body='';
 if(slot==='armor')body=`<path d="M40 23L53 29H75L88 23L111 42L99 64L87 57L94 108Q64 121 34 108L41 57L29 64L17 42Z" fill="#7f9192" stroke="${stroke}" stroke-width="4"/><path d="M43 28L64 49L85 28M37 86H91M51 49V98M77 49V98" fill="none" stroke="#c5c8b2" stroke-width="4"/><path d="M36 93H92" stroke="#6a5138" stroke-width="9"/><rect x="56" y="87" width="16" height="12" rx="2" fill="#c4a370"/>`;
 else if(slot==='charm')body='<path d="M34 16Q64 69 94 16" fill="none" stroke="#c4a370" stroke-width="5"/><path d="M34 16Q64 57 94 16" fill="none" stroke="#7f9192" stroke-width="2"/><path d="M64 47L88 69L80 101L64 117L48 101L40 69Z" fill="#314b4b" stroke="#c4a370" stroke-width="4"/><path d="M64 62L74 82L64 101L54 82Z" fill="#8bd4d3"/><path d="M64 69V90" stroke="#e2e8ce" stroke-width="2"/>';
 else if(hero==='archer')body='<path d="M38 12Q116 64 38 116" fill="none" stroke="#c4a370" stroke-width="7"/><path d="M38 12L47 64L38 116" fill="none" stroke="#d6d7ba" stroke-width="2"/><path d="M24 64H110" stroke="#7f9192" stroke-width="4"/><path d="M105 57L117 64L105 71Z" fill="#d4dfce"/><path d="M25 64L17 55M25 64L17 73" stroke="#a4b18b" stroke-width="4"/>';
 else if(hero==='mage')body='<path d="M62 47L52 119" stroke="#8a7960" stroke-width="8"/><path d="M38 29L66 5L88 35L61 61Z" fill="#8bd4d3" stroke="#c4a370" stroke-width="4"/><path d="M65 14L53 32L63 48" fill="none" stroke="#e7fff5" stroke-width="4"/><path d="M49 66L67 69M46 78L64 81" stroke="#c4a370" stroke-width="4"/>';
 else if(hero==='tank')body='<path d="M100 33V119" stroke="#9c8055" stroke-width="7"/><path d="M80 17H118V44H80Z" fill="#a7b5ad" stroke="#26363b" stroke-width="4"/><path d="M15 42L47 30L79 42L75 88Q64 108 47 117Q30 108 19 88Z" fill="#3c5a5c" stroke="#c4a370" stroke-width="5"/><path d="M47 42V100M28 65H66" stroke="#c4a370" stroke-width="4"/><path d="M47 52L55 65L47 80L39 65Z" fill="#b5c6b6"/>';
 else if(hero==='assassin')body=`<g transform="translate(-1 2) rotate(-27 64 64)">${blade(43,82,0)}${blade(82,78,0)}</g>`;
 else body=`<g transform="translate(0 25) scale(1.2) translate(-11 -7)">${blade(64,67,0)}</g>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">${body}</svg>`;
}

/** First-chapter continuation artwork; same foot anchor and old-gold/cold-metal materials. */
function chapterEnemySvg(kind:string):string {
 const shadow='<ellipse cx="64" cy="150" rx="35" ry="6" fill="#050c10" opacity=".42"/>';
 let figure='';
 if(kind==='wraith')figure='<path d="M44 43Q22 76 17 131L33 126L40 148L54 132L63 150L73 132L87 147L96 126L112 134Q104 77 83 43Z" fill="#35455c" stroke="#202d3a" stroke-width="3"/><path d="M46 62L35 121M62 69L62 137M80 63L93 121" stroke="#6d85a0" stroke-width="4" opacity=".7"/><path d="M34 54Q32 9 63 7Q96 12 96 55L76 72L48 69Z" fill="#566b80" stroke="#202d3a" stroke-width="4"/><path d="M44 48Q43 24 63 22Q85 25 85 49L72 61L54 60Z" fill="#101b2c"/><path d="M51 43L59 45M68 45L77 42" stroke="#9ed4df" stroke-width="3"/><path d="M33 75L19 99L8 91M92 77L107 99L119 92" fill="none" stroke="#6b8591" stroke-width="9"/><circle cx="64" cy="90" r="13" fill="#263341" stroke="#a59478" stroke-width="3"/><path d="M64 81L70 90L64 99L58 90Z" fill="#8bc6dc"/>'+chain(28,97,5)+chain(98,98,5);
 else if(kind==='fanatic')figure=boots('#353b3c')+'<path d="M39 51L24 122L44 117L68 77L89 125L102 118L83 46Z" fill="#58323d" stroke="#253236" stroke-width="3"/><path d="M42 58L78 58L87 110L76 122L39 115L31 78Z" fill="#584752" stroke="#253236" stroke-width="3"/><path d="M44 65L79 102M76 63L40 100" stroke="#b3986c" stroke-width="5"/><path d="M44 21L64 7L84 25L80 53L62 65L43 51Z" fill="#a0a89b" stroke="#253236" stroke-width="4"/><path d="M49 34L60 39M68 38L80 32" stroke="#653d42" stroke-width="4"/><path d="M62 13V60" stroke="#c4a370" stroke-width="3"/><path d="M34 70L24 101L38 108M83 73L94 99L107 90" fill="none" stroke="#7d7770" stroke-width="11"/>'+blade(107,83,35);
 else figure='<path d="M35 59L14 146H112L88 56Z" fill="#472b43" stroke="#202c37" stroke-width="4"/><path d="M43 66L28 140M58 74L54 147M76 72L84 146M84 65L99 140" stroke="#735067" stroke-width="6"/><path d="M39 55L63 78L86 55L93 77L64 96L32 77Z" fill="#9e8a6b" stroke="#27363b" stroke-width="3"/><path d="M43 45L43 22L63 1L83 22L83 48Z" fill="#a99b80" stroke="#27363b" stroke-width="4"/><path d="M63 6V45M47 32H79" stroke="#d7c59a" stroke-width="3"/><path d="M45 47L82 45L76 66L60 70L47 60Z" fill="#596775" stroke="#27363b" stroke-width="3"/><path d="M53 52H62M69 51H78" stroke="#e0a5b8" stroke-width="3"/><path d="M32 78L20 109L38 118M92 76L105 94" fill="none" stroke="#887889" stroke-width="13"/><path d="M108 147V32" stroke="#b79d71" stroke-width="6"/><circle cx="108" cy="24" r="16" fill="#262b42" stroke="#b79d71" stroke-width="4"/><path d="M108 10L116 24L108 37L100 24Z" fill="#c38fa8"/><circle cx="63" cy="102" r="12" fill="#293340" stroke="#baa17d" stroke-width="3"/><path d="M63 92V112M54 102H72" stroke="#d3b783" stroke-width="3"/>';
 return SVG_OPEN+shadow+figure+'</svg>';
}
function chapterSceneSvg(theme:string):string {
 const crypt=theme==='crypt';let base=sceneSvg(crypt?'forest':'fortress');
 base=base.replaceAll('#41554a',crypt?'#34474d':'#41554a').replaceAll('#77817b','#74757b');
 let structures='';
 if(crypt){
  structures='<path d="M0 0H1920V110Q1760 20 1600 140Q1440 20 1280 140Q1120 20 960 140Q800 20 640 140Q480 20 320 140Q160 20 0 110Z" fill="#162732"/>';
  for(let x=0;x<1920;x+=320){structures+=`<g transform="translate(${x} 0)"><path d="M8 352V170Q160-14 312 170V352" fill="none" stroke="#405561" stroke-width="24"/><path d="M30 348V188Q160 34 290 188V348" fill="none" stroke="#7d8172" stroke-width="3"/><rect x="53" y="250" width="214" height="90" fill="#293e47" stroke="#647473" stroke-width="3"/><path d="M69 270H250M69 291H250M69 312H250" stroke="#111f29" stroke-width="8"/><path d="M90 255V325M155 255V325M220 255V325" stroke="#78867b" stroke-width="3"/><circle cx="132" cy="230" r="10" fill="#afb5a2"/><circle cx="188" cy="230" r="10" fill="#afb5a2"/><path d="M124 228H139M180 228H195" stroke="#253540" stroke-width="3"/></g>`;}
  structures+='<ellipse cx="960" cy="510" rx="195" ry="50" fill="none" stroke="#a29a7c" stroke-width="2" opacity=".2"/><path d="M800 510H1120M960 465V555M840 480L1080 540M840 540L1080 480" stroke="#8fc0c2" stroke-width="2" opacity=".16"/>';
 }else{
  for(let x=160;x<1920;x+=480)structures+=`<g transform="translate(${x} 0)"><path d="M-105 349V150L0 50L105 150V349Z" fill="#35454c" stroke="#879185" stroke-width="3"/><path d="M-75 345V169L0 93L75 169V345" fill="#1e303e" stroke="#626e79" stroke-width="6"/><circle cx="0" cy="191" r="47" fill="#514960" stroke="#b09b7c" stroke-width="5"/><circle cx="0" cy="191" r="31" fill="#a58c9b" opacity=".6"/><path d="M-44 191H44M0 147V235M-31 160L31 222M-31 222L31 160" stroke="#d0b995" stroke-width="4"/><path d="M-12 48V11M-26 26H2" stroke="#b4aa8e" stroke-width="6"/><path d="M-30 344V279Q0 234 30 279V344" fill="#142731" stroke="#78847e" stroke-width="3"/></g>`;
 }
 for(let x=80;x<1920;x+=240)structures+=`<g transform="translate(${x} 346)"><path d="M-7 0V-28H7V0Z" fill="#b4a98b"/><path d="M0-29Q-12-42 0-55Q12-41 0-29Z" fill="#e6bf7e"/><ellipse cx="0" cy="-39" rx="19" ry="25" fill="#d3a268" opacity=".09"/></g>`;
 return base.replace('</svg>',structures+'</svg>');
}

export { blade, pine, deadTree, ruin };
