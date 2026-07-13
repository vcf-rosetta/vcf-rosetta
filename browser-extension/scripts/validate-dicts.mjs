// 词典与发布不变量校验(CI + 本地发布前跑)。
//   node browser-extension/scripts/validate-dicts.mjs
// 检查项:
//   1. langs.json 与 dict.<lang>.json 一一对应,词典是扁平 {英文串: 译文串} 映射且条数够
//   2. 版本不变量:langs.json 各语言 version 合法;有对应 git tag(v<版本>)则钉版 URL 生效,
//      无 tag 仅告警(发布流程是先 bump 后打 tag,中间状态合法 —— 扩展会退回 @main)
//   3. zh-TW 简体残留:只查「无合法繁体用法」的简体专属字(SIMP_ONLY 集)。
//      ★ 不要用 OpenCC s2tw 全量回译来校验 —— 会把台/游/准/余/云/伙/里 等台湾正字误报
//        (量词「台」558 处全是对的,臺 只用于地名)。历史审计见 docs / 维护者笔记。
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ext = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIN_ENTRIES = 10000;   // 5 语种目前均 ≈4-5 万条;跌破一个量级说明构建产物损坏
let failed = false;
const fail = msg => { console.error('✗ ' + msg); failed = true; };
const ok = msg => console.log('✓ ' + msg);
const warn = msg => console.warn('⚠ ' + msg);

// ── 简体专属字集(在繁体文本中不该出现的字形;台/游/准/余/云/伙/里/干/并 等
//    在台湾正字里有合法用法的字一律不进此集,避免误报)──
const SIMP_ONLY =
  // 简化偏旁族(整字含简化部件,繁体文本不可能出现)
  '计订认讥议讨让训讯记讲许论讼设访诉诊译词试诗诚话诞询该详语误说请诸诺读课谁调谈谊谢谨证评识' + // 讠
  '红纤级纪约纯纲纳纵纷纸纹纺线练组细织终绍经绑结绕绘给络绝统继绩绪续维绵绿缓编缘缚缝缩'      + // 纟
  '钉针钟钢钩钮钱钻铁铃银铜铭链销锁错锐锦键镜'                                                    + // 钅
  '门闪闭问闯闲间闷闸闹闻阀阁阅阐阔'                                                              + // 门
  '马驰驱驳驶驻驾验骤骗'                                                                          + // 马
  '贝负贡财责贤败账货质贩购贯贴贵贷贸费贺资赋赖赏赐赔赚赠赞赢'                                    + // 贝
  '页顶项顺须顽顾顿预领频颗题颜额'                                                                + // 页
  '车轨转轮软轻载较辅辆辑输'                                                                      + // 车
  '饭饮饰馆'                                                                                      + // 饣
  '鸟鸡鸣'                                                                                        + // 鸟
  '风龙围违伟'                                                                                    + // 风/龙/韦
  // 高置信单字(简繁字形不同码位,且该简体码位在台湾正字里无合法用法)
  '为们优传会体众处复头夺妇学实审写军农决况净减击创删务动劳势华协单历压双变' +
  '发对导寻将尽层属币帮库应开异张当录归总恶战户执扩败无时显暂术权极构没确' +
  '数忆网机错误维护应断连启闭关'
  ;
const SIMP_SET = new Set(SIMP_ONLY);

const manifest = JSON.parse(readFileSync(join(ext, 'manifest.json'), 'utf8'));
const langsFile = JSON.parse(readFileSync(join(ext, 'langs.json'), 'utf8'));
const langs = langsFile.languages || {};
if (!Object.keys(langs).length) fail('langs.json 无 languages');

// git tag 列表(CI 需 fetch-depth:0;取不到只降级告警)
let tags = new Set();
try {
  tags = new Set(execFileSync('git', ['tag', '-l'], { cwd: ext, encoding: 'utf8' }).split('\n').filter(Boolean));
} catch { warn('读不到 git tag(浅克隆?),跳过 tag 存在性检查'); }

for (const [lang, meta] of Object.entries(langs)) {
  const file = join(ext, `dict.${lang}.json`);
  if (!existsSync(file)) { fail(`langs.json 声明 ${lang} 但缺 dict.${lang}.json`); continue; }

  // 1. 扁平映射 + 条数
  let raw, dict;
  try { raw = readFileSync(file); dict = JSON.parse(raw.toString('utf8')); }
  catch (e) { fail(`dict.${lang}.json 解析失败: ${e.message}`); continue; }
  if (!dict || typeof dict !== 'object' || Array.isArray(dict)) { fail(`dict.${lang}.json 不是对象`); continue; }
  const bad = [];
  let n = 0;
  for (const [k, v] of Object.entries(dict)) {
    if (typeof v !== 'string') { bad.push(k); continue; }
    if (!k.trim() || !v.trim()) bad.push(k);
    n++;
  }
  if (bad.length) fail(`dict.${lang}.json 有 ${bad.length} 个非字符串/空白条目,如: ${bad.slice(0, 5).join(' | ')}`);
  if (n < MIN_ENTRIES) fail(`dict.${lang}.json 仅 ${n} 条(< ${MIN_ENTRIES}),构建产物疑似损坏`);
  else ok(`dict.${lang}.json ${n} 条,扁平映射`);

  // 1b. 完整性:langs.json 登记的 sha256 必须与词典字节一致 —— 扩展下载后据此校验,CI 里也确保
  //     dict 是由 glossary 重建的(手改 dict 或改 glossary 忘重建都会哈希对不上)。
  const digest = createHash('sha256').update(raw).digest('hex');
  if (!meta.sha256) fail(`langs.json ${lang} 缺 sha256(跑 node browser-extension/build-dict.mjs 生成)`);
  else if (meta.sha256 !== digest) fail(`dict.${lang}.json 与 langs.json 登记的 sha256 不符(实得 ${digest.slice(0, 12)}…,登记 ${meta.sha256.slice(0, 12)}…)—— 词典未由 glossary 重建?`);
  else ok(`dict.${lang}.json sha256 与 langs.json 一致`);

  // 1c. 占位符对称:键含 {0}/{1}/%s/%d 等占位而译文缺(或反之)= 运行期坏串。存量少量已知截断,
  //     暂作告警不阻断;新增大量不对称时人工复核。
  const PLACEHOLDER = /\{\d+\}|%\d*\$?[sd@]/g;
  let phMismatch = 0; const phExamples = [];
  for (const [k, v] of Object.entries(dict)) {
    if (typeof v !== 'string') continue;
    const kp = (k.match(PLACEHOLDER) || []).sort().join(',');
    const vp = (v.match(PLACEHOLDER) || []).sort().join(',');
    if (kp !== vp) { phMismatch++; if (phExamples.length < 5) phExamples.push(`"${k}" → "${v}"`); }
  }
  if (phMismatch) warn(`dict.${lang}.json 占位符不对称 ${phMismatch} 条(人工复核),如: ${phExamples.join(' | ')}`);

  // 2. 版本
  if (!/^\d+\.\d+\.\d+$/.test(meta.version || '')) fail(`langs.json ${lang} version 非法: ${meta.version}`);
  else if (tags.size && !tags.has('v' + meta.version)) {
    if (meta.version === manifest.version) warn(`${lang} v${meta.version} 尚无 tag(与 manifest 同步的待发布版本,扩展先走 @main)`);
    else fail(`langs.json ${lang} version=${meta.version} 无对应 tag v${meta.version},钉版词典 URL 永远 404`);
  }

  // 3. zh-TW 简体残留(SIMP_ONLY 白名单策略,不跑 OpenCC 全量回译)
  if (lang === 'zh-TW') {
    const hits = [];
    for (const [k, v] of Object.entries(dict)) {
      if (typeof v !== 'string') continue;
      for (const ch of v) if (SIMP_SET.has(ch)) { hits.push(`"${k}" → "${v}" (含「${ch}」)`); break; }
    }
    if (hits.length) fail(`dict.zh-TW.json 简体残留 ${hits.length} 条:\n  ` + hits.slice(0, 20).join('\n  '));
    else ok('dict.zh-TW.json 无简体专属字残留');
  }
}

// 4. 反向映射:每个 dict.<lang>.json 都必须在 langs.json 登记 —— 否则会被 pack-store 通配
//    (dict.*.json)悄悄打进离线包,却无目录项/无哈希、不受管控。
const dictFiles = readdirSync(ext).filter(f => /^dict\.[a-z]{2}(-[A-Z]{2})?\.json$/.test(f));
for (const f of dictFiles) {
  const code = f.match(/^dict\.(.+)\.json$/)[1];
  if (!langs[code]) fail(`${f} 存在但未在 langs.json 登记(会被打包却不受管控)`);
}
if (dictFiles.length === Object.keys(langs).length) ok(`dict 文件与 langs.json 一一对应(${dictFiles.length} 个)`);

if (failed) { console.error('\n校验失败'); process.exit(1); }
console.log('\n全部校验通过');
