'use strict';

function sourceFidelityHTML(){
  const proof=deepCourse.sourceFidelity;
  if(!proof)return '';
  return `<section class="callout" aria-labelledby="source-fidelity-title"><div class="label">2026-10-22 · 原页完整性复核</div><h2 id="source-fidelity-title">原页齐全，不等于OCR逐字无误</h2><p><strong>${proof.verifiedPages} / ${proof.source.pages} 页原始图像已逐页校验：</strong>直接提取PDF内嵌图像，保留原始像素和文件字节，没有缩图、重新压缩或重排。封面、扉页、版权页、编委会、推荐序、前言、目录、310页正文和封底全部包括。</p><p><strong>这份PDF没有文字层。</strong>阅读器显示完整原页图像；辅助OCR是机器识别，尚未逐字校订。“原书细读”是课程讲解，也不是逐字转录。因此不能把网站称为“全书文字已经无误转成HTML”。原书自身的印刷或内容错误仍按原样保留，另附说明。</p><div class="buttons"><a class="button" href="#reader/1">从封面开始核对全部325页 →</a><a class="text-link" href="source-fidelity.json" target="_blank" rel="noopener">查看逐页校验明细 ↗</a></div></section>`;
}

function bookGuidePage(){
  const g=deepCourse.bookGuide;
  setCrumb('全书导读 · 作者的写作意图');
  if(!g)return '<h1 class="page-title">全书导读暂时无法加载</h1>';
  const m=g.metadata;
  return `<div class="reader-layout"><article><div class="eyebrow">BEFORE CHAPTER ONE / 推荐序与前言</div><h1 class="page-title">${esc(g.title)}</h1><p class="page-intro">${esc(g.intro)}</p><p class="source-caption">${esc(g.basis)}</p><div class="prose deep-prose">${g.sections.map((s,i)=>`<section id="book-guide-${i}" class="book-guide-section"><h2>${esc(s.title)}</h2><figure class="source-passage"><blockquote>${esc(s.quote)}</blockquote><figcaption>${esc(s.attribution)} · <button class="text-link" data-source="${s.quotePdf||s.pdfPages[0]}">引文 PDF ${s.quotePdf||s.pdfPages[0]} ↗</button></figcaption></figure>${paras(s.paragraphs)}<div class="guide-question"><h3>带着这个问题往下读</h3><p>${esc(s.question)}</p><details class="reference-answer"><summary>展开课程分析</summary>${paras(s.answer)}</details></div><div class="connections">${s.connections.map(c=>`<a href="#chapter/${c.chapter}/insight">第 ${c.chapter} 章<small>${esc(c.reason)}</small></a>`).join('')}</div></section>`).join('')}<h2>认识这份原始资料</h2><p>${esc(m.title)}，${esc(m.series)}。${esc(m.authors.join('、'))} 著；编委会另有${esc(m.committeeAdditional.join('、'))}。</p><p>${esc(m.publisher)}，${esc(m.edition)}。ISBN ${esc(m.isbn)}；CIP ${esc(m.cip)}。${esc(m.format)}；${esc(m.printedPrice)}。</p><p>${esc(m.note)}</p><div class="buttons"><button class="button" data-source="3">核对版权页</button><button class="button" data-source="4">编委会</button><button class="button" data-source="325">封底</button></div></div><div class="buttons"><a class="button primary" href="#chapter/1">开始第一章 →</a><a class="button" href="#sources">原书索引与校核说明 →</a></div></article><aside class="reading-rail"><h3>全书导读</h3>${g.sections.map((s,i)=>`<a href="#book-guide-${i}" data-scroll="book-guide-${i}">${esc(s.title)}</a>`).join('')}<div class="source-ref">推荐序是推荐者的观点；前言说明作者的意图；问题分析为课程补充。</div></aside></div>`;
}

function readingChapter(id){return deepCourse.reading?.chapters?.find(c=>c.id===Number(id));}
function lessonSourcePages(id){
  return (deepCourse.reading?.chapters||[]).flatMap(c=>c.pages).map(p=>({...p,details:p.details.filter(d=>d.lessonId===id)})).filter(p=>p.details.length);
}
function detailHTML(detail,page){
  const kinds={prose:'正文细读',table:'表格解读',figure:'读图',formula:'公式与条件',note:'注释与限定'};
  return `<section class="source-detail" id="detail-${esc(detail.id)}"><div class="detail-source"><span>${esc(kinds[detail.sourceKind]||'细读')}</span><span>${esc(detail.sourceLabel)}</span><button class="text-link" data-source="${page.pdfPage}">书页 ${page.bookPage} ↗</button></div><h3>${esc(detail.title)}</h3>${paras(detail.explanation)}${detail.blocks?.length?renderBlocks(detail.blocks,detail.id):''}${detail.originalValues.length&&!detail.valuesInBlocks?`<div class="source-values"><h4>原书中的具体信息</h4><ul>${detail.originalValues.map(v=>`<li>${esc(v)}</li>`).join('')}</ul></div>`:''}${detail.conditions.length?`<div class="source-conditions"><h4>读到这里，要保留哪些条件</h4><ul>${detail.conditions.map(v=>`<li>${esc(v)}</li>`).join('')}</ul></div>`:''}</section>`;
}
function sourcePageUncertainties(p){return p.uncertainties?.length?`<aside class="source-uncertainty"><strong>本页的疑点与未给出的条件</strong>${paras(p.uncertainties)}</aside>`:'';}
function bookPageHTML(number){
  const n=Number(number), c=(deepCourse.reading?.chapters||[]).find(c=>c.pages.some(p=>p.bookPage===n));
  if(!c)return null;
  const p=c.pages.find(p=>p.bookPage===n), chapter=getChapter(c.id), ids=[...new Set(p.details.map(d=>d.lessonId))];
  setCrumb(`原书细读 · 第 ${c.id} 章 · 书页 ${n}`);
  return `<div class="reader-layout"><article><div class="eyebrow">READ IN BOOK ORDER / 按原书页序细读</div><h1 class="page-title">${esc(chapter.title)}<br><span class="book-page-number">书页 ${n}</span></h1><p class="page-intro">以下将本页的论点、图表与限定展开为课程讲解。沿页序前后连读，也可以回到相关课节完成示范和练习。</p><div class="buttons"><a class="button" href="#chapter/${c.id}/details">本章完整目录</a><button class="button" data-source="${p.pdfPage}">核对原页 ↗</button></div><div class="prose deep-prose close-reading">${p.details.map(d=>detailHTML(d,p)).join('')}${sourcePageUncertainties(p)}</div><div class="lesson-bottom">${n>1?`<a href="#book-page/${n-1}" class="text-link">← 书页 ${n-1}</a>`:'<a class="text-link" href="#book-guide">← 回到全书导读</a>'}${n<310?`<a href="#book-page/${n+1}" class="text-link">书页 ${n+1} →</a>`:'<a class="text-link" href="#case">进入综合评审 →</a>'}</div></article><aside class="reading-rail"><h3>把细节接回方法</h3>${ids.map(id=>`<a href="#lesson/${id}/read">${esc(getLesson(id).title)}</a>`).join('')}<h3>本页内容</h3>${p.details.map(d=>`<a href="#detail-${d.id}" data-scroll="detail-${d.id}">${esc(d.title)}</a>`).join('')}<div class="source-ref"><a href="#chapter/${c.id}/insight">回到本章作者思想 →</a></div></aside></div>`;
}
function lessonDetailsHTML(l){
  const pages=lessonSourcePages(l.id);
  if(!pages.length)return '<p>本课细读资料正在逐页核对；现有研读与示范可以继续使用。</p>';
  return `<div class="close-reading-intro"><div class="eyebrow">CLOSE READING / 原书细读</div><h2>把概念放回具体条件中</h2><p>按原书页序展开本课涉及的定义、条目、图表和限定。以下为课程讲解；原数值保留出版时的语境。点击页码可核对原页。</p><nav class="page-jumps" aria-label="细读页码">${pages.map(p=>`<a href="#source-page-${p.bookPage}" data-scroll="source-page-${p.bookPage}">${p.bookPage}</a>`).join('')}</nav></div><div class="prose deep-prose close-reading">${pages.map(p=>`<section class="close-reading-page" id="source-page-${p.bookPage}"><div class="source-page-heading"><h2>书页 ${p.bookPage}</h2><button class="text-link" data-source="${p.pdfPage}">核对原页 ↗</button></div>${p.details.map(d=>detailHTML(d,p)).join('')}${sourcePageUncertainties(p)}</section>`).join('')}</div><section class="detail-reflection"><h2>细节怎样改变我的判断</h2><p>挑一个容易遗漏的限定，写出：删掉它以后，哪一个结论会失效？然后回到本课示范与练习检验。</p><label for="detail-notes-${l.id}">我的条件清单与疑问</label><textarea class="note-box" id="detail-notes-${l.id}" data-draft="${l.id}-detail-notes">${esc(state.drafts[`${l.id}-detail-notes`]||'')}</textarea><div class="buttons"><a class="button" href="#lesson/${l.id}/read">回到方法与完整示范</a><a class="button primary" href="#lesson/${l.id}/check">用练习检验理解 →</a></div></section>`;
}
function chapterDetailsPage(c){
  setCrumb(`第 ${c.id} 章 · 原书细读`);
  const entries=(deepCourse.reading?.toc||[]).filter(t=>t.chapter===c.id), rc=readingChapter(c.id);
  return `<div class="eyebrow">CLOSE READING / 第 ${c.id} 章</div><h1 class="page-title">${esc(c.title)} · 原书细读</h1>${chapterLearningTabs(c,'details')}<p class="page-intro">思想研习帮助把握作者的判断，细读把判断落实到定义、图表、数值和限定。按课节进入，保持原书页序阅读；每一处细节都能回到来源。</p><div class="detail-lesson-grid">${c.lessons.map(l=>{const ps=lessonSourcePages(l.id),count=ps.reduce((n,p)=>n+p.details.length,0);return `<a class="detail-lesson-card" href="#lesson/${l.id}/details"><span class="eyebrow">${esc(l.section)}</span><h2>${esc(l.title)}</h2><p>${ps.length?`涉及 ${ps.length} 页 · ${count} 项展开`:'逐页核对中'}</p><span class="text-link">进入细读 →</span></a>`;}).join('')}</div><h2>原书完整分节目录</h2><p>点击分节标题进入对应书页的课程讲解；点击页码核对扫描。部分长节在课程中拆成多课。</p><ol class="source-toc">${entries.map(t=>`<li class="${t.section.split('.').length===3?'toc-child':''}"><span>${esc(t.section)}</span><a href="#book-page/${t.page}">${esc(t.title)}</a><button class="text-link" data-source="${t.page+14}" aria-label="核对 ${esc(t.section)} 起始原页 ${t.page}">${t.page} ↗</button></li>`).join('')}</ol>${rc?`<p class="source-caption">本章逐页记录 ${rc.pages.length} 页。课程解释与原书资料分列；原书疑点在对应页下说明。</p>`:''}`;
}

function closeReadingSearchDocuments(){
  const docs=[];
  if(deepCourse.bookGuide)docs.push({title:'全书导读 · 推荐序与前言',kind:'作者意图',href:'#book-guide',text:LearningCore.textOf(deepCourse.bookGuide),pages:[]});
  for(const c of deepCourse.reading?.chapters||[])for(const p of c.pages)for(const d of p.details){
    docs.push({title:d.title,kind:'原书细读',href:`#lesson/${d.lessonId}/details/${d.id}`,text:LearningCore.textOf([d.explanation,d.originalValues,d.conditions,d.blocks,p.uncertainties]),pages:[p.bookPage,p.bookPage]});
  }
  return docs;
}
