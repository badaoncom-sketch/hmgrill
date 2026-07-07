"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Maximize,
  Minimize,
  RotateCcw,
  ScanLine,
  WifiOff,
} from "lucide-react";
import {
  lookupCouponAction,
  useCouponAction as consumeCouponAction,
} from "@/app/actions/staff";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { formatCurrency, formatDate } from "@/lib/utils";

export type StaffRecentEvent = {
  id: string;
  eventType: string;
  createdAt: string;
  couponNumber: string | null;
  couponName: string | null;
  amount: number | null;
  memberNameMasked: string;
  memberPhoneMasked: string;
  staffName: string | null;
};

export type TodayStats = {
  usedCount: number;
  discountTotal: number;
};

type StaffScannerState = Awaited<ReturnType<typeof lookupCouponAction>>;

const initialState: StaffScannerState = {
  ok: false,
  message: "",
};

type DisplayResult = StaffScannerState & {
  source: "lookup" | "use";
  scannedInput?: string;
};

type ViewKind = "idle" | "usable" | "applied" | "blocked" | "notfound";

// 결과 화면 유지 시간 — 지나면 자동으로 다음 손님 대기 화면으로 복귀한다.
const RESET_DURATIONS: Record<Exclude<ViewKind, "idle">, number> = {
  usable: 60_000,
  applied: 12_000,
  blocked: 30_000,
  notfound: 30_000,
};

const flowSteps = [
  { number: "01", label: "스캔 대기" },
  { number: "02", label: "직원 확인" },
  { number: "03", label: "할인 적용" },
];

const greetings = [
  "어서 오세요, 화목입니다!",
  "QR 쿠폰을 보여주시면 바로 확인해 드려요",
  "오늘도 화목한 시간 되세요",
  "쿠폰 준비되셨나요? 스캔해 주세요",
];

type BotMood = "greet" | "scan" | "happy" | "celebrate" | "sad" | "confused";

// 순수 CSS로 그린 키오스크 마스코트 — 상태에 따라 표정이 바뀐다.
function RobotFace({ mood, className = "" }: { mood: BotMood; className?: string }) {
  const happy = mood === "happy" || mood === "celebrate";

  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <div className="absolute -top-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center">
        <span
          className={`h-2.5 w-2.5 rounded-full bg-[var(--hm-primary)] shadow-[0_0_12px_rgba(247,230,193,.8)] ${
            mood === "scan" ? "animate-ping" : "animate-pulse"
          }`}
        />
        <span className="h-3.5 w-[3px] rounded-full bg-[rgba(247,230,193,.35)]" />
      </div>
      <span className="absolute -left-1.5 top-1/2 h-[36%] w-2.5 -translate-y-1/2 rounded-l-[6px] bg-[rgba(247,230,193,.22)]" />
      <span className="absolute -right-1.5 top-1/2 h-[36%] w-2.5 -translate-y-1/2 rounded-r-[6px] bg-[rgba(247,230,193,.22)]" />

      <div className="hm-bot-float relative h-full w-full rounded-[30%] border border-[rgba(247,230,193,.3)] bg-[linear-gradient(160deg,#221b12,#0e0c09_55%,#191208)] p-[9%] shadow-[0_18px_50px_rgba(0,0,0,.5)]">
        <div className="relative flex h-full w-full flex-col items-center justify-center gap-[12%] overflow-hidden rounded-[26%] border border-white/[0.06] bg-[radial-gradient(70%_70%_at_50%_28%,rgba(184,130,30,.12),transparent_75%),#0a0806]">
          {mood === "scan" ? (
            <span className="hm-scan-beam absolute left-[10%] right-[10%] h-[2px] rounded-full bg-[linear-gradient(90deg,transparent,rgba(247,230,193,.9),transparent)]" />
          ) : null}

          <div
            className={`flex items-center justify-center gap-[16%] self-stretch ${
              mood === "scan" ? "hm-bot-eyes-scan" : ""
            }`}
          >
            {happy ? (
              <>
                <span className="h-[12%] min-h-[8px] w-[20%] rounded-t-full border-t-4 border-[var(--hm-primary)]" />
                <span className="h-[12%] min-h-[8px] w-[20%] rounded-t-full border-t-4 border-[var(--hm-primary)]" />
              </>
            ) : mood === "sad" ? (
              <>
                <span className="h-[7%] min-h-[5px] w-[18%] rotate-[-16deg] rounded-full bg-[#f0a39b]" />
                <span className="h-[7%] min-h-[5px] w-[18%] rotate-[16deg] rounded-full bg-[#f0a39b]" />
              </>
            ) : mood === "confused" ? (
              <>
                <span className="hm-bot-blink h-[22%] min-h-[13px] w-[14%] rounded-[38%] bg-[var(--hm-primary)] shadow-[0_0_16px_rgba(247,230,193,.5)]" />
                <span className="h-[9%] min-h-[6px] w-[15%] -translate-y-[70%] rounded-full bg-[var(--hm-primary)]" />
              </>
            ) : (
              <>
                <span
                  className={`${mood === "greet" ? "hm-bot-wink" : ""} h-[22%] min-h-[13px] w-[14%] rounded-[38%] bg-[var(--hm-primary)] shadow-[0_0_16px_rgba(247,230,193,.55)]`}
                />
                <span
                  className={`${mood === "greet" ? "hm-bot-blink" : ""} h-[22%] min-h-[13px] w-[14%] rounded-[38%] bg-[var(--hm-primary)] shadow-[0_0_16px_rgba(247,230,193,.55)]`}
                />
              </>
            )}
          </div>

          {happy ? (
            <div className="pointer-events-none absolute inset-x-[13%] top-[54%] flex justify-between">
              <span className="h-[7%] min-h-[5px] w-[15%] rounded-full bg-[rgba(198,90,45,.45)] blur-[1px]" />
              <span className="h-[7%] min-h-[5px] w-[15%] rounded-full bg-[rgba(198,90,45,.45)] blur-[1px]" />
            </div>
          ) : null}

          {mood === "celebrate" ? (
            <span className="h-[14%] min-h-[10px] w-[26%] rounded-b-full bg-[var(--hm-primary)]" />
          ) : happy ? (
            <span className="h-[10%] min-h-[7px] w-[24%] rounded-b-full border-b-4 border-[var(--hm-primary)]" />
          ) : mood === "sad" ? (
            <span className="h-[10%] min-h-[7px] w-[22%] rounded-t-full border-t-4 border-[#f0a39b]" />
          ) : mood === "confused" ? (
            <span className="h-[4%] min-h-[3px] w-[20%] rotate-[-8deg] rounded-full bg-[rgba(247,230,193,.65)]" />
          ) : mood === "scan" ? (
            <span className="h-[4%] min-h-[3px] w-[18%] animate-pulse rounded-full bg-[rgba(247,230,193,.65)]" />
          ) : (
            <span className="h-[9%] min-h-[6px] w-[20%] rounded-b-full border-b-4 border-[var(--hm-primary)]" />
          )}
        </div>
      </div>

      {mood === "celebrate" ? (
        <>
          <span className="absolute -left-4 top-1 animate-ping text-[16px] leading-none text-[var(--hm-primary)]">
            ✦
          </span>
          <span
            className="absolute -right-3 bottom-3 animate-ping text-[13px] leading-none text-[var(--hm-accent-gold)]"
            style={{ animationDelay: "320ms" }}
          >
            ✦
          </span>
        </>
      ) : null}
      {mood === "confused" ? (
        <span className="absolute -right-5 -top-3 animate-bounce text-[22px] font-bold leading-none text-[var(--hm-primary)]">
          ?
        </span>
      ) : null}
    </div>
  );
}

function playBeep(positive: boolean) {
  try {
    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = positive ? 880 : 220;
    gain.gain.value = 0.06;
    osc.start();
    osc.stop(ctx.currentTime + (positive ? 0.15 : 0.35));
    osc.onended = () => {
      void ctx.close();
    };
  } catch {
    // 사운드는 보조 피드백이므로 실패해도 무시한다.
  }
}

export function StaffScanner({
  recentEvents = [],
  today,
}: {
  recentEvents?: StaffRecentEvent[];
  today?: TodayStats;
}) {
  const router = useRouter();
  const [display, setDisplay] = useState<DisplayResult | null>(null);
  const [isLookupPending, startLookup] = useTransition();
  const [isUsePending, startUse] = useTransition();
  const [offline, setOffline] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clock, setClock] = useState("");
  const [resetRemaining, setResetRemaining] = useState<number | null>(null);
  const [greetIndex, setGreetIndex] = useState(0);
  // 처리 내역 상세보기처럼 스캔이 아닌 조회는 비프음을 내지 않는다.
  const silentResultRef = useRef(false);

  const coupon = display?.coupon;
  const pending = isLookupPending || isUsePending;

  let view: ViewKind = "idle";
  if (display) {
    if (display.ok && display.canUse && coupon) {
      view = "usable";
    } else if (
      display.ok &&
      coupon &&
      (display.source === "use" || display.message.includes("자동 사용완료"))
    ) {
      view = "applied";
    } else if (coupon) {
      view = "blocked";
    } else {
      view = "notfound";
    }
  }

  const runLookup = useCallback(
    (formData: FormData) => {
      const scannedInput = String(formData.get("token") ?? "");
      startLookup(async () => {
        try {
          const result = await lookupCouponAction(initialState, formData);
          setDisplay({ ...result, source: "lookup", scannedInput });
          if (result.ok && result.message.includes("자동 사용완료")) {
            router.refresh();
          }
        } catch {
          setDisplay({
            ok: false,
            message: "네트워크 오류로 조회하지 못했습니다. 연결 상태를 확인해 주세요.",
            source: "lookup",
          });
        }
      });
    },
    [router],
  );

  const runUse = useCallback(
    (formData: FormData) => {
      startUse(async () => {
        try {
          const result = await consumeCouponAction(initialState, formData);
          setDisplay({ ...result, source: "use" });
          if (result.ok) {
            // 처리 직후 최근 처리 내역·오늘 현황이 바로 갱신되도록 한다.
            router.refresh();
          }
        } catch {
          setDisplay({
            ok: false,
            message: "네트워크 오류로 처리하지 못했습니다. 연결 상태를 확인해 주세요.",
            source: "use",
          });
        }
      });
    },
    [router],
  );

  // 결과 비프음
  useEffect(() => {
    if (!display) return;
    if (silentResultRef.current) {
      silentResultRef.current = false;
      return;
    }
    const positive =
      display.ok &&
      (display.canUse === true ||
        display.source === "use" ||
        display.message.includes("자동 사용완료"));
    playBeep(positive);
  }, [display]);

  // 자동 다음 손님 — 상태별 유지 시간이 지나면 대기 화면으로 복귀 (카운트다운 표시)
  useEffect(() => {
    if (!display || view === "idle") return;
    const duration = RESET_DURATIONS[view];
    const deadline = Date.now() + duration;

    const tick = () => {
      const remain = deadline - Date.now();
      if (remain <= 0) {
        setDisplay(null);
        setResetRemaining(null);
      } else {
        setResetRemaining(Math.ceil(remain / 1000));
      }
    };

    const initial = setTimeout(tick, 0);
    const interval = setInterval(tick, 1_000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [display, view]);

  const submitScan = useCallback(
    (token: string) => {
      const formData = new FormData();
      formData.set("token", token);
      runLookup(formData);
    },
    [runLookup],
  );

  const openHistoryDetail = useCallback(
    (couponNumber: string) => {
      silentResultRef.current = true;
      submitScan(couponNumber);
    },
    [submitScan],
  );

  const resetToIdle = useCallback(() => {
    setDisplay(null);
    setResetRemaining(null);
  }, []);

  // 탁상용 QR 리더기는 키보드처럼 입력하므로, 어디에 포커스가 있어도
  // 빠른 연속 입력 + Enter 를 스캔으로 인식해 자동 조회한다.
  useEffect(() => {
    let buffer = "";
    let lastKeyAt = 0;

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const now = Date.now();
      if (now - lastKeyAt > 500) buffer = "";
      lastKeyAt = now;

      if (event.key === "Enter") {
        if (buffer.length >= 6) {
          event.preventDefault();
          submitScan(buffer);
        }
        buffer = "";
        return;
      }

      if (event.key.length === 1) {
        buffer += event.key;
        event.preventDefault();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [submitScan]);

  // 상시 운영: 화면 꺼짐 방지 (Wake Lock). 탭이 다시 보이면 재획득한다.
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    async function acquire() {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
        }
      } catch {
        // 배터리 절약 모드 등으로 거부될 수 있다 — 무시.
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        void acquire();
      }
    }

    void acquire();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      wakeLock?.release().catch(() => {});
    };
  }, []);

  // 상시 운영: 최근 처리 내역·오늘 현황·로그인 세션을 주기적으로 갱신한다.
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [router]);

  // 네트워크 상태 감지 — 끊기면 직원이 바로 알 수 있게 표시한다.
  useEffect(() => {
    const initialCheck = setTimeout(() => setOffline(!navigator.onLine), 0);
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      clearTimeout(initialCheck);
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // 대기 화면 인사말 순환
  useEffect(() => {
    const interval = setInterval(() => {
      setGreetIndex((index) => (index + 1) % greetings.length);
    }, 6_000);
    return () => clearInterval(interval);
  }, []);

  // 대기 화면용 시계
  useEffect(() => {
    const update = () =>
      setClock(
        new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    const initial = setTimeout(update, 0);
    const interval = setInterval(update, 30_000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // 일부 브라우저/웹뷰에서 전체화면이 제한될 수 있다 — 무시.
    }
  }, []);

  const isExpired = coupon
    ? coupon.status === "expired" || new Date(coupon.validUntil) < new Date()
    : false;
  const blockedTitle = coupon
    ? coupon.status === "used"
      ? "이미 사용된 쿠폰입니다"
      : isExpired
        ? "기간이 만료된 쿠폰입니다"
        : "사용할 수 없는 쿠폰입니다"
    : "";
  const blockedRows = coupon
    ? [
        ...(coupon.status === "used"
          ? [
              {
                label: "사용일시",
                value: coupon.usedAt
                  ? new Date(coupon.usedAt).toLocaleString("ko-KR")
                  : "-",
              },
              { label: "처리 직원", value: coupon.usedByStaffName || "-" },
            ]
          : []),
        ...(coupon.status !== "used" && isExpired
          ? [{ label: "유효기간", value: `${formatDate(coupon.validUntil)}까지` }]
          : []),
        { label: "회원명", value: coupon.memberName || "-" },
        { label: "쿠폰번호", value: coupon.couponNumber },
      ]
    : [];

  const mood: BotMood = pending
    ? "scan"
    : view === "idle"
      ? "greet"
      : view === "usable"
        ? "happy"
        : view === "applied"
          ? "celebrate"
          : view === "blocked"
            ? "sad"
            : "confused";

  const activeStep = view === "usable" ? 1 : view === "applied" ? 2 : 0;
  const showCountdown =
    resetRemaining !== null && (view === "applied" || view === "blocked" || view === "notfound");
  const countdownPct =
    showCountdown && view !== "idle"
      ? Math.max(
          0,
          Math.min(100, ((resetRemaining ?? 0) * 1000 * 100) / RESET_DURATIONS[view]),
        )
      : 0;

  const panelTheme = {
    idle: "border-[rgba(247,230,193,.18)] bg-[radial-gradient(70%_90%_at_50%_0%,rgba(184,130,30,.07),transparent_70%),var(--hm-surface)]",
    usable: "border-emerald-400/40 bg-[rgba(52,180,120,.07)]",
    applied: "border-[rgba(247,230,193,.4)] bg-[rgba(247,230,193,.06)]",
    blocked: "border-[rgba(198,59,45,.5)] bg-[rgba(198,59,45,.08)]",
    notfound: "border-[rgba(198,59,45,.35)] bg-[rgba(198,59,45,.05)]",
  }[view];

  const countdown = showCountdown ? (
    <div className="mx-auto mt-2 w-full max-w-xs">
      <div className="h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[var(--hm-primary)]/70 transition-[width] duration-1000 ease-linear"
          style={{ width: `${countdownPct}%` }}
        />
      </div>
      <p className="mt-2 text-center text-[11px] font-semibold text-white/40">
        {resetRemaining}초 후 자동으로 대기 화면으로 돌아갑니다
      </p>
    </div>
  ) : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.55fr_.85fr] lg:items-start">
      <div className="grid gap-5">
      <section
        aria-live="polite"
        className={`flex min-h-[500px] flex-col overflow-hidden rounded-[24px] border p-6 shadow-[var(--hm-shadow)] lg:p-8 ${panelTheme}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--hm-border)] bg-black/25 px-4 py-2 text-xs font-bold text-white/60">
              <span
                className={`h-2 w-2 animate-pulse rounded-full ${
                  pending ? "bg-amber-300" : "bg-emerald-400"
                }`}
              />
              {pending ? "조회 중..." : "스캐너 대기 중"}
            </span>
            {offline ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(198,59,45,.55)] bg-[rgba(198,59,45,.15)] px-4 py-2 text-xs font-bold text-[#f0a39b]">
                <WifiOff size={13} aria-hidden="true" />
                네트워크 끊김
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {clock ? (
              <span className="rounded-full border border-[var(--hm-border)] bg-black/25 px-4 py-2 font-mono text-xs font-bold tracking-[0.1em] text-white/55">
                {clock}
              </span>
            ) : null}
            {display ? (
              <button
                type="button"
                onClick={resetToIdle}
                className="hm-link-focus inline-flex items-center gap-2 rounded-full border border-[var(--hm-border)] bg-black/25 px-4 py-2 text-xs font-bold text-white/60 transition hover:text-[var(--hm-primary)]"
              >
                <RotateCcw size={13} aria-hidden="true" />
                다음 손님
              </button>
            ) : null}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "전체화면 종료" : "전체화면"}
              title={isFullscreen ? "전체화면 종료" : "전체화면"}
              className="hm-link-focus grid h-8 w-8 place-items-center rounded-full border border-[var(--hm-border)] bg-black/25 text-white/60 transition hover:text-[var(--hm-primary)]"
            >
              {isFullscreen ? (
                <Minimize size={14} aria-hidden="true" />
              ) : (
                <Maximize size={14} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center">
          {flowSteps.map((step, index) => {
            const done = index < activeStep;
            const active = index === activeStep;
            return (
              <Fragment key={step.number}>
                <div
                  className={`flex items-center gap-2 ${
                    active
                      ? "text-[var(--hm-primary)]"
                      : done
                        ? "text-emerald-300/80"
                        : "text-white/28"
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full border font-mono text-[11px] font-bold ${
                      active
                        ? "border-[rgba(247,230,193,.5)] bg-[rgba(247,230,193,.1)] shadow-[0_0_16px_rgba(247,230,193,.25)]"
                        : done
                          ? "border-emerald-400/40"
                          : "border-white/12"
                    }`}
                  >
                    {done ? <Check size={13} aria-hidden="true" /> : step.number}
                  </span>
                  <span className="text-xs font-bold tracking-wide">{step.label}</span>
                </div>
                {index < flowSteps.length - 1 ? (
                  <span
                    className={`mx-3 h-px w-8 sm:w-14 ${
                      index < activeStep ? "bg-emerald-400/40" : "bg-white/12"
                    }`}
                    aria-hidden="true"
                  />
                ) : null}
              </Fragment>
            );
          })}
        </div>

        {offline ? (
          <div className="mt-4 flex items-center gap-3 rounded-[14px] border border-[rgba(198,59,45,.5)] bg-[rgba(198,59,45,.12)] px-4 py-3 text-sm font-bold text-[#f0a39b]">
            <WifiOff size={16} className="shrink-0" aria-hidden="true" />
            네트워크 연결이 끊겼습니다. 연결이 복구될 때까지 쿠폰 조회가 되지 않습니다.
          </div>
        ) : null}

        {view === "idle" ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-7 py-8 text-center">
            <div
              key={greetIndex}
              className="hm-reveal relative rounded-full border border-[rgba(247,230,193,.25)] bg-[#14100b] px-6 py-2.5"
            >
              <p className="text-sm font-bold text-[var(--hm-primary)]">
                {pending ? "확인하고 있어요..." : greetings[greetIndex]}
              </p>
              <span
                aria-hidden="true"
                className="absolute -bottom-[5px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-[rgba(247,230,193,.25)] bg-[#14100b]"
              />
            </div>
            <RobotFace mood={mood} className="h-40 w-40 sm:h-44 sm:w-44" />
            <div>
              <p className="hm-serif text-[clamp(26px,3vw,34px)] font-bold leading-[1.35] text-[var(--hm-primary)]">
                QR 쿠폰을 스캐너에 대주세요
              </p>
              <p className="mt-3 text-[15px] font-semibold text-white/55">
                스캔하면 자동으로 조회됩니다 · 화면을 누르지 않아도 됩니다
              </p>
            </div>
          </div>
        ) : null}

        {view === "usable" && coupon ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
            <RobotFace mood={mood} className="h-24 w-24" />
            <p className="mt-2 text-[17px] font-bold text-emerald-200">사용 가능한 쿠폰입니다</p>
            <h2 className="text-[clamp(20px,2.4vw,27px)] font-bold leading-snug text-white">
              {coupon.couponName}
            </h2>
            <p className="text-[clamp(44px,6vw,62px)] font-bold leading-none text-[var(--hm-primary)]">
              {formatCurrency(coupon.amount)}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm font-semibold text-white/60">
              <span>회원 {coupon.memberName || "-"}</span>
              <span>쿠폰번호 {coupon.couponNumber}</span>
              <span>{formatDate(coupon.validUntil)}까지</span>
            </div>
            {coupon.conditionText ? (
              <p className="max-w-md whitespace-pre-line text-[13px] leading-6 text-white/45">
                {coupon.conditionText}
              </p>
            ) : null}
            <form action={runUse} className="mt-2">
              <input name="token" type="hidden" value={coupon.token} />
              <Button
                type="submit"
                disabled={isUsePending}
                className="min-h-14 px-10 text-[16px] font-bold"
              >
                {isUsePending ? null : <CheckCircle2 size={18} aria-hidden="true" />}
                {isUsePending ? "처리 중..." : "사용 완료 처리"}
              </Button>
            </form>
            <p className="text-[12px] font-semibold text-white/38">
              직원 확인 후 할인이 적용됩니다
            </p>
          </div>
        ) : null}

        {view === "applied" && coupon ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
            <RobotFace mood={mood} className="h-24 w-24" />
            <p className="mt-2 text-[17px] font-bold text-[var(--hm-primary)]">할인 적용 완료</p>
            <p className="text-[clamp(44px,6vw,62px)] font-bold leading-none text-[var(--hm-primary)]">
              {formatCurrency(coupon.amount)}
            </p>
            <p className="text-[15px] font-semibold text-white/70">
              감사합니다. POS에서 위 금액을 할인한 뒤 결제를 진행해 주세요.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm font-semibold text-white/55">
              <span>회원 {coupon.memberName || "-"}</span>
              <span>쿠폰번호 {coupon.couponNumber}</span>
              {coupon.usedAt ? (
                <span>{new Date(coupon.usedAt).toLocaleString("ko-KR")} 처리</span>
              ) : null}
            </div>
            {countdown}
          </div>
        ) : null}

        {view === "blocked" && coupon ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
            <RobotFace mood={mood} className="h-24 w-24" />
            <p className="mt-2 text-[clamp(22px,2.6vw,28px)] font-bold text-[#f0a39b]">
              {blockedTitle}
            </p>
            <h2 className="text-[17px] font-bold text-white/80">
              {coupon.couponName} · {formatCurrency(coupon.amount)}
            </h2>
            <dl className="mt-1 w-full max-w-sm rounded-[16px] border border-[rgba(198,59,45,.35)] bg-black/25 p-5 text-left">
              {blockedRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-4 py-1.5"
                >
                  <dt className="shrink-0 text-sm font-bold text-white/55">{row.label}</dt>
                  <dd className="text-right text-sm font-semibold text-white">{row.value}</dd>
                </div>
              ))}
            </dl>
            {!display?.ok && display?.message ? (
              <p className="text-[13px] font-semibold text-white/45">{display.message}</p>
            ) : null}
            {countdown}
          </div>
        ) : null}

        {view === "notfound" ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
            <RobotFace mood={mood} className="h-24 w-24" />
            <p className="mt-2 text-[clamp(22px,2.6vw,28px)] font-bold text-[#f2c86d]">
              쿠폰을 확인할 수 없습니다
            </p>
            {display?.message ? (
              <p className="text-[15px] font-semibold text-white/60">{display.message}</p>
            ) : null}
            <p className="max-w-sm text-[13px] leading-6 text-white/45">
              회원의 &lsquo;내 쿠폰&rsquo; 화면에 표시된 QR인지 확인한 뒤 다시 스캔해 주세요.
              계속 실패하면 아래 수동 입력을 이용하세요.
            </p>
            {display?.scannedInput ? (
              <p className="max-w-full truncate rounded-full border border-white/10 bg-black/30 px-4 py-1.5 font-mono text-[12px] tracking-[0.04em] text-white/50">
                입력값: {display.scannedInput.length > 42
                  ? `${display.scannedInput.slice(0, 42)}…`
                  : display.scannedInput}
              </p>
            ) : null}
            {countdown}
          </div>
        ) : null}
      </section>

      <details className="group rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)]">
        <summary className="hm-link-focus flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-[var(--hm-subtext)] transition hover:text-[var(--hm-primary)] [&::-webkit-details-marker]:hidden">
          수동 입력 — 스캐너가 인식하지 못할 때
          <ScanLine size={16} aria-hidden="true" />
        </summary>
        <form action={runLookup} className="flex flex-col gap-3 px-5 pb-5 sm:flex-row">
          <Input
            name="token"
            placeholder="8자리 쿠폰번호 또는 QR 토큰 입력"
            className="flex-1"
          />
          <Button type="submit" disabled={isLookupPending} className="shrink-0">
            {isLookupPending ? "조회 중" : "쿠폰 조회"}
          </Button>
        </form>
      </details>
      </div>

      <aside className="grid gap-5">
        <section className="rounded-[20px] border border-[var(--hm-warm-border)] bg-[var(--hm-surface)] p-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--hm-accent-gold)]">
            오늘 처리 현황
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-[var(--hm-subtext)]">사용 처리</p>
              <p className="mt-2 text-[30px] font-bold leading-none text-[var(--hm-primary)]">
                {today?.usedCount ?? 0}
                <span className="ml-1 text-[14px] font-semibold text-white/45">건</span>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--hm-subtext)]">할인 합계</p>
              <p className="mt-2 text-[24px] font-bold leading-none text-[var(--hm-primary)]">
                {formatCurrency(today?.discountTotal ?? 0)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--hm-accent-gold)]">
              최근 처리 내역
            </h2>
            <p className="text-[11px] font-semibold text-white/35">클릭하면 상세 확인</p>
          </div>
          <div className="mt-3 divide-y divide-[var(--hm-divider)]">
            {recentEvents.map((event) => {
              const content = (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={event.eventType === "coupon_used" ? "green" : "neutral"}>
                        {event.eventType === "coupon_used" ? "사용완료" : "기간만료"}
                      </Badge>
                      {event.couponName ? (
                        <span className="truncate text-[13px] font-bold text-white/80">
                          {event.couponName}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-xs font-semibold text-[var(--hm-subtext)]">
                      {event.memberNameMasked} · {event.memberPhoneMasked}
                      {event.staffName ? ` · 처리 ${event.staffName}` : ""}
                    </p>
                    <p className="mt-1 flex flex-wrap gap-x-3 text-[11px] font-semibold text-white/40">
                      {event.couponNumber ? (
                        <span className="font-mono tracking-[0.1em] text-[var(--hm-primary)]/80">
                          No. {event.couponNumber}
                        </span>
                      ) : null}
                      <span>{new Date(event.createdAt).toLocaleString("ko-KR")}</span>
                    </p>
                  </div>
                  {event.couponNumber ? (
                    <ChevronRight size={15} className="mt-1 shrink-0 text-white/30" aria-hidden="true" />
                  ) : null}
                </>
              );

              return event.couponNumber ? (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => openHistoryDetail(event.couponNumber as string)}
                  className="hm-link-focus flex w-full items-start gap-3 rounded-[12px] px-1 py-3 text-left transition hover:bg-white/[0.04]"
                >
                  {content}
                </button>
              ) : (
                <div key={event.id} className="flex items-start gap-3 px-1 py-3">
                  {content}
                </div>
              );
            })}
            {recentEvents.length === 0 ? (
              <p className="py-3 text-sm font-semibold text-[var(--hm-subtext)]">
                최근 처리한 쿠폰이 없습니다.
              </p>
            ) : null}
          </div>
        </section>
      </aside>
    </div>
  );
}
