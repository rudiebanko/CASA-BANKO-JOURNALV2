(()=>{'use strict';
let broker=null;
const cutoff=new Date('2026-10-17T00:00:00-07:00');
const baselineKey=id=>'cb-v2-stats-baseline-2026-10-17::'+id;
const money=n=>n==null||!Number.isFinite(n)?'—':(n<0?'−':'')+'$'+Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
function draw(){
 const root=document.getElementById('v2-dashboard-panels');if(!root)return;
 const id=window.CasaBankoV2Broker?.accountId?.();let trades=null;
 try{const data=JSON.parse(localStorage.getItem('cb-v2-linked-broker-trades::'+id)||'{}');if(id&&Array.isArray(data.rows))trades=data.rows}catch{}
 const parseDate=t=>{const v=t.closeTime??t.close_time??t.closedAt??t.closed_at??t.exitTime??t.exit_time??t.closeDate??t.date??t.savedAt;if(!v)return null;const n=Number(v),d=Number.isFinite(n)&&n>0?new Date(n<1e12?n*1000:n):new Date(v);return Number.isFinite(d.getTime())?d:null};
 const parsePnl=t=>{const v=t.netPnl??t.net_pnl??t.pnl??t.profit??t.netProfit??t.net_profit;if(v==null)return null;const n=Number(String(v).replace(/[$,]/g,''));return Number.isFinite(n)?n:null};
 const date=d=>new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
 const now=new Date(),daily=trades?trades.filter(t=>{const d=parseDate(t);return d&&date(d)===date(now)}):[];
 const complete=daily.every(t=>parsePnl(t)!==null),wins=daily.filter(t=>parsePnl(t)>0).length,losses=daily.filter(t=>parsePnl(t)<0).length,be=daily.filter(t=>parsePnl(t)===0).length;
 const balance=broker&&broker.balance!=null&&Number.isFinite(Number(broker.balance))?Number(broker.balance):null;
 let baseline=null;
 if(id){try{const saved=JSON.parse(localStorage.getItem(baselineKey(id))||'null');if(saved&&Number.isFinite(saved.balance))baseline=saved.balance}catch{}}
 if(id&&baseline===null&&balance!==null){baseline=balance;try{localStorage.setItem(baselineKey(id),JSON.stringify({balance:baseline,capturedAt:new Date().toISOString()}))}catch{}}
 const dayPnl=broker?.available===true&&broker.todayPnl!=null?Number(broker.todayPnl):null;
 const period=trades?trades.map(t=>({d:parseDate(t),p:parsePnl(t)})).filter(t=>t.d&&t.d>=cutoff&&t.d<=now):[];
 const total=trades&&period.every(t=>t.p!==null)?period.reduce((a,t)=>a+t.p,0):null;
 const start=baseline,change=start!==null&&balance!==null?balance-start:null,pct=start>0&&change!==null?change/start*100:null;
 const tile=(label,value)=>'<div class="v2-stat" style="min-width:0;padding:12px 9px;overflow:hidden"><div class="v2-stat-label" style="font-size:10px;line-height:1.35;overflow-wrap:anywhere">'+label+'</div><div class="v2-stat-value" style="font-size:clamp(14px,3.6vw,23px);line-height:1.25;overflow-wrap:anywhere;word-break:normal">'+value+'</div></div>';
 let graph='<p class="small">Connect TradeLocker and reconcile trade history to display account progress.</p>';
 if(start!==null&&period.length&&period.every(t=>t.p!==null)){let running=start;const values=[start,...period.slice().sort((a,b)=>a.d-b.d).map(t=>running+=t.p)],low=Math.min(...values),span=Math.max(...values)-low||1,points=values.map((v,i)=>(i/(values.length-1)*100).toFixed(2)+','+(36-(v-low)/span*32).toFixed(2)).join(' ');graph='<svg viewBox="0 0 100 40" preserveAspectRatio="none" style="width:100%;height:150px;margin:15px 0" aria-label="Account progress"><polyline points="'+points+'" fill="none" stroke="#d7b43d" stroke-width=".8" vector-effect="non-scaling-stroke"/></svg>'}
 root.innerHTML='<div class="card gold"><div class="section-title">DAILY SUMMARY</div><div class="v2-stat-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));gap:6px">'+tile('TOTAL TRADES',trades?daily.length:'—')+tile('WINS',trades&&complete?wins:'—')+tile('LOSSES',trades&&complete?losses:'—')+tile('BE',trades&&complete?be:'—')+tile('WIN RATE',trades&&complete?(daily.length?Math.round(wins/daily.length*100):0)+'%':'—')+tile('P&L · TRADELOCKER',money(dayPnl))+'</div></div><div class="card gold" style="margin:12px 0"><div class="section-title">ACCOUNT PROGRESS <span style="font-size:10px;letter-spacing:0">OCT 17, 2026 — PRESENT</span></div><div class="v2-stat-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));gap:6px">'+tile('STARTING BALANCE',money(start))+tile('CURRENT BALANCE',money(balance))+tile('CHANGE',change===null?'—':money(change)+' · '+(pct===null?'—':(pct>=0?'+':'')+pct.toFixed(2)+'%'))+'</div>'+graph+'<p class="small">OCT 17 — TODAY · Baseline captured once from TradeLocker on this device; current balance remains live. Trades before Oct 17 are excluded.</p></div>';
}
window.CasaBankoV2Dashboard=draw;
window.addEventListener('casa-banko:broker-state',e=>{broker=e.detail?.status==='connected'?e.detail:null;draw()});
window.addEventListener('casa-banko:genesis-reconciled',draw);
})();