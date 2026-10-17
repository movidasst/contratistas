'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const root = path.join(__dirname,'..');
for (const name of ['auth.js','app-core.js','app-views.js','course-instruments.js','app-assurance.js','app-actions.js']) {
  new vm.Script(fs.readFileSync(path.join(root,name),'utf8'),{filename:name});
}
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.includes('data-view="assurance"'));
assert(html.includes('data-view="backup"'));
assert(html.includes('id="loginGate"'));
assert(html.includes('data-view="legal"'));
assert(html.includes('data-view="iperc"'));
assert(html.indexOf('course-instruments.js') < html.indexOf('app-actions.js'));
assert(html.indexOf('app-assurance.js') < html.indexOf('app-actions.js'));

const contract={
 id:'ct-test',title:'Mantenimiento mayor de tanque',site:'Área industrial',
 scope:'Ingreso a tanque y soldadura',tasks:['Espacios confinados','Trabajo en caliente','Izamiento de cargas','Control de fuentes de energía'],
 assurance:{items:{ast:{status:'yes',evidence:'AST firmado',owner:'Supervisor',date:'2026-10-14'}}}
};
const context={window:{},localStorage:{getItem:()=>null},state:{contracts:[contract],contractors:[]},
 activeContract:()=>contract,
 esc:v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'app-assurance.js'),'utf8'),context);
const selected=context.window.assuranceStats(contract);
assert.equal(selected.total,8);
assert.equal(selected.verified,1);
assert(selected.rows.some(x=>x.id==='confinado'));
assert(selected.rows.some(x=>x.id==='caliente'));
assert(selected.rows.some(x=>x.id==='energia'));
assert(selected.rows.some(x=>x.id==='izaje'));
assert(context.window.renderAssurance().includes('Guardar controles'));
assert(context.window.renderBackup().includes('backupInput'));

const course={window:{},state:{contracts:[contract],contractors:[]},activeContract:()=>contract,esc:context.esc,
  openModal:()=>{},uid:()=>'',notify:()=>{},save:()=>true,render:()=>{},setView:()=>{},
  document:{querySelectorAll:()=>[],querySelector:()=>null}};
vm.createContext(course);
vm.runInContext(fs.readFileSync(path.join(root,'course-instruments.js'),'utf8'),course);
assert.equal(course.window.courseLegalChecks.length,12);
assert(course.window.renderLegal().includes('LOPCYMAT'));
assert(course.window.renderIperc().includes('IPERC'));
assert(course.window.courseOverview().includes('MÓDULO 04'));
assert(course.window.renderCoursePdf(contract,()=>'<header></header>',()=>'<footer></footer>').includes('IPERC'));

const plain={title:'Oficina',scope:'Servicios administrativos',site:'Edificio',tasks:[]};
assert.equal(context.window.assuranceStats(plain).total,4);

contract.assurance.items.ast.evidence='<img src=x onerror=alert(1)>';
const output=context.window.renderAssurance();
assert(!output.includes('value="<img'));
assert(output.includes('&lt;img'));
console.log('Pruebas de sintaxis, aplicabilidad y escape HTML: OK');
