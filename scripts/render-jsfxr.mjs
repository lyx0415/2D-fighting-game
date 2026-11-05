import vm from 'node:vm';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const math=Object.create(Math);let seed=90131;math.random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
const context=vm.createContext({Math:math});
for(const name of ['riffwave','sfxr'])vm.runInContext(await readFile(`tools/vendor/jsfxr/${name}.js`,'utf8'),context,{filename:name+'.js'});
await mkdir('artifacts/jsfxr-v009',{recursive:true});
const presets={arcane:{shape:2,frequency:420,frequencySlide:1.1,sustain:.12,decay:.25,vibratoDepth:.1},frost:{shape:3,frequency:2200,sustain:.08,decay:.3,highPassFrequency:1600,lowPassFrequency:6000},ward:{shape:2,frequency:196,arpeggioFactor:1.5,arpeggioDelay:.1,sustain:.15,decay:.5},shadow:{shape:3,frequency:500,sustain:.1,decay:.35,lowPassFrequency:1600,flangerSweep:.006},oath:{shape:2,frequency:146.83,arpeggioFactor:2,sustain:.3,decay:.7},meteor:{shape:3,frequency:80,sustain:.12,decay:.55,lowPassFrequency:900}};
for(const[name,preset]of Object.entries(presets)){
 context.settings={sampleRate:22050,sampleSize:16,gain:-17,attack:.005,...preset};
 const bytes=vm.runInContext('new SoundEffect(new Knobs(settings)).generate().wav',context);
 await writeFile(`artifacts/jsfxr-v009/${name}.wav`,Buffer.from(bytes));
}
await writeFile('artifacts/jsfxr-v009/presets.json',JSON.stringify(presets,null,2));
console.log('Rendered 6 deterministic jsfxr layers (vendored Unlicense source)');
