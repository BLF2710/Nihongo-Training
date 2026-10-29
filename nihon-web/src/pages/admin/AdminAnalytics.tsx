import { useState } from 'react';
import { button, card, useAdminData } from './adminData';

type Funnel={unitId:string;level:string;number:number;title:string;started:number;finishedLessons:number;assessment:{attempted:number;passed:number;averageBest:number;passRate:number|null}};
type DropOff={unitId:string;level:string;unitNumber:number;from:{id:string;title:string;completed:number};to:{id:string;title:string;completed:number};lost:number};
export type Analytics={generatedAt:string;learners:{total:number;newLast30Days:number;activeToday:number;activeLast7Days:number;activeLast30Days:number};dailyActive:{day:string;learners:number}[];funnel:Funnel[];dropOffs:DropOff[];practice:{kind:string;sessions:number;accuracy:number}[]};

const PRACTICE_LABELS:Record<string,string>={kana:'Kana answers',kanji:'Kanji answers',listening:'Listening rounds',speaking:'Speaking rounds',reading:'Reading passages','mock-exam':'Mock exams',particles:'Particle Drop rounds'};
const dayLabel=(day:string,style:'short'|'long')=>new Date(day+'T00:00:00Z').toLocaleDateString(undefined,style==='short'?{day:'numeric',month:'short',timeZone:'UTC'}:{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'});
const percent=(part:number,whole:number)=>whole?Math.round(part*100/whole):0;
const th='px-4 py-3 font-semibold', td='px-4 py-3 tabular-nums';

/** Learning analytics for the admin overview: activity, unit funnels, drop-off points and practice volume (learners only). */
export default function AdminAnalytics(){
  const {data,error,loading,reload}=useAdminData<Analytics>('/admin/analytics');
  return <section aria-labelledby="analytics-heading" className="mt-6 space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="analytics-heading" className="text-2xl font-black">Learning analytics</h2><p className="text-sm text-gray-500">Learner accounts only. Days are in UTC.{data&&<> Updated {new Date(data.generatedAt).toLocaleTimeString()}.</>}</p></div><button className={button} disabled={loading} onClick={reload}>Refresh analytics</button></div>
    {error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
    {loading&&!data&&<p role="status">Loading learning analytics…</p>}
    {data&&<>
      <Learners learners={data.learners}/>
      <DailyActive days={data.dailyActive}/>
      <UnitFunnel funnel={data.funnel}/>
      <div className="grid gap-6 lg:grid-cols-2"><DropOffs dropOffs={data.dropOffs}/><Practice practice={data.practice}/></div>
    </>}
  </section>;
}

function Learners({learners}:{learners:Analytics['learners']}){
  const tiles:[string,number,string][]=[['Active today',learners.activeToday,'learned in the last 24 hours'],['Active this week',learners.activeLast7Days,'last 7 days'],['Active this month',learners.activeLast30Days,'last 30 days'],['Learners',learners.total,`${learners.newLast30Days} new in 30 days`]];
  return <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{tiles.map(([label,value,hint])=><div key={label} className={card}><dt className="text-sm font-semibold text-gray-500">{label}</dt><dd className="mt-2 text-3xl font-black tabular-nums">{value}</dd><dd className="mt-1 text-sm text-gray-500">{hint}{label.startsWith('Active')&&learners.total>0&&<> · {percent(value,learners.total)}% of learners</>}</dd></div>)}</dl>;
}

function DailyActive({days}:{days:Analytics['dailyActive']}){
  const [shown,setShown]=useState<number|null>(null);
  const max=Math.max(1,...days.map(d=>d.learners));
  const total=days.reduce((sum,d)=>sum+d.learners,0);
  return <section className={card} aria-labelledby="daily-heading">
    <h3 id="daily-heading" className="text-lg font-bold">Daily active learners</h3>
    <p className="text-sm text-gray-500">Learners who did graded work each day, last {days.length} days.</p>
    {total===0?<p className="mt-4 text-gray-500">No learner activity in this period.</p>:<>
      <div className="relative mt-5" onMouseLeave={()=>setShown(null)}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 border-b border-gray-300" aria-hidden="true"><div className="absolute inset-x-0 top-0 border-t border-dashed border-gray-200"/><span className="absolute -top-2.5 right-0 bg-white pl-1 text-xs text-gray-500">{max}</span></div>
        <ol className="relative flex h-40 items-end gap-0.5 pr-6" aria-label="Daily active learners chart">
          {days.map((d,i)=><li key={d.day} className="flex h-full flex-1 items-end">
            <button type="button" className="group flex h-full w-full items-end justify-center rounded-t focus-visible:outline-2 focus-visible:outline-emerald-600" aria-label={`${dayLabel(d.day,'long')}: ${d.learners} learner${d.learners===1?'':'s'}`} onMouseEnter={()=>setShown(i)} onFocus={()=>setShown(i)} onBlur={()=>setShown(null)}>
              <span className={`block w-full max-w-8 rounded-t bg-emerald-600 dark:bg-emerald-500 ${shown===i?'opacity-80':''}`} style={{height:d.learners?`${Math.max(4,d.learners/max*100)}%`:0}}/>
            </button>
          </li>)}
        </ol>
        {shown!==null&&<div role="status" className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-md" style={{left:`clamp(4rem, ${(shown+.5)/days.length*100}%, calc(100% - 4rem))`}}><span className="text-gray-500">{dayLabel(days[shown].day,'long')}</span><br/><b className="tabular-nums">{days[shown].learners}</b> learner{days[shown].learners===1?'':'s'}</div>}
        <div className="mt-2 flex justify-between pr-6 text-xs text-gray-500" aria-hidden="true"><span>{dayLabel(days[0].day,'short')}</span><span>{dayLabel(days[days.length-1].day,'short')}</span></div>
      </div>
    </>}
    <details className="mt-4 text-sm"><summary className="cursor-pointer font-semibold text-gray-600">Show as table</summary>
      <table className="mt-3 w-full max-w-sm text-left"><caption className="sr-only">Daily active learners</caption><thead className="text-gray-500"><tr><th className="py-1 font-semibold">Day</th><th className="py-1 text-right font-semibold">Learners</th></tr></thead><tbody>{days.map(d=><tr key={d.day} className="border-t border-gray-100"><td className="py-1">{dayLabel(d.day,'long')}</td><td className="py-1 text-right tabular-nums">{d.learners}</td></tr>)}</tbody></table>
    </details>
  </section>;
}

function UnitFunnel({funnel}:{funnel:Funnel[]}){
  const levels=[...new Set(funnel.map(f=>f.level))];
  const [level,setLevel]=useState('all');
  const [showEmpty,setShowEmpty]=useState(false);
  const inLevel=funnel.filter(f=>level==='all'||f.level===level);
  const rows=showEmpty?inLevel:inLevel.filter(f=>f.started>0||f.assessment.attempted>0);
  return <section className={card} aria-labelledby="funnel-heading">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h3 id="funnel-heading" className="text-lg font-bold">Unit completion funnel</h3><p className="text-sm text-gray-500">Started (any lesson done) → finished every lesson → attempted the unit test → passed.</p></div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2 font-semibold text-gray-600">Level<select className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-gray-900" value={level} onChange={e=>setLevel(e.target.value)}><option value="all">All levels</option>{levels.map(l=><option key={l} value={l}>{l}</option>)}</select></label>
        <label className="flex items-center gap-2 text-gray-600"><input type="checkbox" className="accent-emerald-700" checked={showEmpty} onChange={e=>setShowEmpty(e.target.checked)}/>Show units nobody has started</label>
      </div>
    </div>
    {rows.length===0?<p className="mt-4 text-gray-500">No learner has started a unit{level==='all'?'':` in ${level}`} yet.</p>:
    <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[44rem] text-left text-sm"><caption className="sr-only">Unit completion funnel</caption>
      <thead className="bg-gray-50 text-gray-500"><tr><th className={th}>Unit</th><th className={th+' text-right'}>Started</th><th className={th}>Finished lessons</th><th className={th+' text-right'}>Tested</th><th className={th+' text-right'}>Passed</th><th className={th+' text-right'}>Pass rate</th><th className={th+' text-right'}>Average best</th></tr></thead>
      <tbody>{rows.map(f=>{const finished=percent(f.finishedLessons,f.started);return <tr key={f.unitId} className="border-t border-gray-100">
        <td className="px-4 py-3"><span className="font-bold">{f.level} · Unit {f.number}</span><span className="block max-w-56 truncate text-gray-500" title={f.title}>{f.title}</span></td>
        <td className={td+' text-right'}>{f.started}</td>
        <td className={td}><div className="flex items-center gap-2"><span className="w-6 text-right">{f.finishedLessons}</span><span className="h-2 w-24 rounded-full bg-gray-100" aria-hidden="true"><span className="block h-2 rounded-full bg-emerald-600 dark:bg-emerald-500" style={{width:`${finished}%`}}/></span><span className="text-gray-500">{f.started?`${finished}%`:'–'}</span></div></td>
        <td className={td+' text-right'}>{f.assessment.attempted}</td>
        <td className={td+' text-right'}>{f.assessment.passed}</td>
        <td className={td+' text-right font-bold'}>{f.assessment.passRate===null?<span className="font-normal text-gray-500">–</span>:`${f.assessment.passRate}%`}</td>
        <td className={td+' text-right'}>{f.assessment.attempted?`${f.assessment.averageBest}%`:<span className="text-gray-500">–</span>}</td>
      </tr>;})}</tbody></table></div>}
  </section>;
}

function DropOffs({dropOffs}:{dropOffs:DropOff[]}){
  return <section className={card} aria-labelledby="dropoff-heading">
    <h3 id="dropoff-heading" className="text-lg font-bold">Biggest drop-off points</h3>
    <p className="text-sm text-gray-500">Learners who completed a lesson but not the next one in the same unit.</p>
    {dropOffs.length===0?<p className="mt-4 text-gray-500">No drop-offs yet.</p>:
    <ol className="mt-4 space-y-3">{dropOffs.map(d=><li key={d.from.id} className="rounded-xl border border-gray-100 p-3">
      <div className="flex items-baseline justify-between gap-3"><p className="min-w-0 text-sm font-semibold text-gray-500">{d.level} · Unit {d.unitNumber}</p><p className="whitespace-nowrap font-bold tabular-nums">{d.lost} stopped <span className="font-normal text-gray-500">({percent(d.lost,d.from.completed)}%)</span></p></div>
      <p className="mt-1 break-words text-sm">After <b>{d.from.title}</b> ({d.from.completed}) → before <b>{d.to.title}</b> ({d.to.completed})</p>
    </li>)}</ol>}
  </section>;
}

function Practice({practice}:{practice:Analytics['practice']}){
  const order=Object.keys(PRACTICE_LABELS);
  const rows=[...practice].sort((a,b)=>order.indexOf(a.kind)-order.indexOf(b.kind));
  return <section className={card} aria-labelledby="practice-heading">
    <h3 id="practice-heading" className="text-lg font-bold">Practice in the last 30 days</h3>
    <p className="text-sm text-gray-500">Kana and kanji count single answers; the others count finished sessions.</p>
    {rows.length===0?<p className="mt-4 text-gray-500">No practice recorded yet.</p>:
    <table className="mt-4 w-full text-left text-sm"><caption className="sr-only">Practice volume by kind</caption><thead className="text-gray-500"><tr><th className="py-2 font-semibold">Kind</th><th className="py-2 text-right font-semibold">Count</th><th className="py-2 text-right font-semibold">Accuracy</th></tr></thead>
      <tbody>{rows.map(p=><tr key={p.kind} className="border-t border-gray-100"><td className="py-2">{PRACTICE_LABELS[p.kind]??p.kind}</td><td className="py-2 text-right tabular-nums">{p.sessions}</td><td className="py-2 text-right tabular-nums">{p.accuracy}%</td></tr>)}</tbody></table>}
  </section>;
}
