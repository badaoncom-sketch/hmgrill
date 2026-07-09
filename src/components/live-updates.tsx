"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// 콘텐츠 변경이 감지됐을 때 서버 데이터를 다시 그리는 최소 간격.
const REFRESH_THROTTLE_MS = 15_000;
// 새 배포 확인 주기.
const VERSION_POLL_MS = 5 * 60_000;

// 관리자가 홈페이지·메뉴·공지 등을 수정하면 접속 중인 화면이 새로고침 없이
// 자동으로 다시 렌더링되고, 새 버전이 배포되면 자동으로 새 화면을 불러온다.
export function LiveUpdates() {
  const router = useRouter();
  const lastRefreshRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const refresh = (force = false) => {
      const now = Date.now();
      if (!force && now - lastRefreshRef.current < REFRESH_THROTTLE_MS) return;
      lastRefreshRef.current = now;
      router.refresh();
    };

    // ① 관리자 콘텐츠 변경 → Supabase Realtime으로 즉시 반영 (연속 저장은 모아서 한 번만).
    const supabase = createClient();
    const tables = [
      "site_settings",
      "site_copy",
      "menu_items",
      "menu_categories",
      "content_posts",
      "site_banners",
      "site_popups",
    ];
    let channel = supabase.channel("hm-live-content");
    for (const table of tables) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => refresh(true), 700);
        },
      );
    }
    channel.subscribe();

    // ② 앱으로 돌아오면(탭 전환·홈 화면 앱 재진입) 최신 데이터로 갱신.
    function onVisible() {
      if (document.visibilityState === "visible") refresh();
    }
    document.addEventListener("visibilitychange", onVisible);

    // ③ 새 배포 감지 → 다음 확인 주기에 자동으로 새 버전 로드.
    let knownVersion: string | null = null;
    async function checkVersion() {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        const { version } = (await res.json()) as { version: string };
        if (knownVersion === null) {
          knownVersion = version;
        } else if (version !== knownVersion && version !== "dev") {
          window.location.reload();
        }
      } catch {
        // 네트워크 오류는 조용히 무시하고 다음 주기에 다시 확인한다.
      }
    }
    checkVersion();
    const versionTimer = setInterval(checkVersion, VERSION_POLL_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(versionTimer);
    };
  }, [router]);

  return null;
}
