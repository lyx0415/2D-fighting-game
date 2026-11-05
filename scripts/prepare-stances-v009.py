from pathlib import Path
import json, shutil, hashlib
import numpy as np
from scipy.ndimage import label
from PIL import Image, ImageChops, ImageFilter
root=Path(__file__).resolve().parent.parent
out=root/'public/assets/v009';raw=root/'素材库/08_生成原稿/v009'
out.mkdir(parents=True,exist_ok=True);raw.mkdir(parents=True,exist_ok=True)
for stem in ['stances','stances-repair']:
    config=root/f'artifacts/generated-v009-{stem}.json'
    meta=json.loads(config.read_text(encoding='utf-8'));meta['tool']='built-in image_gen';meta['transparentBackground']=True;meta['referenceImages']=['public/assets/v008/portrait-'+h+'.webp' for h in ['warrior','archer','mage','tank','assassin']] if stem=='stances' else ['素材库/08_生成原稿/v009/stances.png'];source=Path(meta['path']);saved=raw/(stem+'.png')
    if source.exists() and source.resolve()!=saved.resolve():shutil.copy2(source,saved)
    (raw/(stem+'-prompt.json')).write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf-8')
im=Image.open(raw/'stances-repair.png').convert('RGBA');sheet=Image.new('RGBA',(2560,1024))
for i in range(10):
    x,y=i%5,i//5;tile=im.crop((round(x*im.width/5),round(y*im.height/2),round((x+1)*im.width/5),round((y+1)*im.height/2)))
    # Packing cleanup removes isolated fragments from the neighbouring figure.
    alpha=tile.getchannel('A');components,count=label(np.asarray(alpha)>35,structure=np.ones((3,3)))
    sizes=np.bincount(components.ravel());sizes[0]=0;mask=Image.fromarray((components==int(np.argmax(sizes))).astype('uint8')*255).filter(ImageFilter.MaxFilter(9))
    tile.putalpha(ImageChops.multiply(alpha,mask));tile=tile.crop(tile.getbbox())
    scale=min(420/tile.height,460/tile.width);tile=tile.resize((round(tile.width*scale),round(tile.height*scale)),Image.Resampling.LANCZOS)
    frame=Image.new('RGBA',(512,512));frame.alpha_composite(tile,((512-tile.width)//2,480-tile.height));sheet.alpha_composite(frame,(x*512,y*512))
    if i<5:frame.save(out/('portrait-'+['warrior','archer','mage','tank','assassin'][i]+'.webp'),quality=95,method=4)
sheet.save(out/'stances.webp',quality=93,method=4)
manifest={'version':'0.9.0','date':'2026-10-31','source':'built-in image_gen, identity-preserving edit','frames':10,'frameSize':[512,512],'foot':[256,480],'files':[{'path':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in sorted(out.glob('*.webp'))]}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8');print('Packed 10 stance views, 5 portraits')
