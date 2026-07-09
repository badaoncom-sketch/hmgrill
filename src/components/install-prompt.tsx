"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Download, Share, SquarePlus, X } from "lucide-react";

const SNOOZE_KEY = "hm-install-snooze-until";
const INSTALLED_KEY = "hm-install-done";
const SNOOZE_DAYS = 7;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  const ua = window.navigator.userAgent;
  return (
    /iphone|ipad|ipod/i.test(ua) ||
    // iPadOS 13+는 데스크톱 UA를 쓰므로 터치 지원 Mac으로 감지한다.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

// 모바일·태블릿 브라우저에서 홈 화면 설치를 권유하는 배너.
// 이미 설치했거나(스탠드얼론 실행·설치 이력) 최근에 닫은 사용자에게는 보이지 않는다.
export function InstallPrompt({
  appName,
  iconSrc,
}: {
  appName: string;
  iconSrc: string;
}) {
  const [mode, setMode] = useState<"hidden" | "android" | "ios">("hidden");
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(INSTALLED_KEY) === "1") return;
      const snoozeUntil = Number(localStorage.getItem(SNOOZE_KEY) ?? 0);
      if (snoozeUntil > Date.now()) return;
    } catch {
      // localStorage 접근 불가(시크릿 모드 등)면 배너만 띄운다.
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      deferredPromptRef.current = event as BeforeInstallPromptEvent;
      timers.push(setTimeout(() => setMode("android"), 2200));
    }

    function onInstalled() {
      try {
        localStorage.setItem(INSTALLED_KEY, "1");
      } catch {}
      setMode("hidden");
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    if (isIos()) {
      timers.push(setTimeout(() => setMode("ios"), 2600));
    }

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function snooze() {
    try {
      localStorage.setItem(
        SNOOZE_KEY,
        String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000),
      );
    } catch {}
    setMode("hidden");
  }

  async function install() {
    const deferred = deferredPromptRef.current;
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferredPromptRef.current = null;
    if (outcome === "accepted") {
      try {
        localStorage.setItem(INSTALLED_KEY, "1");
      } catch {}
      setMode("hidden");
    } else {
      snooze();
    }
  }

  if (mode === "hidden") return null;

  return (
    <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+84px)] z-[55] mx-auto max-w-[440px] lg:hidden">
      <div className="rounded-[20px] border border-[rgba(247,230,193,.24)] bg-[linear-gradient(150deg,#211a11,#0f0d0a_60%)] p-4 shadow-[0_24px_70px_rgba(0,0,0,.55)] backdrop-blur">
        <div className="flex items-start gap-3">
          <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-[12px] border border-white/[0.1]">
            <Image src={iconSrc} alt="" fill sizes="44px" className="object-cover" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[var(--hm-primary)]">
              {appName}을 앱처럼 설치하세요
            </p>
            {mode === "android" ? (
              <p className="mt-1 text-xs leading-5 text-[var(--hm-subtext)]">
                홈 화면에서 바로 열고, QR 쿠폰을 더 빠르게 꺼낼 수 있어요.
              </p>
            ) : (
              <p className="mt-1 text-xs leading-5 text-[var(--hm-subtext)]">
                Safari 하단의 공유(
                <Share size={12} className="inline align-[-2px]" aria-label="공유" />
                ) 버튼을 누른 뒤{" "}
                <span className="font-bold text-white/75">
                  &lsquo;홈 화면에 추가
                  <SquarePlus size={12} className="ml-0.5 inline align-[-2px]" aria-hidden="true" />
                  &rsquo;
                </span>
                를 선택하면 설치됩니다.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={snooze}
            aria-label="설치 안내 닫기"
            className="hm-link-focus grid size-8 shrink-0 place-items-center rounded-full text-white/40 transition hover:bg-white/[0.06] hover:text-white/70"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
        {mode === "android" ? (
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={snooze}
              className="hm-link-focus inline-flex min-h-10 items-center rounded-[12px] px-4 text-[13px] font-bold text-white/55 transition hover:text-white/80"
            >
              나중에
            </button>
            <button
              type="button"
              onClick={install}
              className="hm-link-focus inline-flex min-h-10 items-center gap-1.5 rounded-[12px] bg-[var(--hm-primary)] px-5 text-[13px] font-extrabold text-[#171009] transition hover:bg-[var(--hm-accent-gold)] hover:text-white"
            >
              <Download size={14} aria-hidden="true" />
              설치하기
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
