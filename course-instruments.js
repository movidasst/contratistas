(() => {
  'use strict';

  const LEGAL_CHECKS = [
    { id:'lopcymat', label:'LOPCYMAT: obligaciones de beneficiaria, contratista y subcontratistas', ref:'LOPCYMAT · requisitos según el supuesto aplicable' },
    { id:'reglamento', label:'Reglamento Parcial de la LOPCYMAT: organización, participación y coordinación', ref:'Reglamento Parcial de la LOPCYMAT' },
    { id:'nt04', label:'Programa y planes de trabajo para procesos peligrosos', ref:'NT-04-2023 · artículos 17 y 18' },
    { id:'servicio', label:'Servicio de SST, responsables y competencias verificables', ref:'Marco venezolano aplicable · verificar registro/acreditación según corresponda' },
    { id:'vigilancia', label:'Vigilancia epidemiológica y aptitud para tareas, según exigencias aplicables', ref:'Marco de SST venezolano · registrar cumplimiento, no datos médicos personales' },
    { id:'poliza', label:'Seguros, documentación laboral y contractual exigidos', ref:'Contrato y marco legal correspondiente' },
    { id:'competencias', label:'Matriz de competencias y formación del personal y supervisores', ref:'LOPCYMAT / NT-04-2023 / requisitos del contrato' },
    { id:'iso45001', label:'Gestión de contratistas e interfaces en el SGSST', ref:'ISO 45001 · referencia metodológica voluntaria' },
    { id:'iso45002', label:'Orientaciones de implementación del SGSST', ref:'ISO 45002 · referencia metodológica voluntaria' },
    { id:'covenin4004', label:'Identificación de peligros y evaluación de riesgos por actividad', ref:'COVENIN 4004:2000 · método de referencia' },
    { id:'pdvsa', label:'Requisitos sectoriales de la entidad contratante, cuando proceda', ref:'PDVSA SI-S-04 · verificar versión contractual aplicable' },
    { id:'psicosocial', label:'Coordinación de factores organizativos y psicosociales', ref:'ISO 45003 · orientación complementaria, no obligación general' }
  ];

  const MODULES = [
    { n:'01', title:'Marco normativo y responsabilidades', desc:'Legislación venezolana, NT-04, responsabilidades, requisitos corporativos y referencias técnicas.', instrument:'Instrumento 1 · Lista de chequeo legal y corporativa', view:'legal' },
    { n:'02', title:'Proceso de gestión', desc:'Calificación, selección, alcance, criticidad, inducción, interfaces y condiciones de preinicio.', instrument:'Instrumento 2 · Evaluación ponderada y selección', view:'prequal' },
    { n:'03', title:'Ejecución y control', desc:'IPERC por tareas críticas, ATS, permisos, verificaciones, incidentes y medidas correctivas.', instrument:'Instrumento 3 · IPERC y control integrado de permisos', view:'iperc' },
    { n:'04', title:'Evaluación y mejora', desc:'Indicadores, hallazgos, desempeño, cierre contractual y lecciones aprendidas.', instrument:'Instrumento 4 · Informe de desempeño y mejora', view:'performance' }
  ];

  function courseOverview() {
    return '<div class="section panel"><div class="section-head"><div><h3>Los cuatro módulos del curso</h3><p>La ruta operativa de siete pasos desarrolla los cuatro módulos, con un instrumento aplicado por módulo.</p></div></div>' +
      '<div class="course-grid">' + MODULES.map(m =>
        '<article class="course-card"><div class="course-number">MÓDULO ' + m.n + '</div><h4>' + m.title + '</h4><p>' + m.desc + '</p><div class="course-instrument">' + m.instrument + '</div><button class="btn btn-ghost" data-go="' + m.view + '">Abrir instrumento →</button></article>'
      ).join('') + '</div>' +
      '<div class="callout info mt-12">Esta es una herramienta didáctica para el curso <b>Gestión de Seguridad y Salud en el Trabajo de Contratistas en Venezuela</b>. No emite permisos oficiales, no acredita legalmente a una empresa y no sustituye la revisión técnica ni la autorización del centro de trabajo.</div></div>';
  }

  function legalView() {
    const c = activeContract();
    if (!c) return '<div class="empty"><strong>Selecciona o crea un contrato</strong>La lista legal y corporativa se evalúa para un alcance concreto.</div>';
    const values = c.legalChecklist?.items || {};
    let yes = 0, no = 0, pending = 0, na = 0;
    const rows = LEGAL_CHECKS.map(item => {
      const v = values[item.id] || {};
      if (v.status === 'yes') yes++;
      else if (v.status === 'no') no++;
      else if (v.status === 'na') na++;
      else pending++;
      const option = (value, label) => '<option value="' + value + '"' + (v.status === value ? ' selected' : '') + '>' + label + '</option>';
      return '<div class="check-item" data-legal="' + item.id + '"><div class="check-top"><div><h4>' + item.label + '</h4><p>' + item.ref + '</p></div></div>' +
        '<div class="course-form-row"><div class="field"><label>Estado</label><select class="select legal-status">' +
        option('pending','Por verificar') + option('yes','Cumple') + option('no','No cumple') + option('na','No aplica') +
        '</select></div><div class="field"><label>Responsable</label><input class="input legal-owner" value="' + esc(v.owner || '') + '" maxlength="140"></div>' +
        '<div class="field full"><label>Evidencia / brecha o motivo de no aplicación</label><textarea class="textarea legal-evidence" rows="2">' + esc(v.evidence || '') + '</textarea></div></div></div>';
    }).join('');
    return '<div class="hero-panel"><div class="kicker">Módulo 1 · Instrumento 1</div><h2>Lista legal y corporativa</h2><p>Verifica el cumplimiento pertinente al contrato. La referencia legal no es equivalente a una norma voluntaria ni a una exigencia corporativa del cliente.</p></div>' +
      '<div class="section grid grid-4"><div class="metric"><div class="k">Cumple</div><div class="v">' + yes + '</div></div><div class="metric"><div class="k">Brechas</div><div class="v">' + no + '</div></div><div class="metric"><div class="k">Por verificar</div><div class="v">' + pending + '</div></div><div class="metric"><div class="k">No aplica</div><div class="v">' + na + '</div></div></div>' +
      '<div class="section callout warn">Es un control documental contextual: antes de marcar «Cumple» incorpora evidencia; para «No aplica» registra el motivo. No ingreses diagnósticos, exámenes ni datos médicos.</div>' +
      '<div class="section check-list">' + rows + '</div><div class="section actions"><button class="btn btn-primary" data-action="save-legal">Guardar instrumento 1</button><button class="btn btn-ghost" data-go="prequal">Ir a precalificación →</button></div>';
  }
  function saveLegal() {
    const c = activeContract(); if (!c) return;
    const items = {};
    for (const box of document.querySelectorAll('[data-legal]')) {
      const status = box.querySelector('.legal-status').value;
      const evidence = box.querySelector('.legal-evidence').value.trim();
      const owner = box.querySelector('.legal-owner').value.trim();
      if ((status === 'yes' || status === 'na') && !evidence) {
        notify('Debes justificar con evidencia el cumplimiento o la no aplicación de cada requisito.', 'warn');
        box.querySelector('.legal-evidence').focus();
        return;
      }
      items[box.dataset.legal] = { status, evidence, owner };
    }
    c.legalChecklist = { items };
    if (save()) { notify('Instrumento 1 guardado.', 'success'); render(); }
  }

  function ipercView() {
    const c = activeContract();
    if (!c) return '<div class="empty"><strong>Selecciona o crea un contrato</strong>La matriz IPERC y los permisos corresponden al alcance y tareas de cada contrato.</div>';
    const rows = c.iperc || [];
    const items = rows.map((x, i) =>
      '<article class="panel course-task"><div class="section-head"><div><h3>' + esc(x.task || 'Tarea sin identificar') + '</h3><p>' + esc(x.activity || '') + '</p></div>' +
      '<div class="course-task-actions"><button class="btn btn-ghost btn-sm" data-edit-iperc="' + esc(x.id) + '">Editar</button><button class="btn btn-danger btn-sm" data-delete-iperc="' + esc(x.id) + '">Eliminar</button></div></div>' +
      '<div class="course-task-grid"><div><b>Peligro</b><p>' + esc(x.hazard) + '</p></div><div><b>Exposición / interacción</b><p>' + esc(x.exposure) + '</p></div><div><b>Evento y consecuencia</b><p>' + esc(x.event) + ' → ' + esc(x.consequence) + '</p></div><div><b>Valoración / método</b><p>' + esc(x.risk) + '</p></div><div class="course-full"><b>Controles propuestos y verificación</b><p>' + esc(x.controls) + '</p></div>' +
      '<div><b>Permiso aplicable</b><p>' + esc(x.permitType || 'Por definir') + '</p></div><div><b>Estado del permiso</b><p>' + esc(x.permitStatus || 'Pendiente') + '</p></div><div><b>Responsable / fecha</b><p>' + esc(x.owner || 'Sin asignar') + ' · ' + esc(x.date || 'Sin fecha') + '</p></div><div><b>Documento / evidencia</b><p>' + esc(x.evidence || 'Sin registrar') + '</p></div></div></article>'
    ).join('');
    return '<div class="hero-panel"><div class="kicker">Módulo 3 · Instrumento 3</div><h2>IPERC por tarea crítica y permiso integrado</h2><p>Documenta la secuencia actividad → peligro → exposición/interacción → evento → consecuencia → riesgo → controles y su verificación, sin mezclar metodologías.</p></div>' +
      '<div class="section callout warn"><b>Importante:</b> el estado «Emitido» es solo un registro informativo de un permiso existente, no una autorización expedida por esta aplicación. Debes verificar vigencia, emisor, condiciones y firma en el sistema del centro de trabajo. ATS, permisos y mediciones se gestionan por procedimiento aplicable.</div>' +
      '<div class="section toolbar"><div class="toolbar-left"><strong>' + rows.length + ' tarea(s) documentada(s)</strong></div><div class="toolbar-right"><button class="btn btn-primary" data-action="new-iperc">+ Registrar tarea y permiso</button></div></div>' +
      '<div class="section course-task-list">' + (items || '<div class="empty"><strong>Sin IPERC registrado</strong>Agrega una tarea del contrato para empezar el instrumento 3.</div>') + '</div>' +
      '<div class="section actions"><button class="btn btn-ghost" data-go="assurance">Verificar controles →</button><button class="btn btn-green" data-action="excel-report">Exportar expediente Excel</button></div>';
  }

  function editIperc(id) {
    const c = activeContract(); if (!c) return;
    const x = id ? (c.iperc || []).find(row => row.id === id) : null;
    const field = (name, label, value, opts = {}) => {
      const placeholder = opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '';
      const content = opts.multiline
        ? '<textarea class="textarea" name="' + name + '" rows="2"' + placeholder + '>' + esc(value || '') + '</textarea>'
        : '<input class="input" name="' + name + '" value="' + esc(value || '') + '"' + placeholder + '>';
      return '<div class="field' + (opts.full ? ' full' : '') + '"><label>' + label + '</label>' + content + '</div>';
    };
    const options = (list, chosen) => '<select class="select" name="permitStatus">' + list.map(x => '<option value="' + x + '"' + (chosen === x ? ' selected' : '') + '>' + x + '</option>').join('') + '</select>';
    openModal(x ? 'Editar IPERC y permiso' : 'Nueva tarea: IPERC y permiso',
      '<form><div class="form-grid">' +
      field('task','Tarea crítica',x?.task,{placeholder:'Ej. Ingreso a espacio confinado'}) +
      field('activity','Actividad / secuencia',x?.activity,{placeholder:'Ej. Limpieza del tanque'}) +
      field('hazard','Peligro identificado',x?.hazard,{multiline:true}) +
      field('exposure','Exposición / interacción',x?.exposure,{multiline:true}) +
      field('event','Evento no deseado',x?.event,{multiline:true}) +
      field('consequence','Consecuencia posible',x?.consequence,{multiline:true}) +
      field('risk','Evaluación / método y resultado',x?.risk,{placeholder:'Criterio de la organización, sin mezclar escalas',full:true}) +
      field('controls','Controles y cómo verificarlos',x?.controls,{multiline:true,full:true}) +
      field('permitType','Permiso / ATS aplicable',x?.permitType,{placeholder:'Ej. Permiso EC, ATS y plan de rescate'}) +
      '<div class="field"><label>Estado documental del permiso</label>' + options(['Pendiente','Emitido por responsable autorizado','Vencido','Cerrado','No aplica'],x?.permitStatus || 'Pendiente') + '</div>' +
      field('owner','Responsable de verificación',x?.owner) +
      '<div class="field"><label>Fecha de verificación</label><input class="input" type="date" name="date" value="' + esc(x?.date || '') + '"></div>' +
      field('evidence','Código de permiso / evidencia verificable',x?.evidence,{multiline:true,full:true}) +
      '</div><div class="actions"><button type="button" class="btn btn-ghost" data-close-modal>Cancelar</button><button class="btn btn-primary" type="submit">Guardar instrumento 3</button></div></form>', fd => {
        const get = key => String(fd.get(key) || '').trim();
        if (!get('task') || !get('hazard') || !get('event') || !get('controls')) {
          notify('Completa tarea, peligro, evento y controles antes de guardar.', 'warn'); return;
        }
        const next = Object.fromEntries(['task','activity','hazard','exposure','event','consequence','risk','controls','permitType','permitStatus','owner','date','evidence'].map(k => [k,get(k)]));
        if (x) Object.assign(x,next);
        else { c.iperc = c.iperc || []; c.iperc.push({ id:uid('iperc'), ...next }); }
        if (save()) { closeModal(); notify('Instrumento 3 guardado.', 'success'); render(); }
      }
    );
    bindModalButtons();
  }

  function bindCourseViews() {
    document.querySelector('[data-action="save-legal"]')?.addEventListener('click', saveLegal);
    document.querySelector('[data-action="new-iperc"]')?.addEventListener('click', () => editIperc(null));
    document.querySelectorAll('[data-edit-iperc]').forEach(btn => btn.addEventListener('click', () => editIperc(btn.dataset.editIperc)));
    document.querySelectorAll('[data-delete-iperc]').forEach(btn => btn.addEventListener('click', () => {
      if (!confirm('¿Eliminar esta tarea IPERC del expediente?')) return;
      const c = activeContract();
      c.iperc = (c.iperc || []).filter(x => x.id !== btn.dataset.deleteIperc);
      if (save()) { notify('Tarea retirada del instrumento 3.', 'success'); render(); }
    }));
    document.querySelectorAll('.course-card [data-go]').forEach(b => b.addEventListener('click', () => setView(b.dataset.go)));
  }
  window.renderLegal = legalView;
  window.renderIperc = ipercView;
  window.courseOverview = courseOverview;
  window.bindCourseViews = bindCourseViews;
  window.courseLegalChecks = LEGAL_CHECKS;
})();