"""Original physical/ambient DSP layered with vendored jsfxr magic. No voice recordings."""
from pathlib import Path
import numpy as np, json, hashlib
from scipy.signal import butter,sosfilt
from scipy.io import wavfile
root=Path(__file__).resolve().parent.parent;out=root/'public/audio/v009';out.mkdir(parents=True,exist_ok=True)
rate=22050;rng=np.random.default_rng(90131)
def tone(n,f=100,end=None,decay=12):
 t=np.arange(n)/rate;freq=f if end is None else np.linspace(f,end,n)
 return np.sin(2*np.pi*np.cumsum(np.full(n,freq) if np.isscalar(freq) else freq)/rate)*np.exp(-t*decay)
def hiss(n,lo=100,hi=4000,decay=8):
 return sosfilt(butter(2,[max(20,lo),min(10000,hi)],btype='bandpass',fs=rate,output='sos'),rng.normal(0,1,n))*np.exp(-np.arange(n)/rate*decay)
def mix(*layers):
 n=max(map(len,layers));a=np.zeros(n)
 for layer in layers:a[:len(layer)]+=layer
 return a
def delayed(a,seconds):return np.pad(a,(int(seconds*rate),0))
def crackle(n):
 a=np.zeros(n)
 for pos in rng.integers(0,max(1,n-int(rate*.045)),18):
  v=hiss(int(rate*.04),2100,9000,90)*rng.uniform(.25,1);a[pos:pos+len(v)]+=v
 return a
def pluck(n,f=185):
 delay=round(rate/f);a=np.zeros(n);a[:delay]=rng.uniform(-1,1,delay)
 for i in range(delay,n):a[i]=.493*(a[i-delay]+a[i-delay+1])
 return a
def seed(name):
 _,a=wavfile.read(root/f'artifacts/jsfxr-v009/{name}.wav');return a.astype(float)/32768
def save(name,a,ambient=False):
 a=np.nan_to_num(a);a-=np.mean(a)
 target=.38 if ambient else .82;a*=target/max(.0001,np.max(np.abs(a)))
 if not ambient:
  fade=min(220,len(a)//8);a[:fade]*=np.linspace(0,1,fade);a[-fade:]*=np.linspace(1,0,fade)
 path=out/(name+'.wav');wavfile.write(path,rate,(a*32767).astype(np.int16))
 return {'id':name,'file':path.name,'duration':len(a)/rate,'peak':float(np.max(np.abs(a))),'rms':float(np.sqrt(np.mean(a*a))),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'source':'original DSP'+(' + jsfxr' if name in ['arcaneBolt','frost','ward','oath','shadow','meteorCast'] else '')}
n=lambda seconds:int(rate*seconds)
air=lambda seconds,low,high,decay=10:hiss(n(seconds),low,high,decay)
thud=lambda seconds,f=75:tone(n(seconds),f,35,18)
effects={
 'click':air(.055,900,3000,80),
 'bladeSwing':mix(air(.28,600,4800,8),.22*thud(.23,145)),
 'bowRelease':mix(pluck(n(.35),190),.3*air(.1,450,2400,35)),
 'arcaneBolt':mix(seed('arcane'),.3*air(.35,450,1500,8)),
 'hammerSwing':mix(air(.38,70,650,5),1.5*thud(.3,83)),
 'daggerSwing':mix(air(.13,3300,8500,18),delayed(.35*air(.07,1000,5000,40),.035)),
 'claw':mix(air(.16,450,1700,16),.4*thud(.12,105)),
 'bite':mix(air(.24,200,800,10),tone(n(.16),125,60,18)),
 'crossbow':mix(pluck(n(.21),115),air(.065,1300,4800,65)),
 'chant':mix(tone(n(.7),110,145,3),.4*tone(n(.65),165,218,3),.7*air(.5,300,1000,4)),
 'cleave':mix(air(.4,120,1600,7),thud(.38,68)),
 'doom':mix(tone(n(1.1),54,28,2),.7*air(1,90,450,3)),
 'sweep':mix(air(.42,700,6000,6),delayed(.4*air(.22,300,1500,10),.06)),
 'ward':mix(seed('ward'),air(.7,1600,4400,5)),
 'volley':mix(*[delayed(pluck(n(.18),210)*.7,t) for t in [0,.11,.22]]),
 'arrowRain':mix(*[delayed(air(.26,2300,8500,10),t) for t in [0,.09,.18,.27]]),
 'frost':mix(.4*seed('frost'),crackle(n(.6)),air(.45,4400,9800,7)),
 'meteorCast':mix(seed('meteor'),air(.8,80,1100,1.5)[::-1]),
 'shieldBash':mix(1.5*thud(.35,95),air(.22,240,1800,18),.12*tone(n(.12),670,300,40)),
 'oath':mix(seed('oath'),tone(n(.95),146.83,None,2),.5*air(.6,240,700,4)),
 'shadow':mix(.35*seed('shadow'),air(.28,500,2800,8)[::-1],.45*thud(.28,67)),
 'execute':mix(air(.14,3200,7800,22),delayed(air(.2,250,1200,15),.055)),
 'metalHit':mix(air(.12,650,3800,35),thud(.16,135),.08*tone(n(.07),1300,None,70)),
 'fleshHit':mix(thud(.14,90),air(.12,120,900,30)),
 'arrowHit':mix(pluck(n(.13),125),air(.09,700,2800,45)),
 'frostHit':mix(crackle(n(.22)),.2*thud(.13,200)),
 'fireHit':mix(air(.8,70,1700,5),tone(n(.65),58,26,6)),
 'bladeHit':mix(air(.14,1400,5800,25),.5*thud(.1,135)),
 'magicHit':mix(tone(n(.3),380,80,11),air(.22,500,2500,16)),
 'loot':mix(pluck(n(.22),880),delayed(.5*pluck(n(.18),1320),.05)),
 'death':mix(air(.45,100,600,6),tone(n(.4),100,36,9)),
 'won':mix(*[delayed(tone(n(.5),f,None,6),i*.15) for i,f in enumerate([220,277.18,329.63,440])]),
 'lost':mix(tone(n(.8),146.83,73.416,3),.35*air(.6,100,450,6)),
 'entry':mix(air(.7,150,700,4),tone(n(.8),146.83,None,5),delayed(tone(n(.6),220,None,6),.14))}
for hero,f in [('warrior',110),('archer',200),('mage',145),('tank',82),('assassin',180)]:
 # Breathy nonverbal exertion textures, not recorded or linguistic voices.
 a=tone(n(.21),f,f*.73,13);v=air(.2,400,1800,13);effects[hero+'Hurt']=mix(a,.8*v,.2*a*np.sin(np.arange(len(a))/rate*2*np.pi*710))
report=[save(k,a) for k,a in effects.items()]
for theme in ['camp','ash','forest','fortress','abbey','crypt']:
 duration=16;count=n(duration);t=np.arange(count)/rate;freq=np.fft.rfftfreq(count,1/rate)
 noise=rng.normal(size=len(freq))+1j*rng.normal(size=len(freq));cut={'camp':240,'ash':700,'forest':2400,'fortress':400,'abbey':350,'crypt':180}[theme]
 spectrum=noise/(1+(freq/cut)**2);spectrum[freq<45]=0;bed=np.fft.irfft(spectrum,n=count);bed/=max(abs(bed));bed*=.5+.12*np.sin(2*np.pi*t/duration*3)
 for f,g in [(73.416,.055),(110,.035),(146.83,.025)]:
  hz=round(f*duration)/duration;bed+=np.sin(2*np.pi*hz*t)*g*(.7+.2*np.sin(2*np.pi*t/duration))
 if theme in ['forest','crypt']:
  for at in [1.4,5.2,10.8,14.2]:
   droplet=tone(n(.18),1250 if theme=='forest' else 670,900 if theme=='forest' else 350,22)*.09;start=int(at*rate);bed[start:start+len(droplet)]+=droplet
 report.append(save('ambient-'+theme,bed,True))
licenses=root/'素材库/07_音频特效/声景v009';licenses.mkdir(parents=True,exist_ok=True)
meta={'date':'2026-10-31','method':'Original physical DSP + 6 layers rendered by vendored grumdrig/jsfxr (Unlicense); no voice recordings','repository':'https://github.com/grumdrig/jsfxr','license':'tools/vendor/jsfxr/UNLICENSE','sampleRate':rate,'files':report}
(out/'manifest.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf-8');(licenses/'配方与来源.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf-8')
print('Generated',len(effects),'effects + 6 looping ambience tracks')
