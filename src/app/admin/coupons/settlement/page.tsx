import Link from "next/link";
import {
  BadgeCheck,
  CalendarRange,
  CircleDollarSign,
  Hourglass,
  TimerOff,
} from "lucide-react";
import {
  AdminFrame,
  AdminPanel,
  AdminPanelHeader,
  AdminStatCard,
} from "@/components/admin/admin-frame";
import { requireAdminAccess } from "@/lib/auth/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";

// ── KST 기준 기간 계산 ──────────────────────────────────────────
const KST_OFFSET = 9 * 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

function toKst(iso: string) {
  return new Date(new Date(iso).getTime() + KST_OFFSET);
}

function monthKey(iso: string) {
  const d = toKst(iso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

// 월요일 시작 주의 첫날(KST) 타임스탬프
function weekStartMs(iso: string) {
  const d = toKst(iso);
  const midnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const day = new Date(midnight).getUTCDay(); // 0=일
  return midnight - ((day + 6) % 7) * DAY;
}

function weekLabel(startMs: number) {
  const start = new Date(startMs);
  const end = new Date(startMs + 6 * DAY);
  const fmt = (d: Date) => `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  return `${start.getUTCFullYear()}.${fmt(start)} ~ ${fmt(end)}`;
}

type CouponRow = {
  issue_id: string;
  status: "available" | "used" | "expired";
  downloaded_at: string;
  used_at: string | null;
  valid_until: string;
  revoked_at: string | null;
};

type Bucket = {
  issuedCount: number;
  issuedAmount: number;
  usedCount: number;
  usedAmount: number;
  expiredCount: number;
  expiredAmount: number;
};

const emptyBucket = (): Bucket => ({
  issuedCount: 0,
  issuedAmount: 0,
  usedCount: 0,
  usedAmount: 0,
  expiredCount: 0,
  expiredAmount: 0,
});

export default async function CouponSettlementPage({
  searchParams,
}: {
  searchParams?: Promise<{ period?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const periodMode = params.period === "week" ? "week" : "month";
  const { canAccess } = await requireAdminAccess();
  const admin = createAdminClient();

  const [{ data: issueRows }, { data: couponRows }] = canAccess
    ? await Promise.all([
        admin
          .from("coupon_issues")
          .select("id,name,amount,distribution,status")
          .order("created_at", { ascending: false }),
        admin
          .from("member_coupons")
          .select("issue_id,status,downloaded_at,used_at,valid_until,revoked_at")
          .order("downloaded_at", { ascending: false })
          .limit(5000),
      ])
    : [{ data: [] }, { data: [] }];

  const issues = (issueRows ?? []) as {
    id: string;
    name: string;
    amount: number;
    distribution: "open" | "direct" | "guest";
    status: string;
  }[];
  const amountByIssue = new Map(issues.map((issue) => [issue.id, issue.amount]));
  const now = new Date().getTime();

  // 회수(지급 취소)된 쿠폰은 정산에서 제외한다.
  const rows = ((couponRows ?? []) as CouponRow[]).filter((row) => !row.revoked_at);
  const revokedCount = ((couponRows ?? []) as CouponRow[]).length - rows.length;

  type RowState = "used" | "expired" | "unused";
  const stateOf = (row: CouponRow): RowState =>
    row.status === "used"
      ? "used"
      : row.status === "expired" || new Date(row.valid_until).getTime() < now
        ? "expired"
        : "unused";

  // ── 누적: 전체 + 쿠폰별 ──
  const totals = {
    issuedCount: rows.length,
    issuedAmount: 0,
    usedCount: 0,
    usedAmount: 0,
    unusedCount: 0,
    unusedAmount: 0,
    expiredCount: 0,
    expiredAmount: 0,
  };
  const byIssue = new Map<
    string,
    { used: number; unused: number; expired: number }
  >();

  for (const row of rows) {
    const amount = amountByIssue.get(row.issue_id) ?? 0;
    totals.issuedAmount += amount;
    const state = stateOf(row);
    const bucket = byIssue.get(row.issue_id) ?? { used: 0, unused: 0, expired: 0 };
    bucket[state] += 1;
    byIssue.set(row.issue_id, bucket);
    if (state === "used") {
      totals.usedCount += 1;
      totals.usedAmount += amount;
    } else if (state === "expired") {
      totals.expiredCount += 1;
      totals.expiredAmount += amount;
    } else {
      totals.unusedCount += 1;
      totals.unusedAmount += amount;
    }
  }

  const issueRowsView = issues
    .map((issue) => {
      const bucket = byIssue.get(issue.id) ?? { used: 0, unused: 0, expired: 0 };
      const issued = bucket.used + bucket.unused + bucket.expired;
      return {
        ...issue,
        issued,
        issuedAmount: issued * issue.amount,
        used: bucket.used,
        usedAmount: bucket.used * issue.amount,
        unused: bucket.unused,
        unusedAmount: bucket.unused * issue.amount,
        expired: bucket.expired,
        expiredAmount: bucket.expired * issue.amount,
      };
    })
    .filter((issue) => issue.issued > 0);

  // ── 주마감 / 월마감 ──
  // 발급은 발급일, 사용은 사용일, 만료는 유효기간 종료일 기준으로 해당 기간에 귀속된다.
  const periods = new Map<string, Bucket & { sortKey: number; label: string }>();
  const keyOf = (iso: string) =>
    periodMode === "month" ? monthKey(iso) : String(weekStartMs(iso));
  const labelOf = (iso: string) =>
    periodMode === "month"
      ? `${monthKey(iso).replace("-", "년 ")}월`
      : weekLabel(weekStartMs(iso));
  const sortOf = (iso: string) =>
    periodMode === "month" ? toKst(iso).getTime() : weekStartMs(iso);

  const touch = (iso: string) => {
    const key = keyOf(iso);
    if (!periods.has(key)) {
      periods.set(key, { ...emptyBucket(), sortKey: sortOf(iso), label: labelOf(iso) });
    }
    return periods.get(key)!;
  };

  for (const row of rows) {
    const amount = amountByIssue.get(row.issue_id) ?? 0;
    const issuedBucket = touch(row.downloaded_at);
    issuedBucket.issuedCount += 1;
    issuedBucket.issuedAmount += amount;

    const state = stateOf(row);
    if (state === "used" && row.used_at) {
      const usedBucket = touch(row.used_at);
      usedBucket.usedCount += 1;
      usedBucket.usedAmount += amount;
    } else if (state === "expired") {
      const expiredBucket = touch(row.valid_until);
      expiredBucket.expiredCount += 1;
      expiredBucket.expiredAmount += amount;
    }
  }

  const periodRows = Array.from(periods.values())
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, periodMode === "month" ? 6 : 8);

  const distributionLabels: Record<string, string> = {
    open: "홈페이지",
    direct: "지급 전용",
    guest: "비회원 QR",
  };

  return (
    <AdminFrame
      active="coupons"
      title="쿠폰 정산 리포트"
      description="발행된 쿠폰의 사용·미사용·만료 수량과 금액을 쿠폰별, 기간별로 정산합니다."
    >
      {!canAccess ? (
        <AdminPanel className="p-6">
          <p className="text-sm font-semibold text-[var(--hm-primary)]">
            관리자 권한이 확인되면 정산 정보가 표시됩니다.
          </p>
        </AdminPanel>
      ) : (
        <div className="grid gap-5">
          {/* 누적 현황 */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
            <AdminStatCard
              icon={<CircleDollarSign size={25} strokeWidth={1.8} aria-hidden="true" />}
              label="발급 합계"
              value={<>{totals.issuedCount}장</>}
              detail={<>{formatCurrency(totals.issuedAmount)}</>}
            />
            <AdminStatCard
              icon={<BadgeCheck size={25} strokeWidth={1.8} aria-hidden="true" />}
              label="사용 완료"
              value={<>{totals.usedCount}장</>}
              detail={<>{formatCurrency(totals.usedAmount)} 할인 적용</>}
            />
            <AdminStatCard
              icon={<Hourglass size={25} strokeWidth={1.8} aria-hidden="true" />}
              label="미사용 (유효)"
              value={<>{totals.unusedCount}장</>}
              detail={<>{formatCurrency(totals.unusedAmount)} 사용 대기</>}
            />
            <AdminStatCard
              icon={<TimerOff size={25} strokeWidth={1.8} aria-hidden="true" />}
              label="미사용 만료"
              value={<>{totals.expiredCount}장</>}
              detail={<>{formatCurrency(totals.expiredAmount)} 소멸</>}
            />
          </div>

          {/* 쿠폰별 정산 */}
          <AdminPanel>
            <AdminPanelHeader title="쿠폰별 정산" />
            <div className="p-4 md:p-5">
              {/* 모바일·태블릿: 카드 */}
              <div className="grid gap-3 lg:hidden">
                {issueRowsView.map((issue) => (
                  <div key={issue.id} className="rounded-[16px] border border-[rgba(255,255,255,.08)] bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{issue.name}</p>
                        <p className="mt-0.5 text-[11px] font-bold text-[var(--hm-accent-gold)]">
                          {distributionLabels[issue.distribution]} · 단가 {formatCurrency(issue.amount)}
                        </p>
                      </div>
                      <p className="shrink-0 text-right text-[11px] font-semibold text-white/45">
                        발급 {issue.issued}장
                        <br />
                        {formatCurrency(issue.issuedAmount)}
                      </p>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-[10px] bg-emerald-500/[0.08] px-2 py-2">
                        <p className="text-[10px] font-bold text-emerald-200/80">사용</p>
                        <p className="mt-0.5 text-sm font-bold text-white/85">{issue.used}장</p>
                        <p className="text-[10px] font-semibold text-white/45">{formatCurrency(issue.usedAmount)}</p>
                      </div>
                      <div className="rounded-[10px] bg-white/[0.05] px-2 py-2">
                        <p className="text-[10px] font-bold text-white/50">미사용</p>
                        <p className="mt-0.5 text-sm font-bold text-white/85">{issue.unused}장</p>
                        <p className="text-[10px] font-semibold text-white/45">{formatCurrency(issue.unusedAmount)}</p>
                      </div>
                      <div className="rounded-[10px] bg-[rgba(198,59,45,.1)] px-2 py-2">
                        <p className="text-[10px] font-bold text-[#f0a39b]/80">만료</p>
                        <p className="mt-0.5 text-sm font-bold text-white/85">{issue.expired}장</p>
                        <p className="text-[10px] font-semibold text-white/45">{formatCurrency(issue.expiredAmount)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {issueRowsView.length > 0 ? (
                  <div className="rounded-[16px] border border-[rgba(247,230,193,.28)] bg-[rgba(247,230,193,.05)] p-4">
                    <p className="text-sm font-extrabold text-[var(--hm-primary)]">합계</p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-white/70">
                      <span>사용 {totals.usedCount}장<br />{formatCurrency(totals.usedAmount)}</span>
                      <span>미사용 {totals.unusedCount}장<br />{formatCurrency(totals.unusedAmount)}</span>
                      <span>만료 {totals.expiredCount}장<br />{formatCurrency(totals.expiredAmount)}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* PC: 테이블 */}
              <div className="hidden rounded-[18px] border border-[rgba(255,255,255,.08)] lg:block">
                <div className="grid grid-cols-[minmax(0,1.4fr)_90px_repeat(4,minmax(0,1fr))] items-center gap-2 bg-white/[0.035] px-4 py-3.5 text-xs font-extrabold text-[var(--hm-accent-gold)]">
                  <span>쿠폰명</span>
                  <span>종류</span>
                  <span className="text-right">발급</span>
                  <span className="text-right">사용</span>
                  <span className="text-right">미사용</span>
                  <span className="text-right">만료</span>
                </div>
                <div className="divide-y divide-[rgba(255,255,255,.06)]">
                  {issueRowsView.map((issue) => (
                    <div
                      key={issue.id}
                      className="grid grid-cols-[minmax(0,1.4fr)_90px_repeat(4,minmax(0,1fr))] items-center gap-2 px-4 py-3.5 text-sm"
                    >
                      <span className="min-w-0">
                        <Link
                          href={`/admin/coupons/${issue.id}`}
                          className="hm-link-focus block truncate font-bold text-white transition hover:text-[var(--hm-primary)]"
                        >
                          {issue.name}
                        </Link>
                        <span className="text-[11px] font-semibold text-white/40">
                          단가 {formatCurrency(issue.amount)}
                        </span>
                      </span>
                      <span className="text-xs font-bold text-[var(--hm-accent-gold)]">
                        {distributionLabels[issue.distribution]}
                      </span>
                      <span className="text-right text-white/70">
                        {issue.issued}장
                        <br />
                        <span className="text-[11px] text-white/40">{formatCurrency(issue.issuedAmount)}</span>
                      </span>
                      <span className="text-right text-emerald-200/90">
                        {issue.used}장
                        <br />
                        <span className="text-[11px] text-emerald-200/60">{formatCurrency(issue.usedAmount)}</span>
                      </span>
                      <span className="text-right text-white/70">
                        {issue.unused}장
                        <br />
                        <span className="text-[11px] text-white/40">{formatCurrency(issue.unusedAmount)}</span>
                      </span>
                      <span className="text-right text-[#f0a39b]/90">
                        {issue.expired}장
                        <br />
                        <span className="text-[11px] text-[#f0a39b]/60">{formatCurrency(issue.expiredAmount)}</span>
                      </span>
                    </div>
                  ))}
                </div>
                {issueRowsView.length > 0 ? (
                  <div className="grid grid-cols-[minmax(0,1.4fr)_90px_repeat(4,minmax(0,1fr))] items-center gap-2 border-t border-[rgba(247,230,193,.24)] bg-[rgba(247,230,193,.04)] px-4 py-4 text-sm font-extrabold">
                    <span className="text-[var(--hm-primary)]">합계</span>
                    <span />
                    <span className="text-right text-white">
                      {totals.issuedCount}장
                      <br />
                      <span className="text-[11px] text-white/55">{formatCurrency(totals.issuedAmount)}</span>
                    </span>
                    <span className="text-right text-emerald-200">
                      {totals.usedCount}장
                      <br />
                      <span className="text-[11px] text-emerald-200/70">{formatCurrency(totals.usedAmount)}</span>
                    </span>
                    <span className="text-right text-white">
                      {totals.unusedCount}장
                      <br />
                      <span className="text-[11px] text-white/55">{formatCurrency(totals.unusedAmount)}</span>
                    </span>
                    <span className="text-right text-[#f0a39b]">
                      {totals.expiredCount}장
                      <br />
                      <span className="text-[11px] text-[#f0a39b]/70">{formatCurrency(totals.expiredAmount)}</span>
                    </span>
                  </div>
                ) : null}
              </div>
              {issueRowsView.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm font-semibold text-white/42">
                  발급된 쿠폰이 없습니다.
                </p>
              ) : null}
              {revokedCount > 0 ? (
                <p className="mt-3 text-[11px] font-semibold text-white/38">
                  * 회수 처리된 쿠폰 {revokedCount}장은 정산에서 제외됩니다.
                </p>
              ) : null}
            </div>
          </AdminPanel>

          {/* 주마감 / 월마감 */}
          <AdminPanel>
            <AdminPanelHeader
              title={periodMode === "month" ? "월마감" : "주마감"}
              action={
                <div className="flex gap-1 rounded-[10px] border border-[rgba(255,255,255,.1)] bg-black/25 p-1">
                  {(
                    [
                      { key: "month", label: "월간" },
                      { key: "week", label: "주간" },
                    ] as const
                  ).map((tab) => (
                    <Link
                      key={tab.key}
                      href={tab.key === "month" ? "/admin/coupons/settlement" : "/admin/coupons/settlement?period=week"}
                      className={`hm-link-focus rounded-[7px] px-3 py-1.5 text-xs font-extrabold transition ${
                        periodMode === tab.key
                          ? "bg-[var(--hm-primary)] text-[#0d0d0d]"
                          : "text-white/55 hover:text-white/85"
                      }`}
                    >
                      {tab.label}
                    </Link>
                  ))}
                </div>
              }
            />
            <div className="p-4 md:p-5">
              <div className="grid gap-3">
                {periodRows.map((period) => (
                  <div
                    key={period.label}
                    className="grid gap-3 rounded-[16px] border border-[rgba(255,255,255,.08)] bg-black/20 p-4 sm:grid-cols-[150px_repeat(3,minmax(0,1fr))] sm:items-center"
                  >
                    <p className="flex items-center gap-2 text-sm font-extrabold text-[var(--hm-primary)]">
                      <CalendarRange size={15} className="text-[var(--hm-accent-gold)]" aria-hidden="true" />
                      {period.label}
                    </p>
                    <div className="text-sm">
                      <p className="text-[11px] font-bold text-white/40">발급</p>
                      <p className="mt-0.5 font-bold text-white/80">
                        {period.issuedCount}장 · {formatCurrency(period.issuedAmount)}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-[11px] font-bold text-emerald-200/70">사용 (할인 적용)</p>
                      <p className="mt-0.5 font-bold text-emerald-200/95">
                        {period.usedCount}장 · {formatCurrency(period.usedAmount)}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-[11px] font-bold text-[#f0a39b]/70">만료 (소멸)</p>
                      <p className="mt-0.5 font-bold text-white/75">
                        {period.expiredCount}장 · {formatCurrency(period.expiredAmount)}
                      </p>
                    </div>
                  </div>
                ))}
                {periodRows.length === 0 ? (
                  <p className="px-2 py-6 text-center text-sm font-semibold text-white/42">
                    집계할 내역이 없습니다.
                  </p>
                ) : null}
              </div>
              <p className="mt-3 text-[11px] font-semibold leading-5 text-white/38">
                * 발급은 발급일, 사용은 사용 처리일, 만료는 유효기간 종료일 기준으로 집계됩니다 (KST).
              </p>
            </div>
          </AdminPanel>
        </div>
      )}
    </AdminFrame>
  );
}
