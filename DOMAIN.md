# contentlabs.co.kr 도메인 연결 안내

작성 2026-11-07. 근거 자료: `../콘텐츠랩스정보.txt`(기존 개발사 안내), 공개 DNS 조회 결과.

## 지금 상태 (2026-11-07 조회)

| 항목 | 값 | 뜻 |
|---|---|---|
| 도메인 | contentlabs.co.kr (호스팅케이알 등록, 2027-08-02 만료) | 귀사 명의 |
| 네임서버 | ns1~3.serverhostgroup.com | **DNS는 케미클라우드 cPanel에서 관리** (호스팅케이알이 아님) |
| A 레코드 | contentlabs.co.kr → 158.247.245.11 | 지금 사이트(케미클라우드 서버) |
| www | contentlabs.co.kr 의 별칭(CNAME) | |
| MX(메일) | 0 contentlabs.co.kr | 이 도메인 메일이 같은 서버로 감 (아래 주의 참고) |
| SSL | 케미클라우드 AutoSSL(Let's Encrypt) 자동 갱신 | |

## 방법 A (추천) — GitHub Pages에 도메인 연결

새 사이트는 이미 GitHub Pages로 올라가 있습니다(https://grand-kim.github.io/contentlabs-web/).
DNS 몇 줄만 바꾸면 contentlabs.co.kr 로 열리고, 이후에는 `git push`만 하면 바로 반영됩니다. 비용 없음, SSL 자동.

### 0. 바꾸기 전에 (필수)
1. 케미클라우드 cPanel → **Backup** 또는 File Manager에서 `public_html` 폴더를 압축해 내려받아 둡니다(기존 사이트 백업).
2. **contentlabs.co.kr 주소로 메일을 쓰는지 확인**합니다(예: xxx@contentlabs.co.kr).
   - 쓰지 않으면(회사 메일은 ailp.kr) 그대로 진행.
   - 쓰고 있으면 아래 1-①을 먼저 합니다. 안 하면 메일이 끊깁니다.

### 1. cPanel → Domains → **Zone Editor** → contentlabs.co.kr → Manage
① (메일을 쓰는 경우만) `mail` A 레코드 158.247.245.11 추가 → MX 레코드 대상을 `mail.contentlabs.co.kr` 로 변경
② `contentlabs.co.kr` A 레코드(158.247.245.11) 를 지우고 아래 4개 추가

| 종류 | 이름 | 값 |
|---|---|---|
| A | contentlabs.co.kr. | 185.199.108.153 |
| A | contentlabs.co.kr. | 185.199.109.153 |
| A | contentlabs.co.kr. | 185.199.110.153 |
| A | contentlabs.co.kr. | 185.199.111.153 |

③ `www` 레코드를 CNAME → `grand-kim.github.io.` 로 변경
④ (권장) GitHub 계정 Settings → Pages → **Add a domain** 에서 contentlabs.co.kr 인증 → 안내되는 TXT 레코드(`_github-pages-challenge-grand-kim`)를 여기에 추가. 남이 이 도메인을 GitHub에 걸어 쓰는 것을 막아 줍니다.

### 2. GitHub → contentlabs-web 저장소 → Settings → Pages
1. Custom domain에 `contentlabs.co.kr` 입력 → Save (저장소에 CNAME 파일이 자동으로 생김 → 다음 작업 전 `git pull`)
2. DNS check 통과(수 분~최대 24시간) 후 **Enforce HTTPS** 체크

### 3. 마무리
- 견적 챗봇(Streamlit) → Settings → Secrets 에 `THUMB_BASE = "https://contentlabs.co.kr/assets/img/thumbs/"` 추가 (안 해도 github.io 주소가 새 도메인으로 넘어가서 보이긴 함)
- 케미클라우드 호스팅은 메일·기존 자료 정리 후 해지 여부 결정

## 방법 B — 지금 호스팅(케미클라우드)에 그대로 올리기

DNS를 건드리지 않는 방법입니다. 수정할 때마다 파일을 다시 올려야 합니다.
1. `public_html` 백업 (위 0-1)
2. 이 `web` 폴더 안의 내용(.git 제외)을 zip으로 묶어 cPanel File Manager → `public_html` 에 업로드 → Extract
3. 기존 WordPress 파일(index.php, wp-* 등)이 있으면 `index.html` 보다 먼저 열릴 수 있으니 옮기거나 지움
4. SSL은 기존 AutoSSL이 그대로 적용됨
