"""原创应用盾徽；不是人物/地图的绘图真源。"""
from pathlib import Path
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parent.parent
for size in [192,512]:
 im=Image.new('RGB',(size,size),'#101719');d=ImageDraw.Draw(im);S=lambda x:int(x*size/512)
 d.rounded_rectangle((S(76),S(76),S(436),S(436)),radius=S(75),outline='#b59659',width=S(5))
 d.polygon([(S(160),S(170)),(S(352),S(170)),(S(340),S(310)),(S(256),S(372)),(S(172),S(310))],fill='#243c4d',outline='#d4b978',width=S(7))
 d.polygon([(S(256),S(181)),(S(278),S(265)),(S(256),S(326)),(S(234),S(265))],fill='#e4c784');d.line((S(205),S(248),S(307),S(248)),fill='#e4c784',width=S(9))
 p=root/f'public/icons/oath-{size}.png';p.parent.mkdir(exist_ok=True);im.save(p)
