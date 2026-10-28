'use strict';
const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let units=[], manifest, currentUnit;
const main=$('#main');
const pageURL=(id,page,activity)=>`#/unit/${id}/page/${page}${activity!==undefined?`/activity/${activity}`:''}`;
const badge={key:'Answer',sample:'Sample answer',practice:'Practice task'};

function unitDirectory(u){
 return `<section class="unit-section ${esc(u.color)}" id="unit-${u.id}" aria-labelledby="unit-title-${u.id}"><div class="unit-heading"><div class="unit-number">${String(u.id).padStart(2,'0')}</div><div><span class="unit-label">UNIT ${u.id}</span><h3 id="unit-title-${u.id}">${esc(u.title)}</h3><p>Student’s Book pages ${esc(u.range)}</p></div></div><p class="choose-prompt">Click the page number you are studying.</p><div class="page-grid">${u.pages.map(p=>`<a class="page-card" href="${pageURL(u.id,p.number)}" aria-label="Open Unit ${u.id}, page ${p.number}: ${esc(p.title)}"><span class="page-card-label">PAGE</span><span class="page-card-number">${p.number}<span aria-hidden="true">→</span></span><span class="page-card-topic">${esc(p.title)}</span></a>`).join('')}</div></section>`;
}
function directory(selected){
 currentUnit=selected||null;
 document.title=selected?`Unit ${selected.id}: ${selected.title} | 11th Grade MEB English`:'11th Grade MEB English';
 main.className='directory';
 main.innerHTML=`${selected?'<a class="back-link" href="#/">← All units and pages</a>':''}<div class="directory-heading"><h2>${selected?`Choose a page from Unit ${selected.id}`:'Find your book page'}</h2><p>Use the page number printed in your <strong>Student’s Book</strong>. Click a page below to open its questions and answers.</p></div>${(selected?[selected]:units).map(unitDirectory).join('')}<div class="more-units"><strong>More units will be added here.</strong><p>The same unit-and-page layout will be used for future answer keys.</p></div><div class="reading-guidelines"><h3>Before you check</h3><ul><li>Try the exercise in your book first.</li><li>On each page, read the question and find its answer directly underneath.</li><li><span class="sample-inline">Sample answer</span> means one possible response. Use your own ideas and experiences.</li><li>For picture, listening and reading activities, keep the full page or recording in your book open.</li></ul></div>`;
}
function splitQuestion(text,index){
 const match=text.match(/^([a-f]|\d+)[.]\s+(.*)$/s);
 return match?{number:match[1],text:match[2]}:{number:String(index+1),text};
}
function activityHTML(a,index){
 const type=a.kind;
 const qa=a.questions?`<div class="qa-list">${a.questions.map((q,i)=>{const v=splitQuestion(q,i);return `<div class="qa-item"><div class="question-line"><span class="question-number">${esc(v.number)}</span><p>${esc(v.text)}</p></div><div class="answer-line ${esc(type)}"><strong>${type==='sample'?'Sample answer':type==='practice'?'Practice':'Answer'}</strong><p>${esc(a.answers[i])}</p></div></div>`;}).join('')}</div>`:`<div class="group-answer ${esc(type)}"><span class="answer-heading">${type==='sample'?'Sample answer':type==='practice'?'What to do':'Answer'}</span>${a.answers.length===1?`<p>${esc(a.answers[0])}</p>`:`<ul>${a.answers.map(text=>`<li>${esc(text)}</li>`).join('')}</ul>`}</div>`;
 return `<article class="exercise ${esc(type)}" id="activity-${index}"><div class="exercise-header"><span class="exercise-label">${/^\d/.test(a.label)?'Exercise ':''}${esc(a.label)}</span><span class="answer-badge ${esc(type)}">${badge[type]}</span></div><h3>${esc(a.title)}</h3><p class="exercise-prompt">${esc(a.prompt)}</p>${qa}${a.note?`<p class="exercise-note"><strong>Note:</strong> ${esc(a.note)}</p>`:''}</article>`;
}
function pageNavigation(unit,page,position){
 const i=unit.pages.indexOf(page),prev=unit.pages[i-1],next=unit.pages[i+1];
 return `<nav class="page-navigation ${position||''}" aria-label="${position==='bottom'?'Bottom':'Top'} page navigation">${prev?`<a class="nav-button" href="${pageURL(unit.id,prev.number)}">← Page ${prev.number}</a>`:'<span></span>'}<a class="nav-button index-button" href="#/unit/${unit.id}">Choose another page</a>${next?`<a class="nav-button next" href="${pageURL(unit.id,next.number)}">Page ${next.number} →</a>`:'<span></span>'}</nav>`;
}
function reader(unit,page,index){
 currentUnit=unit;main.className='reader';
 document.title=`Page ${page.number} · ${unit.title} | 11th Grade MEB English`;
 main.innerHTML=`<nav class="breadcrumbs" aria-label="You are here"><a href="#/">All pages</a><span>›</span><a href="#/unit/${unit.id}">Unit ${unit.id}: ${esc(unit.title)}</a><span>›</span><strong>Page ${page.number}</strong></nav><section class="page-title ${esc(unit.color)}"><div class="large-page-number"><span>PAGE</span>${page.number}</div><div><p class="unit-label">UNIT ${unit.id} · ${esc(unit.title)}</p><h2>${esc(page.title)}</h2><p>${esc(page.section)}</p></div></section><div class="page-tools"><label for="page-select">Go to page <select id="page-select">${unit.pages.map(p=>`<option value="${p.number}" ${p.number===page.number?'selected':''}>${p.number} — ${esc(p.title)}</option>`).join('')}</select></label><div class="print-actions"><button id="print-page">Print this page</button><button id="print-unit">Print whole unit</button></div></div>${pageNavigation(unit,page,'top')}<div class="page-guidance"><strong>Questions first. Answers underneath.</strong><p>All answers on this page are open. Orange boxes contain brief sample responses that you can personalise.</p></div><div class="exercises">${page.activities.map(activityHTML).join('')}</div>${pageNavigation(unit,page,'bottom')}<div class="page-source"><strong>About these questions and answers</strong><p>${esc(manifest.questionNote)}</p><p>Fixed answers follow the supplied MEB Teacher’s Guide. The sample responses are examples, not the only acceptable answers. Book page numbers are used throughout.</p></div>`;
 $('#page-select').addEventListener('change',event=>{location.hash=pageURL(unit.id,Number(event.target.value));});
 $('#print-page').addEventListener('click',()=>printPages(unit,[page]));
 $('#print-unit').addEventListener('click',()=>printPages(unit,unit.pages));
 if(index!==undefined){const target=$(`#activity-${index}`);if(target)requestAnimationFrame(()=>{target.scrollIntoView({block:'start',behavior:'smooth'});target.classList.add('target-exercise');});}
}
function printPages(unit,pages){
 $('#print-root').innerHTML=`<div class="print-intro"><h1>11th Grade MEB English</h1><p>Unit ${unit.id}: ${esc(unit.title)} · Prepared by Sinan Seden</p><p>Questions are transcribed or shortened for clarity. “Sample answer” means one possible response.</p></div>${pages.map(p=>`<section class="print-page"><h2>Student’s Book · Page ${p.number}</h2><p>${esc(p.section)}</p>${p.activities.map(activityHTML).join('')}</section>`).join('')}`;
 window.print();
}
function route(){
 const parts=location.hash.slice(1).split('/').filter(Boolean);
 const unit=parts[0]==='unit'?units.find(u=>u.id===Number(parts[1])):null;
 if(unit&&parts[2]==='page'){
   const page=unit.pages.find(p=>p.number===Number(parts[3]));
   if(page)reader(unit,page,parts[4]==='activity'?Number(parts[5]):undefined);
   else directory(unit);
 }else directory(unit);
 document.querySelectorAll('[data-nav]').forEach(a=>{const active=unit?a.dataset.nav===String(unit.id):a.dataset.nav==='all';a.classList.toggle('active',active);active?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current');});
 if(parts[4]!=='activity')window.scrollTo({top:0,behavior:'instant'});
}
async function init(){
 try{
  const r=await fetch('data/manifest.json');if(!r.ok)throw new Error('Could not load page directory');manifest=await r.json();
  units=await Promise.all(manifest.units.filter(u=>u.status==='available').map(async u=>{const r=await fetch(`data/${u.file}`);if(!r.ok)throw new Error(u.file);return r.json();}));
  $('#unit-nav').innerHTML=units.map(u=>`<a href="#/unit/${u.id}" data-nav="${u.id}">Unit ${u.id}: ${esc(u.title)}</a>`).join('');
  route();window.addEventListener('hashchange',route);
 }catch(error){main.innerHTML='<div class="error-state"><h2>The book pages could not load.</h2><p>Please reload the page and try again.</p><button id="retry">Reload pages</button></div>';$('#retry').addEventListener('click',()=>location.reload());console.error(error);}
}
init();
