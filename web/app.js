const $=id=>document.getElementById(id);
const cryptoSymbols=['BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','ADAUSDT'];
const forexSymbols=['XAU/USD','XAG/USD','EUR/USD','GBP/USD','USD/JPY'];
const rank={'1m':1,'5m':2,'15m':3,'30m':4,'1h':5,'4h':6,'1day':7};
let candles=[],lastAnalysis=null,busy=false;
function toast(s){$('toast').textContent=s;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',3500)}
function fmt(v){if(!Number.isFinite(v))return '—';return v>=100?v.toFixed(2):v.toFixed(5)}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
function setSymbols(){const a=$('market').value==='crypto'?cryptoSymbols:forexSymbols;$('symbol').innerHTML=a.map(x=>`<option>${x}</option>`).join('')}
$('market').addEventListener('change',setSymbols);setSymbols();
$('settingsBtn').onclick=()=>{$('apiKey').value=localStorage.getItem('td_key')||'';$('settings').showModal()};
$('saveKey').onclick=()=>{localStorage.setItem('td_key',$('apiKey').value.trim());toast('کلید در همین مرورگر ذخیره شد.')};
function interval(){return $('tf').value}
async function fetchCandles(symbol,tf,limit=220){
 let url,rows;
 if($('market').value==='crypto'){
  const map={'1day':'1d','1h':'1h','4h':'4h'};
  const iv=map[tf]||tf;
  url=`https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${iv}&limit=${limit}`;
  const r=await fetch(url);if(!r.ok)throw Error('Binance پاسخ نداد: '+r.status);
  rows=await r.json();
  return rows.map(x=>({time:x[0],open:+x[1],high:+x[2],low:+x[3],close:+x[4],volume:+x[5]}));
 }
 const key=localStorage.getItem('td_key');if(!key)throw Error('برای Forex/طلا ابتدا Twelve Data API Key را در تنظیمات وارد کنید.');
 const tfmap={'1m':'1min','5m':'5min','15m':'15min','30m':'30min','1h':'1h','4h':'4h','1day':'1day'};
 url=`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=${tfmap[tf]}&outputsize=${limit}&apikey=${encodeURIComponent(key)}`;
 const r=await fetch(url);if(!r.ok)throw Error('Twelve Data HTTP '+r.status);const j=await r.json();
 if(j.status==='error'||!j.values)throw Error(j.message||'خطای Twelve Data');
 return j.values.slice().reverse().map(x=>({time:Date.parse(x.datetime),open:+x.open,high:+x.high,low:+x.low,close:+x.close,volume:+(x.volume||0)}));
}
function ema(a,n){let k=2/(n+1),v=a[0];for(let i=1;i<a.length;i++)v=a[i]*k+v*(1-k);return v}
function rsi(a,n=14){let g=0,l=0;for(let i=a.length-n;i<a.length;i++){let d=a[i]-a[i-1];if(d>0)g+=d;else l-=d}g/=n;l/=n;return l===0?(g===0?50:100):100-100/(1+g/l)}
function analyze(cs){
 if(cs.length<60)throw Error('حداقل ۶۰ کندل لازم است');
 for(const c of cs)if(![c.open,c.high,c.low,c.close].every(v=>Number.isFinite(v)&&v>0)||c.high<Math.max(c.open,c.close)||c.low>Math.min(c.open,c.close)||c.high<c.low)throw Error('داده OHLC نامعتبر است');
 const cl=cs.map(c=>c.close),e20=ema(cl,20),e50=ema(cl,50),rv=rsi(cl),macdHist=[];
 for(let i=25;i<cl.length;i++)macdHist.push(ema(cl.slice(0,i+1),12)-ema(cl.slice(0,i+1),26));
 const macd=macdHist.at(-1),sig=ema(macdHist,9);let tr=0,p=0,m=0;
 for(let i=cs.length-14;i<cs.length;i++){let c=cs[i],q=cs[i-1];tr+=Math.max(c.high-c.low,Math.abs(c.high-q.close),Math.abs(c.low-q.close));let up=c.high-q.high,dn=q.low-c.low;if(up>dn&&up>0)p+=up;if(dn>up&&dn>0)m+=dn}
 const atr=tr/14,plus=atr?100*(p/14)/atr:0,minus=atr?100*(m/14)/atr:0,adx=plus+minus?100*Math.abs(plus-minus)/(plus+minus):0;
 const recent=cs.slice(-20),prev=cs.slice(-40,-20),res=Math.max(...recent.map(c=>c.high)),sup=Math.min(...recent.map(c=>c.low)),ph=Math.max(...prev.map(c=>c.high)),pl=Math.min(...prev.map(c=>c.low)),last=cs.at(-1),before=cs.at(-2);
 const tail=cl.slice(-20),mean=tail.reduce((a,b)=>a+b,0)/20,sd=Math.sqrt(tail.reduce((a,b)=>a+(b-mean)**2,0)/20);
 let score=0,reasons=[];
 if(e20>e50){score+=1.5;reasons.push('روند EMA20 بالاتر از EMA50 است.')}else{score-=1.5;reasons.push('روند EMA20 پایین‌تر از EMA50 است.')}
 if(rv>55&&rv<72){score++;reasons.push('RSI مومنتوم صعودی دارد.')}else if(rv<45&&rv>28){score--;reasons.push('RSI مومنتوم نزولی دارد.')}else if(rv>=72)reasons.push('RSI در اشباع خرید است.');else if(rv<=28)reasons.push('RSI در اشباع فروش است.');
 if(macd>sig&&macd>0){score++;reasons.push('MACD صعودی است.')}else if(macd<sig&&macd<0){score--;reasons.push('MACD نزولی است.')}
 if(plus>minus)score+=.75;else if(minus>plus)score-=.75;
 if(last.high>ph&&last.low>pl){score++;reasons.push('ساختار HH/HL صعودی است.')}else if(last.high<ph&&last.low<pl){score--;reasons.push('ساختار LH/LL نزولی است.')}
 if(last.close>mean&&last.close<mean+2*sd)score+=.25;if(last.close<mean&&last.close>mean-2*sd)score-=.25;
 if(last.close>last.open&&before.close<before.open&&last.close>before.open&&last.open<before.close){score+=.75;reasons.push('الگوی Bullish Engulfing دیده شد.')}
 else if(last.close<last.open&&before.close>before.open&&last.close<before.open&&last.open>before.close){score-=.75;reasons.push('الگوی Bearish Engulfing دیده شد.')}
 if(adx<16){score*=.75;reasons.push('ADX پایین است؛ روند قدرت کافی ندارد.')}else if(adx>25)reasons.push('قدرت روند با ADX تأیید نسبی می‌شود.');
 const direction=score>=2.25?'BUY':score<=-2.25?'SELL':'WAIT',entry=last.close,sl=entry+(direction==='BUY'?-1:1)*atr*1.5,tp=entry+(direction==='BUY'?1:-1)*atr*2.5;
 return {direction,score,strength:Math.min(100,Math.round(Math.abs(score)/6*100)),close:entry,rsi:rv,e20,e50,macd,atr,adx,support:sup,resistance:res,entry,sl:direction==='WAIT'?null:sl,tp:direction==='WAIT'?null:tp,reasons};
}
function drawChart(cs){const c=$('chart'),dpr=devicePixelRatio||1,w=c.clientWidth,h=220;c.width=w*dpr;c.height=h*dpr;const x=c.getContext('2d');x.scale(dpr,dpr);x.clearRect(0,0,w,h);const a=cs.slice(-60),lo=Math.min(...a.map(v=>v.low)),hi=Math.max(...a.map(v=>v.high)),span=hi-lo||1,pad=10,step=(w-2*pad)/a.length;const y=v=>pad+(hi-v)/span*(h-2*pad);x.strokeStyle='#20364d';for(let i=0;i<4;i++){let yy=pad+i*(h-2*pad)/3;x.beginPath();x.moveTo(0,yy);x.lineTo(w,yy);x.stroke()}a.forEach((v,i)=>{let xx=pad+(i+.5)*step,up=v.close>=v.open;x.strokeStyle=x.fillStyle=up?'#35d9a0':'#ff7182';x.lineWidth=1.2;x.beginPath();x.moveTo(xx,y(v.high));x.lineTo(xx,y(v.low));x.stroke();let top=y(Math.max(v.open,v.close)),bottom=y(Math.min(v.open,v.close));x.fillRect(xx-Math.max(1,step*.28),top,Math.max(2,step*.56),Math.max(1,bottom-top))})}
function showAnalysis(a){lastAnalysis=a;$('direction').textContent=a.direction;$('direction').className=a.direction.toLowerCase();$('strength').textContent=a.strength+'/100';$('price').textContent=fmt(a.close);$('rsi').textContent=a.rsi.toFixed(1);$('ema').textContent=fmt(a.e20)+' / '+fmt(a.e50);$('macd').textContent=fmt(a.macd);$('atr').textContent=fmt(a.atr);$('support').textContent=fmt(a.support);$('resistance').textContent=fmt(a.resistance);$('entry').textContent=fmt(a.entry);$('sl').textContent=fmt(a.sl);$('tp').textContent=fmt(a.tp);$('reasons').innerHTML=a.reasons.map(t=>`<li>${escapeHtml(t)}</li>`).join('');drawChart(candles);let hist=JSON.parse(localStorage.getItem('signals')||'[]');hist.unshift({symbol:$('symbol').value,tf:interval(),direction:a.direction,price:a.close,time:new Date().toLocaleString()});hist=hist.slice(0,30);localStorage.setItem('signals',JSON.stringify(hist));renderHistory()}
async function runAnalysis(){if(busy)return;busy=true;$('analyzeBtn').disabled=true;try{candles=await fetchCandles($('symbol').value,interval());showAnalysis(analyze(candles));toast('تحلیل با موفقیت انجام شد.')}catch(e){toast(e.message)}finally{busy=false;$('analyzeBtn').disabled=false}}
$('analyzeBtn').onclick=runAnalysis;
$('scanBtn').onclick=async()=>{if(busy)return;busy=true;$('scanBtn').disabled=true;$('scanResults').textContent='در حال اسکن…';let syms=$('market').value==='crypto'?cryptoSymbols:forexSymbols,results=[];for(const s of syms){try{let cs=await fetchCandles(s,interval(),120),a=analyze(cs);results.push({s,a})}catch(e){results.push({s,error:e.message})}}results.sort((a,b)=>(b.a?.strength||-1)-(a.a?.strength||-1));$('scanResults').innerHTML=results.map(v=>`<div class="scan-item"><b>${escapeHtml(v.s)}</b><span class="${escapeHtml(v.a?.direction.toLowerCase()||'')}">${v.a?`${escapeHtml(v.a.direction)} • ${v.a.strength}/100`:escapeHtml(v.error)}</span></div>`).join('');busy=false;$('scanBtn').disabled=false};
$('backtestBtn').onclick=async()=>{if(busy)return;busy=true;$('backtestBtn').disabled=true;$('backtestResults').textContent='در حال دریافت داده…';try{const cs=await fetchCandles($('symbol').value,interval(),500);let eq=1,peak=1,dd=0,wins=0,loss=0,gp=0,gl=0,trades=0,i=70;while(i<cs.length-2){let a=analyze(cs.slice(i-70,i+1));if(a.direction==='WAIT'){i++;continue}let long=a.direction==='BUY',en=cs[i+1].open,stop=en+(long?-1:1)*a.atr*1.5,target=en+(long?1:-1)*a.atr*2.5,exit=cs.at(-1).close,ei=cs.length-1;for(let j=i+1;j<cs.length;j++){let c=cs[j],sh=long?c.low<=stop:c.high>=stop,th=long?c.high>=target:c.low<=target;if(sh){exit=stop;ei=j;break}if(th){exit=target;ei=j;break}}let ret=(long?exit-en:en-exit)/en-.001;eq*=1+ret*.01;trades++;if(ret>0){wins++;gp+=ret}else{loss++;gl-=ret}peak=Math.max(peak,eq);dd=Math.max(dd,(peak-eq)/peak*100);i=ei+1}let pf=gl?gp/gl:(gp?Infinity:0);$('backtestResults').innerHTML=`<div class="scan-item">معاملات <b>${trades}</b></div><div class="scan-item">برد / باخت <b>${wins} / ${loss}</b></div><div class="scan-item">Win rate <b>${trades?(wins/trades*100).toFixed(1):0}%</b></div><div class="scan-item">بازده خالص <b>${((eq-1)*100).toFixed(2)}%</b></div><div class="scan-item">Profit factor <b>${Number.isFinite(pf)?pf.toFixed(2):'∞'}</b></div><div class="scan-item">Max drawdown <b>${dd.toFixed(2)}%</b></div>`}catch(e){$('backtestResults').textContent=e.message}finally{busy=false;$('backtestBtn').disabled=false}};
function renderHistory(){let h=JSON.parse(localStorage.getItem('signals')||'[]');$('history').innerHTML=h.length?h.map(v=>`<div class="item"><span>${escapeHtml(v.symbol)} • ${escapeHtml(v.tf)}</span><b class="${escapeHtml(v.direction.toLowerCase())}">${escapeHtml(v.direction)}</b><span>${fmt(v.price)}</span><small>${escapeHtml(v.time)}</small></div>`).join(''):'هنوز سیگنالی ذخیره نشده است.'}
$('clearHistory').onclick=()=>{localStorage.removeItem('signals');renderHistory()};renderHistory();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
