"""Authoring utility: derive Pacifico pen masks and outlines (Pillow, fontTools, uharfbuzz).

Run from any directory. The generated manifest is the editable source for the
inline loom-pen-mask in templates/index.html. After regeneration, replace that
mask's path data and data-pen-length values from the manifest and review the
writing sequence in a browser.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import math,json
ROOT = Path(__file__).resolve().parents[1]
font=ImageFont.truetype(str(ROOT / 'static/fonts/pacifico-regular.ttf'),240)
im=Image.new('L',(540,280));ImageDraw.Draw(im).text((8,240),'loom',font=font,fill=255,anchor='ls')
pts={(x,y) for y in range(im.height) for x in range(im.width) if im.getpixel((x,y))>127}
ns=[(0,-1),(1,-1),(1,0),(1,1),(0,1),(-1,1),(-1,0),(-1,-1)]
while True:
 total=0
 for phase in (0,1):
  dead=[]
  for x,y in pts:
   b=[int((x+dx,y+dy) in pts) for dx,dy in ns];n=sum(b)
   if not 2<=n<=6:continue
   if sum(b[i]==0 and b[(i+1)%8]==1 for i in range(8))!=1:continue
   if phase==0 and (b[0]*b[2]*b[4] or b[2]*b[4]*b[6]):continue
   if phase==1 and (b[0]*b[2]*b[6] or b[0]*b[4]*b[6]):continue
   dead.append((x,y))
  pts.difference_update(dead);total+=len(dead)
 if not total:break
adj={p:[] for p in pts}
for x,y in pts:
 for dx,dy in ns:
  q=x+dx,y+dy
  if q not in pts:continue
  if dx and dy and ((x+dx,y) in pts or (x,y+dy) in pts):continue
  adj[x,y].append(q)
# Trace the skeleton with a left-to-right pen route, visiting loops before their exit.
seen=set();paths=[]
def key(a,b):return tuple(sorted((a,b)))
def walk(start):
 stack=[start];current=[start]
 while stack:
  at=stack[-1];choices=[q for q in adj[at] if key(at,q) not in seen]
  if choices:
   q=min(choices,key=lambda q:(q[0],q[1]));seen.add(key(at,q));stack.append(q);current.append(q)
  else:
   if len(current)>1:paths.append(current)
   stack.pop();current=[stack[-1]] if stack else []
for pt in sorted(pts):
 if any(key(pt,q) not in seen for q in adj[pt]):walk(pt)
# Douglas-Peucker preserves the pen route while reducing mask geometry.
def simplify(p,eps=.7):
 if len(p)<3:return p
 a,b=p[0],p[-1];vx,vy=b[0]-a[0],b[1]-a[1];l=math.hypot(vx,vy)
 ds=[abs(vy*(q[0]-a[0])-vx*(q[1]-a[1]))/l if l else math.dist(a,q) for q in p]
 idx=max(range(len(p)),key=lambda i:ds[i])
 if ds[idx]<=eps:return [a,b]
 return simplify(p[:idx+1],eps)[:-1]+simplify(p[idx:],eps)
result=[]
for path in paths:
 length=sum(math.dist(a,b) for a,b in zip(path,path[1:]))
 if length<2:continue
 coords=[((x-8)/.24+30,(y-240)/.24+980) for x,y in simplify(path)]
 result.append({'d':'M'+' L'.join(f'{x:.1f} {y:.1f}' for x,y in coords),'length':round(length/.24,2)})
# Curated pen order for this exact Pacifico source: l loop, l/oo, then m.
assert len(result) == 8, 'Review the pen order after changing the source font.'
ordered = [result[i] for i in [7, 0, 1, 6, 2, 3, 4, 5]]
output = ROOT / 'assets/wordmark-pen.json'
output.write_text(json.dumps(ordered, indent=2) + '\n')
print(f'Wrote {len(ordered)} pen strokes to {output}')

# Shape the exact font outlines so runtime rendering has no font-loading dependency.
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import uharfbuzz as hb

source = ROOT / 'static/fonts/pacifico-regular.ttf'
face = hb.Face(source.read_bytes())
font = hb.Font(face)
font.scale = (1000, 1000)
buffer = hb.Buffer()
buffer.add_str('loom')
buffer.guess_segment_properties()
hb.shape(font, buffer)
tt = TTFont(source)
glyphs = tt.getGlyphSet()
pen = SVGPathPen(glyphs)
x = 30
for info, position in zip(buffer.glyph_infos, buffer.glyph_positions):
    glyphs[tt.getGlyphName(info.codepoint)].draw(TransformPen(pen,
        (1, 0, 0, -1, x + position.x_offset, 980 - position.y_offset)))
    x += position.x_advance
outline = ROOT / 'assets/wordmark-outline.svg'
outline.write_text(
    '<!-- Pacifico Regular, SIL OFL; static/fonts/Pacifico-OFL.txt. -->\n'
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2200 1100">'
    '<path fill="currentColor" d="' + pen.getCommands() + '"/></svg>\n')
print(f'Wrote font outlines to {outline}')
