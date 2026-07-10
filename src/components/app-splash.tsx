// 설치형 앱(홈 화면 아이콘) 실행 전용 시작 화면.
// OS가 그려주는 스플래시는 정적 로고뿐이라 로딩이 길어지면 멈춘 것처럼 보인다.
// 첫 페인트 직후부터 JS 하이드레이션 없이 CSS 애니메이션으로 이어받아
// "열리고 있다"는 느낌을 주고, 문서 로드가 끝나면 부드럽게 사라진다.
//
// - 일반 브라우저 접속에는 표시하지 않는다 (standalone 실행에서만).
// - 같은 세션의 재로드(당겨서 새로고침 등)에는 다시 띄우지 않는다.
// - 로고·문구는 관리자 [SEO 관리 → 앱 시작 화면]에서 설정한다.
//
// 인라인 스크립트가 하이드레이션 전에 이 DOM을 만지므로, React가 내부를
// 조정(diff)하지 않도록 전체를 dangerouslySetInnerHTML 한 덩어리로 렌더링한다.

const HIDE_SCRIPT = `(function () {
  var el = document.getElementById("hm-splash");
  if (!el) return;
  var standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  var seen = false;
  try { seen = window.sessionStorage.getItem("hm-splash-shown") === "1"; } catch (e) {}
  if (!standalone || seen) { el.remove(); return; }
  try { window.sessionStorage.setItem("hm-splash-shown", "1"); } catch (e) {}
  el.classList.add("hm-splash-visible");
  var start = Date.now();
  var hidden = false;
  function hide() {
    if (hidden) return;
    hidden = true;
    var wait = Math.max(0, 1200 - (Date.now() - start));
    window.setTimeout(function () {
      el.classList.add("hm-splash-leave");
      window.setTimeout(function () { el.remove(); }, 700);
    }, wait);
  }
  if (document.readyState !== "loading") hide();
  else window.addEventListener("DOMContentLoaded", hide, { once: true });
  window.setTimeout(hide, 8000);
})();`;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function AppSplash({
  imageSrc,
  tagline,
}: {
  imageSrc: string;
  tagline: string;
}) {
  const html = `<div id="hm-splash" aria-hidden="true"><div class="hm-splash-inner"><div class="hm-splash-emblem"><span class="hm-splash-ring"></span><span class="hm-splash-ring hm-splash-ring-2"></span><img src="${escapeHtml(imageSrc)}" alt="" class="hm-splash-logo" /></div><p class="hm-splash-tagline hm-serif">${escapeHtml(tagline)}</p><span class="hm-splash-dots"><i></i><i></i><i></i></span></div></div><script>${HIDE_SCRIPT}</script>`;

  return (
    <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
  );
}
