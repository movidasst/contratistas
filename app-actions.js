  function bindView(){
    $$('[data-go]').forEach(b=>b.onclick=()=>setView(b.dataset.go));
    $$('[data-open-contract]').forEach(b=>b.onclick=()=>{state.activeContractId=b.dataset.openContract;save();setView('contracts')});
    $$('[data-action]').forEach(b=>{ const a=b.dataset.action; if(a==='new-contract')b.onclick=()=>openContractModal(); if(a==='new-contractor')b.onclick=()=>openContractorModal(); if(a==='excel-report')b.onclick=exportExcelReport; if(a==='pdf-report')b.onclick=generatePdfReport; if(a==='save-contract-meta')b.onclick=saveContractMeta; if(a==='edit-tasks')b.onclick=editTasks; if(a==='save-pq-notes')b.onclick=savePqNotes; if(a==='add-interface')b.onclick=addInterface; if(a==='save-interfaces')b.onclick=saveInterfaces; if(a==='apply-prestart-status')b.onclick=applyPrestartStatus; if(a==='new-monitoring')b.onclick=()=>openMonitoringModal(); if(a==='save-performance-notes')b.onclick=savePerformanceNotes; if(a==='apply-close-status')b.onclick=applyCloseStatus; });
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
    const interfaces=(c.prestart?.interfaces||[]).map(x=>`<tr><td>${esc(x.activity||'')}</td><td>${esc(x.client||'')}</td><td>${esc(x.contractor||'')}</td><td>${esc(x.primacy||'')}</td><td>${esc(x.gap||'')}</td><td>${esc(x.control||'')}</td></tr>`).join('');
    const mon=(c.monitoring||[]).map(x=>`<tr><td>${fmtDate(x.date)}</td><td>${esc(x.type||'')}</td><td>${esc(x.severity||'')}</td><td>${esc(x.finding||'')}</td><td>${esc(x.owner||'')}</td><td>${fmtDate(x.due)}</td><td>${esc(x.status||'')}</td></tr>`).join('');
    const pre=PREQUAL.map(i=>`<tr><td>${esc(i.name)}</td><td>${i.weight}%</td><td>${Number(c.prequal?.scores?.[i.id])||0}/4</td><td>${i.critical?'Sí':'No'}</td></tr>`).join('');
    const pst=PRESTART.map(i=>`<tr><td>${esc(i.title)}</td><td>${i.critical?'Sí':'No'}</td><td>${({yes:'Sí',pending:'Pendiente',no:'No'})[c.prestart?.checks?.[i.id]]||'Sin revisar'}</td></tr>`).join('');
    const dims=PERFORMANCE_DIMS.map(([k,n,w])=>`<tr><td>${esc(n)}</td><td>${w}%</td><td>${Number(c.performance?.[k])||0}%</td></tr>`).join('');

    const html=`<!doctype html><html><head><meta charset="utf-8"><title>Informe SST contratista</title><style>
      @page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#334155;font-size:11px;margin:0}h1,h2,h3{color:#00205b}h1{font-size:24px;margin:0}h2{font-size:16px;margin:22px 0 8px;border-bottom:2px solid #007b85;padding-bottom:5px}h3{font-size:12px}.head{display:flex;gap:14px;align-items:center;border-bottom:5px solid #007b85;padding-bottom:12px}.logo{width:74px;height:74px;object-fit:contain}.sub{color:#64748b;margin-top:5px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:14px}.box{border:1px solid #dbe4ea;border-radius:8px;padding:8px}.box b{color:#00205b}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:12px 0}.kpi{border:1px solid #dbe4ea;border-radius:9px;padding:9px;text-align:center}.kpi strong{display:block;font-size:19px;color:#007b85}.decision{background:#eef8e9;border-left:5px solid #70ad47;padding:10px;border-radius:7px;font-weight:bold;color:#00205b}table{width:100%;border-collapse:collapse;margin-top:6px}th{background:#00205b;color:#fff;text-align:left;padding:6px;font-size:9px}td{border-bottom:1px solid #e5eaef;padding:6px;vertical-align:top}.note{background:#fff8e1;border-left:4px solid #ffb600;padding:8px;border-radius:6px;margin-top:8px}.foot{margin-top:24px;border-top:1px solid #dbe4ea;padding-top:8px;color:#64748b;font-size:9px;text-align:center}.page{break-inside:avoid}.break{break-before:page}
    </style></head><body>
    <div class="head"><img class="logo" src="https://emergencias.movidasst.com/assets/sello-movida-r10.png?v=20260919-r10"><div><div style="color:#007b85;font-weight:bold">LA MOVIDA DE SST · ACADEMIA MOVIDA SST</div><h1>Informe de Gestión SST de Contratistas</h1><div class="sub">De la Reacción a la Prevención · www.movidasst.com</div></div></div>
    <div class="meta"><div class="box"><b>Contratista</b><br>${esc(co.name||'—')}<br>${esc(co.rif||'')}</div><div class="box"><b>Contrato</b><br>${esc(c.title||'—')}<br>${esc(c.site||'')}</div><div class="box"><b>Periodo</b><br>${fmtDate(c.start)} a ${fmtDate(c.end)}</div><div class="box"><b>Estado</b><br>${esc(c.status||'')}</div></div>
    <h2>Resumen ejecutivo</h2><div class="kpis"><div class="kpi"><span>Criticidad</span><strong>${cr.short}</strong><small>${esc(cr.level)}</small></div><div class="kpi"><span>Precalificación</span><strong>${Math.round(pq.score)}%</strong><small>${esc(pq.decision)}</small></div><div class="kpi"><span>Preinicio</span><strong>${Math.round(ps.compliance)}%</strong><small>${esc(ps.decision)}</small></div><div class="kpi"><span>Desempeño</span><strong>${Math.round(pf.score)}%</strong><small>Cierre</small></div></div><div class="decision">${esc(pf.decision)}</div>
    <h2>Alcance y contexto</h2><div class="box"><b>Alcance</b><br>${esc(c.scope||'—')}<br><br><b>Tareas críticas</b><br>${esc((c.tasks||[]).join(', ')||'No registradas')}</div>
    <h2>Clasificación de criticidad</h2><table><thead><tr><th>Factor</th><th>Valor</th><th>Criterio</th></tr></thead><tbody>${CRIT_FACTORS.map(([k,n,d])=>`<tr><td>${esc(n)}</td><td>${Number(c.criticality?.[k])||1}/5</td><td>${esc(d)}</td></tr>`).join('')}</tbody></table>
    <div class="break"></div><h2>Precalificación y habilitación</h2><table><thead><tr><th>Criterio</th><th>Peso</th><th>Puntaje</th><th>Crítico</th></tr></thead><tbody>${pre}</tbody></table><div class="note"><b>Criterio técnico:</b> ${esc(c.prequal?.notes||'Sin observaciones registradas.')}</div>
    <h2>Puerta de preinicio</h2><table><thead><tr><th>Requisito</th><th>Crítico</th><th>Estado</th></tr></thead><tbody>${pst}</tbody></table>
    <h2>Interfaces</h2><table><thead><tr><th>Actividad</th><th>Beneficiaria</th><th>Contratista</th><th>Primacía</th><th>Brecha</th><th>Control</th></tr></thead><tbody>${interfaces||'<tr><td colspan="6">Sin interfaces registradas.</td></tr>'}</tbody></table>
    <div class="break"></div><h2>Seguimiento de ejecución</h2><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Severidad</th><th>Hallazgo / decisión</th><th>Responsable</th><th>Compromiso</th><th>Estado</th></tr></thead><tbody>${mon||'<tr><td colspan="7">Sin registros de seguimiento.</td></tr>'}</tbody></table>
    <h2>Evaluación de desempeño y cierre</h2><table><thead><tr><th>Dimensión</th><th>Peso</th><th>Resultado</th></tr></thead><tbody>${dims}</tbody></table><div class="box" style="margin-top:10px"><b>Fortalezas</b><br>${esc(c.performance?.strengths||'—')}<br><br><b>Brechas / condiciones para futura contratación</b><br>${esc(c.performance?.gaps||'—')}</div>
    <div class="foot">Elaborado por David Linares Brea · Academia Movida SST · De la Reacción a la Prevención · www.movidasst.com</div>
    <script>window.onload=()=>setTimeout(()=>window.print(),350)<\/script></body></html>`;
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
