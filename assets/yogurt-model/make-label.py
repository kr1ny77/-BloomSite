"""Author the actual Russian packaging artwork, not an image of packaging."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math
HERE=Path(__file__).resolve().parent
FONT=HERE.parent.parent/'static/fonts/onest-variable.ttf'
INK='#123d2d'; GREEN='#22644b'; PALE='#ecf1d7'; PAPER='#fff1c9'
def font(n):
 f=ImageFont.truetype(str(FONT),n)
 f.set_variation_by_axes([600 if n>=40 else 450])
 return f

def label():
 im=Image.new('RGB',(2048,512),PAPER);d=ImageDraw.Draw(im)
 art=Image.open(HERE/'meadow-print.png').convert('RGB')
 im.paste(art.resize((760,512),Image.Resampling.LANCZOS),(96,0))
 d=ImageDraw.Draw(im)
 def text(x,y,t,size=25,fill=INK):d.text((x,y),t,font=font(size),fill=fill,anchor='mt')
 # The front illustration is large; each text panel has a protected print area.
 d.rounded_rectangle((416,0,608,110),radius=8,fill=GREEN)
 text(512,21,'МОЛОЧНАЯ',22,PALE)
 text(512,53,'КОЛЛЕКЦИЯ',22,PALE)
 text(512,143,'ЙОГУРТ',66)
 text(512,221,'натуральный',30)
 text(512,275,'3,2%',49)
 text(512,84,'150 г',17,PALE)
 # Never center long lines across neighbouring UV panels.
 left,right=875,1205
 d.rectangle((858,39,1221,469),fill=PAPER)
 text(1040,70,'СОСТАВ',26)
 def paragraph(y,copy,size=20):
  words=copy.split();line='';f=font(size)
  for word in words:
   candidate=(line+' '+word).strip()
   if d.textlength(candidate,font=f)>right-left and line:
    d.text((left,y),line,font=f,fill=INK,anchor='lt');y+=size*1.5;line=word
   else:line=candidate
  if line:d.text((left,y),line,font=f,fill=INK,anchor='lt');y+=size*1.5
  return y
 y=paragraph(121,'Молоко нормализованное, закваска, пробиотические культуры, натуральный ароматизатор.')
 paragraph(max(310,y+30),'Хранить при +2…+6 °C.',18)
 paragraph(379,'Демонстрационная упаковка. Не для продажи.',18)
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
# Foil front mirrors the large retail illustration and quiet central type.
lid=Image.open(HERE/'meadow-print.png').convert('RGB').resize((1024,1024),Image.Resampling.LANCZOS)
d=ImageDraw.Draw(lid)
d.ellipse((22,22,1002,1002),outline=GREEN,width=16)
d.rounded_rectangle((397,35,627,198),radius=10,fill=GREEN)
d.text((512,75),'МОЛОЧНАЯ',font=font(26),fill=PALE,anchor='mt')
d.text((512,117),'КОЛЛЕКЦИЯ',font=font(26),fill=PALE,anchor='mt')
d.text((512,265),'ЙОГУРТ',font=font(112),fill=INK,anchor='mt')
d.text((512,408),'натуральный',font=font(54),fill=INK,anchor='mt')
d.text((512,512),'3,2%',font=font(90),fill=GREEN,anchor='mt')
d.text((512,160),'150 г',font=font(26),fill=PALE,anchor='mt')
lid.save(HERE/'lid.png')
lid.save(HERE/'lid.jpg',quality=95,subsampling=0)
