"""Author the actual Russian packaging artwork, not an image of packaging."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math
HERE=Path(__file__).resolve().parent
FONT=HERE.parent.parent/'static/fonts/onest-variable.ttf'
INK='#123d2d'; GREEN='#22644b'; PALE='#ecf1d7'; PAPER='#fff8e9'
def font(n):
 f=ImageFont.truetype(str(FONT),n)
 f.set_variation_by_axes([600 if n>=40 else 450])
 return f

def label():
 im=Image.new('RGB',(2048,512),PAPER);d=ImageDraw.Draw(im)
 d.rectangle((0,0,2048,39),fill=GREEN)
 art=Image.open(HERE/'botanical-print.png').convert('RGB')
 im.paste(art.resize((800,267),Image.Resampling.LANCZOS),(112,245))
 d=ImageDraw.Draw(im)
 def text(x,y,t,size=25,fill=INK):d.text((x,y),t,font=font(size),fill=fill,anchor='mt')
 text(512,8,'МОЛОЧНАЯ КОЛЛЕКЦИЯ',17,PALE)
 text(512,76,'ЙОГУРТ',84)
 text(512,172,'натуральный',37)
 d.line((355,234,669,234),fill='#9db781',width=2)
 text(512,255,'3,2%',81)
 text(512,354,'молоко и живые культуры',20)
 text(512,392,'150 г',29)
 text(512,478,'ОБРАЗЕЦ ДЛЯ BLOOM',15)
 x=990
 for y,t in [(77,'СОСТАВ'),(122,'Молоко нормализованное,'),(153,'закваска, пробиотические культуры,'),(184,'натуральный ароматизатор.'),(254,'Хранить при +2…+6 °C.'),(302,'Демонстрационная упаковка.'),(338,'Не для продажи.')]:text(x,y,t,20 if y!=77 else 27)
 text(1536,64,'Пищевая ценность на 100 г',25)
 for y,t in [(108,'Белки 3,2 г   •   Жиры 3,2 г'),(143,'Углеводы 4,7 г   •   61 ккал')]:text(1536,y,t,22)
 d.rounded_rectangle((1296,199,1776,412),radius=8,fill='#fffdf7')
 L=['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011']
 G=['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111']
 R=[''.join('1' if c=='0' else '0' for c in s) for s in L]
 parity=['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL']
 code='2000000000015';bits='101'+''.join((L if p=='L' else G)[int(n)] for p,n in zip(parity[int(code[0])],code[1:7]))+'01010'+''.join(R[int(n)] for n in code[7:])+'101'
 assert len(bits)==95
 for i,b in enumerate(bits):
  if b=='1':d.rectangle((1346+i*4,218,1349+i*4,342 if i not in [0,2,46,48,92,94] else 352),fill='#102b1c')
 text(1536,365,'2 000000 000015',24)
 text(1536,427,'Демонстрационный штрихкод',16)
 text(1536,480,'ОБРАЗЕЦ. НЕ ДЛЯ ПРОДАЖИ.',16)
 d.line((2004,39,2004,455),fill='#d6ddbf',width=3)
 return im
label().save(HERE/'label.png')
label().save(HERE/'label.jpg',quality=95,subsampling=0)
# A colorful printed foil face, same identity as the wrap.
lid=Image.new('RGB',(1024,1024),PAPER);d=ImageDraw.Draw(lid)
d.ellipse((22,22,1002,1002),outline=GREEN,width=23)
d.ellipse((59,59,965,965),outline='#c4d594',width=3)
art=Image.open(HERE/'botanical-print.png').convert('RGB')
lid.paste(art.resize((870,290),Image.Resampling.LANCZOS),(77,665))
d=ImageDraw.Draw(lid)
d.text((512,220),'ЙОГУРТ',font=font(116),fill=INK,anchor='mt')
d.text((512,370),'натуральный',font=font(59),fill=INK,anchor='mt')
d.text((512,493),'3,2%',font=font(130),fill=GREEN,anchor='mt')
d.text((512,738),'150 г',font=font(48),fill=INK,anchor='mt')
d.text((512,630),'ОБРАЗЕЦ ДЛЯ BLOOM',font=font(26),fill=INK,anchor='mt')
lid.save(HERE/'lid.png')
lid.save(HERE/'lid.jpg',quality=95,subsampling=0)
