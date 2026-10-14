(function addOn(){
'use strict';
const CATALOG=[
{id:'ast',name:'Análisis de seguridad del trabajo (AST) actualizado',desc:'Peligros, cambios y controles por actividad.',ref:'API RP 1646:2025, 4.2.3',match:null},
{id:'coord',name:'Ingreso coordinado y conocimiento del sitio',desc:'Responsable, condiciones, comunicaciones e interfaces.',ref:'API RP 1646:2025, 4.3.2',match:null},
{id:'permiso',name:'Permisos de trabajo y condiciones verificadas',desc:'Autorización, vigencia, supervisión y criterios de parada.',ref:'API RP 1646:2025, 4.3.4',match:null},
{id:'perimetro',name:'Delimitación y protección de terceros',desc:'Control de tránsito y separación del área de trabajo.',ref:'API RP 1646:2025, sección 9',match:null},
{id:'altura',name:'Altura: acceso, protección y rescate',desc:'Equipos, competencia, protección colectiva y plan de rescate.',ref:'API RP 1646:2025, sección 10',match:'altura|techo|cubierta|andamio|marquesina'},
{id:'excav',name:'Excavación: servicios, estabilidad y acceso',desc:'Redes enterradas, protección frente a derrumbe y accesos.',ref:'API RP 1646:2025, sección 11',match:'excav|zanja|movimiento de tierra'},
{id:'izaje',name:'Izamiento: plan, equipo y zona de exclusión',desc:'Operador, aparejos, capacidad, señalización y maniobra.',ref:'API RP 1646:2025, sección 12',match:'izamiento|izaje|grúa|grua'},
{id:'confinado',name:'Espacio confinado: atmósfera, vigía y rescate',desc:'Permiso, medición, ventilación, comunicaciones y rescate.',ref:'API RP 1646:2025, sección 13',match:'confinado|ingreso a tanque|mantenimiento interno de tanque'},
{id:'energia',name:'Energía peligrosa: aislamiento y prueba',desc:'Bloqueo, etiquetado y verificación de condición segura.',ref:'API RP 1646:2025, sección 14',match:'energía|energia|eléctri|electri|bloqueo|tablero|loto'},
{id:'caliente',name:'Trabajo en caliente: atmósfera y prevención de incendios',desc:'Fuentes de ignición, combustible, medición, extinción y vigilancia.',ref:'API RP 1646:2025, sección 15',match:'caliente|soldadura|esmeril|oxicorte'},
{id:'tanques',name:'Tanques subterráneos de combustible',desc:'Control sectorial específico de intervenciones en sistemas enterrados.',ref:'API RP 1646:2025, sección 16',match:'tanque subterráneo|tanques subterráneos|estación de servicio|estacion de servicio|surtidor'}
];
function applicable(c){
const tasks=[c.title||'',c.scope||'',c.site||'',...(Array.isArray(c.tasks)?c.tasks:[])].join(' ').toLocaleLowerCase('es');
return CATALOG.filter(i=>!i.match||new RegExp(i.match,'i').test(tasks));
}
function stats(c){const rows=applicable(c),values=c.assurance?.items||{};const verified=rows.filter(i=>values[i.id]?.status==='yes'&&String(values[i.id]?.evidence||'').trim()).length;return {rows,verified,total:rows.length};}
function viewAssurance(){
const c=activeContract();if(!c)return '<div class="empty"><strong>Selecciona un contrato</strong>Crea un contrato y define sus tareas críticas.</div>';
const s=stats(c),values=c.assurance?.items||{};
return `<div class="hero-panel"><div class="kicker">De la Reacción a la Prevención · ${esc(c.title||'Contrato activo')}</div><h2>Controles y evidencias verificables</h2><p>Referencia sectorial API RP 1646:2025: prácticas de trabajo seguro para contratistas en instalaciones de suministro y almacenamiento de petróleo. La aplicabilidad debe evaluarse para cada contrato; no constituye una obligación legal general en Venezuela.</p></div>
<div class="section grid grid-3"><div class="metric"><div class="k">Controles sugeridos</div><div class="v">${s.total}</div><div class="sub">Para el alcance registrado</div></div><div class="metric"><div class="k">Conformes con evidencia</div><div class="v">${s.verified}</div><div class="sub">Controles verificados documentalmente</div></div><div class="metric alert-metric"><div class="k">Pendientes o no conformes</div><div class="v">${s.total-s.verified}</div><div class="sub">Revisar según la criticidad</div></div></div>
<div class="section callout warn">Esta biblioteca es una ayuda didáctica y operativa. El resultado NO habilita automáticamente trabajos ni sustituye permisos, requisitos legales, PSST, planes específicos o procedimientos del centro de trabajo.</div>
<div class="section panel"><h3 class="panel-title">Registro por tarea y referencia</h3><div class="assurance-list">${s.rows.map(i=>{const v=values[i.id]||{};const st=['yes','no','na','pending'].includes(v.status)?v.status:'pending';return `<div class="assurance-card" data-assurance="${i.id}"><div class="assurance-head"><div><span class="ref-badge">${esc(i.ref)}</span><h4>${esc(i.name)}</h4><p>${esc(i.desc)}</p></div><label class="field"><span class="field-label">Estado</span><select class="select ass-status">${[['pending','Pendiente'],['yes','Conforme'],['no','No conforme'],['na','No aplica']].map(([k,n])=>`<option value="${k}" ${st===k?'selected':''}>${n}</option>`).join('')}</select></label></div><div class="form-grid"><label class="field"><span class="field-label">Responsable</span><input class="input ass-owner" maxlength="120" value="${esc(v.owner||'')}"></label><label class="field"><span class="field-label">Fecha</span><input class="input ass-date" type="date" value="${esc(v.date||'')}"></label><label class="field full"><span class="field-label">Evidencia verificable / justificación de no aplicación</span><textarea class="textarea ass-evidence" maxlength="1200" rows="2" placeholder="Acta, inspección, medición, permiso, resultado...">${esc(v.evidence||'')}</textarea></label></div></div>`}).join('')}</div><div class="actions"><button class="btn btn-primary" data-action="save-assurance">Guardar controles</button></div></div>`;
}
function saveAssurance(){
const c=activeContract();if(!c)return;
const items={...(c.assurance?.items||{})};
for(const card of document.querySelectorAll('[data-assurance]')){
const status=card.querySelector('.ass-status').value;
const evidence=card.querySelector('.ass-evidence').value.trim();
if(['yes','na'].includes(status)&&!evidence){notify('Indica evidencia para “Conforme” o justificación para “No aplica”.','warn');card.querySelector('.ass-evidence').focus();return;}
items[card.dataset.assurance]={status,evidence,owner:card.querySelector('.ass-owner').value.trim(),date:card.querySelector('.ass-date').value};
}
c.assurance={items};if(save()){notify('Controles y evidencias guardados.','success');render();}
}
function backupView(){
return `<div class="hero-panel"><div class="kicker">Gestión segura de expedientes</div><h2>Respaldo y restauración</h2><p>En esta versión, los datos se guardan únicamente en este navegador. No existe sincronización automática con otros equipos ni respaldo en servidor.</p></div>
<div class="section grid grid-2"><div class="panel"><h3 class="panel-title">Descargar un respaldo</h3><p>Exporta contratistas, contratos, controles y resultados en un archivo JSON.</p><div class="callout warn">El archivo puede contener datos personales y empresariales. Guárdalo de forma privada.</div><div class="actions"><button class="btn btn-primary" data-action="download-backup">Descargar respaldo JSON</button></div></div><div class="panel"><h3 class="panel-title">Restaurar expediente</h3><p>Selecciona un respaldo exportado por esta aplicación. Se validará y solicitará confirmación antes de sustituir los datos actuales.</p><input class="input" type="file" id="backupInput" accept=".json,application/json"><div class="callout warn mt-12">Descarga primero un respaldo actualizado de tus datos. La restauración reemplazará el almacenamiento de este navegador.</div></div></div>
<div class="section panel"><h3 class="panel-title">Estado del navegador</h3><p><strong>${state.contractors.length}</strong> contratistas · <strong>${state.contracts.length}</strong> contratos. No ingreses contraseñas, registros médicos ni otra información sensible en esta versión local sin autenticación.</p></div>`;
}
function backup(){
const output={format:'movidasst-contratistas-backup',schema:1,createdAt:new Date().toISOString(),data:JSON.parse(JSON.stringify(state))};
const url=URL.createObjectURL(new Blob([JSON.stringify(output,null,2)],{type:'application/json'}));
const a=document.createElement('a');a.href=url;a.download='movidasst-contratistas-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Respaldo generado. Protégelo como documento privado.','success');
}
async function restore(file){
if(!file)return;if(file.size>5*1024*1024){notify('El archivo supera 5 MB; no se importó.','warn');return;}
let parsed;try{parsed=JSON.parse(await file.text());}catch(_){notify('El archivo no contiene un JSON válido.','warn');return;}
const d=parsed?.data;
if(parsed?.format!=='movidasst-contratistas-backup'||parsed.schema!==1||d?.version!==1||!Array.isArray(d.contracts)||!Array.isArray(d.contractors)||d.contracts.length>3000||d.contractors.length>3000){notify('El respaldo no tiene una estructura compatible.','warn');return;}
const validId=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{1,160}$/.test(x);
const ids=d.contractors.map(x=>x?.id),cts=d.contracts.map(x=>x?.id);
if(d.contractors.some(x=>!x||!validId(x.id)||typeof x.name!=='string')||d.contracts.some(x=>!x||!validId(x.id)||!validId(x.contractorId)||typeof x.title!=='string'||!ids.includes(x.contractorId))||new Set(ids).size!==ids.length||new Set(cts).size!==cts.length||(d.activeContractId&&!cts.includes(d.activeContractId))){notify('El respaldo contiene registros o identificadores inválidos.','warn');return;}
if(!confirm(`Se sustituirán ${state.contracts.length} contrato(s) actuales por ${d.contracts.length} contrato(s). Descarga primero un respaldo. ¿Continuar?`))return;
const previous=state;state=d;if(!save()){state=previous;return;}
currentView='dashboard';location.hash='/dashboard';render();notify('Respaldo restaurado correctamente.','success');
}
window.renderAssurance=viewAssurance;window.saveAssurance=saveAssurance;window.assuranceStats=stats;window.renderBackup=backupView;window.downloadBackup=backup;window.restoreBackupFile=restore;
})();
