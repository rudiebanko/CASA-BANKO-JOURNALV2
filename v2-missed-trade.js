(()=>{'use strict';
const $=id=>document.getElementById(id);
const KEY='cb-v2-missed-trade-resets-v1';
const checks=[['I accept the missed opportunity',"The profit I didn't capture is not money I lost."],['I am not trying to compensate',"My next trade won't be motivated by frustration or the need to make money."],["I've stepped away and reset",'I took a five-minute break and can evaluate price calmly.'],['Let price create another setup opportunity',"Missing the first entry doesn't mean missing the entire move. I will wait for price to develop another valid setup instead of chasing."]];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=()=>{try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a:[]}catch{return []}};
let selected=new Set(),notice='',reflection='';
function show(){const root=$('v2-missed-overlay');if(!root)return;root.hidden=false;root.classList.add('show');root.scrollTop=0;render()}
function close(){const root=$('v2-missed-overlay');if(root){root.classList.remove('show');root.hidden=true}}
function render(){const root=$('v2-missed-content');if(!root)return;const complete=selected.size===4;
root.innerHTML='<div class="v2-missed-intro"><h2>MISSED OPPORTUNITY RESET</h2><p>You missed the move. You do not need to pay the market with another trade.</p></div>'+checks.map((x,i)=>'<button type="button" class="v2-missed-check '+(selected.has(i)?'checked':'')+'" data-missed-check="'+i+'" aria-pressed="'+selected.has(i)+'"><span class="v2-missed-square">'+(selected.has(i)?'✓':'')+'</span><span><strong>'+esc(x[0])+'</strong><small>'+esc(x[1])+'</small></span></button>').join('')+'<div class="v2-missed-footer '+(complete?'complete':'')+'"><strong>'+(complete?'RESET COMPLETE':'NO CHASING')+'</strong><p>'+selected.size+' / 4 CHECKS PASSED</p><div class="v2-missed-track">'+checks.map((_,i)=>'<span class="'+(selected.has(i)?'on':'')+'"></span>').join('')+'</div><button type="button" data-missed-return '+(!complete?'disabled':'')+'>RETURN TO ENTRY CHECKPOINT</button></div><label class="v2-missed-label" for="v2-missed-note">OPTIONAL REFLECTION</label><textarea id="v2-missed-note" placeholder="What did I notice or learn?">'+esc(reflection)+'</textarea><button type="button" class="v2-missed-save" data-missed-save '+(!complete?'disabled':'')+'>LOG MISSED-TRADE RESET</button><p class="v2-missed-notice" role="status">'+esc(notice)+'</p><button type="button" class="v2-missed-reset" data-missed-reset>↻ &nbsp;Reset checks</button><div class="v2-missed-history"><h3>MISSED-TRADE RESET HISTORY</h3>'+read().map(l=>'<details><summary>'+esc(new Date(l.date).toLocaleString())+' · RESET COMPLETE</summary>'+l.answers.map(a=>'<p>✓ '+esc(a)+'</p>').join('')+(l.note?'<p>REFLECTION: '+esc(l.note)+'</p>':'')+'</details>').join('')+'</div>';
}
document.addEventListener('click',e=>{
if(e.target.closest('[data-missed-open]')){show();return}
if(e.target.closest('[data-missed-close]')){close();return}
const b=e.target.closest('[data-missed-check]');if(b){const i=Number(b.dataset.missedCheck);if(selected.has(i))selected.delete(i);else selected.add(i);notice='';render();return}
if(e.target.closest('[data-missed-reset]')){selected.clear();notice='';reflection='';render();return}
if(e.target.closest('[data-missed-return]')){if(selected.size===4){close();$('plan')?.scrollIntoView({block:'start'});notice=''}return}
if(e.target.closest('[data-missed-save]')){if(selected.size!==4)return;reflection=$('v2-missed-note')?.value||'';const logs=read();logs.unshift({id:crypto.randomUUID(),date:new Date().toISOString(),mode:'missed',decision:'missed',answers:checks.map(c=>c[0]),note:reflection.trim()});try{localStorage.setItem(KEY,JSON.stringify(logs));window.dispatchEvent(new Event('cb-v2-local-changed'));notice='Saved on this device in Missed-Trade Reset History.';reflection='';render()}catch{notice='Unable to save. Check browser storage.';render()}return}
});
document.addEventListener('input',e=>{if(e.target.id==='v2-missed-note')reflection=e.target.value});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('v2-missed-overlay')?.hidden)close()});
})();