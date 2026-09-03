// 按语言提取「术语词元」—— check-batch.mjs 的 W3 与 check-consistency.mjs 共用。
//
// 【为什么必须按语言分派】W3 的做法是:从译文里抽词元,找出某英文术语的主流译法。
// 抽词元的规则**依赖该语言的正字法**,德语的规则搬到别的语言会直接失效:
//   de  德语名词一律大写 → 只收大写开头的词,一条规则就滤掉 finden/werden 这类高频动词
//   it  意大利语名词【不】大写 → 同一条规则几乎抽不到东西,W3 会整体失声
//   ko  韩语无大小写,黏着语 → 按谚文块取,并剥掉常见助词/词尾
//   zh  中文无词边界 → 按 2-4 字汉字片段取
//
// 实测:把 de 的规则用在 it 上,convention 表接近空 —— 等于丢掉主要防线,而且不报错,
// 是最危险的那种失效方式(静默)。
const STOP = {
  // 意大利语功能词/高频动词形:没有大写信号可用,只能显式挡
  it: new Set([
    "della", "dello", "delle", "degli", "quando", "questo", "questa", "queste", "questi",
    "essere", "viene", "vengono", "verrà", "verranno", "seguente", "seguenti", "utilizzare",
    "possibile", "necessario", "specificato", "specificata", "selezionato", "selezionata",
    "impossibile", "durante", "attualmente", "almeno", "tutti", "tutte", "altri", "altre",
    "perché", "senza", "sono", "come", "anche", "solo", "oppure", "prima", "dopo",
  ]),
  ko: new Set(["있습니다", "없습니다", "합니다", "하십시오", "때문에", "그리고", "또는", "다음", "경우"]),
};

// 韩语黏着:词干后接助词/词尾,同一术语会有多种形。剥掉最常见的一批再比对。
const KO_SUFFIX = /(으로|에서|에게|이나|와의|과의|에는|에서는|입니다|합니다|하기|하는|하여|되는|된|의|을|를|이|가|은|는|와|과|에|로|도)$/;

export function makeTokenizer(lang, placeholderRe) {
  const strip = s => String(s).replace(placeholderRe, " ");
  if (lang === "de") {
    // 德语:只收大写开头的词(名词),词干 >= 5
    return s => [...new Set((strip(s).match(/[A-ZÄÖÜ][a-zäöüß]{3,}/g) ?? []).map(t => t.toLowerCase()).filter(t => t.length >= 5))];
  }
  if (lang === "it") {
    const stop = STOP.it;
    return s => [...new Set((strip(s).match(/[A-Za-zÀ-ÿ]{5,}/g) ?? []).map(t => t.toLowerCase()).filter(t => !stop.has(t)))];
  }
  if (lang === "ko") {
    const stop = STOP.ko;
    return s => [...new Set((strip(s).match(/[가-힣]{2,}/g) ?? []).map(t => t.replace(KO_SUFFIX, "")).filter(t => t.length >= 2 && !stop.has(t)))];
  }
  if (lang === "zh-CN" || lang === "zh-TW") {
    // 中文无词边界:取 2-4 字滑窗片段
    return s => {
      const out = new Set();
      for (const run of strip(s).match(/[一-鿿]{2,}/g) ?? []) {
        for (let n = 2; n <= 4; n++) for (let i = 0; i + n <= run.length; i++) out.add(run.slice(i, i + n));
      }
      return [...out];
    };
  }
  throw new Error(`没有为 ${lang} 定义词元规则 —— 加一条再用,别退回德语规则(会静默失效)`);
}

// 词干比对:各语言的屈折/黏着差异
export function makeStemmer(lang) {
  if (lang === "de") {
    // 德语复合词吃掉词尾 -e/-en(Adresse -> Adressbereich)
    return t => { const s = t.replace(/(en|e|n)$/, ""); return s.length >= 5 ? s : t; };
  }
  if (lang === "it") {
    // 意大利语性数一致:-o/-a/-i/-e 结尾变化(criterio/criteri, condivisione/condivisioni)
    return t => { const s = t.replace(/(zioni|zione|i|e|o|a)$/, ""); return s.length >= 4 ? s : t; };
  }
  if (lang === "ko") return t => t;                    // 助词已在分词时剥掉
  return t => t;                                       // 中文无屈折
}
