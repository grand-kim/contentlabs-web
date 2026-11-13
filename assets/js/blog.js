/* 블로그 최신 글 — 푸터 위 「블로그」 영역 (#blog)
 * assets/js/config.js 의 blog.naver(네이버 블로그 아이디)·blog.tistory(티스토리 이름)를 넣으면
 * 두 블로그의 최신 글을 합쳐 날짜순으로 보여 줍니다. 글을 불러오는 일은 견적 상담 서버(quoteApi)의 /api/blog 가 합니다.
 * 아이디가 비어 있거나 글이 아직 없으면 「곧 첫 글이 올라옵니다」 안내 카드가 나옵니다. */
(() => {
  const box = document.getElementById('blogList');
  if (!box) return;
  const CFG = window.CL_CONFIG || {};
  const B = CFG.blog || {};
  const API = String(B.api || CFG.quoteApi || '').trim().replace(/\/$/, '');
  const naver = String(B.naver || '').trim(), tistory = String(B.tistory || '').trim();
  const count = Math.min(6, Math.max(1, +B.count || 3));
  const SRC = {
    naver: { name: '네이버 블로그', mark: 'N', home: id => `https://blog.naver.com/${id}` },
    tistory: { name: '티스토리', mark: 'T', home: id => `https://${id}.tistory.com` },
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = u => (/^https:\/\//.test(String(u || '')) ? u : '#');

  // 블로그 바로가기 버튼
  for (const [k, id] of [['naver', naver], ['tistory', tistory]]) {
    const a = document.getElementById(k === 'naver' ? 'blogNaver' : 'blogTistory');
    if (a && id) { a.href = SRC[k].home(id); a.hidden = false; }
  }

  const fmtDate = iso => { if (!iso) return ''; const d = new Date(iso); return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`; };

  function card(p) {
    const s = SRC[p.source] || SRC.naver;
    const also = (p.also || []).map(a => `<a class="bl-also" href="${esc(safeUrl(a.link))}" target="_blank" rel="noopener">${esc((SRC[a.source] || {}).name || '')}에서도 보기</a>`).join('');
    return `<article class="bl-card">
      <a class="bl-main" href="${esc(safeUrl(p.link))}" target="_blank" rel="noopener">
        <div class="bl-thumb ${esc(p.source)}">${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}<span class="bl-mark" aria-hidden="true">${s.mark}</span></div>
        <div class="bl-meta"><span class="bl-src ${esc(p.source)}">${s.name}</span>${p.category ? `<span>${esc(p.category)}</span>` : ''}${p.date ? `<time datetime="${esc(p.date)}">${fmtDate(p.date)}</time>` : ''}</div>
        <h3>${esc(p.title)}</h3>
        ${p.summary ? `<p>${esc(p.summary)}</p>` : ''}
      </a>${also}
    </article>`;
  }

  const SOON = [
    ['제작 사례', '과정 기획부터 촬영·개발까지, 실제로 만든 과정을 소개합니다.'],
    ['교육 트렌드', '이러닝·에듀테크의 새로운 형식과 도구를 정리합니다.'],
    ['발주 준비 팁', '제안요청서와 견적을 준비하는 담당자를 위한 실무 팁을 담습니다.'],
  ];
  const soon = () => {
    box.innerHTML = SOON.slice(0, count).map(([t, d]) => `<article class="bl-card soon"><div class="bl-thumb"><span class="bl-mark" aria-hidden="true">B</span></div><div class="bl-meta"><span>곧 첫 글이 올라옵니다</span></div><h3>${t}</h3><p>${d}</p></article>`).join('');
  };
  const render = posts => { if (posts && posts.length) box.innerHTML = posts.map(card).join(''); else soon(); };

  if (!API || (!naver && !tistory)) { soon(); return; }
  const q = `naver=${encodeURIComponent(naver)}&tistory=${encodeURIComponent(tistory)}&n=${count}`;
  const KEY = 'cl-blog:' + q;
  try { const c = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (c && Date.now() - c.t < 600000) { render(c.posts); return; } } catch { /* */ }
  soon();
  box.setAttribute('aria-busy', 'true');
  const load = () => fetch(`${API}/api/blog?${q}`).then(r => (r.ok ? r.json() : null)).then(d => {
    box.removeAttribute('aria-busy');
    if (!d) return;
    render(d.posts);
    try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), posts: d.posts })); } catch { /* */ }
  }).catch(() => box.removeAttribute('aria-busy'));
  // 블로그 영역이 화면 가까이 왔을 때 불러옴
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: '600px' });
    io.observe(box);
  } else load();
})();
