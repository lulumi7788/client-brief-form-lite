const STEPS=[
  {id:1,label:"專案基本資訊",icon:"📋"},
  {id:2,label:"研究範圍",icon:"📐"},
  {id:3,label:"研究主題",icon:"🎯"},
  {id:4,label:"消費者輪廓",icon:"👥"},
  {id:5,label:"篩選偏好",icon:"🔍"},
  {id:6,label:"分析深度",icon:"📊"},
  {id:7,label:"交付需求",icon:"📦"},
];
const PLATFORMS=["Facebook","Instagram","Threads","YouTube","Forum（論壇）","新聞媒體","部落格"];
const PURPOSES=["品牌形象健檢","特定產品／服務評價","競品比較分析","危機事件追蹤","行銷活動成效評估","消費者洞察研究"];
const MODULES=["聲量趨勢分析","平台聲量分佈","熱門話題歸納","關鍵意見領袖（KOL）分析","情緒／情感分析","競品比較"];
const DELIVERABLES=["PDF 報告","PPT 簡報","Excel 原始數據","Word 文件"];
const AUDIENCES=["行銷部門","高階主管","產品部門","公關部門","外部合作夥伴"];
const INDUSTRIES=[{v:"insurance",l:"保險業"},{v:"fmcg",l:"快消品／食品"},{v:"tech",l:"科技業"},{v:"finance",l:"金融業"},{v:"other",l:"其他"}];
const NOISE=[
  {k:"lottery",l:"抽獎／贈品貼文"},{k:"recruit",l:"徵才招募資訊"},
  {k:"live",l:"直播導購內容"},{k:"seo_spam",l:"廣告垃圾內容"},
  {k:"politics",l:"政治相關討論"},{k:"finance_stock",l:"股票財經討論"},
  {k:"social_news",l:"社會新聞"},{k:"realestate",l:"房產相關"},
  {k:"entertainment",l:"娛樂追星內容"},
];

let step=1;
let showPreview=false;
let mdStatus="idle";
const D={
  clientName:"",projectName:"",contact:"",formDate:"",deadline:"",customRange:"",timeRange:"12m",
  platforms:[],purposes:[],industry:"",needCompetitors:"no",competitors:[],strategy:"data",brandNames:"",
  brandAspects:"",hasEvents:"no",specificEvents:"",sensitive:"",
  needConsumerProfile:"no",targetSegment:"",profileItems:"",
  filterLevel:"auto",noiseTypes:[],customExcludes:"",
  modules:[],sensitive6:"",focusPoints:"",needSentiment:"no",analysisNotes:"",
  deliverables:[],audiences:[],extraNotes:"",
};

/* ── helpers: safe DOM builders ── */
function esc(s){
  const d=document.createElement("div");
  d.textContent=s;
  return d.textContent;
}

function pills(arr,key,opts){
  const wrap=document.createElement("div");
  wrap.className="pills";
  wrap.id="pills-"+key;
  opts.forEach(o=>{
    const k=typeof o==="object"?o.k:o;
    const l=typeof o==="object"?o.l:o;
    const btn=document.createElement("button");
    btn.className="pill"+(arr.includes(k)?" on":"");
    btn.textContent=l;
    btn.onclick=function(){togglePill(key,k,btn);};
    wrap.appendChild(btn);
  });
  return wrap;
}
function togglePill(key,val,btn){
  if(D[key].includes(val)){D[key]=D[key].filter(x=>x!==val);btn.classList.remove("on");}
  else{D[key]=[...D[key],val];btn.classList.add("on");}
}

function radios(key,opts){
  const wrap=document.createElement("div");
  wrap.className="radios";
  opts.forEach(o=>{
    const item=document.createElement("div");
    const on=D[key]===o.v;
    item.className="radio-item"+(on?" on":"");
    const dot=document.createElement("div");
    dot.className="radio-dot";
    if(on){const inner=document.createElement("div");inner.className="radio-inner";dot.appendChild(inner);}
    const info=document.createElement("div");
    const lbl=document.createElement("div");
    lbl.className="radio-lbl";lbl.textContent=o.l;
    info.appendChild(lbl);
    if(o.s){const sub=document.createElement("div");sub.className="radio-sub";sub.textContent=o.s;info.appendChild(sub);}
    item.appendChild(dot);item.appendChild(info);
    item.onclick=function(){
      D[key]=o.v;
      wrap.querySelectorAll(".radio-item").forEach(r=>{r.classList.remove("on");r.querySelector(".radio-dot").replaceChildren();});
      item.classList.add("on");
      const inner=document.createElement("div");inner.className="radio-inner";dot.appendChild(inner);
      if(["needCompetitors","hasEvents","needConsumerProfile"].includes(key)) renderStep();
    };
    wrap.appendChild(item);
  });
  return wrap;
}

function yesno(key,yl,nl){
  yl=yl||"是";nl=nl||"否";
  const wrap=document.createElement("div");
  wrap.className="yesno";
  [{v:"yes",l:yl},{v:"no",l:nl}].forEach(({v,l})=>{
    const btn=document.createElement("button");
    btn.className="yn-btn"+(D[key]===v?" on":"");
    btn.textContent=l;
    btn.onclick=function(){
      D[key]=v;
      wrap.querySelectorAll(".yn-btn").forEach(b=>b.classList.remove("on"));
      btn.classList.add("on");
      if(["needCompetitors","hasEvents","needConsumerProfile"].includes(key)) renderStep();
    };
    wrap.appendChild(btn);
  });
  return wrap;
}

function tagInput(key,ph){
  const wrap=document.createElement("div");
  const row=document.createElement("div");row.className="tag-row";
  const input=document.createElement("input");input.type="text";input.placeholder=ph;
  const addBtn=document.createElement("button");addBtn.className="tag-add";addBtn.textContent="新增";
  const tagsDiv=document.createElement("div");tagsDiv.className="tags";
  function refreshTags(){
    tagsDiv.replaceChildren();
    D[key].forEach(v=>{
      const tag=document.createElement("span");tag.className="tag";tag.textContent=v;
      const x=document.createElement("button");x.className="tag-x";x.textContent="\u00d7";
      x.onclick=function(){D[key]=D[key].filter(t=>t!==v);refreshTags();};
      tag.appendChild(x);tagsDiv.appendChild(tag);
    });
  }
  function doAdd(){
    const v=input.value.trim();
    if(v&&!D[key].includes(v))D[key]=[...D[key],v];
    input.value="";refreshTags();
  }
  input.onkeydown=function(e){if(e.key==="Enter"){e.preventDefault();doAdd();}};
  addBtn.onclick=doAdd;
  row.appendChild(input);row.appendChild(addBtn);
  wrap.appendChild(row);wrap.appendChild(tagsDiv);
  refreshTags();
  return wrap;
}

function fi(label,req,hint,innerEl){
  const wrap=document.createElement("div");wrap.className="field";
  const lbl=document.createElement("label");
  lbl.textContent=label;
  if(req){const s=document.createElement("span");s.className="req";s.textContent="*";lbl.appendChild(s);}
  wrap.appendChild(lbl);
  if(hint){const h=document.createElement("div");h.className="hint";h.textContent=hint;wrap.appendChild(h);}
  if(typeof innerEl==="string"){const tmp=document.createElement("div");tmp.textContent=innerEl;wrap.appendChild(tmp);}
  else if(innerEl) wrap.appendChild(innerEl);
  return wrap;
}

function inp(key,ph,multi,rows){
  rows=rows||3;
  if(multi){
    const ta=document.createElement("textarea");ta.className="ta";ta.rows=rows;ta.placeholder=ph;ta.value=D[key];
    ta.oninput=function(){D[key]=ta.value;};
    return ta;
  }
  const el=document.createElement("input");el.type="text";el.placeholder=ph;el.value=D[key];
  el.oninput=function(){D[key]=el.value;};
  return el;
}

function grid2(...els){
  const g=document.createElement("div");g.className="grid2";
  els.forEach(e=>g.appendChild(e));
  return g;
}

function frag(...els){
  const f=document.createDocumentFragment();
  els.forEach(e=>{if(e)f.appendChild(e);});
  return f;
}

/* ── step renderers ── */
function stepDOM(){
  if(step===1)return frag(
    grid2(
      fi("公司名稱",true,"",inp("clientName","例：ABC 公司")),
      fi("聯絡窗口",true,"",inp("contact","姓名 / Email / 電話"))
    ),
    fi("專案名稱",true,"簡述此次分析需求，例如品牌名稱 + 分析目的",inp("projectName","例：品牌 X 社群聲量分析")),
    fi("填表日期","","",inp("formDate","YYYY/MM/DD")),
    grid2(
      fi("期望交付日期","","",inp("deadline","YYYY/MM/DD")),
      fi("自訂分析時間區間","若有特定時間範圍請填寫","",inp("customRange","例：2025/01/01 ~ 2025/06/30"))
    ),
    fi("想分析多久的資料？","","",radios("timeRange",[
      {v:"3m",l:"近 3 個月"},{v:"6m",l:"近 6 個月"},
      {v:"12m",l:"近 12 個月"},{v:"24m",l:"近 24 個月"},
      {v:"custom",l:"自訂（請填寫上方欄位）"},
    ]))
  );
  if(step===2){
    const compSub=document.createElement("div");compSub.className="sub-box";
    const compHint=document.createElement("div");compHint.className="hint";compHint.textContent="請列出想比較的競品品牌名稱：";
    compSub.appendChild(compHint);compSub.appendChild(tagInput("competitors","輸入競品名稱後按 Enter"));
    const compWrap=document.createElement("div");
    compWrap.appendChild(yesno("needCompetitors"));
    if(D.needCompetitors==="yes")compWrap.appendChild(compSub);
    return frag(
      fi("想分析哪些平台？（可複選）",true,"",pills(D.platforms,"platforms",PLATFORMS)),
      fi("這次分析的主要目的？（可複選）",true,"",pills(D.purposes,"purposes",PURPOSES)),
      fi("您的產業類別","","",radios("industry",INDUSTRIES.map(i=>({v:i.v,l:i.l})))),
      fi("是否需要與競品做比較分析？","","",compWrap),
      fi("報告中是否需要包含策略建議？","策略建議由分析師根據數據提供行動方向","",radios("strategy",[
        {v:"data",l:"僅需數據洞察",s:"客觀呈現數據結果，不含主觀建議"},
        {v:"strategy",l:"需包含策略建議",s:"除了數據之外，希望分析師提供具體的行動建議"},
      ])),
      fi("請列出要分析的品牌名稱",true,"包含您的品牌及上方填寫的競品，可列出品牌的正式名稱、簡稱、英文名",inp("brandNames","例：\n品牌 A（簡稱 A、Brand A）\n品牌 B\n品牌 C",true,4))
    );
  }
  if(step===3){
    const evtWrap=document.createElement("div");
    evtWrap.appendChild(yesno("hasEvents"));
    if(D.hasEvents==="yes"){const sb=document.createElement("div");sb.className="sub-box";sb.appendChild(inp("specificEvents","請描述事件內容及大約發生時間",true,3));evtWrap.appendChild(sb);}
    return frag(
      fi("是否有特定想了解的品牌面向？","","例如：服務品質、產品評價、企業形象、廣告成效等",inp("brandAspects","例：服務體驗、產品品質、品牌形象",true,2)),
      fi("是否有近期特定事件需要重點追蹤？","","例如：新品上市、公關事件、行銷活動等",evtWrap),
      fi("是否有敏感議題或需避免分析的內容？","","例如：特定負面事件、政治相關議題等",inp("sensitive","若無請留空",true,2))
    );
  }
  if(step===4){
    const els=[fi("是否需要分析消費者輪廓？","","我們可以透過社群數據推測消費者的背景特徵",yesno("needConsumerProfile"))];
    if(D.needConsumerProfile==="yes"){
      els.push(fi("特別想關注的消費者族群","","例如：年輕族群、高消費族群、特定地區消費者",inp("targetSegment","例：25-35 歲女性消費者",true,2)));
      els.push(fi("希望了解消費者的哪些面向？","","例如：購買動機、使用場景、關注要素",inp("profileItems","例：購買動機、品牌偏好、年齡層分佈",true,2)));
    }
    return frag(...els);
  }
  if(step===5){
    const info=document.createElement("div");info.className="info-box";
    info.textContent="以下設定幫助我們在分析時排除不相關的內容，讓報告更精準。如果不確定，可以先跳過，分析師會根據您的產業自動調整。";
    return frag(
      info,
      fi("您希望報告的精準程度？","","精準度越高，排除的無關內容越多，但可能遺漏少數邊緣討論",radios("filterLevel",[
        {v:"strong",l:"高精準度",s:"只保留最相關的討論，適合正式報告"},
        {v:"medium",l:"中等精準度",s:"平衡相關性與涵蓋範圍，適合日常監測"},
        {v:"weak",l:"廣泛涵蓋",s:"盡可能收錄所有相關討論，適合初期探索"},
        {v:"auto",l:"交由分析師判斷",s:"根據專案目的自動選擇最適合的設定"},
      ])),
      fi("以下哪些類型的內容不需要納入分析？（可複選）","","勾選後，這些內容會從分析中排除",pills(D.noiseTypes,"noiseTypes",NOISE)),
      fi("還有其他想排除的內容嗎？","","如果有特定不想看到的內容類型，請簡述",inp("customExcludes","例：不想看到團購相關的貼文、排除特定子品牌的討論",true,2))
    );
  }
  if(step===6)return frag(
    fi("希望報告包含哪些分析面向？（可複選）","","我們會根據您的選擇安排報告內容",pills(D.modules,"modules",MODULES)),
    fi("敏感議題或需避免分析的內容","","若有不希望出現在報告中的特定議題、事件或詞彙，請在此說明。",inp("sensitive6","例：避免提及特定負面事件、政治相關議題等",true,2)),
    fi("核心問題（最多三個）","","這次報告最希望回答的問題，幫助分析師聚焦重點。",inp("focusPoints","1. \n2. \n3. ",true,4)),
    fi("是否需要情緒正負評分析？","","針對各議題的討論內容，分析正面／負面／中性的情緒分佈。",yesno("needSentiment")),
    fi("其他補充說明","","",inp("analysisNotes","任何額外需求或補充資訊",true,3))
  );
  if(step===7){
    const dlBox=document.createElement("div");dlBox.className="dl-box";
    const dlHd=document.createElement("div");dlHd.className="dl-box-hd";
    const ico=document.createElement("span");ico.className="dl-icon";ico.textContent="\u{1F4DD}";
    const dlInfo=document.createElement("div");
    const dlTtl=document.createElement("div");dlTtl.className="dl-ttl";dlTtl.textContent="下載需求確認表";
    const dlSub=document.createElement("div");dlSub.className="dl-sub";dlSub.textContent="下載後可提供給分析團隊，作為專案啟動的依據";
    dlInfo.appendChild(dlTtl);dlInfo.appendChild(dlSub);
    dlHd.appendChild(ico);dlHd.appendChild(dlInfo);dlBox.appendChild(dlHd);
    const dlBtn=document.createElement("button");dlBtn.className="btn-dl"+(mdStatus==="done"?" done":"");
    dlBtn.textContent=mdStatus==="done"?"\u2705 已下載":"\u2B07 下載需求確認表 (.md)";
    dlBtn.onclick=exportMd;
    dlBox.appendChild(dlBtn);
    return frag(
      fi("希望收到什麼格式的報告？（可複選）","","",pills(D.deliverables,"deliverables",DELIVERABLES)),
      fi("報告的主要閱讀對象？（可複選）","","幫助我們調整報告的深度和用語",pills(D.audiences,"audiences",AUDIENCES)),
      fi("其他補充說明","","",inp("extraNotes","任何額外需求或補充資訊",true,3)),
      dlBox
    );
  }
}

/* ── brief ── */
function dateRange(){
  const e=new Date(),s=new Date();
  const m={"3m":3,"6m":6,"12m":12,"24m":24};
  if(m[D.timeRange])s.setMonth(s.getMonth()-m[D.timeRange]);
  else if(D.timeRange==="custom"&&D.customRange)return D.customRange;
  else s.setFullYear(s.getFullYear()-1);
  const f=d=>`${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}`;
  return`${f(s)} ~ ${f(e)}`;
}
function generateBrief(){
  const imap={insurance:"保險業",fmcg:"快消品／食品",tech:"科技業",finance:"金融業",other:"其他"};
  const fmap={strong:"高精準度",medium:"中等精準度",weak:"廣泛涵蓋",auto:"交由分析師判斷"};
  const nl=NOISE.filter(n=>D.noiseTypes.includes(n.k)).map(n=>n.l);
  return`# 社群輿情分析｜客戶需求確認表
## 一、專案基本資訊
- 公司名稱：${D.clientName||"（未填）"}
- 聯絡窗口：${D.contact||"（未填）"}
- 專案名稱：${D.projectName||"（未填）"}
- 填表日期：${D.formDate||"未填"}
- 期望交付日期：${D.deadline||"未定"}
- 分析時間範圍：${dateRange()}

## 二、研究範圍
- 分析平台：${D.platforms.join("、")||"未指定"}
- 核心目的：${D.purposes.join("、")||"未指定"}
- 產業類別：${imap[D.industry]||"未指定"}
- 競品分析：${D.needCompetitors==="yes"?`是，競品：${D.competitors.join("、")||"（未填）"}`:"否"}
- 策略建議：${D.strategy==="strategy"?"需要":"不需要（僅數據洞察）"}
- 分析品牌列表：
${D.brandNames?D.brandNames.split("\n").map(l=>`  \u2022 ${l}`).join("\n"):"  （未填）"}

## 三、研究主題
- 品牌面向：${D.brandAspects||"無特定限制"}
- 特定事件追蹤：${D.hasEvents==="yes"?(D.specificEvents||"（未填）"):"否"}
- 敏感議題：${D.sensitive||"無"}

## 四、消費者輪廓
- 是否需要：${D.needConsumerProfile==="yes"?"是":"否"}
${D.needConsumerProfile==="yes"?`- 目標族群：${D.targetSegment||"無限制"}\n- 著重項目：${D.profileItems||"無限制"}`:""}

## 五、篩選偏好
- 精準程度：${fmap[D.filterLevel]||"未指定"}
- 排除內容類型：${nl.length?nl.join("、"):"未指定"}
- 其他排除需求：${D.customExcludes||"無"}

## 六、分析深度
- 分析模組：${D.modules.join("、")||"未指定"}
- 敏感議題：${D.sensitive6||"無"}
- 核心問題：
${(D.focusPoints||"（未填）").split("\n").map(l=>"  "+l).join("\n")}
- 情緒正負評分析：${D.needSentiment==="yes"?"是":"否"}
- 其他補充：${D.analysisNotes||"無"}

## 七、交付需求
- 交付格式：${D.deliverables.join("、")||"未指定"}
- 閱讀對象：${D.audiences.join("、")||"未指定"}
- 補充說明：${D.extraNotes||"無"}

---
*此表由客戶填寫，詳細關鍵字設定及技術細節由分析團隊另行處理。*`;
}

/* ── render ── */
function renderStepNav(){
  const row=document.getElementById("step-row");
  row.replaceChildren();
  STEPS.forEach(s=>{
    const btn=document.createElement("button");btn.className="step-btn";
    const dot=document.createElement("div");
    dot.className="step-dot"+(step>s.id?" done":step===s.id?" active":"");
    dot.textContent=step>s.id?"\u2713":s.id;
    const lbl=document.createElement("span");
    lbl.className="step-lbl"+(step===s.id?" active":"");
    lbl.textContent=s.label;
    btn.appendChild(dot);btn.appendChild(lbl);
    btn.onclick=function(){goStep(s.id);};
    row.appendChild(btn);
  });
  document.getElementById("prog-fill").style.width=((step-1)/(STEPS.length-1)*100)+"%";
}
function renderStep(){
  renderStepNav();
  document.getElementById("card-title").textContent=STEPS[step-1].icon+" "+STEPS[step-1].label;
  const body=document.getElementById("step-body");
  body.replaceChildren();
  body.appendChild(stepDOM());
  document.getElementById("btn-prev").disabled=step===1;
  const nn=document.getElementById("btn-next");
  const np=document.getElementById("btn-preview");
  if(step===STEPS.length){nn.style.display="none";np.style.display="";}
  else{nn.style.display="";np.style.display="none";}
  updateSummary();
}
function goStep(n){step=n;showPreview=false;document.getElementById("preview-area").style.display="none";document.getElementById("btn-preview").textContent="預覽填寫內容";renderStep();}
function prevStep(){if(step>1){step--;renderStep();}}
function nextStep(){if(step<STEPS.length){step++;renderStep();}}
function togglePreview(){
  showPreview=!showPreview;
  const pa=document.getElementById("preview-area");
  if(showPreview){document.getElementById("brief-pre").textContent=generateBrief();pa.style.display="";}
  else pa.style.display="none";
  document.getElementById("btn-preview").textContent=showPreview?"收起預覽":"預覽填寫內容";
}
function copyBrief(){
  navigator.clipboard.writeText(generateBrief()).then(function(){
    const b=document.getElementById("btn-copy");
    b.textContent="\u2713 已複製";b.classList.add("done");
    setTimeout(function(){b.textContent="複製全文";b.classList.remove("done");},2000);
  });
}
function exportMd(){
  const cs=(D.clientName||"client").replace(/\s+/g,"_");
  const ps=(D.projectName||"project").replace(/\s+/g,"_");
  const ds=new Date().toISOString().slice(0,10).replace(/-/g,"");
  const fn="\u5ba2\u6236\u9700\u6c42\u8868_"+cs+"_"+ps+"_"+ds+".md";
  const blob=new Blob([generateBrief()],{type:"text/markdown;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=fn;a.click();
  URL.revokeObjectURL(url);
  mdStatus="done";renderStep();
  setTimeout(function(){mdStatus="idle";renderStep();},3000);
}
function updateSummary(){
  const bar=document.getElementById("summary-bar");
  const imap={insurance:"保險業",fmcg:"快消品／食品",tech:"科技業",finance:"金融業",other:"其他"};
  const items=[D.clientName,D.projectName,imap[D.industry]].filter(Boolean);
  if(items.length&&!showPreview){
    bar.style.display="";
    bar.replaceChildren();
    items.forEach(function(s){const sp=document.createElement("span");sp.textContent=s;bar.appendChild(sp);});
  } else bar.style.display="none";
}

renderStep();
