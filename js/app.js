const KEY = 'hubPrompts.v1';
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);

const EXEMPLOS = [
  {title:'Roteiro de Reels com gancho', cat:'Vídeo', tags:['reels','gancho','roteiro'],
   body:'Crie um roteiro de Reels de até 30 segundos sobre {{tema}} para o público {{publico}}.\n\nEstrutura:\n1. Gancho nos primeiros 2 segundos (pergunta ou afirmação polêmica)\n2. Desenvolvimento em 3 pontos rápidos\n3. CTA final: {{cta}}\n\nTom: descontraído e direto. Inclua sugestões de texto na tela.'},
  {title:'Ideias de thumbnail', cat:'Imagem', tags:['thumb','youtube'],
   body:'Me dê 5 ideias de thumbnail para um vídeo com o título "{{titulo}}".\nPara cada ideia: descrição da cena, expressão facial, texto curto (máx. 4 palavras) e paleta de cores.'},
  {title:'Legenda para post', cat:'Copy', tags:['instagram','legenda'],
   body:'Escreva 3 opções de legenda para um post sobre {{assunto}}.\nCada uma com: primeira linha que prende, 2-3 frases de valor, CTA e 5 hashtags relevantes.'}
];

let data = load();
let filtro = 'Todos';
let editId = null, viewId = null, varsId = null;

function load(){
  try{ const d = JSON.parse(localStorage.getItem(KEY)); if(Array.isArray(d)) return d; }catch(e){}
  const now = Date.now();
  return EXEMPLOS.map((p,i) => ({...p, id:uid(), fav:false, uses:0, created:now-i, updated:now-i}));
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(data)); }catch(e){ console.warn('Armazenamento indisponível — use Exportar backup.'); } }
function vars(body){ return [...new Set([...body.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)].map(m=>m[1]))]; }
function toast(msg='Copiado!'){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('show'),1600); }

function renderCats(){
  const cats = {};
  data.forEach(p => { const c = p.cat || 'Sem categoria'; cats[c] = (cats[c]||0)+1; });
  const favs = data.filter(p=>p.fav).length;
  const items = [['Todos', data.length, '📚'], ['Favoritos', favs, '⭐']];
  let html = items.map(([n,c,i]) => `<button class="cat ${filtro===n?'on':''}" data-cat="${esc(n)}"><span>${i} ${n}</span><small>${c}</small></button>`).join('');
  html += '<div class="sep"></div>';
  html += Object.keys(cats).sort((a,b)=>a.localeCompare(b,'pt')).map(n => `<button class="cat ${filtro===n?'on':''}" data-cat="${esc(n)}"><span>📁 ${esc(n)}</span><small>${cats[n]}</small></button>`).join('');
  $('#cats').innerHTML = html;
  $('#catList').innerHTML = Object.keys(cats).filter(c=>c!=='Sem categoria').map(c=>`<option value="${esc(c)}">`).join('');
}

function renderGrid(){
  const q = $('#q').value.trim().toLowerCase();
  let list = data.filter(p => {
    if(filtro==='Favoritos' && !p.fav) return false;
    if(filtro!=='Todos' && filtro!=='Favoritos' && (p.cat||'Sem categoria')!==filtro) return false;
    if(!q) return true;
    return (p.title+' '+p.body+' '+(p.cat||'')+' '+p.tags.join(' ')).toLowerCase().includes(q);
  });
  const s = $('#sort').value;
  list.sort((a,b) => (b.fav-a.fav) || (s==='az' ? a.title.localeCompare(b.title,'pt') : s==='used' ? b.uses-a.uses : b.updated-a.updated));
  if(!list.length){
    $('#grid').innerHTML = `<div class="empty" style="grid-column:1/-1"><b>🗂️</b>${data.length ? 'Nenhum prompt encontrado.' : 'Nenhum prompt ainda. Clique em <b style="display:inline;font-size:inherit">+ Novo prompt</b>.'}</div>`;
    return;
  }
  $('#grid').innerHTML = list.map(p => {
    const v = vars(p.body);
    return `<div class="card" data-id="${p.id}">
      <div class="card-h"><h3>${esc(p.title||'Sem título')}</h3><button class="star ${p.fav?'on':''}" data-act="fav" title="Favoritar">★</button></div>
      <div class="body ${p.body.length>220||p.body.split('\n').length>6?'long':''}" data-act="view" style="cursor:pointer">${esc(p.body)}</div>
      <div class="tags">
        ${p.cat?`<span class="tag c">${esc(p.cat)}</span>`:''}
        ${p.tags.map(t=>`<span class="tag">#${esc(t)}</span>`).join('')}
        ${v.length?`<span class="tag v">${v.length} variáve${v.length>1?'is':'l'}</span>`:''}
      </div>
      <div class="meta">Usado ${p.uses}x · editado em ${new Date(p.updated).toLocaleDateString('pt-BR')}</div>
      <div class="actions">
        <button class="copy" data-act="copy">📋 Copiar</button>
        <button data-act="view">Ver</button>
        <button data-act="edit">Editar</button>
        <button data-act="dup" title="Duplicar">⧉</button>
      </div>
    </div>`;
  }).join('');
}
function render(){ renderCats(); renderGrid(); }

function openOv(id){ $(id).classList.add('show'); }
function closeAll(){ document.querySelectorAll('.ov').forEach(o=>o.classList.remove('show')); }

function openEdit(id){
  editId = id;
  const p = data.find(x=>x.id===id) || {title:'',cat:filtro!=='Todos'&&filtro!=='Favoritos'?filtro:'',tags:[],body:''};
  $('#editTitle').textContent = id ? 'Editar prompt' : 'Novo prompt';
  $('#fTitle').value = p.title; $('#fCat').value = p.cat||''; $('#fTags').value = p.tags.join(', '); $('#fBody').value = p.body;
  $('#btnDel').style.visibility = id ? 'visible' : 'hidden';
  closeAll(); openOv('#ovEdit'); setTimeout(()=>$('#fTitle').focus(),30);
}
function saveEdit(){
  const body = $('#fBody').value;
  if(!body.trim()){ $('#fBody').focus(); toast('Escreva o prompt antes de salvar'); return; }
  const fields = {
    title: $('#fTitle').value.trim() || body.trim().split('\n')[0].slice(0,60),
    cat: $('#fCat').value.trim(),
    tags: $('#fTags').value.split(',').map(t=>t.trim().replace(/^#/,'')).filter(Boolean),
    body, updated: Date.now()
  };
  if(editId) Object.assign(data.find(x=>x.id===editId), fields);
  else data.unshift({id:uid(), fav:false, uses:0, created:Date.now(), ...fields});
  save(); closeAll(); render(); toast('Salvo!');
}

function openView(id){
  viewId = id; const p = data.find(x=>x.id===id);
  $('#viewTitle').textContent = p.title;
  $('#viewTags').innerHTML = (p.cat?`<span class="tag c">${esc(p.cat)}</span>`:'') + p.tags.map(t=>`<span class="tag">#${esc(t)}</span>`).join('');
  $('#viewBody').textContent = p.body;
  $('#viewMeta').textContent = `Criado em ${new Date(p.created).toLocaleDateString('pt-BR')} · usado ${p.uses}x`;
  closeAll(); openOv('#ovView');
}

async function copyText(text, id){
  try{ await navigator.clipboard.writeText(text); }
  catch(e){ const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
  const p = data.find(x=>x.id===id); if(p){ p.uses++; save(); renderGrid(); }
  toast('Copiado!');
}
function startCopy(id){
  const p = data.find(x=>x.id===id); const v = vars(p.body);
  if(!v.length){ copyText(p.body, id); closeAll(); return; }
  varsId = id;
  $('#varsTitle').textContent = 'Preencher: ' + p.title;
  $('#varsFields').innerHTML = v.map((n,i)=>`<label>${esc(n)}</label><input data-var="${esc(n)}" ${i===0?'autofocus':''}>`).join('');
  updatePreview(); closeAll(); openOv('#ovVars');
  setTimeout(()=>$('#varsFields input')?.focus(),30);
}
function filled(){
  const p = data.find(x=>x.id===varsId); const vals = {};
  document.querySelectorAll('#varsFields input').forEach(i=>vals[i.dataset.var]=i.value);
  return p.body.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (m,n)=> vals[n] ? vals[n] : m);
}
function updatePreview(){ $('#varsPreview').textContent = filled(); }

// eventos
$('#cats').addEventListener('click', e => { const b=e.target.closest('.cat'); if(b){ filtro=b.dataset.cat; render(); } });
$('#grid').addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if(!a) return;
  const id = e.target.closest('.card').dataset.id; const p = data.find(x=>x.id===id);
  ({
    fav(){ p.fav=!p.fav; save(); render(); },
    copy(){ startCopy(id); },
    view(){ openView(id); },
    edit(){ openEdit(id); },
    dup(){ data.unshift({...p, tags:[...p.tags], id:uid(), title:p.title+' (cópia)', fav:false, uses:0, created:Date.now(), updated:Date.now()}); save(); render(); toast('Duplicado!'); }
  })[a.dataset.act]();
});
$('#btnNew').onclick = () => openEdit(null);
$('#btnSave').onclick = saveEdit;
$('#btnDel').onclick = () => { if(confirm('Excluir este prompt? Não dá para desfazer.')){ data=data.filter(x=>x.id!==editId); save(); closeAll(); render(); toast('Excluído'); } };
$('#btnViewCopy').onclick = () => startCopy(viewId);
$('#btnViewEdit').onclick = () => openEdit(viewId);
$('#btnVarsCopy').onclick = () => { copyText(filled(), varsId); closeAll(); };
$('#varsFields').addEventListener('input', updatePreview);
$('#q').addEventListener('input', renderGrid);
$('#sort').addEventListener('change', renderGrid);
document.querySelectorAll('.ov').forEach(o => o.addEventListener('mousedown', e => { if(e.target===o || e.target.closest('[data-close]')) closeAll(); }));
document.addEventListener('keydown', e => {
  if(e.key==='Escape') closeAll();
  if(e.key==='/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)){ e.preventDefault(); $('#q').focus(); }
  if((e.ctrlKey||e.metaKey) && e.key==='Enter' && $('#ovEdit').classList.contains('show')) saveEdit();
});

$('#btnExport').onclick = () => {
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `prompts-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(a.href);
};
$('#btnImport').onclick = () => $('#fileImport').click();
$('#fileImport').onchange = async e => {
  const f = e.target.files[0]; if(!f) return;
  try{
    const arr = JSON.parse(await f.text()); if(!Array.isArray(arr)) throw 0;
    const ids = new Set(data.map(p=>p.id)); let n=0;
    arr.forEach(p => { if(p && p.body && !ids.has(p.id)){ data.push({id:p.id||uid(), title:p.title||'', cat:p.cat||'', tags:Array.isArray(p.tags)?p.tags:[], body:p.body, fav:!!p.fav, uses:p.uses||0, created:p.created||Date.now(), updated:p.updated||Date.now()}); n++; } });
    save(); render(); toast(`${n} prompt(s) importado(s)`);
  }catch(err){ toast('Arquivo inválido'); }
  e.target.value='';
};

$('#btnLogout').onclick = () => Auth.logout();

save(); render();
