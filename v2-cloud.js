/* CASA BANKO V2 cloud: same Supabase auth project as V1; V2 documents stored separately. */
(()=>{'use strict';
const URL='https://tpziplzdiifxryoourgp.supabase.co',KEY='sb_publishable_xoC6GqPpTNGGbbKcq1nLCw_qiaxUhMK';
const DB='casa-banko-v2-planned-setups',HISTORY='cb-v2-intrade-reset-history-v1',BACKUP='cb-v2-cloud-pre-merge-backup';
const MISSED='cb-v2-missed-trade-resets-v1',URGE='casa_banko_v2_urge_resets_v1',FLIP='casaBankoV2FlipChallengeV1',JOURNAL_DB='casa-banko-new-journal-v1';
let sb,user,busy=false,ready=false,timer=0;
const $=id=>document.getElementById(id);
function status(msg,bad=false){const e=$('v2-cloud-status');if(e){e.textContent=msg;e.style.color=bad?'#ff7b83':'#47d5a2'}}
function openDb(){return new Promise((ok,no)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('data'))r.result.createObjectStore('data')};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function readSetups(){const d=await openDb();return new Promise((ok,no)=>{const t=d.transaction('data'),r=t.objectStore('data').get('setups');r.onsuccess=()=>ok(Array.isArray(r.result)?r.result:[]);r.onerror=()=>no(r.error);t.oncomplete=()=>d.close()})}
async function writeSetups(rows){const d=await openDb();return new Promise((ok,no)=>{const t=d.transaction('data','readwrite');t.objectStore('data').put(rows,'setups');t.oncomplete=()=>{d.close();ok()};t.onerror=()=>no(t.error)})}
async function safetyBackup(setups,history,extra={}){const d=await new Promise((ok,no)=>{const r=indexedDB.open('casa-banko-v2-cloud-safety',1);r.onupgradeneeded=()=>r.result.createObjectStore('snapshots',{keyPath:'savedAt'});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});return new Promise((ok,no)=>{const t=d.transaction('snapshots','readwrite');t.objectStore('snapshots').put({savedAt:new Date().toISOString(),setups,history,...extra});t.oncomplete=()=>{d.close();ok()};t.onerror=()=>no(t.error)})}
function readHistory(){try{const a=JSON.parse(localStorage.getItem(HISTORY)||'[]');return Array.isArray(a)?a:[]}catch{return []}}
function stamp(s){return Date.parse(s.updatedAt||s.created||s.date||'')||0}
function readList(key){try{const a=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(a)?a:[]}catch{return []}}
function readJson(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
async function journalDb(){return new Promise((ok,no)=>{const r=indexedDB.open(JOURNAL_DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('state'))r.result.createObjectStore('state')};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function readJournal(){const d=await journalDb();return new Promise((ok,no)=>{const t=d.transaction('state'),r=t.objectStore('state').get('journal');r.onsuccess=()=>ok(r.result||null);r.onerror=()=>no(r.error);t.oncomplete=()=>d.close()})}
async function writeJournal(data){const d=await journalDb();return new Promise((ok,no)=>{const t=d.transaction('state','readwrite');t.objectStore('state').put(data,'journal');t.oncomplete=()=>{d.close();ok()};t.onerror=()=>no(t.error)})}
function journalItems(j){return (j?.trades||[]).map(x=>({...x,id:String(x.id||x.clientTradeId||'trade-'+x.created)}))}
function historyItems(j){return (j?.history||[]).map(x=>({...x,id:String(x.id||'history-'+x.created)}))}
function merge(a,b){const m=new Map();for(const x of [...a,...b]){if(!x||!x.id)continue;const old=m.get(String(x.id));if(!old||stamp(x)>stamp(old))m.set(String(x.id),x)}return [...m.values()].sort((a,b)=>stamp(b)-stamp(a))}
function refresh(){window.dispatchEvent(new Event('cb-v2-cloud-setups-loaded'))}
function paint(){const connected=!!user;$('v2-cloud-out')?.toggleAttribute('hidden',connected);$('v2-cloud-in')?.toggleAttribute('hidden',!connected);if($('v2-cloud-email-label'))$('v2-cloud-email-label').textContent=user?.email||'';if($('v2-cloud-badge'))$('v2-cloud-badge').textContent=connected?'CONNECTED':'NOT CONNECTED'}
async function pullAndMerge(){
 if(!user)throw Error('Sign in first.');
 const [localSetups,localHistory,localJournal]=await Promise.all([readSetups(),Promise.resolve(readHistory()),readJournal()]);
 const localMissed=readList(MISSED),localUrge=readList(URGE),localFlip=readJson(FLIP);
 const {data,error}=await sb.from('v2_cloud_documents').select('document_type,document_id,payload').eq('user_id',user.id);
 if(error)throw error;
 const cloudSetups=(data||[]).filter(x=>x.document_type==='planned_setup').map(x=>x.payload);
 const cloudHistory=(data||[]).filter(x=>x.document_type==='intrade_reset').map(x=>x.payload);
 const setups=merge(localSetups,cloudSetups),history=merge(localHistory,cloudHistory);
 const missed=merge(localMissed,(data||[]).filter(x=>x.document_type==='missed_reset').map(x=>x.payload));
 const urge=merge(localUrge,(data||[]).filter(x=>x.document_type==='urge_reset').map(x=>x.payload));
 const tradeRows=merge(journalItems(localJournal),(data||[]).filter(x=>x.document_type==='journal_trade').map(x=>x.payload));
 const historyRows=merge(historyItems(localJournal),(data||[]).filter(x=>x.document_type==='journal_history').map(x=>x.payload));
 const cloudFlip=(data||[]).find(x=>x.document_type==='flip_state'&&x.document_id==='current');
 // Do not overwrite a locally configured challenge with a different device's challenge automatically.
 const cloudFlipState=cloudFlip?.payload||null;
 const localFlipTime=Date.parse(localFlip?._cloudUpdatedAt||'')||0,cloudFlipTime=Date.parse(cloudFlipState?._cloudUpdatedAt||'')||0;
 const flip=localFlip&&cloudFlipState?(localFlipTime>=cloudFlipTime?localFlip:cloudFlipState):(localFlip||cloudFlipState||null);
 // Never replace local data without first recording a recovery copy.
 try{await safetyBackup(localSetups,localHistory,{missed:localMissed,urge:localUrge,flip:localFlip,journal:localJournal})}catch(e){throw Error('Safety backup could not be saved. Cloud merge stopped: '+e.message)}
 if(JSON.stringify(localSetups)!==JSON.stringify(setups))await writeSetups(setups);
 if(JSON.stringify(localHistory)!==JSON.stringify(history))localStorage.setItem(HISTORY,JSON.stringify(history));
 if(JSON.stringify(localMissed)!==JSON.stringify(missed))localStorage.setItem(MISSED,JSON.stringify(missed));
 if(JSON.stringify(localUrge)!==JSON.stringify(urge))localStorage.setItem(URGE,JSON.stringify(urge));
 if(flip&&JSON.stringify(localFlip)!==JSON.stringify(flip))localStorage.setItem(FLIP,JSON.stringify(flip));
 const journal={trades:tradeRows,history:historyRows,nextId:Math.max(Number(localJournal?.nextId)||1,...tradeRows.map(x=>Number(x.id)||0))+1};
 if(JSON.stringify(localJournal?.trades||[])!==JSON.stringify(tradeRows)||JSON.stringify(localJournal?.history||[])!==JSON.stringify(historyRows))await writeJournal(journal);
 refresh();window.dispatchEvent(new Event('cb-v2-cloud-other-loaded'));
 return {setups,history,missed,urge,flip,tradeRows,historyRows};
}
async function pushRows(type,items){
 for(let i=0;i<items.length;i+=15){
 const chunk=items.slice(i,i+15).map(x=>({user_id:user.id,document_type:type,document_id:String(x.id),payload:x,updated_at:new Date().toISOString()}));
 const {error}=await sb.from('v2_cloud_documents').upsert(chunk,{onConflict:'user_id,document_type,document_id'});
 if(error)throw error;
 }
}
async function sync(){if(!user||busy)return;busy=true;status('SYNCING…');try{
 const {setups,history,missed,urge,flip,tradeRows,historyRows}=await pullAndMerge();
 await pushRows('planned_setup',setups);
 await pushRows('intrade_reset',history);
 await pushRows('missed_reset',missed);
 await pushRows('urge_reset',urge);
 await pushRows('journal_trade',tradeRows);
 await pushRows('journal_history',historyRows);
 if(flip){const {error}=await sb.from('v2_cloud_documents').upsert({user_id:user.id,document_type:'flip_state',document_id:'current',payload:flip},{onConflict:'user_id,document_type,document_id'});if(error)throw error}
 ready=true;status('✓ CLOUD SYNCED · '+setups.length+' SETUPS · '+(history.length+missed.length+urge.length)+' RESET LOGS');
 }catch(e){console.error('V2 cloud:',e);status('SYNC FAILED — LOCAL DATA PRESERVED. '+e.message,true)}finally{busy=false}}
function schedule(){if(!ready||!user)return;clearTimeout(timer);timer=setTimeout(sync,1400)}
async function login(signup){const email=$('v2-cloud-email').value.trim(),password=$('v2-cloud-password').value;if(!email||!password){status('Enter your email and password.',true);return}status('CONNECTING…');const {error}=signup?await sb.auth.signUp({email,password}):await sb.auth.signInWithPassword({email,password});if(error)status(error.message,true);else if(signup)status('Check your email if confirmation is required.');else status('CONNECTED — LOADING CLOUD…')}
function mount(){const slot=$('v2-settings-slot');if(!slot||$('v2-cloud-panel'))return;const card=document.createElement('section');card.id='v2-cloud-panel';card.innerHTML=`<div class="v2-cloud-title">CASA BANKO CLOUD</div><div class="v2-cloud-account"><div>CLOUD ACCOUNT <span id="v2-cloud-badge">NOT CONNECTED</span></div><p id="v2-cloud-email-label">Sign into your existing CASA BANKO account.</p></div><div id="v2-cloud-out"><input id="v2-cloud-email" type="email" autocomplete="email" placeholder="Cloud email"><input id="v2-cloud-password" type="password" autocomplete="current-password" placeholder="Password"><button id="v2-cloud-login">SIGN IN</button><button id="v2-cloud-signup">CREATE ACCOUNT</button></div><div id="v2-cloud-in" hidden><button id="v2-cloud-sync">SYNC NOW</button><button id="v2-cloud-restore">RESTORE / MERGE FROM CLOUD</button><p>Combines this device's saved setups and reset history with your cloud records. Creates a local safety backup first; never deletes cloud records.</p><button id="v2-cloud-signout">SIGN OUT</button></div><p id="v2-cloud-status" aria-live="polite">Cloud not connected.</p><p class="v2-cloud-foot">V2 sync: planned setups, screenshots, checklists, reset logs, Flip Challenge and locally saved journal entries. TradeLocker broker connections and live P&L remain independently managed.</p>`;slot.prepend(card);
 $('v2-cloud-login').onclick=()=>login(false);$('v2-cloud-signup').onclick=()=>login(true);
 $('v2-cloud-sync').onclick=sync;$('v2-cloud-restore').onclick=()=>{if(confirm('Merge cloud records with this device? A local safety backup will be created first.'))sync()};
 $('v2-cloud-signout').onclick=async()=>{ready=false;await sb.auth.signOut();status('Signed out.')};
 paint();
}
async function init(){mount();if(!window.supabase){status('Cloud library unavailable.',true);return}sb=window.supabase.createClient(URL,KEY);const {data,error}=await sb.auth.getSession();if(error)console.warn(error);user=data?.session?.user||null;paint();sb.auth.onAuthStateChange((event,session)=>{const before=user?.id;user=session?.user||null;paint();if(!user)ready=false;else if(event==='SIGNED_IN'&&before!==user.id)sync()});if(user)await sync()}
window.addEventListener('cb-v2-local-changed',schedule);window.addEventListener('storage',e=>{if([HISTORY,MISSED,URGE,FLIP].includes(e.key))schedule()});
window.CasaBankoV2Cloud={sync};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();