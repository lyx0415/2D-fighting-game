"""Lossless layout: format conversion only. Runtime crops an unstretched band."""
from pathlib import Path
from PIL import Image
import hashlib
import json
root=Path(__file__).resolve().parent.parent
source=root/'素材库/08_生成原稿/v010/ground-original.png'
target=root/'public/assets/v010/ground.webp'
target.parent.mkdir(parents=True,exist_ok=True)
Image.open(source).convert('RGB').save(target,quality=94,method=6)
im=Image.open(target)
manifest={'version':'0.10.0','date':'2026-10-31','source':str(source.relative_to(root)),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'files':[{'path':target.name,'width':im.width,'height':im.height,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}]}
(target.parent/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
print('Packed v010 ground',im.size)
