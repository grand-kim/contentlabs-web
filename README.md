# 콘텐츠랩스 홈페이지 (메인 시안 v1)

- 작성일: 2026-10-20
- 참고 사이트: https://www.bluega.com (메인 섹션 구성·풀스크린 스냅 방식)

## 파일 구성

```
web/
├─ index.html            메인 페이지
├─ assets/css/style.css  스타일 (색상·폰트 토큰은 파일 맨 위 :root)
├─ assets/js/config.js   사이트 설정 (견적 챗봇 주소)
├─ assets/js/main.js     사업영역 팝업, 솔루션 탭 자동 넘김, 히어로 배경, 커서 등
├─ assets/js/quote-panel.js  견적 상담 패널 (챗봇 iframe)
├─ assets/img/clients/   레퍼런스 로고 9종 (아래 출처 참고)
├─ assets/img/brand/     콘텐츠랩스 로고·심볼(SVG), 파비콘
└─ README.md
```

`index.html`을 브라우저로 열면 바로 확인할 수 있습니다. 폰트는 Google Fonts(IBM Plex Sans KR / IBM Plex Mono)를 불러오므로 인터넷 연결이 필요합니다.

## 섹션 구성

| 순서 | id | 내용 |
|---|---|---|
| 1 | `#hero` | 메인 문구, 문의·회사소개서 버튼, 발주처 흐름 띠 |
| 2 | `#business` | 사업영역 4종 카드 → 클릭 시 상세 팝업 |
| 3 | `#formats` | 제작 포맷 8종 (블루가의 연혁 자리) |
| 4 | `#solutions` | 솔루션 3종 + 인터랙티브 5종 탭, 6초 자동 넘김 |
| 5 | `#contact` | 연락처 + 「3분 견적 받기」 카드 |
| - | `footer` | 회사 정보 |

## 남은 작업

- 경기도학교안전공제회 로고: 현재 저해상도 심볼(잡코리아 기업정보 이미지) → 공제회에서 원본 CI 받아 교체
- 그 밖의 발주처(텍스트 줄): 필요 시 로고 이미지로 교체
- 회사소개서 버튼: PDF 파일 연결
- 제작 포맷 카드: 각 포맷 서브페이지 링크 연결 (현재 `#formats`)
- 솔루션 화면: 그림 목업 → 실제 영상/캡처로 교체 가능
- 견적 챗봇: 연결 완료 (https://elearning-quote-bot-contentlabs.streamlit.app)

## 레퍼런스 로고 출처 (assets/img/clients)

| 파일 | 기관 | 출처 |
|---|---|---|
| ggssia.png | 경기도학교안전공제회 | 잡코리아 기업정보 로고(심볼, 저해상도) — 교체 필요 |
| yuanta.png | 유안타증권 | 유안타증권 공식 CI 원본(yuantakorea.com, YuantaLogo.pdf)에서 고해상도 출력 |
| hansung.png | 한성자동차 | mb.hansung.co.kr 헤더 로고 (흰색 → 짙은 색으로 변환) |
| kca.png | 한국소비자원 | kca.go.kr 헤더 로고 |
| soil.svg | S-OIL | Wikimedia Commons (S-OIL Logo.svg) |
| koica.png | KOICA | Wikimedia Commons (KOICA official logo in english.png, CC BY-SA 3.0) |
| nia.png | 한국지능정보사회진흥원 | Wikimedia Commons (한국지능정보사회진흥원 혼합 가로.jpg, CC BY 4.0) |
| tatadaewoo.svg | 타타대우상용차 | Wikimedia Commons (Tata daewoo company logo.svg) — 2024.11 사명 변경(타타대우모빌리티) 전 로고 |
| hanon.svg | 한온시스템 | Wikimedia Commons (Logo hanon.svg) |

## 콘텐츠랩스 로고

- 출처: contentlabs.co.kr 헤더 로고(content-labs-logo-200-x-110-px.svg), 파비콘(콘텐츠랩스-파비콘.webp)
- 「C」 심볼: 기존 보라색 그라데이션 파비콘의 형태를 벡터로 따서 사이트 배색(먹색 #15171A · 라임 #C9F04A)으로 변경
  - `contentlabs-symbol-tile.svg` 먹색 둥근 사각형 + 라임 C (파비콘·앱 아이콘용)
  - `contentlabs-symbol-lime.svg` 라임 C 단독 (어두운 배경용)
  - `contentlabs-symbol-ink.svg` 먹색 C 단독 (밝은 배경용)
  - `favicon-32.png`, `favicon.webp`(192px), `apple-touch-icon.png`(180px)는 위 심볼에서 출력
- 사이트에서는 로고를 index.html 맨 위 `<symbol id="cl-wordmark">`로 한 번 넣고 헤더·푸터에서 불러 씁니다. 색은 CSS `.wordmark`의 color로 바뀌어 다크 모드에서도 보입니다.
- `brand/contentlabs-logo.svg`(검정), `contentlabs-logo-white.svg`(흰색)는 여백을 잘라낸 단독 파일입니다.

## 견적 상담 패널

- `data-quote` 속성이 붙은 요소를 누르면 오른쪽에서 견적 패널이 열립니다. 지금은 「프로젝트 문의하기」(첫 화면), 「견적 상담 시작」(문의 섹션), 오른쪽 아래 「견적 문의」 버튼에 붙어 있습니다. 다른 버튼에도 `data-quote`만 붙이면 됩니다.
- 패널은 `assets/js/config.js`의 `chatbotUrl` 주소에 `?embed=true&widget=1`을 붙여 iframe으로 불러옵니다. 처음 열 때만 불러오고, 불러오는 동안 「준비하고 있어요」 안내가 보입니다.
- 챗봇이 잠들어 있으면 영어 「Zzzz」 화면이 먼저 나옵니다(Streamlit 무료 환경). 패널 아래 안내 문구로 버튼을 누르도록 알려 줍니다.
- `chatbotUrl`이 비어 있으면 「준비하고 있습니다」 안내와 이메일·전화가 표시됩니다.
- 주소 끝에 `#quote`를 붙여 열면(예: 홍보 메일 링크) 패널이 바로 열립니다.
- 챗봇 쪽 위젯 모드 설명: `D:\01_프로젝트\17_이러닝콘텐츠 제작견적 챗봇\README.md`

## GitHub 올리기

GitHub에서 새 저장소(예: `contentlabs-web`)를 README·.gitignore 없이 만든 뒤:

```bash
cd "D:\01_프로젝트\01_콘텐츠랩스\15_콘텐츠랩스_카운셀럽 홈페이지\web"
git init -b main
git add .
git commit -m "콘텐츠랩스 홈페이지 시안"
git remote add origin https://github.com/<계정>/contentlabs-web.git
git push -u origin main
```

- 공개 범위: 이 폴더에는 비밀 정보가 없어 공개(Public)도 가능합니다. 시안 단계라 외부에 보이지 않게 하려면 비공개로 두세요.
- 실제 서비스 반영(contentlabs.co.kr)은 기존 웹호스팅에 이 폴더를 올리는 방식으로 별도 진행합니다.
- 챗봇은 별도 저장소(`contentlabs-quote-bot`, 비공개)입니다. 두 저장소는 `assets/js/config.js`의 `chatbotUrl` 한 줄로만 연결됩니다.

## 회사 정보 기준 (2026-10-20)

- 대표: 윤태원 / 문의 이메일: ceo@ailp.kr / 전화: 050-5491-1111
- 주소·사업자등록번호: contentlabs.co.kr 기준
- 추후 업데이트: 경기도학교안전공제회 원본 로고, 회사소개서 PDF
