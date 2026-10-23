(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LearningCore = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const routes = {
    foundation: [1,2,3,4,5,6,7,8,9,10],
    design: [1,2,3,5,4,7,8,9,6,10],
    operations: [1,6,10,2,3,4,5,7,8,9]
  };
  const routeName = value => Object.hasOwn(routes, value) ? value : 'foundation';
  function orderedLessons(chapters, route) {
    return routes[routeName(route)].flatMap(id => (chapters.find(c => c.id === id)?.lessons || []).map(l=>({...l,chapterId:id})));
  }
  function neighbors(chapters, route, id) {
    const list = orderedLessons(chapters, route), index = list.findIndex(l => l.id === id);
    return {previous:index > 0 ? list[index-1] : null, next:index >= 0 ? list[index+1] || null : null};
  }
  const normalize = value => String(value || '').toLocaleLowerCase().replace(/\s+/g, '');
  function textOf(value) {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.map(textOf).join(' ');
    if (value && typeof value === 'object') return Object.entries(value).filter(([k]) => !['src','id','type','width','height','sourcePages','answer','lessonIds','pages','bookPages'].includes(k)).map(([,v])=>textOf(v)).join(' ');
    return '';
  }
  function makeIndex(chapters, deep, glossary) {
    const docs = [];
    for (const c of chapters) {
      const dc = deep.chapters?.find(d => d.id === c.id);
      if(dc?.insight) docs.push({title:`第 ${c.id} 章思想研习`,kind:'作者思想',href:`#chapter/${c.id}/insight`,text:textOf(dc.insight),pages:c.bookRange});
      for (const l of c.lessons) {
        const dl = dc?.lessons?.find(x=>x.id===l.id);
        docs.push({title:l.title,kind:'课程与示范',href:`#lesson/${l.id}/read`,text:textOf([l.lead,l.sections,dl?.blocks,dl?.worked,dl?.prerequisites]),pages:l.bookPages});
        docs.push({title:l.title+' · 练习',kind:'练习与反馈',href:`#lesson/${l.id}/check`,text:textOf([dl?.practice||l.practice,dl?.decision||l.decision,dl?.retrieval||l.recall,dl?.projectStep]),pages:l.bookPages});
      }
    }
    for (const [title,text] of glossary || []) docs.push({title,kind:'术语',href:'#systems',text,pages:[]});
    return docs;
  }
  function search(index, query) {
    const terms=String(query||'').trim().split(/\s+/).map(normalize).filter(Boolean);
    if(!terms.length)return [];
    return index.map(d=>{const title=normalize(d.title),body=normalize(d.text);return {...d,score:terms.every(t=>title.includes(t)||body.includes(t))?terms.reduce((s,t)=>s+(title.includes(t)?10:0)+(body.includes(t)?1:0),0):0};}).filter(d=>d.score).sort((a,b)=>b.score-a.score);
  }
  function excerpt(text, query, max=160) {
    const plain=String(text||'').replace(/\s+/g,' '), term=String(query||'').trim().split(/\s+/)[0]||'';
    const p=plain.toLowerCase().indexOf(term.toLowerCase()),start=Math.max(0,p-35);
    return (start?'…':'')+plain.slice(start,start+max)+(plain.length>start+max?'…':'');
  }
  function gradeQuiz(questions,selected) {
    const wrong=questions.map((q,i)=>selected[i]===q.answer?-1:i).filter(i=>i>=0);
    return {score:questions.length-wrong.length,passed:questions.length>0&&!wrong.length,wrong};
  }
  const dictionary=v=>v && typeof v==='object'&&!Array.isArray(v);
  const safeKey=k=>!['__proto__','prototype','constructor'].includes(k)&&/^[a-zA-Z0-9#/_-]{1,140}$/.test(k);
  function learningRouteExists(hash,chapters){
    if(typeof hash!=='string'||!hash.startsWith('#'))return false;
    const p=hash.slice(1).split('/'),[kind,id,mode,detail]=p;
    if(kind==='lesson')return p.length<=4&&chapters.some(c=>c.lessons.some(l=>l.id===id))&&(!mode||['read','details','check','source'].includes(mode))&&(!detail||(mode==='details'&&/^p\d+-\d+$/.test(detail)));
    if(kind==='chapter')return p.length<=4&&chapters.some(c=>String(c.id)===id)&&(!mode||(['insight','details','coverage','quiz','workshop'].includes(mode)||(['1','2','3','4','5','6','7','8','9','10'].includes(id)&&mode==='original')))&&(!detail||(mode==='workshop'&&[`${'c'+id}-a`,`${'c'+id}-b`].includes(detail)));
    if(kind==='project')return p.length===2&&chapters.some(c=>String(c.id)===id);
    if(kind==='original')return p.length<=2&&(!id||(/^\d+$/.test(id)&&Number(id)>=1&&Number(id)<=325));
    if(kind==='book-page'||kind==='reader')return p.length===2&&/^\d+$/.test(id)&&Number(id)>=1&&Number(id)<=(kind==='reader'?325:310);
    if(kind==='synthesis')return p.length<=2&&(!id||['continuity','change','efficiency','handover'].includes(id));
    return kind==='book-guide'&&p.length===1;
  }
  function validatedState(input, chapters) {
    if(!dictionary(input))throw Error('学习记录必须是一个对象');
    const ids=new Set(chapters.flatMap(c=>c.lessons.map(l=>l.id))),chids=new Set(chapters.map(c=>String(c.id)));
    const out={route:routeName(input.route),lastLocation:learningRouteExists(input.lastLocation,chapters)?input.lastLocation:'',contentVersion:typeof input.contentVersion==='string'?input.contentVersion.slice(0,50):'outline-v1'};
    const maps={done:'bool',notes:'text',answers:'answer',quiz:'quiz',project:'text',drafts:'text',checks:'bool',review:'text',readerPositions:'page',positions:'position',projectStages:'text',disclosures:'bool'};
    const projectKeys=new Set(['requirements','power','thermal','verification']);
    for(const [key,type] of Object.entries(maps)) {
      out[key]={};
      if(input[key]===undefined)continue;
      if(!dictionary(input[key]))throw Error(`${key} 格式不正确`);
      if(Object.keys(input[key]).length>4000)throw Error('学习记录条目过多');
      for(const [id,v] of Object.entries(input[key])) {
        if(!safeKey(id))throw Error('学习记录包含无效标识');
        if(['done','notes','answers','readerPositions'].includes(key)&&!ids.has(id)&&!(key==='readerPositions'&&id==='book'))continue;
        if(key==='quiz'&&!chids.has(id))continue;
        if(key==='project'&&!projectKeys.has(id))continue;
        if(type==='text') {if(typeof v!=='string'||v.length>50000)throw Error('笔记内容无效或过长');out[key][id]=v;}
        if(type==='bool') {if(typeof v!=='boolean')throw Error('完成状态无效');out[key][id]=v;}
        if(type==='answer') {if(!Number.isInteger(v)||v<0||v>9)throw Error('答案记录无效');out[key][id]=v;}
        if(type==='page') {if(!Number.isInteger(v)||v<1||v>325)throw Error('原书页码无效');out[key][id]=v;}
        if(type==='position') {if(!Number.isFinite(v)||v<0||v>1000000)throw Error('阅读位置无效');out[key][id]=v;}
        if(type==='quiz') {
          if(!dictionary(v)||!Number.isInteger(v.score)||v.score<0||v.score>100||typeof v.passed!=='boolean')throw Error('测验记录无效');
          out[key][id]={score:v.score,passed:v.passed,version:typeof v.version==='string'?v.version.slice(0,50):'outline-v1',date:typeof v.date==='string'?v.date.slice(0,40):'',wrong:Array.isArray(v.wrong)?v.wrong.filter(n=>Number.isInteger(n)&&n>=0&&n<100):[]};
        }
      }
    }
    if(ids.has(input.lastLesson))out.lastLesson=input.lastLesson;
    return out;
  }
  function readBackup(text, chapters) {
    if(text.length>8000000)throw Error('备份文件超过 8 MB');
    const obj=JSON.parse(text);
    if(!['jd-engineering-study-v2','jd-engineering-study-v3'].includes(obj.format)||!dictionary(obj.state))throw Error('请选择本课程导出的 JSON 学习备份');
    return validatedState(obj.state,chapters);
  }
  function recoverStoredState(input,chapters) {
    try{return {state:validatedState(input,chapters),warnings:0};}catch{}
    const clean=validatedState({},chapters);let warnings=0;
    if(!dictionary(input))return {state:clean,warnings:1};
    for(const [key,value] of Object.entries(input)) {
      if(!Object.hasOwn(clean,key)&&key!=='lastLesson')continue;
      if(dictionary(value)) {
        for(const [id,item] of Object.entries(value)) {
          try{const v=validatedState({[key]:{[id]:item}},chapters);Object.assign(clean[key],v[key]);}
          catch{warnings++;}
        }
      }else {try{const v=validatedState({[key]:value},chapters);if(Object.hasOwn(v,key))clean[key]=v[key];}catch{warnings++;}}
    }
    return {state:clean,warnings};
  }
  function mergeState(current, incoming, prefer='current') {
    const out={...current};
    for(const [k,v] of Object.entries(incoming)) {
      if(dictionary(v))out[k]=prefer==='incoming'?{...(current[k]||{}),...v}:{...v,...(current[k]||{})};
      else if(prefer==='incoming'||current[k]===undefined)out[k]=v;
    }
    return out;
  }
  return {routes,routeName,orderedLessons,neighbors,textOf,makeIndex,search,excerpt,gradeQuiz,learningRouteExists,validatedState,readBackup,recoverStoredState,mergeState};
});
