'use strict';

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storageKey = 'meb-11-answer-studio-v1';
let state;
try { state = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { state = {}; }
if (typeof state !== 'object' || Array.isArray(state)) state = {};
if (!Array.isArray(state.saved)) state.saved = [];
if (!Array.isArray(state.reviewed)) state.reviewed = [];
let manifest, units = [], currentUnit, currentPage, filter = 'all', toastTimer;
const main = $('#main');
const pageKey = (unit, page) => `${unit}:${page}`;
const routeFor = (unit, page, activity) => `#/unit/${unit}/page/${page}${activity !== undefined ? `/activity/${activity}` : ''}`;
function persist() { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* Session remains usable without browser storage. */ } updateCounters(); }
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2400); }
function updateCounters() {
  $('#saved-count').textContent = state.saved.length;
  const count = $('#reviewed-total'); if (count) count.textContent = state.reviewed.length;
}
const star = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 1 24 15 39 20 24 25 20 39 15 25 1 20 15 15Z" fill="currentColor"/></svg>';
const arrow = '<span aria-hidden="true">↗</span>';
function careerArt() { return `<svg class="hero-illustration" viewBox="0 0 520 360" fill="none" aria-hidden="true">
 <ellipse cx="274" cy="187" rx="198" ry="106" transform="rotate(-23 274 187)" stroke="#6b59b8" stroke-width="1.4" stroke-dasharray="5 7"/>
 <circle cx="416" cy="86" r="10" fill="#b7d4f5" stroke="#39304e" stroke-width="2"/>
 <path d="M95 128v24m-12-12h24" stroke="#6d55b6" stroke-width="2"/>
 <rect x="153" y="59" width="229" height="253" rx="17" transform="rotate(9 153 59)" fill="#a6c3ef" stroke="#302a40" stroke-width="2"/>
 <rect x="139" y="50" width="229" height="253" rx="17" transform="rotate(-7 139 50)" fill="#fffdf4" stroke="#302a40" stroke-width="2"/>
 <path d="m151 93 214-26" stroke="#302a40" stroke-width="1.5"/>
 <circle cx="159" cy="74" r="3" fill="#e59078"/><circle cx="171" cy="72" r="3" fill="#d5df92"/><circle cx="183" cy="71" r="3" fill="#aaa0d6"/>
 <text x="171" y="141" transform="rotate(-7 171 141)" fill="#74619d" font-family="Arial,sans-serif" font-size="11" letter-spacing="2">NEXT CHAPTER</text>
 <text x="173" y="181" transform="rotate(-7 173 181)" fill="#302a40" font-family="Arial,sans-serif" font-weight="bold" font-size="36">Your future.</text>
 <text x="179" y="222" transform="rotate(-7 179 222)" fill="#302a40" font-family="Arial,sans-serif" font-weight="bold" font-size="36">Your story.</text>
 <path d="m184 247 139-18m-137 30 92-12" stroke="#cbc4dd" stroke-width="5" stroke-linecap="round"/>
 <g transform="rotate(7 99 238)"><rect x="52" y="202" width="117" height="77" rx="12" fill="#dff18c" stroke="#302a40" stroke-width="2"/><path d="m71 237 10 10 21-24" stroke="#302a40" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><text x="111" y="241" fill="#302a40" font-size="14" font-family="Arial,sans-serif" font-weight="bold">You got</text><text x="111" y="258" fill="#302a40" font-size="14" font-family="Arial,sans-serif" font-weight="bold">this.</text></g>
 <g transform="rotate(12 400 230)"><circle cx="403" cy="229" r="43" fill="#f0ac92" stroke="#302a40" stroke-width="2"/><path d="m401 202 6 20 20 7-20 6-6 20-7-20-19-6 19-7z" fill="#fff9ed" stroke="#302a40" stroke-width="1.5"/></g>
 <path d="m331 33 3 10 10 3-10 3-3 10-3-10-10-3 10-3z" fill="#7662b5"/>
 <path d="M97 315c20-18 46-17 62-5m-11-13 14 14-19 4" stroke="#7662b5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
 <text x="353" y="334" fill="#7662b5" font-size="12" font-family="Arial,sans-serif" transform="rotate(-6 353 334)">one page at a time</text>
 </svg>`; }
function unitArt(id) {
  if (id === 1) return `<svg viewBox="0 0 200 130" fill="none" aria-hidden="true"><circle cx="120" cy="66" r="44" fill="#d7cfef" stroke="#4b3a75" stroke-width="1.5"/><ellipse cx="120" cy="66" rx="21" ry="44" stroke="#4b3a75" stroke-width="1.5"/><path d="M78 53h84M78 79h84m-2-41L81 94" stroke="#4b3a75" stroke-width="1.2"/><rect x="26" y="39" width="76" height="58" rx="7" transform="rotate(-10 26 39)" fill="#fbf8ec" stroke="#4b3a75" stroke-width="1.5"/><path d="m34 51 70-13" stroke="#4b3a75" stroke-width="1.5"/><path d="m50 70 11-12 11 8 14-19m-8 2 8-2-1 8" stroke="#7154d8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="m168 20 3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#7154d8"/><circle cx="46" cy="115" r="5" fill="#b5c668"/></svg>`;
  return `<svg viewBox="0 0 200 130" fill="none" aria-hidden="true"><path d="M78 87V51a37 37 0 0 1 74 0v36" stroke="#285b53" stroke-width="9"/><path d="M78 87V51a37 37 0 0 1 74 0v36" stroke="#fbf7e8" stroke-width="5"/><rect x="66" y="59" width="24" height="43" rx="10" fill="#fbf7e8" stroke="#285b53" stroke-width="1.8"/><rect x="141" y="59" width="24" height="43" rx="10" fill="#fbf7e8" stroke="#285b53" stroke-width="1.8"/><path d="M85 108c-14-15-36-14-45-2-8 11 5 22 16 19 10-3 6-17 20-14" fill="#e9ad87" stroke="#285b53" stroke-width="1.8"/><circle cx="47" cy="110" r="3" fill="#e4f0ce"/><path d="m32 76 22-43 5 2-20 45z" fill="#fbf7e8" stroke="#285b53" stroke-width="1.4"/><path d="m33 76 3 10 4-6" fill="#285b53"/><path d="m175 20 3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#e19571"/><path d="M115 75v20c-20-6-21 13-7 12 9 0 12-7 12-13V68l18-4v20c-17-6-22 11-9 12 10 1 14-5 14-12V57z" fill="#609c84"/></svg>`;
}
function pageCount() { return units.reduce((n,u) => n + u.pages.length, 0); }
function home() {
  currentUnit = currentPage = null;
  document.title = 'English 11 · Answer Studio';
  const activityCount = units.reduce((n,u) => n + u.pages.reduce((n,p) => n + p.activities.length,0),0);
  main.innerHTML = `<section class="welcome-row"><div><span class="eyebrow">A LITTLE SUPPORT FOR YOUR NEXT BIG STEP</span><h1>Your English, <span class="serif-word">unlocked.</span> ${star}</h1><p>Clear answers. Fresh ideas. A space to grow.</p></div><span class="edition-tag">MEB · GRADE 11</span></section>
    <section class="hero"><div class="hero-copy"><span class="pill"><span class="status-dot"></span> YOUR ANSWER COLLECTION</span><h2>Big ideas.<br><span>Clear answers.</span></h2><p>Explore your book, one page at a time.<br>Check the key. Make the sample answers your own.</p><a class="button dark" href="${routeFor(1,10)}">Explore Unit 1 <span aria-hidden="true">↗</span></a><div class="hero-footnote"><span class="tiny-stars">✦ ✧</span> A growing collection, made for your classroom.</div></div>${careerArt()}</section>
    <section class="stats-row" aria-label="Collection at a glance"><div><span class="stat-icon lavender">▤</span><strong>${units.length}<small>units ready to explore</small></strong></div><div><span class="stat-icon mint">⌗</span><strong>${pageCount()}<small>Student’s Book pages</small></strong></div><div><span class="stat-icon peach">✧</span><strong>${activityCount}<small>activities & model responses</small></strong></div><div><span class="stat-icon lime">✓</span><strong><span id="reviewed-total">${state.reviewed.length}</span><small>pages you’ve reviewed</small></strong></div></section>
    <section class="collection"><div class="section-heading"><div><span class="eyebrow">CHOOSE YOUR NEXT CHAPTER</span><h2>Inside the collection</h2></div><span class="available-tag"><span class="status-dot"></span>${units.length} units available</span></div><div class="unit-grid">${units.map(unitCard).join('')}</div></section>
    <section class="future-strip"><div class="future-symbol">＋</div><div><h3>More chapters. More possibilities.</h3><p>Future unit answers will join this collection right here.</p></div><span class="coming-pill">TO BE CONTINUED ${star}</span></section>
    <section class="usage-strip"><span class="usage-icon">☝</span><div><strong>A sample is a starting point.</strong><p>Open-ended activities include brief examples. Add your own ideas, experiences and voice.</p></div><button class="text-button" id="home-help">How to use the key ${arrow}</button></section>`;
  $('#home-help').addEventListener('click', () => $('#help-dialog').showModal());
}
function unitCard(u) {
  const reviewed = u.pages.filter(p => state.reviewed.includes(pageKey(u.id,p.number))).length;
  return `<a href="${routeFor(u.id,u.pages[0].number)}" class="unit-card ${esc(u.color)}"><div class="unit-card-art"><span class="unit-sticker">UNIT <b>${String(u.id).padStart(2,'0')}</b></span>${unitArt(u.id)}<span class="page-range">pp. ${esc(u.range)}</span></div><div class="unit-card-body"><div class="unit-title-row"><h3>${esc(u.title)}</h3><span class="circle-arrow">↗</span></div><p>${esc(u.description)}</p><div class="skill-tags">${u.skills.map(s=>`<span>${esc(s)}</span>`).join('')}</div><div class="unit-card-footer"><span>${u.pages.length} pages · ${u.pages.reduce((n,p)=>n+p.activities.length,0)} activities</span><span>${reviewed ? `${reviewed} reviewed` : 'Start exploring'} <b>→</b></span></div></div></a>`;
}
function renderActivity(a, index, print = false) {
  const kindLabel = {key:'Answer key', sample:'Sample answer', practice:'Practice guide'}[a.kind];
  const body = `<div class="answer-body ${a.kind === 'sample' ? 'sample-body' : ''}">${a.kind === 'sample' ? '<p class="sample-caption">ONE POSSIBLE RESPONSE · MAKE IT YOUR OWN</p>' : ''}<ol class="answer-list ${a.kind === 'key' ? 'key-list' : 'prose-list'}">${a.answers.map(text=>`<li>${esc(text)}</li>`).join('')}</ol>${a.note ? `<p class="answer-note"><span aria-hidden="true">↳</span> ${esc(a.note)}</p>` : ''}</div>`;
  if (print) return `<article class="print-activity"><h3>${esc(a.label)}. ${esc(a.title)} <small>${kindLabel}</small></h3>${body}</article>`;
  return `<details class="activity ${esc(a.kind)}" open id="activity-${index}" data-kind="${esc(a.kind)}"><summary><span class="activity-number">${esc(a.label)}</span><div class="activity-title"><h3>${esc(a.title)}</h3><span class="kind-tag ${esc(a.kind)}">${kindLabel}</span></div><span class="details-toggle" aria-hidden="true">＋</span></summary>${body}</details>`;
}
function reader(unit, page, activityIndex) {
  currentUnit = unit; currentPage = page;
  const key = pageKey(unit.id,page.number), reviewed = state.reviewed.includes(key), saved = state.saved.includes(key);
  const index = unit.pages.indexOf(page), reviewedCount = unit.pages.filter(p=>state.reviewed.includes(pageKey(unit.id,p.number))).length;
  document.title = `Unit ${unit.id} · Page ${page.number} · Answer Studio`;
  main.innerHTML = `<div class="reader-top"><a class="back-link" href="#/">← Back to collection</a><button class="button subtle small" id="print-unit"><span aria-hidden="true">▣</span> Print unit</button></div>
    <section class="unit-banner ${esc(unit.color)}"><div><span class="eyebrow">UNIT ${String(unit.id).padStart(2,'0')} · STUDENT’S BOOK PP. ${esc(unit.range)}</span><h1>${esc(unit.title)}<span class="banner-star">✦</span></h1><p>${esc(unit.subtitle)}</p><div class="banner-tags">${unit.skills.map(s=>`<span>${esc(s)}</span>`).join('')}</div></div><div class="banner-art">${unitArt(unit.id)}</div></section>
    <div class="reader-layout"><div class="reader-content"><section class="page-picker" aria-label="Choose a Student’s Book page"><div class="picker-label"><strong>Pick your page</strong><span>Student’s Book</span></div><div class="page-chips">${unit.pages.map(p=>`<a class="page-chip ${p.number===page.number?'active':''} ${state.reviewed.includes(pageKey(unit.id,p.number))?'reviewed':''}" href="${routeFor(unit.id,p.number)}" ${p.number===page.number?'aria-current="page"':''} aria-label="Page ${p.number}${state.reviewed.includes(pageKey(unit.id,p.number))?', reviewed':''}">${p.number}</a>`).join('')}</div></section>
    <div class="page-heading"><div><span class="eyebrow">${esc(page.section)}</span><h2><span class="page-badge">${page.number}</span>${esc(page.title)}</h2></div><button class="icon-button save-button ${saved?'selected':''}" id="save-page" aria-label="${saved?'Unsave':'Save'} page ${page.number}" aria-pressed="${saved}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4z"/></svg></button></div>
    <div class="answer-toolbar"><div class="filter-tabs" role="group" aria-label="Answer type filter">${[['all','All'],['key','Answer keys'],['sample','Samples'],['practice','Practice']].map(([v,t])=>`<button data-filter="${v}" class="${filter===v?'active':''}" aria-pressed="${filter===v}">${t}</button>`).join('')}</div><div class="reveal-actions"><button id="show-all">Show all</button><span>·</span><button id="hide-all">Hide all</button></div></div>
    <div id="activities">${page.activities.map((a,i)=>renderActivity(a,i)).join('')}</div><div id="filter-empty" class="empty-filter" hidden>No activities of this type on this page. Try another filter.</div>
    <div class="page-complete"><div><span class="complete-icon">${reviewed?'✓':'✧'}</span><div><strong>${reviewed?'One more page in your pocket.':'A little progress goes a long way.'}</strong><p>${reviewed?'You’ve marked this page as reviewed.':'Finished checking? Mark this page as reviewed.'}</p></div></div><button class="button ${reviewed?'reviewed-button':'dark'} small" id="review-page" aria-pressed="${reviewed}">${reviewed?'✓ Reviewed':'Mark reviewed'}</button></div>
    <nav class="page-next-prev" aria-label="Previous and next pages">${index>0?`<a href="${routeFor(unit.id,unit.pages[index-1].number)}"><span>← Previous page</span><strong>${unit.pages[index-1].number} · ${esc(unit.pages[index-1].title)}</strong></a>`:'<div></div>'}${index<unit.pages.length-1?`<a class="next-page" href="${routeFor(unit.id,unit.pages[index+1].number)}"><span>Next page →</span><strong>${unit.pages[index+1].number} · ${esc(unit.pages[index+1].title)}</strong></a>`:`<a class="next-page" href="#/"><span>All done here →</span><strong>Back to the collection</strong></a>`}</nav></div>
    <aside class="reader-aside"><div class="guide-card"><span class="eyebrow">YOUR PAGE COMPANION</span><h3>Try. Check.<br>Make it yours.</h3><div class="legend"><span class="legend-dot key"></span><div><strong>Answer key</strong><p>Fixed answers from the guide.</p></div></div><div class="legend"><span class="legend-dot sample"></span><div><strong>Sample answer</strong><p>One possible response.<br>Your own ideas belong here.</p></div></div><div class="legend"><span class="legend-dot practice"></span><div><strong>Practice guide</strong><p>A useful next step for action and speaking tasks.</p></div></div></div><div class="progress-card"><span>YOUR UNIT PROGRESS</span><div><strong>${reviewedCount}<small> / ${unit.pages.length}</small></strong><span>pages reviewed</span></div><progress max="${unit.pages.length}" value="${reviewedCount}" aria-label="${reviewedCount} of ${unit.pages.length} pages reviewed"></progress><p>At your pace. One page at a time.</p></div><p class="reader-source">Page numbers follow the Student’s Book. Answers are based on the supplied Teacher’s Guide. <button class="text-button" id="reader-help">About this key ↗</button></p></aside></div>`;
  $('#save-page').addEventListener('click',()=>{const n=state.saved.indexOf(key); n<0?state.saved.push(key):state.saved.splice(n,1);persist();reader(unit,page);toast(n<0?'Page saved. Find it in Saved pages.':'Page removed from saved pages.');});
  $('#review-page').addEventListener('click',()=>{const n=state.reviewed.indexOf(key);n<0?state.reviewed.push(key):state.reviewed.splice(n,1);persist();reader(unit,page);toast(n<0?'Nice work. Page marked reviewed.':'Page marked as still in progress.');});
  $('#print-unit').addEventListener('click',()=>printUnit(unit));
  $('#reader-help').addEventListener('click',()=>$('#help-dialog').showModal());
  $('#show-all').addEventListener('click',()=>$$('.activity:not([hidden])').forEach(d=>d.open=true));
  $('#hide-all').addEventListener('click',()=>$$('.activity:not([hidden])').forEach(d=>d.open=false));
  $$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;applyFilter();}));
  applyFilter();
  if(activityIndex!==undefined) { const target = $(`#activity-${activityIndex}`);if(target){filter='all';applyFilter();target.open=true;requestAnimationFrame(()=>{target.scrollIntoView({block:'center',behavior:'smooth'});target.classList.add('highlighted');});} }
}
function applyFilter() {
  $$('[data-filter]').forEach(b=>{const active=b.dataset.filter===filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  $$('.activity').forEach(d=>d.hidden=filter!=='all'&&d.dataset.kind!==filter);
  const empty=$('#filter-empty');if(empty)empty.hidden=$$('.activity:not([hidden])').length>0;
}
function savedPages() {
  currentUnit=currentPage=null; document.title='Saved pages · Answer Studio';
  const saved=units.flatMap(u=>u.pages.filter(p=>state.saved.includes(pageKey(u.id,p.number))).map(p=>({u,p})));
  main.innerHTML=`<section class="saved-header"><span class="eyebrow">YOUR PERSONAL SHORTLIST</span><h1>A few pages <span class="serif-word">worth keeping.</span></h1><p>Your saved pages live here, ready for a second look.</p></section>${saved.length?`<div class="saved-grid">${saved.map(({u,p})=>`<a class="saved-card ${esc(u.color)}" href="${routeFor(u.id,p.number)}"><span class="eyebrow">UNIT ${String(u.id).padStart(2,'0')} · ${esc(u.title)}</span><span class="saved-number">${p.number}<span>↗</span></span><h2>${esc(p.title)}</h2><p>${esc(p.section)}</p><span class="saved-status">${state.reviewed.includes(pageKey(u.id,p.number))?'✓ Reviewed':'Ready when you are'}</span></a>`).join('')}</div>`:`<section class="empty-state"><span>♧</span><h2>A fresh page, for now.</h2><p>Use the bookmark on any answer page to save it here.</p><a href="#/" class="button dark">Explore the collection ↗</a></section>`}`;
}
function navigate() {
  filter='all';
  const parts=location.hash.slice(1).split('/').filter(Boolean);
  let view='home';
  if(parts[0]==='saved'){savedPages();view='saved';}
  else if(parts[0]==='unit'){
    const unit=units.find(u=>u.id===Number(parts[1]));
    const page=unit?.pages.find(p=>p.number===Number(parts[3]))||unit?.pages[0];
    if(unit&&page){reader(unit,page,parts[4]==='activity'?Number(parts[5]):undefined);view=`unit-${unit.id}`;}
    else {home();toast('That unit isn’t available yet. Explore the collection below.');}
  } else home();
  $$('[data-nav]').forEach(a=>{const active=a.dataset.nav===view;a.classList.toggle('active',active);active?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current');});
  closeMenu(); if(parts[4]!=='activity')window.scrollTo({top:0,behavior:'instant'});
}
function printUnit(unit) {
  $('#print-root').innerHTML=`<header class="print-heading"><p>ENGLISH 11 · ANSWER STUDIO · SINAN SEDEN</p><h1>Unit ${unit.id}: ${esc(unit.title)}</h1><p>MEB Student’s Book · pages ${esc(unit.range)}</p><p>Fixed answers follow the supplied teacher’s guide. “Sample answer” indicates one possible response; other relevant, correct answers are valid.</p></header>${unit.pages.map(p=>`<section class="print-page"><div class="print-page-head"><span>STUDENT’S BOOK · PAGE ${p.number}</span><h2>${esc(p.title)}</h2><p>${esc(p.section)}</p></div>${p.activities.map((a,i)=>renderActivity(a,i,true)).join('')}</section>`).join('')}`;
  window.print();
}
function search() {
  const raw=$('#search-input').value.trim(),q=raw.toLocaleLowerCase('en');
  const results=$('#search-results');
  if(!q){results.innerHTML='<div class="search-empty"><span>✧</span><p>Every good answer starts with a little curiosity.</p><small>Search a topic, a word or a page number.</small></div>';return;}
  const pageMatch=q.match(/^(?:page\s*|p\.?\s*)?(\d+)$/), n=pageMatch?Number(pageMatch[1]):null;
  const hits=[];
  for(const u of units)for(const p of u.pages)for(const [index,a] of p.activities.entries()){
    const text=[u.title,p.title,p.section,a.label,a.title,...a.answers,a.note||''].join(' ');
    if((n!==null&&p.number===n)||(n===null&&text.toLocaleLowerCase('en').includes(q)))hits.push({u,p,a,index});
  }
  results.innerHTML=`<p class="search-count">${hits.length} ${hits.length===1?'activity':'activities'} found${hits.length>60?' · Showing the first 60':''}</p>${hits.length?hits.slice(0,60).map(({u,p,a,index})=>`<a class="search-result" href="${routeFor(u.id,p.number,index)}"><span class="search-page ${esc(u.color)}">${p.number}</span><div><small>UNIT ${u.id} · ${esc(u.title)} · ACTIVITY ${esc(a.label)}</small><strong>${esc(a.title)}</strong><p>${esc(a.answers.join(' · ').slice(0,160))}${a.answers.join(' · ').length>160?'…':''}</p></div><span>↗</span></a>`).join(''):'<div class="search-empty"><span>⌕</span><p>No matches yet.</p><small>Try a shorter word or a different topic.</small></div>'}`;
  $$('.search-result',results).forEach(a=>a.addEventListener('click',()=>{const hash=a.getAttribute('href');$('#search-dialog').close();if(location.hash===hash)navigate();}));
}
function closeMenu(){$('#sidebar').classList.remove('mobile-open');$('#mobile-scrim').classList.remove('visible');$('#menu-toggle').setAttribute('aria-expanded','false');}
function showSearch() {$('#search-dialog').showModal();search();$('#search-input').focus();}
$('#menu-toggle').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('mobile-open');$('#mobile-scrim').classList.toggle('visible',open);$('#menu-toggle').setAttribute('aria-expanded',String(open));});
$('#mobile-scrim').addEventListener('click',closeMenu);
$('#search-trigger').addEventListener('click',showSearch);
$('#help-trigger').addEventListener('click',()=>$('#help-dialog').showModal());
$('#search-input').addEventListener('input',search);
$$('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)&&!$('dialog[open]')){e.preventDefault();showSearch();}if(e.key==='Escape')closeMenu();});
window.addEventListener('hashchange',navigate);
async function init(){
  try {
    const response=await fetch('data/manifest.json');if(!response.ok)throw new Error('manifest');manifest=await response.json();
    units=await Promise.all(manifest.units.filter(u=>u.status==='available').map(async m=>{const r=await fetch(`data/${m.file}`);if(!r.ok)throw new Error(m.file);return r.json();}));
    const valid=new Set(units.flatMap(u=>u.pages.map(p=>pageKey(u.id,p.number))));state.saved=state.saved.filter(k=>valid.has(k));state.reviewed=state.reviewed.filter(k=>valid.has(k));persist();
    $('#available-count').textContent=units.length;
    $('#unit-navigation').innerHTML=units.map(u=>`<a class="unit-nav" data-nav="unit-${u.id}" href="${routeFor(u.id,u.pages[0].number)}"><span class="nav-unit-number ${esc(u.color)}">${String(u.id).padStart(2,'0')}</span><span>${esc(u.title)}<small>Pages ${esc(u.range)}</small></span></a>`).join('');
    navigate();
  }catch(error){main.innerHTML='<section class="empty-state"><span>↻</span><h1>The collection couldn’t load.</h1><p>Please reload the page to try again.</p><button class="button dark" id="retry">Try again</button></section>';$('#retry').addEventListener('click',()=>location.reload());console.error('Answer collection load failed:',error);}
}
init();
