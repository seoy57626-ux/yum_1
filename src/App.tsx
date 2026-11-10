import { useEffect, useMemo, useState } from "react"
import { PRODUCT } from "./product"

type RegionLevel = "전국" | "시도" | "시군구"
type AnnualValue = {
  year: string
  population: number
  households: number
}
type Region = {
  name: string
  fullName: string
  level: RegionLevel
  values: AnnualValue[]
  population: number
  households: number
}
type RegionsState = {
  status: "loading" | "ready" | "error"
  data: Region[]
  message: string
}

const formatNumber = new Intl.NumberFormat("ko-KR")
const provincePattern = /(특별시|광역시|특별자치시|도|특별자치도)$/
const ignoredRows = new Set(["동부", "읍부", "면부"])

function splitCsvLine(line: string) {
  const values: string[] = []
  let value = ""
  let quoted = false

  for (const character of line) {
    if (character === '"') quoted = !quoted
    else if (character === "," && !quoted) {
      values.push(value)
      value = ""
    } else value += character
  }

  values.push(value)
  return values
}

function parseNumber(value = "") {
  const parsed = Number(value.replaceAll(",", "").trim())
  return Number.isFinite(parsed) ? parsed : 0
}

function parseCsv(text: string): Region[] {
  const rows = text.trim().split(/\r?\n/).map(splitCsvLine)
  const years = rows[0]
  const headers = rows[1]

  if (!years || !headers) throw new Error("CSV 머리글을 찾을 수 없습니다.")

  const yearColumns = new Map<string, {
    population?: number
    households?: number
  }>()
  headers.forEach((header, index) => {
    if (!header.includes("총인구") && !header.includes("가구_계")) return
    const year = years[index]?.trim()
    if (!year) return
    const columns = yearColumns.get(year) ?? {}
    if (header.includes("총인구")) columns.population = index
    if (header.includes("가구_계")) columns.households = index
    yearColumns.set(year, columns)
  })

  const validYears = [...yearColumns.entries()]
    .filter(
      ([, columns]) =>
        columns.population !== undefined && columns.households !== undefined,
    )
    .sort(([a], [b]) => a.localeCompare(b, "ko-KR", { numeric: true }))

  if (!validYears.length)
    throw new Error("총인구와 가구_계 열을 찾을 수 없습니다.")

  let province = ""
  const regions = rows.slice(2).flatMap((row): Region[] => {
    const name = row[0]?.trim()
    if (!name || ignoredRows.has(name)) return []

    const level: RegionLevel =
      name === "전국" ? "전국" : provincePattern.test(name) ? "시도" : "시군구"
    if (level === "시도") province = name

    const values = validYears.map(([year, columns]) => ({
      year,
      population: parseNumber(row[columns.population!]),
      households: parseNumber(row[columns.households!]),
    }))
    const latest = values.at(-1)!

    return [
      {
        name,
        fullName: level === "시군구" ? `${province} ${name}` : name,
        level,
        values,
        population: latest.population,
        households: latest.households,
      },
    ]
  })

  if (!regions.length) throw new Error("지역 데이터를 찾을 수 없습니다.")
  return regions
}

function productValue(value: string, placeholder: string) {
  return value.trim() || placeholder
}

function ProductHeader() {
  return (
    <div className="product-copy">
      <p className={PRODUCT.name ? "product-name" : "placeholder"}>
        {productValue(PRODUCT.name, "[제품 이름]")}
      </p>
      <h1 className={PRODUCT.concept ? "" : "placeholder"}>
        {productValue(PRODUCT.concept, "[제품 컨셉]")}
      </h1>
      <p
        className={
          PRODUCT.description
            ? "product-description"
            : "product-description placeholder"
        }
      >
        {productValue(PRODUCT.description, "[제품 설명]")}
      </p>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </svg>
  )
}

function RegionSearch({
  query,
  regions,
  onQueryChange,
  onSelect,
}: {
  query: string
  regions: RegionsState
  onQueryChange: (value: string) => void
  onSelect: (value: string) => void
}) {
  const results = useMemo(() => {
    const keyword = query.trim()
    if (!keyword) return []
    return regions.data
      .filter((region) => region.fullName.includes(keyword))
      .slice(0, 8)
  }, [query, regions.data])

  return (
    <div className="region-search">
      <label htmlFor="region-search">지역 찾기</label>
      <div className="search-control">
        <SearchIcon />
        <input
          id="region-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="시군구 이름을 검색하세요"
          autoComplete="off"
        />
      </div>
      {regions.status === "loading" && (
        <p className="status-text">지역 데이터를 불러오는 중입니다.</p>
      )}
      {regions.status === "error" && (
        <p className="status-text">{regions.message}</p>
      )}
      {regions.status === "ready" && query.trim() && results.length === 0 && (
        <p className="status-text">검색 결과가 없습니다.</p>
      )}
      {results.length > 0 && (
        <div className="search-results" aria-label="지역 검색 결과">
          {results.map((region) => (
            <button
              type="button"
              key={region.fullName}
              onClick={() => {
                onSelect(region.fullName)
                onQueryChange("")
              }}
            >
              <span>{region.name}</span>
              <small>{region.fullName}</small>
            </button>
          ))}
        </div>
      )}
      {!query && regions.status === "ready" && (
        <p className="search-example">예: 강남구, 수원시, 해운대구</p>
      )}
    </div>
  )
}

function StatSummary({ regions }: { regions: Region[] }) {
  const national = regions.find((region) => region.level === "전국")
  const local = regions.filter((region) => region.level === "시군구")
  const year = national?.values.at(-1)?.year

  return (
    <section className="stats" aria-label="핵심 통계">
      <div>
        <span>기준 연도</span>
        <strong>{year ?? "—"}</strong>
      </div>
      <div>
        <span>전국 총 세대수</span>
        <strong>
          {national ? formatNumber.format(national.households) : "—"}
        </strong>
        {national && <small>세대</small>}
      </div>
      <div>
        <span>분석 시군구 수</span>
        <strong>
          {regions.length ? formatNumber.format(local.length) : "—"}
        </strong>
        {regions.length > 0 && <small>개</small>}
      </div>
    </section>
  )
}

function TrendChart({ region }: { region: Region }) {
  const width = 720
  const height = 240
  const left = 70
  const right = 24
  const top = 24
  const bottom = 46
  const values = region.values
  const max = Math.max(...values.map((value) => value.households), 1)
  const x = (index: number) =>
    values.length === 1
      ? (left + width - right) / 2
      : left + (index / (values.length - 1)) * (width - left - right)
  const y = (value: number) => top + (1 - value / max) * (height - top - bottom)
  const points = values
    .map((value, index) => `${x(index)},${y(value.households)}`)
    .join(" ")

  return (
    <div className="trend-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${region.fullName} 세대 추이`}
      >
        <g className="chart-grid">
          <path
            d={`M${left} ${top}H${width - right}M${left} ${(top + height - bottom) / 2}H${width - right}M${left} ${height - bottom}H${width - right}`}
          />
        </g>
        <g className="axis-labels">
          <text x="0" y={top + 4}>
            {formatNumber.format(max)}
          </text>
          <text x="0" y={height - bottom + 4}>
            0
          </text>
          {values.map((value, index) => (
            <text
              key={value.year}
              x={x(index)}
              y={height - 12}
              textAnchor="middle"
            >
              {value.year}
            </text>
          ))}
        </g>
        {values.length > 1 && (
          <polyline className="trend-line" points={points} />
        )}
        {values.map((value, index) => (
          <circle
            className="trend-point"
            key={value.year}
            cx={x(index)}
            cy={y(value.households)}
            r="6"
          />
        ))}
      </svg>
      <p className="chart-reading">
        <strong>{formatNumber.format(values.at(-1)!.households)}</strong> 세대
      </p>
      {values.length === 1 && (
        <p className="chart-note">
          현재 단일 연도 자료입니다. 연도 데이터가 추가되면 추이선으로
          표시됩니다.
        </p>
      )}
    </div>
  )
}

function HouseholdTrend({
  region,
  regions,
  selected,
  onSelect,
}: {
  region: Region
  regions: Region[]
  selected: string
  onSelect: (value: string) => void
}) {
  return (
    <section className="data-section" aria-label="선택 지역 세대 추이">
      <div className="section-heading with-control">
        <div>
          <h2>{region.fullName} 세대 추이</h2>
          <p>단위: 세대</p>
        </div>
        <label>
          <span>지역 선택</span>
          <select
            value={selected || region.fullName}
            onChange={(event) => onSelect(event.target.value)}
          >
            {regions.map((item) => (
              <option key={item.fullName} value={item.fullName}>
                {item.fullName}
              </option>
            ))}
          </select>
        </label>
      </div>
      <TrendChart region={region} />
    </section>
  )
}

function RegionRanking({ regions }: { regions: Region[] }) {
  const items = useMemo(
    () => [...regions].sort((a, b) => b.households - a.households).slice(0, 10),
    [regions],
  )
  const max = Math.max(...items.map((item) => item.households), 1)

  return (
    <section className="data-section" aria-label="지역별 세대수 순위">
      <div className="section-heading">
        <h2>세대수 상위 10개 시군구</h2>
        <p>단위: 세대</p>
      </div>
      <div className="ranking">
        {items.map((item, index) => (
          <div className="rank-row" key={item.fullName}>
            <span className="rank-number">{index + 1}</span>
            <span className="rank-name" title={item.fullName}>
              {item.name}
            </span>
            <div className="bar-track" aria-hidden="true">
              <span style={{ width: `${(item.households / max) * 100}%` }} />
            </div>
            <strong>{formatNumber.format(item.households)}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

function NormalizedChart({ regions }: { regions: Region[] }) {
  const types = ["시", "군", "구"] as const
  const groups = types.map((type) => {
    const items = regions
      .filter((region) => region.name.endsWith(type))
      .sort((a, b) => a.population - b.population)
    const min = Math.min(...items.map((item) => item.population))
    const max = Math.max(...items.map((item) => item.population))
    return {
      type,
      values: items.map((item, index) => ({
        ...item,
        x: items.length === 1 ? 0.5 : index / (items.length - 1),
        y: max === min ? 0.5 : (item.population - min) / (max - min),
      })),
    }
  })

  const width = 720
  const height = 260
  const left = 52
  const right = 20
  const top = 20
  const bottom = 32
  const point = (x: number, y: number) =>
    `${left + x * (width - left - right)},${top + (1 - y) * (height - top - bottom)}`

  return (
    <section className="data-section" aria-label="행정구역 유형별 인구 정규화">
      <div className="section-heading">
        <h2>시, 군, 구 유형별 인구 정규화</h2>
        <p>각 유형 안에서 최솟값은 0, 최댓값은 1</p>
      </div>
      <div className="chart-legend" aria-label="차트 범례">
        {groups.map((group) => (
          <span key={group.type}>
            <i
              className={`legend-mark type-${group.type}`}
              aria-hidden="true"
            />
            {group.type} {formatNumber.format(group.values.length)}개
          </span>
        ))}
      </div>
      <svg
        className="normalized-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="시, 군, 구 인구 정규화 선"
      >
        <g className="chart-grid">
          <path
            d={`M${left} ${top}H${width - right}M${left} ${(top + height - bottom) / 2}H${width - right}M${left} ${height - bottom}H${width - right}`}
          />
        </g>
        <g className="axis-labels">
          <text x="4" y={top + 4}>
            1
          </text>
          <text x="4" y={(top + height - bottom) / 2 + 4}>
            0.5
          </text>
          <text x="4" y={height - bottom + 4}>
            0
          </text>
        </g>
        {groups.map((group) => (
          <g
            key={group.type}
            className={`normalized-series type-${group.type}`}
          >
            <polyline
              points={group.values
                .map((value) => point(value.x, value.y))
                .join(" ")}
            />
            {group.values.map((value) => {
              const [cx, cy] = point(value.x, value.y).split(",")
              return <circle key={value.fullName} cx={cx} cy={cy} r="2.5" />
            })}
          </g>
        ))}
      </svg>
    </section>
  )
}

export default function App() {
  const [regions, setRegions] = useState<RegionsState>({
    status: "loading",
    data: [],
    message: "",
  })
  const [selected, setSelected] = useState("")
  const [query, setQuery] = useState("")

  useEffect(() => {
    fetch("/households.csv")
      .then((response) => {
        if (!response.ok) throw new Error("지역 데이터를 불러오지 못했습니다.")
        return response.text()
      })
      .then((text) =>
        setRegions({ status: "ready", data: parseCsv(text), message: "" }),
      )
      .catch((error: unknown) =>
        setRegions({
          status: "error",
          data: [],
          message:
            error instanceof Error
              ? error.message
              : "지역 데이터를 불러오지 못했습니다.",
        }),
      )
  }, [])

  const current =
    regions.data.find((region) => region.fullName === selected) ??
    regions.data.find((region) => region.level === "전국") ??
    regions.data[0]
  const localRegions = regions.data.filter(
    (region) => region.level === "시군구",
  )

  return (
    <main>
      <header className="site-header">
        <a href="#content">{productValue(PRODUCT.name, "[제품 이름]")}</a>
        <p>{productValue(PRODUCT.source, "[데이터 출처]")}</p>
      </header>

      <div id="content" className="app-shell">
        <section className="intro-grid" aria-label="제품 소개와 지역 검색">
          <ProductHeader />
          <RegionSearch
            query={query}
            regions={regions}
            onQueryChange={setQuery}
            onSelect={setSelected}
          />
        </section>

        <StatSummary regions={regions.data} />

        {regions.status === "loading" && (
          <p className="page-status">데이터를 불러오는 중입니다.</p>
        )}
        {regions.status === "error" && (
          <p className="page-status">오류: {regions.message}</p>
        )}
        {regions.status === "ready" && current && (
          <>
            <HouseholdTrend
              region={current}
              regions={regions.data}
              selected={selected}
              onSelect={setSelected}
            />
            <RegionRanking regions={localRegions} />
            <NormalizedChart regions={localRegions} />
          </>
        )}
      </div>

      <footer>
        <strong>{productValue(PRODUCT.name, "[제품 이름]")}</strong>
        <p>출처: {productValue(PRODUCT.source, "[데이터 출처]")}</p>
      </footer>
    </main>
  )
}
