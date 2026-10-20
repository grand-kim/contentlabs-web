/* 견적 상담 패널 — [data-quote] 요소를 누르면 오른쪽에서 열림
 * 챗봇 주소는 assets/js/config.js 의 chatbotUrl 에서 바꿉니다. */
(() => {
  const url = ((window.CL_CONFIG || {}).chatbotUrl || '').trim();
  const $ = id => document.getElementById(id);
  const qp = $('qp'), body = $('qpBody'), wait = $('qpWait'), off = $('qpOff'),
        ext = $('qpExt'), closeBtn = $('qpClose'), backdrop = $('qpBackdrop');
  if (!qp) return;
  let frame = null, lastFocus = null, timer;

  const src = () => url + (url.includes('?') ? '&' : '?') + 'embed=true&widget=1';

  function open() {
    clearTimeout(timer);
    lastFocus = document.activeElement;
    qp.hidden = false; backdrop.hidden = false;
    requestAnimationFrame(() => { qp.classList.add('on'); backdrop.classList.add('on'); });
    document.documentElement.classList.add('qp-open');
    if (!url) {
      off.hidden = false;
    } else if (!frame) {                      // 처음 열 때만 챗봇을 불러옴
      wait.hidden = false;
      frame = document.createElement('iframe');
      frame.title = '이러닝 제작 견적 상담';
      frame.allow = 'clipboard-write';
      frame.src = src();
      frame.addEventListener('load', () => {
        setTimeout(() => { wait.hidden = true; frame.classList.add('ready'); }, 800);
      });
      body.append(frame);
      ext.href = url; ext.hidden = false;
      const hint = $('qpHint'); if (hint) hint.hidden = false;
    }
    closeBtn.focus();
  }

  function close() {
    qp.classList.remove('on'); backdrop.classList.remove('on');
    document.documentElement.classList.remove('qp-open');
    timer = setTimeout(() => { qp.hidden = true; backdrop.hidden = true; }, 320);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-quote]');
    if (t) { e.preventDefault(); open(); }
  });
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !qp.hidden) close(); });
  if (location.hash === '#quote') open();     // 링크 끝에 #quote 를 붙이면 바로 열림
})();
