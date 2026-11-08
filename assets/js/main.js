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
    {no:'04', t:'화이트보드 · 협력학습 도구', st:['live','납품 실적'],
     d:'교사와 학습자가 한 화면에서 함께 쓰고 그리며 의견을 나누는 협력학습용 화이트보드입니다. 수업과 연수에서 모둠 활동·토론·아이디어 정리에 씁니다.',
     l:['NE능률 화이트보드 솔루션 납품','세부 기능과 화면은 자료 정리 후 공개 예정']}
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
    {g:'SOLUTION', n:'CDMS', k:'제작관리 시스템', h:'CDMS', p:'스토리보드부터 검수까지, 제작 과정 전체를 발주처와 함께 봅니다.', tags:['차시별 공정 관리','검수 의견 추적','버전 이력'], c:'var(--lav)', v:'cdms', d:'cdms', dur:14000,
     url:'AI CDMS · 개발사 담당자 포털', ratio:'1554/705', shots:[
      {src:'assets/img/solutions/cdms-01-projects.webp', cap:'프로젝트 현황 — 일정 대비 진행률과 지연 산출물'},
      {src:'assets/img/solutions/cdms-02-matrix.webp', cap:'과정별 산출물 매트릭스 — 주차 × 교안·SB·영상·자막'},
      {src:'assets/img/solutions/cdms-03-schedule.webp', cap:'일정표 — 과정별 산출물 마감을 한 달력에'},
      {src:'assets/img/solutions/cdms-04-review.webp', cap:'검수 현황 — AI 검수 → 발주처 검토 → 최종 승인'}]},
    {g:'SOLUTION', n:'LMS', k:'위탁교육 플랫폼', h:'LMS', p:'기관별로 독립 운영하는 xAPI 기반 위탁교육 플랫폼입니다.', tags:['멀티테넌트','xAPI','인터랙티브 콘텐츠'], c:'var(--mint)', v:'lms', d:'lms', dur:18000,
     url:'기관 전용 LMS · 위탁교육', shots:[
      {src:'assets/img/solutions/lms-01-home.webp', cap:'기관 전용 첫 화면 — 운영 중인 과정과 기수를 한눈에'},
      {src:'assets/img/solutions/lms-02-classroom.webp', cap:'학습자 강의실 — 6개 스테이지와 센터 대항전'},
      {src:'assets/img/solutions/lms-05-card.webp', cap:'인터랙티브 영상 — 멈춘 지점에서 경험 카드 고르기'},
      {src:'assets/img/solutions/lms-06-match.webp', cap:'인터랙티브 영상 — 채용공고에 맞는 경험 골라 보기'},
      {src:'assets/img/solutions/lms-03-check.webp', cap:'출발 전 체크 — 응답에 따라 맞춤 스테이지 추천'},
      {src:'assets/img/solutions/lms-04-qna.webp', cap:'Q&A — 학습 도우미와 담당자 1:1 질문'}]},
    {g:'SOLUTION', n:'화이트보드', k:'협력학습 도구', h:'화이트보드', p:'교사와 학습자가 한 화면에서 함께 쓰고 그리며 생각을 나눕니다.', tags:['실시간 협업','모둠 활동','NE능률 납품'], c:'var(--peach)', v:'board', d:'board', dur:12000,
     url:'협력학습 화이트보드 · 수업 보드', ratio:'1457/705', shots:[
      {src:'assets/img/solutions/board-01-class.webp', cap:'수업 자료 위 판서 — 학생 필기 제어·같은 화면 보기를 교사가 조절'},
      {src:'assets/img/solutions/board-02-pages.webp', cap:'페이지 목록과 도구 모음 — 활동 단계별로 보드를 넘기며 수업'},
      {src:'assets/img/solutions/board-03-link.webp', cap:'링크 카드 — 참고 사이트를 보드 위에 바로 붙이기'},
      {src:'assets/img/solutions/board-04-image.webp', cap:'이미지와 설명 배치 — 자료를 올리고 옆에 바로 설명 적기'}]},
    {g:'INTERACTIVE', n:'비디오 퀴즈', k:'인터랙티브', h:'비디오 퀴즈', p:'영상 핵심 지점마다 5가지 유형의 퀴즈를 배치하는 참여형 인터랙션입니다.', tags:['객관식','OX','단답형','순서 정렬','매칭'], c:'var(--lime)', v:'quiz', x:'video-quiz'},
    {g:'INTERACTIVE', n:'의사결정 시나리오', k:'인터랙티브', h:'의사결정 시나리오', p:'선택에 따라 장면과 결과가 달라지는 멀티 엔딩 브랜칭 콘텐츠입니다.', tags:['분기형 전개','멀티 엔딩'], c:'var(--lav)', v:'branch', x:'branching'},
    {g:'INTERACTIVE', n:'프로그래밍 교육', k:'인터랙티브', h:'프로그래밍 교육', p:'영상 시청 중 코드 실행과 AI 코드 리뷰가 연결되는 실습 환경입니다.', tags:['코드 실행','AI 코드 리뷰'], c:'var(--mint)', v:'code', x:'programming'},
    {g:'INTERACTIVE', n:'모바일 숏폼', k:'인터랙티브', h:'모바일 숏폼', p:'세로 9:16 풀스크린에 맞춘 숏폼 마이크로러닝과 재구성입니다.', tags:['세로형 9:16','마이크로러닝'], c:'var(--peach)', v:'shorts', x:'shorts'},
    {g:'INTERACTIVE', n:'배리어프리', k:'인터랙티브', h:'배리어프리', p:'자막·색상·확대·속도 조절과 수어·AI 도우미를 통합한 접근성 설계입니다.', tags:['자막·색상·확대','수어','AI 도우미'], c:'var(--lime)', v:'a11y', x:'accessibility'}
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
    board:`<div class="mock"><div class="bar-t"><i></i><i></i><i></i><span>화이트보드 · 3모둠 토론판</span></div><div class="mb wb">
      <svg class="wb-ink" viewBox="0 0 400 200" aria-hidden="true"><path d="M40 150 C90 110 120 170 170 128 S250 90 290 120" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="330" cy="70" r="34" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="6 6"/></svg>
      <span class="note" style="left:6%;top:10%;background:var(--lime)">문제 정의</span>
      <span class="note" style="left:34%;top:18%;background:var(--lav)">원인 ①</span>
      <span class="note" style="left:58%;top:8%;background:var(--mint)">원인 ②</span>
      <span class="note" style="left:22%;top:58%;background:var(--peach)">해결 아이디어</span>
      <span class="cur" style="left:52%;top:52%"><b>학습자 A</b></span>
      <span class="cur t" style="left:76%;top:70%"><b>교사</b></span></div></div>`,
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
  const DUR = 6000; let cur = 0, t0 = 0, playing = !reduce, raf, shotTimer;
  const dur = () => S[cur].dur || DUR;
  /* 실제 운영 화면 캡처 슬라이드 (assets/img/solutions/) */
  function shotsHTML(s){
    return `<figure class="shots" aria-roledescription="carousel" aria-label="${s.h} 실제 화면">
      <div class="bar-t"><i></i><i></i><i></i><span>${s.url}</span><em>실제 화면</em></div>
      <div class="sh-view"${s.ratio ? ` style="aspect-ratio:${s.ratio}"` : ''}>${s.shots.map((x,i)=>`<img src="${x.src}" alt="${x.cap}" class="${i?'':'on'}" loading="lazy" draggable="false">`).join('')}</div>
      <figcaption><span class="sh-cap">${s.shots[0].cap}</span><span class="sh-dots">${s.shots.map((x,i)=>`<button type="button" aria-label="${i+1}번째 화면" class="${i?'':'on'}" data-sh="${i}"></button>`).join('')}</span></figcaption></figure>`;
  }
  function startShots(s){
    const fig = stage.querySelector('.shots'); let k = 0;
    /* 숨은 슬라이드는 lazy 로드가 걸리지 않아 넘어갈 때 빈 화면이 보인다 — 탭을 연 순간 전부 불러온다 */
    fig.querySelectorAll('.sh-view img').forEach(im => { im.loading = 'eager'; if (!im.complete) im.src = im.src; });
    const go = n => { k = n; fig.querySelectorAll('.sh-view img').forEach((im,i)=>im.classList.toggle('on', i===k));
      fig.querySelectorAll('.sh-dots button').forEach((b,i)=>b.classList.toggle('on', i===k));
      fig.querySelector('.sh-cap').textContent = s.shots[k].cap; };
    fig.addEventListener('click', e => { const b = e.target.closest('[data-sh]'); if (b) { e.stopPropagation(); go(+b.dataset.sh); } });
    shotTimer = setInterval(() => { if (playing) go((k + 1) % s.shots.length); }, (s.dur || DUR) / s.shots.length);
  }
  function show(i) {
    cur = i; t0 = performance.now(); const s = S[i];
    stage.style.setProperty('--panel', s.c);
    clearInterval(shotTimer);
    stage.innerHTML = `<div class="fade" style="width:100%;display:grid;place-items:center">${s.shots ? shotsHTML(s) : V[s.v]}</div>`;
    if (s.shots) startShots(s);
    detail.innerHTML = `<div class="fade" style="display:grid;gap:12px"><span class="kind">${s.k}</span><h3>${s.h}</h3><p>${s.p}</p><ul>${s.tags.map(x=>`<li>${x}</li>`).join('')}</ul>${s.x ? `<button class="btn primary try" type="button" data-ix="${s.x}">직접 체험하기<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg></button>` : ''}${s.d ? `<button class="btn primary try" type="button" data-demo="${s.d}">데모 체험하기<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg></button>` : ''}</div>`;
    stage.classList.toggle('can-try', !!s.x); stage.dataset.ix = s.x || '';
    tabs.querySelectorAll('.tab').forEach(t => { const on = +t.dataset.i === i; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); });
    prog.querySelectorAll('button[data-i]').forEach(b => { const j = +b.dataset.i; b.classList.toggle('done', j < i); b.firstChild.style.width = j < i ? '100%' : '0'; });
  }
  function tick(now) {
    if (playing) {
      const r = Math.min(1, (now - t0) / dur());
      const bar = prog.querySelector(`button[data-i="${cur}"] i`); if (bar) bar.style.width = (r*100) + '%';
      if (r >= 1) show((cur + 1) % S.length);
    }
    raf = requestAnimationFrame(tick);
  }
  tabs.addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) show(+b.dataset.i); });
  prog.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (b) show(+b.dataset.i); });
  const pauseBtn = document.getElementById('pause');
  function setPlay(p){ playing = p; pauseBtn.textContent = p ? '❚❚' : '▶'; pauseBtn.setAttribute('aria-label', p ? '자동 넘김 멈춤' : '자동 넘김 시작'); t0 = performance.now() - (parseFloat(prog.querySelector(`button[data-i="${cur}"] i`).style.width)||0)/100*dur(); }
  pauseBtn.addEventListener('click', () => setPlay(!playing));
  show(0); setPlay(playing); raf = requestAnimationFrame(tick);
  stage.addEventListener('click', () => { if (stage.dataset.ix) openIx(stage.dataset.ix); });

  /* ---------- 제작 포맷 레이어 팝업 (원본: 카운셀럽 인트로) ---------- */
  /* 포트폴리오는 영상을 재생하지 않고 대표 장면(썸네일)만 보여 줍니다.
   * 썸네일: assets/img/thumbs/<영상 이름>.jpg (원본 영상 30% 지점에서 추출). 파일이 없으면 '준비 중' 표시 */
  const thumb = v => 'assets/img/thumbs/' + String(v).replace(/\.mp4$/i, '') + '.jpg';
  const F = window.CL_FORMATS || [];
  const fmtDlg = document.getElementById('fmtDlg'), fmtBody = document.getElementById('fmtBody');
  document.querySelectorAll('[data-card]').forEach(p => { const f = F.find(x => x.id === p.dataset.card); if (f) p.textContent = f.card; });
  function openFmt(id){
    const f = F.find(x => x.id === id); if (!f) return;
    fmtBody.innerHTML = `<header class="fd-head"><p class="eyebrow">${f.eyebrow}</p><h3 id="fmtT">${f.title}</h3><p>${f.lead}</p></header>` +
      f.sections.map((x, i) => `<section class="fd-sec${i % 2 ? ' flip' : ''}">
        <div class="fd-info"><span class="fd-tag">${x.tag}</span><h4>${x.h}</h4><p>${x.p}</p><ul>${x.li.map(l => `<li>${l}</li>`).join('')}</ul></div>
        <figure class="fd-vid"><img src="${thumb(x.video)}" alt="${x.h.replace(/<[^>]+>/g,' ')} 제작 사례 화면" loading="lazy" draggable="false"><figcaption>제작 사례</figcaption></figure>
      </section>`).join('') +
      `<div class="fd-foot"><span>「${f.name}」 포맷으로 제작하고 싶으신가요? 유형이 정해진 상태로 견적 문의가 이어집니다.</span><button class="btn primary" type="button" data-quote data-format="${f.id}">견적 문의</button></div>`;
    fmtBody.querySelectorAll('.fd-vid img').forEach(im => im.addEventListener('error', () => im.parentElement.classList.add('fail')));
    fmtBody.scrollTop = 0; fmtDlg.showModal();
  }
  document.querySelectorAll('[data-fmt]').forEach(b => b.addEventListener('click', () => openFmt(b.dataset.fmt)));

  /* ---------- 솔루션 데모 체험 (config.js 의 demo) ----------
   * url 이 있으면 체험 계정 안내 + 「데모 열기」, 비어 있으면 「데모 신청」(메일) 안내 */
  const DEMO = (window.CL_CONFIG || {}).demo || {};
  const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function openDemo(key){
    const s = S.find(y => y.d === key); if (!s) return;
    if (playing) setPlay(false);
    const d = DEMO[key] || {}, mail = (window.CL_CONFIG || {}).contactEmail || '';
    const acct = (d.id || d.pw) ? `<dl class="demo-acct">${d.id ? `<div><dt>아이디</dt><dd><code>${esc(d.id)}</code><button type="button" class="copy" data-copy="${esc(d.id)}">복사</button></dd></div>` : ''}${d.pw ? `<div><dt>비밀번호</dt><dd><code>${esc(d.pw)}</code><button type="button" class="copy" data-copy="${esc(d.pw)}">복사</button></dd></div>` : ''}</dl>` : '';
    body.innerHTML = d.url
      ? `<span class="st live">데모 운영 중</span><p class="eyebrow">DEMO · ${esc(s.h)}</p><h3 id="dlgT">${esc(s.h)} 데모 체험</h3>
         <p style="color:var(--muted)">${esc(d.note || '체험용 환경입니다. 입력한 내용은 주기적으로 초기화됩니다.')}</p>${acct}
         <a class="btn primary" href="${esc(d.url)}" target="_blank" rel="noopener">데모 열기 (새 창)</a>`
      : `<span class="st beta">데모 준비 중</span><p class="eyebrow">DEMO · ${esc(s.h)}</p><h3 id="dlgT">${esc(s.h)} 데모 신청</h3>
         <p style="color:var(--muted)">체험용 환경을 준비하고 있습니다. 신청하시면 담당자가 체험 계정과 함께 안내해 드립니다.</p>
         <div style="display:flex;gap:10px;flex-wrap:wrap">${mail ? `<a class="btn primary" href="mailto:${esc(mail)}?subject=${encodeURIComponent('[데모 신청] ' + s.h)}&body=${encodeURIComponent('기관(회사)명:\n담당자 성함:\n연락처:\n체험 목적:')}">메일로 데모 신청</a>` : ''}<button class="btn ghost" type="button" data-quote>견적 문의로 상담하기</button></div>`;
    dlg.showModal();
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-demo]'); if (b) { e.stopPropagation(); openDemo(b.dataset.demo); return; }
    const c = e.target.closest('[data-copy]'); if (c && navigator.clipboard) { navigator.clipboard.writeText(c.dataset.copy).then(() => { c.textContent = '복사됨'; setTimeout(() => c.textContent = '복사', 1500); }); }
  });
  dlg.addEventListener('click', e => { if (e.target.closest('[data-quote]')) dlg.close(); });

  /* ---------- 인터랙티브 기능 레이어 팝업 (interactive/*.html) ---------- */
  const ixDlg = document.getElementById('ixDlg'), ixFrame = document.getElementById('ixFrame'),
        ixT = document.getElementById('ixT'), ixExt = document.getElementById('ixExt');
  function openIx(x){
    const s = S.find(y => y.x === x); if (!s) return;
    if (playing) setPlay(false);
    ixT.textContent = s.h; ixExt.href = `interactive/${x}.html`;
    ixFrame.src = `interactive/${x}.html?embed=1`;
    ixDlg.showModal();
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-ix]'); if (b) { e.stopPropagation(); openIx(b.dataset.ix); } });
  ixDlg.addEventListener('close', () => { ixFrame.src = 'about:blank'; });

  /* 팝업 공통: 닫기 버튼, 바깥 누르면 닫힘, 견적 문의 누르면 팝업 닫고 견적 패널 */
  [fmtDlg, ixDlg].forEach(d => {
    d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-close]')) d.close(); if (e.target.closest('[data-quote]')) d.close(); });
  });

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
