const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(__dirname+'/../simulateur-viager-occupe.html','utf8');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const load=()=>new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true}).window;
function set(w,id,v){const e=w.document.getElementById(id);e.value=String(v);e.dispatchEvent(new w.Event('input',{bubbles:true}));if(e.tagName==='SELECT')e.dispatchEvent(new w.Event('change',{bubbles:true}))}
const g=(w,id)=>w.document.getElementById(id)?.textContent;
const base=w=>{set(w,'value',400000);set(w,'rent',1104);set(w,'heads','2');set(w,'sex1','F');set(w,'age1',76);set(w,'sex2','M');set(w,'age2',80);set(w,'bouquet',60000)};
(async()=>{
 const cases=[['cas notaire (400k, 1104/m, 60k)',w=>{}],['age 49',w=>set(w,'age1',49)],['age 100 seule',w=>{set(w,'heads','1');set(w,'age1',100)}],['age 95 seule',w=>{set(w,'heads','1');set(w,'age1',95)}],['loyer 9000',w=>set(w,'rent',9000)],['bouquet 390000',w=>set(w,'bouquet',390000)],['bouquet 0',w=>set(w,'bouquet',0)],['loyer vide',w=>set(w,'rent','')],['réversion 0',w=>set(w,'reversion',0)]];
 for(const [n,f] of cases){const w=load();base(w);f(w);await wait(450);
  const r=w.document.getElementById('results');const err=r.querySelector('.error');
  console.log(n.padEnd(34),'|',err&&!g(w,'liveRente')?('ERREUR: '+err.textContent):('bouquet '+g(w,'liveBouquet')+' | rente '+g(w,'liveRente')+' | '+[...r.querySelectorAll('td')].slice(2,3).map(x=>'DUH '+x.textContent).join('')+' | '+(r.textContent.match(/Durée statistique[^.]*\./)||[''])[0].replace(/.*estimée : /,'durée ')+(r.querySelector('[role=alert]')?' | ⚠ '+r.querySelector('[role=alert]').textContent.slice(0,55):'')));}
 const w=load();base(w);await wait(450);const rl=w.document.getElementById('renteLive');rl.value='1000';rl.dispatchEvent(new w.Event('input',{bubbles:true}));
 console.log('curseur rente 1000 → bouquet',g(w,'liveBouquet'),'rente',g(w,'liveRente'));
 console.log('panneau expert masqué :',w.document.querySelector('details').hidden,'| réversion visible :',!w.document.getElementById('reversionLabel').classList.contains('hide'));
})();
