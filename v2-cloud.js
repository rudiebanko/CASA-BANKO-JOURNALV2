/* CASA BANKO V2 cloud: same Supabase auth project as V1; V2 documents stored separately. */
(()=>{'use strict';
const URL='https://tpziplzdiifxryoourgp.supabase.co',KEY='sb_publishable_xoC6GqPpTNGGbbKcq1nLCw_qiaxUhMK';
const DB='casa-banko-v2-planned-setups',HISTORY='cb-v2-intrade-reset-history-v1',BACKUP='cb-v2-cloud-pre-merge-backup';
let sb,user,busy=false,ready=false,timer=0;
const $=id=>document.getElementById(id);
function status(msg,bad=false){const e=$('v2-cloud-status');if(e){e.textContent=msg;e.style.color=bad?'#ff7b83':'#47d5a2'}}
function openDb(){return new Promise((ok,no)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('data'))r.result.createObjectStore('data')};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function readSetups(){const d=await openDb();return new Promise((ok,no)=>{const t=d.transaction('data'),r=t.objectStore('data').get('setups');r.onsuccess=()=>ok(Array.isArray(r.result)?r.result:[]);r.onerror=()=>no(r.error);t.oncomplete=()=>d.close()})}
async function writeSetups(rows){const d=await openDb();return new Promise((ok,no)=>{const t=d.transaction('data','readwrite');t.objectStore('data').put(rows,'setups');t.oncomplete=()=>{d.close();ok()};t.onerror=()=>no(t.error)})}
async function safetyBackup(setups,history){const d=await new Promise((ok,no)=>{const r=indexedDB.open('casa-banko-v2-cloud-safety',1);r.onupgradeneeded=()=>r.result.createObjectStore('snapshots',{keyPath:'savedAt'});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});return new Promise((ok,no)=>{const t=d.transaction('snapshots','readwrite');t.objectStore('snapshots').put({savedAt:new Date().toISOString(),setups,history});t.oncomplete=()=>{d.close();ok()};t.onerror=()=>no(t.error)})}
function readHistory(){try{const a=JSON.parse(localStorage.getItem(HISTORY)||'[]');return Array.isArray(a)?a:[]}catch{return []}}
function stamp(s){return Date.parse(s.updatedAt||s.created||s.date||'')||0}
function merge(a,b){const m=new Map();for(const x of [...b,...a]){if(!x||!x.id)continue;const old=m.get(String(x.id));if(!old||stamp(x)>=stamp(old))m.set(String(x.id),x)}return [...m.values()].sort((a,b)=>stamp(b)-stamp(a))}
function refresh(){window.dispatchEvent(new Event('cb-v2-cloud-setups-loaded'))}
function paint(){const connected=!!user;$('v2-cloud-out')?.toggleAttribute('hidden',connected);$('v2-cloud-in')?.toggleAttribute('hidden',!connected);if($('v2-cloud-email-label'))$('v2-cloud-email-label').textContent=user?.email||'';if($('v2-cloud-badge'))$('v2-cloud-badge').textContent=connected?'CONNECTED':'NOT CONNECTED'}
async function pullAndMerge(){
 if(!user)throw Error('Sign in first.');
 const [localSetups,localHistory]=await Promise.all([readSetups(),Promise.resolve(readHistory())]);
 const {data,error}=await sb.from('v2_cloud_documents').select('document_type,document_id,payload').eq('user_id',user.id);
 if(error)throw error;
 const cloudSetups=(data||[]).filter(x=>x.document_type==='planned_setup').map(x=>x.payload);
 const cloudHistory=(data||[]).filter(x=>x.document_type==='intrade_reset').map(x=>x.payload);
 const setups=merge(localSetups,cloudSetups),history=merge(localHistory,cloudHistory);
 // Never replace local data without first recording a recovery copy.
 try{await safetyBackup(localSetups,localHistory)}catch(e){throw Error('Safety backup could not be saved. Cloud merge stopped: '+e.message)}
 if(JSON.stringify(localSetups)!==JSON.stringify(setups))await writeSetups(setups);
 if(JSON.stringify(localHistory)!==JSON.stringify(history))localStorage.setItem(HISTORY,JSON.stringify(history));
 refresh();
 return {setups,history};
}
async function pushRows(type,items){
 for(let i=0;i<items.length;i+=15){
 const chunk=items.slice(i,i+15).map(x=>({user_id:user.id,document_type:type,document_id:String(x.id),payload:x,updated_at:new Date().toISOString()}));
 const {error}=await sb.from('v2_cloud_documents').upsert(chunk,{onConflict:'user_id,document_type,document_id'});
 if(error)throw error;
 }
}
async function sync(){if(!user||busy)return;busy=true;status('SYNCING…');try{
 const {setups,history}=await pullAndMerge();
 await pushRows('planned_setup',setups);
 await pushRows('intrade_reset',history);
 ready=true;status('✓ CLOUD SYNCED · '+setups.length+' SETUPS · '+history.length+' RESET LOGS');
 }catch(e){console.error('V2 cloud:',e);status('SYNC FAILED — LOCAL DATA PRESERVED. '+e.message,true)}finally{busy=false}}
function schedule(){if(!ready||!user)return;clearTimeout(timer);timer=setTimeout(sync,1400)}
async function login(signup){const email=$('v2-cloud-email').value.trim(),password=$('v2-cloud-password').value;if(!email||!password){status('Enter your email and password.',true);return}status('CONNECTING…');const {error}=signup?await sb.auth.signUp({email,password}):await sb.auth.signInWithPassword({email,password});if(error)status(error.message,true);else if(signup)status('Check your email if confirmation is required.');else status('CONNECTED — LOADING CLOUD…')}
function mount(){const slot=$('v2-settings-slot');if(!slot||$('v2-cloud-panel'))return;const card=document.createElement('section');card.id='v2-cloud-panel';card.innerHTML=`<div class="v2-cloud-title">CASA BANKO CLOUD</div><div class="v2-cloud-account"><div>CLOUD ACCOUNT <span id="v2-cloud-badge">NOT CONNECTED</span></div><p id="v2-cloud-email-label">Sign into your existing CASA BANKO account.</p></div><div id="v2-cloud-out"><input id="v2-cloud-email" type="email" autocomplete="email" placeholder="Cloud email"><input id="v2-cloud-password" type="password" autocomplete="current-password" placeholder="Password"><button id="v2-cloud-login">SIGN IN</button><button id="v2-cloud-signup">CREATE ACCOUNT</button></div><div id="v2-cloud-in" hidden><button id="v2-cloud-sync">SYNC NOW</button><button id="v2-cloud-restore">RESTORE / MERGE FROM CLOUD</button><p>Combines this device's saved setups and reset history with your cloud records. Creates a local safety backup first; never deletes cloud records.</p><button id="v2-cloud-signout">SIGN OUT</button></div><p id="v2-cloud-status" aria-live="polite">Cloud not connected.</p><p class="v2-cloud-foot">V2 sync: planned setups, screenshots, checklist answers, updates, and In-Trade Reset logs. Other journal data remains on its existing storage system.</p>`;slot.prepend(card);
 $('v2-cloud-login').onclick=()=>login(false);$('v2-cloud-signup').onclick=()=>login(true);
 $('v2-cloud-sync').onclick=sync;$('v2-cloud-restore').onclick=()=>{if(confirm('Merge cloud records with this device? A local safety backup will be created first.'))sync()};
 $('v2-cloud-signout').onclick=async()=>{ready=false;await sb.auth.signOut();status('Signed out.')};
 paint();
}
async function init(){mount();if(!window.supabase){status('Cloud library unavailable.',true);return}sb=window.supabase.createClient(URL,KEY);const {data,error}=await sb.auth.getSession();if(error)console.warn(error);user=data?.session?.user||null;paint();sb.auth.onAuthStateChange((event,session)=>{const before=user?.id;user=session?.user||null;paint();if(!user)ready=false;else if(event==='SIGNED_IN'&&before!==user.id)sync()});if(user)await sync()}
window.addEventListener('cb-v2-local-changed',schedule);window.addEventListener('storage',e=>{if(e.key===HISTORY)schedule()});
window.CasaBankoV2Cloud={sync};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();