"""Pack generated art into local runtime textures; preserve original PNGs and prompts."""
from pathlib import Path
import json, shutil, hashlib
from collections import deque
from PIL import Image, ImageFilter, ImageChops, ImageOps

root=Path(__file__).resolve().parent.parent
entries=json.loads((root/'artifacts/generated-v008-inputs.json').read_text(encoding='utf-8'))+json.loads((root/'artifacts/generated-v008-extra.json').read_text(encoding='utf-8'))
repair=json.loads((root/'artifacts/generated-v008-repair.json').read_text(encoding='utf-8'))
out=root/'public/assets/v008';out.mkdir(parents=True,exist_ok=True)
library=root/'素材库/08_生成原稿/v008';library.mkdir(parents=True,exist_ok=True)

def isolated(tile):
    # Retain the main connected silhouette; discard fragments from neighbouring cells.
    alpha=tile.getchannel('A');w,h=tile.size;data=alpha.tobytes();seen=bytearray(w*h);best=[]
    for start,a in enumerate(data):
        if a<40 or seen[start]:continue
        seen[start]=1;component=[];queue=deque([start])
        while queue:
            i=queue.popleft();component.append(i);x,y=i%w,i//w
            for n in (i-1 if x else -1,i+1 if x<w-1 else -1,i-w if y else -1,i+w if y<h-1 else -1):
                if n>=0 and not seen[n] and data[n]>=40:seen[n]=1;queue.append(n)
        if len(component)>len(best):best=component
    mask=bytearray(w*h)
    for i in best:mask[i]=255
    support=Image.frombytes('L',(w,h),bytes(mask)).filter(ImageFilter.MaxFilter(9))
    tile.putalpha(ImageChops.multiply(alpha,support));return tile

records=[]
for entry in entries:
    source=Path(entry['path']);raw=library/(entry['id']+'_original.png')
    if not source.exists():source=raw
    if source.resolve()!=raw.resolve():shutil.copy2(source,raw)
    entry['archivedRaw']=raw.relative_to(root).as_posix()
    if entry['id']=='warrior':
        source=Path(repair['path']);saved=library/'warrior_grid_repair.png'
        if not source.exists():source=saved
        if source.resolve()!=saved.resolve():shutil.copy2(source,saved)
    im=Image.open(source).convert('RGBA')
    if entry['type'] in ('hero','enemy'):
        cw,ch=im.width/4,im.height/3;tiles=[]
        for i in range(12):
            x,y=i%4,i//4
            tile=im.crop((max(0,round(x*cw)-8),max(0,round(y*ch)-8),min(im.width,round((x+1)*cw)+8),min(im.height,round((y+1)*ch)+8)))
            tile=isolated(tile);box=tile.getbbox()
            if not box:raise ValueError('Empty sprite: '+entry['id']+'/'+str(i))
            tiles.append(tile.crop(box))
        base=420/tiles[0].height;sheet=Image.new('RGBA',(2048,1536));frames=[]
        for i,tile in enumerate(tiles):
            factor=min(base,480/tile.width,448/tile.height) if entry['type']=='hero' else min(420/tile.height,480/tile.width)
            tile=tile.resize((round(tile.width*factor),round(tile.height*factor)),Image.Resampling.LANCZOS)
            frame=Image.new('RGBA',(512,512));frame.alpha_composite(tile,((512-tile.width)//2,480-tile.height));sheet.alpha_composite(frame,((i%4)*512,(i//4)*512));frames.append(frame)
        sheet.save(out/f"sheet-{entry['id']}.webp",quality=90,method=6)
        if entry['type']=='hero':frames[0].save(out/f"portrait-{entry['id']}.webp",quality=95,method=6)
        records.append({'id':entry['id'],'frames':12,'size':[512,512],'foot':[256,480],'renderer':'painted-sprite','raw':entry['archivedRaw']})
    elif entry['type']=='scene':
        # Place the illustrated terrain on the same y=360..620 plane as the simulation.
        horizon={'ash':.66,'forest':.61,'fortress':.60,'abbey':.60,'crypt':.60}[entry['id']]
        y0=round(im.height*horizon);y1=round(im.height*.9);canvas=Image.new('RGB',(1920,720))
        for a,b,top,height in [(0,y0,0,360),(y0,y1,360,260),(y1,im.height,620,100)]:canvas.paste(im.crop((0,a,im.width,b)).convert('RGB').resize((1920,height),Image.Resampling.LANCZOS),(0,top))
        canvas.save(out/f"scene-{entry['id']}.webp",quality=91,method=6)
    else:ImageOps.fit(im.convert('RGB'),(3000,680),Image.Resampling.LANCZOS,centering=(.5,.65)).save(out/'chapter.webp',quality=92,method=6)
# Environment props are separately generated so they can be placed at varied depths.
props_input=root/'artifacts/generated-v008-props.json'
if props_input.exists():
    prop=json.loads(props_input.read_text(encoding='utf-8'));source=Path(prop['path']);saved=library/'props_original.png'
    if not source.exists():source=saved
    if source.resolve()!=saved.resolve():shutil.copy2(source,saved)
    image=Image.open(source).convert('RGBA');atlas=Image.new('RGBA',(2048,1024))
    for i in range(8):
        x,y=i%4,i//4;tile=image.crop((round(x*image.width/4),round(y*image.height/2),round((x+1)*image.width/4),round((y+1)*image.height/2)))
        tile=tile.crop(tile.getbbox());factor=min(440/tile.width,440/tile.height);tile=tile.resize((round(tile.width*factor),round(tile.height*factor)),Image.Resampling.LANCZOS)
        atlas.alpha_composite(tile,(x*512+(512-tile.width)//2,y*512+480-tile.height))
    atlas.save(out/'props.webp',quality=90,method=4)
    (library/'props-prompt.json').write_text(json.dumps(prop,ensure_ascii=False,indent=2),encoding='utf-8')
(library/'prompts-and-sources.json').write_text(json.dumps({'date':'2026-10-31','tool':'built-in image_gen','entries':entries,'repair':repair,'packing':'Crop grid with 8px overscan, remove neighbour fragments, uniform transparent 512px cells, WebP. No faces or bodies drawn by packing code.'},ensure_ascii=False,indent=2),encoding='utf-8')
(out/'manifest.json').write_text(json.dumps({'version':'0.8.0','characters':records,'files':[{'path':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in sorted(out.glob('*.webp'))]},ensure_ascii=False,indent=2),encoding='utf-8')
print('Packed',len(records),'sheets;',len(list(out.glob('*.webp'))),'runtime textures')
