(()=>{'use strict';
let broker=null;
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
 const balance=broker&&Number.isFinite(Number(broker.balance))?Number(broker.balance):null;
 const dayPnl=broker?.available===true&&broker.todayPnl!=null?Number(broker.todayPnl):null;
 const period=trades?trades.map(t=>({d:parseDate(t),p:parsePnl(t)})).filter(t=>t.d&&t.d>=new Date('2026-09-01T00:00:00-07:00')&&t.d<=now):[];
 const total=trades&&period.every(t=>t.p!==null)?period.reduce((a,t)=>a+t.p,0):null;
 const start=balance!==null&&total!==null?balance-total:null,change=start!==null?balance-start:null,pct=start>0?change/start*100:null;
 const tile=(label,value)=>'<div class="v2-stat"><div class="v2-stat-label">'+label+'</div><div class="v2-stat-value">'+value+'</div></div>';
 let graph='<p class="small">Connect TradeLocker and reconcile trade history to display account progress.</p>';
 if(start!==null&&period.length){let running=start;const values=[start,...period.slice().sort((a,b)=>a.d-b.d).map(t=>running+=t.p)],low=Math.min(...values),span=Math.max(...values)-low||1,points=values.map((v,i)=>(i/(values.length-1)*100).toFixed(2)+','+(36-(v-low)/span*32).toFixed(2)).join(' ');graph='<svg viewBox="0 0 100 40" preserveAspectRatio="none" style="width:100%;height:150px;margin:15px 0" aria-label="Account progress"><polyline points="'+points+'" fill="none" stroke="#d7b43d" stroke-width=".8" vector-effect="non-scaling-stroke"/></svg>'}
 root.innerHTML='<div class="card gold"><div class="section-title">DAILY SUMMARY</div><div class="v2-stat-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));gap:6px">'+tile('TOTAL TRADES',trades?daily.length:'—')+tile('WINS',trades&&complete?wins:'—')+tile('LOSSES',trades&&complete?losses:'—')+tile('BE',trades&&complete?be:'—')+tile('WIN RATE',trades&&complete?(daily.length?Math.round(wins/daily.length*100):0)+'%':'—')+tile('P&L · TRADELOCKER',money(dayPnl))+'</div></div><div class="card gold" style="margin:12px 0"><div class="section-title">ACCOUNT PROGRESS <span style="font-size:10px">SEP 1, 2026 — PRESENT</span></div><div class="v2-stat-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));gap:6px">'+tile('STARTING BALANCE',money(start))+tile('CURRENT BALANCE',money(balance))+tile('CHANGE',change===null?'—':money(change)+' · '+(pct===null?'—':(pct>=0?'+':'')+pct.toFixed(2)+'%'))+'</div>'+graph+'<p class="small">SEP 1 — TODAY · Calculated from available reconciled trades and live balance.</p></div>';
}
window.CasaBankoV2Dashboard=draw;
window.addEventListener('casa-banko:broker-state',e=>{broker=e.detail?.status==='connected'?e.detail:null;draw()});
window.addEventListener('casa-banko:genesis-reconciled',draw);
})();