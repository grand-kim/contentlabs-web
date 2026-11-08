/* 견적 문의 패널 — [data-quote] 요소를 누르면 오른쪽에서 열림
 *
 * 대화창은 홈페이지가 직접 그리고, 견적 계산·AI 상담·접수는 콘텐츠랩스 견적 서버(Cloudflare Workers)가 합니다.
 *   assets/js/config.js 의 quoteApi  : 견적 서버 주소 (예: https://contentlabs-quote.○○○.workers.dev)
 *   quoteApi 가 비어 있고 chatbotUrl(예전 Streamlit 주소)만 있으면 예전처럼 그 화면을 불러옵니다.
 *   둘 다 비어 있으면 '준비 중' 안내와 연락처가 나옵니다.
 *
 * 상담 상태는 서버가 돌려준 state 를 이 탭(sessionStorage)에만 보관합니다. state 에는 금액이 없습니다. */
(() => {
  const CFG = window.CL_CONFIG || {};
  const API = String(CFG.quoteApi || '').trim().replace(/\/$/, '');
  const LEGACY = String(CFG.chatbotUrl || '').trim();
  const $ = id => document.getElementById(id);
  const qp = $('qp'), body = $('qpBody'), wait = $('qpWait'), off = $('qpOff'),
        closeBtn = $('qpClose'), backdrop = $('qpBackdrop');
  if (!qp) return;
  const sub = qp.querySelector('.qp-head small'), subDefault = sub ? sub.textContent : '';
  const fmtName = fmt => ((window.CL_FORMATS || []).find(f => f.id === fmt) || {}).name;
  let lastFocus = null, timer;

  /* ── 패널 열기·닫기 ─────────────────────────────── */
  function open(fmt) {
    clearTimeout(timer);
    lastFocus = document.activeElement;
    qp.hidden = false; backdrop.hidden = false;
    requestAnimationFrame(() => { qp.classList.add('on'); backdrop.classList.add('on'); });
    document.documentElement.classList.add('qp-open');
    if (API) Chat.open(fmt || '');
    else if (LEGACY) Legacy.open(fmt || '');
    else off.hidden = false;
    closeBtn.focus();
  }
  function close() {
    qp.classList.remove('on'); backdrop.classList.remove('on');
    document.documentElement.classList.remove('qp-open');
    timer = setTimeout(() => { qp.hidden = true; backdrop.hidden = true; }, 320);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function setSub(fmt) {
    if (!sub) return;
    const name = fmt ? fmtName(fmt) : '';
    sub.textContent = name ? '제작 포맷: ' + name : subDefault;
  }

  /* ── 예전 Streamlit 화면 (quoteApi 를 넣기 전까지만 사용) ── */
  const Legacy = (() => {
    let frame = null;
    const src = fmt => LEGACY + (LEGACY.includes('?') ? '&' : '?') + 'embed=true&widget=1' + (fmt ? '&format=' + encodeURIComponent(fmt) : '');
    return { open(fmt) {
      if (!frame) {
        wait.hidden = false;
        frame = document.createElement('iframe');
        frame.title = '이러닝 제작 견적 문의';
        frame.addEventListener('load', () => setTimeout(() => { wait.hidden = true; frame.classList.add('ready'); }, 800));
        body.append(frame);
      }
      if (frame.dataset.fmt !== fmt || !frame.src) { frame.dataset.fmt = fmt; frame.src = src(fmt); }
      setSub(fmt);
    } };
  })();

  /* ── 자체 대화창 ───────────────────────────────── */
  const Chat = (() => {
    const KEY = 'cl-quote-state';
    let state = null, ui = null, busy = false, root = null, log, dock, topBtn, err;

    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    /* 아주 작은 마크다운: **굵게**, 줄바꿈, '- ' 목록 */
    function md(text) {
      const lines = esc(text).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').split('\n');
      let out = '', list = false;
      for (const l of lines) {
        const m = /^\s*[-•]\s+(.*)$/.exec(l);
        if (m) { if (!list) { out += '<ul>'; list = true; } out += `<li>${m[1]}</li>`; continue; }
        if (list) { out += '</ul>'; list = false; }
        out += l.trim() ? `<p>${l}</p>` : '';
      }
      return out + (list ? '</ul>' : '');
    }
    const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify({ state, ui })); } catch { /* 저장 안 돼도 동작 */ } };
    const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { return null; } };
    const clear = () => { try { sessionStorage.removeItem(KEY); } catch { /* */ } };

    function build() {
      if (root) return;
      root = document.createElement('div');
      root.className = 'qc';
      root.innerHTML = `
        <div class="qc-bar" hidden><button type="button" class="qc-reset">↺ 처음부터</button></div>
        <div class="qc-log" aria-live="polite" aria-relevant="additions"></div>
        <p class="qc-err" role="alert" hidden></p>
        <div class="qc-dock"></div>`;
      body.append(root);
      log = root.querySelector('.qc-log'); dock = root.querySelector('.qc-dock');
      topBtn = root.querySelector('.qc-bar'); err = root.querySelector('.qc-err');
      root.querySelector('.qc-reset').addEventListener('click', () => {
        if (busy) return;
        if (state && state.history && state.history.length > 2 && !state.request && !confirm('지금까지 상담한 내용이 지워집니다. 처음부터 다시 할까요?')) return;
        restart(state ? state.format : '');
      });
    }

    async function call(path, payload) {
      const r = await fetch(API + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      let j = {};
      try { j = await r.json(); } catch { /* */ }
      if (!r.ok) throw new Error(j.error || '일시적인 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.');
      return j;
    }

    function showError(msg) { err.textContent = msg; err.hidden = !msg; }

    async function restart(fmt) {
      const prevTrack = state && state.track;
      state = null; ui = null; clear();
      log.innerHTML = ''; dock.innerHTML = ''; showError('');
      root.hidden = true; wait.hidden = false;
      try {
        const j = await call('/api/init', { format: fmt, track: prevTrack });
        state = j.state; ui = j.ui; save();
        wait.hidden = true; render(true);
      } catch (e) {
        wait.hidden = true;
        off.hidden = false;
        off.querySelector('b').textContent = '견적 상담 서버에 연결하지 못했습니다';
        off.querySelector('p').textContent = '잠시 후 다시 열어 주세요. 급하시면 아래 연락처로 문의해 주세요.';
      }
      setSub(fmt);
    }

    async function act(action, optimistic) {
      if (busy) return;
      busy = true; showError('');
      let pend = null;
      if (optimistic) { pend = appendMsg({ role: 'user', content: optimistic }, true); dock.querySelectorAll('textarea').forEach(t => { t.value = ''; }); }
      const typing = appendTyping();
      const ctrls = [...root.querySelectorAll('button, input, textarea, select')];
      ctrls.forEach(x => { x.disabled = true; });
      try {
        const j = await call('/api/turn', { state, action });
        state = j.state; ui = j.ui; save();
        typing.remove();
        render();
      } catch (e) {
        typing.remove();
        if (pend) { pend.remove(); const t = dock.querySelector('textarea'); if (t) t.value = optimistic; }
        ctrls.forEach(x => { x.disabled = false; });
        showError(e.message);
      } finally { busy = false; }
    }

    function appendTyping() {
      const d = document.createElement('div');
      d.className = 'qc-msg bot typing';
      d.innerHTML = '<i></i><i></i><i></i><span class="sr-only">답변을 준비하고 있습니다</span>';
      log.append(d); scrollEnd();
      return d;
    }

    function msgHTML(m) {
      const samples = (m.samples || []).map(x => `
        <figure class="qc-sample">
          <img src="${esc(x.thumb)}" alt="${esc(x.name)} 제작 사례 장면" loading="lazy">
          <figcaption><b>${esc(x.name)}</b> · ${esc(x.title)}<small>${esc(x.card)}</small></figcaption>
        </figure>`).join('');
      return `<div class="qc-txt">${md(m.content)}</div>${samples ? `<div class="qc-samples">${samples}</div>` : ''}`;
    }
    function appendMsg(m, pending) {
      const d = document.createElement('div');
      d.className = 'qc-msg ' + (m.role === 'user' ? 'me' : 'bot') + (pending ? ' pending' : '');
      d.innerHTML = msgHTML(m);
      log.append(d);
      scrollEnd();
      return d;
    }
    function scrollEnd() { requestAnimationFrame(() => { log.scrollTop = log.scrollHeight; }); }

    /* 전체 다시 그리기 (메시지 수가 적어 충분히 빠름) */
    function render(first) {
      root.hidden = false; off.hidden = true;
      topBtn.hidden = !state || state.stage === 'start';
      log.innerHTML = '';
      if (ui.stage === 'start') {
        const h = document.createElement('div');
        h.className = 'qc-hero';
        h.innerHTML = `<h3>${esc(ui.hero.title)}</h3><p>${esc(ui.hero.sub)}</p>`;
        log.append(h);
      }
      for (const m of state.history) appendMsg(m);
      if (ui.request) log.append(requestCard());
      dock.innerHTML = '';
      const fn = { start: dockStart, wizard: dockWizard, done: dockDone, chat: dockChat }[ui.stage];
      if (fn) fn();
      scrollEnd();
      if (!first && !matchMedia('(pointer:coarse)').matches) {
        const f = dock.querySelector('textarea, input[type=text], input[type=number], button.primary');
        if (f) f.focus({ preventScroll: true });
      }
    }

    function composer(placeholder, onSend, rows = 2) {
      const f = document.createElement('form');
      f.className = 'qc-compose';
      f.innerHTML = `<label class="sr-only" for="qcIn">메시지</label>
        <textarea id="qcIn" rows="${rows}" maxlength="1500" placeholder="${esc(placeholder)}"></textarea>
        <button type="submit" class="qc-send" aria-label="보내기"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;
      const ta = f.querySelector('textarea');
      ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); f.requestSubmit(); } });
      f.addEventListener('submit', e => {
        e.preventDefault();
        const t = ta.value.trim();
        if (!t) { showError('내용을 입력해 주세요.'); return; }
        onSend(t);
      });
      return f;
    }

    function dockStart() {
      const chips = document.createElement('div');
      chips.className = 'qc-chips';
      chips.innerHTML = ui.chips.map((c, i) => `<button type="button" data-i="${i}">${esc(c)}</button>`).join('');
      chips.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        const t = ui.chips[+b.dataset.i]; act({ type: 'start', text: t }, t);
      });
      log.append(chips);
      const p = document.createElement('p');
      p.className = 'qc-privacy'; p.textContent = ui.privacy;
      log.append(p);
      dock.append(composer(ui.hint, t => act({ type: 'start', text: t }, t)));
    }

    function dockChat() {
      dock.append(composer(ui.chatHint || '메시지를 입력해 주세요', t => act({ type: 'chat', text: t }, t), 1));
    }

    function dockWizard() {
      const s = ui.step, v = ui.values || {};
      const f = document.createElement('form');
      f.className = 'qc-step';
      let field = '';
      if (s.kind === 'text') field = `<input type="text" name="value" maxlength="200" value="${esc(v.value)}" placeholder="${esc(s.placeholder || '')}" aria-label="답변">`;
      else if (s.kind === 'textarea') field = `<textarea name="value" rows="3" maxlength="1000" aria-label="답변">${esc(v.value)}</textarea>`;
      else if (s.kind === 'select') field = `<div class="qc-opts">${s.options.map(o => `<label><input type="radio" name="value" value="${esc(o)}"${o === v.value ? ' checked' : ''}><span>${esc(o)}</span></label>`).join('')}</div>`;
      else if (s.kind === 'type') field = `<div class="qc-opts">${s.options.map((o, i) => `<label><input type="radio" name="value" value="${esc(o.value)}"${(o.value === v.value || (!v.value && i === 0)) ? ' checked' : ''}><span><b>${esc(o.value)}</b>${o.desc ? `<small>${esc(o.desc)}</small>` : ''}</span></label>`).join('')}</div>`;
      else if (s.kind === 'volume') field = `<div class="qc-nums">
          <label>차시 수<input type="number" name="sessions" min="1" max="200" value="${esc(v.sessions)}" inputmode="numeric"></label>
          <label>차시당 분량(분)<input type="number" name="minutes_per_session" min="5" max="120" value="${esc(v.minutes_per_session)}" inputmode="numeric"></label>
        </div><small class="qc-help">영상 1편이면 차시 수를 1로 두세요.</small>`;
      else if (s.kind === 'options') field = `<div class="qc-checks">
          <label><input type="checkbox" name="voice_over"${v.voice_over ? ' checked' : ''}><span>전문 성우 녹음</span></label>
          <label><input type="checkbox" name="subtitles"${v.subtitles ? ' checked' : ''}><span>자막 제작</span></label>
          <label><input type="checkbox" name="interaction"${v.interaction ? ' checked' : ''}><span>인터랙티브 기능 (퀴즈·분기 시나리오 등)</span></label>
          <label class="qc-inline"><span>스튜디오 촬영 일수 (없으면 0)</span><input type="number" name="filming_days" min="0" max="60" value="${esc(v.filming_days)}" inputmode="numeric"></label>
        </div>`;
      f.innerHTML = `<p class="qc-q"><span class="qc-no">${ui.stepNo}/${ui.stepTotal}</span>${esc(s.q)}</p>${field}
        <div class="qc-btns"><button type="button" class="btn ghost qc-back"${ui.stepNo === 1 ? ' disabled' : ''}>이전</button><button type="submit" class="btn primary">다음</button></div>`;
      f.querySelector('.qc-back').addEventListener('click', () => act({ type: 'back' }));
      f.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(f), vals = {};
        if (['text', 'textarea', 'select', 'type'].includes(s.kind)) vals.value = String(fd.get('value') || '');
        if (s.kind === 'volume') { vals.sessions = +fd.get('sessions'); vals.minutes_per_session = +fd.get('minutes_per_session'); }
        if (s.kind === 'options') { for (const k of ['voice_over', 'subtitles', 'interaction']) vals[k] = fd.get(k) === 'on'; vals.filming_days = +fd.get('filming_days') || 0; }
        if ((s.kind === 'text' || s.kind === 'textarea') && !s.optional && !vals.value.trim()) { showError('내용을 입력해 주세요.'); return; }
        act({ type: 'next', values: vals });
      });
      dock.append(f);
    }

    function dockDone() {
      if (ui.extra) {
        const f = document.createElement('form');
        f.className = 'qc-step qc-extra';
        f.innerHTML = `<p class="qc-q">검토에 참고할 내용이 있으면 남겨 주세요. <b>모두 선택 사항</b>입니다.</p>` +
          ui.extra.map(x => `<label>${esc(x.label)}${x.kind === 'textarea'
            ? `<textarea name="${esc(x.key)}" rows="2" maxlength="1000">${esc(x.value)}</textarea>`
            : `<input type="text" name="${esc(x.key)}" maxlength="200" value="${esc(x.value)}" placeholder="${esc(x.placeholder)}">`}</label>`).join('') +
          `<div class="qc-btns"><button type="submit" class="btn ghost">요청에 반영</button></div>`;
        f.addEventListener('submit', e => { e.preventDefault(); act({ type: 'extra', values: Object.fromEntries(new FormData(f)) }); });
        log.append(f);
      }
      if (ui.deepDive) {
        const wrap = document.createElement('div');
        wrap.className = 'qc-donebar';
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'btn ghost qc-deep';
        b.textContent = 'AI와 더 자세히 상담하기';
        b.addEventListener('click', () => act({ type: 'deep' }));
        wrap.append(b);
        dock.append(wrap);
      }
    }

    function requestCard() {
      const r = ui.request;
      const d = document.createElement('section');
      d.className = 'qc-card';
      d.setAttribute('aria-label', '견적 요청');
      const head = `<h4>견적 요청</h4><p class="qc-sum"><b>${esc(r.summary)}</b>${r.format ? `<small>제작 포맷: ${esc(r.format)}</small>` : ''}</p>`;
      if (r.done) {
        d.classList.add('ok');
        d.innerHTML = head + `<p class="qc-okmsg">견적 요청이 접수되었습니다 (접수번호 <b>${esc(r.done.id)}</b>).</p>
          <p class="qc-note">담당 PM이 검토를 마치는 대로 <b>${esc(r.done.email)}</b> 주소로 견적 링크를 보내 드립니다. 링크에서 견적서를 확인하고 PDF·엑셀로 내려받을 수 있으며, 링크는 발행일로부터 ${r.done.days}일간 유효합니다.</p>`;
        return d;
      }
      const p = r.prefill || {};
      d.innerHTML = head + `
        <fieldset class="qc-track"><legend>기관 구분</legend>
          <label><input type="radio" name="qcTrack" value="public"${r.track === 'public' ? ' checked' : ''}><span>공공기관·교육기관</span></label>
          <label><input type="radio" name="qcTrack" value="private"${r.track === 'private' ? ' checked' : ''}><span>기업·개인</span></label>
        </fieldset>
        <p class="qc-note">AI가 산출한 견적은 담당 PM이 검토해 확정 금액으로 보내 드립니다. 계약 단계에서 금액이 달라지는 일을 막기 위해서입니다.</p>
        <form class="qc-form" novalidate>
          <label class="full"><span>견적을 받을 이메일 <i aria-hidden="true">*</i></span><input type="email" name="email" required maxlength="120" autocomplete="email" placeholder="name@company.com" value="${esc(p.email)}"></label>
          <label>담당자 성함<input type="text" name="name" maxlength="40" autocomplete="name" value="${esc(p.name)}"></label>
          <label>기관(회사)명<input type="text" name="org" maxlength="100" autocomplete="organization" value="${esc(p.org)}"></label>
          <label class="full">과정명<input type="text" name="course" maxlength="150" placeholder="예: 개인정보보호 기본교육" value="${esc(p.course)}"></label>
          <label class="full qc-agree"><input type="checkbox" name="agree"><span>[필수] 견적 회신과 상담을 위해 위 정보와 상담 내용을 수집·이용하는 데 동의합니다. <a href="privacy.html" target="_blank" rel="noopener">개인정보 처리방침</a></span></label>
          <button type="submit" class="btn primary full">견적 요청하기</button>
        </form>`;
      d.querySelectorAll('input[name=qcTrack]').forEach(x => x.addEventListener('change', () => act({ type: 'track', track: x.value })));
      const f = d.querySelector('form');
      f.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(f);
        const email = String(fd.get('email') || '').trim();
        if (!/^[^\s@<>()/,;]+@[^\s@<>()/,;]+\.[A-Za-z]{2,}$/.test(email)) { showError('이메일 주소를 다시 확인해 주세요.'); f.email.focus(); return; }
        if (!fd.get('agree')) { showError('개인정보 수집·이용에 동의해 주셔야 견적을 보내 드릴 수 있습니다.'); return; }
        act({ type: 'request', form: { email, name: fd.get('name'), org: fd.get('org'), course: fd.get('course'), agree: true } });
      });
      return d;
    }

    return {
      open(fmt) {
        build();
        wait.hidden = true; off.hidden = true;
        if (state && (!fmt || state.format === fmt)) { root.hidden = false; setSub(state.format); return; }
        const saved = !state && load();
        if (saved && saved.state && saved.ui && (!fmt || saved.state.format === fmt)) {
          state = saved.state; ui = saved.ui; render(true); setSub(state.format); return;
        }
        restart(fmt);
      },
    };
  })();

  /* ── 공통 이벤트 ─────────────────────────────── */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-quote]');
    if (t) { e.preventDefault(); open(t.dataset.format || ''); }
  });
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !qp.hidden) close(); });
  if (location.hash === '#quote') open('');     // 링크 끝에 #quote 를 붙이면 바로 열림
})();
