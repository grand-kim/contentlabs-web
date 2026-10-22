/* 뉴스레터 구독 폼 — 주소는 assets/js/config.js 의 newsletter.action 에서 설정 */
(() => {
  const form = document.getElementById('nlForm');
  if (!form) return;
  const cfg = (window.CL_CONFIG || {}).newsletter || {};
  const msg = document.getElementById('nlMsg');
  const say = (t, ok) => { msg.textContent = t; msg.className = 'nl-msg ' + (ok ? 'ok' : 'err'); };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = form.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { say('이메일 주소를 확인해 주세요.'); form.email.focus(); return; }
    if (!form.agree.checked) { say('개인정보 수집·이용 및 수신 동의가 필요합니다.'); return; }
    if (!cfg.action) { say('뉴스레터 구독 신청은 곧 열립니다. 조금만 기다려 주세요.', true); return; }

    const f = cfg.fields || {}, body = new URLSearchParams();
    body.set(f.email || 'email', email);
    if (form.org.value.trim()) body.set(f.org || 'name', form.org.value.trim());
    const btn = form.querySelector('button'); btn.disabled = true;
    try {
      await fetch(cfg.action, { method: 'POST', mode: 'no-cors', body });
      say('구독 신청이 접수되었습니다. 받은 편지함의 확인 메일을 열어 구독을 완료해 주세요.', true);
      form.reset();
    } catch {
      say('신청을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally { btn.disabled = false; }
  });
})();
