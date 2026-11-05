/**
 * Original editable vector hero illustrations, revision v003.
 * Canvas 256 × 320; right-facing, foot anchor (128, 300).
 * These are static layered illustrations; runtime code supplies animation.
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
function warrior(): string {
  const id = 'warrior'; let s = '';
  s += path('M98 93Q67 120 62 163L44 264L64 255L77 278L94 260L107 270L127 224L134 109Z', g(id, 'red'));
  s += ink('M96 109Q74 164 65 248M108 119L84 254M93 194L79 271', '#b76f71', 1.5, .5);
  s += path('M107 189L129 191L124 235L111 266L108 294L78 298L76 292L90 279L93 247Z', g(id, 'steelDark'));
  s += path('M133 193L153 190L166 238L156 273L159 291L177 296L175 302H140L136 294L138 266L144 239Z', g(id, 'steel'));
  s += path('M97 226L122 233L116 251L94 254L89 243Z', g(id, 'steel'));
  s += path('M142 225L164 229L163 246L144 253L138 242Z', g(id, 'steel'));
  s += ink('M95 258L109 261L104 287M147 254L151 271L147 293M86 293L105 290M145 298H171', '#d3e0df', 1.5);
  s += path('M102 92L133 89L156 106L160 169L149 196L105 195L90 165L91 118Z', g(id, 'steel'));
  s += path('M106 101L125 116L143 101L151 143L137 166L106 158L97 137Z', g(id, 'steelDark'));
  s += ink('M99 118L121 131L147 115M102 146L125 154L147 143M127 116V151', '#d3dfdd', 1.3);
  s += path('M116 128L120 121L129 122L136 128L135 140L130 147L124 150L118 145L115 138Z', g(id, 'gold'), '#33434c', .9);
  s += ink('M120 130L124 128L129 130L132 128M121 135L129 135M121 140L125 143L130 140M116 129L112 132M135 128L140 131', '#695636', 1);
  s += path('M94 102L80 109L78 126L94 132L109 120L106 109Z', g(id, 'steel'));
  s += path('M145 101L167 108L175 128L157 132L143 117Z', g(id, 'steel'));
  s += ink('M82 118L96 115M151 111L166 115L170 123', '#edf3e7', 1.4);
  s += mail(91, 160, 6, 10);
  s += path('M99 174L150 175L151 184L101 185Z', g(id, 'leather'));
  s += path('M117 172H133V186H117Z', g(id, 'gold')) + path('M121 176H129V182H121Z', '#304352', '#283a48', .7);
  s += path('M102 186L122 187L118 217L99 212Z', g(id, 'steel')) + path('M128 187L150 186L158 211L135 217Z', g(id, 'steel'));
  s += ink('M101 198L119 202M132 199L153 196', '#9eb2bd', 1);
  s += path('M82 128L95 130L94 160L82 184L76 184L72 174L77 150Z', g(id, 'steelDark'));
  s += path('M74 174L85 177L91 195L81 204L72 198L69 185Z', g(id, 'steel'));
  s += path('M163 129L174 126L184 155L197 171L188 181L171 165L160 145Z', g(id, 'steelDark'));
  s += path('M181 158L193 167L190 184L178 181L172 169Z', g(id, 'steel'));
  s += path('M189 174Q202 170 207 176L206 187L197 191L189 185Z', g(id, 'skin'));
  s += sword(id, 202, 170, 17, 111);
  s += path('M109 88L110 76L137 74L141 97L127 109Z', '#6b7684');
  s += path('M109 47Q124 35 140 48L145 61L142 68L150 74L144 79L141 90L129 96L116 88L108 70Z', g(id, 'skin'));
  s += path('M109 70Q99 59 103 48L112 36L135 34L145 47L140 55L130 47L120 50L115 65Z', g(id, 'hair'));
  s += ink('M111 47L120 41L132 42M108 57L116 49M133 58L140 59M140 72L145 73M131 84L138 84', '#9b6a50', 1.1);
  s += path('M102 61Q97 39 112 28Q129 21 142 35L148 49L142 55L137 40L124 35L112 44L110 65Z', g(id, 'steel'));
  s += path('M103 62L114 64L118 88L110 85L104 75Z', g(id, 'steelDark'));
  s += ink('M105 42L112 33L125 30L140 38M122 30L123 40', '#f3ecd0', 1.2);
  s += rivets([[86,114],[101,111],[154,109],[166,120],[104,181],[145,181],[99,237],[154,237]]);
  return s;
}
function archer(): string {
  const id='archer'; let s='';
  s += path('M105 88Q82 112 69 149L59 243L75 231L86 247L101 215L118 128L137 92Z', g(id,'green'));
  s += ink('M98 112Q79 163 75 226M109 112L93 216', '#789587',1.4,.6);
  s += path('M87 110L77 115L66 175L77 181L94 124Z', g(id,'leather'));
  s += ink('M80 116L71 172M84 113L75 169', '#c2a476',1.2);
  s += `<g transform="rotate(-9 76 117)">${ink('M72 76L79 140M80 71L87 138M88 78L94 138','#c4bd9a',2)}${path('M65 78L72 70L76 78L71 86Z','#98ae97')}${path('M75 74L81 65L86 73L80 84Z','#c5c3a3')}</g>`;
  s += path('M105 186L124 191L115 233L109 266L110 290L94 298L82 299L80 293L93 281L94 251L92 220Z', g(id,'leather'));
  s += path('M129 190L146 185L153 224L145 258L147 285L164 296L163 301H135L130 291L129 257L132 227Z', g(id,'leather'));
  s += path('M91 249L111 252L108 282L112 291L94 300H80L81 292L93 280Z', '#263b37');
  s += path('M129 255L146 253L147 284L165 295L162 301H135L129 292Z', '#263b37');
  s += ink('M95 259L107 260M94 266L106 267M134 263L143 261M134 270L144 268M135 278L144 276', '#bd9f69',1.5);
  s += path('M108 95L134 89L147 103L148 153L137 184L109 190L92 166L95 118Z', g(id,'green'));
  s += path('M104 104L128 101L143 114L138 148L123 164L101 152L98 126Z', g(id,'leather'));
  s += ink('M103 108L127 106L139 117M102 143L122 153L136 143M107 117L112 143M130 115L128 145', '#c39a65',1.1);
  s += path('M95 160L143 157L148 187L136 207L119 199L105 212L93 191Z', g(id,'green'));
  s += path('M96 162L141 157L144 167L97 172Z', g(id,'leather'));
  s += path('M117 158L130 157L132 168L119 170Z', g(id,'gold'));
  s += ink('M100 178L105 198M111 175L115 191M137 174L134 194', '#7a977e',1.1);
  s += path('M98 108L86 117L83 134L98 138L107 121Z', g(id,'green'));
  s += path('M140 104L153 108L158 125L146 135L135 121Z', g(id,'green'));
  s += path('M87 131L98 134L115 151L147 146L151 155L115 164L102 157L84 144Z', g(id,'skin'));
  s += path('M142 128L153 121L174 142L194 135L197 145L173 154L157 147Z', g(id,'skin'));
  s += path('M110 147L125 151L123 162L111 162L105 155Z', g(id,'leather'));
  s += path('M175 139L189 135L193 145L181 151Z', g(id,'leather'));
  s += ink('M112 150L122 154M178 141L188 139', '#d5b67e',1.2);
  s += path('M189 139Q196 133 200 137L201 144L194 150L188 145Z', g(id,'skin'));
  s += `<g>${path('M198 62Q237 104 230 151Q226 189 198 224L192 218Q212 185 217 151Q226 105 191 67Z',g(id,'gold'))}${ink('M194 66L198 142L195 221','#e7ddbd',1.1)}${ink('M145 147L237 140','#cfdaD5',2)}${path('M232 135L242 139L232 145Z',g(id,'steel'))}${ink('M150 145L142 138M150 148L142 156','#91a28c',2)}${path('M215 126L224 128L224 155L214 154Z',g(id,'leather'))}${rivets([[219,132],[218,148]])}</g>`;
  s += path('M113 90L114 78L135 76L137 98L125 105Z',g(id,'skin'));
  s += path('M110 49Q122 37 136 47L141 60L140 67L148 73L141 77L139 88L128 94L116 88L110 72Z',g(id,'skin'));
  s += path('M104 72Q97 53 106 39Q118 25 136 35L146 49L138 56L133 45L120 49L115 65L116 83L108 91Z',g(id,'hair'));
  s += path('M106 66Q91 88 102 105Q119 116 107 131Q98 142 112 152L104 161Q87 147 95 133Q106 120 96 111Q82 91 98 68Z',g(id,'hair'));
  s += ink('M101 76Q91 95 105 107Q113 119 101 134Q98 143 106 151','#dfa976',1.7);
  s += ink('M99 85L105 93M99 98L108 103M104 111L108 119M103 127L98 134M100 143L108 148','#4c342d',1.8);
  s += path('M101 72Q91 44 107 30Q127 20 141 34L150 54L141 56L131 40L114 44L106 64Z',g(id,'green'));
  s += ink('M101 47Q105 31 121 30Q135 29 143 47','#c2ac79',1.2);
  s += path('M103 37Q81 35 80 13Q97 14 110 34Z','#859c89','#263f3c',1.2);
  s += path('M106 36Q94 22 103 8Q117 19 113 35Z','#c2c8ac','#2c443c',1.2);
  s += ink('M85 20L106 38M105 14L109 35','#e4d4a4',1);
  s += ink('M131 61L140 60M137 73L143 74M128 84L137 84','#80584d',1.1);
  s += path('M112 74L105 68L107 82L115 83Z',g(id,'skin'),'#967261',.8);
  s += rivets([[99,111],[102,131],[142,112],[136,161],[102,166]]);
  return s;
}
function mage(): string {
  const id='mage';let s='';
  s += `<ellipse cx="211" cy="54" rx="38" ry="47" fill="${g(id,'aura')}"/>`;
  s += path('M108 78Q81 103 76 154L59 291L88 282L102 300H164L178 290L151 121L136 78Z',g(id,'blue'));
  s += path('M105 143L91 202L78 290L100 283L111 178Z','#182c50');
  s += path('M127 136L116 197L111 300H141L143 197Z','#3b5075');
  s += path('M143 141L151 204L164 300L178 289L160 176Z','#152340');
  s += ink('M99 162L82 282M115 170L110 292M145 171L163 287','#9d875f',2);
  s += ink('M81 281Q125 294 170 284M81 287Q122 300 172 290','#c4a370',2);
  s += path('M104 283L123 285L122 298H100L94 296Z','#1b2a3d');
  s += path('M139 286H155L165 297L164 302H138Z','#1b2a3d');
  s += path('M101 87L134 80L153 98L148 153L132 178L104 165L89 119Z',g(id,'blue'));
  s += path('M110 93L126 106L138 89L145 98L132 132L116 133L101 101Z',g(id,'gold'));
  s += path('M111 99L125 114L137 98L134 123L122 138Z','#203b5d');
  s += path('M121 122L130 118L136 129L128 140L120 134Z',g(id,'gem'),'#bbd0d2',1.1);
  s += ink('M105 142Q119 148 140 141M112 137L110 154M119 142L118 160M133 142L132 163','#bea575',1.3);
  s += path('M98 157L145 154L149 167L101 172Z','#766449','#2a3644',1.4);
  s += path('M116 155L133 154L137 166L120 171L113 164Z',g(id,'gold'));
  s += path('M120 159L129 158L132 163L122 166Z',g(id,'gem'),'#5d746f',.7);
  s += path('M96 96L82 110L67 158L78 174L105 146L112 112Z',g(id,'blue'));
  s += path('M78 146L91 157L84 175L68 164Z',g(id,'gold'));
  s += path('M77 160L95 166L109 162L112 170L97 179L84 176L71 171Z',g(id,'darkSkin'));
  s += path('M144 97L156 106L173 137L197 129L202 145L174 159L162 150L143 125Z',g(id,'blue'));
  s += path('M185 131L197 125L204 145L191 151Z',g(id,'gold'));
  s += path('M197 132L208 129L216 135L215 145L208 150L201 145Z',g(id,'darkSkin'));
  s += ink('M73 153L83 160M191 136L199 133M190 141L201 138','#efe0ab',1);
  s += path('M208 288L213 78L218 78L217 291L212 297Z',g(id,'leather'));
  s += ink('M213 90L213 276','#ccae72',1.4);
  s += path('M201 87L204 73L191 56L196 34L208 17L214 23L202 42L200 57L211 69L222 58L225 41L217 21L225 15L238 40L233 66L221 80L223 88Z',g(id,'gold'));
  s += path('M214 29L225 51L214 72L205 53Z',g(id,'gem'),'#b2e9e3',1.4);
  s += ink('M215 37L211 52L215 62','#f2ffff',1.2);
  s += path('M201 104L220 105M201 109L219 110M209 239L220 240',g(id,'gold'),'#b9985c',2);
  s += path('M112 86L111 74L136 72L138 91L126 102Z',g(id,'darkSkin'));
  s += path('M108 45Q119 33 134 42L141 56L139 64L148 70L142 76L138 87L125 91L113 82L107 65Z',g(id,'darkSkin'));
  s += path('M106 71Q95 57 103 40Q116 24 135 33L147 50L140 58L132 43L119 46L114 62L111 88L99 111L89 111L98 89Z',g(id,'silverHair'));
  s += path('M107 70L103 95L110 118L116 113L112 88Z',g(id,'silverHair'));
  s += path('M137 46Q155 59 147 89L151 112L140 109L136 88L139 62Z',g(id,'silverHair'));
  s += ink('M111 39Q102 61 106 81L98 104M116 40L109 67M141 49L144 75L142 95','#e3f3e9',1.1,.9);
  s += path('M104 41L109 29L118 36L126 21L133 36L143 30L146 45L136 40L128 46L118 40L109 46Z',g(id,'gold'));
  s += path('M126 25Q111 13 120 4Q120 17 135 18Q130 20 126 25Z','#d5dbca','#8b9c9e',1);
  s += `<circle cx="128" cy="38" r="3.8" fill="${g(id,'gem')}" stroke="#e9d6a2" stroke-width="1"/>`;
  s += ink('M131 58L139 58M134 70L141 71M127 80L136 80','#d1aaa0',1);
  s += path('M110 139Q91 120 82 137Q84 154 108 160', 'none','#bfaa75',1.2);
  for(let y=190;y<272;y+=24)s+=ink(`M119 ${y}l8-7l9 7l-8 9Z`,'#ad9667',1,.7);
  return s;
}
function tank():string {
  const id='tank';let s='';
  s+=path('M88 91Q72 114 69 172L64 263L87 254L98 273L120 227L153 263L176 254L168 132L142 86Z',g(id,'blue'));
  s+=ink('M85 110L74 246M153 118L163 249','#987d4e',2,.7);
  s+=path('M100 190L127 192L120 241L110 267L111 291L101 301H77L75 294L89 282L88 251Z',g(id,'steelDark'));
  s+=path('M135 193L160 187L176 236L164 268L169 290L185 296L183 302H146L140 292L140 263L148 235Z',g(id,'steelDark'));
  s+=path('M91 224L121 228L124 245L108 259L87 251Z',g(id,'steel'));
  s+=path('M146 222L173 228L176 244L158 258L140 247Z',g(id,'steel'));
  s+=ink('M90 233L111 239L118 235M149 233L164 240L172 235M97 262L103 285M153 263L155 291M82 295H105M147 297H179','#decc97',1.4);
  s+=path('M96 89L133 85L160 100L172 155L158 195L107 202L83 172L82 123Z',g(id,'steelDark'));
  s+=path('M101 100L126 116L150 97L162 133L151 158L121 167L96 147Z',g(id,'steel'));
  s+=path('M107 109L126 128L146 108L140 140L124 151L111 138Z','#2a4260','#b99c64',2);
  s+=path('M121 123L127 117L133 124L128 132L122 130Z',g(id,'gold'));
  s+=ink('M94 152L120 174L159 160M99 162L121 181L153 172','#c4a370',2);
  s+=mail(103,172,4,10);
  s+=path('M98 183L160 178L161 190L101 196Z',g(id,'leather'));
  s+=path('M121 180L139 179L142 194L124 197L118 189Z',g(id,'gold'));
  s+=path('M104 196L126 195L121 224L96 218Z',g(id,'steelDark'))+path('M134 194L158 190L168 216L143 226Z',g(id,'steelDark'));
  s+=ink('M99 208L122 211M139 207L161 203','#c4a370',1.5);
  s+=path('M87 103L67 110L64 132L83 143L108 123L106 108Z',g(id,'steel'));
  s+=path('M145 98L171 104L186 124L178 141L151 131L139 111Z',g(id,'steel'));
  s+=path('M71 113L91 109L101 117L82 130L68 128Z','#385775','#c4a370',1.5);
  s+=path('M154 106L168 110L178 122L174 131L151 122Z','#385775','#c4a370',1.5);
  s+=path('M172 140L182 139L190 170L206 185L197 195L177 181L166 157Z',g(id,'steelDark'));
  s+=path('M190 176L206 187L207 203L195 205L186 192Z',g(id,'steel'));
  s+=path('M196 196L208 193L217 200L214 209L204 213L195 206Z',g(id,'skin'));
  s+=path('M211 255L214 102L221 102L219 257L215 264Z',g(id,'leather'));
  s+=path('M197 83L229 83L241 95L235 120L202 122L190 108Z',g(id,'steel'));
  s+=path('M197 88L226 88L229 112L203 116Z','#516a81','#c4a370',2);
  s+=ink('M204 92L218 106M207 106L218 94M215 130L219 130M214 139L219 139','#c9ad73',1.4);
  s+=path('M76 134L100 137L102 165L89 187L68 178L66 152Z',g(id,'steelDark'));
  s+=path('M44 153L82 133L124 145L126 205Q118 247 86 271Q52 249 43 213Z',g(id,'gold'));
  s+=path('M50 158L82 141L117 151L119 204Q111 239 86 261Q59 242 50 211Z',g(id,'blue'),'#d6c38e',1.3);
  s+=path('M82 145L89 148L91 253L85 260L80 250Z',g(id,'gold'));
  s+=path('M51 182L119 177L119 188L51 193Z',g(id,'gold'));
  s+=path('M80 170L91 172L99 187L91 205L82 209L72 194Z',g(id,'steel'));
  s+=ink('M82 177L90 184L85 200M58 208Q65 231 78 239M106 205Q104 226 96 236','#e7d29b',1.4);
  s+=rivets([[52,164],[111,157],[52,207],[111,203],[84,251],[76,117],[167,117],[105,188],[154,185]]);
  s+=path('M110 91L108 76L137 74L144 96L129 111Z','#62727d');
  s+=path('M108 44Q124 34 140 45L145 60L143 68L151 75L144 80L141 89L127 96L113 86L106 66Z',g(id,'skin'));
  s+=path('M108 72Q114 76 121 74L128 81L138 75L145 78L141 99L130 111L114 101L108 86Z',g(id,'silverHair'));
  s+=ink('M116 81L120 100M124 83L127 105M133 83L133 101M138 81L138 91','#607381',1.1);
  s+=path('M101 65Q94 43 107 29L125 23L144 31L152 52L145 63L139 43L125 37L112 44L110 65Z',g(id,'steelDark'));
  s+=path('M103 63L113 63L116 80L108 83L100 73Z',g(id,'steel'));
  s+=path('M104 44L112 32L125 28L141 36L147 50L142 53L136 40L126 35L114 41Z',g(id,'gold'));
  s+=ink('M126 28V38M112 55L121 52M134 57L142 57M134 70L142 71','#f0dbab',1.1);
  s+=path('M115 26Q113 16 121 13L129 25Z','#314e72','#9f8c63',1);
  return s;
}
function assassin():string {
  const id='assassin';let s='';
  s+=path('M110 84Q82 103 74 140L57 223L78 217L92 232L113 184L137 103Z',g(id,'purple'));
  s+=ink('M104 99Q82 150 72 211M111 111L88 213','#9585a8',1.3,.6);
  s+=path('M110 189L128 194L118 229L100 261L96 287L85 299H70L71 294L83 278L85 249L96 219Z',g(id,'purple'));
  s+=path('M133 187L150 184L168 222L153 257L157 282L176 294L175 300H148L141 290L136 260L145 226Z',g(id,'purple'));
  s+=path('M86 250L102 255L97 282L99 290L85 300H70L72 293L84 277Z','#17283a','#667389',1.4);
  s+=path('M137 258L154 254L157 281L178 293L176 300H148L140 289Z','#17283a','#667389',1.4);
  s+=ink('M87 262L98 264M86 270L96 272M144 266L153 264M146 274L155 271','#b0a0bf',1.3);
  s+=path('M112 91L135 88L148 104L150 141L136 174L110 185L95 162L99 117Z',g(id,'purple'));
  s+=path('M108 104L128 98L141 111L139 140L124 159L104 146Z','#26374b','#7f7895',1.2);
  s+=path('M108 106L138 143M136 106L108 152', 'none','#ad9271',4);
  s+=path('M100 161L140 153L149 174L138 198L120 191L105 208L96 186Z',g(id,'purple'));
  s+=path('M100 162L142 155L145 165L102 173Z',g(id,'leather'));
  s+=path('M118 159L131 157L134 167L121 170L116 164Z',g(id,'gold'));
  s+=path('M100 179L118 175L112 194L102 199Z','#344557','#a1a0ae',1.2);
  s+=path('M132 174L145 168L144 188L135 191Z','#344557','#a1a0ae',1.2);
  s+=path('M101 108L88 116L83 136L97 144L112 121Z',g(id,'purple'));
  s+=path('M141 102L155 106L163 122L150 135L138 119Z',g(id,'purple'));
  s+=path('M86 138L97 142L101 161L89 182L79 179L83 160Z',g(id,'skin'));
  s+=path('M151 130L163 124L178 144L202 148L201 160L174 159L162 153Z',g(id,'skin'));
  s+=path('M83 162L96 165L91 184L79 182Z','#304156','#a49ab0',1.5);
  s+=path('M184 144L199 145L203 160L187 158Z','#304156','#a49ab0',1.5);
  s+=path('M80 179L90 181L92 190L83 197L74 190Z',g(id,'skin'));
  s+=path('M200 147L211 145L216 153L211 163L201 161Z',g(id,'skin'));
  s+=`<g transform="translate(211 149) rotate(39)">${path('M-3-3Q-12-44 5-80Q18-99 27-101Q12-77 10-57Q11-31 5-3Z',g(id,'steel'))}${ink('M3-15Q8-49 12-68','#e2e5f4',1.3)}${path('M-12 0L13-2L15 4L-10 7Z',g(id,'gold'))}${path('M-2 7H5L5 28L0 31L-3 26Z',g(id,'leather'))}</g>`;
  s+=`<g transform="translate(80 184) rotate(-44)">${path('M-3-2Q-12-37 2-65Q11-79 21-86Q11-65 10-45Q10-20 4-2Z',g(id,'steel'))}${ink('M3-12L7-49','#e2e5f4',1)}${path('M-12 0L11-2L13 5L-10 7Z',g(id,'gold'))}${path('M-2 7H5V26L1 30L-3 25Z',g(id,'leather'))}</g>`;
  s+=path('M112 91L113 78L137 77L141 96L125 107Z',g(id,'skin'));
  s+=path('M111 47Q124 35 137 44L143 58L140 65L148 71L141 78L138 90L126 94L114 86L107 65Z',g(id,'skin'));
  s+=path('M105 72Q96 63 101 44Q111 28 131 31L146 42L149 60L139 64L137 49L128 47L116 56L115 78Z','#22233e','#182331',1.7);
  s+=path('M111 39L124 33L138 37L145 48L136 45L130 55L126 45L115 57L111 68L106 65L108 49Z',g(id,'purple'));
  s+=ink('M112 46L121 39L127 39M132 39L139 44M109 57L116 50','#a18dac',1.1);
  s+=path('M115 69L141 65L147 73L141 87L127 94L114 84Z','#1c2d41','#778294',1.1);
  s+=ink('M119 75L135 74L140 78M122 80L134 81M133 59L141 59','#bdafc5',1);
  s+=path('M105 40L92 31L96 18L107 30L108 15L115 31L122 20L119 39Z','#182533','#8b829e',1.1);
  s+=path('M104 36L114 35L119 42L111 46L104 42Z',g(id,'gold'));
  s+=`<circle cx="112" cy="40" r="2.6" fill="#c3a8cf"/>`;
  s+=rivets([[95,122],[102,138],[148,112],[155,124],[106,167],[137,160],[189,151]]);
  return s;
}
function faceDetails(kind:string):string {
  const coordinates:Record<string,[number,number]>={warrior:[137,64],archer:[136,65],mage:[136,62],tank:[138,64],assassin:[136,62]};
  const [x,y]=coordinates[kind];
  let detail=ink(`M${x-5} ${y-4}q4-2 8 0`,kind==='mage'?'#d0e4e5':'#3a2e32',1.4);
  detail+=`<path d="M${x-3} ${y}q4-2 7 0q-3 2-7 0Z" fill="#253442"/><circle cx="${x+1}" cy="${y}" r=".9" fill="${kind==='mage'?'#9de7ec':kind==='archer'?'#b9caa2':'#d2c8a8'}"/><circle cx="${x+1.3}" cy="${y-.3}" r=".35" fill="#fff4d5"/>`;
  if(kind==='warrior')detail+=ink('M127 72L130 79M120 82L124 86M135 87L136 90','#927263',.8,.7);
  if(kind==='archer')detail+=ink('M135 79Q138 78 141 79M132 84Q136 86 138 84','#b87f75',.85);
  if(kind==='mage')detail+=ink('M130 65L131 75M124 83Q131 86 135 82','#ad8b7e',.9);
  if(kind==='tank')detail+=ink('M132 68L136 70M143 67L146 69M131 73L134 74M115 67L118 71','#7e6358',.85);
  if(kind==='assassin')detail+=ink('M130 66L139 64','#917b9b',.9);
  return detail;
}
const illustrations: Record<string, () => string> = { warrior, archer, mage, tank, assassin };
export function heroSvg(kind: string): string {
  const id = Object.hasOwn(illustrations,kind) ? kind : 'warrior';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="320" viewBox="0 0 256 320">${defs(id)}<ellipse cx="128" cy="300" rx="60" ry="8" fill="#030b13" opacity=".38"/>${illustrations[id]()}${faceDetails(id)}</svg>`;
}
