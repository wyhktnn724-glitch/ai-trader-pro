
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ids=['market','symbol','tf','settingsBtn','settings','apiKey','saveKey','analyzeBtn','direction','strength','price','rsi','ema','macd','atr','support','resistance','entry','sl','tp','reasons','chart','scanBtn','scanResults','backtestBtn','backtestResults','clearHistory','history','toast'];
const els={};
for(const id of ids) els[id]={value:id==='market'?'crypto':id==='tf'?'5m':'',innerHTML:'',textContent:'',className:'',disabled:false,clientWidth:600,
 addEventListener(){},showModal(){},close(){},getContext(){return {scale(){},clearRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},fillRect(){},set strokeStyle(v){},set fillStyle(v){},set lineWidth(v){}}}};
const document={getElementById:id=>els[id]||(els[id]={value:'',innerHTML:'',textContent:'',addEventListener(){}})};
const localStorage={getItem(){return null},setItem(){},removeItem(){}};
const window={addEventListener(){}};
const context={document,localStorage,window,navigator:{},devicePixelRatio:1,console,Math,Date,Number,JSON,encodeURIComponent,fetch:async()=>{},setTimeout(){},clearTimeout(){}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(process.argv[2],'utf8'),context);
const cs=[];let price=100;
for(let i=0;i<150;i++){let o=price,c=price+(i%7-2)*.12;cs.push({open:o,close:c,high:Math.max(o,c)+.2,low:Math.min(o,c)-.2,time:i});price=c;}
const a=context.analyze(cs);
assert(['BUY','SELL','WAIT'].includes(a.direction));
assert(Number.isFinite(a.rsi)&&a.rsi>=0&&a.rsi<=100);
assert(a.atr>0&&a.support<=a.resistance);
assert.strictEqual(context.escapeHtml('<img src=x onerror=alert(1)>'),'&lt;img src=x onerror=alert(1)&gt;');
let threw=false;try{context.analyze(cs.slice(0,20))}catch(e){threw=true}assert(threw);
console.log('PASS: JavaScript syntax loaded; 150-candle analysis; RSI bounds; ATR/support/resistance; HTML escaping; insufficient-history rejection');
