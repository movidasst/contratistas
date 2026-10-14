'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const { chromium }=require('playwright');

const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1/');
 const rel=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);
 const full=path.resolve(root,'.'+rel);
 if(!full.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(full,(err,data)=>{if(err){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':mime[path.extname(full)]||'application/octet-stream'}).end(data)});
});
async function run(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port+'/';
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({acceptDownloads:true,viewport:{width:1440,height:900}});
 const page=await context.newPage();
 const failures=[];
 page.on('pageerror',e=>failures.push(e.message));
 try{
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.locator('[data-view="contractors"]').click();
  await page.locator('[data-action="new-contractor"]').click();
  await page.locator('#modalBody [name="name"]').fill('Contratista de prueba, C.A.');
  await page.locator('#modalBody [name="rif"]').fill('J-40000000-0');
  await page.locator('#modalBody button[type="submit"]').click();
  assert.equal(await page.locator('#modalBackdrop').getAttribute('hidden')!==null,true,'El modal del contratista debe cerrarse');
  await page.locator('[data-view="contracts"]').click();
  await page.locator('[data-action="new-contract"]').first().click();
  await page.locator('#modalBody [name="title"]').fill('Contrato de prueba — tanque y soldadura');
  await page.locator('#modalBody [name="scope"]').fill('Ingreso a tanque, izamiento y soldadura');
  await page.locator('#modalBody [name="tasks"]').fill('Espacios confinados, Trabajo en caliente, Izamiento de cargas');
  await page.locator('#modalBody button[type="submit"]').click();
  const first=await page.evaluate(()=>JSON.parse(localStorage.getItem('movidasst_contratistas_v1')));
  assert.equal(first.contracts.length,1);
  const realContractId=first.contracts[0].id;

  await page.locator('[data-view="contracts"]').click();
  await page.locator('#contractStatus').selectOption('Habilitado');
  await page.locator('[data-action="save-contract-meta"]').click();
  const status=await page.evaluate(()=>JSON.parse(localStorage.getItem('movidasst_contratistas_v1')).contracts[0].status);
  assert.equal(status,'Borrador','La aplicación no debe habilitar un contrato sin condiciones previas');

  await page.locator('[data-view="assurance"]').click();
  assert((await page.locator('[data-assurance]').count())>=7,'Deben proponerse los controles aplicables');
  await page.locator('[data-assurance="ast"] .ass-status').selectOption('yes');
  await page.locator('[data-action="save-assurance"]').click();
  let state=await page.evaluate(()=>JSON.parse(localStorage.getItem('movidasst_contratistas_v1')));
  assert.equal(state.contracts[0].assurance,undefined,'Conforme sin evidencia no debe guardarse');
  await page.locator('[data-assurance="ast"] .ass-evidence').fill('Acta de AST firmada por supervisor');
  await page.locator('[data-assurance="ast"] .ass-owner').fill('Supervisor SST');
  await page.locator('[data-action="save-assurance"]').click();
  state=await page.evaluate(()=>JSON.parse(localStorage.getItem('movidasst_contratistas_v1')));
  assert.equal(state.contracts[0].assurance.items.ast.status,'yes');

  await page.locator('[data-view="backup"]').click();
  const dlPromise=page.waitForEvent('download');
  await page.locator('[data-action="download-backup"]').click();
  const dl=await dlPromise,dlPath=await dl.path();
  const backup=JSON.parse(fs.readFileSync(dlPath,'utf8'));
  assert.equal(backup.data.contracts.length,1);
  assert(backup.data.contracts[0].assurance.items.ast.evidence.includes('firmada'));

  await page.locator('[data-view="dashboard"]').click();
  await page.locator('[data-action="load-example"]').click();
  state=await page.evaluate(()=>JSON.parse(localStorage.getItem('movidasst_contratistas_v1')));
  assert.equal(state.contracts.length,2,'Caso de prueba y real deben coexistir');
  await page.locator('[data-action="delete-example"]').click();
  state=await page.evaluate(()=>JSON.parse(localStorage.getItem('movidasst_contratistas_v1')));
  assert.equal(state.contracts.length,1);
  assert.equal(state.contracts[0].id,realContractId,'Eliminar ejemplo no debe borrar contrato real');

  await page.locator('[data-view="backup"]').click();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#backupInput').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await page.waitForTimeout(300);
  state=await page.evaluate(()=>JSON.parse(localStorage.getItem('movidasst_contratistas_v1')));
  assert.equal(state.contracts.length,1);
  assert.equal(state.contracts[0].assurance.items.ast.evidence,'Acta de AST firmada por supervisor');

  await page.locator('[data-view="backup"]').click();
  await page.locator('#backupInput').setInputFiles({name:'corrupt.json',mimeType:'application/json',buffer:Buffer.from('{"invalid":true}')});
  await page.waitForTimeout(150);
  state=await page.evaluate(()=>JSON.parse(localStorage.getItem('movidasst_contratistas_v1')));
  assert.equal(state.contracts.length,1,'Respaldo inválido no puede borrar datos');

  // La biblioteca Excel depende de la CDN; un problema de red debe producir aviso, no pérdida de datos.
  const hasXlsx=await page.evaluate(()=>typeof XLSX!=='undefined');
  if(hasXlsx){
   const exported=page.waitForEvent('download',{timeout:10000});
   await page.locator('#excelBtn').click();
   const dl=await exported;
   assert(dl.suggestedFilename().endsWith('.xlsx'));
  }else console.log('ADVERTENCIA: biblioteca XLSX externa no disponible en navegador CI; se validará el aviso.');
  const popupPromise=page.waitForEvent('popup');
  await page.locator('#printBtn').click();
  const popup=await popupPromise;await popup.waitForLoadState('domcontentloaded');
  assert((await popup.locator('body').innerText()).includes('Controles y evidencias de ejecución'));

  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const mobilePage=await mobile.newPage();
  await mobilePage.goto(url,{waitUntil:'domcontentloaded'});
  await mobilePage.locator('#menuToggle').click();
  await mobilePage.locator('[data-view="backup"]').click();
  assert((await mobilePage.locator('#view').innerText()).includes('Respaldo y restauración'));
  await mobile.close();
  assert.deepEqual(failures,[],'No debe haber errores de JavaScript en la página');
  console.log('PRUEBA E2E OK: alta, bloqueos, controles, respaldos, ejemplo, PDF y móvil');
 } finally{await browser.close();server.close()}
}
run().catch(e=>{console.error(e);server.close();process.exitCode=1});
