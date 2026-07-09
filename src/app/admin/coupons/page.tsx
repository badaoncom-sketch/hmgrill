import Link from "next/link";
import { Suspense } from "react";
import {
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  Download,
  Plus,
  Send,
  Store,
  Ticket,
  TimerReset,
} from "lucide-react";
import { revokeGrantedCouponAction } from "@/app/actions/coupon-grants";
import { CouponGrantPanel } from "@/components/admin/coupon-grant-panel";
import { CouponListFilters } from "@/components/admin/coupon-list-filters";
import { CouponIssueForm } from "@/components/admin/coupon-issue-form";
import { InlineSubmitButton } from "@/components/inline-submit-button";
import {
  AdminActionLink,
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
  const [{ data: rows }, { data: matchedCouponRows }, { data: eventRows }, { data: grantRows }, { data: guestRows }] = canAccess
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
          .select(
            "id,coupon_number,status,used_at,revoked_at,grant_note,downloaded_at,valid_until,coupon_issues(name,amount),member_profile:profiles!member_coupons_member_id_fkey(name,member_uid),granter:profiles!member_coupons_granted_by_fkey(name)",
          )
          .eq("source", "admin_grant")
          .order("downloaded_at", { ascending: false })
          .limit(20),
        admin
          .from("member_coupons")
          .select(
            "id,coupon_number,status,used_at,revoked_at,downloaded_at,valid_until,coupon_issues(name,amount),granter:profiles!member_coupons_granted_by_fkey(name),staff_profile:profiles!member_coupons_used_by_staff_id_fkey(name)",
          )
          .eq("source", "guest_claim")
          .order("downloaded_at", { ascending: false })
          .limit(30),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }];
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

  const one = <T,>(value: T | T[] | null | undefined): T | undefined =>
    Array.isArray(value) ? value[0] : (value ?? undefined);
  const grants = ((grantRows ?? []) as Record<string, unknown>[]).map((row) => {
    const issue = one(row.coupon_issues as { name: string; amount: number } | null);
    const member = one(row.member_profile as { name: string | null; member_uid: string } | null);
    const granter = one(row.granter as { name: string | null } | null);
    return {
      id: row.id as string,
      couponNumber: row.coupon_number as string,
      status: row.status as string,
      usedAt: (row.used_at as string | null) ?? null,
      revokedAt: (row.revoked_at as string | null) ?? null,
      note: (row.grant_note as string | null) ?? null,
      grantedAt: row.downloaded_at as string,
      couponName: issue?.name ?? "쿠폰",
      amount: issue?.amount ?? 0,
      memberName: member?.name ?? "-",
      memberUid: member?.member_uid ?? "-",
      granterName: granter?.name ?? "-",
    };
  });
  const guestCoupons = ((guestRows ?? []) as Record<string, unknown>[]).map((row) => {
    const issue = one(row.coupon_issues as { name: string; amount: number } | null);
    const granter = one(row.granter as { name: string | null } | null);
    const staff = one(row.staff_profile as { name: string | null } | null);
    const expired =
      (row.status as string) === "expired" ||
      new Date(row.valid_until as string) < new Date();
    return {
      id: row.id as string,
      couponNumber: row.coupon_number as string,
      status: row.status as string,
      usedAt: (row.used_at as string | null) ?? null,
      issuedAt: row.downloaded_at as string,
      validUntil: row.valid_until as string,
      couponName: issue?.name ?? "쿠폰",
      amount: issue?.amount ?? 0,
      issuerName: granter?.name ?? "-",
      staffName: staff?.name ?? null,
      expired,
    };
  });
  const guestSummary = {
    issued: guestCoupons.length,
    used: guestCoupons.filter((coupon) => coupon.status === "used").length,
    unused: guestCoupons.filter((coupon) => coupon.status === "available" && !coupon.expired).length,
    expired: guestCoupons.filter((coupon) => coupon.status !== "used" && coupon.expired).length,
    issuedAmount: guestCoupons.reduce((sum, coupon) => sum + coupon.amount, 0),
    usedAmount: guestCoupons
      .filter((coupon) => coupon.status === "used")
      .reduce((sum, coupon) => sum + coupon.amount, 0),
  };

  // 지급 가능한 발행: 지급 전용(direct) + 발행중 + 재고 보유
  const grantableIssues = couponIssues
    .filter(
      (issue) =>
        issue.distribution === "direct" &&
        issue.status === "issuing" &&
        issue.quantity - issue.downloadedCount > 0,
    )
    .map((issue) => ({
      id: issue.id,
      name: issue.name,
      amount: issue.amount,
      remaining: issue.quantity - issue.downloadedCount,
      validityDays: issue.validityDays,
    }));

  const totalIssued = couponIssues.reduce((sum, item) => sum + item.quantity, 0);
  const activeCount = couponIssues.filter((issue) => issue.status === "issuing").length;
  const totalDownloaded = couponIssues.reduce((sum, item) => sum + item.downloadedCount, 0);
  const totalUsed = couponIssues.reduce((sum, item) => sum + item.usedCount, 0);
  const totalUsedAmount = couponIssues.reduce((sum, item) => sum + item.usedCount * item.amount, 0);
  const usageRate = percent(totalUsed, totalDownloaded);
  const chartSeed = couponIssues.slice(0, 7);
  const maxQuantity = Math.max(1, ...chartSeed.map((issue) => issue.quantity));
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
      description="쿠폰 생성부터 발급, 사용 내역까지 한 화면에서 관리합니다."
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

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="grid gap-5">
              <AdminPanel>
                <AdminPanelHeader title="쿠폰 목록" />
                <div className="grid gap-4 p-5">
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                    <Suspense fallback={null}>
                      <CouponListFilters />
                    </Suspense>
                    <Link
                      href="#coupon-create"
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

              <AdminPanel>
                <AdminPanelHeader title="쿠폰 발행" />
                <div id="coupon-create" className="p-5">
                  <CouponIssueForm />
                </div>
              </AdminPanel>

              <AdminPanel>
                <AdminPanelHeader title="쿠폰 직접 지급 — 회원 지정 지급" />
                <CouponGrantPanel issues={grantableIssues} />
              </AdminPanel>

            </div>

            <div className="grid gap-5">
              <AdminPanel>
                <AdminPanelHeader title="쿠폰 발급 / 사용 현황" />
                {/* 모바일: 캠페인별 진행 막대 */}
                <div className="grid gap-3 p-4 md:hidden">
                  {chartSeed.map((issue) => (
                    <div key={issue.id}>
                      <div className="flex items-baseline justify-between gap-3 text-xs font-semibold">
                        <span className="min-w-0 truncate text-white/70">{issue.name}</span>
                        <span className="shrink-0 text-white/45">
                          발급 {issue.downloadedCount} · 사용 {issue.usedCount}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#f7e6c1,#b8821e)]"
                          style={{
                            width: `${Math.min(100, Math.round((issue.downloadedCount / Math.max(1, issue.quantity)) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {chartSeed.length === 0 ? (
                    <p className="py-4 text-center text-sm font-semibold text-white/42">
                      표시할 캠페인이 없습니다.
                    </p>
                  ) : null}
                </div>
                {/* 태블릿·PC: 막대 차트 */}
                <div className="hidden h-[310px] items-end gap-4 px-5 pb-6 pt-8 md:flex">
                  {(chartSeed.length > 0 ? chartSeed : [{ id: "empty", quantity: 1, usedCount: 0, downloadedCount: 0, name: "대기" }]).map((issue) => {
                    const downloadedHeight = Math.max(10, Math.round((issue.downloadedCount / maxQuantity) * 190));
                    const usedHeight = Math.max(8, Math.round((issue.usedCount / maxQuantity) * 190));
                    return (
                      <div key={issue.id} className="flex flex-1 flex-col items-center justify-end gap-2">
                        <div className="flex h-[200px] items-end gap-1.5">
                          <span
                            className="w-3 rounded-t-full bg-[linear-gradient(180deg,#f7e6c1,#b8821e)]"
                            style={{ height: `${downloadedHeight}px` }}
                          />
                          <span
                            className="w-3 rounded-t-full bg-white/32"
                            style={{ height: `${usedHeight}px` }}
                          />
                        </div>
                        <span className="max-w-[48px] truncate text-[11px] font-semibold text-white/42">
                          {issue.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </AdminPanel>

              <AdminPanel>
                <AdminPanelHeader title="쿠폰 사용 현황" />
                <div className="grid gap-6 p-5">
                  <div
                    className="mx-auto grid h-44 w-44 place-items-center rounded-full"
                    style={{
                      background: `conic-gradient(#f7e6c1 0 ${usageRate}%, #b8821e ${usageRate}% ${percent(totalDownloaded, totalIssued)}%, rgba(255,255,255,.12) ${percent(totalDownloaded, totalIssued)}% 100%)`,
                    }}
                  >
                    <div className="grid h-28 w-28 place-items-center rounded-full bg-[#141414] text-center shadow-[inset_0_0_24px_rgba(0,0,0,.55)]">
                      <span className="text-xs font-bold text-white/45">총 사용 수</span>
                      <strong className="text-2xl text-[var(--hm-primary)]">{totalUsed}장</strong>
                    </div>
                  </div>
                  <div className="grid gap-3 text-sm font-semibold text-white/68">
                    <div className="flex justify-between">
                      <span>다운로드</span>
                      <span>{totalDownloaded}장</span>
                    </div>
                    <div className="flex justify-between">
                      <span>사용 완료</span>
                      <span>{totalUsed}장</span>
                    </div>
                    <div className="flex justify-between">
                      <span>사용률</span>
                      <span>{usageRate}%</span>
                    </div>
                  </div>
                </div>
              </AdminPanel>

              <AdminPanel>
                <AdminPanelHeader title="운영 안내" />
                <div className="grid gap-3 p-5">
                  <AdminActionLink href="/admin/coupons/settlement">
                    <CircleDollarSign size={17} aria-hidden="true" />
                    쿠폰 정산 리포트
                  </AdminActionLink>
                  <AdminActionLink href="/admin/coupons/insights/overview">
                    <BarChart3 size={17} aria-hidden="true" />
                    전체 쿠폰 분석
                  </AdminActionLink>
                  <AdminActionLink href="/admin/coupons/insights/issued">
                    <Send size={17} aria-hidden="true" />
                    발급 수량 안내
                  </AdminActionLink>
                  <AdminActionLink href="/admin/coupons/insights/used">
                    <Download size={17} aria-hidden="true" />
                    사용 수량 안내
                  </AdminActionLink>
                </div>
              </AdminPanel>
            </div>
          </div>

          <AdminPanel>
            <AdminPanelHeader title="직접 지급 내역" />
            <div className="p-4 md:p-5">
              {/* 모바일·태블릿: 카드 리스트 */}
              <div className="grid gap-3 lg:hidden">
                {grants.map((grant) => {
                  const revoked = Boolean(grant.revokedAt);
                  return (
                    <div key={grant.id} className="rounded-[16px] border border-[rgba(255,255,255,.08)] bg-black/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">
                            {grant.memberName}
                            <span className="ml-1.5 font-mono text-[11px] tracking-[0.08em] text-[var(--hm-accent-gold)]">
                              {grant.memberUid}
                            </span>
                          </p>
                          <p className="mt-1 truncate text-xs font-semibold text-white/55">{grant.couponName}</p>
                        </div>
                        <p className="shrink-0 text-[16px] font-bold text-[var(--hm-primary)]">
                          {formatCurrency(grant.amount)}
                        </p>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-white/45">
                        <span>{new Date(grant.grantedAt).toLocaleDateString("ko-KR")}</span>
                        <span>지급 {grant.granterName}</span>
                        {grant.note ? <span className="truncate">메모 {grant.note}</span> : null}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <Badge tone={revoked ? "red" : grant.status === "used" ? "neutral" : grant.status === "available" ? "green" : "neutral"}>
                          {revoked ? "회수됨" : grant.status === "used" ? "사용완료" : grant.status === "available" ? "미사용" : "기간만료"}
                        </Badge>
                        {!revoked && grant.status === "available" ? (
                          <form action={revokeGrantedCouponAction}>
                            <input type="hidden" name="memberCouponId" value={grant.id} />
                            <InlineSubmitButton className="hm-link-focus rounded-[10px] border border-[rgba(198,59,45,.4)] px-3 py-1.5 text-xs font-bold text-[#f0a39b]">
                              회수
                            </InlineSubmitButton>
                          </form>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
                {grants.length === 0 ? (
                  <p className="rounded-[16px] border border-dashed border-[rgba(255,255,255,.12)] px-5 py-8 text-center text-sm font-semibold text-white/42">
                    직접 지급한 쿠폰이 없습니다.
                  </p>
                ) : null}
              </div>

              <div className="hidden overflow-x-auto rounded-[18px] border border-[rgba(255,255,255,.08)] lg:block">
                <table className="w-full min-w-[820px] border-collapse text-sm">
                  <thead className="bg-white/[0.035]">
                    <tr>
                          {["지급일", "회원", "쿠폰", "금액", "지급자", "메모", "상태", "관리"].map((head) => (
                        <th key={head} className="px-4 py-3.5 text-left text-xs font-extrabold text-[var(--hm-accent-gold)]">
                              {head}
                        </th>
                          ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,.06)]">
                        {grants.map((grant) => {
                          const revoked = Boolean(grant.revokedAt);
                          const stateLabel = revoked
                            ? "회수됨"
                            : grant.status === "used"
                              ? "사용완료"
                              : grant.status === "available"
                                ? "미사용"
                                : "기간만료";
                          return (
                        <tr key={grant.id} className="transition hover:bg-white/[0.025]">
                          <td className="px-4 py-3.5 text-white/60">
                                {new Date(grant.grantedAt).toLocaleDateString("ko-KR")}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-white">{grant.memberName}</span>
                            <span className="ml-2 font-mono text-[11px] tracking-[0.1em] text-[var(--hm-accent-gold)]">
                                  {grant.memberUid}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-white/72">{grant.couponName}</td>
                          <td className="px-4 py-3.5 font-bold text-[var(--hm-primary)]">
                                {formatCurrency(grant.amount)}
                          </td>
                          <td className="px-4 py-3.5 text-white/60">{grant.granterName}</td>
                          <td className="max-w-[180px] truncate px-4 py-3.5 text-white/50">
                                {grant.note ?? "-"}
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge
                                  tone={revoked ? "red" : grant.status === "used" ? "neutral" : grant.status === "available" ? "green" : "neutral"}
                                >
                                  {stateLabel}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5">
                                {!revoked && grant.status === "available" ? (
                              <form action={revokeGrantedCouponAction}>
                                <input type="hidden" name="memberCouponId" value={grant.id} />
                                <button
                                      type="submit"
                                      className="hm-link-focus rounded-[8px] border border-[rgba(198,59,45,.4)] px-2.5 py-1 text-xs font-bold text-[#f0a39b] transition hover:bg-[rgba(198,59,45,.14)]"
                                    >
                                      회수
                                </button>
                              </form>
                                ) : (
                              <span className="text-xs text-white/30">-</span>
                                )}
                          </td>
                        </tr>
                          );
                        })}
                  </tbody>
                </table>
                    {grants.length === 0 ? (
                  <p className="px-5 py-8 text-sm font-semibold text-white/42">
                        직접 지급한 쿠폰이 없습니다.
                  </p>
                    ) : null}
              </div>
            </div>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelHeader title="비회원 쿠폰 내역 — 계산대 QR 발급" />
            <div className="p-4 md:p-5">
              <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1.5 rounded-[14px] border border-[rgba(255,255,255,.08)] bg-black/20 px-4 py-3 text-[13px] font-semibold text-white/60 md:text-sm">
                <span>
                  발급 {guestSummary.issued}장 · {formatCurrency(guestSummary.issuedAmount)}
                </span>
                <span className="text-emerald-200/80">
                  사용 {guestSummary.used}장 · {formatCurrency(guestSummary.usedAmount)}
                </span>
                <span>미사용 {guestSummary.unused}장</span>
                <span className="text-white/40">만료 {guestSummary.expired}장</span>
              </div>
              {/* 모바일·태블릿: 카드 리스트 */}
              <div className="grid gap-3 lg:hidden">
                {guestCoupons.map((coupon) => (
                  <div key={coupon.id} className="rounded-[16px] border border-[rgba(255,255,255,.08)] bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-[13px] tracking-[0.1em] text-[var(--hm-primary)]">
                          {coupon.couponNumber}
                        </p>
                        <p className="mt-1 truncate text-xs font-semibold text-white/55">{coupon.couponName}</p>
                      </div>
                      <p className="shrink-0 text-[16px] font-bold text-[var(--hm-primary)]">
                        {formatCurrency(coupon.amount)}
                      </p>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-white/45">
                      <span>발급 {new Date(coupon.issuedAt).toLocaleDateString("ko-KR")}</span>
                      <span>{coupon.issuerName}</span>
                      <span>~{new Date(coupon.validUntil).toLocaleDateString("ko-KR")}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <Badge tone={coupon.status === "used" ? "green" : coupon.expired ? "red" : "neutral"}>
                        {coupon.status === "used" ? "사용완료" : coupon.expired ? "만료" : "미사용"}
                      </Badge>
                      {coupon.staffName ? (
                        <span className="text-[11px] font-semibold text-white/45">처리 {coupon.staffName}</span>
                      ) : null}
                    </div>
                  </div>
                ))}
                {guestCoupons.length === 0 ? (
                  <p className="rounded-[16px] border border-dashed border-[rgba(255,255,255,.12)] px-5 py-8 text-center text-sm font-semibold text-white/42">
                    발급된 비회원 쿠폰이 없습니다.
                  </p>
                ) : null}
              </div>

              <div className="hidden overflow-x-auto rounded-[18px] border border-[rgba(255,255,255,.08)] lg:block">
                <table className="w-full min-w-[820px] border-collapse text-sm">
                  <thead className="bg-white/[0.035]">
                    <tr>
                      {["발급일", "쿠폰번호", "캠페인", "금액", "발급 직원", "유효기간", "상태", "처리 직원"].map((head) => (
                        <th
                          key={head}
                          className="px-4 py-3.5 text-left text-xs font-extrabold text-[var(--hm-accent-gold)]"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,.06)]">
                    {guestCoupons.map((coupon) => (
                      <tr key={coupon.id} className="transition hover:bg-white/[0.025]">
                        <td className="px-4 py-3.5 text-white/60">
                          {new Date(coupon.issuedAt).toLocaleDateString("ko-KR")}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[13px] tracking-[0.1em] text-[var(--hm-primary)]">
                          {coupon.couponNumber}
                        </td>
                        <td className="px-4 py-3.5 text-white/72">{coupon.couponName}</td>
                        <td className="px-4 py-3.5 font-bold text-[var(--hm-primary)]">
                          {formatCurrency(coupon.amount)}
                        </td>
                        <td className="px-4 py-3.5 text-white/60">{coupon.issuerName}</td>
                        <td className="px-4 py-3.5 text-white/60">
                          {new Date(coupon.validUntil).toLocaleDateString("ko-KR")}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge
                            tone={
                              coupon.status === "used"
                                ? "green"
                                : coupon.expired
                                  ? "red"
                                  : "neutral"
                            }
                          >
                            {coupon.status === "used"
                              ? "사용완료"
                              : coupon.expired
                                ? "만료"
                                : "미사용"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-white/60">{coupon.staffName ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {guestCoupons.length === 0 ? (
                  <p className="px-5 py-8 text-sm font-semibold text-white/42">
                    발급된 비회원 쿠폰이 없습니다.
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
