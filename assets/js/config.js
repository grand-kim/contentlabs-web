/* 사이트 설정
 * quoteApi  : 견적 상담 서버(Cloudflare Workers) 주소. 채우면 홈페이지 자체 대화창으로 견적 상담을 합니다.
 *             (예: 'https://contentlabs-quote.○○○.workers.dev' — 견적 챗봇 폴더 worker/README.md 참고)
 * chatbotUrl: 예전 Streamlit 챗봇 주소. quoteApi 가 비어 있을 때만 쓰입니다(옮기는 동안의 예비).
 *             둘 다 비워 두면 견적 패널에 '연결 준비 중' 안내와 연락처가 표시됩니다.
 * blog      : 아래 설명 참고
 * (제작 포맷 사례는 영상 대신 assets/img/thumbs/ 의 대표 장면 이미지로 보여 줍니다) */
window.CL_CONFIG = {
  quoteApi: 'https://contentlabs-quote.contentlabs-quote.workers.dev',
  chatbotUrl: 'https://elearning-quote-bot-contentlabs.streamlit.app',

  /* 문의 메일 (데모 신청 메일 받는 주소) */
  contactEmail: 'ceo@ailp.kr',

  /* 솔루션 데모 체험 (솔루션 탭의 「데모 체험하기」)
   * url 을 채우면 체험 계정 안내 창 + 「데모 열기」 버튼이 나옵니다.
   * url 이 비어 있으면 「데모 신청」(메일) 안내가 나옵니다.
   * ※ id·pw 는 누구나 볼 수 있으니 반드시 체험 전용 계정만 적으세요. */
  demo: {
    cdms:  { url: '', id: '', pw: '', note: '' },
    lms:   { url: '', id: '', pw: '', note: '' },
    board: { url: '', id: '', pw: '', note: '' }
  },

  /* 블로그 (푸터 위 「블로그」 영역 · 상단 메뉴 「블로그」)
   * naver  : 네이버 블로그 아이디 — 블로그 주소 blog.naver.com/○○○ 의 ○○○
   * tistory: 티스토리 이름     — 블로그 주소 ○○○.tistory.com 의 ○○○
   * 둘 중 하나만 넣어도 됩니다. 비워 두면 「곧 첫 글이 올라옵니다」 안내 카드가 나옵니다.
   * 최신 글은 견적 상담 서버(quoteApi)가 30분마다 새로 읽어 옵니다. */
  blog: {
    naver: '',
    tistory: '',
    count: 3
  }
};
