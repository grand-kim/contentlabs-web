/* PM 견적 검토 화면 (admin.html) — 예전 Streamlit 앱 ?admin=1 화면을 홈페이지로 옮긴 것
 *  · 견적 검토: 접수된 견적 확인 → 조건·산출 내역(수량·단가·항목)·조정 금액 수정 → 승인하고 고객에게 발송
 *  · 단가 학습: 발행된 견적에서 PM이 고친 값을 모아 단가표 조정안을 보여 주고, [반영]하면 다음 견적부터 적용
 * 비밀번호는 견적 서버(Cloudflare)의 ADMIN_PASSWORD. 로그인은 이 브라우저 탭에서만 12시간 유지됩니다. */
(function () {
  'use strict';
  var API = String((window.CL_CONFIG || {}).quoteApi || '').replace(/\/$/, '');
  var app = document.getElementById('app');
  var TK = 'cl_admin_token';
  var S = { token: null, items: [], filter: 'pending', q: '', cur: null, work: null, dirty: false, tab: 'quotes', learn: null, role: null, roleLabel: '', canDelete: false, picked: {} };
  var STATUS = { pending: '검토 대기', issued: '발행됨', hold: '보류', revoked: '링크 회수', expired: '기간 만료' };
  var INFO = [['client_name', '수신(기관명)'], ['contact_name', '담당자 성함'], ['email', '이메일'], ['phone', '전화'], ['domain', '기관 유형'],
    ['audience', '교육 대상'], ['course_title', '과정명'], ['format', '제작 포맷'], ['contact', '담당자'], ['deadline', '희망 납기'],
    ['budget', '예산 범위'], ['reference', '레퍼런스'], ['notes', '상담 메모'], ['track_basis', '기준 판단 근거']];

  try { S.token = sessionStorage.getItem(TK); } catch (e) { S.token = null; }

  /* ── 도우미 ── */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function won(n) { return Math.trunc(Number(n) || 0).toLocaleString('ko-KR'); }
  function num(n) { return (Math.round(Number(n) * 100) / 100).toLocaleString('ko-KR'); }
  function t16(s) { return String(s || '').slice(0, 16).replace('T', ' '); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function toast(msg) {
    var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3200);
  }
  function confirmBox(title, body, okLabel) {
    return new Promise(function (resolve) {
      var m = document.createElement('div'); m.className = 'modal';
      m.innerHTML = '<div class="box" role="dialog" aria-modal="true"><h3>' + esc(title) + '</h3><p class="muted">' + body + '</p>' +
        '<div class="row" style="justify-content:flex-end"><button class="btn" data-v="0">취소</button><button class="btn primary" data-v="1">' + esc(okLabel || '확인') + '</button></div></div>';
      document.body.appendChild(m);
      m.addEventListener('click', function (e) {
        var v = e.target.getAttribute && e.target.getAttribute('data-v');
        if (v !== null || e.target === m) { m.remove(); resolve(v === '1'); }
      });
      $('[data-v="1"]', m).focus();
    });
  }
  function api(path, body) {
    return fetch(API + path, { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + (S.token || '') }, body: JSON.stringify(body || {}) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, j: j }; }); })
      .then(function (res) {
        if (res.status === 401 && path !== '/api/admin/login') { logout(); throw new Error(res.j.error || '다시 로그인해 주세요.'); }
        if (res.status !== 200) throw new Error(res.j.error || '요청을 처리하지 못했습니다.');
        return res.j;
      });
  }
  function fail(e) { toast(e && e.message ? e.message : '문제가 생겼습니다.'); }

  /* ── 로그인 ── */
  function loginView(msg) {
    app.innerHTML = '<form class="login" id="lf"><h1>견적 검토</h1><p class="muted small">콘텐츠랩스 PM 전용 화면입니다.</p>' +
      (msg ? '<p class="note bad">' + esc(msg) + '</p>' : '') +
      '<label class="field"><span>비밀번호</span><input type="password" name="pw" autocomplete="current-password" required></label>' +
      '<p style="margin-top:12px"><button class="btn primary" style="width:100%">로그인</button></p>' +
      '<p class="muted small">PM은 ADMIN_PASSWORD, 슈퍼관리자는 SUPER_PASSWORD 값으로 로그인합니다 (견적 서버 Cloudflare Secrets).</p></form>';
    $('#lf input').focus();
    $('#lf').onsubmit = function (e) {
      e.preventDefault();
      var pw = this.pw.value;
      api('/api/admin/login', { password: pw }).then(function (j) {
        S.token = j.token; try { sessionStorage.setItem(TK, j.token); } catch (er) { /* 탭을 닫으면 다시 로그인 */ }
        shell(); route();
      }).catch(function (er) { loginView(er.message); });
    };
  }
  function logout() { S.token = null; try { sessionStorage.removeItem(TK); } catch (e) { /* */ } loginView(); }

  /* ── 틀 ── */
  function shell() {
    app.innerHTML = '<header class="d-top"><a class="brand" href="#">콘텐츠랩스<b>PM</b></a>' +
      '<nav class="tabs" role="tablist"><button role="tab" data-tab="quotes">견적 검토</button><button role="tab" data-tab="rates">단가 학습</button></nav>' +
      '<span class="sp"></span><span class="chip" id="role"></span><button class="btn sm ghost" id="lo">로그아웃</button></header><div id="body"></div>';
    $('#lo').onclick = logout;
    $$('[data-tab]').forEach(function (b) { b.onclick = function () { location.hash = b.dataset.tab === 'rates' ? '#rates' : '#'; }; });
  }
  function setTab(t) { S.tab = t; $$('[data-tab]').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === t)); }); }

  function route() {
    if (!S.token) return loginView();
    if (!$('#body')) shell();
    var h = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (h === 'rates') { setTab('rates'); return learnView(); }
    setTab('quotes');
    deskView(/^CL-\d{4}-\d{4}$/.test(h) ? h : null);
  }
  window.addEventListener('hashchange', function () {
    if (S.dirty && !window.confirm('저장하지 않은 수정 내용이 있습니다. 이동할까요?')) return;
    S.dirty = false; route();
  });
  window.addEventListener('beforeunload', function (e) { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ── 견적 목록 ── */
  var GROUPS = { pending: ['pending'], issued: ['issued'], closed: ['hold', 'expired', 'revoked'], all: null };
  function deskView(id) {
    var body = $('#body');
    if (!$('.desk', body)) {
      body.innerHTML = '<div class="desk"><aside class="side"><div class="filters">' +
        '<div class="seg" role="group" aria-label="상태">' +
        '<button data-f="pending">검토 대기</button><button data-f="issued">발행됨</button><button data-f="closed">보류·만료·회수</button><button data-f="all">전체</button></div>' +
        '<input type="search" id="qs" placeholder="기관명·과정명·견적번호 검색">' +
        '<div class="row hide" id="delbar"><span class="small muted" id="pickn">선택 0건</span><span style="flex:1"></span>' +
        '<button class="btn sm danger" id="delpick" disabled>선택 삭제</button><button class="btn sm ghost" id="dellog">삭제 기록</button></div></div>' +
        '<ul class="qlist" id="ql"></ul></aside>' +
        '<section class="main" id="dm"><div class="empty">왼쪽에서 견적을 고르세요.</div></section></div>';
      $$('[data-f]', body).forEach(function (b) { b.onclick = function () { S.filter = b.dataset.f; drawList(); }; });
      $('#qs').oninput = function () { S.q = this.value.trim().toLowerCase(); drawList(); };
      $('#delpick').onclick = function () { deleteFlow(Object.keys(S.picked)); };
      $('#dellog').onclick = showDeletedLog;
      loadList();
    }
    $('.desk').classList.toggle('has-detail', !!id);
    if (id) openQuote(id); else { S.cur = null; $('#dm').innerHTML = '<div class="empty">왼쪽에서 견적을 고르세요.</div>'; drawList(); }
  }
  function loadList() {
    return api('/api/admin/list').then(function (j) {
      S.items = j.items; S.role = j.role; S.roleLabel = j.roleLabel; S.canDelete = !!j.canDelete;
      var r = $('#role'); if (r) { r.textContent = j.roleLabel || ''; r.className = 'chip' + (j.canDelete ? ' revoked' : ''); }
      if ($('#delbar')) $('#delbar').classList.toggle('hide', !S.canDelete);
      drawList();
      if (S.cur) drawDeleteCard();
    }).catch(fail);
  }
  function drawList() {
    $$('[data-f]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.f === S.filter)); });
    var g = GROUPS[S.filter];
    var list = S.items.filter(function (x) {
      if (g && g.indexOf(x.status) < 0) return false;
      if (!S.q) return true;
      return [x.id, x.client_name, x.course_title, x.contact_name, x.email].join(' ').toLowerCase().indexOf(S.q) >= 0;
    });
    var cur = S.cur && S.cur.rec.id;
    $('#ql').innerHTML = list.length ? list.map(function (x) {
      return '<li' + (S.canDelete ? ' style="display:flex"' : '') + '>' + (S.canDelete ? '<label class="check" style="padding:0 0 0 10px;border-bottom:1px solid var(--line)"><input type="checkbox" class="pk" data-id="' + esc(x.id) + '"' + (S.picked[x.id] ? ' checked' : '') + ' aria-label="' + esc(x.id) + ' 선택"></label>' : '') +
        '<button data-id="' + esc(x.id) + '"' + (x.id === cur ? ' aria-current="true"' : '') + '>' +
        '<div class="l1"><span class="mono">' + esc(x.id) + '</span><span class="chip ' + x.status + '">' + STATUS[x.status] + '</span></div>' +
        '<div class="l2">' + esc(x.client_name || '(기관명 없음)') + '</div>' +
        '<div class="l3"><span>' + esc((x.content_type || '') + ' ' + (x.sessions || '') + '차시') + (x.edited ? ' · 수정함' : '') + '</span><span class="num">' + (x.total != null ? won(x.total) + '원' : '') + '</span></div></button></li>';
    }).join('') : '<li class="empty">해당하는 견적이 없습니다.</li>';
    $$('#ql button').forEach(function (b) { b.onclick = function () { location.hash = '#' + b.dataset.id; }; });
    $$('#ql .pk').forEach(function (c) { c.onchange = function () { if (c.checked) S.picked[c.dataset.id] = 1; else delete S.picked[c.dataset.id]; pickCount(); }; });
    pickCount();
  }

  /* ── 견적 1건 ── */
  function openQuote(id) {
    $('#dm').innerHTML = '<div class="empty">불러오는 중…</div>';
    api('/api/admin/get', { id: id }).then(function (d) { setCur(d); drawList(); }).catch(function (e) { $('#dm').innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
  }
  function setCur(d) {
    S.cur = d; S.dirty = false;
    var r = d.rec;
    S.work = {
      lines: JSON.parse(JSON.stringify(r.quote['내역'])),
      adjust: { amount: +(r.adjust || {}).amount || 0, reason: (r.adjust || {}).reason || '' },
      customer_note: r.customer_note || '', pm_memo: r.pm_memo || '', email: (r.customer || {}).email || '',
    };
    S.preview = d.final;
    drawDetail();
  }
  function autoBy() {
    var m = {}; ((S.cur.auto || {})['내역'] || []).forEach(function (x) { if (x._k) m[x._k] = x; }); return m;
  }

  function drawDetail() {
    var d = S.cur, r = d.rec, c = r.customer || {}, a = r.args || r.quote.args, ed = d.editable;
    var h = '<button class="btn sm back-to-list" onclick="location.hash=\'#\'">← 목록</button>';
    h += '<div class="head"><h1 class="mono">' + esc(r.id) + '</h1><span class="chip ' + d.status + '">' + esc(d.statusLabel) + '</span>' +
      '<span class="muted small">' + esc(t16(r.created_at)) + ' 접수 · ' + esc(r.source || '') + '</span></div>';

    // 고객 정보
    h += '<div class="card"><h2>고객 정보</h2><div class="kv">';
    INFO.forEach(function (p) { var v = c[p[0]]; if (v) h += '<div><b>' + esc(p[1]) + '</b><span>' + esc(v) + '</span></div>'; });
    h += '</div>';
    if (r.budget_check) h += '<p class="note" style="margin-top:12px;white-space:pre-wrap">' + esc(String(r.budget_check).replace(/\*\*/g, '')) + '</p>';
    if (r.transcript && r.transcript.length) {
      h += '<details style="margin-top:12px"><summary>상담 대화 ' + r.transcript.length + '개 보기</summary><div class="transcript">' +
        r.transcript.map(function (m) { return '<div class="' + (m.role === 'user' ? 'user' : '') + '">' + esc(m.content) + '</div>'; }).join('') + '</div></details>';
    }
    h += '</div>';

    // 견적 조건
    h += '<div class="card"><h2>견적 조건<span class="sp"></span><span class="muted small">조건을 바꾸면 자동 산출부터 다시 계산합니다</span></h2>' +
      '<div class="grid g4"><label class="field"><span>콘텐츠 유형</span><select id="c_type"' + (ed ? '' : ' disabled') + '>' +
      d.types.map(function (t) { return '<option' + (t === a.content_type ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></label>' +
      '<label class="field"><span>차시 수</span><input type="number" id="c_n" min="1" max="200" value="' + a.sessions + '"' + (ed ? '' : ' disabled') + '></label>' +
      '<label class="field"><span>차시당 분량(분)</span><input type="number" id="c_m" min="5" max="120" value="' + a.minutes_per_session + '"' + (ed ? '' : ' disabled') + '></label>' +
      '<label class="field"><span>촬영 일수</span><input type="number" id="c_f" min="0" max="60" value="' + (a.filming_days || 0) + '"' + (ed ? '' : ' disabled') + '></label></div>' +
      '<div class="row" style="margin-top:8px">' +
      [['c_v', 'voice_over', '전문 성우'], ['c_s', 'subtitles', '자막'], ['c_i', 'interaction', '인터랙션']].map(function (x) {
        return '<label class="check"><input type="checkbox" id="' + x[0] + '"' + (a[x[1]] ? ' checked' : '') + (ed ? '' : ' disabled') + '> ' + x[2] + '</label>';
      }).join('') +
      '<span style="width:16px"></span>' +
      ['public', 'private'].map(function (t) { return '<label class="check"><input type="radio" name="c_t" value="' + t + '"' + (r.track === t ? ' checked' : '') + (ed ? '' : ' disabled') + '> ' + esc(d.trackLabels[t]) + '</label>'; }).join('') +
      '<span class="sp" style="flex:1"></span><button class="btn sm" id="recalc"' + (ed ? '' : ' disabled') + '>조건으로 다시 계산</button></div>' +
      (r.quote['임시 산정'] ? '<p class="note warn small" style="margin-top:8px">' + esc(r.quote['임시 산정']) + '</p>' : '') + '</div>';

    // 산출 내역
    var auto = autoBy();
    var pub = r.quote['기준'] !== 'private';
    h += '<div class="card"><h2>산출 내역<span class="chip">' + esc(r.quote['기준명'] || '') + '</span><span class="sp"></span>' +
      (ed ? '<button class="btn sm" id="addl">+ 항목 추가</button><button class="btn sm ghost" id="resetl">자동 산출로 되돌리기</button>' : '') + '</h2>' +
      '<p class="muted small" style="margin:-4px 0 10px">수량·단가를 직접 고치거나 항목을 지우고 더할 수 있습니다. 발행하면 고친 값이 「단가 학습」 표본이 됩니다.' +
      (pub ? ' 공공 기준 노임단가는 고시 금액이라 학습하지 않고, 투입 일수와 직접경비 단가를 학습합니다.' : '') + '</p>' +
      '<div class="scroll-x"><table class="t lines"><thead><tr><th>항목</th><th>구분</th>' + (pub ? '<th>분류</th>' : '') +
      '<th class="r">수량</th><th>단위</th><th class="r">단가</th><th class="r">금액</th><th></th></tr></thead><tbody id="lb"></tbody></table></div></div>';

    // 조정·비고
    h += '<div class="card"><h2>조정·비고</h2><div class="grid g2">' +
      '<label class="field"><span>전체 조정 금액 (공급가액, VAT 별도 · 할인은 음수)</span><input type="number" id="adj" step="100000" value="' + S.work.adjust.amount + '"' + (ed ? '' : ' disabled') + '></label>' +
      '<label class="field"><span>조정 사유 (견적서에 표시)</span><input type="text" id="adjr" maxlength="60" value="' + esc(S.work.adjust.reason) + '"' + (ed ? '' : ' disabled') + '></label>' +
      '<label class="field"><span>고객 견적서 비고</span><textarea id="cn" placeholder="예: 원고는 발주처 제공 기준, 수정 2회 포함"' + (ed ? '' : ' disabled') + '>' + esc(S.work.customer_note) + '</textarea></label>' +
      '<label class="field"><span>내부 메모 (고객에게 보이지 않음)</span><textarea id="pm">' + esc(S.work.pm_memo) + '</textarea></label>' +
      '<label class="field"><span>견적을 받을 이메일</span><input type="email" id="em" value="' + esc(S.work.email) + '"></label></div>' +
      '<p class="muted small">조정 금액은 단가 학습에 쓰지 않습니다. 특정 항목이 비싸거나 싸다면 위 산출 내역에서 그 항목을 고쳐 주세요.</p></div>';

    // 금액
    h += '<div class="card"><h2>금액</h2><div id="sum"></div></div>';

    // 발행
    h += '<div class="card"><h2>발행</h2><div id="iss"></div></div>';

    h += '<div id="delcard"></div>';

    // 기록
    h += '<div class="card"><h2>처리 기록</h2><ul class="hist">' + (r.history || []).slice().reverse().map(function (x) {
      return '<li><span class="mono muted">' + esc(t16(x.at)) + '</span><span>' + esc(x.action) + '</span><span class="muted">' + esc(x.by || '') + '</span></li>';
    }).join('') + '</ul></div>';

    h += '<div class="sticky-actions"><button class="btn primary" id="save">저장</button><span class="muted small" id="dirty"></span><span style="flex:1"></span>' +
      '<button class="btn" id="xl">내부 검토용 엑셀</button>' + (d.link ? '<a class="btn" href="' + esc(d.link) + '" target="_blank" rel="noopener">고객 화면 열기</a>' : '') + '</div>';

    $('#dm').innerHTML = h;
    drawLines(); drawSum(); drawIssue(); drawDeleteCard();
    bindDetail();
  }

  function drawLines() {
    var d = S.cur, ed = d.editable, pub = d.rec.quote['기준'] !== 'private', auto = autoBy();
    $('#lb').innerHTML = S.work.lines.map(function (x, i) {
      var au = x._k ? auto[x._k] : null;
      var chQ = au && Number(au['수량']) !== Number(x['수량']), chP = au && Number(au['단가']) !== Number(x['단가']);
      var dis = ed ? '' : ' disabled';
      return '<tr data-i="' + i + '" class="' + (!x._k || chQ || chP ? 'changed' : '') + '">' +
        '<td><input class="w-name" data-f="항목" value="' + esc(x['항목']) + '"' + dis + '>' + (!x._k ? '<span class="was" style="text-align:left">PM 추가 항목</span>' : '') + '</td>' +
        '<td><input class="w-cat" data-f="구분" value="' + esc(x['구분']) + '"' + dis + '></td>' +
        (pub ? '<td><select data-f="_c"' + dis + '><option value="L"' + (x._c !== 'X' ? ' selected' : '') + '>인건비</option><option value="X"' + (x._c === 'X' ? ' selected' : '') + '>직접경비</option></select></td>' : '') +
        '<td><input class="w-num num" type="number" step="any" min="0" data-f="수량" value="' + x['수량'] + '"' + dis + '>' + (chQ ? '<span class="was">자동 ' + num(au['수량']) + '</span>' : '') + '</td>' +
        '<td><input class="w-unit" data-f="단위" value="' + esc(x['단위']) + '"' + dis + '></td>' +
        '<td><input class="w-num num" type="number" step="1" data-f="단가" value="' + x['단가'] + '"' + dis + '>' + (chP ? '<span class="was">자동 ' + won(au['단가']) + '</span>' : '') + '</td>' +
        '<td class="r num" data-amt>' + won(Math.round(Number(x['수량']) * Number(x['단가']))) + '</td>' +
        '<td>' + (ed ? '<button class="btn sm ghost danger" data-del title="이 항목 지우기" aria-label="이 항목 지우기">✕</button>' : '') + '</td></tr>';
    }).join('');
    var removed = ((S.cur.auto || {})['내역'] || []).filter(function (a) { return a._k && !S.work.lines.some(function (x) { return x._k === a._k; }); });
    if (removed.length) {
      $('#lb').insertAdjacentHTML('beforeend', '<tr><td colspan="8" class="small muted">지운 자동 항목: ' + removed.map(function (a) {
        return esc(a['항목']) + (ed ? ' <button class="btn sm ghost" data-restore="' + esc(a._k) + '">되살리기</button>' : '');
      }).join(' · ') + '</td></tr>');
    }
  }

  function drawSum() {
    var q = S.preview, r = S.cur.rec, auto = r.auto_total || ((S.cur.auto || {})['합계']);
    var h = '<div class="sumbox">';
    (q['집계'] || []).forEach(function (s) { h += '<span>' + esc(s[0]) + '</span><span class="num">' + won(s[1]) + '원</span>'; });
    h += '<span>공급가액</span><span class="num">' + won(q['공급가액']) + '원</span><span>부가세</span><span class="num">' + won(q['부가세']) + '원</span>' +
      '<span class="big">합계 (VAT 포함)</span><span class="big num">' + won(q['합계']) + '원</span>' +
      '<span class="muted">차시당 (VAT 별도)</span><span class="num muted">' + won(q['차시당 단가']) + '원</span>';
    if (auto) {
      var diff = q['합계'] - auto, pct = auto ? Math.round(diff / auto * 1000) / 10 : 0;
      h += '<span class="muted">처음 자동 산출 합계</span><span class="num muted">' + won(auto) + '원' +
        (diff ? ' <span class="' + (diff > 0 ? 'diff-up' : 'diff-down') + '">(' + (diff > 0 ? '+' : '') + won(diff) + '원, ' + (pct > 0 ? '+' : '') + pct + '%)</span>' : '') + '</span>';
    }
    h += '</div>';
    if (q['PM상담']) h += '<p class="note warn small" style="margin-top:10px">규모가 커서 PM 직접 상담 대상입니다.</p>';
    $('#sum').innerHTML = h;
  }

  function drawIssue() {
    var d = S.cur, r = d.rec, st = d.status, h = '';
    if (!d.mail) h += '<p class="note warn small">견적 서버에 메일 설정(SMTP)이 없어 고객에게 메일이 가지 않습니다. 발행 뒤 링크를 복사해 직접 보내 주세요.</p>';
    if (d.editable) {
      h += '<p class="small muted">승인하면 고객 이메일로 견적서 링크가 갑니다. 링크는 ' + d.validDays + '일 동안 열립니다.</p><div class="row">' +
        '<button class="btn lime" id="a_issue">승인하고 고객에게 발송</button>' + (st === 'pending' ? '<button class="btn" id="a_hold">보류</button>' : '<button class="btn" id="a_pending">검토 대기로</button>') + '</div>';
    } else {
      h += '<div class="row"><input type="text" readonly id="lnk" value="' + esc(d.link || '') + '" style="flex:1;min-width:220px"><button class="btn sm" id="cp">링크 복사</button></div>' +
        '<p class="small muted">유효기간 ' + esc(String(r.expires_at || '').slice(0, 10)) + '까지 · ' + (r.viewed_at ? '고객 열람 ' + esc(t16(r.viewed_at)) : '아직 열람 안 함') + '</p><div class="row">' +
        '<button class="btn" id="a_resend"' + (st !== 'issued' ? ' disabled' : '') + '>메일 다시 보내기</button>' +
        '<button class="btn" id="a_extend">' + d.validDays + '일 연장해 재발송</button>' +
        '<button class="btn danger" id="a_revoke"' + (st === 'revoked' ? ' disabled' : '') + '>링크 회수</button>' +
        (st === 'revoked' || st === 'expired' ? '<button class="btn" id="a_pending">검토 대기로 되돌리기 (수정 후 다시 발행)</button>' : '') + '</div>';
    }
    $('#iss').innerHTML = h;
  }

  /* 입력 → 미리 계산 (저장하지 않음) */
  var pvTimer = null;
  function markDirty() {
    S.dirty = true; $('#dirty').textContent = '저장하지 않은 수정이 있습니다';
    clearTimeout(pvTimer); pvTimer = setTimeout(preview, 350);
  }
  function payload(extra) {
    var w = S.work, o = { id: S.cur.rec.id, adjust: w.adjust, customer_note: w.customer_note, pm_memo: w.pm_memo, email: w.email };
    if (S.cur.editable) o.lines = w.lines;
    for (var k in extra) o[k] = extra[k];
    return o;
  }
  function preview() {
    if (!S.cur.editable) return;
    api('/api/admin/save', payload({ dry: true })).then(function (d) { S.preview = d.final; drawSum(); }).catch(function (e) { $('#sum').insertAdjacentHTML('afterbegin', '<p class="note bad small">' + esc(e.message) + '</p>'); });
  }
  function save(extra) {
    return api('/api/admin/save', payload(extra)).then(function (d) { setCur(d); loadList(); toast('저장했습니다.'); return d; });
  }

  function bindDetail() {
    var root = $('#dm');
    $('#lb').addEventListener('input', function (e) {
      var tr = e.target.closest('tr[data-i]'); if (!tr) return;
      var x = S.work.lines[+tr.dataset.i], f = e.target.dataset.f;
      x[f] = (f === '수량' || f === '단가') ? (e.target.value === '' ? 0 : Number(e.target.value)) : e.target.value;
      $('[data-amt]', tr).textContent = won(Math.round(Number(x['수량']) * Number(x['단가'])));
      markDirty();
    });
    $('#lb').addEventListener('change', function (e) { if (e.target.tagName === 'SELECT') { S.work.lines[+e.target.closest('tr').dataset.i]._c = e.target.value; markDirty(); } });
    $('#lb').addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-del')) { S.work.lines.splice(+e.target.closest('tr').dataset.i, 1); drawLines(); markDirty(); }
      var k = e.target.getAttribute('data-restore');
      if (k) { var a = autoBy()[k]; if (a) { S.work.lines.push(JSON.parse(JSON.stringify(a))); drawLines(); markDirty(); } }
    });
    if ($('#addl')) $('#addl').onclick = function () {
      var pub = S.cur.rec.quote['기준'] !== 'private';
      S.work.lines.push(pub ? { '항목': '', '구분': '직접경비', '수량': 1, '단위': '식', '단가': 0, _c: 'X' } : { '항목': '', '구분': '추가', '수량': 1, '단위': '식', '단가': 0 });
      drawLines(); markDirty();
      var ins = $$('#lb tr[data-i] input.w-name'); ins[ins.length - 1].focus();
    };
    if ($('#resetl')) $('#resetl').onclick = function () {
      confirmBox('자동 산출로 되돌릴까요?', '산출 내역에서 고친 수량·단가와 추가·삭제한 항목이 모두 처음 자동 산출 값으로 돌아갑니다.', '되돌리기')
        .then(function (ok) { if (ok) save({ reset_lines: true, lines: undefined }).catch(fail); });
    };
    $('#recalc').onclick = function () {
      var args = { content_type: $('#c_type').value, sessions: +$('#c_n').value, minutes_per_session: +$('#c_m').value, filming_days: +$('#c_f').value,
        voice_over: $('#c_v').checked, subtitles: $('#c_s').checked, interaction: $('#c_i').checked };
      var track = ($('input[name=c_t]:checked') || {}).value;
      var edited = S.cur.rec.quote._edited;
      (edited ? confirmBox('조건으로 다시 계산할까요?', '산출 내역에서 고친 값은 사라지고, 새 조건의 자동 산출부터 다시 시작합니다.', '다시 계산') : Promise.resolve(true))
        .then(function (ok) { if (ok) return save({ args: args, track: track, lines: undefined }); }).catch(fail);
    };
    var bindVal = function (sel, fn) { var el = $(sel); if (el) el.addEventListener('input', function () { fn(el.value); markDirty(); }); };
    bindVal('#adj', function (v) { S.work.adjust.amount = Math.trunc(Number(v) || 0); });
    bindVal('#adjr', function (v) { S.work.adjust.reason = v; });
    bindVal('#cn', function (v) { S.work.customer_note = v; });
    bindVal('#pm', function (v) { S.work.pm_memo = v; });
    bindVal('#em', function (v) { S.work.email = v; });
    $('#save').onclick = function () { this.disabled = true; var b = this; save().catch(fail).then(function () { b.disabled = false; }); };
    $('#xl').onclick = internalExcel;

    var act = function (action, title, body, label) {
      var run = function () {
        var p = S.dirty ? save() : Promise.resolve();
        return p.then(function () { return api('/api/admin/act', { id: S.cur.rec.id, action: action }); }).then(function (d) {
          setCur(d); loadList();
          var m = d.mailResult;
          if (m && !m.ok) toast('처리했지만 메일을 보내지 못했습니다(' + m.why + '). 링크를 복사해 직접 보내 주세요.');
          else toast(m ? '고객에게 견적 링크를 보냈습니다.' : '처리했습니다.');
        }).catch(fail);
      };
      return function () { if (!title) return run(); confirmBox(title, body, label).then(function (ok) { if (ok) run(); }); };
    };
    var bind = function (id, fn) { var el = $(id, root); if (el) el.onclick = fn; };
    bind('#a_issue', act('issue', '승인하고 고객에게 발송할까요?', esc(S.work.email || '(이메일 없음)') + ' 로 견적서 링크를 보냅니다. 합계 <b>' + won(S.preview['합계']) + '원</b>', '발송'));
    bind('#a_hold', act('hold'));
    bind('#a_pending', act('pending'));
    bind('#a_resend', act('resend', '메일을 다시 보낼까요?', '같은 링크를 고객에게 다시 보냅니다.', '보내기'));
    bind('#a_extend', act('extend', '유효기간을 연장할까요?', '오늘부터 ' + S.cur.validDays + '일 동안 열리도록 연장하고 고객에게 다시 보냅니다.', '연장·발송'));
    bind('#a_revoke', act('revoke', '링크를 회수할까요?', '고객이 더 이상 견적서를 열 수 없게 됩니다.', '회수'));
    bind('#cp', function () { var i = $('#lnk'); i.select(); (navigator.clipboard ? navigator.clipboard.writeText(i.value) : Promise.reject()).then(function () { toast('링크를 복사했습니다.'); }, function () { document.execCommand('copy'); toast('링크를 복사했습니다.'); }); });
  }

  /* ── 삭제 (슈퍼관리자) ── */
  function pickCount() {
    var n = Object.keys(S.picked).length, el = $('#pickn'), b = $('#delpick');
    if (el) el.textContent = '선택 ' + n + '건';
    if (b) b.disabled = !n;
  }
  function drawDeleteCard() {
    var box = $('#delcard'); if (!box || !S.cur) return;
    box.innerHTML = S.canDelete ? '<div class="card" style="border-color:var(--bad)"><h2>견적 삭제 <span class="chip revoked">슈퍼관리자</span></h2>' +
      '<p class="small muted" style="margin:0 0 10px">허위·장난 접수를 지웁니다. 지우면 목록과 단가 학습에서 빠지고 되살릴 수 없습니다. 견적번호·시각·사유만 「삭제 기록」에 남습니다.</p>' +
      '<button class="btn danger" id="del1">이 견적 삭제</button></div>' : '';
    if ($('#del1')) $('#del1').onclick = function () { deleteFlow([S.cur.rec.id]); };
  }
  function deleteFlow(ids) {
    if (!ids.length) return;
    var info = ids.map(function (id) { return S.items.filter(function (x) { return x.id === id; })[0] || { id: id }; });
    var issued = info.filter(function (x) { return x.status === 'issued'; });
    var m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = '<form class="box" role="dialog" aria-modal="true"><h3>견적 ' + ids.length + '건을 삭제할까요?</h3>' +
      '<ul class="small" style="max-height:160px;overflow:auto;padding-left:18px;margin:8px 0">' + info.map(function (x) {
        return '<li><span class="mono">' + esc(x.id) + '</span> ' + esc(x.client_name || '') + (x.status ? ' · ' + STATUS[x.status] : '') + '</li>';
      }).join('') + '</ul>' +
      (issued.length ? '<p class="note bad small">' + issued.length + '건은 고객에게 발행 중입니다. 지우면 고객의 견적서 링크가 바로 열리지 않습니다.</p>' : '') +
      '<label class="field" style="margin-top:8px"><span>삭제 사유 (기록에 남음)</span><input type="text" name="reason" maxlength="100" value="허위·장난 접수" required></label>' +
      '<label class="field" style="margin-top:8px"><span>확인을 위해 <b>삭제</b>라고 입력해 주세요</span><input type="text" name="ok" autocomplete="off"></label>' +
      '<p class="note bad small" style="margin-top:10px">삭제하면 되살릴 수 없습니다.</p>' +
      '<div class="row" style="justify-content:flex-end;margin-top:8px"><button type="button" class="btn" data-x>취소</button><button class="btn primary" style="background:var(--bad);border-color:var(--bad)">삭제</button></div></form>';
    document.body.appendChild(m);
    var f = $('form', m);
    $('[data-x]', m).onclick = function () { m.remove(); };
    f.ok.focus();
    f.onsubmit = function (e) {
      e.preventDefault();
      if (f.ok.value.trim() !== '삭제') { f.ok.focus(); return toast('확인 칸에 「삭제」라고 입력해 주세요.'); }
      if (!f.reason.value.trim()) return toast('삭제 사유를 적어 주세요.');
      var btn = $('button.primary', m); btn.disabled = true;
      api('/api/admin/delete', { ids: ids, reason: f.reason.value.trim(), force_issued: issued.length > 0 }).then(function (j) {
        m.remove();
        j.deleted.forEach(function (id) { delete S.picked[id]; });
        toast(j.deleted.length + '건을 삭제했습니다.' + (j.missing.length ? ' (' + j.missing.length + '건은 이미 없었습니다)' : ''));
        S.dirty = false;
        if (S.cur && j.deleted.indexOf(S.cur.rec.id) >= 0) { S.cur = null; location.hash = '#'; }
        loadList();
      }).catch(function (er) { btn.disabled = false; fail(er); });
    };
  }
  function showDeletedLog() {
    api('/api/admin/deleted').then(function (j) {
      var m = document.createElement('div'); m.className = 'modal';
      m.innerHTML = '<div class="box" style="max-width:560px"><h3>삭제 기록</h3>' + (j.items.length ? '<div class="scroll-x" style="max-height:60vh;overflow:auto"><table class="t"><thead><tr><th>견적번호</th><th>삭제 시각</th><th>사유</th><th>삭제한 사람</th></tr></thead><tbody>' +
        j.items.map(function (x) { return '<tr><td class="mono">' + esc(x.id) + '</td><td class="mono small">' + esc(t16(x.at)) + '</td><td>' + esc(x.reason) + '</td><td>' + esc(x.by) + '</td></tr>'; }).join('') +
        '</tbody></table></div>' : '<p class="muted">지운 견적이 없습니다.</p>') + '<div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" data-x>닫기</button></div></div>';
      document.body.appendChild(m);
      m.onclick = function (e) { if (e.target === m || e.target.hasAttribute('data-x')) m.remove(); };
    }).catch(fail);
  }

  /* ── 엑셀 ── */
  function loadXLSX(cb) {
    if (window.XLSX) return cb();
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = cb; s.onerror = function () { toast('엑셀 도구를 불러오지 못했습니다.'); };
    document.head.appendChild(s);
  }
  function internalExcel() {
    loadXLSX(function () {
      var r = S.cur.rec, q = S.preview, c = r.customer || {}, auto = autoBy(), rows = [];
      rows.push(['내부 검토용 견적 (고객에게 보내지 마세요)'], ['견적번호', r.id, '상태', S.cur.statusLabel], ['적용 기준', q['기준명']], []);
      rows.push(['고객 정보']); INFO.forEach(function (p) { if (c[p[0]]) rows.push([p[1], c[p[0]]]); });
      rows.push([], ['제작 조건']); Object.keys(q['조건']).forEach(function (k) { rows.push([k, q['조건'][k]]); });
      rows.push([], ['산출 내역'], ['항목', '구분', '수량', '단위', '단가', '금액', '자동 수량', '자동 단가', '비고']);
      q['내역'].forEach(function (x) {
        var a = x._k ? auto[x._k] : null;
        rows.push([x['항목'], x['구분'], x['수량'], x['단위'], x['단가'], x['금액'], a ? a['수량'] : '', a ? a['단가'] : '', x['구분'] === '조정' ? '' : (!x._k ? 'PM 추가' : (a && (a['수량'] !== x['수량'] || a['단가'] !== x['단가']) ? 'PM 수정' : ''))]);
      });
      rows.push([], ['금액']); q['집계'].forEach(function (s) { rows.push([s[0], s[1]]); });
      rows.push(['공급가액', q['공급가액']], ['부가세', q['부가세']], ['합계', q['합계']], ['처음 자동 산출 합계', r.auto_total]);
      if (r.pm_memo) rows.push([], ['내부 메모', r.pm_memo]);
      var ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [{ wch: 28 }, { wch: 20 }, { wch: 10 }, { wch: 8 }, { wch: 13 }, { wch: 15 }, { wch: 10 }, { wch: 13 }, { wch: 10 }];
      var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, '검토');
      XLSX.writeFile(wb, '검토_' + r.id + '.xlsx');
    });
  }

  /* ── 단가 학습 ── */
  function fmtVal(key, v) { return v == null ? '-' : (key[0] === 'P' || key[0] === 'D') ? won(v) : num(v); }
  function learnView() {
    var body = $('#body');
    body.innerHTML = '<section class="main" style="max-width:1200px;margin:0 auto"><div class="empty">발행된 견적을 모으는 중…</div></section>';
    api('/api/admin/rates').then(function (L) { S.learn = L; drawLearn(); }).catch(function (e) { $('.main', body).innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
  }
  function drawLearn() {
    var L = S.learn, main = $('#body .main');
    var sug = L.rows.filter(function (r) { return r.suggest != null; });
    var h = '<div class="head"><h1>단가 학습</h1><span class="muted small">발행된 견적 ' + L.issued + '건 기준</span></div>';
    h += '<div class="card"><h2>어떻게 학습하나요</h2><p class="small" style="margin:0">PM이 발행한 견적의 산출 내역(고친 수량·단가 포함)을 모아, 항목마다 <b>중앙값</b>을 냅니다. ' +
      '표본이 <b>' + L.minN + '건 이상</b>이고 지금 값과 <b>' + Math.round(L.threshold * 100) + '% 이상</b> 다르면 아래에 조정안으로 올라옵니다. ' +
      '[반영]을 눌러야 단가표가 바뀌고, 그다음 접수되는 견적부터 새 값으로 자동 산출됩니다. 반영한 뒤에는 그 뒤에 발행된 견적만 다시 표본으로 씁니다.</p>' +
      '<div class="stat" style="margin-top:12px"><div><span class="muted small">공공 기준 · PM 최종/자동</span><b>' + (L.ratio.public.avg ? Math.round(L.ratio.public.avg * 1000) / 10 + '%' : '-') + '</b><span class="muted small">' + L.ratio.public.n + '건</span></div>' +
      '<div><span class="muted small">기업 기준 · PM 최종/자동</span><b>' + (L.ratio.private.avg ? Math.round(L.ratio.private.avg * 1000) / 10 + '%' : '-') + '</b><span class="muted small">' + L.ratio.private.n + '건</span></div></div></div>';

    h += '<div class="card"><h2>조정안 <span class="chip">' + sug.length + '</span><span class="sp"></span>' + (sug.length ? '<button class="btn lime sm" id="apply">선택한 조정안 반영</button>' : '') + '</h2>';
    if (!sug.length) h += '<p class="muted small" style="margin:0">아직 조정안이 없습니다. 견적을 발행할수록 쌓입니다.</p>';
    else {
      h += '<div class="scroll-x"><table class="t learn"><thead><tr><th><input type="checkbox" id="all" checked aria-label="모두 선택"></th><th>구분</th><th>항목</th><th class="r">지금 값</th><th class="r">표본 중앙값</th><th class="r">범위</th><th class="r">표본(수정)</th><th class="r">반영할 값</th></tr></thead><tbody>' +
        sug.map(function (r) {
          return '<tr data-k="' + esc(r.key) + '" data-n="' + r.n + '"><td><input type="checkbox" class="pick" checked aria-label="선택"></td><td class="small">' + esc(r.group) + '</td><td>' + esc(r.label) + ' <span class="muted small">' + esc(r.unit) + '</span>' +
            (r.suggest === 0 ? '<br><span class="small" style="color:var(--warn)">0으로 반영하면 이 유형 견적에서 이 항목이 빠집니다</span>' : '') + '</td>' +
            '<td class="r num">' + fmtVal(r.key, r.current) + '</td><td class="r num"><b>' + fmtVal(r.key, r.median) + '</b> <span class="' + (r.diff > 0 ? 'diff-up' : 'diff-down') + ' small">' + (r.diff > 0 ? '+' : '') + Math.round(r.diff * 1000) / 10 + '%</span></td>' +
            '<td class="r num small muted">' + fmtVal(r.key, r.min) + '~' + fmtVal(r.key, r.max) + '</td><td class="r num">' + r.n + '(' + r.edited + ')</td>' +
            '<td class="r"><input type="number" step="any" min="0" class="val num" value="' + r.suggest + '"></td></tr>';
        }).join('') + '</tbody></table></div>';
    }
    h += '</div>';

    var groups = {};
    L.rows.forEach(function (r) { (groups[r.track] = groups[r.track] || []).push(r); });
    h += '<div class="card"><h2>지금 적용 중인 단가표<span class="sp"></span><button class="btn sm" id="xlr">바뀐 값 엑셀로</button></h2>' +
      '<p class="muted small" style="margin:-4px 0 10px">기업 기준 원본은 업무별_단가표.xlsx, 공공 기준은 KOSA 노임단가와 기본 투입 일수입니다. 여기서 바꾼 값은 원본 위에 덧씌워 적용됩니다. ' +
      '원본 엑셀도 맞춰 두려면 「바뀐 값 엑셀로」를 내려받아 옮겨 적어 주세요.</p>';
    [['private', '기업·개인 기준'], ['public', '공공기관 기준']].forEach(function (t) {
      var rows = groups[t[0]] || [];
      if (!rows.length) { if (t[0] === 'private') h += '<p class="note small">기업 단가표(RATES_JSON)가 아직 없습니다.</p>'; return; }
      h += '<details' + (t[0] === 'private' ? ' open' : '') + ' style="margin-top:8px"><summary><b>' + t[1] + '</b> · ' + rows.length + '개 값</summary><div class="scroll-x"><table class="t learn" style="margin-top:8px"><thead><tr><th>구분</th><th>항목</th><th class="r">원본</th><th class="r">지금 값</th><th class="r">표본 중앙값</th><th class="r">표본</th><th></th></tr></thead><tbody>' +
        rows.map(function (r) {
          return '<tr data-k="' + esc(r.key) + '"><td class="small">' + esc(r.group) + '</td><td>' + esc(r.label) + ' <span class="muted small">' + esc(r.unit) + '</span></td>' +
            '<td class="r num muted">' + fmtVal(r.key, r.base) + '</td><td class="r num">' + (r.overridden ? '<b>' + fmtVal(r.key, r.current) + '</b>' : fmtVal(r.key, r.current)) + '</td>' +
            '<td class="r num">' + (r.n ? fmtVal(r.key, r.median) : '-') + '</td><td class="r num">' + (r.n || '') + '</td>' +
            '<td class="r" style="white-space:nowrap"><button class="btn sm ghost" data-edit>직접 수정</button>' + (r.overridden ? '<button class="btn sm ghost" data-reset>원본으로</button>' : '') + '</td></tr>';
        }).join('') + '</tbody></table></div></details>';
    });
    h += '</div>';

    if (L.added.length) {
      h += '<div class="card"><h2>PM이 자주 추가한 항목</h2><p class="muted small" style="margin:-4px 0 10px">단가표에 없는 항목입니다. 자주 쓰면 업무별_단가표.xlsx 에 항목으로 넣는 것을 검토해 주세요.</p>' +
        '<table class="t"><thead><tr><th>항목</th><th class="r">횟수</th><th class="r">단가 중앙값</th><th>견적</th></tr></thead><tbody>' +
        L.added.map(function (a) { return '<tr><td>' + esc(a.name) + '</td><td class="r num">' + a.n + '</td><td class="r num">' + won(a.median) + '</td><td class="small mono">' + a.ids.map(function (i) { return '<a href="#' + esc(i) + '">' + esc(i) + '</a>'; }).join(' ') + '</td></tr>'; }).join('') + '</tbody></table></div>';
    }
    if (L.history.length) {
      var label = {}; L.rows.forEach(function (r) { label[r.key] = r.group + ' · ' + r.label; });
      h += '<div class="card"><h2>반영 기록</h2><ul class="hist">' + L.history.map(function (x) {
        return '<li><span class="mono muted">' + esc(t16(x.at)) + '</span><span>' + esc(label[x.key] || x.key) + ': ' + (x.from == null ? '원본' : fmtVal(x.key, x.from)) + ' → ' + (x.to == null ? '원본' : fmtVal(x.key, x.to)) + (x.n ? ' (표본 ' + x.n + '건)' : '') + '</span></li>';
      }).join('') + '</ul></div>';
    }
    main.innerHTML = h;

    var setRates = function (changes, msg) {
      return api('/api/admin/rates/set', { changes: changes }).then(function () { toast(msg); learnView(); }).catch(fail);
    };
    if ($('#all')) $('#all').onchange = function () { var on = this.checked; $$('.pick').forEach(function (c) { c.checked = on; }); };
    if ($('#apply')) $('#apply').onclick = function () {
      var ch = $$('tr[data-n]').filter(function (tr) { return $('.pick', tr).checked; }).map(function (tr) { return { key: tr.dataset.k, value: Number($('.val', tr).value), n: +tr.dataset.n }; });
      if (!ch.length) return toast('반영할 항목을 고르세요.');
      confirmBox('조정안 ' + ch.length + '건을 반영할까요?', '다음에 접수되는 견적부터 새 값으로 자동 산출됩니다. 이미 접수된 견적은 바뀌지 않습니다.', '반영')
        .then(function (ok) { if (ok) setRates(ch, ch.length + '건을 단가표에 반영했습니다.'); });
    };
    $$('[data-edit]').forEach(function (b) {
      b.onclick = function () {
        var k = b.closest('tr').dataset.k, r = L.rows.filter(function (x) { return x.key === k; })[0];
        var v = window.prompt(r.group + ' · ' + r.label + ' (' + r.unit + ')\n새 값을 넣어 주세요. 지금 값: ' + r.current, r.current);
        if (v === null || v === '') return;
        if (!isFinite(Number(v))) return toast('숫자를 넣어 주세요.');
        setRates([{ key: k, value: Number(v), note: '직접 수정' }], '바꿨습니다.');
      };
    });
    $$('[data-reset]').forEach(function (b) {
      b.onclick = function () { setRates([{ key: b.closest('tr').dataset.k, value: null }], '원본 값으로 되돌렸습니다.'); };
    });
    $('#xlr').onclick = function () {
      loadXLSX(function () {
        var rows = [['구분', '항목', '단위', '코드', '원본', '지금 값']];
        L.rows.filter(function (r) { return r.overridden; }).forEach(function (r) { rows.push([r.group, r.label, r.unit, r.key, r.base, r.current]); });
        if (rows.length === 1) return toast('원본과 다른 값이 없습니다.');
        var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), '바뀐 단가');
        XLSX.writeFile(wb, '단가표_변경값_' + new Date().toISOString().slice(0, 10) + '.xlsx');
      });
    };
  }

  if (!API) { app.innerHTML = '<div class="login"><h1>견적 검토</h1><p class="note bad">assets/js/config.js 의 quoteApi(견적 서버 주소)가 비어 있습니다.</p></div>'; return; }
  route();
})();
