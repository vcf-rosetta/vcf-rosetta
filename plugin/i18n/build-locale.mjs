import fs from "node:fs"; import path from "node:path"; import zlib from "node:zlib";
const ROOT="/tmp/lang"; const LOC=process.argv[2]; // 如 de / zh_TW / ja
// locale 在 vmsg 用目录名(de/ja/zh_CN),在 properties 用后缀(_de)
const dirTok=LOC, sufTok="_"+LOC;
function walk(d,a){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p,a);else a.push(p);}return a;}
const files=walk(ROOT,[]);
function read(p){try{let b=fs.readFileSync(p);if(p.endsWith(".gz"))b=zlib.gunzipSync(b);return b.toString("utf8");}catch(e){return null;}}
const deUni=s=>s.replace(/\\u([0-9a-fA-F]{4})/g,(_,h)=>String.fromCharCode(parseInt(h,16)));
function parseKV(t){const o={};if(!t)return o;for(let l of t.split(/\r?\n/)){l=l.trim();if(!l||l[0]==="#"||l[0]==="!")continue;const i=l.indexOf("=");if(i<1)continue;o[l.slice(0,i).trim()]=deUni(l.slice(i+1).trim());}return o;}
function parseAny(p){const t=read(p);if(!t)return{};if(/\.json(\.gz)?$/.test(p)){try{const j=JSON.parse(t);const o={};for(const k in j)if(typeof j[k]==="string")o[k]=j[k];return o;}catch(e){return{};}}return parseKV(t);}
const isRes=p=>/\.(properties|vmsg|json)(\.gz)?$/.test(p);
const locFiles=files.filter(p=>isRes(p)&&(p.includes("/"+dirTok+"/")||p.includes(sufTok+".")));
function cands(p){return [p.replace("/"+dirTok+"/","/en/"),p.replace("/"+dirTok+"/","/en_US/"),p.replace(sufTok+".","_en."),p.replace(sufTok+".","_en_US."),p.replace(sufTok+".",".")];}
const map={};let pairs=0;
for(const lf of locFiles){const en=cands(lf).find(c=>c!==lf&&fs.existsSync(c));if(!en)continue;pairs++;const ez=parseAny(en),lz=parseAny(lf);for(const k in lz){const e=ez[k],z=lz[k];if(!e||!z||e===z||!/[A-Za-z]/.test(e))continue;if(map[e]===undefined)map[e]=z;}}
const PH=/\{\d+\}|%[sd@]|%\d+\$|\$\{/;
const out={};for(const e in map){if(e.length<2||e.length>160||PH.test(e)||!/[A-Za-z]/.test(e))continue;out[e]=map[e];}
const sorted=Object.keys(out).sort((a,b)=>a.toLowerCase()<b.toLowerCase()?-1:1).reduce((o,k)=>{o[k]=out[k];return o;},{});
const outPath="plugin/i18n/glossary."+LOC.replace("_","-")+".json";
fs.writeFileSync(outPath,JSON.stringify(sorted,null,2)+"\n");
console.log(LOC+": 文件配对",pairs," 词条",Object.keys(sorted).length," -> "+outPath);
["Datastore","Cluster","Summary","Download plug-in","Power On"].forEach(k=>console.log("  "+k+" => "+(sorted[k]||"(无)")));
