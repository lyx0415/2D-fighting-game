from pathlib import Path
from PIL import Image
import hashlib,json
root=Path(__file__).resolve().parent.parent
src=root/'素材库/08_生成原稿/v012/menu-camp-original.png'
dest=root/'public/assets/v012/menu-camp.webp'
dest.parent.mkdir(parents=True,exist_ok=True)
im=Image.open(src).convert('RGB');im.save(dest,quality=94,method=6)
data={'version':'0.12.0','date':'2026-11-04','source':str(src.relative_to(root)),'sourceSha256':hashlib.sha256(src.read_bytes()).hexdigest(),'files':[{'path':dest.name,'width':im.width,'height':im.height,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()}]}
(dest.parent/'manifest.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
print('Packed menu background',im.size)
