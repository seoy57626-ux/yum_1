import { useEffect, useMemo, useState } from 'react'

type Region = { name: string; fullName: string; level: '전국' | '시도' | '시군구'; population: number; households: number }

const fmt = new Intl.NumberFormat('ko-KR')
const provinces = /(특별시|광역시|특별자치시|도|특별자치도)$/

function parseCsv(text: string): Region[] {
  const rows = text.trim().split(/\r?\n/).map(line => {
    const values: string[] = []; let value = ''; let quoted = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') quoted = !quoted
      else if (ch === ',' && !quoted) { values.push(value); value = '' }
      else value += ch
    }
    values.push(value); return values
  })
  const headers = rows[1] || []
  const populationIndex = headers.findIndex(v => v.includes('총인구'))
  const householdsIndex = headers.findIndex(v => v.includes('가구_계'))
  let province = ''
  return rows.slice(2).flatMap(row => {
    const name = row[0]?.trim()
    if (!name || ['동부', '읍부', '면부'].includes(name)) return []
    const level = name === '전국' ? '전국' : provinces.test(name) ? '시도' : '시군구'
    if (level === '시도') province = name
    const number = (index: number) => Number((row[index] || '0').replaceAll(',', ''))
    return [{ name, fullName: level === '시군구' ? `${province} ${name}` : name, level, population: number(populationIndex), households: number(householdsIndex) } as Region]
  })
}

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
}

function TrendChart({ region }: { region?: Region }) {
  const value = region?.households || 0
  return <div className="chart-wrap">
    <div className="y-labels"><span>{fmt.format(Math.ceil(value * 1.1))}</span><span>{fmt.format(Math.round(value * .55))}</span><span>0</span></div>
    <svg className="line-chart" viewBox="0 0 720 230" role="img" aria-label={`${region?.fullName} 세대 추이`}>
      <g className="grid"><path d="M20 20H700M20 105H700M20 190H700"/></g>
      <path className="trend-fill" d="M360 105 L360 190 Z" />
      <path className="trend" d="M360 105 L360 105" />
      <circle className="trend-dot" cx="360" cy="105" r="6" />
      <text x="360" y="220" textAnchor="middle">2025</text>
    </svg>
    <div className="chart-value"><b>{fmt.format(value)}</b><span>세대</span></div>
  </div>
}

function Ranking({ items }: { items: Region[] }) {
  const max = Math.max(...items.map(v => v.households), 1)
  return <div className="ranking">{items.map((item, index) => <div className="rank-row" key={item.fullName}>
    <span className="rank-no">{String(index + 1).padStart(2, '0')}</span>
    <span className="rank-name" title={item.fullName}>{item.name}</span>
    <div className="bar-track"><span style={{ width: `${item.households / max * 100}%` }} /></div>
    <strong>{fmt.format(item.households)}</strong>
  </div>)}</div>
}

function NormalizedChart({ items }: { items: Region[] }) {
  const groups = ['시', '군', '구']
  const data = groups.map(type => {
    const values = items.filter(v => v.name.endsWith(type)).sort((a,b) => a.population-b.population)
    const min = Math.min(...values.map(v => v.population)); const max = Math.max(...values.map(v => v.population))
    return { type, values: values.map((v, i) => ({...v, x: values.length === 1 ? 50 : i/(values.length-1)*100, y: max === min ? .5 : (v.population-min)/(max-min)})) }
  })
  const colors = ['blue', 'green', 'orange']
  return <div className="normalized">
    <div className="legend">{data.map((g,i)=><span key={g.type}><i className={colors[i]}/>{g.type} ({g.values.length})</span>)}</div>
    <svg viewBox="0 0 720 250" role="img" aria-label="시 군 구 인구 정규화 분포">
      <g className="grid"><path d="M45 25H700M45 120H700M45 215H700"/></g>
      <g className="axis-text"><text x="12" y="30">1.0</text><text x="12" y="125">0.5</text><text x="12" y="220">0.0</text></g>
      {data.map((group, gi) => <polyline key={group.type} className={`norm-line ${colors[gi]}`} points={group.values.map(v => `${45+v.x*6.55},${215-v.y*190}`).join(' ')} />)}
    </svg>
    <div className="norm-note">각 유형 내 최솟값 0 · 최댓값 1 기준, 인구 오름차순</div>
  </div>
}

export default function App() {
  const [regions, setRegions] = useState<Region[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('전국')
  const [year] = useState('2025')
  useEffect(() => { fetch('/households.csv').then(r => r.text()).then(set => setRegions(parseCsv(set))) }, [])
  const current = regions.find(v => v.fullName === selected) || regions[0]
  const local = regions.filter(v => v.level === '시군구')
  const results = useMemo(() => query.trim() ? regions.filter(v => v.fullName.includes(query.trim())).slice(0, 8) : [], [query, regions])
  const ranking = useMemo(() => [...local].sort((a,b) => b.households-a.households).slice(0, 10), [regions])
  const national = regions.find(v => v.level === '전국')

  return <main>
    <header>
      <a className="brand" href="#top" aria-label="지역 데이터랩 홈"><span className="brand-mark">D</span><span>지역 데이터랩<small>REGIONAL DATA LAB</small></span></a>
      <div className="source"><span />통계청 인구·가구 데이터</div>
    </header>
    <section className="hero" id="top">
      <div><p className="eyebrow">KOREA REGIONAL HOUSEHOLDS</p><h1>숫자로 읽는<br/><em>우리 지역의 변화</em></h1><p className="intro">전국 행정구역의 세대 현황을 한눈에 살펴보세요.<br/>지역별 규모와 분포를 쉽고 빠르게 비교할 수 있습니다.</p></div>
      <div className="search-box">
        <label htmlFor="region-search">지역 찾기</label>
        <div className="search-input"><SearchIcon/><input id="region-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="시·군·구 이름을 검색하세요" /></div>
        {results.length > 0 && <div className="results">{results.map(v=><button key={v.fullName} onClick={()=>{setSelected(v.fullName);setQuery('')}}><span>{v.name}</span><small>{v.fullName}</small></button>)}</div>}
        <p>예: 강남구, 수원시, 해운대구</p>
      </div>
    </section>

    <section className="stats">
      <div><span>기준 시점</span><strong>{year}</strong><small>통계청 제공</small></div>
      <div><span>전국 총 세대수</span><strong>{fmt.format(national?.households || 0)}</strong><small>세대</small></div>
      <div><span>분석 지역</span><strong>{local.length}</strong><small>개 시·군·구</small></div>
    </section>

    <section className="content">
      <div className="section-head"><div><span className="index">01</span><p>HOUSEHOLD TREND</p><h2>연도별 세대 추이</h2></div><select value={selected} onChange={e=>setSelected(e.target.value)} aria-label="지역 선택">{regions.map(v=><option key={v.fullName} value={v.fullName}>{v.fullName}</option>)}</select></div>
      <article className="panel trend-panel"><div className="panel-title"><div><span className="pill">{current?.level}</span><h3>{current?.fullName || '불러오는 중'}</h3></div><span className="unit">단위: 세대</span></div><TrendChart region={current}/><p className="data-note">첨부 데이터는 2025년 단일 시점 자료입니다. 추가 연도 데이터 연결 시 추이선이 자동 확장됩니다.</p></article>

      <div className="section-head split"><div><span className="index">02</span><p>REGIONAL RANKING</p><h2>지역별 세대 순위</h2></div><div className="year-chip">{year}년</div></div>
      <article className="panel"><div className="panel-title"><div><span className="pill coral">TOP 10</span><h3>세대수가 많은 지역</h3></div><span className="unit">단위: 세대</span></div><Ranking items={ranking}/></article>

      <div className="section-head"><div><span className="index">03</span><p>NORMALIZED POPULATION</p><h2>시·군·구 인구 정규화</h2></div></div>
      <article className="panel"><div className="panel-title"><div><span className="pill mint">0—1 SCALE</span><h3>행정구역 유형별 인구 분포</h3></div><span className="unit">단위: 정규화 지수</span></div><NormalizedChart items={local}/></article>
    </section>
    <footer><span>지역 데이터랩</span><p>출처: 통계청 · 2025 인구, 가구 및 주택</p><small>데이터는 원자료 기준이며 분석 목적에 따라 가공되었습니다.</small></footer>
  </main>
}
