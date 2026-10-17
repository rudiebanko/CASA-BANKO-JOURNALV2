/* CASA BANKO Journal V2 — read-only TradeLocker connection, isolated from existing journal. */
(()=>{'use strict';
const URL='https://tpziplzdiifxryoourgp.supabase.co';
const KEY='sb_publishable_xoC6GqPpTNGGbbKcq1nLCw_qiaxUhMK';
const SDK='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.8/dist/umd/supabase.min.js';
let client,connection,account,refreshing=false;
const el=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const money=(n,cur='USD')=>Number.isFinite(Number(n))?new Intl.NumberFormat('en-US',{style:'currency',currency:cur}).format(Number(n)):'—';
function broadcast(detail){window.dispatchEvent(new CustomEvent('casa-banko:broker-state',{detail}))}
function status(s){el('v2-status').textContent=s;}
function mount(){
 const root=document.createElement('section');root.id='v2-broker';
 root.innerHTML=`<style>
 #v2-broker{border:1px solid #6c5421;border-radius:14px;background:#100e09;padding:14px;margin:0 0 18px;color:#f3f0e8;font-size:13px}
 #v2-broker h3{margin:0 0 10px;color:#d4af37;letter-spacing:2px;font-size:13px}
 #v2-broker .v2-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0}
 #v2-broker input,#v2-broker select{width:100%;min-width:0;background:#090909;color:#fff;border:1px solid #55451e;border-radius:8px;padding:10px}
 #v2-broker button{border:1px solid #a88633;background:#201909;color:#eac76c;border-radius:8px;padding:9px 12px}
 #v2-broker button:disabled{opacity:.5}#v2-broker .v2-small{color:#aaa;font-size:11px;line-height:1.5}
 #v2-broker .v2-num{font-size:22px;color:#f3df99;font-weight:700}#v2-account-list{display:grid;gap:10px;margin:12px 0}#v2-broker .v2-account-card{display:flex;width:100%;align-items:center;justify-content:space-between;text-align:left;background:#101010;border:1px solid #343434;border-radius:12px;padding:14px;color:#fff;gap:10px}#v2-broker .v2-account-card.selected{border-color:#d4af37;background:#19160e}#v2-broker .v2-account-card .v2-acct-label{font-weight:750;font-size:14px}#v2-broker .v2-account-card .v2-acct-balance{font-size:17px;font-weight:800;color:#f3df99}#v2-broker .v2-account-card .v2-acct-type{color:#999;font-size:11px;margin-top:4px}#v2-broker .v2-account-card .v2-check{color:#d4af37;font-size:22px}
 </style><h3>TRADELOCKER · CONNECTION</h3><div class="v2-small">Read-only broker preview. Your local journal entries remain separate. No live trade import yet.</div>
 <div id="v2-status" class="v2-small" role="status">Loading secure login…</div>
 <form id="v2-login" hidden><div class="v2-row"><input type="email" id="v2-email" autocomplete="username" placeholder="Supabase account email" required></div><div class="v2-row"><input type="password" id="v2-password" autocomplete="current-password" placeholder="Password" required></div><button type="submit">SIGN IN</button></form>
 <div id="v2-connected" hidden><div class="v2-small" style="margin-top:10px">SELECT TRADELOCKER ACCOUNT</div><div id="v2-account-list" role="group" aria-label="TradeLocker accounts"></div>
 <div id="v2-balance" class="v2-num">—</div><div id="v2-pnl" class="v2-small">Today's broker P&L: —</div>
 <div class="v2-row"><button id="v2-refresh">REFRESH BROKER</button><button id="v2-logout">SIGN OUT</button></div><div id="v2-updated" class="v2-small"></div></div>`;
 const slot=document.getElementById('v2-settings-slot');if(!slot)throw new Error('Settings mount missing; refusing to display TradeLocker on LOG screen');slot.append(root);
 el('v2-login').addEventListener('submit',login);

 el('v2-refresh').addEventListener('click',refresh);
 el('v2-logout').addEventListener('click',async()=>{await client.auth.signOut();connection=null;account=null;showLogin('Signed out.');});
}
function renderAccounts(){const list=el('v2-account-list');if(!list)return;list.replaceChildren();(connection?.account_summary?.accounts||[]).forEach((a,i)=>{const id=String(a.id);const active=String(account?.id)===id;const btn=document.createElement('button');btn.type='button';btn.className='v2-account-card'+(active?' selected':'');btn.setAttribute('aria-pressed',String(active));const left=document.createElement('span');const label=document.createElement('div');label.className='v2-acct-label';label.textContent='Account '+String(a.accNum||a.accountId||a.id||i+1);const type=document.createElement('div');type.className='v2-acct-type';type.textContent=String(connection?.environment||'TRADELOCKER').toUpperCase()+' · '+String(connection?.server||'BROKER');left.append(label,type);const right=document.createElement('span');const balance=document.createElement('div');balance.className='v2-acct-balance';const raw=Number(a.balance??a.accountBalance??a.equity);balance.textContent=Number.isFinite(raw)?money(raw,a.currency||'USD'):'Tap to view balance';right.append(balance);if(active){const check=document.createElement('div');check.className='v2-check';check.textContent='✓';right.append(check)}btn.append(left,right);btn.addEventListener('click',()=>{if(String(account?.id)===id)return;account=a;localStorage.setItem('cb-v2-selected-account',id);el('v2-balance').textContent='Loading selected balance…';el('v2-pnl').textContent='Today’s broker P&L: —';renderAccounts();refresh()});list.append(btn)})}
function showLogin(message){broadcast({status:'offline'});el('v2-login').hidden=false;el('v2-connected').hidden=true;status(message||'Sign in using the same account as your existing CASA BANKO Journal.');}
async function login(e){e.preventDefault();const b=e.submitter;b.disabled=true;status('Signing in…');try{const {error}=await client.auth.signInWithPassword({email:el('v2-email').value,password:el('v2-password').value});if(error)throw error;el('v2-password').value='';await loadConnection()}catch(err){showLogin('Sign in failed: '+err.message)}finally{b.disabled=false}}
async function loadConnection(){
 const {data:{session}}=await client.auth.getSession();if(!session){showLogin();return}
 status('Checking your existing TradeLocker connection…');
 const {data,error}=await client.from('tradelocker_connections').select('account_summary,environment,server').eq('user_id',session.user.id).maybeSingle();
 if(error){showLogin('Could not load account: '+error.message);return}
 if(!data){showLogin('No TradeLocker connection found for this login. Connect it through your existing journal first.');return}
 connection=data;
 const accounts=data.account_summary?.accounts||[];
 if(!accounts.length){showLogin('Connected, but no TradeLocker accounts were returned.');return}
 const saved=localStorage.getItem('cb-v2-selected-account');
 account=accounts.find(a=>String(a.id)===saved)||accounts[0];renderAccounts();
 el('v2-login').hidden=true;el('v2-connected').hidden=false;status('Authenticated · connected account');
 await refresh();
}
async function invoke(name){
 const {data:{session},error}=await client.auth.getSession();if(error||!session)throw Error('Session expired; sign in again');
 const {data,resultError,error:fnError}=await client.functions.invoke(name,{body:{account:{id:account.id}}});
 if(fnError||resultError)throw Error((fnError||resultError).message||name+' failed');
 if(data?.error)throw Error(data.error);
 return data;
}
async function refresh(){
 if(refreshing||!account)return;refreshing=true;el('v2-refresh').disabled=true;status('Refreshing broker account…');broadcast({status:'syncing'});
 try{
  const state=await invoke('tradelocker-account-state');
  if(String(state.accountId)!==String(account.id))throw Error('Broker account ID mismatch');
  const cur=state.currency||'USD';el('v2-balance').textContent='Balance: '+money(state.balance,cur);account.balance=Number(state.balance);account.currency=cur;renderAccounts();
  const day=await invoke('tradelocker-daily-pnl');
  el('v2-pnl').textContent='Today’s broker P&L: '+(day.available&&Number.isFinite(Number(day.todayPnl))?money(day.todayPnl,cur):'Unavailable');broadcast({status:'connected',available:day.available===true,todayPnl:day.todayPnl,balance:state.balance,currency:cur});
  el('v2-updated').textContent='Last refreshed: '+new Date().toLocaleString();
  status('Connected · broker values');
 }catch(err){broadcast({status:'offline'});status('Broker refresh failed: '+err.message);el('v2-updated').textContent='Values may be stale. No local journal data was changed.'}
 finally{refreshing=false;el('v2-refresh').disabled=false}
}
window.CasaBankoV2Broker={
 async syncTrades(){
  if(!client||!account?.id)throw Error('Connect and select a TradeLocker account in Settings.');
  const selectedId=String(account.id);
  const {data:{session}}=await client.auth.getSession();
  if(!session)throw Error('TradeLocker session expired. Sign in again.');
  const {data,error}=await client.functions.invoke('tradelocker-sync',{body:{account}});
  if(error||data?.error)throw Error(error?.message||data?.error||'Trade sync failed');
  if(String(account?.id)!==selectedId)throw Error('Selected account changed during sync. Retry.');
  if(!Array.isArray(data?.trades))throw Error('TradeLocker did not return a valid trades list.');
  return {accountId:selectedId,trades:data.trades};
 },
 accountId(){return account?.id!=null?String(account.id):null}
};
async function start(){
 mount();
 try{
  if(!window.supabase?.createClient){
   await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=SDK;s.onload=resolve;s.onerror=()=>reject(Error('Could not load authentication library'));document.head.append(s)});
  }
  client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'casa-banko-journal-v2-auth'}});
  client.auth.onAuthStateChange((_event,session)=>{if(!session){connection=null;account=null;showLogin()}});
  await loadConnection();
 }catch(err){status('Connection setup failed: '+err.message)}
}
function refreshWhenVisible(){if(!document.hidden&&account&&!refreshing)refresh()}
setInterval(refreshWhenVisible,30*1000);
window.addEventListener('focus',refreshWhenVisible);
document.addEventListener('visibilitychange',refreshWhenVisible);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
