/* 사이트 설정
 * chatbotUrl: 견적 챗봇 배포 주소 (예: 'https://contentlabs-quote.streamlit.app')
 *             비워 두면 견적 패널에 '연결 준비 중' 안내와 연락처가 표시됩니다.
 * newsletter: 아래 설명 참고
 * mediaBase : 제작 포맷·인터랙티브 샘플 영상이 있는 폴더 주소 (끝에 / 포함)
 *             지금은 카운셀럽 서버의 영상을 씁니다. 영상을 이 사이트 media/ 폴더로 옮기면 'media/' 로 바꾸세요. */
window.CL_CONFIG = {
  chatbotUrl: 'https://elearning-quote-bot-contentlabs.streamlit.app',
  mediaBase: 'https://www.counseleb.com/contents/intro/videos/',

  /* 뉴스레터 구독 폼 (푸터 #newsletter)
   * action: 뉴스레터 서비스(예: 스티비)의 구독 신청 주소. 비워 두면 '곧 열립니다' 안내만 표시
   * fields: 서비스가 요구하는 입력 이름 (이메일·기관명) */
  newsletter: {
    action: '',
    fields: { email: 'email', org: 'name' }
  }
};
