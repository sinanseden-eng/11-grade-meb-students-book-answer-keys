'use strict';
const units=[{id:1,pages:Array.from({length:15},(_,i)=>i+10)},{id:2,pages:Array.from({length:11},(_,i)=>i+26)}];
const pageNumbers=units.flatMap(u=>u.pages),image=document.querySelector('#page-image'),sheet=document.querySelector('#sheet');
let currentPage;
document.querySelector('#pages').innerHTML=units.map(u=>`<div class="unit-pages"><span class="unit-label">Unit ${u.id}</span><div>${u.pages.map(n=>`<a href="#/unit/${u.id}/page/${n}" data-page="${n}" aria-label="Page ${n}">${n}</a>`).join('')}</div></div>`).join('');
function showPage(){
 const hash=location.hash;const m=hash.match(/\/page\/(\d+)/)||hash.match(/^#page-(\d+)/);let n=m?Number(m[1]):10;
 if(!pageNumbers.includes(n))n=10;
 currentPage=n;sheet.classList.remove('enlarged');sheet.setAttribute('aria-pressed','false');sheet.setAttribute('aria-label',`Enlarge answer-key page ${n}`);
 image.src=`pages/page-${n}.webp`;image.alt=`Student’s Book page ${n}, with typed blue answers and brief sample responses.`;
 document.title=`Page ${n} | 11th Grade MEB English`;
 document.querySelectorAll('[data-page]').forEach(a=>{const selected=Number(a.dataset.page)===n;a.classList.toggle('selected',selected);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 document.querySelector('#accessible-answers').textContent='';
 const unit=units.find(u=>u.pages.includes(n));fetch(`data/unit-0${unit.id}.json`).then(r=>r.json()).then(u=>{if(currentPage!==n)return;const p=u.pages.find(p=>p.number===n);const root=document.querySelector('#accessible-answers');const h=document.createElement('h2');h.textContent=`Page ${n} answers`;root.append(h);for(const a of p.activities){const s=document.createElement('section');const h=document.createElement('h3');h.textContent=`${a.label}: ${a.prompt}`;s.append(h);a.answers.forEach((answer,i)=>{const p=document.createElement('p');p.textContent=`${a.questions?.[i]||''} ${a.kind==='sample'?'Sample answer:':'Answer:'} ${answer}`;s.append(p);});root.append(s);}}).catch(()=>{});
 window.scrollTo({top:0,behavior:'instant'});
}
sheet.addEventListener('click',()=>{const expanded=sheet.classList.toggle('enlarged');sheet.setAttribute('aria-pressed',String(expanded));sheet.setAttribute('aria-label',`${expanded?'Reduce':'Enlarge'} answer-key page ${currentPage}`);});
window.addEventListener('hashchange',showPage);showPage();
