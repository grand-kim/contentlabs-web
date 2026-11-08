/* 한글 줄바꿈 다듬기 (2026-11-07)
 * - 음절 단위로 단어가 잘리는 것은 style.css 의 word-break:keep-all 이 막는다.
 * - 이 파일은 그 다음 단계로, 가운뎃점(·)과 여는 괄호 앞뒤에 word joiner(U+2060, 보이지 않는 문자)를
 *   넣어 '현장·실습', '운영(멀티테넌트)' 같은 한 덩어리가 줄 끝에서 끊기지 않게 한다.
 * - 문장 끝 짧은 낱말(3자 이하)은 앞 낱말과 줄바꿈 없는 공백(U+00A0)으로 묶어
 *   '전달', '설명', '시스템'처럼 마지막 줄에 한 낱말만 외따로 떨어지는 것을 막는다. (2026-11-07 추가)
 * - 팝업처럼 자바스크립트로 나중에 그려지는 내용도 MutationObserver 로 같이 처리한다. */
(() => {
  const WJ = '⁠';
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE']);
  const NB = '\u00A0';
  const NEEDS = /[가-힣][·(]|\S\s+\S{1,3}[.!?…]?\s*$/;
  const fix = s => s
    .replace(/([가-힣])·([가-힣])/g, '$1' + WJ + '·' + WJ + '$2')
    .replace(/([가-힣])\(/g, '$1' + WJ + '(')
    // 낱말이 3개 이상인 문장의 마지막 짧은 낱말을 앞 낱말에 붙인다
    .replace(/^([\s\S]*\S)[ \t\n]+(\S{1,3}[.!?…]?\s*)$/, (m, a, b) => /\S\s+\S/.test(a) ? a + NB + b : m);

  function patchText(n) {
    const v = n.nodeValue;
    if (!v || v.indexOf(WJ) > -1 || v.indexOf(NB) > -1 || !NEEDS.test(v)) return;
    if (n.parentElement && SKIP.has(n.parentElement.tagName)) return;
    n.nodeValue = fix(v);
  }
  function walk(root) {
    if (root.nodeType === 3) return patchText(root);
    if (root.nodeType !== 1) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) patchText(n);
  }

  const run = () => walk(document.body);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();

  new MutationObserver(ms => {
    for (const m of ms) for (const nd of m.addedNodes) walk(nd);
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
