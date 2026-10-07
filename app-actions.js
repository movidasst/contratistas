  function bindView(){
    $$('[data-go]').forEach(b=>b.onclick=()=>setView(b.dataset.go));
    $$('[data-open-contract]').forEach(b=>b.onclick=()=>{state.activeContractId=b.dataset.openContract;save();setView('contracts')});
    $$('[data-action]').forEach(b=>{ const a=b.dataset.action; if(a==='new-contract')b.onclick=()=>openContractModal(); if(a==='new-contractor')b.onclick=()=>openContractorModal(); if(a==='excel-report')b.onclick=exportExcelReport; if(a==='pdf-report')b.onclick=generatePdfReport; if(a==='load-example')b.onclick=loadExampleCase; if(a==='delete-example')b.onclick=deleteExampleCase; if(a==='save-contract-meta')b.onclick=saveContractMeta; if(a==='edit-tasks')b.onclick=editTasks; if(a==='save-pq-notes')b.onclick=savePqNotes; if(a==='add-interface')b.onclick=addInterface; if(a==='save-interfaces')b.onclick=saveInterfaces; if(a==='apply-prestart-status')b.onclick=applyPrestartStatus; if(a==='new-monitoring')b.onclick=()=>openMonitoringModal(); if(a==='save-performance-notes')b.onclick=savePerformanceNotes; if(a==='apply-close-status')b.onclick=applyCloseStatus; });
    $$('[data-edit-contractor]').forEach(b=>b.onclick=()=>openContractorModal(b.dataset.editContractor));
    $$('[data-edit-monitoring]').forEach(b=>b.onclick=()=>openMonitoringModal(b.dataset.editMonitoring));
    $$('.crit-range').forEach(el=>el.oninput=()=>{const c=activeContract();c.criticality=c.criticality||{};c.criticality[el.dataset.key]=Number(el.value);$('#crit-'+el.dataset.key).textContent=el.value;save();const r=criticalityResult(c);$('#critTotal').textContent=`${r.total}/25`;$('#critProgress').style.width=`${r.total/25*100}%`;});
    $$('.pq-score').forEach(el=>el.onchange=()=>{const c=activeContract();c.prequal=c.prequal||{scores:{},blockers:{}};c.prequal.scores[el.dataset.key]=Number(el.value);save();updatePqResult();});
    $$('.pq-blocker').forEach(el=>el.onchange=()=>{const c=activeContract();c.prequal.blockers=c.prequal.blockers||{};c.prequal.blockers[el.dataset.key]=el.checked;save();updatePqResult();});
    $$('.ps-state').forEach(el=>el.onclick=()=>{const c=activeContract();c.prestart=c.prestart||{checks:{},interfaces:[]};c.prestart.checks[el.dataset.id]=el.dataset.value;save();render();});
    $$('[data-remove-interface]').forEach(b=>b.onclick=()=>{const c=activeContract();c.prestart.interfaces.splice(Number(b.dataset.removeInterface),1);save();render();});
    $$('.perf-range').forEach(el=>el.oninput=()=>{const c=activeContract();c.performance[el.dataset.key]=Number(el.value);save();$('#dim-'+el.dataset.key).textContent=`${el.value}%`;updatePerfResult();});
    $$('.perf-blocker').forEach(el=>el.onchange=()=>{const c=activeContract();c.performance.blockers=c.performance.blockers||{};c.performance.blockers[el.dataset.key]=el.checked;save();updatePerfResult();});
    const search=$('#contractorSearch'); if(search)search.oninput=()=>{const q=search.value.toLowerCase().trim();const rows=state.contractors.filter(x=>(x.name+' '+x.rif+' '+x.contact).toLowerCase().includes(q));$('#contractorsTable').innerHTML=contractorsTable(rows);bindView();};
  }

  function cloneData(x){ return JSON.parse(JSON.stringify(x)); }
  function loadExampleCase(){
    const demo=exampleData();
    // El ejemplo se carga como expediente independiente sin borrar datos reales.
    state.contracts=state.contracts.filter(x=>x.id!=='ct-demo' && !(x.id==='ct-1'&&x.title==='Mantenimiento mayor de tanque TK-210'));
    const legacyIds=new Set(['co-demo','co-1']);
    state.contractors=state.contractors.filter(x=>!legacyIds.has(x.id));
    // El segundo contratista de la primera versión era también dato precargado sin uso.
    state.contractors=state.contractors.filter(x=>!(x.id==='co-2'&&x.name==='Mantenimiento Integral del Centro, C.A.'&&!state.contracts.some(c=>c.contractorId===x.id)));
    state.contractors.push(cloneData(demo.contractor));
    state.contracts.push(cloneData(demo.contract));
    state.activeContractId=demo.contract.id;
    save();
    notify('Caso de práctica cargado. Puedes recorrer los 7 pasos y eliminarlo cuando termines.','success');
    render();
  }
  function deleteExampleCase(){
    const demoContractIds=new Set(['ct-demo']);
    state.contracts=state.contracts.filter(x=>!(demoContractIds.has(x.id)||(x.id==='ct-1'&&x.title==='Mantenimiento mayor de tanque TK-210')));
    const used=new Set(state.contracts.map(x=>x.contractorId));
    state.contractors=state.contractors.filter(x=>{
      if(x.id==='co-demo') return false;
      if(x.id==='co-1'&&x.name==='Servicios Industriales Andinos, C.A.') return false;
      if(x.id==='co-2'&&x.name==='Mantenimiento Integral del Centro, C.A.'&&!used.has(x.id)) return false;
      return true;
    });
    if(!state.contracts.some(x=>x.id===state.activeContractId)) state.activeContractId=state.contracts[0]?.id||null;
    save();
    notify('Caso de práctica eliminado. Tus demás registros se conservaron.','success');
    render();
  }

  function updatePqResult(){const r=prequalResult(activeContract());$('#pqScore').textContent=`${pct(r.score)}%`;$('#pqProgress').style.width=`${r.score}%`;$('#pqDecision').textContent=r.decision;}
  function updatePerfResult(){const r=performanceResult(activeContract());$('#perfScore').textContent=`${pct(r.score)}%`;$('#perfProgress').style.width=`${r.score}%`;$('#perfDecision').textContent=r.decision;}
  function saveContractMeta(){const c=activeContract();c.status=$('#contractStatus').value;c.scope=$('#contractScope').value.trim();save();notify('Contrato actualizado.','success');render();}
  function editTasks(){const c=activeContract();const txt=prompt('Tareas críticas separadas por coma:',(c.tasks||[]).join(', '));if(txt===null)return;c.tasks=txt.split(',').map(x=>x.trim()).filter(Boolean);save();render();}
  function savePqNotes(){activeContract().prequal.notes=$('#pqNotes').value.trim();save();notify('Criterio de precalificación guardado.','success');}
  function addInterface(){const c=activeContract();c.prestart=c.prestart||{checks:{},interfaces:[]};c.prestart.interfaces.push({activity:'',client:'',contractor:'',primacy:'',gap:'',control:''});save();render();}
  function saveInterfaces(){const c=activeContract();$$('[data-interface]').forEach(card=>{const i=Number(card.dataset.interface);card.querySelectorAll('.int-field').forEach(el=>c.prestart.interfaces[i][el.dataset.k]=el.value.trim());});save();notify('Mapa de interfaces actualizado.','success');}
  function applyPrestartStatus(){const c=activeContract();const r=prestartResult(c);if(r.decision==='AUTORIZAR INICIO')c.status='Habilitado';else c.status='Pendiente de habilitación';save();notify(`Estado actualizado: ${c.status}.`,r.decision==='AUTORIZAR INICIO'?'success':'warn');render();}
  function savePerformanceNotes(){const c=activeContract();c.performance.strengths=$('#perfStrengths').value.trim();c.performance.gaps=$('#perfGaps').value.trim();save();notify('Aprendizajes de cierre guardados.','success');}
  function applyCloseStatus(){const c=activeContract();c.status='En cierre';save();notify('Contrato movido a fase de cierre.','success');render();}

  function openModal(titleText,bodyHtml,onSave){$('#modalTitle').textContent=titleText;$('#modalBody').innerHTML=bodyHtml;$('#modalBackdrop').hidden=false;const form=$('#modalBody form');if(form)form.onsubmit=e=>{e.preventDefault();onSave(new FormData(form));};}
  function closeModal(){$('#modalBackdrop').hidden=true;$('#modalBody').innerHTML='';}
  function openContractorModal(id){const x=id?state.contractors.find(c=>c.id===id):null;openModal(x?'Editar contratista':'Registrar contratista',`<form><div class="form-grid"><div class="field full"><label>Razón social</label><input class="input" name="name" required value="${esc(x?.name||'')}"></div><div class="field"><label>RIF</label><input class="input" name="rif" value="${esc(x?.rif||'')}"></div><div class="field"><label>Estado general</label><select class="select" name="status">${selectHtml(['En evaluación','Apta','Apta con condiciones','Restringida'],x?.status||'En evaluación')}</select></div><div class="field"><label>Contacto</label><input class="input" name="contact" value="${esc(x?.contact||'')}"></div><div class="field"><label>Teléfono</label><input class="input" name="phone" value="${esc(x?.phone||'')}"></div><div class="field full"><label>Correo</label><input class="input" type="email" name="email" value="${esc(x?.email||'')}"></div><div class="field full"><label>Notas</label><textarea class="textarea" name="notes">${esc(x?.notes||'')}</textarea></div></div><div class="actions"><button type="button" class="btn btn-ghost" data-close-modal>Cancelar</button><button class="btn btn-primary" type="submit">Guardar</button></div></form>`,fd=>{const obj={id:x?.id||uid('co'),name:fd.get('name').trim(),rif:fd.get('rif').trim(),status:fd.get('status'),contact:fd.get('contact').trim(),phone:fd.get('phone').trim(),email:fd.get('email').trim(),notes:fd.get('notes').trim()};if(x)Object.assign(x,obj);else state.contractors.push(obj);save();closeModal();notify('Contratista guardada.','success');render();});bindModalButtons();}
  function openContractModal(){if(!state.contractors.length){notify('Primero registra una contratista.','warn');return;}openModal('Nuevo contrato',`<form><div class="form-grid"><div class="field full"><label>Nombre / alcance corto</label><input class="input" name="title" required placeholder="Ej. Mantenimiento eléctrico de subestación"></div><div class="field"><label>Contratista</label><select class="select" name="contractorId">${state.contractors.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select></div><div class="field"><label>Centro de trabajo / ubicación</label><input class="input" name="site"></div><div class="field"><label>Fecha inicio</label><input class="input" type="date" name="start"></div><div class="field"><label>Fecha fin prevista</label><input class="input" type="date" name="end"></div><div class="field"><label>N.º trabajadores</label><input class="input" type="number" min="0" name="workers" value="0"></div><div class="field"><label>N.º subcontratistas</label><input class="input" type="number" min="0" name="subcontractors" value="0"></div><div class="field full"><label>Descripción del alcance</label><textarea class="textarea" name="scope"></textarea></div><div class="field full"><label>Tareas críticas (separadas por coma)</label><input class="input" name="tasks" placeholder="Espacios confinados, trabajo en caliente..."></div></div><div class="actions"><button type="button" class="btn btn-ghost" data-close-modal>Cancelar</button><button class="btn btn-primary" type="submit">Crear contrato</button></div></form>`,fd=>{const obj={id:uid('ct'),contractorId:fd.get('contractorId'),title:fd.get('title').trim(),site:fd.get('site').trim(),start:fd.get('start'),end:fd.get('end'),workers:Number(fd.get('workers'))||0,subcontractors:Number(fd.get('subcontractors'))||0,status:'Borrador',scope:fd.get('scope').trim(),tasks:fd.get('tasks').split(',').map(x=>x.trim()).filter(Boolean),criticality:{exposure:1,severity:1,complexity:1,interfaces:1,subcontracting:1},prequal:{scores:Object.fromEntries(PREQUAL.map(x=>[x.id,0])),blockers:{criticalCompetence:false,legalGap:false,criticalControl:false},notes:''},prestart:{checks:{},interfaces:[]},monitoring:[],performance:{management:0,operations:0,actions:0,learning:0,results:0,blockers:{criticalLegal:false,criticalControl:false,overdueCritical:false,highPotential:false},strengths:'',gaps:''}};state.contracts.push(obj);state.activeContractId=obj.id;save();closeModal();notify('Contrato creado. Comienza por clasificar su criticidad.','success');setView('criticality');});bindModalButtons();}
  function openMonitoringModal(id){const c=activeContract();const x=id?(c.monitoring||[]).find(a=>a.id===id):null;openModal(x?'Editar seguimiento':'Nuevo registro de seguimiento',`<form><div class="form-grid"><div class="field"><label>Fecha</label><input class="input" type="date" name="date" required value="${esc(x?.date||new Date().toISOString().slice(0,10))}"></div><div class="field"><label>Tipo</label><select class="select" name="type">${selectHtml(['Inspección','Verificación','Reunión','Incidente','Cuasi accidente','Cambio','Auditoría'],x?.type||'Verificación')}</select></div><div class="field"><label>Severidad</label><select class="select" name="severity">${selectHtml(['Observación','Menor','Mayor','Crítica'],x?.severity||'Menor')}</select></div><div class="field"><label>Estado</label><select class="select" name="status">${selectHtml(['Abierta','En curso','Cerrada'],x?.status||'Abierta')}</select></div><div class="field full"><label>Hallazgo / decisión</label><textarea class="textarea" name="finding" required>${esc(x?.finding||'')}</textarea></div><div class="field"><label>Responsable</label><input class="input" name="owner" value="${esc(x?.owner||'')}"></div><div class="field"><label>Fecha compromiso</label><input class="input" type="date" name="due" value="${esc(x?.due||'')}"></div></div><div class="actions"><button type="button" class="btn btn-ghost" data-close-modal>Cancelar</button><button class="btn btn-primary" type="submit">Guardar</button></div></form>`,fd=>{const obj={id:x?.id||uid('m'),date:fd.get('date'),type:fd.get('type'),severity:fd.get('severity'),status:fd.get('status'),finding:fd.get('finding').trim(),owner:fd.get('owner').trim(),due:fd.get('due')};if(x)Object.assign(x,obj);else{c.monitoring=c.monitoring||[];c.monitoring.push(obj);}save();closeModal();notify('Seguimiento actualizado.','success');render();});bindModalButtons();}
  function bindModalButtons(){$$('[data-close-modal]').forEach(b=>b.onclick=closeModal);}

  function reportBaseRows(c){
    const co=contractorById(c.contractorId)||{};
    return [
      ['Campo','Valor'],
      ['Contratista',co.name||''],['RIF',co.rif||''],['Contacto',co.contact||''],['Correo',co.email||''],
      ['Contrato',c.title||''],['Ubicación',c.site||''],['Inicio',c.start||''],['Fin previsto',c.end||''],
      ['Estado',c.status||''],['Trabajadores',c.workers||0],['Subcontratistas',c.subcontractors||0],
      ['Alcance',c.scope||''],['Tareas críticas',(c.tasks||[]).join(', ')]
    ];
  }

  function exportExcelReport(){
    const c=activeContract();
    if(!c){notify('Selecciona un contrato para generar el Excel.','warn');return;}
    if(typeof XLSX==='undefined'){notify('No se pudo cargar el generador de Excel. Intenta recargar la página.','warn');return;}
    const wb=XLSX.utils.book_new();
    const add=(name,rows)=>{const ws=XLSX.utils.aoa_to_sheet(rows); ws['!cols']=rows[0].map((_,i)=>({wch:i===0?28:52})); XLSX.utils.book_append_sheet(wb,ws,name.slice(0,31));};

    add('Resumen',[
      ['GESTIÓN SST DE CONTRATISTAS - LA MOVIDA DE SST',''],
      ...reportBaseRows(c),
      ['Criticidad',criticalityResult(c).level],
      ['Puntaje precalificación',Math.round(prequalResult(c).score)+'%'],
      ['Decisión precalificación',prequalResult(c).decision],
      ['Cumplimiento preinicio',Math.round(prestartResult(c).compliance)+'%'],
      ['Decisión preinicio',prestartResult(c).decision],
      ['Desempeño final',Math.round(performanceResult(c).score)+'%'],
      ['Recomendación final',performanceResult(c).decision]
    ]);

    add('Criticidad',[
      ['Factor','Valor 1-5','Criterio'],
      ...CRIT_FACTORS.map(([k,n,d])=>[n,Number(c.criticality?.[k])||1,d]),
      ['TOTAL',criticalityResult(c).total,criticalityResult(c).level]
    ]);

    add('Precalificación',[
      ['Criterio','Peso %','Puntaje 0-4','Crítico'],
      ...PREQUAL.map(i=>[i.name,i.weight,Number(c.prequal?.scores?.[i.id])||0,i.critical?'Sí':'No']),
      ['RESULTADO','',Math.round(prequalResult(c).score)+'%',prequalResult(c).decision],
      ['Condición bloqueante: competencia crítica','',c.prequal?.blockers?.criticalCompetence?'Sí':'No',''],
      ['Condición bloqueante: incumplimiento legal','',c.prequal?.blockers?.legalGap?'Sí':'No',''],
      ['Condición bloqueante: control crítico','',c.prequal?.blockers?.criticalControl?'Sí':'No',''],
      ['Criterio / notas','',c.prequal?.notes||'','']
    ]);

    add('Preinicio',[
      ['Requisito','Crítico','Estado'],
      ...PRESTART.map(i=>[i.title,i.critical?'Sí':'No',({yes:'Sí',pending:'Pendiente',no:'No'})[c.prestart?.checks?.[i.id]]||'Sin revisar']),
      ['RESULTADO','',prestartResult(c).decision]
    ]);

    add('Interfaces',[
      ['Actividad / interfaz','Beneficiaria','Contratista','Criterio que prevalece','Brecha','Control / evidencia'],
      ...(c.prestart?.interfaces||[]).map(x=>[x.activity||'',x.client||'',x.contractor||'',x.primacy||'',x.gap||'',x.control||''])
    ]);

    add('Seguimiento',[
      ['Fecha','Tipo','Severidad','Hallazgo / decisión','Responsable','Fecha compromiso','Estado'],
      ...(c.monitoring||[]).map(x=>[x.date||'',x.type||'',x.severity||'',x.finding||'',x.owner||'',x.due||'',x.status||''])
    ]);

    add('Desempeño',[
      ['Dimensión','Peso %','Resultado %'],
      ...PERFORMANCE_DIMS.map(([k,n,w])=>[n,w,Number(c.performance?.[k])||0]),
      ['RESULTADO FINAL','',Math.round(performanceResult(c).score)+'%'],
      ['RECOMENDACIÓN','',performanceResult(c).decision],
      ['Fortalezas','',c.performance?.strengths||''],
      ['Brechas / condiciones futuras','',c.performance?.gaps||'']
    ]);

    XLSX.writeFile(wb,`Gestion_SST_Contratistas_${(c.title||'contrato').replace(/[^a-z0-9áéíóúñ]+/gi,'_').slice(0,50)}.xlsx`);
    notify('Excel del expediente generado.','success');
  }

  function generatePdfReport(){
    const c=activeContract();
    if(!c){notify('Selecciona un contrato para generar el PDF.','warn');return;}
    const co=contractorById(c.contractorId)||{}, cr=criticalityResult(c), pq=prequalResult(c), ps=prestartResult(c), pf=performanceResult(c);
    const pendingCritical=PRESTART.filter(i=>i.critical&&c.prestart?.checks?.[i.id]!=='yes').length;
    const openActions=(c.monitoring||[]).filter(x=>x.status!=='Cerrada').length;
    const blockers=Object.values(c.prequal?.blockers||{}).filter(Boolean).length+Object.values(c.performance?.blockers||{}).filter(Boolean).length;
    const generated=new Date().toLocaleDateString('es-VE',{day:'2-digit',month:'long',year:'numeric'});

    const stateBadge=(v)=>v==='yes'?'<span class="badge ok">Sí</span>':v==='no'?'<span class="badge no">No</span>':v==='pending'?'<span class="badge wait">Pendiente</span>':'<span class="badge na">Sin revisar</span>';
    const preRows=PREQUAL.map(i=>`<tr><td><b>${esc(i.name)}</b><span>${esc(i.desc)}</span></td><td class="ctr">${i.weight}%</td><td class="ctr score">${Number(c.prequal?.scores?.[i.id])||0}/4</td><td class="ctr">${i.critical?'<span class="badge wait">Crítico</span>':'—'}</td></tr>`).join('');
    const psCards=PRESTART.map(i=>`<div class="check"><div><b>${esc(i.title)}</b><p>${esc(i.desc)}</p></div><div class="check-side">${i.critical?'<small>CRÍTICO</small>':''}${stateBadge(c.prestart?.checks?.[i.id])}</div></div>`).join('');
    const interfaceCards=(c.prestart?.interfaces||[]).map((x,i)=>`<div class="interface"><div class="interface-title"><span>${i+1}</span><b>${esc(x.activity||'Interfaz')}</b></div><div class="interface-grid"><div><small>Beneficiaria</small><p>${esc(x.client||'—')}</p></div><div><small>Contratista</small><p>${esc(x.contractor||'—')}</p></div><div><small>Criterio que prevalece</small><p>${esc(x.primacy||'—')}</p></div><div><small>Brecha</small><p>${esc(x.gap||'—')}</p></div><div class="wide"><small>Control / evidencia acordada</small><p>${esc(x.control||'—')}</p></div></div></div>`).join('');
    const monitoringCards=(c.monitoring||[]).map(x=>`<div class="event"><div class="event-top"><b>${esc(x.type||'Registro')}</b><span class="badge ${x.status==='Cerrada'?'ok':x.severity==='Crítica'||x.severity==='Mayor'?'no':'wait'}">${esc(x.status||'')}</span></div><div class="event-meta">${fmtDate(x.date)} · ${esc(x.severity||'')} · Responsable: ${esc(x.owner||'—')} · Compromiso: ${fmtDate(x.due)}</div><p>${esc(x.finding||'—')}</p></div>`).join('');
    const dimCards=PERFORMANCE_DIMS.map(([k,n,w])=>`<div class="dim"><small>${esc(n)}</small><strong>${Number(c.performance?.[k])||0}%</strong><span>Peso ${w}%</span></div>`).join('');
    const riskRows=CRIT_FACTORS.map(([k,n,d])=>`<tr><td><b>${esc(n)}</b></td><td class="ctr score">${Number(c.criticality?.[k])||1}/5</td><td>${esc(d)}</td></tr>`).join('');

    const header=(compact=false)=>`<div class="report-head ${compact?'compact':''}"><img src="https://emergencias.movidasst.com/assets/sello-movida-r10.png?v=20260919-r10"><div><div class="brandline">LA MOVIDA DE SST · ACADEMIA MOVIDA SST</div><h1>${compact?'Gestión SST de Contratistas':'Informe de Gestión SST de Contratistas'}</h1><div class="tagline">De la Reacción a la Prevención · www.movidasst.com</div></div></div>`;
    const footer=(page)=>`<div class="report-foot"><span>Elaborado por David Linares Brea</span><span>Página ${page} · ${generated}</span></div>`;

    const html=`<!doctype html><html><head><meta charset="utf-8"><title>Informe SST contratista</title><style>
      @page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#334155;background:#eef2f6;font-size:10.5px;line-height:1.35;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .sheet{width:210mm;min-height:297mm;margin:0 auto;background:#fff;padding:11mm 12mm 10mm;display:flex;flex-direction:column;page-break-after:always}.sheet:last-child{page-break-after:auto}
      .body{flex:1}.report-head{display:flex;align-items:center;gap:12px;padding-bottom:9px;border-bottom:4px solid #007b85}.report-head img{width:62px;height:62px;object-fit:contain}.report-head.compact img{width:44px;height:44px}.brandline{color:#007b85;font-size:9px;font-weight:800;letter-spacing:.35px}.report-head h1{margin:1px 0 2px;color:#00205b;font-size:23px;line-height:1.05}.report-head.compact h1{font-size:18px}.tagline{color:#64748b;font-size:9.5px}
      .report-foot{margin-top:auto;padding-top:7px;border-top:1px solid #dbe4ea;display:flex;justify-content:space-between;color:#64748b;font-size:8.5px}
      h2{margin:14px 0 7px;color:#00205b;font-size:15px;line-height:1.1;display:flex;align-items:center;gap:8px}h2:after{content:"";height:2px;background:#d8ecee;flex:1}h3{margin:0;color:#00205b}
      .meta{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:7px;margin-top:10px}.meta .card{border:1px solid #dbe4ea;border-radius:9px;padding:8px;background:#fbfdfe}.meta .wide{grid-column:span 2}.label{display:block;color:#007b85;font-size:8.5px;font-weight:800;text-transform:uppercase;letter-spacing:.45px;margin-bottom:2px}.value{font-weight:700;color:#00205b;font-size:10.5px}
      .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.kpi{border:1px solid #dbe4ea;border-radius:11px;padding:9px;text-align:center;background:#fff}.kpi small{display:block;color:#64748b;font-size:8.5px}.kpi strong{display:block;color:#007b85;font-size:21px;line-height:1;margin:3px 0}.kpi span{font-size:8px;color:#334155}
      .decision{margin-top:8px;border-radius:9px;padding:10px 12px;background:#eef8e9;border-left:6px solid #70ad47;color:#00205b;font-weight:800;font-size:11.5px;display:flex;justify-content:space-between;align-items:center;gap:12px}.decision small{font-weight:600;color:#4d5c6a}
      .scope{border:1px solid #dbe4ea;border-radius:10px;padding:9px 11px;background:#fbfdfe}.scope p{margin:2px 0 7px}.chips{display:flex;gap:5px;flex-wrap:wrap}.chip{padding:4px 7px;border-radius:999px;background:#eaf6f7;color:#006a72;font-size:8.5px;font-weight:800}
      table{width:100%;border-collapse:collapse;table-layout:fixed}th{background:#00205b;color:#fff;text-align:left;padding:6px 7px;font-size:8.5px}td{border-bottom:1px solid #e5eaef;padding:6px 7px;vertical-align:top}td span{display:block;color:#64748b;font-size:8.3px;margin-top:2px}.ctr{text-align:center}.score{font-weight:800;color:#00205b}
      .drivers{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:8px}.driver{border-radius:9px;padding:9px;border:1px solid #dbe4ea;background:#fff}.driver small{display:block;color:#64748b;font-size:8px}.driver strong{display:block;font-size:18px;color:#00205b;margin:2px 0}.driver.warn{border-left:5px solid #ffb600}.driver.red{border-left:5px solid #c62828}.driver.green{border-left:5px solid #70ad47}
      .note{margin-top:8px;background:#fff8e1;border-left:5px solid #ffb600;border-radius:8px;padding:8px 10px}.note b{color:#00205b}
      .checks{display:grid;grid-template-columns:1fr 1fr;gap:6px}.check{border:1px solid #dbe4ea;border-radius:8px;padding:7px 8px;display:grid;grid-template-columns:1fr auto;gap:7px;align-items:start;break-inside:avoid}.check b{color:#00205b;font-size:9.2px}.check p{margin:2px 0 0;color:#64748b;font-size:8px;line-height:1.25}.check-side{text-align:right}.check-side small{display:block;color:#8a6200;font-weight:800;font-size:7px;margin-bottom:3px}
      .badge{display:inline-block;border-radius:999px;padding:3px 6px;font-size:7.8px;font-weight:800;white-space:nowrap}.badge.ok{background:#eaf6ef;color:#356824}.badge.wait{background:#fff3c8;color:#795b00}.badge.no{background:#fde9e7;color:#9d241e}.badge.na{background:#eef2f5;color:#64748b}
      .interface{border:1px solid #dbe4ea;border-radius:10px;padding:8px;margin-bottom:7px;break-inside:avoid}.interface-title{display:flex;align-items:center;gap:7px;margin-bottom:6px}.interface-title span{width:22px;height:22px;border-radius:7px;background:#007b85;color:#fff;display:grid;place-items:center;font-weight:800}.interface-title b{color:#00205b;font-size:10.5px}.interface-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px 9px}.interface-grid .wide{grid-column:1/-1}.interface-grid small{display:block;color:#007b85;font-weight:800;font-size:7.7px;text-transform:uppercase}.interface-grid p{margin:1px 0 0;font-size:8.8px}
      .events{display:grid;grid-template-columns:1fr 1fr;gap:7px}.event{border:1px solid #dbe4ea;border-radius:9px;padding:8px;break-inside:avoid}.event-top{display:flex;justify-content:space-between;gap:8px}.event-top b{color:#00205b}.event-meta{font-size:7.8px;color:#64748b;margin:3px 0 5px}.event p{margin:0;font-size:9px}
      .dims{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.dim{border:1px solid #dbe4ea;border-radius:9px;padding:8px;text-align:center}.dim small{display:block;min-height:24px;color:#64748b;font-size:7.7px}.dim strong{display:block;color:#007b85;font-size:18px}.dim span{font-size:7.5px;color:#64748b}
      .learning{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}.learning>div{border-radius:9px;padding:9px;border:1px solid #dbe4ea}.learning b{color:#00205b}.learning p{margin:3px 0 0}
      .signatures{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:15px}.sig{padding-top:18px;border-top:1px solid #64748b;text-align:center;font-size:8.5px;color:#64748b}
      @media print{body{background:#fff}.sheet{margin:0}.no-print{display:none!important}}
    </style></head><body>

    <section class="sheet"><div class="body">
      ${header(false)}
      <div class="meta">
        <div class="card wide"><span class="label">Contratista</span><div class="value">${esc(co.name||'—')} · ${esc(co.rif||'')}</div></div>
        <div class="card"><span class="label">Estado</span><div class="value">${esc(c.status||'—')}</div></div>
        <div class="card wide"><span class="label">Contrato</span><div class="value">${esc(c.title||'—')} · ${esc(c.site||'')}</div></div>
        <div class="card"><span class="label">Periodo</span><div class="value">${fmtDate(c.start)} a ${fmtDate(c.end)}</div></div>
      </div>
      <h2>Resumen ejecutivo</h2>
      <div class="summary">
        <div class="kpi"><small>Criticidad</small><strong>${cr.short}</strong><span>${esc(cr.level)}</span></div>
        <div class="kpi"><small>Precalificación</small><strong>${Math.round(pq.score)}%</strong><span>${esc(pq.decision)}</span></div>
        <div class="kpi"><small>Preinicio</small><strong>${Math.round(ps.compliance)}%</strong><span>${esc(ps.decision)}</span></div>
        <div class="kpi"><small>Desempeño</small><strong>${Math.round(pf.score)}%</strong><span>Evaluación de cierre</span></div>
      </div>
      <div class="decision"><span>${esc(pf.decision)}</span><small>Recomendación para futura contratación</small></div>
      <h2>Alcance y contexto</h2>
      <div class="scope"><span class="label">Alcance</span><p>${esc(c.scope||'—')}</p><span class="label">Tareas críticas</span><div class="chips">${(c.tasks||[]).length?(c.tasks||[]).map(x=>`<span class="chip">${esc(x)}</span>`).join(''):'<span class="chip">No registradas</span>'}</div></div>
      <h2>Clasificación de criticidad</h2>
      <table><thead><tr><th style="width:25%">Factor</th><th style="width:12%" class="ctr">Valor</th><th>Criterio</th></tr></thead><tbody>${riskRows}</tbody></table>
      <div class="drivers">
        <div class="driver warn"><small>Pendientes críticos de preinicio</small><strong>${pendingCritical}</strong><span>Requieren cierre antes de autorizar</span></div>
        <div class="driver red"><small>Acciones abiertas</small><strong>${openActions}</strong><span>Seguimiento pendiente</span></div>
        <div class="driver ${blockers?'red':'green'}"><small>Condiciones bloqueantes</small><strong>${blockers}</strong><span>${blockers?'Revisar antes de decidir':'Sin bloqueantes marcados'}</span></div>
      </div>
    </div>${footer(1)}</section>

    <section class="sheet"><div class="body">
      ${header(true)}
      <h2>Precalificación y habilitación</h2>
      <table><thead><tr><th style="width:61%">Criterio</th><th style="width:11%" class="ctr">Peso</th><th style="width:13%" class="ctr">Puntaje</th><th style="width:15%" class="ctr">Condición</th></tr></thead><tbody>${preRows}</tbody></table>
      <div class="decision"><span>${esc(pq.decision)}</span><small>Resultado ponderado: ${Math.round(pq.score)}%</small></div>
      <div class="note"><b>Criterio técnico:</b> ${esc(c.prequal?.notes||'Sin observaciones registradas.')}</div>
      <h2>Puerta de preinicio</h2>
      <div class="checks">${psCards}</div>
      <div class="decision" style="margin-top:10px"><span>${esc(ps.decision)}</span><small>${pendingCritical} requisito(s) crítico(s) sin cierre completo</small></div>
    </div>${footer(2)}</section>

    <section class="sheet"><div class="body">
      ${header(true)}
      <h2>Interfaces entre beneficiaria y contratista</h2>
      ${interfaceCards||'<div class="note">No se registraron interfaces para este contrato.</div>'}
      <h2>Seguimiento de ejecución</h2>
      <div class="events">${monitoringCards||'<div class="note">No se registraron verificaciones, hallazgos o acciones.</div>'}</div>
      <h2>Evaluación de desempeño y cierre</h2>
      <div class="dims">${dimCards}</div>
      <div class="decision"><span>${esc(pf.decision)}</span><small>Resultado consolidado: ${Math.round(pf.score)}%</small></div>
      <div class="learning"><div><b>Fortalezas</b><p>${esc(c.performance?.strengths||'No registradas.')}</p></div><div><b>Brechas / condiciones para futura contratación</b><p>${esc(c.performance?.gaps||'No registradas.')}</p></div></div>
      <div class="note"><b>Lectura técnica:</b> el resultado final no debe interpretarse solo por accidentabilidad. Debe considerarse la eficacia de controles, cierre de acciones, reincidencia, interfaces y cualquier condición bloqueante.</div>
      <div class="signatures"><div class="sig">Profesional SST evaluador · Nombre / firma / fecha</div><div class="sig">Responsable de Operaciones / Contrato · Nombre / firma / fecha</div></div>
    </div>${footer(3)}</section>
    <script>window.onload=()=>setTimeout(()=>window.print(),450)<\/script></body></html>`;
    const w=window.open('','_blank'); if(!w){notify('El navegador bloqueó la ventana del informe. Habilita ventanas emergentes e intenta nuevamente.','warn');return;} w.document.open();w.document.write(html);w.document.close();
  }

  // Global events
  $$('.nav-item').forEach(b=>b.onclick=()=>setView(b.dataset.view));
  picker.onchange=()=>{state.activeContractId=picker.value;save();render();};
  $('#quickContractBtn').onclick=openContractModal;
  $('#printBtn').onclick=generatePdfReport;
  $('#excelBtn').onclick=exportExcelReport;
  $('#menuToggle').onclick=()=>$('#sidebar').classList.toggle('open');
  $('#modalClose').onclick=closeModal;
  $('#modalBackdrop').onclick=e=>{if(e.target.id==='modalBackdrop')closeModal();};
  window.addEventListener('hashchange',()=>{currentView=location.hash.replace('#/','')||'dashboard';render();});
  window.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

  render();
