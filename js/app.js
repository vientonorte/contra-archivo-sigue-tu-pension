'use strict';
/* Prototipo v1 Contra-Archivo. Todas las cifras salen de data/datos.json + data/fuentes.json. */
const S={afp:'nose',fondo:'nose',nivel:'historia',rol:'',corte:'2026-06',paso:0};
let D,F,notas=[];
const PASOS=[['p0','¿En qué AFP estás?'],['p1','Tu dinero viaja'],['p2','Quién está al otro lado'],['p3','Quién es dueño de quién'],['p4','Cronología'],['p5','Lo que no sabemos'],['p6','Qué puedes hacer'],['p7','Pide información y sigue las causas'],['p8','Alertas, contador y datos'],['p9','Método']];
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fdate=s=>{if(!s)return 'NO DATO';const p=s.split('-');return p.length===3?`${p[2]}-${p[1]}-${p[0]}`:(p.length===2?`${p[1]}-${p[0]}`:s)};
function num(r){return r&&!r.nd&&F[r.id]&&F[r.id].cifra!==''?parseFloat(F[r.id].cifra):null}
function fmt(id){const f=F[id];const v=parseFloat(f.cifra);const dec=(f.cifra.split('.')[1]||'').length;return v.toLocaleString('es-CL',{minimumFractionDigits:dec,maximumFractionDigits:dec})}
function gcls(g){return g==='[D]'?'g-D':g==='[D-sec.]'?'g-Dsec':(g||'').startsWith('[I')?'g-I':'g-ND'}
/* Cifra con nota al pie: el número abre el panel de fuente */
function C(r,o={}){
  if(!r||r.nd||!F[r.id]||!['ok','corregir'].includes(F[r.id].estado)||F[r.id].cifra===''){
    const n=notas.push({id:r&&r.id,nd:true});
    return `<span class="cifra g-ND ${o.big?'grande':''}">NO DATO<button class="nota" data-n="${n-1}" aria-label="Por qué no hay dato, nota ${n}">${n}</button></span>`;}
  const f=F[r.id];const n=notas.push({id:r.id});
  const u=o.u!==undefined?o.u:(f.unidad==='US$ MM'?' US$ MM':f.unidad.startsWith('%')?' %':'');
  return `<span class="cifra ${gcls(f.grado)} ${o.big?'grande':''}">${o.pre||''}${fmt(r.id)}${u}<button class="nota" data-n="${n-1}" aria-label="Fuente de la cifra, nota ${n}">${n}</button></span>`;
}
/* Hecho sin número (norma, causa, vínculo): marca ✓ con el borde de su grado y nota al pie */
function H(id){const f=F[id];if(!f||f.estado!=='ok')return C({id,nd:true});const n=notas.push({id});return `<span class="cifra ${gcls(f.grado)}" title="${esc(f.grado)}">✓<button class="nota" data-n="${n-1}" aria-label="Fuente del hecho, nota ${n}">${n}</button></span>`}
function lineaFuente(){
  const src=[...new Set(notas.filter(x=>!x.nd).map(x=>F[x.id].fuente.split(';')[0].split(',').slice(0,2).join(',')))];
  const nd=notas.filter(x=>x.nd).length;
  let h=`<p class="linea-fuente">Fuentes: ${src.length?esc(src.join(' · ')):'sin cifras en esta pantalla'}${nd?` · ${nd} sin dato público`:''}. Toca el número junto a cada cifra para ver fuente, fecha, enlace y grado.</p>`;
  if(notas.length) h+=`<div class="solo-fuentes"><h2>Notas de esta pantalla</h2><ol>${notas.map(x=>x.nd?`<li>NO DATO · ${esc(x.id||'')}${F[x.id]?' · '+esc(F[x.id].verificacion):''}</li>`:`<li>${esc(F[x.id].descripcion)} · ${esc(F[x.id].fuente)} · ${fdate(F[x.id].fecha)} · ${esc(F[x.id].grado)} · <a href="${esc(F[x.id].url)}" rel="noopener noreferrer" target="_blank">enlace ↗</a></li>`).join('')}</ol></div>`;
  return h;
}
function abrirNota(i){
  const x=notas[i];const f=x.id&&F[x.id];const dl=$('#pf-cuerpo');
  if(x.nd){$('#pf-titulo').textContent='NO DATO';dl.innerHTML=`<dt>Qué falta</dt><dd>${f?esc(f.descripcion):'Este dato no es público o no pasó la auditoría de fuentes.'}</dd><dt>Motivo</dt><dd>${f?esc(f.verificacion):'Sin fuente con URL, fecha y grado.'}</dd><dt>Grado</dt><dd>NO DATO: nunca se muestra como cero.</dd>`;}
  else{$('#pf-titulo').textContent='Fuente de la cifra';dl.innerHTML=`<dt>Cifra</dt><dd>${f.cifra!==""?fmt(x.id)+" "+esc(f.unidad):"hecho, sin cifra"}</dd><dt>Qué es</dt><dd>${esc(f.descripcion)}</dd><dt>Fecha</dt><dd>${fdate(f.fecha)}</dd><dt>Fuente</dt><dd>${esc(f.fuente)}</dd><dt>Enlace</dt><dd>${f.url?`<a href="${esc(f.url)}" target="_blank" rel="noopener noreferrer">${esc(f.url.replace(/^https?:\/\//,'').slice(0,60))}… ↗</a>`:'[por documentar]'}</dd><dt>Grado</dt><dd>${esc(f.grado)} ${f.grado==='[D]'?'· documento público':f.grado==='[D-sec.]'?'· vía prensa o agregador':'· cálculo o inferencia'}</dd><dt>Revisión</dt><dd>${esc(f.verificacion)}</dd><dt>ID</dt><dd><code>${esc(x.id)}</code></dd>`;}
  $('#panel-fuente').showModal();
}
const afpNombre=()=>S.afp==='nose'?'Todas las AFP':'AFP '+D.afps.find(a=>a.id===S.afp).nombre;
const chips=(name,items,cur)=>`<div class="chips" role="group" aria-label="${name}">${items.map(([v,t])=>`<button class="chip" data-set="${name}" data-v="${v}" aria-pressed="${cur===v}">${esc(t)}</button>`).join('')}</div>`;
const corteTxt=c=>c==='2026-05'?'29-05-2026':'30-06-2026';
/* ---------- pantallas ---------- */
const V={};
V.p0=()=>`<p class="lead">Elige tu AFP y tu fondo. Verás datos públicos <strong>del fondo de tu AFP</strong>, no de tu cuenta. No guardamos nada: la elección viaja solo en la dirección de la página.</p>
<h2>Tu AFP</h2>${chips('afp',[...D.afps.map(a=>[a.id,a.nombre]),['nose','No sé']],S.afp)}
<h2>Tu fondo</h2>${chips('fondo',[...'ABCDE'.split('').map(f=>[f.toLowerCase(),f]),['nose','No sé']],S.fondo)}
<p><a href="https://www.chileatiende.gob.cl" target="_blank" rel="noopener noreferrer">¿No sabes tu AFP? ChileAtiende ↗</a></p>
<div class="tarjeta"><div class="etq">Pérdida del sistema por swaps de tasas («operación cuestionada»), incurrida + cambio de valoración, al 05-11-2026</div>${C(D.sistema.total,{big:true})}</div>
<button class="btn-prim" data-ir="1">Ver mi recorrido →</button>`;
function fondoRef(){const a=S.afp==='nose'?'sistema':S.afp;const k=S.fondo==='nose'?'ext':S.fondo;return D.swaps[S.corte][a][k]}
function bancosAfp(sec){const a=S.afp==='nose'?'total':S.afp;return Object.entries(D.bancos_0630[sec]).map(([b,m])=>({b,r:m[a]})).filter(x=>x.r&&num(x.r)!==null&&num(x.r)!==0).sort((x,y)=>num(x.r)-num(y.r))}
const nombreBanco=b=>{if(b!==b.toUpperCase())return b;const t=b.replace(/ (CO INTERNATIONAL PLC|CORPORATE AND INVESTMENT BANK|BANK USA NA|BANK NA|BANK PLC|NA|SA|PLC|AG|USA|GROUP)$/,'');const low=['DE','DEL','E','OF','THE','AND'];return t.split(' ').map((w,i)=>i>0&&low.includes(w)?w.toLowerCase():w[0]+w.slice(1).toLowerCase()).join(' ').replace('Bci','BCI').replace('Btg','BTG').replace('Bnp','BNP').replace('Hsbc','HSBC').replace('Jpmorgan','JPMorgan').replace('Ubs','UBS')};
function sankey(list){
  const W=430,hL=260,tot=list.reduce((s,x)=>s+Math.abs(num(x.r)),0)||1;let y0=10,yR=10;let g='';
  list.forEach(x=>{const v=num(x.r),h=Math.max(1.5,Math.abs(v)/tot*hL);const col=v<0?'#111':'#9a9aa6';
    g+=`<path d="M70 ${y0} C190 ${y0},190 ${yR},250 ${yR} L250 ${yR+h} C190 ${yR+h},190 ${y0+h},70 ${y0+h}Z" fill="${col}" fill-opacity="${v<0?.55:.35}"/><rect x="250" y="${yR}" width="4" height="${h}" fill="${col}"/>`;
    g+=`<text x="260" y="${yR+Math.max(h,12)/2+4}" font-size="10.5" fill="#2a2a33">${esc(nombreBanco(x.b))}</text>`;y0+=h;yR+=Math.max(h,14)+4;});
  const H=Math.max(yR,y0)+10;
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Diagrama de flujo: del fondo a cada banco contraparte. El ancho de cada banda es proporcional al valor absoluto de la valorización. La tabla tiene las mismas cifras."><rect x="56" y="10" width="14" height="${y0-10}" fill="#ffd23f"/><text x="4" y="${(y0+10)/2}" font-size="11" fill="#111">Fondos</text>${g}</svg>
  <div class="leyenda"><span><i style="background:#111;opacity:.55"></i>en contra del fondo (a favor del banco)</span><span><i style="background:#9a9aa6;opacity:.35"></i>a favor del fondo</span></div>`;
}
function tablaBancos(list,cap){return `<table><caption>${esc(cap)}</caption><thead><tr><th scope="col">Contraparte</th><th scope="col" class="num">US$ MM</th></tr></thead><tbody>${list.map(x=>`<tr><th scope="row">${esc(nombreBanco(x.b))}</th><td class="num">${C(x.r,{u:''})}</td></tr>`).join('')}</tbody></table>`}
V.p1=()=>{const ext=bancosAfp('ext');
 return `<p class="lead">Del fondo salieron contratos swap de tasas con bancos. Negativo = en contra del fondo a esa fecha. Es <strong>valorización de mercado</strong>, no pérdida realizada.</p>
 ${chips('corte',[['2026-05','Corte 29-05-2026'],['2026-06','Corte 30-06-2026']],S.corte)}
 <div class="dos-col"><div>
 <div class="tarjeta"><div class="etq">${esc(afpNombre())} · ${S.fondo==='nose'?'todos los fondos':'fondo '+S.fondo.toUpperCase()} · swaps extranjeros de tasas · ${corteTxt(S.corte)}</div>${C(fondoRef(),{big:true})}</div>
 <div class="tarjeta"><div class="etq">Sistema · pérdida incurrida + valoración · 05-11-2026</div>${C(D.sistema.total)}</div>
 <div class="nd-bloque">Valorización por AFP y fondo después del 30-06-2026: NO DATO. La SP no ha entregado los archivos de julio a octubre (revisado 25-11-2026).</div>
 </div><div>
 <h2>Hacia qué bancos · ${esc(afpNombre())} · 30-06-2026</h2>${ext.length?sankey(ext):'<div class="nd-bloque">Sin posiciones informadas.</div>'}
 <details class="solo-datos" open><summary>Ver como tabla</summary>${tablaBancos(ext,'Swaps extranjeros de tasas por contraparte, 30-06-2026')}</details>
 <details><summary>Ver como tabla (resumen)</summary>${tablaBancos(ext.slice(0,5),'Las 5 posiciones más en contra')}</details>
 </div></div>`};
V.p2=()=>{const nac=bancosAfp('nac');const s30=D.bancos_0930;
 return `<p class="lead">Al otro lado de cada swap hay un banco. «A favor del banco» no es lo mismo que «ganancia del banco»: suele cubrirse con otra operación [I].</p>
 <h2>Bancos nacionales · ${esc(afpNombre())} · 30-06-2026</h2>${tablaBancos(nac,'Swaps nacionales de tasas por contraparte, 30-06-2026')}
 <div class="solo-datos"><h2>Sistema por banco · 30-09-2026</h2><p>Sin desglose por AFP. Datos SP publicados por prensa.</p>
 ${tablaBancos(s30.ext.map(x=>({b:x.banco,r:x.v})),'Swaps extranjeros de tasas con garantías bilaterales, sistema, 30-09-2026')}
 ${tablaBancos(s30.nac.map(x=>({b:x.banco,r:x.v})),'Swaps nacionales, sistema, 30-09-2026')}</div>
 <div class="tarjeta"><div class="etq">Swaps extranjeros que liquidaban en cámaras de compensación, 7 AFP, 30-06-2026</div>${C(D.sistema.camaras)} <span>Todo era bilateral con garantías.</span></div>`};
const TIPOS={propiedad:'Propiedad',fondos:'Los fondos son accionistas',historico:'Propiedad histórica'};
S.filtros=new Set(Object.keys(TIPOS));
function red(){
  const R=D.red;const col={dueno:10,afp:215,banco:420,duenob:625,fondos:215};const ys={};const cnt={dueno:0,afp:0,banco:0,duenob:0};const Wn=165;
  R.nodos.forEach(n=>{const c=n.tipo;const y=c==='fondos'?40+7*44+20:(c==='banco'||c==='duenob')?40+cnt[c]++*60:40+cnt[c]++*44;ys[n.id]=[col[c],y]});
  const sel=S.afp==='nose'?null:S.afp;const vis=R.aristas.filter(e=>S.filtros.has(e.tipo));
  const on=e=>!sel||e.de===sel||e.a===sel||(e.tipo==='fondos');
  let g=vis.map(e=>{const[a,b]=[ys[e.de],ys[e.a]];const f=F[e.ref.id];const dash=f&&f.grado==='[D]'?'':'5 4';let d;
    if(a[0]===b[0]){d=`M${a[0]+Wn} ${a[1]+14} C${a[0]+Wn+30} ${a[1]+14},${b[0]+Wn+30} ${b[1]+14},${b[0]+Wn} ${b[1]+14}`}
    else if(a[0]<b[0]){d=`M${a[0]+Wn} ${a[1]+14} C${(a[0]+Wn+b[0])/2} ${a[1]+14},${(a[0]+Wn+b[0])/2} ${b[1]+14},${b[0]} ${b[1]+14}`}
    else{d=`M${a[0]} ${a[1]+14} C${(a[0]+b[0]+Wn)/2} ${a[1]+14},${(a[0]+b[0]+Wn)/2} ${b[1]+14},${b[0]+Wn} ${b[1]+14}`}
    return `<path d="${d}" fill="none" stroke="${e.tipo==='fondos'?'#c9a400':e.tipo==='historico'?'#7a7a86':'#111'}" stroke-width="${on(e)?2.5:1}" stroke-dasharray="${e.tipo==='historico'?'2 4':dash}" opacity="${on(e)?1:.25}"/>`}).join('');
  g+=R.nodos.map(n=>{const[x,y]=ys[n.id];const hi=n.id===sel;return `<g><rect x="${x}" y="${y}" width="${Wn}" height="28" rx="8" fill="${hi?'#ffd23f':n.tipo==='fondos'?'#fff1b8':'#fff'}" stroke="#111" stroke-width="${hi?2.5:1}"/><text x="${x+8}" y="${y+18}" font-size="11" fill="#111">${esc(n.nombre)}</text></g>`}).join('');
  return `<div class="red-wrap"><svg viewBox="0 0 800 420" width="100%" style="min-width:640px" role="img" aria-label="Red de propiedad entre dueños, AFP, bancos y dueños de bancos. Solo instituciones. La tabla debajo tiene la misma información.">${g}<text x="10" y="26" font-size="12" font-weight="700">Dueños de AFP</text><text x="215" y="26" font-size="12" font-weight="700">AFP</text><text x="420" y="26" font-size="12" font-weight="700">Bancos contraparte</text><text x="625" y="26" font-size="12" font-weight="700">Dueños de bancos</text></svg></div>`;
}
V.p3=()=>{const R=D.red;const nm=id=>R.nodos.find(n=>n.id===id).nombre;
 const vis=R.aristas.filter(e=>S.filtros.has(e.tipo)&&(S.afp==='nose'||e.de===S.afp||e.a===S.afp||e.tipo==='fondos'));
 return `<p class="lead">Quién es dueño de quién: dueños → AFP → bancos. <strong>Solo instituciones</strong> en esta versión. Un vínculo es un hecho; leerlo como conflicto de interés estructural es una lectura [I], no un rótulo legal.</p>
 <div class="chips" role="group" aria-label="Tipo de vínculo">${Object.entries(TIPOS).map(([k,t])=>`<button class="chip" data-filtro="${k}" aria-pressed="${S.filtros.has(k)}">${t}</button>`).join('')}</div>
 ${red()}
 <div class="leyenda"><span><i style="border-top:3px solid #111"></i>[D] documento</span><span><i style="border-top:3px dashed #111"></i>[D-sec.] o [I]</span><span><i style="border-top:3px solid #c9a400"></i>fondos accionistas</span></div>
 <table><caption>Vínculos ${S.afp==='nose'?'':'de '+esc(afpNombre())} (tabla equivalente a la red)</caption><thead><tr><th>De</th><th>A</th><th>Tipo</th><th class="num">%</th></tr></thead><tbody>${vis.map(e=>`<tr><td>${esc(nm(e.de))}</td><td>${esc(nm(e.a))}</td><td>${TIPOS[e.tipo]}</td><td class="num">${F[e.ref.id]&&F[e.ref.id].cifra===''?H(e.ref.id):C(e.ref,{u:''})}</td></tr>`).join('')}</tbody></table>
 <div class="nd-bloque">Cadenas sin fuente completa: ${R.vacios.map(r=>C(r)).join(' ')} (Principal hacia arriba; vigencia 2026 de la cadena Generali).</div>
 <div class="solo-datos"><h2>Los fondos como accionistas de sus contrapartes · 30-06-2026</h2><table><caption>% del capital del banco en manos de los fondos</caption><thead><tr><th>Banco</th><th class="num">Total</th>${D.afps.map(a=>`<th class="num">${a.nombre}</th>`).join('')}</tr></thead><tbody>${D.tenencia_0630.map(t=>`<tr><th scope="row">${esc(t.banco)}</th><td class="num">${C(t.total,{u:''})}</td>${D.afps.map(a=>`<td class="num">${C(t.afp[a.id],{u:''})}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`};
S.cat=new Set(['norma','alerta','causa']);
V.p4=()=>{const L=D.cronologia.filter(h=>S.cat.has(h.cat));
 return `<p class="lead">Cómo se abrió la puerta y cuándo sonaron las alertas.</p>
 <div class="chips" role="group" aria-label="Filtrar hitos">${[['norma','Normas'],['alerta','Alertas'],['causa','Causas y oficios']].map(([k,t])=>`<button class="chip" data-cat="${k}" aria-pressed="${S.cat.has(k)}">${t}</button>`).join('')}</div>
 <ol style="list-style:none;padding:0">${L.map(h=>{const f=F[h.id];return `<li class="hito"><time>${fdate(f.fecha)}</time><div>${esc(f.descripcion.replace(/^[^:]+: /,''))} ${H(h.id)}</div></li>`}).join('')}</ol>
 <div class="tarjeta solo-datos"><div class="etq">Cifras en la línea de tiempo</div>Sistema, extranjeros: 29-05 ${C(D.swaps['2026-05'].sistema.ext)} · 30-06 ${C(D.swaps['2026-06'].sistema.ext)} · Valorización total 30-09 ${C(D.sistema.v0930)} · Pérdida 05-11 ${C(D.sistema.total)}</div>
 <div class="nd-bloque">Fecha de cada cierre de contrato por AFP: NO DATO.</div>`};
V.p5=()=>`<p class="lead">Aquí se corta el rastro. Estos datos existen, pero no son públicos.</p>
 ${D.vacios.map(v=>`<div class="nd-bloque"><strong>${esc(v.que)}</strong><br>NO DATO · lo tiene: ${esc(v.quien)}</div>`).join('')}
 <h2>Cortes por AFP que faltan</h2><ul>${D.cortes.filter(c=>c.estado==='nodato').map(c=>`<li>${fdate(c.fecha)}: NO DATO · ${esc(c.motivo)}</li>`).join('')}</ul>
 <button data-ir="7">Ver la solicitud por Ley 20.285 →</button>`;
function textoReclamo(){
 const a=S.afp==='nose'?null:D.afps.find(x=>x.id===S.afp);const fo=S.fondo==='nose'?null:S.fondo.toUpperCase();
 if(!a||!fo) return null;const r=D.swaps['2026-06'][S.afp][S.fondo];const v=num(r);
 if(v===null) return {t:`Soy afiliado/a de AFP ${a.nombre}, Fondo ${fo}.\n\nSolicito que se me informe la valorización vigente de los contratos swap de tasas de interés de mi fondo, porque no encuentro el dato publicado.`,r};
 const f=F[r.id];const dir=v<0?'en contra':'a favor';
 return {r,t:`Soy afiliado/a de AFP [${a.nombre}], Fondo [${fo}].\n\nSegún la Cartera de Inversión Desagregada de la Superintendencia de Pensiones (XML, corte [${fdate(f.fecha)}], publicado [${fdate((D.cortes.find(c=>c.fecha===f.fecha)||{}).publicado)}]), el Fondo [${fo}] de AFP [${a.nombre}] registraba una valorización de mercado de US$ [${fmt(r.id).replace('-','')}] millones ${dir} del fondo en swaps extranjeros de tasas de interés.\n\nSolicito que se me informe:\n1. La valorización vigente de esos contratos en mi fondo.\n2. Si hubo cierres anticipados con pérdida realizada, el monto y la fecha.\n3. Qué medidas se adoptaron para cumplir los nuevos límites de la SP.\n\nEsta solicitud usa datos públicos. No es una afirmación de responsabilidad de nadie.`};
}
V.p6=()=>{const tr=textoReclamo();
 return `<div class="aviso">No es asesoría financiera, previsional ni legal. No te decimos qué fondo elegir. Tú decides si actúas y desde tu propia cuenta.</div>
 <h2>¿Desde dónde actúas?</h2>${chips('rol',[['afiliado','Afiliado/a'],['periodista','Periodista'],['parlamentario','Parlamentario/a o equipo']],S.rol)}
 ${S.rol==='periodista'||S.rol==='parlamentario'?`<p>Para tu rol: <a href="#p7">solicitud Ley 20.285 y causas</a> · <a href="#p8">descarga de datos</a>.</p>`:''}
 <h2>Reclamo guiado · ${esc(afpNombre())}${S.fondo!=='nose'?' · Fondo '+S.fondo.toUpperCase():''}</h2>
 ${tr?`<div class="tarjeta"><div class="etq">Cifra que usa tu texto</div>${C(tr.r)}</div>
 <div class="texto-gen" id="txt" tabindex="0" aria-label="Texto generado">${esc(tr.t).replace(/\[([^\]]+)\]/g,'<mark>$1</mark>')}</div>
 <div class="acciones"><button class="btn-prim" data-copiar="txt">Copiar texto</button><button data-editar="txt">Editar antes de copiar</button></div>
 <p class="solo-datos">Sin «perdí plata»: la cifra es valorización de mercado, con fecha y fuente. Si no hay cifra para tu fondo, el texto pide el dato en vez de afirmarlo.</p>`
 :`<div class="nd-bloque">Elige tu AFP y tu fondo en el <a href="#p0">paso 0</a> para armar el texto.</div>`}
 <h2>¿A quién se lo mandas?</h2>
 <ol><li><strong>Tu AFP</strong> (sugerido, no obligatorio): sitio de reclamos de cada AFP [por documentar].</li>
 <li><strong>Superintendencia de Pensiones</strong>: formulario web; adjunto opcional de hasta ${C(D.plazos.adjunto,{u:' páginas'})}. <a href="${esc(F[D.plazos.adjunto.id].url)}" target="_blank" rel="noopener noreferrer">Abrir SP ↗</a></li>
 <li><strong>CMF</strong> (bancos, seguros): con Clave Única; para bancos pide reclamo previo ante la entidad. Un afiliado no es cliente del banco del swap: podría no admitirse. <a href="https://www.cmfchile.cl" target="_blank" rel="noopener noreferrer">CMF ↗</a> (enlace directo [por documentar])</li></ol>
 <p><strong>Tú envías desde el sitio oficial. Este sitio no envía nada ni guarda tu texto.</strong></p>`};
const PUNTOS=['Nocional mensual de los swaps de tasas, por AFP, fondo, contraparte y mes','Valorización de mercado 2026/07 a 2026/11 (archivos no disponibles en el sitio)','Pérdida o ganancia realizada por cierre anticipado (movimientos «Q» del formulario D-2.8)','Garantías entregadas y recibidas por AFP, fondo, contraparte y moneda','Monto compensado en cámaras de contraparte central','Identificación de la contraparte «sin emisor identificado» al 30-09-2026','Copia de los oficios a las AFP sobre derivados 2024–2026 y sus respuestas, en lo no reservado'];
S.puntos=new Set([0,1,2]);
V.p7=()=>{const sel=PUNTOS.filter((_,i)=>S.puntos.has(i));const t=`A: Superintendencia de Pensiones — Portal de Transparencia\n\nDe acuerdo con la Ley N.º 20.285, solicito la siguiente información en formato reutilizable (CSV o XLSX), agregada por AFP, tipo de fondo, contraparte y mes, sin datos personales, para el período enero 2022 – noviembre 2026:\n\n${sel.map((p,i)=>`${i+1}. ${p}.`).join('\n')}\n\nSi alguna parte es reservada, solicito la entrega parcial del resto (art. 21 y principio de divisibilidad, art. 11 letra e), indicando la causal específica.`;
 const causas=D.cronologia.filter(h=>h.cat==='causa');
 return `<h2>Pide los datos que faltan (Ley 20.285)</h2>
 <fieldset><legend>Marca lo que quieres pedir</legend>${PUNTOS.map((p,i)=>`<label style="display:flex;gap:8px;min-height:44px;align-items:center"><input type="checkbox" data-punto="${i}" ${S.puntos.has(i)?'checked':''}> ${esc(p)}</label>`).join('')}</fieldset>
 <div class="texto-gen" id="txt20285" tabindex="0">${esc(t)}</div>
 <div class="acciones"><button class="btn-prim" data-copiar="txt20285">Copiar solicitud</button><a class="btn" href="https://www.spensiones.cl/transparencia/solicitud_informacion.html" target="_blank" rel="noopener noreferrer">Transparencia SP ↗</a></div>
 <div class="tarjeta">Plazo de respuesta: ${C(D.plazos.l20285,{u:' días hábiles'})} (+ prórroga). Sin respuesta o negada: ${C(D.plazos.amparo,{u:' días hábiles'})} para el amparo ante el Consejo para la Transparencia.</div>
 <div class="aviso">No es anónima: la ley pide nombre y dirección del solicitante.</div>
 <h2>Causas y oficios · solo lo público</h2>
 <ol style="list-style:none;padding:0">${causas.map(h=>{const f=F[h.id];return `<li class="hito"><time>${fdate(f.fecha)}</time><div>${esc(f.descripcion.replace(/^[^:]+: /,''))} ${H(h.id)}</div></li>`}).join('')}</ol>
 <div class="nd-bloque">Otras causas, resultado de la apelación y otros oficios: NO DATO (sin catastro). Procedimiento abierto ≠ sanción. Inadmisible ≠ fallo de fondo.</div>`};
V.p8=()=>`<h2>Avísame cuando cambie</h2>
 <div class="nd-bloque">Prototipo: las alertas aún no funcionan. Propuesta: RSS por defecto (sin datos) y correo solo si lo pides.</div>
 <ul><li>La SP publica la Cartera Desagregada de julio a octubre 2026</li><li>Cambia la causa conocida (apelación)</li><li>Nuevo documento de la SP en la Cámara</li></ul>
 <h2>Cuántos han actuado</h2>
 <div class="tarjeta"><div class="etq">Textos copiados · reclamos declarados · solicitudes · alertas</div><span class="cifra g-ND">NO DATO</span> Prototipo sin uso real. Nunca mostramos números de ejemplo. Por AFP, solo si el grupo suma 10 o más.</div>
 <h2>Modo periodista · datos y fuentes</h2>
 <p>Cada fila trae cifra, fecha, fuente, URL, grado y estado de la auditoría.</p>
 <div class="acciones"><button class="btn-prim" id="bajar-csv">Descargar tabla de fuentes (CSV)</button></div>
 <p class="solo-datos">Filas en la tabla de fuentes: ${Object.keys(F).length}. Sin nombres de personas en esta versión.</p>`;
V.p9=()=>{const cnt={};Object.values(F).forEach(f=>{const k=f.estado==='ok'?f.grado:f.estado==='corregir'?f.grado+' · cifra verificada en la fuente':'NO DATO · sin fuente';cnt[k]=(cnt[k]||0)+1});
 return `<p class="lead">Para la comisión y para quien quiera revisar: qué es dato y qué es lectura.</p>
 <table><caption>Grados</caption><tbody>
 <tr><th><span class="cifra g-D">[D]</span></th><td>Dato con documento público (borde sólido)</td></tr>
 <tr><th><span class="cifra g-Dsec">[D-sec.]</span></th><td>Dato vía prensa o agregador que cita la fuente (borde fino)</td></tr>
 <tr><th><span class="cifra g-I">[I]</span></th><td>Inferencia o cálculo propio (borde punteado)</td></tr>
 <tr><th><span class="cifra g-ND">NO DATO</span></th><td>No existe o no es público. Nunca un cero.</td></tr></tbody></table>
 <p>«Conflicto de interés estructural» es una categoría de análisis [I], no un rótulo legal. Los swaps se rotulan «operación cuestionada».</p>
 <table class="solo-datos"><caption>Tabla de fuentes por grado y estado</caption><tbody>${Object.entries(cnt).map(([k,v])=>`<tr><th>${esc(k)}</th><td class="num">${v}</td></tr>`).join('')}</tbody></table>`};
/* ---------- motor ---------- */
function leerURL(){const q=new URLSearchParams(location.search);['afp','fondo','nivel','rol'].forEach(k=>{if(q.get(k))S[k]=q.get(k)});const m=location.hash.match(/^#p(\d)/);S.paso=m?+m[1]:0}
function escribirURL(){const q=new URLSearchParams();['afp','fondo','nivel','rol'].forEach(k=>{if(S[k]&&S[k]!=='nose'&&!(k==='nivel'&&S[k]==='historia'))q.set(k,S[k])});history.replaceState(null,'','?'+q.toString()+'#p'+S.paso)}
function render(){
 notas=[];const [id,t]=PASOS[S.paso];document.body.dataset.nivel=S.nivel;
 $('#contenido').innerHTML=`<section class="paso anim" aria-labelledby="h-${id}"><div class="paso-n">Paso ${S.paso} de ${PASOS.length-1}</div><h1 id="h-${id}">${esc(t)}</h1>${V[id]()}${lineaFuente()}</section>`;
 $('#estado-afp').textContent=`${afpNombre()} · ${S.fondo==='nose'?'fondo: no sé':'Fondo '+S.fondo.toUpperCase()}`;
 $$('.nivel button').forEach(b=>b.setAttribute('aria-checked',b.dataset.nivel===S.nivel));
 $('#indice').innerHTML=PASOS.map(([p,tt],i)=>`<a href="#${p}" ${i===S.paso?'aria-current="step"':''}>${i} · ${esc(tt)}</a>`).join('');
 $('#ant').disabled=S.paso===0;$('#sig').disabled=S.paso===PASOS.length-1;document.title=`${t} · Sigue tu pensión (prototipo)`;escribirURL();
}
document.addEventListener('click',e=>{const b=e.target.closest('button,a');if(!b)return;
 if(b.classList.contains('nota')){abrirNota(+b.dataset.n);return}
 if(b.dataset.set){S[b.dataset.set]=b.dataset.v;render();return}
 if(b.dataset.nivel){S.nivel=b.dataset.nivel;render();return}
 if(b.dataset.ir){location.hash='#p'+b.dataset.ir;return}
 if(b.dataset.filtro){const k=b.dataset.filtro;S.filtros.has(k)?S.filtros.delete(k):S.filtros.add(k);render();return}
 if(b.dataset.cat){const k=b.dataset.cat;S.cat.has(k)?S.cat.delete(k):S.cat.add(k);render();return}
 if(b.dataset.copiar){const el=$('#'+b.dataset.copiar);const txt=el.value!==undefined?el.value:el.innerText;navigator.clipboard&&navigator.clipboard.writeText(txt).then(()=>{b.textContent='Copiado ✓'},()=>{b.textContent='Copia manual: selecciona el texto'});return}
 if(b.dataset.editar){const el=$('#'+b.dataset.editar);const ta=document.createElement('textarea');ta.id=el.id;ta.className='texto-gen';ta.rows=14;ta.style.width='100%';ta.value=el.innerText;el.replaceWith(ta);ta.focus();return}
 if(b.id==='bajar-csv'){const cols=['id','cifra','unidad','descripcion','fecha','fuente','url','grado','estado','verificacion'];const csv=[cols.join(',')].concat(Object.values(F).map(r=>cols.map(c=>'"'+String(r[c]||'').replace(/"/g,'""')+'"').join(','))).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='tabla-fuentes-contra-archivo.csv';a.click();return}
 if(b.id==='ant'&&S.paso>0){location.hash='#p'+(S.paso-1);return}
 if(b.id==='sig'&&S.paso<PASOS.length-1){location.hash='#p'+(S.paso+1);return}
 if(b.classList.contains('btn-indice')){const n=$('#indice');n.hidden=!n.hidden;b.setAttribute('aria-expanded',!n.hidden);return}
});
document.addEventListener('change',e=>{if(e.target.dataset.punto!==undefined){const i=+e.target.dataset.punto;e.target.checked?S.puntos.add(i):S.puntos.delete(i);render();const c=$(`[data-punto="${i}"]`);c&&c.focus()}});
addEventListener('hashchange',()=>{leerURL();render();$('#indice').hidden=true;$('#contenido').focus({preventScroll:true});scrollTo(0,0)});
Promise.all([fetch('data/datos.json').then(r=>r.json()),fetch('data/fuentes.json').then(r=>r.json())]).then(([d,f])=>{D=d;F=f;leerURL();render()}).catch(()=>{$('#contenido').innerHTML='<div class="nd-bloque">No se pudieron cargar los datos. Prueba a recargar la página.</div>'});
