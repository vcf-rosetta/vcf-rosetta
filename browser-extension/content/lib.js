// 纯函数库:词典清洗 / 归一化 / 采集过滤 / 受控模式替换(PHRASES)。
// 无 DOM、无 chrome.* 依赖 —— 同一份代码供两处使用:
//   ① 内容脚本(manifest 中先于 translator.js 注入,挂到 globalThis.__vcLib);
//   ② Node 单测(tests/,经 module.exports 直接 require)。
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.__vcLib = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // 载入前校验:词典必须是 {英文串: 译文串} 的扁平映射,丢弃一切非字符串值(_note 等元数据、
  // 结构异常的远程内容),并落到无原型对象上 —— 页面上出现 "constructor"/"toString" 这类文本时
  // 不会命中 Object.prototype 的继承属性而被换成函数源码。
  function sanitizeDict(j) {
    if (!j || typeof j !== 'object' || Array.isArray(j)) return null;
    const out = Object.create(null);
    let n = 0;
    for (const k in j) {
      if (typeof j[k] === 'string') { out[k] = j[k]; n++; }
    }
    return n > 0 ? out : null;
  }

  // ── 归一化二级索引 ─────────────────────────────────────────
  // 词典键与页面文本常只差大小写 / 尾部 ":"、"…"、"..."(不同版本控制台的措辞漂移,
  // 如 9.0.x 与 9.1 同一标签一个带冒号一个不带)。精确匹配 miss 后按归一化形式再查一次,
  // 命中后把页面端的尾部标点原样带回译文。
  const TAIL_RE = /\s*(\.{3}|…|:|:)$/;
  function normTerm(s) {
    return s.toLowerCase().replace(TAIL_RE, '').replace(/[\s ]+/g, ' ').trim();
  }
  function buildAux(d) {
    const aux = Object.create(null);
    for (const k in d) {
      const n = normTerm(k);
      if (!n) continue;
      // 同归一形冲突时取更短的键(裸形优先于带冒号/省略号的变体)
      if (aux[n] === undefined || k.length < aux[n].length) aux[n] = k;
    }
    return aux;
  }

  // 异常标记:帮助维护者快速判断该条该怎么处理
  function classifyFlags(s) {
    const f = [];
    if (/\d/.test(s)) f.push('含数字·疑动态');       // 可能该进 PHRASES 模式而非词典
    if (s.length > 60) f.push('长句');
    if (/^[a-z]/.test(s)) f.push('疑片段');           // 小写开头,可能是被拆开的句子片段
    if (/^[A-Z0-9 ()/_-]+$/.test(s) && s.length <= 28) f.push('全大写');
    if (/[{}]|\$\{|%[sd@]|\bundefined\b|\[object/.test(s)) f.push('疑占位/异常');
    if (/[A-Za-z][\w.]*(\.[A-Za-z][\w]*){2,}/.test(s)) f.push('疑标识符');  // 点分 key
    return f;
  }
  // 动态数据:随时间/实例变化,混进词库只会污染对齐,采集阶段就剔除。
  // (日期 05/03/2026 / 时钟 11:42:09 PM / MAC 00:50:56:.. / 纯数值±单位 "0 MB"、"0 free")
  const DYNAMIC_RE = [
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,                                                            // 日期
    /\b\d{1,2}:\d{2}(:\d{2})?\b/,                                                               // 时钟(也覆盖 MAC 冒号段)
    /\b([0-9a-f]{2}:){2,}[0-9a-f]{2}\b/i,                                                       // MAC 地址
    /^[\s\d.,:%()|/_-]*\d[\s\d.,:%()|/_-]*(MB|GB|KB|TB|PB|MHz|GHz|kHz|Hz|ms|bps|free|used)?\s*$/i, // 纯数值±单位
  ];
  // 机器标识/代码/无障碍文本:不是给人读的 UI 串,采集阶段直接剔除(高精度,实测零误杀)。
  // 命中的典型噪声:API 路径、URN、点分标识符、主机名、snake/驼峰类名、快捷键、图表无障碍、动态数值。
  const NOISE_RE = [
    /^[a-z][\w.]*(\/[\w.{}-]+)+$/i,                  // 斜杠路径(REST API):token/token,无空格
    /^urn:|:\/\//,                                   // urn:... 或含 ://(URL)
    /^[a-z][\w-]*(\.[a-z][\w-]*){2,}$/i,             // 点分标识符 com.vmware.cns(无空格)
    /^[\w-]+(\.[\w-]+)+(:\d+)?$/,                    // 主机名/FQDN(可带 :端口),无空格
    /^[a-z0-9]+(_[a-z0-9]+)+$/i,                     // snake_case 单 token
    /^[A-Za-z][a-z0-9]+([A-Z][a-z0-9]+){2,}$/,       // 驼峰类名 CisTaskProgress(≥3 段,无空格)
    /\b(ctrl|alt|shift|cmd)\b\s*\+/i,               // 键盘快捷键
    /\b(pie|bar|line|donut)?\s*chart\b.*\b(slices?|data series|axis|graphic)\b/i, // 图表无障碍
    /\baxis displaying\b|\bdata series\b|created with (highcharts|highstock|sketch)/i,   // 图表/画板无障碍
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-/i,         // GUID(任意位置)
    /^(undefined|null|NaN)$/,                        // 页面渲染缺陷字面量(vc 9.0.2 实测单条上千次)
    /^mmMwWLliI0O&1$/,                               // 字体度量探针串(浏览器/框架注入)
    /^(?=.*:.*:)[0-9a-fA-F:.]+(\/\d+)?$/,            // IPv6 地址(≥2 个冒号)± 前缀长度
    /^([0-9A-Fa-f]{2}\s+)+[0-9A-Fa-f]{2}$/,          // 证书指纹十六进制块(空白/换行分隔)
    /^[A-Za-z][\w.]*\\[\w.@-]+$/,                    // 域\主体 VSPHERE.LOCAL\Administrator
    /^[\w.-]+@[\w.-]+$/,                             // UPN/邮箱型主体 Administrator@VSPHERE.LOCAL
    /\b\d[\d.,]*\s*(KBps|Bps|Mbps|Bytes?|vCPUs?|CPU\(s\)|MHz|GHz)/i, // 动态:速率/字节/vCPU
    /^\d[\d.,]*\s*(GB|MB|KB|TB|PB|B)\b/i,            // 数字开头的容量行 "12 GB, 0 GB..."
    /^[\w-]+\.\.\.$/,                                // 单 token 省略截断 "lic..."(无空格)
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}$/,  // 月 日 "Jun 20"
    /^(?=.*\d)[a-z][\w]*([-_][\w]+){2,}$/i,          // 实例/对象名:≥2 分隔符且含数字,无空格(如 knight-md-cl01)
  ];
  // 判断一段文本是否"值得翻译的英文"(过滤数字/GUID/纯符号/已含中文/动态值/机器标识)
  function looksTranslatable(s) {
    // 不设长度上限:H5 客户端的段落级长描述(vSAN/创建虚拟机/升级说明)动辄 200–400 字甚至更长,
    // 旧的 120 上限会把它们整段丢弃 -> 这类长描述「永远采集不到、永远翻不了」。动态/噪声仍由下方正则拦。
    if (s.length < 2) return false;
    if (/[一-鿿]/.test(s)) return false;          // 已含中文
    if (!/[A-Za-z]/.test(s)) return false;                // 无字母
    if (/^[0-9.\-:/\s%]+$/.test(s)) return false;         // 纯数字/时间/百分比
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(s)) return false; // GUID
    if ((s.match(/[A-Za-z]/g) || []).length < 2) return false;
    if (DYNAMIC_RE.some(re => re.test(s))) return false;  // 日期/时间/MAC/数值-单位:动态值,跳过
    if (NOISE_RE.some(re => re.test(s))) return false;    // 机器标识/代码/无障碍:非 UI 文本,跳过
    return true;
  }

  // ── 受控模式替换 ──────────────────────────────────────────
  // 用于"数字动态、后缀固定"的场景(如 "267.45 GHz free")。仅匹配高度具体的
  // 安全模式,避免误翻别处的同名词。精确匹配未命中时才尝试。
  // 译文按 locale 分表:{ 'zh-CN','zh-TW','de','it','ko' }。某语言缺该条目 -> 退英文原串
  // (返回 s),绝不把一种语言的译文漏到另一种页面。zh-TW 由 zh-CN 经 OpenCC s2twp 转换并
  // 人工修正(量词「台」不转臺、Datastore=資料存放區、Instance=執行個體、Task=工作);de/it 取
  // glossary 权威词;ko 仅填语序安全项(量词 개/대),长尾整句缺译则退英文。
  const PHRASES = [
    [/^([\d.,]+\s*[A-Za-z%/]+)\s+free$/i, { 'zh-CN': '$1 空闲', 'zh-TW': '$1 可用', de: '$1 frei', it: '$1 liberi', ko: '$1 사용 가능' }],
    [/^([\d.,]+\s*[A-Za-z%/]+)\s+used$/i, { 'zh-CN': '$1 已用', 'zh-TW': '$1 已使用', de: '$1 belegt', it: '$1 utilizzati', ko: '$1 사용됨' }],
    [/^([\d.,]+\s*[A-Za-z%/]+)\s+capacity$/i, { 'zh-CN': '$1 容量', 'zh-TW': '$1 容量', de: '$1 Kapazität', it: '$1 capacità', ko: '$1 용량' }],
    [/^([\d.,]+\s*[A-Za-z%/]+)\s+available$/i, { 'zh-CN': '$1 可用', 'zh-TW': '$1 可用', de: '$1 verfügbar', it: '$1 disponibili', ko: '$1 사용 가능' }],
    [/^([\d.,]+\s*[A-Za-z%/]+)\s+allocated$/i, { 'zh-CN': '$1 已分配', 'zh-TW': '$1 已分配', de: '$1 zugewiesen', it: '$1 allocati', ko: '$1 할당됨' }],
    [/^([\d.,]+\s*[A-Za-z%/]+)\s+total$/i, { 'zh-CN': '$1 总计', 'zh-TW': '$1 總計', de: '$1 gesamt', it: '$1 totali', ko: '$1 합계' }],
    [/^(.+?)\s+used\s*\|\s*(.+?)\s+total$/i, { 'zh-CN': '$1 已用 | $2 总计', 'zh-TW': '$1 已使用 | $2 總計', de: '$1 belegt | $2 gesamt', it: '$1 utilizzati | $2 totali', ko: '$1 사용됨 | $2 합계' }],
    [/^(\d+)\s*-\s*(\d+)\s+of\s+(\d+)\s+items?$/i, { 'zh-CN': '第 $1 - $2 项,共 $3 项', 'zh-TW': '第 $1 - $2 項,共 $3 項', de: '$1–$2 von $3 Elementen', it: '$1-$2 di $3 elementi', ko: '$3개 중 $1-$2개 항목' }],
    [/^(\d+)\s+of\s+(\d+)\s+items?$/i, { 'zh-CN': '共 $2 项中的 $1 项', 'zh-TW': '共 $2 項中的 $1 項', de: '$1 von $2 Elementen', it: '$1 di $2 elementi', ko: '$2개 중 $1개 항목' }],
    [/^(\d+)\s+items?$/i, { 'zh-CN': '$1 项', 'zh-TW': '$1 項', de: '$1 Elemente', it: '$1 elementi', ko: '$1개 항목' }],
    [/^(\d+)\s*-\s*(\d+)\s+of\s+(\d+)\s+users?$/i, { 'zh-CN': '第 $1 - $2 个,共 $3 个用户', 'zh-TW': '第 $1 - $2 個,共 $3 個使用者', de: '$1–$2 von $3 Benutzern', it: '$1-$2 di $3 utenti', ko: '$3명 중 $1-$2명 사용자' }],
    [/^(\d+)\s+of\s+(\d+)\s+users?$/i, { 'zh-CN': '共 $2 个用户中的 $1 个', 'zh-TW': '共 $2 個使用者中的 $1 個', de: '$1 von $2 Benutzern', it: '$1 di $2 utenti', ko: '$2명 중 $1명 사용자' }],
    [/^(\d+)\s+Datastore\(s\)$/i, { 'zh-CN': '$1 个数据存储', 'zh-TW': '$1 個資料存放區', de: '$1 Datenspeicher', it: '$1 datastore', ko: '$1개 데이터스토어' }],
    [/^(\d+)\s+Network\(s\)$/i, { 'zh-CN': '$1 个网络', 'zh-TW': '$1 個網路', de: '$1 Netzwerke', it: '$1 reti', ko: '$1개 네트워크' }],
    [/^(\d+)\s+tasks?$/i, { 'zh-CN': '$1 个任务', 'zh-TW': '$1 個工作', de: '$1 Aufgaben', it: '$1 attività', ko: '$1개 작업' }],
    [/^(\d+)\s+CPU\(s\)\s+x\s+(.+)$/i, { 'zh-CN': '$1 个 CPU x $2', 'zh-TW': '$1 個 CPU x $2', de: '$1 CPUs x $2', it: '$1 CPU x $2', ko: 'CPU $1개 x $2' }],
    [/^The license expires in\s+(\d+)\s+days?\.$/i, { 'zh-CN': '许可证将在 $1 天后过期。', 'zh-TW': '授權將在 $1 天後到期。', de: 'Die Lizenz läuft in $1 Tagen ab.', it: 'La licenza scade tra $1 giorni.', ko: '라이센스가 $1일 후에 만료됩니다.' }],
    [/^(.+?)\s+task running on target\s+(.+?)\s+finished with status SUCCESS$/i,
      { 'zh-CN': '在目标 $2 上运行的“$1”任务已完成,状态为 SUCCESS', 'zh-TW': '在目標 $2 上執行的「$1」工作已完成,狀態為 SUCCESS', de: 'Aufgabe „$1“ auf Ziel $2 mit Status SUCCESS abgeschlossen', it: 'Attività "$1" sulla destinazione $2 completata con stato SUCCESS' }],
    [/^Total capacity (.+?)\. Usage breakdown: Used capacity (.+?) \(([\d.]+%)\), Free (.+?) \(([\d.]+%)\)$/i,
      { 'zh-CN': '总容量 $1。用量明细: 已用容量 $2 ($3)，可用 $4 ($5)', 'zh-TW': '總容量 $1。使用明細: 已使用容量 $2 ($3)，可用 $4 ($5)', de: 'Gesamtkapazität $1. Nutzung: belegt $2 ($3), frei $4 ($5)', it: 'Capacità totale $1. Utilizzo: usato $2 ($3), libero $4 ($5)' }],
    [/^Total capacity (.+?)\. Usage breakdown: Free (.+?) \((100%)\)$/i,
      { 'zh-CN': '总容量 $1。用量明细: 可用 $2 ($3)', 'zh-TW': '總容量 $1。使用明細: 可用 $2 ($3)', de: 'Gesamtkapazität $1. Nutzung: frei $2 ($3)', it: 'Capacità totale $1. Utilizzo: libero $2 ($3)' }],
    [/^Active sessions:\s*(\d+)$/i, { 'zh-CN': '活动会话: $1', 'zh-TW': '使用中工作階段: $1', de: 'Aktive Sitzungen: $1', it: 'Sessioni attive: $1', ko: '활성 세션: $1' }],
    [/^Idle sessions:\s*(\d+)$/i, { 'zh-CN': '空闲会话: $1', 'zh-TW': '閒置工作階段: $1', de: 'Inaktive Sitzungen: $1', it: 'Sessioni inattive: $1', ko: '유휴 세션: $1' }],
    [/^Standalone Hosts \((\d+)\)$/i, { 'zh-CN': '独立主机 ($1)', 'zh-TW': '獨立主機 ($1)', de: 'Eigenständige Hosts ($1)', it: 'Host autonomi ($1)', ko: '독립 실행형 호스트 ($1)' }],
    [/^Idle for (\d+) day\(s\) (\d+) hour\(s\) (\d+) minute\(s\)$/i, { 'zh-CN': '已空闲 $1 天 $2 小时 $3 分钟', 'zh-TW': '已閒置 $1 天 $2 小時 $3 分鐘', de: '$1 Tage $2 Stunden $3 Minuten inaktiv', it: 'Inattivo da $1 giorni $2 ore $3 minuti', ko: '$1일 $2시간 $3분 동안 유휴' }],
    [/^Idle for (\d+) hour\(s\) (\d+) minute\(s\)$/i, { 'zh-CN': '已空闲 $1 小时 $2 分钟', 'zh-TW': '已閒置 $1 小時 $2 分鐘', de: '$1 Stunden $2 Minuten inaktiv', it: 'Inattivo da $1 ore $2 minuti', ko: '$1시간 $2분 동안 유휴' }],
    [/^Idle for (\d+) minute\(s\)$/i, { 'zh-CN': '已空闲 $1 分钟', 'zh-TW': '已閒置 $1 分鐘', de: '$1 Minuten inaktiv', it: 'Inattivo da $1 minuti', ko: '$1분 동안 유휴' }],
    [/^(\d+)\s+events?$/i, { 'zh-CN': '$1 个事件', 'zh-TW': '$1 個事件', de: '$1 Ereignisse', it: '$1 eventi', ko: '$1개 이벤트' }],
    [/^(\d+)\s+[Hh]osts?$/i, { 'zh-CN': '$1 台主机', 'zh-TW': '$1 台主機', de: '$1 Hosts', it: '$1 host', ko: '호스트 $1대' }],
    [/^(\d+)\s+VMs?$/i, { 'zh-CN': '$1 个虚拟机', 'zh-TW': '$1 個虛擬機器', de: '$1 VMs', it: '$1 VM', ko: 'VM $1개' }],
    [/^(\d+)\s+Instances?$/i, { 'zh-CN': '$1 个实例', 'zh-TW': '$1 個執行個體', de: '$1 Instanzen', it: '$1 istanze', ko: '$1개 인스턴스' }],
    [/^(\d+)\s+Clusters?$/i, { 'zh-CN': '$1 个集群', 'zh-TW': '$1 個叢集', de: '$1 Cluster', it: '$1 cluster', ko: '$1개 클러스터' }],
    [/^All (\d+) disks on version ([\d.]+)\. Some services may not provide the complete feature set\.$/i,
      { 'zh-CN': '所有 $1 个磁盘均为 $2 版本。某些服务可能无法提供完整的功能集。', 'zh-TW': '所有 $1 個磁碟均為 $2 版本。某些服務可能無法提供完整的功能集。', de: 'Alle $1 Datenträger auf Version $2. Einige Dienste bieten möglicherweise nicht den vollständigen Funktionsumfang.', it: 'Tutti i $1 dischi sulla versione $2. Alcuni servizi potrebbero non fornire il set completo di funzionalità.' }],
    [/^Ready to upgrade - pre-check completed successfully on (.+)\.$/i,
      { 'zh-CN': '准备升级 - 预检查已于 $1 成功完成。', 'zh-TW': '準備升級 - 預先檢查已於 $1 成功完成。', de: 'Bereit zum Upgrade – Vorprüfung auf $1 erfolgreich abgeschlossen.', it: "Pronto per l'aggiornamento - controllo preliminare completato su $1." }],
    [/^Last updated at\b/i, { 'zh-CN': '最后更新于', 'zh-TW': '最後更新於', de: 'Zuletzt aktualisiert um', it: 'Ultimo aggiornamento alle', ko: '마지막 업데이트:' }],
    [/^Updated\b/i, { 'zh-CN': '已更新', 'zh-TW': '已更新', de: 'Aktualisiert', it: 'Aggiornato', ko: '업데이트됨' }],
    [/^(\d+)\s+days?$/i, { 'zh-CN': '$1 天', 'zh-TW': '$1 天', de: '$1 Tage', it: '$1 giorni', ko: '$1일' }],
    [/^(\d+)\s+hours?$/i, { 'zh-CN': '$1 小时', 'zh-TW': '$1 小時', de: '$1 Stunden', it: '$1 ore', ko: '$1시간' }],
    [/^(\d+)\s+minutes?$/i, { 'zh-CN': '$1 分钟', 'zh-TW': '$1 分鐘', de: '$1 Minuten', it: '$1 minuti', ko: '$1분' }],
    [/^(\d+)\s+seconds?$/i, { 'zh-CN': '$1 秒', 'zh-TW': '$1 秒', de: '$1 Sekunden', it: '$1 secondi', ko: '$1초' }],
    [/^(\d+)\s+days?\s+ago$/i, { 'zh-CN': '$1 天前', 'zh-TW': '$1 天前', de: 'vor $1 Tagen', it: '$1 giorni fa', ko: '$1일 전' }],
    [/^(\d+)\s+hours?\s+ago$/i, { 'zh-CN': '$1 小时前', 'zh-TW': '$1 小時前', de: 'vor $1 Stunden', it: '$1 ore fa', ko: '$1시간 전' }],
    [/^(\d+)\s+minutes?\s+ago$/i, { 'zh-CN': '$1 分钟前', 'zh-TW': '$1 分鐘前', de: 'vor $1 Minuten', it: '$1 minuti fa', ko: '$1분 전' }],
    [/^a few seconds ago$/i, { 'zh-CN': '几秒前', 'zh-TW': '幾秒前', de: 'vor wenigen Sekunden', it: 'pochi secondi fa', ko: '몇 초 전' }],
    // VM 摘要页常见动态串(数字/版本/状态混排,精确查典命不中)
    [/^Last updated:/i, { 'zh-CN': '上次更新:', 'zh-TW': '上次更新:', de: 'Zuletzt aktualisiert:', it: 'Ultimo aggiornamento:', ko: '마지막 업데이트:' }],
    [/^(\d+)\s+CPU\(s\),\s*(.+?)\s+used$/i, { 'zh-CN': '$1 个 CPU,$2 已使用', 'zh-TW': '$1 個 CPU,$2 已使用', de: '$1 CPUs, $2 belegt', it: '$1 CPU, $2 utilizzati', ko: 'CPU $1개, $2 사용됨' }],
    [/^(.+?),\s*(.+?)\s+memory active$/i, { 'zh-CN': '$1,$2 活动内存', 'zh-TW': '$1，$2 作用中記憶體', de: '$1, $2 aktiver Speicher', it: '$1, $2 memoria attiva' }],
    [/^Not running, version:(\S+)\s*\(Guest Managed\)$/i, { 'zh-CN': '未运行,版本:$1 (客户机托管)', 'zh-TW': '不在執行中,版本:$1 (受管理的客體)', de: 'Wird nicht ausgeführt, Version:$1 (gastverwaltet)', it: 'Non in esecuzione, versione:$1 (gestito dal guest)' }],
    [/^Running, version:(\S+)\s*\(Guest Managed\)$/i, { 'zh-CN': '运行中,版本:$1 (客户机托管)', 'zh-TW': '執行中,版本:$1 (受管理的客體)', de: 'Wird ausgeführt, Version:$1 (gastverwaltet)', it: 'In esecuzione, versione:$1 (gestito dal guest)' }],
    [/^\(disconnected\)$/i, { 'zh-CN': '(已断开连接)', 'zh-TW': '(已中斷連線)', de: '(getrennt)', it: '(disconnesso)', ko: '(연결 끊김)' }],
    [/^\(connected\)$/i, { 'zh-CN': '(已连接)', 'zh-TW': '(已連線)', de: '(verbunden)', it: '(connesso)', ko: '(연결됨)' }],
    [/^used$/i, { 'zh-CN': '已使用', 'zh-TW': '已使用', de: 'belegt', it: 'utilizzati', ko: '사용됨' }],
    [/^active$/i, { 'zh-CN': '活动', 'zh-TW': '作用中', de: 'aktiv', it: 'attivo', ko: '활성' }],
    // ── vc 9.0.2 现场采集回流(2026-07):任务通知 / 代理 / 会话 / 主机状态等动态串 ──
    [/^(.+?)\s+task running on target\s+(.+?)\s+finished with status ERROR$/i,
      { 'zh-CN': '在目标 $2 上运行的“$1”任务已完成,状态为 ERROR', 'zh-TW': '在目標 $2 上執行的「$1」工作已完成,狀態為 ERROR', de: 'Aufgabe „$1“ auf Ziel $2 mit Status ERROR abgeschlossen', it: 'Attività "$1" sulla destinazione $2 completata con stato ERROR' }],
    [/^Processing data from vCenter agent on (.+)$/i,
      { 'zh-CN': '正在处理来自 $1 上 vCenter 代理的数据', 'zh-TW': '正在處理來自 $1 上 vCenter 代理程式的資料', de: 'Daten vom vCenter-Agent auf $1 werden verarbeitet', it: "Elaborazione dei dati dall'agente vCenter su $1", ko: '$1의 vCenter 에이전트 데이터 처리 중' }],
    [/^Retrieving data from vCenter agent on (.+)$/i,
      { 'zh-CN': '正在从 $1 上的 vCenter 代理检索数据', 'zh-TW': '正在從 $1 上的 vCenter 代理程式擷取資料', de: 'Daten vom vCenter-Agent auf $1 werden abgerufen', it: "Recupero dei dati dall'agente vCenter su $1", ko: '$1의 vCenter 에이전트에서 데이터 검색 중' }],
    [/^Your session is about to expire after (\d+) seconds?\.$/i,
      { 'zh-CN': '您的会话将在 $1 秒后过期。', 'zh-TW': '您的工作階段將在 $1 秒後到期。', de: 'Ihre Sitzung läuft in $1 Sekunden ab.', it: 'La sessione scadrà tra $1 secondi.', ko: '세션이 $1초 후에 만료됩니다.' }],
    [/^Waiting for operations to finish: (.+)$/i,
      { 'zh-CN': '正在等待操作完成: $1', 'zh-TW': '正在等待作業完成: $1', de: 'Warten auf Abschluss der Vorgänge: $1', it: 'In attesa del completamento delle operazioni: $1', ko: '작업 완료 대기 중: $1' }],
    [/^Actions - (.+)$/,
      { 'zh-CN': '操作 - $1', 'zh-TW': '動作 - $1', de: 'Aktionen – $1', it: 'Azioni - $1', ko: '작업 - $1' }],
    [/^New hosts \((\d+)\)$/i,
      { 'zh-CN': '新主机 ($1)', 'zh-TW': '新主機 ($1)', de: 'Neue Hosts ($1)', it: 'Nuovi host ($1)', ko: '새 호스트($1)' }],
    [/^Host (\d+)$/,
      { 'zh-CN': '主机 $1', 'zh-TW': '主機 $1', ko: '호스트 $1' }],
    [/^(.+?) \(Maintenance Mode\)$/,
      { 'zh-CN': '$1 (维护模式)', 'zh-TW': '$1 (維護模式)', de: '$1 (Wartungsmodus)', it: '$1 (modalità di manutenzione)', ko: '$1(유지 보수 모드)' }],
    [/^(.+?) \(Not responding\)$/,
      { 'zh-CN': '$1 (无响应)', 'zh-TW': '$1 (沒有回應)', de: '$1 (reagiert nicht)', it: '$1 (non risponde)', ko: '$1(응답 없음)' }],
    [/^(.+?) \(Disconnected\)$/,
      { 'zh-CN': '$1 (已断开连接)', 'zh-TW': '$1 (已中斷連線)', de: '$1 (getrennt)', it: '$1 (disconnesso)', ko: '$1(연결 끊김)' }],
    [/^(.+?) \(static\)$/,
      { 'zh-CN': '$1 (静态)', 'zh-TW': '$1 (靜態)', de: '$1 (statisch)', it: '$1 (statico)', ko: '$1(정적)' }],
    [/^Standard Switch: (.+)$/i,
      { 'zh-CN': '标准交换机: $1', 'zh-TW': '標準交換器: $1', de: 'Standard-Switch: $1', it: 'Switch standard: $1', ko: '표준 스위치: $1' }],
    [/^Distributed Switch: (.+)$/i,
      { 'zh-CN': '分布式交换机: $1', 'zh-TW': '分散式交換器: $1', ko: 'Distributed Switch: $1' }],
    [/^VMkernel network adapter: (.+)$/i,
      { 'zh-CN': 'VMkernel 网络适配器: $1', 'zh-TW': 'VMkernel 網路介面卡: $1', de: 'VMkernel-Netzwerkadapter: $1', it: 'Scheda di rete VMkernel: $1', ko: 'VMkernel 네트워크 어댑터: $1' }],
    [/^View all issues \((\d+)\)$/i,
      { 'zh-CN': '查看所有问题 ($1)', 'zh-TW': '檢視所有問題 ($1)', de: 'Alle Probleme anzeigen ($1)', it: 'Visualizza tutti i problemi ($1)', ko: '모든 문제 보기($1)' }],
    [/^uplink(\d+) \((\d+) NIC Adapters?\)$/i,
      { 'zh-CN': 'uplink$1 ($2 个 NIC 适配器)', 'zh-TW': 'uplink$1 ($2 個 NIC 介面卡)', de: 'uplink$1 ($2 NIC-Adapter)', it: 'uplink$1 ($2 schede NIC)', ko: 'uplink$1(NIC 어댑터 $2개)' }],
    [/^Cannot synchronize host (.+?)\.$/i,
      { 'zh-CN': '无法同步主机 $1。', 'zh-TW': '無法同步主機 $1。', de: 'Host $1 kann nicht synchronisiert werden.', it: "Impossibile sincronizzare l'host $1.", ko: '호스트 $1을(를) 동기화할 수 없습니다.' }],
    [/^Imported from (.+)$/i,
      { 'zh-CN': '已从 $1 导入', 'zh-TW': '已從 $1 匯入', de: 'Importiert von $1', it: 'Importato da $1', ko: '$1에서 가져옴' }],
    [/^You selected to shut down host (.+)$/i,
      { 'zh-CN': '您已选择关闭主机 $1', 'zh-TW': '您已選擇關閉主機 $1', de: 'Sie haben das Herunterfahren von Host $1 ausgewählt', it: "Hai scelto di arrestare l'host $1" }],
    [/^Certificate viewer: (.+)$/i,
      { 'zh-CN': '证书查看器: $1', 'zh-TW': '憑證檢視器: $1', de: 'Zertifikatanzeige: $1', it: 'Visualizzatore certificati: $1', ko: '인증서 뷰어: $1' }],
    [/^Total Consumed Count\s+(\d+)$/i,
      { 'zh-CN': '总占用数  $1', 'zh-TW': '總占用數  $1' }],
    [/^(\d+) additional components$/i,
      { 'zh-CN': '$1 个其他组件', 'zh-TW': '$1 個其他元件', de: '$1 zusätzliche Komponenten', it: '$1 componenti aggiuntivi', ko: '추가 구성 요소 $1개' }],
    [/^(\d+) new hosts? will be connected to vCenter Server and moved to the cluster:$/i,
      { 'zh-CN': '$1 台新主机将连接到 vCenter Server 并移入该集群:', 'zh-TW': '$1 台新主機將連線到 vCenter Server 並移入該叢集:' }],
    [/^There are (\d+) hosts that are managed by vCenter Server that are not part of a cluster\. Selected hosts are placed in maintenance mode before joining the cluster\.$/i,
      { 'zh-CN': '有 $1 台由 vCenter Server 管理的主机不属于任何集群。所选主机在加入集群前会先进入维护模式。', 'zh-TW': '有 $1 台由 vCenter Server 管理的主機不屬於任何叢集。所選主機在加入叢集前會先進入維護模式。' }],
    [/^The certificates on (\d+) hosts could not be verified\. The hosts and their certificates are listed below\. To continue connecting, manually verify these certificates by expanding the details of each host and accept them\.$/i,
      { 'zh-CN': '无法验证 $1 台主机上的证书。下面列出了这些主机及其证书。要继续连接,请展开每台主机的详细信息,手动验证并接受这些证书。', 'zh-TW': '無法驗證 $1 台主機上的憑證。下面列出了這些主機及其憑證。若要繼續連線,請展開每台主機的詳細資訊,手動驗證並接受這些憑證。' }],
    [/^This vCenter Server is managed by SDDC Manager \((.+?)\)\.\s*Making modifications directly in vCenter Server may break SDDC Manager workflows\.\s*Please consult the product documentation before making changes through the vSphere Client\.$/i,
      { 'zh-CN': '此 vCenter Server 由 SDDC Manager ($1) 管理。直接在 vCenter Server 中进行修改可能会破坏 SDDC Manager 工作流。通过 vSphere Client 进行更改前,请先查阅产品文档。', 'zh-TW': '此 vCenter Server 由 SDDC Manager ($1) 管理。直接在 vCenter Server 中進行修改可能會破壞 SDDC Manager 工作流程。透過 vSphere Client 進行變更前,請先查閱產品文件。' }],
    [/^DNS Name\s*\((\d+)\)$/i,
      { 'zh-CN': 'DNS 名称 ($1)', 'zh-TW': 'DNS 名稱 ($1)', de: 'DNS-Name ($1)', it: 'Nome DNS ($1)', ko: 'DNS 이름($1)' }],
    [/^IP Addresses\s*\((\d+)\)$/i,
      { 'zh-CN': 'IP 地址 ($1)', 'zh-TW': 'IP 位址 ($1)', de: 'IP-Adressen ($1)', it: 'Indirizzi IP ($1)', ko: 'IP 주소($1)' }],
  ];

  // ── 受控模式替换 ────────────────────────────────────────
  // 预筛自动划分(取代旧的手工前缀登记表):模式源码要求数字(含 \d 转义或字面数字,
  // 如 "(100%)")的,只对含数字的串尝试;其余模式对任何串都尝试。
  // 历史教训:手工登记表漏登了 "task running on target ... SUCCESS" 这类无数字模式,
  // 预筛把它们拦死,整类漏翻、单条现场采集量 1600+。自动划分让"漏登记"这类 bug 不可能发生。
  function phraseRequiresDigit(re) {
    const src = re.source;
    return src.indexOf('\\d') !== -1 || /[0-9]/.test(src.replace(/\\d/g, ''));
  }
  const PHRASES_NO_DIGIT = PHRASES.filter(p => !phraseRequiresDigit(p[0]));

  // 精确查典未命中时才调用。译文按 lang 取;缺该语言条目则退英文(返回原串),
  // 永不跨语言污染(历史 bug:写死简体的 PHRASES 漏进德文页)。
  function applyPhrases(s, lang) {
    if (!lang || lang === 'en') return s;
    const pool = /\d/.test(s) ? PHRASES : PHRASES_NO_DIGIT;
    for (let i = 0; i < pool.length; i++) {
      if (pool[i][0].test(s)) {
        const rep = pool[i][1][lang];
        return rep === undefined ? s : s.replace(pool[i][0], rep);
      }
    }
    return s;
  }

  return {
    TAIL_RE: TAIL_RE,
    normTerm: normTerm,
    sanitizeDict: sanitizeDict,
    buildAux: buildAux,
    classifyFlags: classifyFlags,
    looksTranslatable: looksTranslatable,
    PHRASES: PHRASES,
    phraseRequiresDigit: phraseRequiresDigit,
    applyPhrases: applyPhrases,
  };
});
