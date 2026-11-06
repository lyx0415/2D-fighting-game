import type { RigDefinition, RigPart, RigPose, RigTransform } from './rig-types';
/**
 * Original editable vector hero illustrations, revision v006.
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
  ${headDefs(id)}</defs>`;
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
  parts.body+=rivets([[95,122],[102,138],[148,112],[155,124],[106,167],[137,160]]);
  return parts;
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
 add('head',[126,91],headArt(id,defaultHeadView(id)),'torso');
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
 return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="320" viewBox="0 0 256 320" data-hero="${id}" data-pose="${p}" data-frame="${f}" data-rig-version="6">${defs(id)}<ellipse data-part="ground-shadow" cx="128" cy="300" rx="60" ry="8" fill="#030b13" opacity=".38"/>${body}</svg>`;
}
export type HeroFaceView='front'|'threeQuarter'|'profile';
interface FacePalette {light:string;base:string;shade:string;deep:string;lip:string;eye:string}
const facePalettes:Record<string,FacePalette>={
 warrior:{light:'#f1d2b0',base:'#caa28b',shade:'#92705f',deep:'#5a4845',lip:'#8c625b',eye:'#a8bdc1'},
 archer:{light:'#f4ddc5',base:'#d6b19d',shade:'#a18073',deep:'#65535a',lip:'#aa746d',eye:'#a9bd94'},
 mage:{light:'#c3a18b',base:'#8e7068',shade:'#64535a',deep:'#3a3445',lip:'#715056',eye:'#a4dadd'},
 tank:{light:'#e5cbb0',base:'#bfa38e',shade:'#938172',deep:'#625d59',lip:'#7d625c',eye:'#acb9bc'},
 assassin:{light:'#e8d0c9',base:'#bea1a3',shade:'#897685',deep:'#4f465f',lip:'#866675',eye:'#c3afcc'}
};
function headDefs(id:string):string {
 const c=facePalettes[id]??facePalettes.warrior;
 return `<linearGradient id="${id}-faceBase" x1=".1" y1=".05" x2=".9" y2=".9"><stop stop-color="${c.light}"/><stop offset=".42" stop-color="${c.base}"/><stop offset="1" stop-color="${c.shade}"/></linearGradient><linearGradient id="${id}-faceFar" x1="0" y1="0" x2="1" y2=".5"><stop stop-color="${c.base}"/><stop offset="1" stop-color="${c.deep}"/></linearGradient><radialGradient id="${id}-faceCheek" cx=".28" cy=".2" r=".82"><stop stop-color="${c.light}"/><stop offset=".55" stop-color="${c.base}"/><stop offset="1" stop-color="${c.shade}"/></radialGradient><linearGradient id="${id}-faceNose" x1="0" y1=".2" x2="1" y2=".5"><stop stop-color="${c.light}"/><stop offset=".4" stop-color="${c.base}"/><stop offset=".64" stop-color="${c.light}"/><stop offset="1" stop-color="${c.shade}"/></linearGradient><linearGradient id="${id}-faceNeck" x1="0" y1="0" x2=".6" y2="1"><stop stop-color="${c.deep}"/><stop offset=".45" stop-color="${c.shade}"/><stop offset="1" stop-color="${c.base}"/></linearGradient>`;
}
function defaultHeadView(id:string):HeroFaceView{return id==='tank'||id==='mage'?'front':'threeQuarter';}
function faceOutline(id:string,view:HeroFaceView):string {
 if(view==='profile'){
  if(id==='tank')return 'M106 44Q120 30 140 42L147 57L145 66L158 75L150 81L148 95L136 103L117 100L105 85L101 66Z';
  if(id==='assassin')return 'M113 46Q126 34 138 44L143 58L141 65L151 72L143 78L139 88L131 98L119 88L110 66Z';
  if(id==='archer')return 'M111 47Q123 34 137 45L143 59L141 66L151 73L143 78L139 88L130 96L119 90L110 75L107 60Z';
  if(id==='mage')return 'M111 43Q124 30 138 42L144 57L141 65L152 72L144 78L139 92L130 100L117 91L109 75L107 58Z';
  return 'M107 46Q124 31 140 45L147 60L144 67L155 75L147 81L144 94L134 99L118 97L107 85L102 66Z';
 }
 if(view==='front'){
  if(id==='tank')return 'M99 48Q101 29 128 29Q153 30 157 51L156 77Q152 95 138 103L117 103Q102 95 99 78Z';
  if(id==='warrior')return 'M104 47Q108 31 128 32Q149 32 152 51L150 77L141 93L132 99L117 96L107 86L103 69Z';
  if(id==='archer')return 'M108 47Q111 32 128 33Q147 34 150 52L147 75Q144 88 129 98Q114 92 109 77L107 61Z';
  if(id==='mage')return 'M109 44Q113 29 128 30Q144 31 147 49L145 77Q142 92 129 101Q116 96 111 80L108 60Z';
  return 'M111 45Q115 31 129 32Q144 33 148 50L144 76L138 88L130 99L120 90L113 77L109 60Z';
 }
 if(id==='tank')return 'M101 46Q105 29 127 30Q149 31 154 50L154 78Q150 96 139 104L119 103L105 94L99 77Z';
 if(id==='warrior')return 'M105 47Q109 31 128 32Q145 33 149 51L149 74L143 91L134 99L119 98L107 88L102 70Z';
 if(id==='archer')return 'M109 47Q113 32 129 33Q145 34 149 51L146 74Q142 88 131 98L120 92L111 80L107 62Z';
 if(id==='mage')return 'M110 44Q114 29 130 30Q146 32 148 50L146 77Q142 94 131 101L120 94L112 80L108 60Z';
 return 'M112 45Q117 31 130 32Q145 33 149 50L146 74L140 88L132 100L121 91L113 78L109 61Z';
}
function ear(id:string,x:number,y:number,far=false,pointed=false):string {
 const c=facePalettes[id],size=far?3.5:5;
 return `<g data-face-part="${far?'far-ear':'near-ear'}">${path(pointed?`M${x+2} ${y-7}L${x-9} ${y-12}L${x-4} ${y+7}Q${x+3} ${y+10} ${x+4} ${y+1}Z`:`M${x+2} ${y-8}Q${x-size-4} ${y-10} ${x-size} ${y+3}Q${x-2} ${y+11} ${x+4} ${y+6}L${x+6} ${y-2}Z`,far?g(id,'faceFar'):g(id,'faceBase'),c.shade,.75)}${ink(`M${x} ${y-4}Q${x-4} ${y-5} ${x-2} ${y+3}L${x+1} ${y+1}`,c.deep,.8,.8)}</g>`;
}
function eye(id:string,x:number,y:number,w:number,far:boolean):string {
 const c=facePalettes[id],brow=id==='tank'?2.1:id==='warrior'?1.8:id==='mage'?1.4:1.2,iris=far?1.1:1.45;
 return `<g data-face-part="${far?'far-eye':'near-eye'}"><path d="M${x-w*.62} ${y-2}Q${x} ${y-6} ${x+w*.55} ${y-2}L${x+w*.46} ${y+3}Q${x} ${y+5} ${x-w*.53} ${y+2}Z" fill="${c.deep}" opacity="${far?.23:.16}"/>${ink(`M${x-w*.55} ${y-4.3}Q${x} ${y-(id==='archer'?7:6)} ${x+w*.55} ${y-4.1}`,id==='mage'?'#bdc5c6':id==='tank'?'#625f5c':'#4c3b42',brow)}${path(`M${x-w*.5} ${y}Q${x} ${y-3.7} ${x+w*.5} ${y}Q${x} ${y+2.7} ${x-w*.5} ${y}Z`,far?'#c3beb2':'#d9d8cb',c.deep,.65)}<ellipse cx="${x+1.1}" cy="${y-.05}" rx="${iris}" ry="${far?1.3:1.7}" fill="${c.eye}"/><ellipse cx="${x+1.25}" cy="${y}" rx=".7" ry="1.25" fill="#1a2735"/><circle cx="${x+.8}" cy="${y-.8}" r=".48" fill="#fff8e6"/>${ink(`M${x-w*.44} ${y+3.4}Q${x} ${y+5.1} ${x+w*.39} ${y+2.7}`,c.shade,.75,.8)}</g>`;
}
function facialVolume(id:string,view:HeroFaceView):string {
 const c=facePalettes[id],front=view==='front',profile=view==='profile',nx=front?128:profile?143:135,mx=front?128:profile?139:132;
 let s=`<g data-face-angle="${view}" data-face-part="face-volume">`;
 if(profile){
  s+=path('M110 57Q116 45 131 44L137 62L134 78L127 92L116 86L108 74Z',g(id,'faceCheek'),'none',0);
  s+=path('M135 47L143 57L140 66L151 73L142 76L136 69Z',g(id,'faceNose'),'none',0);
  s+=path('M132 78L143 78L138 91L130 97L118 91L127 87Z',g(id,'faceFar'),'none',0);
  s+=eye(id,137,63.5,8.5,false);
  s+=ink('M138 58L139 68L146 73M141 76L147 75',c.shade,1);
  s+=path('M142 74Q146 72 148 75L145 77Z',c.deep,'none',0);
  s+=ink(`M${mx-6} 84Q${mx} 82 ${mx+5} 83M${mx-4} 87L${mx+3} 86`,c.lip,.95);
 }else{
  const farX=front?140:141,nearX=front?116:120,nearW=front?10.5:11,farW=front?10:7.6;
  s+=path(front?'M133 42Q147 46 149 61L146 78L138 91L131 97L130 80L135 68Z':'M136 40L147 49L149 65L144 82L135 97L132 83L137 67Z',g(id,'faceFar'),'none',0);
  s+=path(front?'M109 66Q117 67 124 74L124 85L117 89L109 79Z':'M108 64Q117 67 128 75L126 86L119 92L110 82Z',g(id,'faceCheek'),'none',0);
  s+=path(front?'M137 69L145 67L146 77L137 86L133 81Z':'M140 68L147 64L145 78L137 88L136 80Z',g(id,'faceBase'),'none',0);
  s+=eye(id,nearX,64,nearW,false)+eye(id,farX,62.7,farW,true);
  s+=path(`M${nx-2.8} 58L${nx+1.1} 58.6L${nx+4.1} 73.5Q${nx+5.6} 77 ${nx+1} 78L${nx-4.5} 75Z`,g(id,'faceNose'),c.shade,.6);
  s+=path(`M${nx+1.5} 60L${nx+4.6} 72L${nx+7} 75L${nx+4} 78L${nx+1} 75Z`,c.shade,'none',0);
  s+=path(`M${nx-5.8} 74Q${nx-2.8} 71.8 ${nx-.3} 75.2L${nx-1.7} 77L${nx-5.1} 77Z`,g(id,'faceBase'),c.shade,.65);
  s+=ink(`M${nx-4.2} 76L${nx-1.4} 76.4M${nx+3.5} 76.4L${nx+5.4} 75.7`,c.deep,.85);
  s+=ink(`M${nx-2} 60L${nx-2.3} 68`,c.light,.9,.8);
  s+=path(`M${mx-7.3} 84Q${mx-2.5} 82.2 ${mx} 83.5Q${mx+3} 82.1 ${mx+7.2} 83.5Q${mx+1} 86.6 ${mx-7.3} 84Z`,c.lip,'none',0);
  s+=ink(`M${mx-6.3} 84.1Q${mx+.5} 85.4 ${mx+6.4} 83.9`,c.deep,.75,.85);
  s+=path(`M${mx-4.5} 86.4Q${mx+.3} 88.8 ${mx+5} 85.8L${mx+2.3} 88.5L${mx-2.4} 89Z`,c.light,'none',0);
  s+=ink(`M${mx-8.8} 82.5L${mx-8.7} 86M${mx+8.2} 82L${mx+8.4} 85.1`,c.shade,.75);
  s+=path(front?'M115 91Q129 97 140 91L132 99L120 96Z':'M119 93L128 94L135 91L132 98L124 98Z',g(id,'faceBase'),'none',0);
  if(id==='warrior'||id==='tank')s+=ink(`M${nearX-5} 69L${nearX+2} 72M${farX-3} 68L${farX+3} 67`,c.shade,.9,.8);
 }
 if(id==='warrior')s+=ink(profile?'M124 57L127 70L125 76M128 89L133 92':'M113 56L116 65L115 73M113 75L116 77M123 90L130 93',c.deep,.9,.65)+ink(profile?'M125 57L128 69':'M114 56L117 66',c.light,.6,.8);
 if(id==='tank')s+=ink(profile?'M125 52L133 53M128 55L136 56M128 68L134 70M139 79L143 81':'M116 49Q128 46 139 49M116 52Q128 50 140 52M110 67L115 70M111 71L115 73M143 67L148 66M139 77L143 80',c.deep,.8,.65);
 if(id==='archer')s+=`<g fill="${c.shade}" opacity=".6"><circle cx="113" cy="73" r=".6"/><circle cx="116" cy="74.5" r=".55"/><circle cx="120" cy="72.5" r=".6"/></g>`;
 if(id==='mage')s+=ink(profile?'M125 73L128 78L125 82':'M111 72L114 76L111 81','#a6cdcd',.75,.9)+ink(profile?'M129 80L132 82':'M118 91L125 95',c.deep,.7,.6);
 if(id==='assassin')s+=ink(profile?'M132 56L134 64L132 69':'M116 56L118 62L116 68',c.deep,.9,.85);
 return s+'</g>';
}
function headArt(id:string,view:HeroFaceView):string {
 const c=facePalettes[id],front=view==='front',profile=view==='profile';let s='';
 const hair=id==='mage'?g(id,'silverHair'):id==='assassin'?g(id,'purple'):g(id,'hair');
 // The far shell and hair are drawn behind ears and the facial volume.
 if(id==='warrior')s+=path(front?'M99 64Q91 34 110 25Q133 16 151 32L157 60L147 76L104 78Z':'M101 66Q92 36 110 26Q132 18 149 34L154 60L143 77L105 79Z',g(id,'steelDark'));
 if(id==='tank')s+=path(front?'M94 69Q90 35 108 24Q130 15 151 29L161 55L155 78L98 83Z':'M97 68Q90 36 108 25Q131 17 151 32L159 58L150 82L100 83Z',g(id,'steelDark'));
 if(id==='archer'){
  s+=path(front?'M99 93Q87 57 98 35Q111 19 132 24Q152 25 157 49L153 88L139 107L108 108Z':'M101 94Q90 58 99 37Q111 22 130 25Q149 26 154 50L149 89L136 107L110 108Z',g(id,'green'));
  s+=path('M105 61Q91 83 98 105Q111 119 100 134Q96 144 109 151L116 143Q107 135 113 126Q121 113 108 101Q102 87 113 68Z',hair,'#463638',1.1);
  s+=ink('M106 70Q96 89 105 103Q117 117 105 133Q102 142 111 146','#dbad77',1.2);
  s+=ink('M100 88L108 94M101 100L111 106M110 113L111 121M109 126L102 133','#674432',1.1);
 }
 if(id==='mage')s+=path(front?'M100 113L102 48Q99 28 117 24Q138 19 148 34Q158 53 151 80L157 114L141 111L133 87L113 91L109 114Z':'M101 113L101 52Q99 31 115 25Q136 20 149 38L152 81L156 113L142 110L133 89L112 93L108 114Z',hair);
 if(id==='assassin')s+=path(front?'M104 81Q96 56 104 39Q115 23 135 28Q154 31 155 51L148 77L137 91L111 88Z':'M106 83Q98 59 105 40Q117 25 135 29Q151 31 153 51L146 79L132 92L112 89Z',hair);
 s+=path('M113 85L138 85L142 99L127 111L110 100Z',g(id,'faceNeck'),'#5a626b',.8);
 s+=path(front?'M115 86L140 86L138 95Q128 99 115 94Z':'M116 86L141 85L137 95L124 101L115 96Z',c.deep,'none',0);
 if(front){s+=ear(id,id==='tank'?99:106,66,false,id==='archer');s+=ear(id,id==='tank'?153:147,65,true,id==='archer');}
 else if(profile)s+=ear(id,113,67,false,id==='archer');
 else{s+=ear(id,104,65,false,id==='archer');s+=ear(id,146,63,true,id==='archer');}
 s+=path(faceOutline(id,view),g(id,'faceBase'),c.deep,1.05);
 s+=facialVolume(id,view);
 if(id==='warrior'){
  s+=path(front?'M103 53Q103 33 120 32L138 34L149 48L141 51L132 42L121 46L112 43L108 57Z':'M105 54Q104 36 120 33L137 35L146 47L139 52L132 43L120 48L112 43L109 57Z',hair,'#473937',.8);
  s+=path(front?'M98 55Q95 35 110 27Q129 18 147 30L155 49L147 53L140 38L127 33L113 39L106 54Z':'M100 56Q96 37 111 27Q130 20 146 32L154 50L146 55L138 39L125 34L112 41L107 57Z',g(id,'steel'));
  s+=path(front?'M99 53L109 55L111 83L103 89L98 76Z':'M101 54L111 57L114 82L107 88L101 76Z',g(id,'steelDark'));
  s+=path(front?'M147 53L155 51L155 77L147 86L144 77Z':'M146 54L153 52L153 75L147 83L144 75Z',g(id,'steelDark'));
  s+=ink(front?'M102 41Q128 20 149 40M128 27L129 45':'M104 42Q127 23 148 43M130 29L133 45','#e6e5d5',1.25);
  s+=ink(front?'M107 50L121 46M135 46L148 49':'M109 51L125 47M135 47L147 51','#c3d3d7',1.4);
  s+=path('M111 96Q125 105 140 96L141 103L126 112L111 104Z',g(id,'steelDark'),'#99aab4',1);
 }
 if(id==='archer'){
  s+=path(front?'M105 57Q100 37 118 30Q138 28 148 45L145 56L135 43L124 47L115 40L110 61Z':'M108 57Q102 39 118 32Q139 29 148 47L142 56L134 43L123 49L115 42L111 62Z',hair,'#65462f',.8);
  s+=ink(front?'M110 40Q122 33 134 37M111 49L117 40M138 39L144 49':'M111 42Q124 34 137 39M113 48L119 41M137 42L143 50','#e0b47a',1.1);
  s+=path(front?'M97 56Q92 36 105 28Q126 17 147 32L155 55L147 56L140 38Q123 29 109 39L104 59Z':'M100 57Q95 39 106 30Q125 19 146 34L154 56L146 58L138 40Q124 31 111 41L106 61Z',g(id,'green'),'#1d3b3d',1.2);
  s+=ink(front?'M100 45Q104 29 124 26Q144 25 151 46':'M103 46Q108 31 125 28Q143 28 150 47','#c5af7b',1.1);
  s+=path('M103 35Q85 31 85 10Q102 15 111 34Z','#88a28b','#294640',1);
  s+=path('M110 35Q98 21 106 8Q120 21 117 35Z','#c2caad','#294640',1);
  s+=ink('M90 17L108 37M108 14L113 35','#e6d4a0',.9);
  s+=`<circle cx="109" cy="39" r="3.1" fill="${g(id,'gold')}"/>`;
 }
 if(id==='mage'){
  s+=path(front?'M104 58Q99 35 116 27Q136 23 147 38L150 58L142 66L139 43L129 39L119 45L111 61L108 94L99 112L105 85Z':'M107 59Q101 37 117 28Q139 25 148 42L149 60L142 67L137 44L128 40L119 47L112 64L108 96L101 113L106 85Z',hair,'#6c8397',.9);
  s+=path(front?'M141 45L149 48L147 87L154 111L144 109L138 87Z':'M140 47L147 50L145 87L151 111L143 108L137 86Z',hair,'#6c8397',.8);
  s+=ink(front?'M109 42Q117 29 131 30M110 54L115 43M107 78L105 101M144 53L143 85L148 105':'M111 43Q122 30 135 33M113 55L118 43M109 80L106 103M143 56L141 86L146 105','#e6eee7',1.1,.9);
  s+=path(front?'M102 41L107 28L115 35L126 22L137 35L146 28L151 43L140 40L129 46L116 40L107 46Z':'M105 42L110 29L118 35L129 23L138 36L146 30L151 44L141 40L131 46L119 41L110 47Z',g(id,'gold'),'#7b775e',.9);
  s+=path(front?'M126 27Q110 18 119 7Q118 19 136 19Q130 21 126 27Z':'M129 28Q113 19 122 8Q121 20 139 20Q133 22 129 28Z','#e3e6d4','#7d969c',.8);
  s+=`<path d="M${front?128:131} 35l4 5l-4 5l-4-5Z" fill="${g(id,'gem')}" stroke="#eee1af" stroke-width=".8"/>`;
 }
 if(id==='tank'){
  s+=path(front?'M103 79Q111 83 118 80L127 84L139 80L151 82L149 101L140 113L126 118L112 112L103 100Z':'M106 80Q116 84 123 80L132 84L142 79L152 82L147 103L136 116L122 116L111 109L104 98Z',g(id,'silverHair'),'#71828a',.9);
  s+=path(front?'M111 84Q119 79 128 84Q138 79 145 84L143 89L131 88L127 91L122 88L112 89Z':'M115 84Q123 79 131 84Q141 79 147 83L144 89L133 88L130 91L124 88L115 89Z','#aeb7b5','#71828a',.7);
  s+=ink(front?'M111 92L115 105M119 92L122 111M128 95L128 114M136 92L133 111M144 91L139 105':'M113 92L118 106M123 93L126 112M133 95L132 113M143 92L137 108','#6a7d89',.9,.9);
  s+=ink(front?'M114 94L118 106M131 96L130 110M140 92L137 104':'M117 93L121 106M136 95L133 109','#edf1df',.75,.85);
  s+=path(front?'M94 56Q91 35 107 25Q131 15 151 29L161 53L152 58L144 39L128 33L112 40L103 60Z':'M98 57Q94 36 109 27Q131 18 150 32L159 55L150 59L142 41L127 35L113 42L106 62Z',g(id,'steelDark'),'#253b4b',1.3);
  s+=path(front?'M95 55L106 57L109 83L101 88L94 75Z':'M99 57L109 59L112 84L105 89L99 76Z',g(id,'steel'));
  s+=path(front?'M151 56L160 54L159 78L151 86L147 76Z':'M150 58L158 56L156 77L149 85L146 75Z',g(id,'steel'));
  s+=path(front?'M100 42L109 30L128 25L147 34L155 49L148 51L140 39L127 34L113 41L107 48Z':'M104 44L112 32L129 28L146 36L153 51L147 54L139 42L128 37L115 44L109 50Z',g(id,'gold'),'#495254',1);
  s+=path('M119 26Q114 16 123 12L131 25Z','#304d75','#b59a6c',1);
  s+=ink(front?'M128 26V36M106 39L109 44M148 39L152 46':'M130 29L131 38M110 41L112 46M146 42L151 48','#efe0b5',1);
 }
 if(id==='assassin'){
  s+=path(front?'M104 62Q99 40 112 30Q130 22 145 34L153 52L147 66L139 58L138 43L129 49L120 40L111 58L110 75Z':'M107 64Q101 42 114 32Q131 24 146 36L153 54L146 67L139 58L137 45L127 51L119 42L112 59L112 77Z',g(id,'purple'),'#162536',1.1);
  s+=ink(front?'M111 43L120 34L131 35M113 52L120 44M137 36L146 48':'M114 45L122 36L134 38M115 54L121 46M138 39L147 51','#9d89ab',1);
  s+=path(front?'M111 76L128 79L145 74L146 86L138 95L129 101L118 95L110 87Z':'M114 76L131 80L145 74L146 85L139 95L132 101L121 95L113 86Z','#243448','#718196',.8);
  s+=path(front?'M129 80L145 76L143 88L130 98Z':'M132 81L145 76L143 88L133 98Z','#15263b','none',0);
  s+=ink(front?'M115 83L128 86L140 82M118 89L128 92L138 88':'M118 83L132 87L142 82M122 90L132 94L140 89','#a1acb7',.8);
  s+=path('M108 38L94 30L98 17L108 29L112 14L120 30L128 23L124 40Z','#182735','#8b82a0',1);
  s+=path('M109 35L118 34L123 41L116 47L109 43Z',g(id,'gold'),'#786550',.8);
  s+=`<circle cx="116" cy="40" r="2.3" fill="#c5aed4"/>`;
 }
 return `<g data-head-view="${view}" data-hero-head="${id}">${s}</g>`;
}
/** A deliberately cropped head/neck portrait; long braid and hair tails may meet the lower crop. */
export function heroPortraitSvg(kind:string,view:HeroFaceView='threeQuarter'):string {
 const id=Object.hasOwn(illustrations,kind)?kind:'warrior',safeView:HeroFaceView=['front','threeQuarter','profile'].includes(view)?view:'threeQuarter';
 return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="144" viewBox="84 0 84 112" data-hero-portrait="${id}" data-face-view="${safeView}" data-art-version="6">${defs(id)}${headArt(id,safeView)}</svg>`;
}
