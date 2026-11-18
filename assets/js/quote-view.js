/* 고객 견적서 화면 — 메일로 받은 링크 quote.html?q=견적번호.토큰
 * 담당 PM이 발행한 견적만 보이고, 유효기간이 지나거나 링크를 회수하면 내용이 보이지 않습니다.
 * PDF는 브라우저 인쇄(「PDF로 저장」), 엑셀은 이 화면에서 바로 만듭니다. */
(function () {
  'use strict';
  var API = String((window.CL_CONFIG || {}).quoteApi || '').replace(/\/$/, '');
  var app = document.getElementById('app');
  var key = new URLSearchParams(location.search).get('q') || '';
  var data = null;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function won(n) { return Math.trunc(Number(n) || 0).toLocaleString('ko-KR'); }
  function qty(n) { return typeof n === 'number' && Number.isInteger(n) ? n.toLocaleString('ko-KR') : String(n); }
  function day(s) { return String(s || '').slice(0, 10); }

  function state(title, body, cta) {
    app.innerHTML = '<div class="paper state"><h1>' + esc(title) + '</h1><p class="muted">' + body + '</p>' +
      (cta ? '<p><a class="btn primary" href="/#contact">견적 다시 요청하기</a></p>' : '') + '</div>';
  }

  function render(d) {
    data = d;
    document.title = '견적서 ' + d.id + ' | 콘텐츠랩스';
    var c = d.customer || {};
    var meta = [['견적번호', d.id], ['견적일', day(d.issued_at)], ['수신', c.client_name], ['유효기간', day(d.expires_at) + ' 까지'],
      ['과정명', c.course_title], ['적용 기준', d.track_label]];
    if (c.format) meta.push(['제작 포맷', c.format], ['', '']);
    var h = '<div class="doc-actions no-print">' +
      '<button class="btn" type="button" id="xlsx">엑셀 내려받기</button>' +
      '<button class="btn primary" type="button" id="pdf">PDF로 저장·인쇄</button></div>';
    h += '<article class="paper"><h1>이러닝 콘텐츠 제작 견적서</h1><div class="meta">';
    meta.forEach(function (m) { h += '<div class="k">' + esc(m[0]) + '</div><div>' + esc(m[1]) + '</div>'; });
    h += '</div><div class="total"><span>합계 금액 (VAT 포함)</span><span class="num">' + won(d.total) + '원</span></div>';
    h += '<h2>■ 제작 조건</h2><div class="scroll-x"><table class="t"><thead><tr><th>항목</th><th>내용</th></tr></thead><tbody>';
    Object.keys(d.cond || {}).forEach(function (k) { h += '<tr><td>' + esc(k) + '</td><td>' + esc(d.cond[k]) + '</td></tr>'; });
    h += '</tbody></table></div><h2>■ 산출 내역</h2><div class="scroll-x"><table class="t"><thead><tr><th>항목</th><th>구분</th><th class="r">수량</th><th>단위</th>' +
      (d.prices ? '<th class="r">단가</th><th class="r">금액</th>' : '') + '</tr></thead><tbody>';
    d.lines.forEach(function (x) {
      h += '<tr><td>' + esc(x['항목']) + '</td><td>' + esc(x['구분']) + '</td><td class="r num">' + esc(qty(x['수량'])) + '</td><td>' + esc(x['단위']) + '</td>' +
        (d.prices ? '<td class="r num">' + won(x['단가']) + '</td><td class="r num">' + won(x['금액']) + '</td>' : '') + '</tr>';
    });
    h += '</tbody></table></div><h2>■ 금액</h2><table class="t"><tbody>';
    (d.sums || []).forEach(function (s) { h += '<tr><td>' + esc(s[0]) + '</td><td class="r num">' + won(s[1]) + '원</td></tr>'; });
    h += '<tr><td>공급가액</td><td class="r num">' + won(d.supply) + '원</td></tr><tr><td>부가세</td><td class="r num">' + won(d.vat) + '원</td></tr>' +
      '<tr><th>합계</th><th class="r num">' + won(d.total) + '원</th></tr></tbody></table>';
    if (d.note) h += '<h2>■ 비고</h2><p style="white-space:pre-wrap">' + esc(d.note) + '</p>';
    h += '<div class="foot"><p>※ 단가 기준: ' + esc(d.wage_source) + '</p><p>※ 본 견적서는 담당 PM이 검토해 발행한 견적이며, 유효기간 이후에는 다시 요청해 주세요.</p><p>발행: 주식회사 콘텐츠랩스</p></div></article>';
    app.innerHTML = h;
    document.getElementById('pdf').onclick = function () { window.print(); };
    document.getElementById('xlsx').onclick = excel;
  }

  function loadXLSX(cb) {
    if (window.XLSX) return cb();
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = cb; s.onerror = function () { alert('엑셀 도구를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'); };
    document.head.appendChild(s);
  }
  function excel() {
    loadXLSX(function () {
      var d = data, c = d.customer || {}, rows = [];
      rows.push(['이러닝 콘텐츠 제작 견적서'], []);
      rows.push(['견적번호', d.id, '견적일', day(d.issued_at)], ['수신', c.client_name, '유효기간', day(d.expires_at) + ' 까지'], ['과정명', c.course_title, '적용 기준', d.track_label], []);
      rows.push(['합계 금액 (VAT 포함)', d.total], [], ['제작 조건']);
      Object.keys(d.cond).forEach(function (k) { rows.push([k, d.cond[k]]); });
      rows.push([], ['산출 내역'], d.prices ? ['항목', '구분', '수량', '단위', '단가', '금액'] : ['항목', '구분', '수량', '단위']);
      d.lines.forEach(function (x) { rows.push(d.prices ? [x['항목'], x['구분'], x['수량'], x['단위'], x['단가'], x['금액']] : [x['항목'], x['구분'], x['수량'], x['단위']]); });
      rows.push([], ['금액']);
      (d.sums || []).forEach(function (s) { rows.push([s[0], s[1]]); });
      rows.push(['공급가액', d.supply], ['부가세', d.vat], ['합계', d.total]);
      if (d.note) rows.push([], ['비고', d.note]);
      rows.push([], ['단가 기준: ' + d.wage_source], ['발행: 주식회사 콘텐츠랩스']);
      var ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [{ wch: 28 }, { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 16 }];
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '견적서');
      XLSX.writeFile(wb, '견적서_' + d.id + '.xlsx');
    });
  }

  if (!API) return state('견적서를 열 수 없습니다', '견적 서버 주소가 설정되지 않았습니다. 메일로 문의해 주세요.');
  if (!/^CL-\d{4}-\d{4}\.[A-Za-z0-9_-]{10,64}$/.test(key)) return state('견적서를 찾을 수 없습니다', '메일로 받으신 링크 주소가 맞는지 확인해 주세요.');
  fetch(API + '/api/quote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ q: key }) })
    .then(function (r) { return r.json().then(function (j) { return [r.status, j]; }); })
    .then(function (res) {
      var j = res[1];
      if (res[0] !== 200) return state('견적서를 찾을 수 없습니다', esc(j.error || '메일로 받으신 링크 주소가 맞는지 확인해 주세요.'));
      if (j.state === 'pending') return state('검토 중인 견적입니다', '아직 담당 PM이 검토 중입니다. 검토가 끝나면 메일로 다시 안내해 드립니다.');
      if (j.state === 'closed') return state('유효기간이 지난 견적서입니다', '견적번호 ' + esc(j.id) + (j.expired && j.until ? ' · ' + esc(j.until) + '까지 유효했습니다' : '') +
        '<br>같은 조건으로 다시 받으시려면 견적을 새로 요청해 주세요. 담당 PM이 현재 기준으로 다시 검토해 보내 드립니다.', true);
      render(j);
    })
    .catch(function () { state('견적서를 불러오지 못했습니다', '인터넷 연결을 확인한 뒤 새로고침해 주세요.'); });
})();
