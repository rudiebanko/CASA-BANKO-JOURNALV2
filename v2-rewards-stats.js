/* CASA BANKO V2 — standalone Flip Challenge and read-only Journal Stats */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
let screen='flip';
const count=checks=>Object.values(checks||{}).filter(Boolean).length;
async function readSetups(){
 try{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('casa-banko-v2-planned-setups',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
 return await new Promise((resolve,reject)=>{const t=db.transaction('data','readonly'),r=t.objectStore('data').get('setups');r.onsuccess=()=>resolve(Array.isArray(r.result)?r.result:[]);r.onerror=()=>reject(r.error)})
 }catch(e){return null}
}
async function stats(){
 const root=$('v2-journal-stats');if(!root)return;
 const setups=await readSetups();if(!root.isConnected)return;
 if(!setups){root.innerHTML='<p class="small">Saved plans are temporarily unavailable.</p>';return}
 const recent=setups.filter(s=>{const d=new Date(s.created);return Number.isFinite(d.getTime())&&d>=new Date('2026-10-17T00:00:00-07:00')});
 const withChecklist=recent.filter(s=>s.checklist&&Object.keys(s.checklist).length);
 const complete=withChecklist.reduce((n,s)=>n+count(s.checklist),0);
 const possible=withChecklist.length*11;
 const pct=possible?Math.round(complete/possible*100):null;
 const followed=recent.filter(s=>s.planFollowed===true||s.planFollowed==='YES');
 const assessed=recent.filter(s=>s.planFollowed===true||s.planFollowed===false||s.planFollowed==='YES'||s.planFollowed==='NO');
 const discipline=assessed.length?Math.round(followed.length/assessed.length*100):null;
 const card=(name,value,description)=>'<div class="v2-stat"><div class="v2-stat-label">'+name+'</div><div class="v2-stat-value">'+value+'</div><div class="v2-stat-note">'+description+'</div></div>';
 root.innerHTML='<div id="v2-dashboard-panels"><div class="card gold" style="margin-bottom:12px;padding:14px"><div class="section-title">DAILY SUMMARY</div><p class="small">Loading trade summary…</p></div><div class="card gold" style="margin-bottom:12px;padding:14px"><div class="section-title">ACCOUNT PROGRESS</div><p class="small">Loading account progress…</p></div></div><div class="v2-stat-grid">'+card('PLANS CREATED',recent.length,'Saved planned setups')+card('CHECKLIST COMPLETION',pct===null?'—':pct+'%',possible?complete+' of '+possible+' checklist items':'No saved checklists yet')+card('PLANS FOLLOWED',assessed.length?followed.length:'—',assessed.length?'Confirmed followed plans':'Not yet recorded')+card('DISCIPLINE RATE',discipline===null?'—':discipline+'%',assessed.length?followed.length+' of '+assessed.length+' assessed':'Requires a plan-followed confirmation')+'</div><p class="small" style="margin-top:12px">Stats are informational only. They do not affect flip progress. Unrecorded plan-following results are not assumed.</p>';if(typeof window.CasaBankoV2Dashboard==='function'){try{window.CasaBankoV2Dashboard()}catch(e){console.error('V2 dashboard stats:',e)}}
}
function open(which){
 screen=which==='stats'?'stats':'flip';
 const overlay=$('v2-extra-overlay');if(!overlay)return;
 overlay.classList.add('show');overlay.setAttribute('aria-hidden','false');
 $('v2-extra-title').textContent=screen==='flip'?'10 FLIP CHALLENGE':'JOURNAL STATS';
 $('v2-flip-view').hidden=screen!=='flip';$('v2-stats-view').hidden=screen!=='stats';
 if(screen==='flip')window.renderV2Rewards?.();else stats();
 overlay.scrollTop=0;
}
function close(){const overlay=$('v2-extra-overlay');overlay?.classList.remove('show');overlay?.setAttribute('aria-hidden','true')}
window.renderV2Rewards=()=>{const target=$('v2-flip-view');if(!target||!window.CasaBankoV2Flip)return;target.innerHTML=window.CasaBankoV2Flip.markup();window.CasaBankoV2Flip.bind()};
window.CasaBankoV2Extras={open,close};
document.addEventListener('click',e=>{const btn=e.target.closest('[data-v2-extra]');if(btn){open(btn.dataset.v2Extra)}else if(e.target.closest('[data-v2-extra-close]'))close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
})();