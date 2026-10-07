  'use strict';

  const STORAGE_KEY = 'movidasst_contratistas_v1';
  const VIEW_TITLES = {
    dashboard:'Dashboard', contractors:'Contratistas', contracts:'Contratos', criticality:'Clasificación de criticidad',
    prequal:'Precalificación y habilitación', prestart:'Preinicio e interfaces', monitoring:'Seguimiento de ejecución',
    performance:'Desempeño y cierre', references:'Referencias y criterio técnico'
  };
  const STAGES = ['Borrador','En evaluación','Adjudicado','Pendiente de habilitación','Habilitado','En ejecución','En cierre','Cerrado'];

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
    settings:{mode:'practica'},
    contractors:[
      {id:'co-1',name:'Servicios Industriales Andinos, C.A.',rif:'J-40123456-7',contact:'María Rodríguez',phone:'0414-5550001',email:'sst@andinos.example',status:'En evaluación',notes:'Caso de práctica del curso.'},
      {id:'co-2',name:'Mantenimiento Integral del Centro, C.A.',rif:'J-30987654-2',contact:'Luis Pérez',phone:'0412-5550110',email:'operaciones@mic.example',status:'Apta',notes:''}
    ],
    contracts:[{
      id:'ct-1',contractorId:'co-1',title:'Mantenimiento mayor de tanque TK-210',site:'Complejo industrial - Área de almacenamiento',
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
        {id:'m-1',date:'2026-10-20',type:'Inspección',severity:'Menor',finding:'Orden y delimitación del área mejorables.',owner:'Supervisor contratista',due:'2026-10-21',status:'Cerrada'},
        {id:'m-2',date:'2026-10-21',type:'Verificación',severity:'Mayor',finding:'Certificado del equipo de medición atmosférica próximo a vencer.',owner:'Coordinador SST contratista',due:'2026-10-22',status:'En curso'}
      ],
      performance:{management:82,operations:78,actions:70,learning:75,results:88,blockers:{criticalLegal:false,criticalControl:false,overdueCritical:false,highPotential:false},strengths:'Buena respuesta operativa y participación de supervisión.',gaps:'Mejorar seguimiento documental y velocidad de cierre de acciones.'}
    }],
    activeContractId:'ct-1'
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

  function renderDashboard(){
    const c=activeContract(); const openActions=state.contracts.reduce((n,x)=>n+(x.monitoring||[]).filter(a=>a.status!=='Cerrada').length,0);
    const enabled=state.contracts.filter(x=>['Habilitado','En ejecución','En cierre','Cerrado'].includes(x.status)).length;
    const high=state.contracts.filter(x=>criticalityResult(x).short==='N3').length;
    return `<div class="hero-panel"><div class="kicker">Ciclo de gestión de contratistas</div><h2>Decisiones con evidencia, no solo con documentos</h2><p>Integra requisitos legales, criticidad, capacidad del contratista, puerta de preinicio, seguimiento y evaluación final. La V1 guarda la información en este navegador; la conexión multiusuario con Supabase será la siguiente capa.</p><div class="hero-actions"><button class="btn btn-yellow" data-go="criticality">Evaluar criticidad</button><button class="btn btn-green" data-go="prestart">Revisar preinicio</button><button class="btn btn-ghost" data-action="export">Exportar respaldo JSON</button></div></div>
    <div class="section grid grid-4"><div class="metric"><div class="k">Contratistas</div><div class="v">${state.contractors.length}</div><div class="sub">Empresas registradas</div></div><div class="metric"><div class="k">Contratos</div><div class="v">${state.contracts.length}</div><div class="sub">En todo el ciclo</div></div><div class="metric"><div class="k">Habilitados / ejecución</div><div class="v">${enabled}</div><div class="sub">Con puerta superada</div></div><div class="metric alert-metric"><div class="k">Acciones abiertas</div><div class="v">${openActions}</div><div class="sub">Requieren seguimiento</div></div></div>
    <div class="section grid grid-2"><div class="panel"><div class="section-head"><div><h3>Contrato activo</h3><p>Estado y controles principales.</p></div>${c?statusTag(c.status):''}</div>${c?`<h3 class="mt-0 text-navy">${esc(c.title)}</h3><p class="muted small">${esc(contractorById(c.contractorId)?.name||'')} · ${esc(c.site||'')}</p>${lifecycle(c)}<div class="grid grid-3 mt-16"><div class="result-card"><div class="result-label">Criticidad</div><div class="result-value">${criticalityResult(c).short}</div><div class="small muted">${criticalityResult(c).level}</div></div><div class="result-card"><div class="result-label">Precalificación</div><div class="result-value">${pct(prequalResult(c).score)}%</div><div class="small muted">${prequalResult(c).decision}</div></div><div class="result-card"><div class="result-label">Preinicio</div><div class="result-value">${pct(prestartResult(c).compliance)}%</div><div class="small muted">${prestartResult(c).decision}</div></div></div>`:'<div class="empty"><strong>No hay contrato activo</strong>Crea un contrato para iniciar el ciclo.</div>'}</div>
    <div class="panel"><div class="section-head"><div><h3>Alertas de gestión</h3><p>Elementos que pueden cambiar la decisión.</p></div>${tag(`${high} contrato(s) N3`,'yellow')}</div>${renderAlerts()}</div></div>
    <div class="section panel"><div class="section-head"><div><h3>Contratos recientes</h3><p>Acceso rápido al expediente SST.</p></div><button class="btn btn-primary btn-sm" data-action="new-contract">+ Nuevo contrato</button></div>${contractsTable(state.contracts.slice(0,8))}</div>`;
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
