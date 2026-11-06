import type { RigDefinition, RigPart, RigPose, RigTransform } from './rig-types';
/**
 * Original editable vector hero illustrations, revision v007.
 * Canvas 256 × 320; right-facing, foot anchor (128, 300).
 * Editable artwork and continuous joint motion share one anatomical rig.
 */
function defs(id: string): string {
  return `<defs>
  <linearGradient id="${id}-steel" x1="0" y1="0" x2=".9" y2=".8"><stop stop-color="#aeb4a7"/><stop offset=".25" stop-color="#68777a"/><stop offset=".48" stop-color="#969f96"/><stop offset=".53" stop-color="#49575b"/><stop offset="1" stop-color="#252f32"/></linearGradient>
  <linearGradient id="${id}-steelDark" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#68777a"/><stop offset=".46" stop-color="#425d72"/><stop offset="1" stop-color="#172838"/></linearGradient>
  <linearGradient id="${id}-gold" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="#b8a57a"/><stop offset=".32" stop-color="#8b7852"/><stop offset=".61" stop-color="#b4a27a"/><stop offset="1" stop-color="#514b39"/></linearGradient>
  <linearGradient id="${id}-red" x1="0" y1="0" x2="1" y2=".4"><stop stop-color="#21172b"/><stop offset=".4" stop-color="#3c272c"/><stop offset=".7" stop-color="#5e3436"/><stop offset="1" stop-color="#381b31"/></linearGradient>
  <linearGradient id="${id}-green" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#4e5847"/><stop offset=".43" stop-color="#303e34"/><stop offset="1" stop-color="#102a2e"/></linearGradient>
  <linearGradient id="${id}-blue" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="#465058"/><stop offset=".44" stop-color="#29333d"/><stop offset="1" stop-color="#101b35"/></linearGradient>
  <linearGradient id="${id}-purple" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#4c4651"/><stop offset=".35" stop-color="#302c38"/><stop offset="1" stop-color="#121b2d"/></linearGradient>
  <linearGradient id="${id}-leather" x1="0" y1="0" x2="1" y2=".6"><stop stop-color="#8b7256"/><stop offset=".45" stop-color="#584535"/><stop offset="1" stop-color="#302e30"/></linearGradient>
  <linearGradient id="${id}-skin" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#efc9aa"/><stop offset=".5" stop-color="#d4a98d"/><stop offset="1" stop-color="#8e6359"/></linearGradient>
  <linearGradient id="${id}-hair" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c18a56"/><stop offset=".4" stop-color="#794b37"/><stop offset="1" stop-color="#322b2c"/></linearGradient>
  <linearGradient id="${id}-silverHair" x1="0" y1="0" x2="1" y2=".6"><stop stop-color="#b3b6a4"/><stop offset=".4" stop-color="#858e84"/><stop offset="1" stop-color="#48564e"/></linearGradient>
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
  parts.body += ink('M99 118L121 131L147 115M102 146L125 154L147 143M127 116V151', '#a5aaa0', 1.3);
  parts.body += path('M116 128L120 121L129 122L136 128L135 140L130 147L124 150L118 145L115 138Z', g(id, 'gold'), '#33434c', .9);
  parts.body += ink('M120 130L124 128L129 130L132 128M121 135L129 135M121 140L125 143L130 140M116 129L112 132M135 128L140 131', '#695636', 1);
  parts.body += path('M94 102L80 109L78 126L94 132L109 120L106 109Z', g(id, 'steel'));
  parts.body += path('M145 101L167 108L175 128L157 132L143 117Z', g(id, 'steel'));
  parts.body += ink('M82 118L96 115M151 111L166 115L170 123', '#adb4a8', 1.4);
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
  parts.skirt += ink('M81 281Q125 294 170 284M81 287Q122 300 172 290','#998563',2);
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
  parts.body+=ink('M94 152L120 174L159 160M99 162L121 181L153 172','#998563',2);
  parts.body+=mail(103,172,4,10);
  parts.body+=path('M98 183L160 178L161 190L101 196Z',g(id,'leather'));
  parts.body+=path('M121 180L139 179L142 194L124 197L118 189Z',g(id,'gold'));
  parts.body+=path('M104 196L126 195L121 224L96 218Z',g(id,'steelDark'))+path('M134 194L158 190L168 216L143 226Z',g(id,'steelDark'));
  parts.body+=ink('M99 208L122 211M139 207L161 203','#998563',1.5);
  parts.body+=path('M87 103L67 110L64 132L83 143L108 123L106 108Z',g(id,'steel'));
  parts.body+=path('M145 98L171 104L186 124L178 141L151 131L139 111Z',g(id,'steel'));
  parts.body+=path('M71 113L91 109L101 117L82 130L68 128Z','#385775','#998563',1.5);
  parts.body+=path('M154 106L168 110L178 122L174 131L151 122Z','#385775','#998563',1.5);
  parts.frontArm+=path('M172 140L182 139L190 170L206 185L197 195L177 181L166 157Z',g(id,'steelDark'));
  parts.frontArm+=path('M190 176L206 187L207 203L195 205L186 192Z',g(id,'steel'));
  parts.frontArm+=path('M196 196L208 193L217 200L214 209L204 213L195 206Z',g(id,'skin'));
  parts.weaponFront+=path('M211 255L214 102L221 102L219 257L215 264Z',g(id,'leather'));
  parts.weaponFront+=path('M197 83L229 83L241 95L235 120L202 122L190 108Z',g(id,'steel'));
  parts.weaponFront+=path('M197 88L226 88L229 112L203 116Z','#516a81','#998563',2);
  parts.weaponFront+=ink('M204 92L218 106M207 106L218 94M215 130L219 130M214 139L219 139','#c9ad73',1.4);
  parts.rearArm+=path('M76 134L100 137L102 165L89 187L68 178L66 152Z',g(id,'steelDark'));
  parts.weaponRear+=path('M44 153L82 133L124 145L126 205Q118 247 86 271Q52 249 43 213Z',g(id,'gold'));
  parts.weaponRear+=path('M50 158L82 141L117 151L119 204Q111 239 86 261Q59 242 50 211Z',g(id,'blue'),'#d6c38e',1.3);
  parts.weaponRear+=path('M82 145L89 148L91 253L85 260L80 250Z',g(id,'gold'));
  parts.weaponRear+=path('M51 182L119 177L119 188L51 193Z',g(id,'gold'));
  parts.weaponRear+=path('M80 170L91 172L99 187L91 205L82 209L72 194Z',g(id,'steel'));
  parts.weaponRear+=ink('M82 177L90 184L85 200M58 208Q65 231 78 239M106 205Q104 226 96 236','#afa17e',1.4);
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
/** Clothing follows the existing rigid layers; silhouettes remain readable at combat scale. */
function finishCostume(id:string,art:Parts):void {
 const seam='#8b8169';
 if(id==='warrior'){
  art.body+=path('M111 100L125 109L141 99L143 170L151 218L134 214L126 226L115 216L103 220L111 174Z',g(id,'red'),'#28272a',1);
  art.body+=path('M119 109L126 114L132 110L133 205L126 215L120 207Z','#241f24','none',0);
  art.body+=ink('M113 111L114 166M140 111L138 164M109 212L118 208M133 209L145 214',seam,.8,.55);
  art.body+=path('M99 174L149 174L150 183L100 186Z',g(id,'leather'),'#292a24',1);
  art.body+=path('M120 173H134V185H120Z',g(id,'gold'),'#423b2c',.8)+path('M124 176H131V182H124Z','#2c2e29','none',0);
  art.body+=ink('M125 128V150M118 135H132','#b4aa8a',1.6,.8);
 }else if(id==='tank'){
  art.body+=path('M83 107L91 92L104 96L112 92L116 102L128 97L140 96L149 91L159 101L177 108L182 126L172 121L166 128L157 116L148 121L141 109L130 113L121 106L113 115L103 110L96 124L87 118L78 124Z','#514d3f','#2b2c26',1.1);
  art.body+=ink('M91 104L88 113M103 101L99 112M151 102L157 113M168 110L174 118','#857d64',.85,.65);
  art.body+=path('M115 195L137 193L143 223L128 232L111 223Z',g(id,'blue'),'#242d2e',1);
  art.weaponRear+=ink('M58 165L68 176M112 210L99 232M64 224L71 232M89 153L96 159','#c0b391',.9,.7);
 }else if(id==='archer'){
  art.body+=path('M92 112L103 97L115 95L123 101L114 114L103 118L99 136L90 133L86 139L83 124Z','#5c5542','#282d23',1);
  art.body+=ink('M99 106L94 119M108 102L103 113','#9c8d6d',.9,.7);
  art.body+=path('M104 112L110 111L142 164L136 167Z','#282c23','#8e7b57',.7);
  art.body+=path('M99 177L113 175L118 192L111 202L98 197Z',g(id,'leather'),'#272c23',1);
 }else if(id==='mage'){
  art.body+=path('M100 89L113 85L124 104L139 86L150 96L141 117L128 125L112 117L99 108Z','#353b3d','#7c7c68',.9);
  art.body+=ink('M105 96L115 111L128 118L140 108M113 93L126 110L137 94','#979781',.8,.65);
  art.skirt+=path('M108 174L115 174L102 281L92 289L97 262Z','#252c2e','none',0);
  art.skirt+=ink('M93 284L103 279M109 186L102 242','#777d72',.8,.65);
 }else{
  art.body+=path('M100 111L111 95L127 100L139 93L152 107L146 123L137 119L125 127L114 119L101 128Z','#292a30','#626169',.9);
  art.body+=ink('M105 109L116 115L126 119L142 110','#8c8585',.9,.55);
  art.body+=path('M102 162L142 155L144 164L103 172Z','#323027','#625b48',1);
 }
 // Small, sparse wear marks on the lit edges; no all-over noisy texture.
 art.body+=ink(id==='tank'?'M70 123L79 119M159 133L169 135M149 167L155 164':id==='warrior'?'M83 119L90 117M160 117L166 121M105 194L109 192':id==='archer'?'M106 139L110 145M132 180L136 177':id==='mage'?'M113 150L118 152M139 163L143 161':'M107 145L110 148M137 180L140 176','#a4a18c',.7,.65);
}
export function heroRig(kind:string):RigDefinition {
 const id=Object.hasOwn(illustrations,kind)?kind:'warrior',cached=rigCache.get(id);if(cached)return cached;
 const art=illustrations[id](),a=anatomy[id],parts:RigPart[]=[];
 finishCostume(id,art);
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
function action(t:number,start:number,windup:number,strike:number,end=0):number{return track(t,[[0,start],[.3,windup],[.46,strike],[.68,strike*.6+end*.4],[1,end]]);}
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
 const stance:Record<string,{crouch:number;lean:number;rear:number;front:number}>={warrior:{crouch:2,lean:-1,rear:-2,front:3},archer:{crouch:2,lean:-1,rear:1,front:-3},mage:{crouch:2,lean:-.5,rear:0,front:0},tank:{crouch:4,lean:-1.5,rear:-4,front:5},assassin:{crouch:6,lean:4,rear:-6,front:7}};
 const st=stance[id];let pelvisY=st.crouch+Math.sin(cycle)*.5,body=st.lean,head=-st.lean*.55;
 let front:ArmTarget={dx:id==='archer'?-1:0,dy:0,angle:id==='mage'?0:id==='archer'?1:0},rear:ArmTarget={dx:0,dy:0,angle:0};
 let rearFoot:V=[st.rear,0],frontFoot:V=[st.front,0],cape=Math.sin(cycle-.4)*1.1,skirt=Math.sin(cycle)*.4;
 if(safePose==='move'){
  const stride={warrior:15,archer:17,mage:8,tank:10,assassin:20}[id]!,lift={warrior:8,archer:10,mage:5,tank:6,assassin:12}[id]!;
  pelvisY=st.crouch+1+Math.cos(cycle*2)*.65;body=id==='assassin'?6:id==='tank'?1:1.5;head=-body*.5;
  rearFoot=footTrajectory(t+.5,stride,lift);frontFoot=footTrajectory(t,stride,lift);
  const swing=Math.sin(cycle),magnitude=id==='tank'?2:id==='mage'?3:id==='archer'?4:7;
  front={dx:swing*magnitude,dy:Math.cos(cycle)*1.2,angle:id==='mage'?0:swing*3};rear={dx:-swing*magnitude,dy:-Math.cos(cycle)*1.2,angle:-swing*3};cape=swing*(id==='assassin'?5:2.5);skirt=Math.sin(cycle+.7)*1.1;
 }else if(safePose==='attack'||safePose==='skill0'||safePose==='skill1'){
  const small=safePose==='skill0',big=safePose==='skill1';
  body+=action(t,0,-2,id==='tank'?4:id==='assassin'?7:4);head-=action(t,0,-1,2);pelvisY+=action(t,0,1,2);cape=action(t,0,-2,6);
  rearFoot=[st.rear+action(t,0,-3,-6),0];frontFoot=[st.front+action(t,0,3,6),0];
  if(id==='warrior'){
   front=big?{dx:action(t,0,-12,-34),dy:action(t,0,-15,-34),angle:action(t,0,-18,-12)}:{dx:action(t,0,-8,small?-79:-73),dy:action(t,0,-42,-23),angle:track(t,[[0,0],[.27,-40],[.38,-10],[.50,small?93:85],[.73,26],[1,0]])};
   rear={dx:action(t,0,-3,big?27:8),dy:action(t,0,-4,big?-35:-8),angle:action(t,0,-4,big?-20:5)};
  }else if(id==='tank'){
   front=small||big?{dx:action(t,0,-4,-7),dy:action(t,0,-4,-8),angle:action(t,0,-3,-6)}:{dx:action(t,0,-7,-72),dy:action(t,0,-48,-25),angle:track(t,[[0,0],[.27,-30],[.38,-6],[.50,73],[.73,25],[1,0]])};
   rear={dx:action(t,0,small?7:3,big?24:small?22:4),dy:action(t,0,-4,big?-35:small?-15:-3),angle:action(t,0,-6,big?-18:small?-10:2)};
  }else if(id==='archer'){
   front=big?{dx:action(t,0,-7,-25),dy:action(t,0,-12,-33),angle:action(t,0,-18,-61)}:{dx:action(t,0,0,2),dy:action(t,0,-1,0),angle:action(t,0,-1,1)};
   const repeat=small?Math.sin(t*Math.PI*6)*Math.sin(t*Math.PI):0;
   rear={dx:big?action(t,0,-1,16):action(t,0,-8,3)+repeat*3,dy:big?action(t,0,-12,-49):action(t,0,-2,3),angle:big?action(t,0,-18,-50):action(t,0,-3,3)};
  }else if(id==='mage'){
   front={dx:action(t,0,-1,big?1:3),dy:action(t,0,-2,big?-7:-2),angle:action(t,0,-1,big?-1:1)};
   rear={dx:action(t,0,-8,big?35:small?38:15),dy:action(t,0,-12,big?-65:small?-26:-18),angle:action(t,0,-8,big?-18:small?-8:6)};
  }else{
   front={dx:action(t,0,-12,big?-32:small?-45:-35),dy:action(t,0,-22,big?4:small?14:8),angle:big?action(t,0,-25,-52):track(t,[[0,0],[.24,-25],[.48,small?65:52],[.73,18],[1,0]])};
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
 return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="320" viewBox="0 0 256 320" data-hero="${id}" data-pose="${p}" data-frame="${f}" data-rig-version="7">${defs(id)}<ellipse data-part="ground-shadow" cx="128" cy="300" rx="60" ry="8" fill="#030b13" opacity=".38"/>${body}</svg>`;
}
export type HeroFaceView='front'|'threeQuarter'|'profile';
interface FacePalette {light:string;base:string;shade:string;deep:string;lip:string;eye:string}
const facePalettes:Record<string,FacePalette>={
 warrior:{light:'#d1b196',base:'#ad8c72',shade:'#72594b',deep:'#382e2a',lip:'#725047',eye:'#747e79'},
 archer:{light:'#e1c0a5',base:'#c09b83',shade:'#866454',deep:'#43342e',lip:'#875c50',eye:'#657157'},
 mage:{light:'#b69a81',base:'#8b7262',shade:'#5b4941',deep:'#292a2b',lip:'#644c42',eye:'#819e9e'},
 tank:{light:'#c8b09a',base:'#a18a76',shade:'#706151',deep:'#39352e',lip:'#6f5547',eye:'#7a8174'},
 assassin:{light:'#cbb9ab',base:'#a48f82',shade:'#71635e',deep:'#35313a',lip:'#785b56',eye:'#8a8595'}
};
function headDefs(id:string):string {
 const c=facePalettes[id]??facePalettes.warrior;
 return `<radialGradient id="${id}-faceBase" cx=".32" cy=".3" r=".78"><stop stop-color="${c.light}"/><stop offset=".52" stop-color="${c.base}"/><stop offset="1" stop-color="${c.shade}"/></radialGradient><linearGradient id="${id}-faceFar"><stop stop-color="${c.base}" stop-opacity="0"/><stop offset="1" stop-color="${c.deep}" stop-opacity=".6"/></linearGradient><radialGradient id="${id}-cheek"><stop stop-color="${c.light}" stop-opacity=".4"/><stop offset="1" stop-color="${c.light}" stop-opacity="0"/></radialGradient><linearGradient id="${id}-faceNeck" x2=".8" y2="1"><stop stop-color="${c.deep}"/><stop offset="1" stop-color="${c.base}"/></linearGradient>`;
}
function defaultHeadView(id:string):HeroFaceView{return id==='tank'?'front':'threeQuarter';}
function faceOutline(id:string,view:HeroFaceView):string {
 if(view==='profile')return id==='tank'||id==='warrior'?'M111 43Q128 33 140 46L143 60L141 68L149 75Q152 79 143 80L142 92Q140 100 130 101L117 96Q107 86 107 66Z':'M114 43Q130 34 140 47L142 62L140 69L148 76L141 80Q143 90 133 99Q120 96 113 85L109 62Z';
 if(id==='warrior')return 'M105 45Q108 32 127 32Q148 32 151 48L150 74Q149 84 145 90L137 99Q127 102 116 97L107 87Q102 73 103 60Z';
 const broad=id==='tank',slim=id==='mage'||id==='assassin';
 return broad?'M105 45Q108 32 127 32Q148 32 151 48L150 75Q149 89 138 98Q129 104 116 97L107 88Q102 73 103 60Z':slim?'M110 44Q115 32 129 33Q145 34 148 49L146 76Q142 90 132 101Q122 98 114 86Q108 75 108 59Z':'M108 45Q112 32 129 33Q147 34 150 50Q150 73 144 85Q139 94 130 98Q120 96 112 85Q106 72 107 58Z';
}
function eye(id:string,x:number,y:number,w:number,far=false):string{
 const c=facePalettes[id],brow=id==='warrior'||id==='tank'?2.1:1.35;
 return `<g opacity="${far?.8:1}">${ink(`M${x-w/2-1} ${y-4}Q${x-1} ${y-5.5} ${x+w/2} ${y-3.5}`,id==='tank'?'#68645a':'#372d29',brow)}<path d="M${x-w/2} ${y}Q${x} ${y-2} ${x+w/2} ${y-.3}Q${x} ${y+1.1} ${x-w/2} ${y}Z" fill="#a49c85"/>${ink(`M${x-w/2} ${y}Q${x} ${y-2.2} ${x+w/2} ${y-.3}`,c.deep,.95)}<ellipse cx="${x+.65}" cy="${y-.4}" rx="1.3" ry="1.45" fill="${c.eye}"/><ellipse cx="${x+.65}" cy="${y-.4}" rx=".65" ry="1.1" fill="#1b1d1c"/>${ink(`M${x-w/2+.5} ${y+2.7}Q${x} ${y+4} ${x+w/2-1} ${y+2}`,c.shade,.65,.5)}</g>`;
}
function headArt(id:string,view:HeroFaceView):string {
 const c=facePalettes[id],front=view==='front',profile=view==='profile',nx=front?128:profile?142:134,ny=front?76:75;
 let art='';
 const hood=id==='archer'||id==='assassin',silver=id==='tank'||id==='mage';
 // The head is smaller than the old caricature; the collar stays attached at y=100.
 if(hood)art+=path('M96 99Q92 75 98 46Q103 25 126 23Q150 23 159 48L162 89L148 111L106 112Z',g(id,id==='archer'?'green':'purple'),'#171d1e',1.2);
 else if(id==='mage')art+=path('M102 110L102 49Q101 29 121 27Q145 23 151 45L153 88L158 113L143 108L132 89L113 94L109 113Z',g(id,'silverHair'),'#343a39',1);
 art+=path('M115 86L139 86L143 103L129 114L109 103Z',g(id,'faceNeck'),'#36322d',.8);
 if(!profile){art+=path('M105 62Q97 58 99 71Q100 79 108 80L110 66Z',g(id,'faceBase'),c.shade,.65);art+=path('M147 61Q155 57 153 70Q153 78 147 79Z',c.shade,c.deep,.6);}
 art+=path(faceOutline(id,view),g(id,'faceBase'),c.deep,.85);
 art+=`<path d="${profile?'M133 42Q144 48 144 68L140 78L140 92L130 100L130 85Z':'M133 35Q152 41 151 63L147 82Q142 96 131 101L134 85L137 72Z'}" fill="${g(id,'faceFar')}"/><ellipse cx="118" cy="76" rx="11" ry="13" fill="${g(id,'cheek')}"/>`;
 if(profile)art+=eye(id,137,64,7.2);else art+=eye(id,front?116:119,64,8.7)+eye(id,front?140:143,63.5,front?8.2:6.2,true);
 art+=ink(`M${nx-1} 62Q${nx-2} 69 ${nx-3} ${ny-2}Q${nx-3} ${ny+1} ${nx+1} ${ny+1}`,c.shade,.85,.75);
 art+=ink(`M${nx+2} ${ny+1}q2.5-1 3.5.3`,c.deep,.75,.75);
 art+=ink(`M${nx-2} 66L${nx-2.5} 72`,c.light,.75,.65);
 const mx=front?128:profile?139:133;
 art+=ink(`M${mx-6} 85Q${mx-1} 84.2 ${mx+5} 84.6`,c.lip,.9,.9);
 art+=ink(`M${mx-3} 88Q${mx} 89 ${mx+3} 87.8`,c.light,.6,.45);
 if(id==='warrior'){
  art+=`<path d="M110 79Q116 84 119 88Q130 94 142 84L141 95Q133 104 121 98L112 91Z" fill="#463c31" opacity=".48"/>`;
  art+=ink('M111 57L114 67L113 72',c.shade,.8,.65);
  art+=ink('M115 51Q125 48 135 51M116 53Q123 51 131 53',c.shade,.65,.35);
  art+=ink('M119 88L123 91M126 92L130 93M134 90L138 88','#4b4033',.65,.5);
  art+=path('M103 57Q99 38 114 31Q136 25 149 44L148 57L141 55L134 43L124 48L115 42L109 62Z','#44362b','#292823',1);
  art+=path('M98 57Q95 35 111 27Q134 18 151 35L157 59L148 62L141 41Q126 32 112 43L108 62Z',g(id,'steelDark'),'#222827',1.3);
  art+=ink('M103 43Q126 23 149 42M128 28L131 39','#9ba295',1,.75);
  art+=path('M99 58L108 60L110 84L104 88L98 76Z',g(id,'steel'),'#242c2c',1);
 }else if(id==='tank'){
  art+=`<ellipse cx="116" cy="69" rx="5.8" ry="2.5" fill="${c.shade}" opacity=".24"/><ellipse cx="140" cy="68.5" rx="5" ry="2.3" fill="${c.deep}" opacity=".12"/><ellipse cx="113" cy="78" rx="6" ry="8" fill="${c.shade}" opacity=".14"/>`;
  art+=ink('M111 51Q126 47 143 51M113 54Q128 51 141 54M110 71Q116 74 122 70M135 71Q140 73 145 69',c.shade,.7,.5);
  art+=path('M103 81Q111 84 120 82L128 86L139 82L150 80L148 100Q143 111 130 117Q113 112 106 101Z',g(id,'silverHair'),'#43463e',.9);
  art+=ink('M110 92L116 105M119 94L123 111M130 96V112M142 92L135 108','#777b6e',.85,.75);
  art+=ink('M112 84Q120 81 128 85Q138 81 145 84','#a9aa92',2.1,.8);
  art+=path('M94 60Q93 35 109 26Q135 18 153 33L162 58L153 63L145 41Q127 31 111 43L105 64Z',g(id,'steelDark'),'#202622',1.4);
  art+=ink('M100 46Q127 25 153 46','#ac9d76',1.3,.8);
  art+=path('M97 61L105 63L108 82L101 87L95 76Z',g(id,'steel'),'#333b33',1);
 }else if(id==='archer'){
  art+=path('M102 63Q96 41 113 31Q137 23 150 44L148 64L140 60L138 43L127 48L117 41L110 62L107 100L99 105Z',g(id,'hair'),'#352c23',.9);
  art+=ink('M109 42Q121 31 136 37M108 75L104 98','#b08b60',.8,.7);
  art+=path('M97 60Q93 39 108 28Q129 17 149 35L158 61L150 65L142 44Q127 29 111 43L105 65Z',g(id,'green'),'#222b24',1.2);
  art+=ink('M101 48Q111 29 128 28Q147 32 152 50','#777c59',1,.7);
  art+=path('M105 87Q98 107 107 119L102 134L112 145L116 138L111 128L116 114L111 94Z',g(id,'hair'),'#352e26',.8);
 }else if(id==='mage'){
  art+=path('M105 64Q100 39 116 29Q137 23 148 43L150 63L143 71L139 43L131 40L119 45L111 65L108 98L101 110Z',g(id,'silverHair'),'#4d554e',.8);
  art+=ink('M110 44Q120 30 134 33M107 77L105 100','#b4b7a8',.9,.6);
  art+=path('M103 45L109 33L119 39L129 29L140 40L149 35L153 48L141 47L130 50L116 45L107 50Z',g(id,'gold'),'#494635',1);
  art+=path('M128 38L132 43L129 48L126 43Z',g(id,'gem'),'#a8b5a5',.6);
 }else{
  art+=path('M105 65Q98 41 114 31Q135 23 149 43L152 61L144 71L138 48L128 53L119 42L111 65L110 79Z','#373039','#20202a',1);
  art+=ink('M109 47Q123 31 139 40','#716776',.9,.7);
  art+=path('M111 79Q126 86 147 77L147 91L134 104L120 97L112 88Z',g(id,'purple'),'#272831',.8);
  art+=ink('M117 86Q130 91 143 83M122 94L134 98','#6f6d71',.75,.65);
 }
 const scale=id==='tank'?.78:.74;
 return `<g data-head-view="${view}" data-hero-head="${id}" transform="translate(126 103) scale(${scale} .76) translate(-126 -103)">${art}</g>`;
}
export function heroPortraitSvg(kind:string,view:HeroFaceView='threeQuarter'):string {
 const id=Object.hasOwn(illustrations,kind)?kind:'warrior',safeView:HeroFaceView=['front','threeQuarter','profile'].includes(view)?view:'threeQuarter';
 return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="144" viewBox="94 32 66 88" data-hero-portrait="${id}" data-face-view="${safeView}" data-art-version="7">${defs(id)}${headArt(id,safeView)}</svg>`;
}
