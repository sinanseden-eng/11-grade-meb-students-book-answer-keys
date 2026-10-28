"""Add typed answers to the teacher-supplied Student's Book PDF.
Usage: python scripts/annotate-book.py /absolute/path/to/original.pdf
The original PDF is not stored in Git. Outputs are website page images.
"""
import sys,json,re,textwrap,io,os
from pathlib import Path
import fitz
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
SRC=fitz.open(sys.argv[1]); OUT=fitz.open()
DEST=ROOT/'dist'/'pages'; DEST.mkdir(exist_ok=True)
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BLUE=(0.04,0.20,0.72); LIGHT=(.94,.97,1); INK=(.07,.19,.39)
UNITS=[json.loads((ROOT/f'dist/data/unit-{i:02}.json').read_text()) for i in (1,2)]
DATA={p['number']:p for u in UNITS for p in u['pages']}
LOG=[]

def norm(t):return t.replace('–','-').replace('—','-').replace('’',"'").replace('→','->').replace('✦','*')
def lines(page):
 return [(fitz.Rect(l['bbox']),''.join(s['text'] for s in l['spans'])) for b in page.get_text('dict',flags=fitz.TEXTFLAGS_DICT & ~fitz.TEXT_PRESERVE_IMAGES)['blocks'] for l in b.get('lines',[])]
def blanks(page,y0=0,y1=800):
 found=[]
 for b in page.get_text('rawdict',flags=fitz.TEXTFLAGS_RAWDICT & ~fitz.TEXT_PRESERVE_IMAGES)['blocks']:
  for l in b.get('lines',[]):
   chars=[c for s in l['spans'] for c in s['chars']];t=''.join(c['c'] for c in chars)
   for m in re.finditer(r'\.{8,}',t):
    rect=fitz.Rect(chars[m.start()]['bbox'])
    for c in chars[m.start()+1:m.end()]:rect|=fitz.Rect(c['bbox'])
    if y0<=rect.y0<y1:found.append(rect)
 return sorted(found,key=lambda r:(round(r.y0/3),r.x0))
def write(page,rect,text,size=10,clear=False,align=0):
 rect=fitz.Rect(rect);text=norm(text)
 if clear:page.draw_rect(rect,color=None,fill=(1,1,1),overlay=True)
 size=min(size,11)
 while size>=6.5:
  shape=page.new_shape();spare=shape.insert_textbox(rect,text,fontname='ans',fontsize=size,color=BLUE,align=align,lineheight=1.15)
  if spare>=0:shape.commit();return
  size-=.25
 raise ValueError(f'Cannot fit {text!r} in {rect}')
def fill(page,original,answers,y0,y1,size=10):
 bs=blanks(original,y0,y1)
 assert len(bs)==len(answers),(N,y0,y1,len(bs),len(answers))
 for r,a in zip(bs,answers):write(page,(r.x0,r.y0-1,r.x1,r.y1+2),a,size,True)
def underline(page,original,term,y0,y1):
 rs=original.search_for(term,clip=fitz.Rect(0,y0,540,y1))
 assert rs,(N,term,y0,y1)
 for r in rs:page.draw_line((r.x0,r.y1-1),(r.x1,r.y1-1),color=BLUE,width=1.6)
def choice(page,x,y):page.draw_oval(fitz.Rect(x-3,y-2,x+13,y+14),color=BLUE,width=1.5)
def tick(page,x,y):
 page.draw_line((x-4,y),(x-1,y+4),color=BLUE,width=1.8);page.draw_line((x-1,y+4),(x+6,y-5),color=BLUE,width=1.8)
def words_for(page,x,y,w,text,size=9.4,h=25):write(page,(x,y,x+w,y+h),text,size)

for N,content in DATA.items():
 original=SRC[N];done=set();working=fitz.open();page=working.new_page(width=800,height=808)
 page.show_pdf_page(fitz.Rect(0,0,original.rect.width,original.rect.height),SRC,N)
 page.insert_font(fontname='ans',fontfile=FONT)
 def mark(label):done.add(label)
 def a(label):return next(x for x in content['activities'] if x['label']==label)['answers']
 if N==10:
  write(page,(105,218,485,325),'Teacher, doctor, nurse, engineer, architect, dentist,\naccountant, lawyer, chef, pilot, journalist,\nsoftware developer.',10.5);mark('2')
  for x,y in [(109,604),(344,624),(109,708)]:tick(page,x,y)
 if N==11:
  fill(page,original,a('5'),260,410,9.5);mark('5')
  choice(page,76,499);mark('6')
  for term,y0,y1 in [('statistician',560,580),('an accountant',580,600),('mechatronics',613,631),('computer systems analyst',631,649)]:underline(page,original,term,y0,y1)
  mark('7');fill(page,original,a('8'),680,745);mark('8')
 if N==12:
  for x,y in [(120,137),(120,166),(120,253),(323,166),(323,225),(323,253)]:tick(page,x,y)
  mark('9');fill(page,original,a('10'),365,580);mark('10');fill(page,original,[t.split('. ',1)[1] for t in a('11')],620,745);mark('11')
 if N==13:
  for x,y in [(365,511),(191,571),(365,630)]:choice(page,x,y)
  mark('Idioms 1');fill(page,original,a('Idioms 2'),675,750,9.4);mark('Idioms 2')
 if N==14:
  underline(page,original,'why an e-portfolio is beneficial',480,505);mark('E-Portfolio 1')
 if N==15:
  for x,y,t in [(73,474,'4'),(301,474,'2'),(73,624,'1'),(301,624,'3')]:write(page,(x,y,x+22,y+24),t,11)
  mark('3');mark('1');mark('2')
 if N==16:
  fill(page,original,a('4'),160,380);mark('4')
  for x,y,w,t in [(164,615,280,'1. web designer'),(352,654,150,'2. next Monday'),(150,701,260,"3. the dentist"),(160,734,240,'4. 19 October')]:words_for(page,x,y,w,t,9.1,h=19)
  mark('6')
 if N==17:
  bs=blanks(original,340,600)
  # Blank a wraps onto a second line in the source; use the two-line space.
  write(page,(bs[0].x0,bs[0].y0,bs[0].x1,bs[0].y1), 'Can you tell me a little',8.7,True)
  write(page,(bs[1].x0,bs[1].y0,bs[1].x1,bs[1].y1),'bit about yourself?',9.3,True)
  for r,t in zip(bs[2:],['What are your strengths?','Why do you want this job?']):write(page,r+fitz.Rect(0,-1,0,2),t,10,True)
  mark('9')
  for term,y0,y1 in [('projects',400,420),('useful',432,453),('researching',450,470),('effective',524,545),('essential',540,561),('ambitious',615,637)]:underline(page,original,term,y0,y1)
  mark('10')
  for term,y0,y1 in [('Can you tell me a little bit about yourself?',100,123),('What are your strengths?',138,158),('Why do you want this job?',189,208)]:underline(page,original,term,y0,y1)
  mark('8')
 if N==18:
  for y,t in zip([126,153,180,206,242],['3','2','4','1','5']):write(page,(91,y,107,y+19),t,10.5)
  mark('11')
 if N==19:
  fill(page,original,['B.A.','B.S.','M.A.','M.S.'],665,748);mark('Reading 1')
 if N==20:
  fill(page,original,a('3'),158,192);mark('3')
 if N==21:
  for x,y in [(289,121),(289,168),(289,254),(91,301),(91,419),(91,469),(91,587),(91,652)]:choice(page,x,y)
  mark('4')
 if N==22:
  pass
 if N==23:
  fill(page,original,a('8'),78,220);mark('8')
  choice(page,292,339);mark('10')
 if N==24:
  for y,t in zip([83,106,129,152,174,199],['4','1','5','3','6','2']):write(page,(91,y,106,y+18),t,11)
  mark('11');fill(page,original,a('12'),272,405);mark('12')
 if N==26:
  fill(page,original,a('1'),200,584,9.5);mark('1')
  write(page,(91,676,510,735),'Reading, drawing, cycling, cooking, hiking, pottery,\ncoding, gardening, origami, dancing and photography.',10);mark('3')
 if N==27:
  for term in a('4'):underline(page,original,term,90,210)
  mark('4');choice(page,360,260);mark('5')
  fill(page,original,['camping','hiking','flowers','Gardening','arts and crafts','embroidery','pottery'],410,530);mark('6')
 if N==28:
  for x,y in [(105,639),(303,678),(105,716)]:choice(page,x,y)
  mark('Idioms')
 if N==29:
  for x,y,t in [(105,172,'speaks - starts'),(247,172,'enjoys - needs'),(389,172,'fixes - teaches'),(105,421,'books - tents'),(247,421,'flowers - birds'),(389,421,'glasses - beaches')]:write(page,(x,y,x+99,y+27),t,9.4,align=1)
  mark('1');mark('2–3');mark('4');mark('5–6')
 if N==30:
  fill(page,original,['altruism','calligraphy'],245,310);mark('1');fill(page,original,a('2'),383,490);mark('2')
  for term,y0,y1 in [('indoor',530,558),('drawing',561,591),('reality TV shows',607,625),('once',622,644),('Chinese',666,685),('3',684,700),('altruism',698,716),('charity',714,733)]:underline(page,original,term,y0,y1)
  mark('3')
 if N==31:
  fill(page,original,a('Reading 2'),730,747,9);mark('Reading 2')
 if N==32:
  for y,name,hobby in zip([652,676,699,723],['Tom Hanks','David Beckham','Leslie Mann','Oprah Winfrey'],['collecting typewriters','fencing','riding a unicycle','philanthropy']):
   write(page,(113,y,290,y+21),name,10);write(page,(310,y,510,y+21),hobby,10)
  mark('3')
 if N==33:
  fill(page,original,a('5'),205,372,9);mark('5')
 if N==34:choice(page,418,157);mark('9')
 if N==35:
  for x,y in zip([345,387,387,345,450,387,450,345,450],[124,156,185,215,245,273,309,347,378]):tick(page,x,y)
  mark('10');choice(page,75,461);mark('11');fill(page,original,a('12'),610,747,9.7);mark('12')
 if N==36:fill(page,original,a('13'),92,193,9.7);mark('13')

 # Sample responses are typeset on the same page, next to the source exercises.
 # No original question text or illustration is covered by these longer answers.
 groups=[]
 for ac in content['activities']:
  if ac['label'] in done:continue
  label=ac['label'];heading=('Ex. '+label if label[0].isdigit() else label)
  heading+=' | '+('Sample' if ac['kind']=='sample' else 'Practice' if ac['kind']=='practice' else 'Answer')
  if ac.get('questions'):
   body='\n'.join(f'{i+1}. {re.sub(r"^[a-f]\\. ","",t)}' for i,t in enumerate(ac['answers']))
  else:body='\n'.join(ac['answers'])
  groups.append((heading,norm(body)))
 if N==15:groups.append(('Vocabulary','degree: university qualification\nvacancy: an available job\nschedule: arrange a time'))
 if N==18:groups.insert(0,('Ex. 11 | Extra word','determined'))
 if N==35:groups.append(('Ex. 10 | Corrections','2. He was incredibly intelligent.\n3. He left high school at 19.\n6. His doctorate was at Imperial College, London.\nNo information: 5, 7, 9.'))
 page.draw_rect(fitz.Rect(566,0,800,808),color=None,fill=LIGHT)
 page.draw_line((566,0),(566,808),color=(.73,.82,.94),width=1)
 write(page,(580,22,785,48),f'PAGE {N} - ANSWER KEY',11)
 y=57;size=8.7
 for heading,body in groups:
  wrapped=[]
  for line in body.splitlines():wrapped+=textwrap.wrap(line,width=43,break_long_words=False) or ['']
  height=len(wrapped)*size*1.42+9
  # Extend the answer canvas when a page has many open-ended tasks.
  if y+height+28>page.rect.height:
   page.set_mediabox(fitz.Rect(0,0,800,y+height+48))
   page.draw_rect(fitz.Rect(566,808,800,page.rect.height),color=None,fill=LIGHT)
  page.draw_rect(fitz.Rect(578,y,788,y+18),color=None,fill=(.85,.91,.99))
  write(page,(583,y+2,785,y+18),heading,9)
  y+=23
  write(page,(583,y,784,y+height),'\n'.join(wrapped),size)
  y+=height+12
 if not groups:page.set_mediabox(fitz.Rect(0,0,original.rect.width,808))
 # Label original page and keep the source footer unobscured.
 write(page,(18,779,548,800),'Typed blue text = answers. Sample responses are examples; personalise them.',8.1)
 OUT.insert_pdf(working)
 LOG.append({'page':N,'filledGroups':sorted(done),'sideGroups':len(groups),'height':page.rect.height})
 working.close()

OUTPUT=ROOT/'docs'/'units-1-2-annotated.pdf'
OUT.save(OUTPUT,garbage=4,deflate=True)
for p,n in zip(OUT,DATA):
 pix=p.get_pixmap(matrix=fitz.Matrix(2,2),alpha=False)
 im=Image.frombytes('RGB',(pix.width,pix.height),pix.samples)
 buf=io.BytesIO();im.save(buf,format='WEBP',quality=86,method=6)
 asset=DEST/f'page-{n:02}.webp'; temp=asset.with_suffix('.tmp')
 temp.write_bytes(buf.getvalue());os.replace(temp,asset)
 assert asset.stat().st_size>1000
(ROOT/'docs'/'annotation-audit.json').write_text(json.dumps(LOG,indent=2)+'\n')
print(json.dumps({'pdf':str(OUTPUT),'pages':len(OUT),'images':len(list(DEST.glob('*.webp'))),'bytes':sum(p.stat().st_size for p in DEST.glob('*.webp'))}))
