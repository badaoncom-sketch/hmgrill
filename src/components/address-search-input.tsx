"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";

type DaumPostcodeData = {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  userSelectedType: "R" | "J";
  bname: string;
  buildingName: string;
  apartment: "Y" | "N";
};

type DaumPostcode = new (options: {
  oncomplete: (data: DaumPostcodeData) => void;
  width: string;
  height: string;
  theme?: Record<string, string>;
}) => { embed: (element: HTMLElement) => void };

declare global {
  interface Window {
    daum?: { Postcode: DaumPostcode };
  }
}

let postcodeLoader: Promise<void> | null = null;

function loadPostcodeScript() {
  if (typeof window !== "undefined" && window.daum?.Postcode) {
    return Promise.resolve();
  }
  if (!postcodeLoader) {
    postcodeLoader = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        postcodeLoader = null;
        reject(new Error("주소 검색 스크립트를 불러오지 못했습니다."));
      };
      document.head.appendChild(script);
    });
  }
  return postcodeLoader;
}

// 다음 우편번호 위젯 내부 색상을 사이트 다크 테마에 맞춘다.
const postcodeTheme = {
  bgColor: "#161310",
  searchBgColor: "#0d0d0d",
  contentBgColor: "#161310",
  pageBgColor: "#161310",
  textColor: "#f0e9db",
  queryTextColor: "#f0e9db",
  postcodeTextColor: "#b8821e",
  emphTextColor: "#f7e6c1",
  outlineColor: "#332c20",
};

// 도로명 주소 뒤에 붙는 참고항목(법정동, 건물명)을 안내 문구대로 조합한다.
function formatSelectedAddress(data: DaumPostcodeData) {
  let address =
    data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;

  if (data.userSelectedType === "R") {
    let extra = "";
    if (data.bname && /[동로가]$/.test(data.bname)) {
      extra += data.bname;
    }
    if (data.buildingName && data.apartment === "Y") {
      extra += extra ? `, ${data.buildingName}` : data.buildingName;
    }
    if (extra) {
      address += ` (${extra})`;
    }
  }

  return `(${data.zonecode}) ${address}`;
}

export function AddressSearchInput({
  defaultValue = "",
  className,
}: {
  defaultValue?: string;
  className?: string;
}) {
  const mounted = useMounted();
  const [baseAddress, setBaseAddress] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [manualMode, setManualMode] = useState(false);
  const widgetBoxRef = useRef<HTMLDivElement>(null);
  const detailInputRef = useRef<HTMLInputElement>(null);

  function openSearch() {
    setStatus("loading");
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    loadPostcodeScript()
      .then(() => {
        const box = widgetBoxRef.current;
        if (cancelled || !box || !window.daum?.Postcode) return;
        box.innerHTML = "";
        new window.daum.Postcode({
          oncomplete: (data) => {
            setBaseAddress(formatSelectedAddress(data));
            setOpen(false);
            // 모달이 닫힌 뒤 상세주소 입력으로 이어지도록 포커스를 넘긴다.
            setTimeout(() => detailInputRef.current?.focus(), 0);
          },
          width: "100%",
          height: "100%",
          theme: postcodeTheme,
        }).embed(box);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      cancelled = true;
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className={cn("grid gap-2", className)}>
      <span className="text-sm font-medium text-[var(--hm-text)]">주소</span>
      <span className="relative block">
        <Input
          name="address"
          value={baseAddress}
          onChange={(event) => setBaseAddress(event.target.value)}
          readOnly={!manualMode}
          onClick={() => {
            if (!manualMode) openSearch();
          }}
          onKeyDown={(event) => {
            if (!manualMode && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              openSearch();
            }
          }}
          placeholder="눌러서 주소 검색"
          required
          className={manualMode ? "w-full" : "w-full cursor-pointer pr-10"}
        />
        {!manualMode ? (
          <Search
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--hm-subtext)]"
          />
        ) : null}
      </span>
      <Input
        name="addressDetail"
        ref={detailInputRef}
        aria-label="상세주소"
        placeholder="상세주소 (동·호수 등, 선택)"
      />

      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-[80]">
              <button
                type="button"
                aria-label="주소 검색 닫기"
                onClick={() => setOpen(false)}
                className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-[2px]"
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-label="주소 검색"
                className="absolute inset-0 flex flex-col bg-[#14110d] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-[560px] sm:max-h-[86vh] sm:w-[min(560px,92vw)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:overflow-hidden sm:rounded-[20px] sm:border sm:border-[rgba(247,230,193,.18)] sm:shadow-[0_30px_90px_rgba(0,0,0,.6)]"
              >
                <div className="flex items-center justify-between border-b border-[var(--hm-border)] px-4 py-3">
                  <p className="text-sm font-bold text-[var(--hm-primary)]">주소 검색</p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="닫기"
                    className="hm-link-focus grid size-8 place-items-center rounded-full text-[var(--hm-subtext)] transition hover:bg-white/[0.06] hover:text-[var(--hm-primary)]"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>
                <div className="relative min-h-0 flex-1">
                  {status === "error" ? (
                    <div className="grid h-full place-items-center px-8 text-center">
                      <div>
                        <p className="text-sm font-bold text-white/80">
                          주소 검색을 불러오지 못했습니다
                        </p>
                        <p className="mt-2 text-xs leading-5 text-[var(--hm-subtext)]">
                          네트워크 상태를 확인한 뒤 다시 시도하거나, 주소를 직접
                          입력해 주세요.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setManualMode(true);
                            setOpen(false);
                          }}
                          className="hm-link-focus mt-4 rounded-[10px] border border-[rgba(247,230,193,.3)] px-4 py-2 text-xs font-bold text-[var(--hm-primary)] transition hover:bg-[var(--hm-primary)] hover:text-[#0d0d0d]"
                        >
                          직접 입력하기
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {status === "loading" ? (
                        <div className="absolute inset-0 grid place-items-center">
                          <Spinner className="h-5 w-5 text-[var(--hm-accent-gold)]" />
                        </div>
                      ) : null}
                      <div ref={widgetBoxRef} className="h-full w-full" />
                    </>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
