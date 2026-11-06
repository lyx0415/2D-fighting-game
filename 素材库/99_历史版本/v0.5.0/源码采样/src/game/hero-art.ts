import type { RigDefinition, RigPart, RigPose, RigTransform } from './rig-types';
/**
 * Original editable vector hero illustrations, revision v005.
 * Canvas 256 × 320; right-facing, foot anchor (128, 300).
 * Editable artwork and continuous joint motion share one anatomical rig.
 */
function defs(id: string): string {
  return `<defs>
  <linearGradient id="${id}-steel" x1="0" y1="0" x2=".9" y2=".8"><stop stop-color="#d9e4e6"/><stop offset=".25" stop-color="#8babb7"/><stop offset=".48" stop-color="#d1dce0"/><stop offset=".53" stop-color="#657f90"/><stop offset="1" stop-color="#233b50"/></linearGradient>
  <linearGradient id="${id}-steelDark" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#8babb7"/><stop offset=".46" stop-color="#425d72"/><stop offset="1" stop-color="#172838"/></linearGradient>
  <linearGradient id="${id}-gold" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="#f2dc9d"/><stop offset=".32" stop-color="#c6a96a"/><stop offset=".61" stop-color="#f3daa0"/><stop offset="1" stop-color="#735330"/></linearGradient>
  <linearGradient id="${id}-red" x1="0" y1="0" x2="1" y2=".4"><stop stop-color="#21172b"/><stop offset=".4" stop-color="#622b3d"/><stop offset=".7" stop-color="#8b4050"/><stop offset="1" stop-color="#381b31"/></linearGradient>
  <linearGradient id="${id}-green" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#587366"/><stop offset=".43" stop-color="#294a43"/><stop offset="1" stop-color="#102a2e"/></linearGradient>
  <linearGradient id="${id}-blue" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="#405c83"/><stop offset=".44" stop-color="#22385f"/><stop offset="1" stop-color="#101b35"/></linearGradient>
  <linearGradient id="${id}-purple" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#615071"/><stop offset=".35" stop-color="#392e52"/><stop offset="1" stop-color="#121b2d"/></linearGradient>
  <linearGradient id="${id}-leather" x1="0" y1="0" x2="1" y2=".6"><stop stop-color="#a37a54"/><stop offset=".45" stop-color="#6b4e3c"/><stop offset="1" stop-color="#302e30"/></linearGradient>
  <linearGradient id="${id}-skin" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#efc9aa"/><stop offset=".5" stop-color="#d4a98d"/><stop offset="1" stop-color="#8e6359"/></linearGradient>
  <linearGradient id="${id}-hair" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c18a56"/><stop offset=".4" stop-color="#794b37"/><stop offset="1" stop-color="#322b2c"/></linearGradient>
  <linearGradient id="${id}-silverHair" x1="0" y1="0" x2="1" y2=".6"><stop stop-color="#eff3eb"/><stop offset=".4" stop-color="#bbc8d1"/><stop offset="1" stop-color="#5c7894"/></linearGradient>
  <linearGradient id="${id}-darkSkin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ba9079"/><stop offset=".46" stop-color="#795c55"/><stop offset="1" stop-color="#473b40"/></linearGradient>
  <linearGradient id="${id}-gem" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e5ffff"/><stop offset=".35" stop-color="#90e2e7"/><stop offset=".6" stop-color="#4389aa"/><stop offset="1" stop-color="#153a69"/></linearGradient>
  <radialGradient id="${id}-aura"><stop stop-color="#7cdbed" stop-opacity=".35"/><stop offset="1" stop-color="#5ca3cd" stop-opacity="0"/></radialGradient>
  </defs>`;
}
const path = (d: string, fill: string, stroke = '#142333', width = 1.6) => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const ink = (d: string, color = '#b9c9ce', width = 1.15, opacity = 1) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`;
const g = (id: string, name: string) => `url(#${id}-${name})`;
function rivets(points: [number, number][], color = '#d4bd84'): string {
  return points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.45" fill="${color}" stroke="#403f3a" stroke-width=".55"/>`).join('');
}
function mail(x: number, y: number, rows: number, cols: number): string {
  return Array.from({ length: rows }, (_, row) => Array.from({ length: cols }, (_, col) => `<path d="M${x + col * 5 + row % 2 * 2.5} ${y + row * 4}q2 4 4 0" fill="none" stroke="#8499a7" stroke-width=".8" opacity=".65"/>`).join('')).join('');
}
function sword(id: string, x: number, y: number, angle: number, length = 105): string {
  return `<g transform="translate(${x} ${y}) rotate(${angle})">${path(`M-5 0L-4-${length - 15}L0-${length}L5-${length - 15}L6 0Z`, g(id, 'steel'))}${ink(`M0-${length - 7}V-2`, '#f2f2df', 1.1)}${path('M-18 2Q-8-4 0-1Q9-5 19 0L17 7L5 5H-4L-15 8Z', g(id, 'gold'))}${path('M-4 7H5L4 30H-3Z', g(id, 'leather'))}${ink('M-3 12H4M-3 17H4M-3 22H4', '#ba9c72', 1)}<circle cy="33" r="5" fill="${g(id, 'gold')}" stroke="#233344" stroke-width="1.2"/></g>`;
}
function warrior(): Parts {
  const id = 'warrior'; const parts=emptyParts();
  parts.cape += path('M98 93Q67 120 62 163L44 264L64 255L77 278L94 260L107 270L127 224L134 109Z', g(id, 'red'));
  parts.cape += ink('M96 109Q74 164 65 248M108 119L84 254M93 194L79 271', '#b76f71', 1.5, .5);
  parts.rearLeg += path('M107 189L129 191L124 235L111 266L108 294L78 298L76 292L90 279L93 247Z', g(id, 'steelDark'));
  parts.frontLeg += path('M133 193L153 190L166 238L156 273L159 291L177 296L175 302H140L136 294L138 266L144 239Z', g(id, 'steel'));
  parts.rearLeg += path('M97 226L122 233L116 251L94 254L89 243Z', g(id, 'steel'));
  parts.frontLeg += path('M142 225L164 229L163 246L144 253L138 242Z', g(id, 'steel'));
  parts.rearLeg+=ink('M95 258L109 261L104 287M86 293L105 290','#d3e0df',1.5);parts.frontLeg+=ink('M147 254L151 271L147 293M145 298H171','#d3e0df',1.5);
  parts.body += path('M102 92L133 89L156 106L160 169L149 196L105 195L90 165L91 118Z', g(id, 'steel'));
  parts.body += path('M106 101L125 116L143 101L151 143L137 166L106 158L97 137Z', g(id, 'steelDark'));
  parts.body += ink('M99 118L121 131L147 115M102 146L125 154L147 143M127 116V151', '#d3dfdd', 1.3);
  parts.body += path('M116 128L120 121L129 122L136 128L135 140L130 147L124 150L118 145L115 138Z', g(id, 'gold'), '#33434c', .9);
  parts.body += ink('M120 130L124 128L129 130L132 128M121 135L129 135M121 140L125 143L130 140M116 129L112 132M135 128L140 131', '#695636', 1);
  parts.body += path('M94 102L80 109L78 126L94 132L109 120L106 109Z', g(id, 'steel'));
  parts.body += path('M145 101L167 108L175 128L157 132L143 117Z', g(id, 'steel'));
  parts.body += ink('M82 118L96 115M151 111L166 115L170 123', '#edf3e7', 1.4);
  parts.body += mail(91, 160, 6, 10);
  parts.body += path('M99 174L150 175L151 184L101 185Z', g(id, 'leather'));
  parts.body += path('M117 172H133V186H117Z', g(id, 'gold')) + path('M121 176H129V182H121Z', '#304352', '#283a48', .7);
  parts.body += path('M102 186L122 187L118 217L99 212Z', g(id, 'steel')) + path('M128 187L150 186L158 211L135 217Z', g(id, 'steel'));
  parts.body += ink('M101 198L119 202M132 199L153 196', '#9eb2bd', 1);
  parts.rearArm += path('M82 128L95 130L94 160L82 184L76 184L72 174L77 150Z', g(id, 'steelDark'));
  parts.rearArm += path('M74 174L85 177L91 195L81 204L72 198L69 185Z', g(id, 'steel'));
  parts.frontArm += path('M163 129L174 126L184 155L197 171L188 181L171 165L160 145Z', g(id, 'steelDark'));
  parts.frontArm += path('M181 158L193 167L190 184L178 181L172 169Z', g(id, 'steel'));
  parts.frontArm += path('M189 174Q202 170 207 176L206 187L197 191L189 185Z', g(id, 'skin'));
  parts.weaponFront += sword(id, 202, 170, 17, 111);
  parts.head += path('M109 88L110 76L137 74L141 97L127 109Z', '#6b7684');
  parts.head += path('M105 47Q123 32 141 47L147 60L144 67L153 74L147 80L144 93L133 98L117 96L105 84L101 67Z', g(id, 'skin'));
  parts.head += path('M109 70Q99 59 103 48L112 36L135 34L145 47L140 55L130 47L120 50L115 65Z', g(id, 'hair'));
  parts.head += ink('M111 47L120 41L132 42M108 57L116 49M133 58L140 59M140 72L145 73M131 84L138 84', '#9b6a50', 1.1);
  parts.head += path('M102 61Q97 39 112 28Q129 21 142 35L148 49L142 55L137 40L124 35L112 44L110 65Z', g(id, 'steel'));
  parts.head += path('M103 62L114 64L118 88L110 85L104 75Z', g(id, 'steelDark'));
  parts.head += ink('M105 42L112 33L125 30L140 38M122 30L123 40', '#f3ecd0', 1.2);
  parts.body += rivets([[86,114],[101,111],[154,109],[166,120],[104,181],[145,181]]);
  return parts;
}
function archer(): Parts {
  const id='archer'; const parts=emptyParts();
  parts.cape += path('M105 88Q82 112 69 149L59 243L75 231L86 247L101 215L118 128L137 92Z', g(id,'green'));
  parts.cape += ink('M98 112Q79 163 75 226M109 112L93 216', '#789587',1.4,.6);
  parts.backAccessory += path('M87 110L77 115L66 175L77 181L94 124Z', g(id,'leather'));
  parts.backAccessory += ink('M80 116L71 172M84 113L75 169', '#c2a476',1.2);
  parts.backAccessory += `<g transform="rotate(-9 76 117)">${ink('M72 76L79 140M80 71L87 138M88 78L94 138','#c4bd9a',2)}${path('M65 78L72 70L76 78L71 86Z','#98ae97')}${path('M75 74L81 65L86 73L80 84Z','#c5c3a3')}</g>`;
  parts.rearLeg += path('M105 186L124 191L115 233L109 266L110 290L94 298L82 299L80 293L93 281L94 251L92 220Z', g(id,'leather'));
  parts.frontLeg += path('M129 190L146 185L153 224L145 258L147 285L164 296L163 301H135L130 291L129 257L132 227Z', g(id,'leather'));
  parts.rearLeg += path('M91 249L111 252L108 282L112 291L94 300H80L81 292L93 280Z', '#263b37');
  parts.frontLeg += path('M129 255L146 253L147 284L165 295L162 301H135L129 292Z', '#263b37');
  parts.rearLeg+=ink('M95 259L107 260M94 266L106 267','#bd9f69',1.5);parts.frontLeg+=ink('M134 263L143 261M134 270L144 268M135 278L144 276','#bd9f69',1.5);
  parts.body += path('M108 95L134 89L147 103L148 153L137 184L109 190L92 166L95 118Z', g(id,'green'));
  parts.body += path('M104 104L128 101L143 114L138 148L123 164L101 152L98 126Z', g(id,'leather'));
  parts.body += ink('M103 108L127 106L139 117M102 143L122 153L136 143M107 117L112 143M130 115L128 145', '#c39a65',1.1);
  parts.body += path('M95 160L143 157L148 187L136 207L119 199L105 212L93 191Z', g(id,'green'));
  parts.body += path('M96 162L141 157L144 167L97 172Z', g(id,'leather'));
  parts.body += path('M117 158L130 157L132 168L119 170Z', g(id,'gold'));
  parts.body += ink('M100 178L105 198M111 175L115 191M137 174L134 194', '#7a977e',1.1);
  parts.body += path('M98 108L86 117L83 134L98 138L107 121Z', g(id,'green'));
  parts.body += path('M140 104L153 108L158 125L146 135L135 121Z', g(id,'green'));
  parts.rearArm += path('M87 131L98 134L115 151L147 146L151 155L115 164L102 157L84 144Z', g(id,'skin'));
  parts.frontArm += path('M142 128L153 121L174 142L194 135L197 145L173 154L157 147Z', g(id,'skin'));
  parts.rearArm += path('M110 147L125 151L123 162L111 162L105 155Z', g(id,'leather'));
  parts.frontArm += path('M175 139L189 135L193 145L181 151Z', g(id,'leather'));
  parts.rearArm+=ink('M112 150L122 154','#d5b67e',1.2);parts.frontArm+=ink('M178 141L188 139','#d5b67e',1.2);
  parts.frontArm += path('M189 139Q196 133 200 137L201 144L194 150L188 145Z', g(id,'skin'));
  parts.weaponFront += `<g>${path('M198 62Q237 104 230 151Q226 189 198 224L192 218Q212 185 217 151Q226 105 191 67Z',g(id,'gold'))}${ink(`M194 66L151 142L195 221`,'#e7ddbd',1.1)}${ink(`M147 144L237 140`,'#cfdaD5',2)}${path('M232 135L242 139L232 145Z',g(id,'steel'))}${ink('M150 145L142 138M150 148L142 156','#91a28c',2)}${path('M215 126L224 128L224 155L214 154Z',g(id,'leather'))}${rivets([[219,132],[218,148]])}</g>`;
  parts.head += path('M113 90L114 78L135 76L137 98L125 105Z',g(id,'skin'));
  parts.head += path('M111 49Q122 36 135 46L140 60L139 67L146 72L141 77L136 88L128 94L119 90L112 78L109 64Z',g(id,'skin'));
  parts.head += path('M104 72Q97 53 106 39Q118 25 136 35L146 49L138 56L133 45L120 49L115 65L116 83L108 91Z',g(id,'hair'));
  parts.head += path('M106 66Q91 88 102 105Q119 116 107 131Q98 142 112 152L104 161Q87 147 95 133Q106 120 96 111Q82 91 98 68Z',g(id,'hair'));
  parts.head += ink('M101 76Q91 95 105 107Q113 119 101 134Q98 143 106 151','#dfa976',1.7);
  parts.head += ink('M99 85L105 93M99 98L108 103M104 111L108 119M103 127L98 134M100 143L108 148','#4c342d',1.8);
  parts.head += path('M101 72Q91 44 107 30Q127 20 141 34L150 54L141 56L131 40L114 44L106 64Z',g(id,'green'));
  parts.head += ink('M101 47Q105 31 121 30Q135 29 143 47','#c2ac79',1.2);
  parts.head += path('M103 37Q81 35 80 13Q97 14 110 34Z','#859c89','#263f3c',1.2);
  parts.head += path('M106 36Q94 22 103 8Q117 19 113 35Z','#c2c8ac','#2c443c',1.2);
  parts.head += ink('M85 20L106 38M105 14L109 35','#e4d4a4',1);
  parts.head += ink('M131 61L140 60M137 73L143 74M128 84L137 84','#80584d',1.1);
  parts.head += path('M112 74L105 68L107 82L115 83Z',g(id,'skin'),'#967261',.8);
  parts.body += rivets([[99,111],[102,131],[142,112],[136,161],[102,166]]);
  return parts;
}
function mage(): Parts {
  const id='mage';const parts=emptyParts();
  parts.weaponFront += `<ellipse cx="211" cy="54" rx="38" ry="47" fill="${g(id,'aura')}"/>`;
  parts.skirt += path('M108 78Q81 103 76 154L59 291L88 282L102 300H164L178 290L151 121L136 78Z',g(id,'blue'));
  parts.skirt += path('M105 143L91 202L78 290L100 283L111 178Z','#182c50');
  parts.skirt += path('M127 136L116 197L111 300H141L143 197Z','#3b5075');
  parts.skirt += path('M143 141L151 204L164 300L178 289L160 176Z','#152340');
  parts.skirt += ink('M99 162L82 282M115 170L110 292M145 171L163 287','#9d875f',2);
  parts.skirt += ink('M81 281Q125 294 170 284M81 287Q122 300 172 290','#c4a370',2);
  parts.rearLeg += path('M104 283L123 285L122 298H100L94 296Z','#1b2a3d');
  parts.frontLeg += path('M139 286H155L165 297L164 302H138Z','#1b2a3d');
  parts.body += path('M101 87L134 80L153 98L148 153L132 178L104 165L89 119Z',g(id,'blue'));
  parts.body += path('M110 93L126 106L138 89L145 98L132 132L116 133L101 101Z',g(id,'gold'));
  parts.body += path('M111 99L125 114L137 98L134 123L122 138Z','#203b5d');
  parts.body += path('M121 122L130 118L136 129L128 140L120 134Z',g(id,'gem'),'#bbd0d2',1.1);
  parts.body += ink('M105 142Q119 148 140 141M112 137L110 154M119 142L118 160M133 142L132 163','#bea575',1.3);
  parts.body += path('M98 157L145 154L149 167L101 172Z','#766449','#2a3644',1.4);
  parts.body += path('M116 155L133 154L137 166L120 171L113 164Z',g(id,'gold'));
  parts.body += path('M120 159L129 158L132 163L122 166Z',g(id,'gem'),'#5d746f',.7);
  parts.rearArm += path('M96 96L82 110L67 158L78 174L105 146L112 112Z',g(id,'blue'));
  parts.rearArm += path('M78 146L91 157L84 175L68 164Z',g(id,'gold'));
  parts.rearArm += path('M77 160L95 166L109 162L112 170L97 179L84 176L71 171Z',g(id,'darkSkin'));
  parts.frontArm += path('M144 97L156 106L173 137L197 129L202 145L174 159L162 150L143 125Z',g(id,'blue'));
  parts.frontArm += path('M185 131L197 125L204 145L191 151Z',g(id,'gold'));
  parts.frontArm += path('M197 132L208 129L216 135L215 145L208 150L201 145Z',g(id,'darkSkin'));
  parts.rearArm+=ink('M73 153L83 160','#efe0ab',1);parts.frontArm+=ink('M191 136L199 133M190 141L201 138','#efe0ab',1);
  parts.weaponFront += path('M208 288L213 78L218 78L217 291L212 297Z',g(id,'leather'));
  parts.weaponFront += ink('M213 90L213 276','#ccae72',1.4);
  parts.weaponFront += path('M201 87L204 73L191 56L196 34L208 17L214 23L202 42L200 57L211 69L222 58L225 41L217 21L225 15L238 40L233 66L221 80L223 88Z',g(id,'gold'));
  parts.weaponFront += path('M214 29L225 51L214 72L205 53Z',g(id,'gem'),'#b2e9e3',1.4);
  parts.weaponFront += ink('M215 37L211 52L215 62','#f2ffff',1.2);
  parts.weaponFront += path('M201 104L220 105M201 109L219 110M209 239L220 240',g(id,'gold'),'#b9985c',2);
  parts.head += path('M112 86L111 74L136 72L138 91L126 102Z',g(id,'darkSkin'));
  parts.head += path('M111 44Q122 31 134 42L140 56L138 64L148 70L141 76L136 89L128 96L118 89L111 77L107 60Z',g(id,'darkSkin'));
  parts.head += path('M106 71Q95 57 103 40Q116 24 135 33L147 50L140 58L132 43L119 46L114 62L111 88L99 111L89 111L98 89Z',g(id,'silverHair'));
  parts.head += path('M107 70L103 95L110 118L116 113L112 88Z',g(id,'silverHair'));
  parts.head += path('M137 46Q155 59 147 89L151 112L140 109L136 88L139 62Z',g(id,'silverHair'));
  parts.head += ink('M111 39Q102 61 106 81L98 104M116 40L109 67M141 49L144 75L142 95','#e3f3e9',1.1,.9);
  parts.head += path('M104 41L109 29L118 36L126 21L133 36L143 30L146 45L136 40L128 46L118 40L109 46Z',g(id,'gold'));
  parts.head += path('M126 25Q111 13 120 4Q120 17 135 18Q130 20 126 25Z','#d5dbca','#8b9c9e',1);
  parts.head += `<circle cx="128" cy="38" r="3.8" fill="${g(id,'gem')}" stroke="#e9d6a2" stroke-width="1"/>`;
  parts.head += ink('M131 58L139 58M134 70L141 71M127 80L136 80','#d1aaa0',1);
  parts.rearArm += path('M110 139Q91 120 82 137Q84 154 108 160', 'none','#bfaa75',1.2);
  for(let y=190;y<272;y+=24)parts.skirt+=ink(`M119 ${y}l8-7l9 7l-8 9Z`,'#ad9667',1,.7);
  return parts;
}
function tank():Parts {
  const id='tank';const parts=emptyParts();
  parts.cape+=path('M88 91Q72 114 69 172L64 263L87 254L98 273L120 227L153 263L176 254L168 132L142 86Z',g(id,'blue'));
  parts.cape+=ink('M85 110L74 246M153 118L163 249','#987d4e',2,.7);
  parts.rearLeg+=path('M100 190L127 192L120 241L110 267L111 291L101 301H77L75 294L89 282L88 251Z',g(id,'steelDark'));
  parts.frontLeg+=path('M135 193L160 187L176 236L164 268L169 290L185 296L183 302H146L140 292L140 263L148 235Z',g(id,'steelDark'));
  parts.rearLeg+=path('M91 224L121 228L124 245L108 259L87 251Z',g(id,'steel'));
  parts.frontLeg+=path('M146 222L173 228L176 244L158 258L140 247Z',g(id,'steel'));
  parts.rearLeg+=ink('M90 233L111 239L118 235M97 262L103 285M82 295H105','#decc97',1.4);parts.frontLeg+=ink('M149 233L164 240L172 235M153 263L155 291M147 297H179','#decc97',1.4);
  parts.body+=path('M96 89L133 85L160 100L172 155L158 195L107 202L83 172L82 123Z',g(id,'steelDark'));
  parts.body+=path('M101 100L126 116L150 97L162 133L151 158L121 167L96 147Z',g(id,'steel'));
  parts.body+=path('M107 109L126 128L146 108L140 140L124 151L111 138Z','#2a4260','#b99c64',2);
  parts.body+=path('M121 123L127 117L133 124L128 132L122 130Z',g(id,'gold'));
  parts.body+=ink('M94 152L120 174L159 160M99 162L121 181L153 172','#c4a370',2);
  parts.body+=mail(103,172,4,10);
  parts.body+=path('M98 183L160 178L161 190L101 196Z',g(id,'leather'));
  parts.body+=path('M121 180L139 179L142 194L124 197L118 189Z',g(id,'gold'));
  parts.body+=path('M104 196L126 195L121 224L96 218Z',g(id,'steelDark'))+path('M134 194L158 190L168 216L143 226Z',g(id,'steelDark'));
  parts.body+=ink('M99 208L122 211M139 207L161 203','#c4a370',1.5);
  parts.body+=path('M87 103L67 110L64 132L83 143L108 123L106 108Z',g(id,'steel'));
  parts.body+=path('M145 98L171 104L186 124L178 141L151 131L139 111Z',g(id,'steel'));
  parts.body+=path('M71 113L91 109L101 117L82 130L68 128Z','#385775','#c4a370',1.5);
  parts.body+=path('M154 106L168 110L178 122L174 131L151 122Z','#385775','#c4a370',1.5);
  parts.frontArm+=path('M172 140L182 139L190 170L206 185L197 195L177 181L166 157Z',g(id,'steelDark'));
  parts.frontArm+=path('M190 176L206 187L207 203L195 205L186 192Z',g(id,'steel'));
  parts.frontArm+=path('M196 196L208 193L217 200L214 209L204 213L195 206Z',g(id,'skin'));
  parts.weaponFront+=path('M211 255L214 102L221 102L219 257L215 264Z',g(id,'leather'));
  parts.weaponFront+=path('M197 83L229 83L241 95L235 120L202 122L190 108Z',g(id,'steel'));
  parts.weaponFront+=path('M197 88L226 88L229 112L203 116Z','#516a81','#c4a370',2);
  parts.weaponFront+=ink('M204 92L218 106M207 106L218 94M215 130L219 130M214 139L219 139','#c9ad73',1.4);
  parts.rearArm+=path('M76 134L100 137L102 165L89 187L68 178L66 152Z',g(id,'steelDark'));
  parts.weaponRear+=path('M44 153L82 133L124 145L126 205Q118 247 86 271Q52 249 43 213Z',g(id,'gold'));
  parts.weaponRear+=path('M50 158L82 141L117 151L119 204Q111 239 86 261Q59 242 50 211Z',g(id,'blue'),'#d6c38e',1.3);
  parts.weaponRear+=path('M82 145L89 148L91 253L85 260L80 250Z',g(id,'gold'));
  parts.weaponRear+=path('M51 182L119 177L119 188L51 193Z',g(id,'gold'));
  parts.weaponRear+=path('M80 170L91 172L99 187L91 205L82 209L72 194Z',g(id,'steel'));
  parts.weaponRear+=ink('M82 177L90 184L85 200M58 208Q65 231 78 239M106 205Q104 226 96 236','#e7d29b',1.4);
  parts.weaponRear+=rivets([[52,164],[111,157],[52,207],[111,203],[84,251]]);parts.body+=rivets([[76,117],[167,117],[105,188],[154,185]]);
  parts.head+=path('M110 91L108 76L137 74L144 96L129 111Z','#62727d');
  parts.head+=path('M100 44Q122 30 143 44L150 60L148 68L158 76L151 82L148 96L135 103L114 101L99 85L96 64Z',g(id,'skin'));
  parts.head+=path('M101 72Q112 77 121 75L129 82L141 76L151 81L147 102L137 114L119 112L107 101L100 87Z',g(id,'silverHair'));
  parts.head+=ink('M116 81L120 100M124 83L127 105M133 83L133 101M138 81L138 91','#607381',1.1);
  parts.head+=path('M101 65Q94 43 107 29L125 23L144 31L152 52L145 63L139 43L125 37L112 44L110 65Z',g(id,'steelDark'));
  parts.head+=path('M103 63L113 63L116 80L108 83L100 73Z',g(id,'steel'));
  parts.head+=path('M104 44L112 32L125 28L141 36L147 50L142 53L136 40L126 35L114 41Z',g(id,'gold'));
  parts.head+=ink('M126 28V38M112 55L121 52M134 57L142 57M134 70L142 71','#f0dbab',1.1);
  parts.head+=path('M115 26Q113 16 121 13L129 25Z','#314e72','#9f8c63',1);
  return parts;
}
function assassin():Parts {
  const id='assassin';const parts=emptyParts();
  parts.cape+=path('M110 84Q82 103 74 140L57 223L78 217L92 232L113 184L137 103Z',g(id,'purple'));
  parts.cape+=ink('M104 99Q82 150 72 211M111 111L88 213','#9585a8',1.3,.6);
  parts.rearLeg+=path('M110 189L128 194L118 229L100 261L96 287L85 299H70L71 294L83 278L85 249L96 219Z',g(id,'purple'));
  parts.frontLeg+=path('M133 187L150 184L168 222L153 257L157 282L176 294L175 300H148L141 290L136 260L145 226Z',g(id,'purple'));
  parts.rearLeg+=path('M86 250L102 255L97 282L99 290L85 300H70L72 293L84 277Z','#17283a','#667389',1.4);
  parts.frontLeg+=path('M137 258L154 254L157 281L178 293L176 300H148L140 289Z','#17283a','#667389',1.4);
  parts.rearLeg+=ink('M87 262L98 264M86 270L96 272','#b0a0bf',1.3);parts.frontLeg+=ink('M144 266L153 264M146 274L155 271','#b0a0bf',1.3);
  parts.body+=path('M112 91L135 88L148 104L150 141L136 174L110 185L95 162L99 117Z',g(id,'purple'));
  parts.body+=path('M108 104L128 98L141 111L139 140L124 159L104 146Z','#26374b','#7f7895',1.2);
  parts.body+=path('M108 106L138 143M136 106L108 152', 'none','#ad9271',4);
  parts.body+=path('M100 161L140 153L149 174L138 198L120 191L105 208L96 186Z',g(id,'purple'));
  parts.body+=path('M100 162L142 155L145 165L102 173Z',g(id,'leather'));
  parts.body+=path('M118 159L131 157L134 167L121 170L116 164Z',g(id,'gold'));
  parts.body+=path('M100 179L118 175L112 194L102 199Z','#344557','#a1a0ae',1.2);
  parts.body+=path('M132 174L145 168L144 188L135 191Z','#344557','#a1a0ae',1.2);
  parts.body+=path('M101 108L88 116L83 136L97 144L112 121Z',g(id,'purple'));
  parts.body+=path('M141 102L155 106L163 122L150 135L138 119Z',g(id,'purple'));
  parts.rearArm+=path('M86 138L97 142L101 161L89 182L79 179L83 160Z',g(id,'skin'));
  parts.frontArm+=path('M151 130L163 124L178 144L202 148L201 160L174 159L162 153Z',g(id,'skin'));
  parts.rearArm+=path('M83 162L96 165L91 184L79 182Z','#304156','#a49ab0',1.5);
  parts.frontArm+=path('M184 144L199 145L203 160L187 158Z','#304156','#a49ab0',1.5);
  parts.rearArm+=path('M80 179L90 181L92 190L83 197L74 190Z',g(id,'skin'));
  parts.frontArm+=path('M200 147L211 145L216 153L211 163L201 161Z',g(id,'skin'));
  parts.weaponFront+=`<g transform="translate(207 151) rotate(15) scale(.61)">${path('M-3-3Q-12-44 5-80Q18-99 27-101Q12-77 10-57Q11-31 5-3Z',g(id,'steel'))}${ink('M3-15Q8-49 12-68','#e2e5f4',1.3)}${path('M-12 0L13-2L15 4L-10 7Z',g(id,'gold'))}${path('M-2 7H5L5 28L0 31L-3 26Z',g(id,'leather'))}</g>`;
  parts.weaponRear+=`<g transform="translate(80 184) rotate(-44)">${path('M-3-2Q-12-37 2-65Q11-79 21-86Q11-65 10-45Q10-20 4-2Z',g(id,'steel'))}${ink('M3-12L7-49','#e2e5f4',1)}${path('M-12 0L11-2L13 5L-10 7Z',g(id,'gold'))}${path('M-2 7H5V26L1 30L-3 25Z',g(id,'leather'))}</g>`;
  parts.head+=path('M112 91L113 78L137 77L141 96L125 107Z',g(id,'skin'));
  parts.head+=path('M114 47Q125 35 137 45L141 59L139 65L147 71L141 76L136 88L129 97L118 87L110 66Z',g(id,'skin'));
  parts.head+=path('M105 72Q96 63 101 44Q111 28 131 31L146 42L149 60L139 64L137 49L128 47L116 56L115 78Z','#22233e','#182331',1.7);
  parts.head+=path('M111 39L124 33L138 37L145 48L136 45L130 55L126 45L115 57L111 68L106 65L108 49Z',g(id,'purple'));
  parts.head+=ink('M112 46L121 39L127 39M132 39L139 44M109 57L116 50','#a18dac',1.1);
  parts.head+=path('M116 70L140 66L146 73L138 86L129 97L119 88L113 80Z','#1c2d41','#778294',1.1);
  parts.head+=ink('M119 75L135 74L140 78M122 80L134 81M133 59L141 59','#bdafc5',1);
  parts.head+=path('M105 40L92 31L96 18L107 30L108 15L115 31L122 20L119 39Z','#182533','#8b829e',1.1);
  parts.head+=path('M104 36L114 35L119 42L111 46L104 42Z',g(id,'gold'));
  parts.head+=`<circle cx="112" cy="40" r="2.6" fill="#c3a8cf"/>`;
  parts.body+=rivets([[95,122],[102,138],[148,112],[155,124],[106,167],[137,160]]);
  return parts;
}
function faceDetails(kind:string):string {
  const coordinates:Record<string,[number,number]>={warrior:[139,64],archer:[136,65],mage:[136,62],tank:[143,64],assassin:[136,62]};
  const [x,y]=coordinates[kind];
  let detail=ink(`M${x-5} ${y-4}q4-2 8 0`,kind==='mage'?'#d0e4e5':'#3a2e32',1.4);
  detail+=`<path d="M${x-3} ${y}q4-2 7 0q-3 2-7 0Z" fill="#253442"/><circle cx="${x+1}" cy="${y}" r=".9" fill="${kind==='mage'?'#9de7ec':kind==='archer'?'#b9caa2':'#d2c8a8'}"/><circle cx="${x+1.3}" cy="${y-.3}" r=".35" fill="#fff4d5"/>`;
  if(kind==='warrior')detail+=ink('M127 72L130 79M120 82L124 86M135 87L136 90','#927263',.8,.7);
  if(kind==='archer')detail+=ink('M135 79Q138 78 141 79M132 84Q136 86 138 84','#b87f75',.85);
  if(kind==='mage')detail+=ink('M130 65L131 75M124 83Q131 86 135 82','#ad8b7e',.9);
  if(kind==='tank')detail+=ink('M132 68L136 70M143 67L146 69M131 73L134 74M115 67L118 71','#7e6358',.85);
  if(kind==='assassin')detail+=ink('M130 66L139 64','#917b9b',.9);
  detail+=ink(`M${x-6} ${y-5}q5-3 10-1M${x-3} ${y+2}q3 2 7 0`,kind==='mage'?'#4b3941':'#79574e',.9,.8);
  if(kind==='warrior')detail+=ink('M131 61L133 72L140 76M131 79L135 81M126 56L129 68L128 73M132 85L140 85M124 90L132 93','#684a45',1.1,.85)+ink('M125 57L127 68','#e7c3a3',.8,.7);
  if(kind==='tank')detail+=ink('M133 54L143 53M134 57L145 57M145 68L149 76L144 80M133 72L139 74M130 76L136 79M145 82L148 85M112 83L116 88','#795b53',1.05,.9)+ink('M122 46L131 46M122 49L132 49','#bb9980',.8,.75);
  if(kind==='archer')detail+=ink('M133 67L135 75L141 77M128 89Q133 91 136 87','#987064',.9)+`<circle cx="130" cy="75" r=".7" fill="#a47a65"/><circle cx="127" cy="77" r=".65" fill="#a47a65"/><circle cx="132" cy="78" r=".55" fill="#a47a65"/>`;
  if(kind==='mage')detail+=ink('M131 63L132 73L139 76M125 88L130 91L135 87','#d5a99b',1)+ink('M119 69L122 74L119 79','#91c4cc',.8,.85);
  if(kind==='assassin')detail+=ink('M130 57L132 62L130 68M134 64L140 62','#684d68',1.1)+ink('M131 58L133 63','#cdb8c4',.65,.8);
  return detail;
}
export type HeroPose=RigPose;
export const HERO_POSE_FRAMES:Record<HeroPose,number>={idle:1,move:4,attack:3,skill0:3,skill1:3,hit:1,dead:1};
type Part='cape'|'backAccessory'|'rearLeg'|'frontLeg'|'skirt'|'body'|'rearArm'|'frontArm'|'weaponRear'|'weaponFront'|'head';
type Parts=Record<Part,string>;
type V=[number,number];
interface Limb {a:V;b:V;c:V;foot?:V}
interface Anatomy {frontArm:Limb;rearArm:Limb;frontLeg:Limb;rearLeg:Limb}
function emptyParts():Parts{return{cape:'',backAccessory:'',rearLeg:'',frontLeg:'',skirt:'',body:'',rearArm:'',frontArm:'',weaponRear:'',weaponFront:'',head:''};}
const illustrations:Record<string,()=>Parts>={warrior,archer,mage,tank,assassin};
const anatomy:Record<string,Anatomy>={
 warrior:{frontArm:{a:[165,129],b:[179,157],c:[198,179]},rearArm:{a:[87,130],b:[87,161],c:[77,189]},frontLeg:{a:[143,198],b:[153,238],c:[147,277],foot:[158,297]},rearLeg:{a:[116,198],b:[109,239],c:[104,282],foot:[103,296]}},
 archer:{frontArm:{a:[146,125],b:[171,146],c:[195,142]},rearArm:{a:[95,132],b:[114,155],c:[147,151]},frontLeg:{a:[138,195],b:[142,229],c:[138,277],foot:[149,298]},rearLeg:{a:[115,196],b:[103,235],c:[101,278],foot:[95,296]}},
 mage:{frontArm:{a:[151,109],b:[171,145],c:[207,139]},rearArm:{a:[91,112],b:[80,158],c:[108,169]},frontLeg:{a:[141,190],b:[146,240],c:[147,287],foot:[151,298]},rearLeg:{a:[113,190],b:[110,239],c:[110,284],foot:[108,295]}},
 tank:{frontArm:{a:[174,143],b:[183,171],c:[204,200]},rearArm:{a:[84,140],b:[87,165],c:[81,193]},frontLeg:{a:[147,198],b:[158,239],c:[154,283],foot:[164,299]},rearLeg:{a:[113,199],b:[105,241],c:[100,282],foot:[96,300]}},
 assassin:{frontArm:{a:[154,131],b:[172,151],c:[206,154]},rearArm:{a:[91,139],b:[94,162],c:[83,186]},frontLeg:{a:[141,194],b:[154,230],c:[147,278],foot:[160,299]},rearLeg:{a:[117,196],b:[103,236],c:[92,280],foot:[82,300]}}
};
function length(a:V,b:V):number{return Math.hypot(b[0]-a[0],b[1]-a[1]);}
function unit(a:V,b:V):V {const l=length(a,b)||1;return[(b[0]-a[0])/l,(b[1]-a[1])/l];}
function plane(point:V,normal:V,positive:boolean,overlap=0):string {
 const sign=positive?1:-1,t:V=[-normal[1],normal[0]],origin:V=[point[0]-normal[0]*overlap*sign,point[1]-normal[1]*overlap*sign],extent=900;
 const points=[[0,-extent],[extent*sign,-extent],[extent*sign,extent],[0,extent]].map(([n,v])=>`${origin[0]+normal[0]*n+t[0]*v},${origin[1]+normal[1]*n+t[1]*v}`);
 return `<polygon points="${points.join(' ')}"/>`;
}
function layer(id:string,part:string,content:string,clips:string[]=[]):string {
 const clipDefs=clips.map((shape,n)=>`<clipPath id="${id}-${part}-clip-${n}">${shape}</clipPath>`).join('');
 let body=content;for(let n=clips.length-1;n>=0;n--)body=`<g clip-path="url(#${id}-${part}-clip-${n})">${body}</g>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="320" viewBox="0 0 256 320" data-rig-layer="${part}">${defs(id)}<defs>${clipDefs}</defs>${body}</svg>`;
}
function cap(id:string,p:V,material:string,r:number):string{return `<circle data-joint-cover="true" cx="${p[0]}" cy="${p[1]}" r="${r}" fill="${g(id,material)}"/>`;}
const rigCache=new Map<string,RigDefinition>();
/** All images use original source coordinates; pivots and hierarchy define the articulation. */
export function heroRig(kind:string):RigDefinition {
 const id=Object.hasOwn(illustrations,kind)?kind:'warrior',cached=rigCache.get(id);if(cached)return cached;
 const art=illustrations[id](),a=anatomy[id],parts:RigPart[]=[];
 const add=(name:string,pivot:V,body='',parent?:string,clips:string[]=[])=>parts.push({id:name,parent,pivotX:pivot[0],pivotY:pivot[1],svg:layer(id,name,body,clips)});
 add('pelvis',[128,194]);
 if(art.cape)add('cape',[112,100],art.cape,'pelvis');
 if(art.backAccessory)add('backAccessory',[100,113],art.backAccessory,'pelvis');
 for(const side of ['rear','front'] as const){
  const l=a[`${side}Leg`],normal=unit(l.a,l.b),lowNormal=unit(l.b,l.c),material=id==='warrior'||id==='tank'?'steelDark':id==='archer'?'leather':id==='mage'?'blue':'purple';
  const leg=art[`${side}Leg`];
  // Overlapping circular knee/ankle covers hide the clip seams as the joint flexes.
  add(`${side}Thigh`,l.a,leg+cap(id,l.b,material,8),'pelvis',[plane(l.b,normal,false,7)]);
  add(`${side}Shin`,l.b,leg+cap(id,l.b,material,7.5)+cap(id,l.c,material,5.5),`${side}Thigh`,[plane(l.b,normal,true,7),plane(l.c,lowNormal,false,7)]);
  add(`${side}Foot`,l.c,leg+cap(id,l.c,material,4.5),`${side}Shin`,[plane(l.c,lowNormal,true,5)]);
 }
 if(art.skirt)add('skirt',[128,165],art.skirt,'pelvis');
 add('torso',[128,190],'','pelvis');add('breastplate',[128,190],art.body,'torso');
 for(const side of ['rear','front'] as const){
  const l=a[`${side}Arm`],normal=unit(l.a,l.b),lowNormal=unit(l.b,l.c),material=id==='warrior'||id==='tank'?'steelDark':id==='mage'?'blue':id==='archer'?'skin':'skin';
  const arm=art[`${side}Arm`];
  add(`${side}UpperArm`,l.a,arm+cap(id,l.b,material,6.5),'torso',[plane(l.b,normal,false,5)]);
  add(`${side}Forearm`,l.b,arm+cap(id,l.b,material,6)+cap(id,l.c,material,4.5),`${side}UpperArm`,[plane(l.b,normal,true,5),plane(l.c,lowNormal,false,4)]);
  add(`${side}Hand`,l.c,arm+cap(id,l.c,material,4),`${side}Forearm`,[plane(l.c,lowNormal,true,4)]);
  const weapon=art[side==='front'?'weaponFront':'weaponRear'];if(weapon)add(`${side}Weapon`,l.c,weapon,`${side}Hand`);
 }
 add('head',[126,91],art.head+faceDetails(id),'torso');
 const result:RigDefinition={width:256,height:320,footX:128,footY:300,parts};rigCache.set(id,result);return result;
}
const deg=180/Math.PI;
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
function solve(l:Limb,target:V,pole=1,softReach=false):[number,number] {
 const l1=length(l.a,l.b),l2=length(l.b,l.c),dx=target[0]-l.a[0],dy=target[1]-l.a[1],reach=l1+l2-.15,raw=Math.hypot(dx,dy);
 // Soft arm reach prevents an elbow from snapping into a locked extension.
 const distance=softReach&&raw>reach-4?reach-4*Math.exp(-(raw-(reach-4))/4):raw;
 const d=clamp(distance,Math.abs(l1-l2)+.2,reach);
 const bend=Math.acos(clamp((d*d-l1*l1-l2*l2)/(2*l1*l2),-1,1))*pole;
 const first=Math.atan2(dy,dx)-Math.atan2(l2*Math.sin(bend),l1+l2*Math.cos(bend));
 const base1=Math.atan2(l.b[1]-l.a[1],l.b[0]-l.a[0]),base2=Math.atan2(l.c[1]-l.b[1],l.c[0]-l.b[0]);
 return[(first-base1)*deg,(bend-base2+base1)*deg];
}
function ease(t:number):number{return t*t*(3-2*t);}
function track(t:number,keys:[number,number][]):number {
 if(t<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){const prev=keys[i-1],next=keys[i],u=ease((t-prev[0])/(next[0]-prev[0]));return prev[1]+(next[1]-prev[1])*u;}return keys[keys.length-1][1];
}
function action(t:number,start:number,windup:number,strike:number,end=0):number{return track(t,[[0,start],[.24,windup],[.48,strike],[.7,strike*.35+end*.65],[1,end]]);}
interface ArmTarget {dx:number;dy:number;angle:number;limit?:number}
function setArm(result:RigTransform,id:string,side:'front'|'rear',goal:ArmTarget):void {
 const l=anatomy[id][`${side}Arm`],v1:V=[l.b[0]-l.a[0],l.b[1]-l.a[1]],v2:V=[l.c[0]-l.b[0],l.c[1]-l.b[1]],pole=v1[0]*v2[1]-v1[1]*v2[0]<0?-1:1;
 const [upper,lower]=solve(l,[l.c[0]+goal.dx,l.c[1]+goal.dy],pole,true);
 result.parts[`${side}UpperArm`]={angle:upper};result.parts[`${side}Forearm`]={angle:lower};
 result.parts[`${side}Hand`]={angle:clamp(goal.angle-upper-lower,-(goal.limit??55),goal.limit??55)};
}
function footTrajectory(phase:number,stride:number,lift:number):V {
 const p=((phase%1)+1)%1,stance=.62;
 if(p<stance)return[stride*(1-2*p/stance),0];
 const u=(p-stance)/(1-stance),tangent=-2*stride*(1-stance)/stance;
 const x=(2*u*u*u-3*u*u+1)*(-stride)+(u*u*u-2*u*u+u)*tangent+(-2*u*u*u+3*u*u)*stride+(u*u*u-u*u)*tangent;
 return[x,-lift*Math.sin(Math.PI*u)**2];
}
/** Continuous, bounded local joint deltas. No SVG re-generation is required at runtime. */
export function heroRigMotion(kind:string,pose:RigPose,phase:number):RigTransform {
 const id=Object.hasOwn(illustrations,kind)?kind:'warrior',safePose:RigPose=Object.hasOwn(HERO_POSE_FRAMES,pose)?pose:'idle';
 const raw=Number.isFinite(phase)?phase:0,t=safePose==='idle'||safePose==='move'?((raw%1)+1)%1:clamp(raw,0,1),cycle=t*Math.PI*2;
 const r:RigTransform={parts:{},offsetX:0,offsetY:0,rotation:0};
 const stance:Record<string,{crouch:number;lean:number;rear:number;front:number}>={warrior:{crouch:3,lean:-1.8,rear:-3,front:4},archer:{crouch:2,lean:-1,rear:1,front:-3},mage:{crouch:2,lean:-.5,rear:0,front:0},tank:{crouch:5,lean:-3,rear:-6,front:5},assassin:{crouch:8,lean:6,rear:-8,front:8}};
 const st=stance[id];let pelvisY=st.crouch+Math.sin(cycle)*.5,body=st.lean,head=-st.lean*.55;
 let front:ArmTarget={dx:id==='archer'?-1:0,dy:0,angle:id==='mage'?0:id==='archer'?1:0},rear:ArmTarget={dx:0,dy:0,angle:0};
 let rearFoot:V=[st.rear,0],frontFoot:V=[st.front,0],cape=Math.sin(cycle-.4)*1.1,skirt=Math.sin(cycle)*.4;
 if(safePose==='move'){
  const stride={warrior:17,archer:20,mage:9,tank:11,assassin:23}[id]!,lift={warrior:13,archer:17,mage:8,tank:10,assassin:21}[id]!;
  pelvisY=st.crouch+2+Math.cos(cycle*2)*1.1;body=id==='assassin'?9:id==='tank'?2:1.5;head=-body*.5;
  rearFoot=footTrajectory(t+.5,stride,lift);frontFoot=footTrajectory(t,stride,lift);
  const swing=Math.sin(cycle),magnitude=id==='tank'?2:id==='mage'?3:id==='archer'?4:7;
  front={dx:swing*magnitude,dy:Math.cos(cycle)*1.2,angle:id==='mage'?0:swing*3};rear={dx:-swing*magnitude,dy:-Math.cos(cycle)*1.2,angle:-swing*3};cape=swing*(id==='assassin'?5:2.5);skirt=Math.sin(cycle+.7)*1.1;
 }else if(safePose==='attack'||safePose==='skill0'||safePose==='skill1'){
  const small=safePose==='skill0',big=safePose==='skill1';
  body+=action(t,0,-2,id==='tank'?4:id==='assassin'?7:4);head-=action(t,0,-1,2);pelvisY+=action(t,0,1,2);cape=action(t,0,-2,6);
  rearFoot=[st.rear+action(t,0,-3,-6),0];frontFoot=[st.front+action(t,0,3,6),0];
  if(id==='warrior'){
   front=big?{dx:action(t,0,-12,-34),dy:action(t,0,-15,-34),angle:action(t,0,-18,-12)}:{dx:action(t,0,-8,small?-79:-73),dy:action(t,0,-42,-23),angle:track(t,[[0,0],[.27,-40],[.38,-10],[.50,small?103:95],[.61,0],[1,0]])};
   rear={dx:action(t,0,-3,big?27:8),dy:action(t,0,-4,big?-35:-8),angle:action(t,0,-4,big?-20:5)};
  }else if(id==='tank'){
   front=small||big?{dx:action(t,0,-4,-7),dy:action(t,0,-4,-8),angle:action(t,0,-3,-6)}:{dx:action(t,0,-7,-72),dy:action(t,0,-48,-25),angle:track(t,[[0,0],[.27,-30],[.38,-6],[.50,80],[.61,0],[1,0]])};
   rear={dx:action(t,0,small?7:3,big?24:small?22:4),dy:action(t,0,-4,big?-35:small?-15:-3),angle:action(t,0,-6,big?-18:small?-10:2)};
  }else if(id==='archer'){
   front=big?{dx:action(t,0,-7,-25),dy:action(t,0,-12,-33),angle:action(t,0,-18,-61)}:{dx:action(t,0,0,2),dy:action(t,0,-1,0),angle:action(t,0,-1,1)};
   const repeat=small?Math.sin(t*Math.PI*6)*Math.sin(t*Math.PI):0;
   rear={dx:big?action(t,0,-1,16):action(t,0,-8,3)+repeat*3,dy:big?action(t,0,-12,-49):action(t,0,-2,3),angle:big?action(t,0,-18,-50):action(t,0,-3,3)};
  }else if(id==='mage'){
   front={dx:action(t,0,-1,big?1:3),dy:action(t,0,-2,big?-7:-2),angle:action(t,0,-1,big?-1:1)};
   rear={dx:action(t,0,-8,big?35:small?38:15),dy:action(t,0,-12,big?-65:small?-26:-18),angle:action(t,0,-8,big?-18:small?-8:6)};
  }else{
   front={dx:action(t,0,-12,big?-32:small?-45:-35),dy:action(t,0,-22,big?4:small?14:8),angle:big?action(t,0,-25,-52):track(t,[[0,0],[.24,-25],[.48,small?71:57],[.61,0],[1,0]])};
   rear={dx:action(t,0,-4,big?31:small?-6:14),dy:action(t,0,-10,big?-29:small?-21:-16),angle:action(t,0,12,big?65:small?-28:-12)};
  }
 }else if(safePose==='hit'){
  const amount=Math.sin(t*Math.PI);body-=amount*5;head-=amount*3;front={dx:-amount*4,dy:amount*3,angle:amount*5};rear={dx:amount*3,dy:amount*2,angle:-amount*5};cape=-amount*4;
 }else if(safePose==='dead'){
  // Progressive knee collapse and a forward torso fold. Kept inside the shared cell.
  const k=ease(t);pelvisY=st.crouch+k*30;body+=k*33;head+=k*13;front={dx:-k*36,dy:k*2,angle:-k*38};rear={dx:k*9,dy:-k*12,angle:k*22};rearFoot=[-20*k,0];frontFoot=[22*k,0];cape=k*15;
 }
 if(id==='mage'){
  // Keep a long staff balanced in the grip instead of letting torso recoil sweep
  // its crown through the atlas edge. The other arm supplies the spell gesture.
  front.angle=-body;
  if(safePose==='dead'){const k=ease(t),brace=ease(Math.min(1,t*2));front={dx:-86*brace,dy:12*k,angle:45*brace-body,limit:75};}
 }
 if(id==='assassin'&&safePose==='move')front={dx:-6+Math.sin(cycle)*3,dy:Math.cos(cycle)*1.2,angle:-body};
 r.parts.pelvis={y:pelvisY};r.parts.torso={angle:body};r.parts.head={angle:head};if(id!=='mage')r.parts.cape={angle:cape};if(id==='archer')r.parts.backAccessory={angle:cape*.35};if(id==='mage')r.parts.skirt={angle:skirt,y:safePose==='dead'?-pelvisY:0};
 for(const side of ['rear','front'] as const){const l=anatomy[id][`${side}Leg`],foot=side==='rear'?rearFoot:frontFoot;const [upper,lower]=solve(l,[l.c[0]+foot[0],l.c[1]+foot[1]-pelvisY],1);r.parts[`${side}Thigh`]={angle:upper};r.parts[`${side}Shin`]={angle:lower};r.parts[`${side}Foot`]={angle:-upper-lower};}
 setArm(r,id,'front',front);setArm(r,id,'rear',rear);
 return r;
}
type Matrix=[number,number,number,number,number,number];
function mul(a:Matrix,b:Matrix):Matrix{return[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];}
function transform(x:number,y:number,angle=0):Matrix{const a=angle/deg,c=Math.cos(a),s=Math.sin(a);return[c,s,-s,c,x,y];}
/** A static atlas sample uses exactly the same rig and motion as runtime. */
export function heroSvg(kind:string,pose:HeroPose='idle',frame=0):string {
 const id=Object.hasOwn(illustrations,kind)?kind:'warrior',p:HeroPose=Object.hasOwn(HERO_POSE_FRAMES,pose)?pose:'idle',n=HERO_POSE_FRAMES[p],f=Number.isFinite(frame)?((Math.trunc(frame)%n)+n)%n:0;
 const phase=p==='idle'?0:p==='move'?f/n:p==='hit'?.5:p==='dead'?1:[.18,.48,.76][f]??0;
 const rig=heroRig(id),state=heroRigMotion(id,p,phase),matrices=new Map<string,Matrix>(),byId=new Map(rig.parts.map(part=>[part.id,part]));
 const root=transform(rig.footX+(state.offsetX??0),rig.footY+(state.offsetY??0),state.rotation??0);let body='';
 for(const part of rig.parts){const parent=part.parent?byId.get(part.parent):undefined,parentMatrix=part.parent?matrices.get(part.parent)!:root,v=state.parts[part.id]??{};const local=transform(part.pivotX-(parent?.pivotX??rig.footX)+(v.x??0),part.pivotY-(parent?.pivotY??rig.footY)+(v.y??0),v.angle??0),world=mul(parentMatrix,local);matrices.set(part.id,world);const imageMatrix=mul(world,transform(-part.pivotX,-part.pivotY));const content=part.svg.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'').replace(defs(id),'');body+=`<g data-part="${part.id}" transform="matrix(${imageMatrix.join(' ')})">${content}</g>`;}
 return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="320" viewBox="0 0 256 320" data-hero="${id}" data-pose="${p}" data-frame="${f}" data-rig-version="5">${defs(id)}<ellipse data-part="ground-shadow" cx="128" cy="300" rx="60" ry="8" fill="#030b13" opacity=".38"/>${body}</svg>`;
}
