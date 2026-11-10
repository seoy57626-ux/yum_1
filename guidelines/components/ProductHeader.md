# ProductHeader

화면 최상단. 제품 이름, 컨셉, 설명을 `PRODUCT`에서 읽어 보여준다. 2열 레이아웃에서 전체 폭.

- 이름 `t-display`(서브 폰트) `--ink` / 컨셉 `t-label` `--ink` / 설명 `t-body` `--ink-muted`, 최대 폭 640px
- 간격: 이름과 컨셉 사이 space-1, 컨셉과 설명 사이 space-3
- 비어 있으면 `[제품 이름]`, `[제품 컨셉, 한 줄]`, `[제품 설명, 2~3문장]`을 `--ink-muted`로
- 바탕 위에 바로. 이름 위에 소제목 달지 않는다
- `document.title`도 `PRODUCT.name`으로
