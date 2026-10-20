(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- business modal ---------- */
  const M = [
    {no:'01', t:'이러닝 콘텐츠 제작 & 인터랙티브', st:['live','운영 중'],
     d:'교수설계(ISD)부터 촬영·편집·모션그래픽·개발까지 한 팀이 맡습니다. 학습 목표와 대상에 맞춰 포맷을 고르고, 필요한 차시에 참여형 기능을 더합니다.',
     l:['8가지 제작 포맷: 1인 강의 · 스토리텔링 · 재연 드라마 · 인터뷰 · 대담 · 현장 시연 · 모션그래픽 · 온보딩·매뉴얼','5가지 인터랙티브 기능: 비디오 퀴즈 · 프로그래밍 교육 · 의사결정 시나리오 · 모바일 숏폼 · 배리어프리','공공기관 법정교육, 대학 K-MOOC, 기업 직무교육 제작 경험']},
    {no:'02', t:'CDMS · 콘텐츠 제작관리 시스템', st:['live','운영 중'],
     d:'스토리보드와 원고, 검수 의견, 수정 이력을 차시 단위로 묶어 관리합니다. 발주처 담당자는 메일과 파일 대신 화면에서 바로 확인하고 의견을 남깁니다.',
     l:['차시별 스토리보드·원고 버전 관리','검수 의견 등록과 수정 반영 추적','공정 단계별 진행 현황 대시보드']},
    {no:'03', t:'LMS · 위탁교육 플랫폼', st:['beta','내부 테스트 중'],
     d:'여러 기관이 각자의 교육 사이트를 독립적으로 운영하도록 설계한 위탁교육 플랫폼입니다. 학습 이력은 xAPI 표준으로 기록합니다.',
     l:['멀티테넌트: 기관별 사이트·회원·과정 분리 운영','xAPI 기반 학습 이력 수집','현재 개발 서버에서 내부 테스트 진행 중']},
    {no:'04', t:'이러닝 콘텐츠 저작도구', st:['plan','준비 중'],
     d:'제작 현장에서 반복해 쓰던 화면 템플릿과 인터랙션을 담당자가 직접 편집할 수 있는 도구로 정리하고 있습니다.',
     l:['세부 사양은 확정 후 공개 예정']}
  ];
  const dlg = document.getElementById('dlg'), body = document.getElementById('dlgBody');
  document.querySelectorAll('.biz').forEach(b => b.addEventListener('click', () => {
    const m = M[+b.dataset.m];
    body.innerHTML = `<span class="st ${m.st[0]}">${m.st[1]}</span>
      <p class="eyebrow">BUSINESS ${m.no}</p><h3 id="dlgT">${m.t}</h3><p style="color:var(--muted)">${m.d}</p>
      <ul>${m.l.map(x=>`<li>${x}</li>`).join('')}</ul>`;
    dlg.showModal();
  }));
  document.getElementById('dlgX').onclick = () => dlg.close();
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

  /* ---------- solutions ---------- */
  const S = [
    {g:'SOLUTION', n:'CDMS', k:'제작관리 시스템', h:'CDMS', p:'스토리보드부터 검수까지, 제작 과정 전체를 발주처와 함께 봅니다.', tags:['차시별 공정 관리','검수 의견 추적','버전 이력'], c:'var(--lav)', v:'cdms'},
    {g:'SOLUTION', n:'LMS', k:'위탁교육 플랫폼', h:'LMS', p:'기관별로 독립 운영하는 xAPI 기반 위탁교육 플랫폼입니다.', tags:['멀티테넌트','xAPI','내부 테스트 중'], c:'var(--mint)', v:'lms'},
    {g:'SOLUTION', n:'저작도구', k:'콘텐츠 저작도구', h:'저작도구', p:'제작 템플릿과 인터랙션을 담당자가 직접 편집합니다.', tags:['준비 중'], c:'var(--peach)', v:'author'},
    {g:'INTERACTIVE', n:'비디오 퀴즈', k:'인터랙티브', h:'비디오 퀴즈', p:'영상 중간에 문제를 띄워 이해도를 확인하고 다음 장면으로 넘어갑니다.', tags:['구간 정지','즉시 피드백'], c:'var(--lime)', v:'quiz'},
    {g:'INTERACTIVE', n:'의사결정 시나리오', k:'인터랙티브', h:'의사결정 시나리오', p:'학습자의 선택에 따라 이야기가 갈라지고 결과가 달라집니다.', tags:['분기형 전개','결과별 해설'], c:'var(--lav)', v:'branch'},
    {g:'INTERACTIVE', n:'프로그래밍 교육', k:'인터랙티브', h:'프로그래밍 교육', p:'강의 화면 옆에서 코드를 직접 실행하고 결과를 확인합니다.', tags:['브라우저 실습','자동 채점'], c:'var(--mint)', v:'code'},
    {g:'INTERACTIVE', n:'모바일 숏폼', k:'인터랙티브', h:'모바일 숏폼', p:'세로 화면에 맞춘 1~3분 단위 마이크로러닝입니다.', tags:['세로형 9:16','짧은 복습'], c:'var(--peach)', v:'shorts'},
    {g:'INTERACTIVE', n:'배리어프리', k:'인터랙티브', h:'배리어프리', p:'자막·수어·화면해설로 누구나 같은 내용을 학습합니다.', tags:['폐쇄자막','수어 영상','화면해설'], c:'var(--lime)', v:'a11y'}
  ];
  const V = {
    cdms:`<div class="mock"><div class="bar-t"><i></i><i></i><i></i><span>CDMS · 학교안전법 연수 / 공정 현황</span></div><div class="mb kan">
      <div class="col"><span class="h">원고</span><span class="c">3차시 사례</span><span class="c">4차시 정리</span></div>
      <div class="col"><span class="h">스토리보드</span><span class="c hl">2차시 SB v3</span><span class="c">5차시 SB</span></div>
      <div class="col"><span class="h">검수</span><span class="c">1차시 · 의견 4</span></div>
      <div class="col"><span class="h">완료</span><span class="c">OT</span><span class="c">1차시 영상</span></div></div></div>`,
    lms:`<div class="mock"><div class="bar-t"><i></i><i></i><i></i><span>LMS · ○○연수원 / 학습 현황</span></div><div class="mb rows">
      <div class="row"><span>정보보호 기본과정</span><span class="pbar"><i style="width:82%"></i></span><span class="mono">82%</span></div>
      <div class="row"><span>기록관리 실무</span><span class="pbar"><i style="width:54%"></i></span><span class="mono">54%</span></div>
      <div class="row"><span>학교안전법 이해</span><span class="pbar"><i style="width:31%"></i></span><span class="mono">31%</span></div>
      <div class="row"><span class="mono">xAPI · "completed" 128건 기록</span><span></span><span></span></div></div></div>`,
    author:`<div class="mock"><div class="bar-t"><i></i><i></i><i></i><span>저작도구 · 화면 편집</span></div><div class="mb ed">
      <div class="tl"><i></i><i class="on"></i><i></i><i></i></div>
      <div class="cv"><b style="left:8%;top:10%;width:60%;height:18%">제목 텍스트</b><b style="left:8%;top:36%;width:40%;height:44%">이미지</b><b style="left:54%;top:36%;width:38%;height:20%;background:var(--lime);color:var(--lime-ink)">퀴즈 버튼</b></div>
      <div class="pr"><span class="mono">속성</span><i></i><i style="width:70%"></i><i></i><i style="width:50%"></i></div></div></div>`,
    quiz:`<div class="mock" style="max-width:520px"><div class="mb"><div class="vid"><div class="q"><b style="font-size:13px">Q. 처리과 기록물 이관 시기는?</b><div>생산 후 즉시</div><div class="ok">생산연도 종료 후 2년 이내 ✓</div><div>보존기간 만료 후</div></div><div class="tlb"><i></i><b style="left:46%"></b></div></div></div></div>`,
    branch:`<div class="mock" style="max-width:520px"><div class="mb"><svg viewBox="0 0 480 240" width="100%" role="img" aria-label="선택에 따라 갈라지는 시나리오 흐름">
      <g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M110 120 C170 120 170 60 230 60"/><path d="M110 120 C170 120 170 180 230 180"/><path d="M330 60 C370 60 370 40 400 40"/><path d="M330 60 C370 60 370 90 400 90"/></g>
      <g font-family="IBM Plex Sans KR, sans-serif" font-size="12" fill="currentColor">
      <rect x="10" y="98" width="100" height="44" rx="10" fill="var(--bg)" stroke="currentColor"/><text x="60" y="124" text-anchor="middle">민원 상황 발생</text>
      <rect x="230" y="38" width="100" height="44" rx="10" fill="var(--lime)" stroke="currentColor"/><text x="280" y="64" text-anchor="middle" fill="#15171A">규정 먼저 안내</text>
      <rect x="230" y="158" width="100" height="44" rx="10" fill="var(--bg)" stroke="currentColor"/><text x="280" y="184" text-anchor="middle">상황부터 경청</text>
      <rect x="400" y="24" width="72" height="32" rx="8" fill="var(--bg)" stroke="currentColor"/><text x="436" y="44" text-anchor="middle">결과 A</text>
      <rect x="400" y="74" width="72" height="32" rx="8" fill="var(--bg)" stroke="currentColor"/><text x="436" y="94" text-anchor="middle">결과 B</text></g></svg></div></div>`,
    code:`<div class="mock"><div class="bar-t"><i></i><i></i><i></i><span>실습 3 · 리스트 합계</span></div><div class="code">
      <pre><span class="k">def</span> total(nums):
    s = 0
    <span class="k">for</span> n <span class="k">in</span> nums:
        s += n
    <span class="k">return</span> s

print(total([3, 5, 7]))</pre>
      <div class="out"><span class="mono">출력</span><span>15</span><span class="pass">✓ 테스트 3/3 통과</span></div></div></div>`,
    shorts:`<div class="phone"><div class="scr"><div class="side-ic"><i></i><i></i><i></i></div><span class="mono" style="color:#C9F04A">1분 복습 · 3/5</span><b>개인정보 유출,<br>첫 10분에 할 일</b><span style="opacity:.8">신고 → 차단 → 기록</span><span class="pr2"></span></div></div>`,
    a11y:`<div class="mock a11y" style="max-width:520px"><div class="mb"><div class="vid"><span class="cap">[내레이션] 기록물은 생산과 동시에 등록합니다</span><span class="sign" aria-hidden="true"></span></div>
      <div class="opts"><span class="on">자막</span><span class="on">수어</span><span>화면해설</span><span>고대비</span></div></div></div>`
  };
  const tabs = document.getElementById('tabs'), stage = document.getElementById('stage'),
        detail = document.getElementById('detail'), prog = document.getElementById('prog');
  let grp = '';
  S.forEach((s, i) => {
    if (s.g !== grp) { grp = s.g; tabs.insertAdjacentHTML('beforeend', `<p class="grp">${grp}</p>`); }
    tabs.insertAdjacentHTML('beforeend', `<button class="tab" role="tab" id="t${i}" data-i="${i}">${s.n}<small>${String(i+1).padStart(2,'0')}</small></button>`);
    prog.insertAdjacentHTML('beforeend', `<button aria-label="${s.n} 보기" data-i="${i}"><i></i></button>`);
  });
  prog.insertAdjacentHTML('beforeend', `<button class="pause" id="pause" aria-label="자동 넘김 멈춤">❚❚</button>`);
  const DUR = 6000; let cur = 0, t0 = 0, playing = !reduce, raf;
  function show(i) {
    cur = i; t0 = performance.now(); const s = S[i];
    stage.style.setProperty('--panel', s.c);
    stage.innerHTML = `<div class="fade" style="width:100%;display:grid;place-items:center">${V[s.v]}</div>`;
    detail.innerHTML = `<div class="fade" style="display:grid;gap:12px"><span class="kind">${s.k}</span><h3>${s.h}</h3><p>${s.p}</p><ul>${s.tags.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
    tabs.querySelectorAll('.tab').forEach(t => { const on = +t.dataset.i === i; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); });
    prog.querySelectorAll('button[data-i]').forEach(b => { const j = +b.dataset.i; b.classList.toggle('done', j < i); b.firstChild.style.width = j < i ? '100%' : '0'; });
  }
  function tick(now) {
    if (playing) {
      const r = Math.min(1, (now - t0) / DUR);
      const bar = prog.querySelector(`button[data-i="${cur}"] i`); if (bar) bar.style.width = (r*100) + '%';
      if (r >= 1) show((cur + 1) % S.length);
    }
    raf = requestAnimationFrame(tick);
  }
  tabs.addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) show(+b.dataset.i); });
  prog.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (b) show(+b.dataset.i); });
  const pauseBtn = document.getElementById('pause');
  function setPlay(p){ playing = p; pauseBtn.textContent = p ? '❚❚' : '▶'; pauseBtn.setAttribute('aria-label', p ? '자동 넘김 멈춤' : '자동 넘김 시작'); t0 = performance.now() - (parseFloat(prog.querySelector(`button[data-i="${cur}"] i`).style.width)||0)/100*DUR; }
  pauseBtn.addEventListener('click', () => setPlay(!playing));
  show(0); setPlay(playing); raf = requestAnimationFrame(tick);

  /* ---------- marquee duplicate ---------- */
  document.querySelectorAll('.track').forEach(track => {
    const n = track.children.length; track.innerHTML += track.innerHTML;
    [...track.children].forEach((c, i) => { if (i >= n) c.setAttribute('aria-hidden', 'true'); });
  });

  /* ---------- header / dots state ---------- */
  const top = document.getElementById('top');
  const links = [...document.querySelectorAll('.dots a, .nav a')];
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), {threshold: .5});
  document.querySelectorAll('main > section').forEach(s => io.observe(s));
  const onScroll = () => top.classList.toggle('solid', scrollY > 40);
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* ---------- deck button / form ---------- */
  document.getElementById('deckBtn').addEventListener('click', e => {
    const b = e.currentTarget; const o = b.innerHTML; b.textContent = '회사소개서 준비 중';
    setTimeout(() => b.innerHTML = o, 1800);
  });

  /* ---------- cursor ---------- */
  const cur$ = document.getElementById('cursor');
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', e => { cur$.style.opacity = 1; cur$.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; });
    document.addEventListener('pointerover', e => cur$.classList.toggle('big', !!e.target.closest('a,button,label,input,textarea,select')));
    document.addEventListener('pointerleave', () => cur$.style.opacity = 0);
  }

  /* ---------- hero field: 원고지 격자처럼 늘어선 점, 포인터 근처가 라임으로 켜짐 ---------- */
  const cv = document.getElementById('field'), ctx = cv.getContext('2d');
  let W, H, dpr, mx = -999, my = -999, pts = [];
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function size() {
    dpr = Math.min(2, devicePixelRatio || 1); const r = cv.getBoundingClientRect();
    W = r.width; H = r.height; cv.width = W*dpr; cv.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    pts = []; const g = W < 600 ? 26 : 34;
    for (let y = g/2; y < H; y += g) for (let x = g/2; x < W; x += g) pts.push([x, y]);
  }
  function draw(now) {
    ctx.clearRect(0,0,W,H);
    const dot = css('--dot'), lime = css('--lime'), ink = css('--ink');
    const t = (now||0) / 1000;
    for (const [x, y] of pts) {
      const d = Math.hypot(x - mx, y - my);
      const near = Math.max(0, 1 - d / 160);
      const wave = reduce ? 0 : (Math.sin(x*0.012 + y*0.008 + t*1.2) + 1) * 0.5;
      const r = 1.2 + near * 3.2 + wave * 0.5;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.fillStyle = near > 0.15 ? lime : dot; ctx.fill();
      if (near > 0.55) { ctx.lineWidth = 1; ctx.strokeStyle = ink; ctx.stroke(); }
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  addEventListener('resize', size);
  document.getElementById('hero').addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; if (reduce) draw(); });
  document.getElementById('hero').addEventListener('pointerleave', () => { mx = my = -999; if (reduce) draw(); });
  size(); draw();
})();
