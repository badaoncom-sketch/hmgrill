import Link from "next/link";
import { Suspense } from "react";
import {
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  Plus,
  QrCode,
  Send,
  Store,
  Ticket,
  TimerReset,
} from "lucide-react";
import { CouponListFilters } from "@/components/admin/coupon-list-filters";
import {
  AdminFrame,
  AdminPanel,
  AdminPanelHeader,
  AdminStatCard,
} from "@/components/admin/admin-frame";
import { Badge } from "@/components/ui/badge";
import { requireAdminAccess } from "@/lib/auth/access";
import {
  couponEventSelect,
  couponIssueSelect,
  mapCouponEvent,
  mapCouponIssue,
} from "@/lib/coupons/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";

function percent(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }
  return Math.round((value / total) * 1000) / 10;
}

function readSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const query = readSearchValue(params.q).trim();
  const statusFilter = readSearchValue(params.status);
  const typeFilter = readSearchValue(params.type);
  const { canAccess } = await requireAdminAccess();
  const admin = createAdminClient();
  const [
    { data: rows },
    { data: matchedCouponRows },
    { data: eventRows },
    { count: grantCount },
    { count: guestCount },
  ] = canAccess
    ? await Promise.all([
        admin
          .from("coupon_issues")
          .select(couponIssueSelect)
          .order("created_at", { ascending: false }),
        query
          ? admin
              .from("member_coupons")
              .select("issue_id,coupon_number")
              .ilike("coupon_number", `%${query}%`)
          : Promise.resolve({ data: [] }),
        admin
          .from("coupon_events")
          .select(couponEventSelect)
          .order("created_at", { ascending: false })
          .limit(3),
        admin
          .from("member_coupons")
          .select("id", { count: "exact", head: true })
          .eq("source", "admin_grant"),
        admin
          .from("member_coupons")
          .select("id", { count: "exact", head: true })
          .eq("source", "guest_claim"),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { count: 0 }, { count: 0 }];
  const couponIssues = (rows ?? []).map(mapCouponIssue);
  const matchedIssueIds = new Set(
    ((matchedCouponRows ?? []) as { issue_id: string }[]).map((row) => row.issue_id),
  );
  const normalizedQuery = query.toLowerCase();
  const filteredCouponIssues = couponIssues.filter((issue) => {
    const matchesStatus =
      !statusFilter ||
      statusFilter === "all" ||
      (statusFilter === "issuing" && issue.status === "issuing") ||
      (statusFilter === "ended" && issue.status === "ended");
    const matchesType =
      !typeFilter || typeFilter === "all" || issue.distribution === typeFilter;
    const matchesQuery =
      !normalizedQuery ||
      issue.name.toLowerCase().includes(normalizedQuery) ||
      issue.id.toLowerCase().includes(normalizedQuery) ||
      matchedIssueIds.has(issue.id);

    return matchesStatus && matchesType && matchesQuery;
  });

  const distributionLabels: Record<string, string> = {
    open: "홈페이지",
    direct: "지급 전용",
    guest: "비회원 QR",
  };
  const recentEvents = (eventRows ?? []).map(mapCouponEvent);

  const totalIssued = couponIssues.reduce((sum, item) => sum + item.quantity, 0);
  const activeCount = couponIssues.filter((issue) => issue.status === "issuing").length;
  const totalDownloaded = couponIssues.reduce((sum, item) => sum + item.downloadedCount, 0);
  const totalUsed = couponIssues.reduce((sum, item) => sum + item.usedCount, 0);
  const totalUsedAmount = couponIssues.reduce((sum, item) => sum + item.usedCount * item.amount, 0);
  const usageRate = percent(totalUsed, totalDownloaded);

  // 자주 쓰는 작업을 목록 위에 고정 배치해 긴 스크롤 없이 이동한다.
  const quickActions = [
    {
      href: "/admin/coupons/new",
      icon: Plus,
      label: "쿠폰 생성",
      detail: "새 쿠폰 발행",
    },
    {
      href: "/admin/coupons/grant",
      icon: Send,
      label: "직접 지급",
      detail: "회원 지정 지급",
    },
    {
      href: "/admin/coupons/grants",
      icon: ClipboardList,
      label: "지급 내역",
      detail: `${grantCount ?? 0}건 · 회수 관리`,
    },
    {
      href: "/admin/coupons/guest",
      icon: QrCode,
      label: "비회원 쿠폰",
      detail: `${guestCount ?? 0}장 · 계산대 QR`,
    },
    {
      href: "/admin/coupons/settlement",
      icon: CircleDollarSign,
      label: "정산 리포트",
      detail: "월마감 · 주마감",
    },
    {
      href: "/admin/coupons/insights/overview",
      icon: BarChart3,
      label: "쿠폰 분석",
      detail: "발급 · 사용 통계",
    },
  ];

  const notifications = [
    {
      id: query
        ? `coupon-search-${query}-${filteredCouponIssues.length}`
        : "coupon-search-ready",
      title: "쿠폰 목록 검색 가능",
      description: query
        ? `"${query}" 검색 결과 ${filteredCouponIssues.length}개를 확인 중입니다.`
        : "쿠폰명, ID, 쿠폰번호로 운영 쿠폰을 찾을 수 있습니다.",
      href: "/admin/coupons",
      tone: "green" as const,
    },
    ...recentEvents.map((event) => ({
      id: `coupon-event-${event.id}`,
      title:
        event.eventType === "coupon_used"
          ? "쿠폰 사용 처리"
          : event.eventType === "coupon_downloaded"
            ? "쿠폰 다운로드"
            : "쿠폰 운영 변경",
      description: `${event.actorName ?? event.actorEmail ?? "시스템"} · ${new Date(
        event.createdAt,
      ).toLocaleString("ko-KR")}`,
      href: event.memberCouponId
        ? "/admin/coupons/insights/used"
        : "/admin/coupons/insights/overview",
      tone: event.eventType === "coupon_used" ? ("amber" as const) : ("green" as const),
    })),
  ];

  return (
    <AdminFrame
      active="coupons"
      title="QR 쿠폰 관리"
      description="쿠폰 현황을 확인하고 생성, 지급, 정산 메뉴로 이동합니다."
      notifications={notifications}
    >
      {!canAccess ? (
        <AdminPanel className="p-6">
          <p className="text-sm font-semibold text-[var(--hm-primary)]">
            관리자 권한이 확인되면 쿠폰 이력이 표시됩니다.
          </p>
        </AdminPanel>
      ) : (
        <div className="grid gap-5">
          <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
            <AdminStatCard
              href="/admin/coupons/insights/overview"
              icon={<Ticket size={25} strokeWidth={1.8} aria-hidden="true" />}
              label="전체 쿠폰"
              value={<>{couponIssues.length}개</>}
              detail={
                <>
                  활성 {activeCount}개 · 총 {totalIssued}장
                </>
              }
            />
            <AdminStatCard
              href="/admin/coupons/insights/issued"
              icon={<Store size={25} strokeWidth={1.8} aria-hidden="true" />}
              label="발급 수량"
              value={<>{totalDownloaded}장</>}
              detail={
                <>
                  발급률 {percent(totalDownloaded, totalIssued)}%
                </>
              }
            />
            <AdminStatCard
              href="/admin/coupons/insights/used"
              icon={<ClipboardList size={25} strokeWidth={1.8} aria-hidden="true" />}
              label="사용 수량"
              value={<>{totalUsed}장</>}
              detail={
                <>
                  사용률 {usageRate}%
                </>
              }
            />
            <AdminStatCard
              href="/admin/coupons/insights/discount"
              icon={<TimerReset size={25} strokeWidth={1.8} aria-hidden="true" />}
              label="할인 처리액"
              value={formatCurrency(totalUsedAmount)}
              detail="사용 완료 기준 합산"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="hm-link-focus group rounded-[18px] border border-[rgba(255,255,255,.09)] bg-[rgba(20,20,20,.72)] p-4 transition hover:-translate-y-0.5 hover:border-[rgba(247,230,193,.32)]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-[12px] border border-[rgba(184,130,30,.3)] text-[var(--hm-accent-gold)] transition group-hover:bg-[var(--hm-primary)] group-hover:text-[#0d0d0d]">
                    <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-sm font-extrabold text-white">{action.label}</p>
                  <p className="mt-1 text-[11px] font-semibold text-white/48">{action.detail}</p>
                </Link>
              );
            })}
          </div>

          <AdminPanel>
            <AdminPanelHeader title="쿠폰 목록" />
            <div className="grid gap-4 p-5">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <Suspense fallback={null}>
                  <CouponListFilters />
                </Suspense>
                <Link
                  href="/admin/coupons/new"
                  className="hm-link-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-[var(--hm-primary)] px-4 text-sm font-extrabold text-[#0d0d0d] transition hover:bg-[var(--hm-accent-gold)] hover:text-white"
                >
                  <Plus size={17} aria-hidden="true" />
                  쿠폰 생성
                </Link>
              </div>
              {query || (statusFilter && statusFilter !== "all") ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[rgba(255,255,255,.08)] bg-black/20 px-4 py-3 text-sm font-semibold text-white/54">
                  <span>
                    검색 결과 {filteredCouponIssues.length}개 · 전체 {couponIssues.length}개
                  </span>
                  <Link href="/admin/coupons" className="text-[var(--hm-primary)]">
                    필터 초기화
                  </Link>
                </div>
              ) : null}

              {/* 모바일·태블릿: 카드 리스트 — 카드를 누르면 상세로 이동 */}
              <div className="grid gap-3 lg:hidden">
                {filteredCouponIssues.map((issue, index) => (
                  <Link
                    key={issue.id}
                    href={`/admin/coupons/${issue.id}`}
                    className="hm-link-focus block rounded-[16px] border border-[rgba(255,255,255,.08)] bg-black/20 p-4 transition hover:border-[rgba(247,230,193,.28)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[15px] font-bold leading-snug text-white">
                          <span className="mr-1.5 font-mono text-xs text-white/35">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          {issue.name}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <Badge tone={issue.status === "issuing" ? "green" : "neutral"}>
                            {issue.status === "issuing" ? "활성" : "종료"}
                          </Badge>
                          {issue.distribution === "direct" ? (
                            <span className="rounded-full border border-[rgba(247,230,193,.3)] px-2 py-0.5 text-[10px] font-bold text-[var(--hm-accent-gold)]">
                              지급 전용
                            </span>
                          ) : null}
                          {issue.distribution === "guest" ? (
                            <span className="rounded-full border border-[rgba(247,230,193,.3)] px-2 py-0.5 text-[10px] font-bold text-[var(--hm-accent-gold)]">
                              비회원 QR
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <p className="shrink-0 text-[18px] font-bold leading-none text-[var(--hm-primary)]">
                        {formatCurrency(issue.amount)}
                      </p>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-[12px] bg-black/25 px-3 py-2.5 text-center">
                      <div>
                        <p className="text-[10px] font-bold text-white/40">발급</p>
                        <p className="mt-0.5 text-sm font-bold text-white/80">{issue.downloadedCount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white/40">사용</p>
                        <p className="mt-0.5 text-sm font-bold text-white/80">{issue.usedCount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white/40">사용률</p>
                        <p className="mt-0.5 text-sm font-bold text-white/80">
                          {percent(issue.usedCount, issue.downloadedCount)}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end">
                      <span className="text-[11px] font-bold text-[var(--hm-accent-gold)]">
                        상세 보기 ›
                      </span>
                    </div>
                  </Link>
                ))}
                {filteredCouponIssues.length === 0 ? (
                  <p className="rounded-[16px] border border-dashed border-[rgba(255,255,255,.12)] px-5 py-8 text-center text-sm font-semibold text-white/42">
                    조건에 맞는 쿠폰이 없습니다.
                  </p>
                ) : null}
              </div>

              {/* PC: 행을 누르면 상세로 이동 */}
              <div className="hidden rounded-[18px] border border-[rgba(255,255,255,.08)] lg:block">
                <div className="grid grid-cols-[48px_minmax(0,1fr)_110px_110px_64px_64px_72px_80px] items-center gap-2 bg-white/[0.035] px-4 py-3.5 text-xs font-extrabold text-[var(--hm-accent-gold)]">
                  <span>번호</span>
                  <span>쿠폰명</span>
                  <span>종류</span>
                  <span>할인 혜택</span>
                  <span>발급</span>
                  <span>사용</span>
                  <span>사용률</span>
                  <span>상태</span>
                </div>
                <div className="divide-y divide-[rgba(255,255,255,.06)]">
                  {filteredCouponIssues.map((issue, index) => (
                    <Link
                      key={issue.id}
                      href={`/admin/coupons/${issue.id}`}
                      className="hm-link-focus grid grid-cols-[48px_minmax(0,1fr)_110px_110px_64px_64px_72px_80px] items-center gap-2 px-4 py-4 text-sm transition hover:bg-white/[0.03]"
                    >
                      <span className="font-mono text-xs text-white/40">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="truncate font-bold text-white">{issue.name}</span>
                      <span className="text-xs font-bold text-[var(--hm-accent-gold)]">
                        {distributionLabels[issue.distribution]}
                      </span>
                      <span className="text-white/64">{formatCurrency(issue.amount)}</span>
                      <span className="text-white/64">{issue.downloadedCount}</span>
                      <span className="text-white/64">{issue.usedCount}</span>
                      <span className="text-white/64">
                        {percent(issue.usedCount, issue.downloadedCount)}%
                      </span>
                      <span>
                        <Badge tone={issue.status === "issuing" ? "green" : "neutral"}>
                          {issue.status === "issuing" ? "활성" : "종료"}
                        </Badge>
                      </span>
                    </Link>
                  ))}
                </div>
                {filteredCouponIssues.length === 0 ? (
                  <p className="px-5 py-8 text-sm font-semibold text-white/42">
                    조건에 맞는 쿠폰이 없습니다.
                  </p>
                ) : null}
              </div>
            </div>
          </AdminPanel>
        </div>
      )}
    </AdminFrame>
  );
}
