/* common.js - load data.json and render a notification page by slug.
   Usage: page.html?category=admit&slug=upsssc-pet-admit-2025
*/

async function loadDataJSON(path='data.json'){
  try{
    const r = await fetch(path,{cache:'no-cache'});
    if(!r.ok) throw new Error('Failed to load data.json');
    return await r.json();
  }catch(e){ 
    console.error(e);
    return null;
  }
}

/* safe simple renderer for a few allowed tags (very small sanitizer) */
function safeHTML(s){
  if(!s) return '';
  // allow simple tags: p, br, strong, em, ul, ol, li, a
  // remove scripts
  return String(s)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi,'')
    .replace(/on\w+=["'][^"']*["']/gi,'');
}

/* render notification object into DOM: expects structure below */
function renderNotification(obj){
  if(!obj) {
    document.getElementById('main').innerHTML = '<div class="card"><h2>Not found</h2><p>Requested page not available.</p></div>';
    return;
  }

  // header
  document.getElementById('title').textContent = obj.title || '';
  document.getElementById('metaDate').textContent = (obj.postDate || '') + (obj.time? ' | '+obj.time : '');

  // summary / intro
  document.getElementById('intro').innerHTML = safeHTML(obj.excerpt || '');

  // important dates table
  const dt = obj.importantDates || {};
  const table = document.getElementById('datesTable');
  if(table){
    let html = '';
    for(const k of Object.keys(dt)){
      html += `<tr><th>${k}</th><td>${dt[k]}</td></tr>`;
    }
    table.innerHTML = html;
  }
 const at = obj.ageLimit || {};
  const atable = document.getElementById('ageTable');
  if(atable){
    let html = '';
    for(const k of Object.keys(at)){
      html += `<tr><th>${k}</th><td>${at[k]}</td></tr>`;
    }
    atable.innerHTML = html;
  }
  // fee table
  const feeTable = document.getElementById('feeTable');
  if(feeTable){
    const fee = obj.fees || {};
    let html='';
    for(const k of Object.keys(fee)){
      html += `<tr><th>${k}</th><td>${fee[k]}</td></tr>`;
    }
    feeTable.innerHTML = html;
  }

  // long content
  const content = document.getElementById('content');
  content.innerHTML = safeHTML(obj.content || '');

  // links
  const linksDiv = document.getElementById('links');
  linksDiv.innerHTML = '';
  (obj.links||[]).forEach(l=>{
    const a = document.createElement('a');
    a.href = l.link || '#';
    a.className = 'btn';
    a.textContent = l.title || 'Link';
    a.target = '_blank';
    linksDiv.appendChild(a);
  });

  // sidebar quick links
  const sideList = document.getElementById('sideList');
  sideList.innerHTML = '';
  (obj.quickLinks||[]).forEach(l=>{
    const li = document.createElement('li');
    li.innerHTML = `<a href="${l.link}" target="_blank">${l.title}</a>`;
    sideList.appendChild(li);
  });
}

/* helper: get URL param */
function param(name){
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

/* main bootstrap: loads data.json, finds obj by slug in given category */
async function bootstrapNotification(dataPath='data.json'){
  const category = param('category') || 'admit'; // default
  const slug = param('slug');
  const data = await loadDataJSON(dataPath);
  if(!data){ document.getElementById('main').innerHTML = '<div class="card"><h2>Error loading data</h2></div>'; return; }

  const list = data[category] || [];
  let obj = null;
  if(slug){
    obj = list.find(x => x.slug === slug);
  } else {
    // if no slug, pick first item
    obj = list[0] || null;
  }
  renderNotification(obj);

  // render small "more items" in sidebar (other items)
  const other = (list||[]).slice(0,8);
  const otherUl = document.getElementById('otherList');
  otherUl.innerHTML = other.map(it => `<li><a href="?category=${category}&slug=${it.slug}">${it.title}</a></li>`).join('');
}

/* expose functions */
window.bootstrapNotification = bootstrapNotification;
