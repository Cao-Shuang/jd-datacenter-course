'use strict';

const projectDependencies={
  1:{chapters:[],question:'先定义业务要求、假设与不可接受的中断情景，给后续所有计算保留同一份输入。'},
  2:{chapters:[1],question:'把第一章的业务承诺转成供电路径需要覆盖的事件；列出哪些容量和接口仍是假设。'},
  3:{chapters:[1,2],question:'使用负载和路径结论检查UPS与电池。维护退出后的容量、电压窗口和时间预算是否同时成立？'},
  4:{chapters:[1,3],question:'追踪IT与其他热源，检查电力中断后冷却能保持多久。电池时间不能直接当作冷却时间。'},
  5:{chapters:[2,3,4],question:'把后备建立时序接到UPS和冷却过渡，检查辅助系统是否能从停电初态建立。'},
  6:{chapters:[2,4,5],question:'哪些测点能证明前几章的假设正在兑现？命令、反馈和物理效果分别由什么证据支持？'},
  7:{chapters:[1,6],question:'网络路径与端点标识怎样进入同一份资产和监测记录？逻辑双路是否真的经过不同物理边界？'},
  8:{chapters:[1,2,5,7],question:'把电源、燃油和线缆穿越接回防火边界；产品资料如何对应现场节点与变更后的状态？'},
  9:{chapters:[1,4,7,8],question:'装修如何同时支持送风、布线、边界完整与维护？变更后需要重新验证哪些此前成立的结论？'},
  10:{chapters:[1,2,3,4,5,6,7,8,9],question:'用前九章的成果检查真实案例，再说明哪些方法能迁移、哪些参数只能在原项目条件下使用。'}
};
function savedChapterHTML(id){
  const c=getChapter(id),items=c.lessons.filter(l=>state.projectStages[l.id]?.trim());
  return `<details class="dossier-reference"><summary>第 ${id} 章 · ${esc(c.shortTitle)}<span>${items.length?'已有 '+items.length+' 份草稿':'尚未填写'}</span></summary>${items.length?items.map(l=>`<section><h4>${esc(l.title)}</h4><p class="saved-draft">${esc(state.projectStages[l.id])}</p><a class="text-link" href="#project/${id}">回去修订这份成果 →</a></section>`).join(''):`<p>还没有本章工程成果。可以先带着问题研读，再写下条件与依据。</p><a class="text-link" href="#project/${id}">打开本章工程档案 →</a>`}</details>`;
}
function projectContextHTML(c){
  const p=projectDependencies[c.id],ws=chapterWorkshop(c.id);
  return `<section class="dossier-context"><div class="eyebrow">CONNECT YOUR REASONING / 接着已有结论往下走</div><h3>${esc(p.question)}</h3>${p.chapters.length?`<p>直接查看相关章节的已有草稿，核对输入、条件及需要修改的结论。</p>${p.chapters.map(savedChapterHTML).join('')}`:'<p>把事实、教学假设和待确认条件分开写，后续章节会在这里接着使用。</p>'}<details class="dossier-reference"><summary>回看本章推理工坊里的判断变化</summary>${(ws?.cases||[]).map(x=>`<section><h4>${esc(x.title)}</h4>${[['initial','初始理由'],['revision','遇到证据后的修改'],['transfer','独立变式']].map(([k,t])=>`<p><strong>${t}</strong></p><p class="saved-draft">${esc(state.drafts[`${x.id}-${k}`]||'尚未填写')}</p>`).join('')}<a class="text-link" href="#chapter/${c.id}/workshop/${x.id}">回到这个任务 →</a></section>`).join('')}</details></section>`;
}
const synthesisCases=[
 {id:'continuity',title:'一次停电：电恢复了，热量来得及离开吗？',chapters:[1,2,3,4,5,6,10],pages:[138,283,287,295],
  intro:'沿用100柜、600 kW教学机房。下列时间均为新给定的教学假设；它们不是京东案例参数。把各专业的“已经准备好”放到同一条时间轴上。',
  rows:[['UPS','在本题IT负载下可维持12 min','它保障哪些设备？'],['后备电源','停电后第4 min建立可用输出','建立供电是否等于冷量恢复？'],['制冷','可用电源建立后，还需6 min才形成题设有效冷量','从哪个时刻开始计时？'],['过渡冷却','停电后可维持所需环境8 min','最迟允许何时接上有效冷量？'],['采集控制','题设独立保障12 min','观测必须证明物理效果而不只是命令'] ],
  task:'画出电力、冷却、控制三条时间线。说明哪些条件通过、哪段存在缺口；写出修补方案必须满足的不等式，不直接给出设备采购结论。',
  hints:['统一以停电为t=0。“再需6 min”要从后备电源可用的第4 min开始。','分别比较4与12、4+6与8。电池尚有余量不能抵消冷却的时间缺口。'],
  solution:['电力在第4 min接管，早于UPS的12 min；题设冷量在第10 min才建立，晚于过渡冷却的第8 min，存在2 min未被题设保障覆盖的区间。控制12 min只支持这段时间的观测/控制，不创造冷量。','可行方案必须使有效冷量建立时刻≤过渡冷却结束时刻，并同时满足电力及控制时限。可比较缩短建立时间、增加经验证过渡能力或调整负荷等方向，但这些改变都需要新的数据，不能在本题里假定已经实现。','若新增证据把后备建立改为7 min，冷量形成变为13 min，冷却缺口扩大为5 min；已给出的控制保障只到第12 min，第13 min的控制状态还缺证据。原电力条件7≤12仍通过，这说明局部通过不代表全系统通过。原书15 min/15 h蓄冷冲突也必须另行核对，不能拿其中一个值给本题补缺口。'],
  rubric:['以同一t=0算出4、8、10、12 min的关系。','明确2 min冷却保障缺口，未把UPS时间当冷却时间。','在7 min变式中识别冷却与控制保障证据两个条件变化。'],handoff:'在档案中列出电力、热量、控制各自的持续时间、建立时间、测量证据和仍待验证项。'},
 {id:'change',title:'一次布线变更：网络通过以后，还要重新证明什么？',chapters:[1,4,6,7,8,9,10],pages:[216,232,235,252,257,262],
  intro:'同一座教学机房计划新增一组网络设备。下列资料描述一次假想变更；任务是追踪它怎样改变此前成立的结论。',
  rows:[['网络','两条链路均测试通过；实际共同经过同一桥架与穿墙点','逻辑双路支持怎样的故障范围？'],['空气','新增线缆占用了部分地板下空间；原气流测试在变更前完成','旧测试能否证明当前进风条件？'],['边界','有封堵材料证书，缺新增穿越节点的完成记录','材料证据与现场组合有何差别？'],['标识','平台仍显示旧端口，现场已贴新标签','下一次维护能否追踪同一对象？']],
  task:'把“网络施工完成”改写成一份跨专业交接判断。至少列四项主张，每项分别写当前证据、缺失证据和可以得出的有限结论。',
  hints:['逐条区分链路性能、物理独立性、气流、边界和资产一致性。','不要把“尚缺证据”直接写成“实体已失败”；也不能将未检查写成已通过。'],
  solution:['网络测试支持列明链路在对应测试条件下的性能；共同桥架和穿越点意味着相关共同事件仍可影响双路，不能据两份通过报告承诺物理独立。','变更前气流报告可以作为基线，不能单独证明新状态；需针对变化的路径和进风条件取得当前证据。材料证书支持对应产品，不单独覆盖现场穿越节点。','现场与平台标识需要对应端点、路径和变更版本；完成记录应让下一位维护者辨认同一对象。阶段性结论应保留已通过项目与未关闭项，并使每个未关闭项都有责任和验证依据。'],
  rubric:['区分性能通过与物理独立。','把气流和防火边界接到新增路径。','指出平台/现场一致性和当前版本证据。'],handoff:'将变更影响写回第4、7、8、9章的相应成果，而不只在第7章增加一条“已完成”。'},
 {id:'efficiency',title:'一次节能评审：同一张账单里有几个不同问题？',chapters:[1,3,4,5,6,10],pages:[130,133,141,300,301,302],
  intro:'教学机房要评估节能方案。已知表内两期间时长、计量边界相同，但未说明负载形态、天气和业务产出是否可比。',
  rows:[['期间A','总能耗1200 MWh；IT能耗800 MWh','总量、非IT量与PUE各是什么？'],['期间B','总能耗1100 MWh；IT能耗700 MWh','下降100 MWh是否证明效率改善？'],['新风方案','声称每年4000 h可用；只提供温度条件','湿度、污染与回退模式在哪里？'],['运行依据','备用设备电耗未单列，相关测点存在缺测','不确定性会怎样影响结论？']],
  task:'先形成可核对的能量账，再区分已经观察的事实、需要进一步解释的变化和目前不能成立的因果主张。把原书的设备与运维观点接到这份评审里。',
  hints:['A、B非IT能耗都等于400 MWh，但分母不同。','结合第4章工坊的可用时段交集，以及第6章的数据质量，检查节能承诺。'],
  solution:['A的PUE=1.50，B≈1.5714；两者非IT均400 MWh。总量减少100 MWh与IT减少100 MWh相伴，不能据此证明非IT能耗已经降低。','负载率改变可能改变设备效率；天气与备用策略也可能改变消耗。先保留观测结果，补可比工况和缺测处理，不能自动将PUE变化归因于某项改造。','新风的4000 h只证明温度条件的候选时段，必须与湿度、空气质量、可达冷量等条件取交集，并计入辅助能耗和回退。不能为节能关掉必要保障后仍按同一服务边界比较。'],
  rubric:['得到1.50、约1.5714及两段400 MWh。','区分事实、解释和因果主张。','将可用时段、数据质量和保障边界纳入比较。'],handoff:'在档案中同时保留总量、分量、比值、服务条件和测量缺口，写明下一轮评审需要补什么。'},
 {id:'handover',title:'一次交接：怎样证明你交出的是能继续运行的系统？',chapters:[1,6,7,8,9,10],pages:[189,204,232,252,262,295,309,310],
  intro:'最后从下一位运维者的视角阅读自己的方案。前九章的局部结论，应当组成可查、可维护、可复核的同一设施。',
  rows:[['图纸','竣工图为版本V2，平台资产来自V1','对象和现状能否一一对应？'],['告警','告警已清空，未记录原因或复核依据','清空状态证明了什么？'],['维护','有年度清单，未说明维护期间的剩余保障','如何重建维护状态的边界？'],['变更','新路径有照片，未关联检测与责任记录','下一次事件能否沿证据回看？']],
  task:'写出交接前仍需形成的四条证据链，并用一段话解释这本书为什么以运维与平台收尾，而不在设备选型后结束。',
  hints:['每条链包含对象、版本、条件、验证与责任；不要只罗列文件名称。','回到作者前言：设计与运维共同构成基础设施架构诞生和持续兑现的过程。'],
  solution:['建立V2图纸、现场端点、平台资产的对象对应；记录差异及确认结果，避免同名对象指向不同设备。','告警记录需要原因、处置、物理反馈与复核；清空仅说明界面状态变化。维护清单需要接回各状态下的容量、路径与辅助条件。','变更将图纸、实体、测试、环境和问题关闭联系起来。作者的案例因此把前九章的设计方法变成运行中不断接受反馈的系统：读懂全书，不只是会选设备，还能说明条件如何保持、失效如何发现、结论如何被新证据修正。'],
  rubric:['四条证据链均指向具体对象及版本。','维护状态与日常正常状态分开。','能用设计—验证—运行—修订解释作者结构。'],handoff:'带着这些缺口回看各章草稿，形成一份带条件、来源和未决项的最终评审。'}
];
function synthesisPage(id){
 const c=synthesisCases.find(x=>x.id===id)||synthesisCases[0];setCrumb('全书贯通 · 综合推理');
 return `<div class="reader-layout"><article><div class="eyebrow">CONNECT THE WHOLE BOOK / 从一件事走过十章</div><h1 class="page-title">让十章知识共同回答问题</h1><p class="page-intro">先独立作答，再展开参考推理。用你的工程档案检查一个真实的思维要求：局部条件能否同时支持同一项服务？</p><nav class="workshop-picker" aria-label="全书贯通任务">${synthesisCases.map((x,i)=>`<a href="#synthesis/${x.id}" class="${c.id===x.id?'active':''}"><span>评审 ${i+1}</span>${esc(x.title)}</a>`).join('')}</nav><h2 class="workshop-title">${esc(c.title)}</h2>${paras(c.intro)}${renderBlocks([{type:'table',caption:'本题给定资料',headers:['对象','记录与假设','需要解释的问题'],rows:c.rows}],c.id)}<section class="workshop-step"><h3>${esc(c.task)}</h3><label for="synthesis-${c.id}">我的跨章判断与依据</label><textarea id="synthesis-${c.id}" class="note-box" data-draft="synthesis-${c.id}">${esc(state.drafts[`synthesis-${c.id}`]||'')}</textarea>${hintsHTML(c.hints,c.solution)}<fieldset class="self-rubric"><legend>合上参考推理，再检查一次</legend>${c.rubric.map((x,i)=>`<label><input type="checkbox" data-learning-check="synthesis-${c.id}-${i}" ${state.checks[`synthesis-${c.id}-${i}`]?'checked':''}>${esc(x)}</label>`).join('')}</fieldset></section><section class="dossier-context"><h3>将结论写回同一份工程档案</h3><p>${esc(c.handoff)}</p>${c.chapters.map(savedChapterHTML).join('')}</section><div class="buttons"><button class="button primary" data-synthesis-export>导出四份贯通评审</button><a class="button" href="#case">回到综合方案总稿 →</a></div></article><aside class="reading-rail"><h3>沿这些章节往返</h3>${c.chapters.map(n=>`<a href="#chapter/${n}/workshop">第 ${n} 章 · ${esc(getChapter(n).shortTitle)}</a>`).join('')}<h3>回到原书思想</h3>${c.pages.map(n=>`<a href="#book-page/${n}">书页 ${n} 的论点与条件</a>`).join('')}<div class="source-ref">参考推理是课程补充。你写下的判断会自动保存在本浏览器，完整备份也包含这些草稿。</div></aside></div>`;
}
function synthesisSearchDocuments(){return synthesisCases.map(c=>({title:c.title,kind:'全书贯通',href:'#synthesis/'+c.id,text:LearningCore.textOf(c),pages:[Math.min(...c.pages),Math.max(...c.pages)]}));}
function learningLoopHTML(c){return `<section class="learning-loop"><h2>这一章怎样读深</h2><ol>${[['insight','抓住作者要解决的问题','先解释本章为什么这样展开。'],['details','回到图表和具体条件','沿原书页序核对每个限定。'],['workshop','让判断接受新证据','先作答，再修改推理并完成变式。'],['quiz','独立检验理解','依据反馈回到具体课节。']].map(([tab,title,desc])=>`<li><a href="#chapter/${c.id}/${tab}"><strong>${title}</strong><span>${desc}</span></a></li>`).join('')}<li><a href="#project/${c.id}"><strong>写入同一座机房的档案</strong><span>接上其他章节的输入与证据。</span></a></li></ol><a class="text-link" href="#synthesis">完成几章后，用跨章评审检验联系 →</a></section>`;}
function reasoningRecordsHTML(){const cases=(deepCourse.workshops||[]).flatMap(c=>c.cases.map(x=>({...x,chapterId:c.id}))),filled=cases.filter(c=>['initial','revision','transfer'].some(k=>state.drafts[`${c.id}-${k}`]?.trim()));return `<section class="reasoning-records"><h2>推理工坊里的判断变化</h2>${filled.length?filled.map(c=>`<details class="dossier-reference"><summary>${esc(c.title)}</summary>${[['initial','初始理由'],['revision','修改后的判断'],['transfer','独立变式']].map(([k,t])=>`<h4>${t}</h4><p class="saved-draft">${esc(state.drafts[`${c.id}-${k}`]||'尚未填写')}</p>`).join('')}<a class="text-link" href="#chapter/${c.chapterId}/workshop/${c.id}">继续这个任务 →</a></details>`).join(''):'<p>在推理工坊写下初始理由、遇到证据后的修改与独立解答，这里会把同一次思考的变化放在一起。</p>'}<h2>全书贯通评审</h2>${synthesisCases.map(c=>`<details class="dossier-reference"><summary>${esc(c.title)}</summary><p class="saved-draft">${esc(state.drafts[`synthesis-${c.id}`]||'尚未填写')}</p><a class="text-link" href="#synthesis/${c.id}">进入这份评审 →</a></details>`).join('')}</section>`;}
document.addEventListener('click',e=>{if(!e.target.closest('[data-synthesis-export]'))return;downloadLocal('机房之外 · 全书贯通评审\n课程教学情境，非工程实施文件。\n\n'+synthesisCases.map(c=>`${c.title}\n${state.drafts[`synthesis-${c.id}`]||'尚未填写'}\n`).join('\n'),'机房之外-全书贯通评审.txt');});
