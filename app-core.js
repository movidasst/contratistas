  'use strict';

  const STORAGE_KEY = 'movidasst_contratistas_v1';
  const VIEW_TITLES = {
    dashboard:'Dashboard', contractors:'Contratistas', contracts:'Contratos', criticality:'Clasificación de criticidad',
    prequal:'Precalificación y habilitación', prestart:'Preinicio e interfaces', monitoring:'Seguimiento de ejecución',
    performance:'Desempeño y cierre', references:'Referencias y criterio técnico'
  };
  const STAGES = ['Borrador','En evaluación','Adjudicado','Pendiente de habilitación','Habilitado','En ejecución','En cierre','Cerrado'];
  const GUIDED_STEPS = [
    {n:1,view:'contractors',name:'Contratista',goal:'Identificar a la empresa que ejecutará el trabajo.'},
    {n:2,view:'contracts',name:'Contrato y alcance',goal:'Definir qué hará, dónde, cuándo y con qué interfaces.'},
    {n:3,view:'criticality',name:'Criticidad',goal:'Determinar la intensidad de control que necesita el contrato.'},
    {n:4,view:'prequal',name:'Precalificación',goal:'Verificar capacidad real y condiciones bloqueantes.'},
    {n:5,view:'prestart',name:'Preinicio',goal:'Comprobar que todo está listo antes de autorizar el trabajo.'},
    {n:6,view:'monitoring',name:'Seguimiento',goal:'Controlar cambios, hallazgos, acciones y eficacia de controles.'},
    {n:7,view:'performance',name:'Cierre',goal:'Evaluar desempeño y decidir sobre futuras contrataciones.'}
  ];

  const CRIT_FACTORS = [
    ['exposure','Exposición','Frecuencia y cantidad de personas expuestas al alcance contratado.'],
    ['severity','Severidad potencial','Consecuencia razonablemente posible si fallan los controles.'],
    ['complexity','Complejidad','Diversidad técnica, cantidad de tareas y dificultad operacional.'],
    ['interfaces','Interfaces','Interacción con procesos existentes, personal propio u otras contratistas.'],
    ['subcontracting','Subcontratación','Nivel de terceros, cadenas de control y coordinación adicional.']
  ];

  const PREQUAL = [
    {id:'legal',name:'Cumplimiento legal y organización SST',desc:'Estructura, responsabilidades, Servicio SST, participación y evidencias aplicables.',weight:15,critical:true},
    {id:'experience',name:'Experiencia en trabajos comparables',desc:'Experiencia demostrable en alcances y contextos de riesgo similares.',weight:8,critical:false},
    {id:'risk',name:'Identificación de peligros y gestión del riesgo',desc:'Métodos, evaluación, controles y revisión ante cambios.',weight:14,critical:true},
    {id:'competence',name:'Competencia del personal',desc:'Formación, experiencia, certificaciones y supervisión según el alcance.',weight:12,critical:true},
    {id:'equipment',name:'Equipos, herramientas y mantenimiento',desc:'Aptitud, certificación, inspección y mantenimiento de equipos.',weight:10,critical:true},
    {id:'procedures',name:'Procedimientos y controles operacionales',desc:'Procedimientos aplicables, permisos y prácticas de trabajo seguras.',weight:12,critical:true},
    {id:'emergency',name:'Emergencias y continuidad',desc:'Plan, recursos, coordinación y respuesta compatible con la instalación.',weight:8,critical:false},
    {id:'incidents',name:'Incidentes, aprendizaje y acciones',desc:'Investigación, seguimiento, lecciones aprendidas y control de reincidencia.',weight:8,critical:false},
    {id:'assurance',name:'Inspección, auditoría y aseguramiento',desc:'Verificación de implementación, seguimiento y mejora.',weight:8,critical:false},
    {id:'subcontractors',name:'Gestión de subcontratistas',desc:'Selección, requisitos, interfaces y control de empresas subcontratadas.',weight:5,critical:false}
  ];

  const PRESTART = [
    {id:'scope',title:'Alcance y límites del trabajo confirmados',desc:'Las partes comprenden qué se hará, dónde, con qué restricciones y exclusiones.',critical:true},
    {id:'plan',title:'PSST / plan específico del contrato revisado',desc:'La documentación fue adaptada al centro de trabajo y al alcance.',critical:true},
    {id:'risk',title:'Riesgos e interfaces evaluados conjuntamente',desc:'Incluye trabajos simultáneos, procesos peligrosos y cambios previsibles.',critical:true},
    {id:'people',title:'Personal y competencias verificados',desc:'Roles, supervisión, formación y certificaciones aplicables.',critical:true},
    {id:'equipment',title:'Equipos, herramientas y certificados verificados',desc:'Condición, mantenimiento, inspección y documentación según corresponda.',critical:true},
    {id:'permits',title:'Permisos y autorizaciones aplicables definidos',desc:'Está claro qué permisos se requieren y quién los emite/acepta.',critical:true},
    {id:'procedures',title:'Procedimientos y controles críticos acordados',desc:'Se resolvieron diferencias entre procedimientos de las partes.',critical:true},
    {id:'emergency',title:'Respuesta ante emergencias coordinada',desc:'Contactos, rutas, recursos, asistencia médica y roles conocidos.',critical:true},
    {id:'induction',title:'Inducción y comunicación preparadas',desc:'Personal y subcontratistas recibirán la información del contrato y del sitio.',critical:false},
    {id:'subcontractor',title:'Subcontratistas declarados y controlados',desc:'Se conocen y cumplen requisitos equivalentes cuando aplique.',critical:false},
    {id:'monitoring',title:'Plan de verificación y seguimiento definido',desc:'Frecuencias, responsables, reuniones e indicadores establecidos.',critical:false},
    {id:'actions',title:'Acciones previas al inicio cerradas',desc:'No quedan pendientes críticos sin responsable y fecha de cierre.',critical:true}
  ];

  const PERFORMANCE_DIMS = [
    ['management','Gestión y cumplimiento',20],['operations','Control operacional',30],['actions','Desviaciones y acciones',20],
    ['learning','Participación y aprendizaje',15],['results','Resultados y riesgo',15]
  ];

  const seed = () => ({
    version:1,
    settings:{mode:'trabajo'},
    contractors:[],
    contracts:[],
    activeContractId:null
  });

  const exampleData = () => ({
    contractor:{id:'co-demo',name:'Servicios Industriales Andinos, C.A.',rif:'J-40123456-7',contact:'María Rodríguez',phone:'0414-5550001',email:'sst@andinos.example',status:'En evaluación',notes:'Caso de práctica del curso Gestión SST de Contratistas.'},
    contract:{
      id:'ct-demo',contractorId:'co-demo',title:'Mantenimiento mayor de tanque TK-210',site:'Complejo industrial - Área de almacenamiento',
      start:'2026-10-19',end:'2026-12-02',workers:42,subcontractors:2,status:'Pendiente de habilitación',
      scope:'Mantenimiento interno y externo de tanque, reparación localizada, preparación superficial y pruebas.',
      tasks:['Espacios confinados','Trabajo en caliente','Izamiento de cargas','Control de fuentes de energía'],
      criticality:{exposure:4,severity:5,complexity:4,interfaces:5,subcontracting:3},
      prequal:{scores:{legal:3,experience:4,risk:3,competence:2,equipment:3,procedures:3,emergency:3,incidents:2,assurance:2,subcontractors:2},blockers:{criticalCompetence:false,legalGap:false,criticalControl:false},notes:'Validar competencia específica del supervisor de espacios confinados.'},
      prestart:{checks:{scope:'yes',plan:'yes',risk:'yes',people:'pending',equipment:'yes',permits:'yes',procedures:'pending',emergency:'yes',induction:'yes',subcontractor:'pending',monitoring:'yes',actions:'pending'},interfaces:[
        {activity:'Aislamiento de energías',client:'Custodio autoriza y entrega equipo',contractor:'Aplica procedimiento y verifica condición segura',primacy:'Procedimiento de la beneficiaria',gap:'Definir prueba de energía cero y devolución',control:'Acta de aislamiento + verificación conjunta'},
        {activity:'Ingreso a espacio confinado',client:'Control de atmósfera / permiso del sitio',contractor:'Equipo de ingreso, vigía y rescate',primacy:'Requisito más restrictivo acordado',gap:'Integrar rescate con emergencia de planta',control:'Permiso + plan de rescate + prueba previa'}
      ]},
      monitoring:[
        {id:'m-demo-1',date:'2026-10-20',type:'Inspección',severity:'Menor',finding:'Orden y delimitación del área mejorables.',owner:'Supervisor contratista',due:'2026-10-21',status:'Cerrada'},
        {id:'m-demo-2',date:'2026-10-21',type:'Verificación',severity:'Mayor',finding:'Certificado del equipo de medición atmosférica próximo a vencer.',owner:'Coordinador SST contratista',due:'2026-10-22',status:'En curso'}
      ],
      performance:{management:82,operations:78,actions:70,learning:75,results:88,blockers:{criticalLegal:false,criticalControl:false,overdueCritical:false,highPotential:false},strengths:'Buena respuesta operativa y participación de supervisión.',gaps:'Mejorar seguimiento documental y velocidad de cierre de acciones.'}
    }
  });

  let state = load();
  let currentView = location.hash.replace('#/','') || 'dashboard';

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const view = $('#view');
  const title = $('#pageTitle');
  const picker = $('#activeContractSelect');
  const alertBox = $('#appAlert');

  function load(){
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : seed(); }
    catch(e){ return seed(); }
  }
  function save(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }
  function uid(prefix){ return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`; }
  function esc(v=''){ return String(v).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m])); }
  function fmtDate(v){ if(!v) return '—'; const d=new Date(v+'T00:00:00'); return Number.isNaN(d.getTime())?v:d.toLocaleDateString('es-VE',{day:'2-digit',month:'short',year:'numeric'}); }
  function activeContract(){ return state.contracts.find(x=>x.id===state.activeContractId) || state.contracts[0] || null; }
  function contractorById(id){ return state.contractors.find(x=>x.id===id); }
  function pct(v){ return Math.round(v || 0); }
  function tag(text,type='gray'){ return `<span class="tag ${type}">${esc(text)}</span>`; }
  function statusTag(status){
    if(['Habilitado','En ejecución','Cerrado','Apta'].includes(status)) return tag(status,'green');
    if(['No habilitada','No recomendada'].includes(status)) return tag(status,'red');
    if(['Pendiente de habilitación','En evaluación','Adjudicado','En cierre'].includes(status)) return tag(status,'yellow');
    return tag(status,'navy');
  }
  function notify(msg,type='info'){
    alertBox.textContent=msg; alertBox.className=`app-alert show ${type}`;
    clearTimeout(notify.t); notify.t=setTimeout(()=>alertBox.className='app-alert',3500);
  }
  function selectHtml(options,value){ return options.map(o=>`<option value="${esc(o)}" ${o===value?'selected':''}>${esc(o)}</option>`).join(''); }

  function criticalityResult(c){
    const x=c?.criticality||{}; const total=CRIT_FACTORS.reduce((a,[k])=>a+(Number(x[k])||1),0);
    const level=total<=10?'Nivel 1 · simplificado':total<=17?'Nivel 2 · estándar':'Nivel 3 · reforzado';
    return {total,level,short:total<=10?'N1':total<=17?'N2':'N3'};
  }
  function prequalResult(c){
    const s=c?.prequal?.scores||{};
    const score=PREQUAL.reduce((a,i)=>a+((Number(s[i.id])||0)/4*i.weight),0);
    const criticalFail=PREQUAL.some(i=>i.critical && Number(s[i.id])<=1);
    const blockers=c?.prequal?.blockers||{}; const blocker=criticalFail||Object.values(blockers).some(Boolean);
    let decision= blocker?'NO HABILITADA':score>=85?'HABILITADA':score>=70?'HABILITADA CON CONDICIONES':'NO HABILITADA';
    return {score,decision,blocker,criticalFail};
  }
  function prestartResult(c){
    const checks=c?.prestart?.checks||{}; const answered=PRESTART.filter(i=>checks[i.id]).length;
    const yes=PRESTART.filter(i=>checks[i.id]==='yes').length; const criticalNo=PRESTART.some(i=>i.critical&&checks[i.id]==='no');
    const criticalPending=PRESTART.some(i=>i.critical&&checks[i.id]!=='yes');
    const coverage=answered/PRESTART.length*100, compliance=yes/PRESTART.length*100;
    let decision=criticalNo?'NO AUTORIZAR':criticalPending?'PENDIENTE DE CIERRE':compliance>=80?'AUTORIZAR INICIO':'PENDIENTE DE CIERRE';
    return {coverage,compliance,decision,criticalNo,criticalPending};
  }
  function performanceResult(c){
    const p=c?.performance||{}; const score=PERFORMANCE_DIMS.reduce((a,[k,,w])=>a+(Number(p[k])||0)*w/100,0);
    const blocker=Object.values(p.blockers||{}).some(Boolean);
    let decision=blocker?'NO RECOMENDADA':score>=90?'RECOMENDADA':score>=80?'RECOMENDADA CON OPORTUNIDADES DE MEJORA':score>=70?'CONDICIONADA A PLAN DE MEJORA':'NO RECOMENDADA';
    return {score,decision,blocker};
  }

  function refreshPicker(){
    picker.innerHTML=state.contracts.length?state.contracts.map(c=>`<option value="${c.id}" ${c.id===state.activeContractId?'selected':''}>${esc(c.title)}</option>`).join(''):'<option value="">Sin contratos</option>';
  }
  function setView(v){ currentView=v; location.hash=`/${v}`; render(); }
  function render(){
    if(!VIEW_TITLES[currentView]) currentView='dashboard';
    title.textContent=VIEW_TITLES[currentView];
    $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===currentView));
    refreshPicker();
    const fn={dashboard:renderDashboard,contractors:renderContractors,contracts:renderContracts,criticality:renderCriticality,prequal:renderPrequal,prestart:renderPrestart,monitoring:renderMonitoring,performance:renderPerformance,references:renderReferences}[currentView];
    view.innerHTML=fn(); bindView();
    $('#sidebar').classList.remove('open');
  }

  function lifecycle(c){
    const idx=Math.max(0,STAGES.indexOf(c?.status||'Borrador'));
    return `<div class="timeline">${STAGES.map((s,i)=>`<div class="timeline-step"><div class="node ${i<idx?'done':i===idx?'current':''}">${i<idx?'✓':i+1}</div><span class="label">${esc(s)}</span></div>`).join('')}</div>`;
  }

  function workflowStatus(c){
    if(!c) return GUIDED_STEPS.map((x,i)=>({...x,state:i===0?'current':'locked'}));
    const co=contractorById(c.contractorId);
    const crit=Object.values(c.criticality||{}).some(v=>Number(v)>1);
    const pq=Object.values(c.prequal?.scores||{}).some(v=>Number(v)>0);
    const ps=PRESTART.filter(i=>c.prestart?.checks?.[i.id]).length>=Math.ceil(PRESTART.length*.7);
    const mon=(c.monitoring||[]).length>0;
    const perf=PERFORMANCE_DIMS.some(([k])=>Number(c.performance?.[k])>0);
    const done=[!!co,!!(c.title&&c.scope),crit,pq,ps,mon,perf];
    let firstPending=done.findIndex(v=>!v); if(firstPending<0) firstPending=done.length-1;
    return GUIDED_STEPS.map((x,i)=>({...x,state:done[i]?'done':i===firstPending?'current':'locked'}));
  }
  function nextGuidedView(current){
    const i=GUIDED_STEPS.findIndex(x=>x.view===current);
    return i>=0&&i<GUIDED_STEPS.length-1?GUIDED_STEPS[i+1]:null;
  }
  function prevGuidedView(current){
    const i=GUIDED_STEPS.findIndex(x=>x.view===current);
    return i>0?GUIDED_STEPS[i-1]:null;
  }
  function guideStrip(viewName,what,output){
    const step=GUIDED_STEPS.find(x=>x.view===viewName);
    if(!step) return '';
    return `<div class="guide-strip"><div class="guide-step"><div class="guide-num">${step.n}</div><div><h3>${esc(step.name)}</h3><p>${esc(step.goal)}</p></div></div><div class="guide-box"><b>Qué debes hacer</b><span>${esc(what)}</span></div><div class="guide-box"><b>Qué obtienes</b><span>${esc(output)}</span></div></div>`;
  }
  function stepNav(viewName){
    const prev=prevGuidedView(viewName), next=nextGuidedView(viewName);
    return `<div class="step-nav"><div>${prev?`<button class="btn btn-ghost" data-go="${prev.view}">← ${esc(prev.name)}</button>`:''}</div><div>${next?`<button class="btn btn-primary" data-go="${next.view}"><span class="next-copy"><small>Siguiente paso</small><strong>${esc(next.name)} →</strong></span></button>`:'<button class="btn btn-green" data-action="pdf-report">Generar informe PDF</button>'}</div></div>`;
  }

  function renderDashboard(){
    const c=activeContract(); const openActions=state.contracts.reduce((n,x)=>n+(x.monitoring||[]).filter(a=>a.status!=='Cerrada').length,0);
    const route=workflowStatus(c), completed=route.filter(x=>x.state==='done').length;
    const current=route.find(x=>x.state==='current')||route[route.length-1];
    return `<div class="hero-panel"><div class="kicker">Ruta guiada de gestión</div><h2>Gestiona un contrato paso a paso</h2><p>No necesitas conocer la aplicación de memoria. Sigue la ruta del 1 al 7: la herramienta te indica qué debes hacer, qué decisión debes tomar y qué producto obtendrás.</p><div class="hero-actions">${c?`<button class="btn btn-yellow" data-go="${current.view}">Continuar: ${esc(current.name)}</button>`:'<button class="btn btn-yellow" data-go="contractors">Comenzar por la contratista</button>'}<button class="btn btn-green" data-action="excel-report">Descargar expediente en Excel</button><button class="btn btn-ghost" data-action="pdf-report">Generar informe PDF</button></div></div>
    <div class="section panel"><div class="section-head"><div><h3>Tu ruta de trabajo</h3><p>Los pasos verdes ya tienen información; el borde turquesa indica dónde continuar.</p></div><div class="workflow-progress"><strong>${completed}/7</strong><div class="progress" style="width:180px"><span style="width:${completed/7*100}%"></span></div></div></div><div class="route-grid">${route.map(x=>`<div class="route-card ${x.state}"><div class="route-no">${x.state==='done'?'✓':x.n}</div><h4>${esc(x.name)}</h4><p>${esc(x.goal)}</p><div class="route-state">${x.state==='done'?'Completado':x.state==='current'?'Continuar aquí':'Después'}</div><button data-go="${x.view}" aria-label="Ir a ${esc(x.name)}"></button></div>`).join('')}</div></div>
    ${c?`<div class="section grid grid-2"><div class="panel"><div class="section-head"><div><h3>Contrato activo</h3><p>Resumen para saber dónde estás.</p></div>${statusTag(c.status)}</div><h3 class="mt-0 text-navy">${esc(c.title)}</h3><p class="muted small">${esc(contractorById(c.contractorId)?.name||'')} · ${esc(c.site||'')}</p><div class="grid grid-3 mt-16"><div class="result-card"><div class="result-label">Criticidad</div><div class="result-value">${criticalityResult(c).short}</div><div class="small muted">${criticalityResult(c).level}</div></div><div class="result-card"><div class="result-label">Precalificación</div><div class="result-value">${pct(prequalResult(c).score)}%</div><div class="small muted">${prequalResult(c).decision}</div></div><div class="result-card"><div class="result-label">Preinicio</div><div class="result-value">${pct(prestartResult(c).compliance)}%</div><div class="small muted">${prestartResult(c).decision}</div></div></div></div><div class="panel"><div class="section-head"><div><h3>Lo que requiere atención</h3><p>Solo alertas que pueden cambiar una decisión.</p></div><span class="tag yellow">${openActions} acción(es) abierta(s)</span></div>${renderAlerts()}</div></div>`:'<div class="section didactic-note"><div class="icon">1</div><div><b>Empieza registrando a la empresa contratista.</b><p>Luego crearás el contrato y la aplicación te llevará por criticidad, precalificación, preinicio, seguimiento y cierre.</p></div></div>'}
    <div class="section grid grid-2"><div class="product-card"><h3>Producto final del expediente</h3><p>Cuando avances, podrás entregar o archivar un Excel con todas las hojas del proceso y un informe PDF diseñado para lectura ejecutiva y revisión técnica.</p><div class="product-actions"><button class="btn btn-green" data-action="excel-report">Descargar Excel</button><button class="btn btn-navy" data-action="pdf-report">Generar PDF</button></div></div><div class="panel"><div class="section-head"><div><h3>Caso de práctica</h3><p>Úsalo solo cuando quieras explorar la aplicación sin cargar datos propios.</p></div></div><div class="didactic-note"><div class="icon">🎓</div><div><b>Ejemplo separado de tus datos reales.</b><p>Puedes cargarlo para practicar y eliminarlo después sin borrar otros contratos o contratistas.</p></div></div><div class="product-actions mt-12"><button class="btn btn-primary" data-action="load-example">Cargar caso de ejemplo</button><button class="btn btn-danger" data-action="delete-example">Eliminar caso de ejemplo</button></div></div></div>`;
  }

  function renderAlerts(){
    const items=[];
    state.contracts.forEach(c=>{
      const pr=prequalResult(c), ps=prestartResult(c), pf=performanceResult(c);
      if(pr.blocker) items.push({type:'danger',text:`${c.title}: precalificación con condición bloqueante o criterio crítico deficiente.`});
      if(ps.criticalPending && ['Adjudicado','Pendiente de habilitación'].includes(c.status)) items.push({type:'warn',text:`${c.title}: quedan pendientes críticos antes de autorizar el inicio.`});
      const overdue=(c.monitoring||[]).filter(a=>a.status!=='Cerrada'&&a.due&&new Date(a.due+'T23:59:59')<new Date()).length;
      if(overdue) items.push({type:'danger',text:`${c.title}: ${overdue} acción(es) vencida(s).`});
      if(pf.blocker) items.push({type:'danger',text:`${c.title}: la evaluación final tiene una condición bloqueante.`});
    });
    if(!items.length) return '<div class="callout success">No hay alertas críticas registradas en este momento.</div>';
    return items.slice(0,6).map(x=>`<div class="callout ${x.type} mt-8">${esc(x.text)}</div>`).join('');
  }

  function contractsTable(rows){
    if(!rows.length) return '<div class="empty"><strong>Sin contratos</strong>Agrega el primer contrato para iniciar.</div>';
    return `<div class="table-wrap"><table class="table"><thead><tr><th>Contrato</th><th>Contratista</th><th>Criticidad</th><th>Estado</th><th>Inicio</th><th></th></tr></thead><tbody>${rows.map(c=>`<tr><td><strong class="text-navy">${esc(c.title)}</strong><div class="small muted">${esc(c.site||'')}</div></td><td>${esc(contractorById(c.contractorId)?.name||'—')}</td><td>${tag(criticalityResult(c).short,criticalityResult(c).short==='N3'?'yellow':'teal')}</td><td>${statusTag(c.status)}</td><td>${fmtDate(c.start)}</td><td class="right"><button class="btn btn-ghost btn-sm" data-open-contract="${c.id}">Abrir</button></td></tr>`).join('')}</tbody></table></div>`;
  }
