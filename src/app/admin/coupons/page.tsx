import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Download,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Store,
  Ticket,
  TimerReset,
} from "lucide-react";
import {
  resumeCouponIssueAction,
  stopCouponIssueAction,
} from "@/app/actions/coupons";
import { CouponIssueForm } from "@/components/admin/coupon-issue-form";
import {
  AdminActionLink,
  AdminFrame,
  AdminPanel,
  AdminPanelHeader,
  AdminStatCard,
} from "@/components/admin/admin-frame";
import { Badge } from "@/components/ui/badge";
import { requireAdminAccess } from "@/lib/auth/access";
import { couponIssueSelect, mapCouponIssue } from "@/lib/coupons/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";

function percent(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }
  return Math.round((value / total) * 1000) / 10;
}

export default async function AdminCouponsPage() {
  const { canAccess } = await requireAdminAccess();
  const { data: rows } = canAccess
    ? await createAdminClient()
        .from("coupon_issues")
        .select(couponIssueSelect)
        .order("created_at", { ascending: false })
    : { data: [] };
  const couponIssues = (rows ?? []).map(mapCouponIssue);

  const totalIssued = couponIssues.reduce((sum, item) => sum + item.quantity, 0);
  const activeCount = couponIssues.filter((issue) => issue.status === "issuing").length;
  const totalDownloaded = couponIssues.reduce((sum, item) => sum + item.downloadedCount, 0);
  const totalUsed = couponIssues.reduce((sum, item) => sum + item.usedCount, 0);
  const totalUsedAmount = couponIssues.reduce((sum, item) => sum + item.usedCount * item.amount, 0);
  const usageRate = percent(totalUsed, totalDownloaded);
  const chartSeed = couponIssues.slice(0, 7);
  const maxQuantity = Math.max(1, ...chartSeed.map((issue) => issue.quantity));

  return (
    <AdminFrame
      active="coupons"
      title="QR 쿠폰 관리"
      description="쿠폰 생성부터 발급, 사용 내역까지 한 화면에서 관리합니다."
    >
      {!canAccess ? (
        <AdminPanel className="p-6">
          <p className="text-sm font-semibold text-[var(--hm-primary)]">
            관리자 권한이 확인되면 쿠폰 이력이 표시됩니다.
          </p>
        </AdminPanel>
      ) : (
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
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
              icon={<TimerReset size={25} strokeWidth={1.8} aria-hidden="true" />}
              label="할인 처리액"
              value={formatCurrency(totalUsedAmount)}
              detail="사용 완료 기준 합산"
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="grid gap-5">
              <AdminPanel>
                <AdminPanelHeader
                  title="쿠폰 목록"
                  action={
                    <Link href="#coupon-create" className="text-xs font-bold text-[var(--hm-primary)]">
                      쿠폰 생성 →
                    </Link>
                  }
                />
                <div className="grid gap-4 p-5">
                  <div className="grid gap-3 lg:grid-cols-[150px_150px_minmax(0,1fr)_auto]">
                    <div className="flex min-h-11 items-center justify-between rounded-[12px] border border-[rgba(255,255,255,.09)] bg-black/20 px-3 text-sm font-semibold text-white/62">
                      전체 매장
                      <CalendarDays size={15} aria-hidden="true" />
                    </div>
                    <div className="flex min-h-11 items-center justify-between rounded-[12px] border border-[rgba(255,255,255,.09)] bg-black/20 px-3 text-sm font-semibold text-white/62">
                      전체 상태
                      <CalendarDays size={15} aria-hidden="true" />
                    </div>
                    <div className="flex min-h-11 items-center gap-3 rounded-[12px] border border-[rgba(255,255,255,.09)] bg-black/20 px-3 text-sm font-semibold text-white/42">
                      <Search size={16} aria-hidden="true" />
                      쿠폰명, 쿠폰 코드 검색
                    </div>
                    <Link
                      href="#coupon-create"
                      className="hm-link-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-[var(--hm-primary)] px-4 text-sm font-extrabold text-[#0d0d0d] transition hover:bg-[var(--hm-accent-gold)] hover:text-white"
                    >
                      <Plus size={17} aria-hidden="true" />
                      쿠폰 생성
                    </Link>
                  </div>

                  <div className="overflow-x-auto rounded-[18px] border border-[rgba(255,255,255,.08)]">
                    <table className="min-w-[860px] w-full border-collapse text-sm">
                      <thead className="bg-white/[0.035]">
                        <tr>
                          {["쿠폰명", "할인 혜택", "발급 수", "사용 수", "사용률", "상태", "기간", "관리"].map((head) => (
                            <th
                              key={head}
                              className="px-4 py-4 text-left text-xs font-extrabold text-[var(--hm-accent-gold)]"
                            >
                              {head}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(255,255,255,.06)]">
                        {couponIssues.map((issue) => (
                          <tr key={issue.id} className="transition hover:bg-white/[0.025]">
                            <td className="px-4 py-4 font-bold text-white">{issue.name}</td>
                            <td className="px-4 py-4 text-white/64">{formatCurrency(issue.amount)}</td>
                            <td className="px-4 py-4 text-white/64">{issue.downloadedCount}</td>
                            <td className="px-4 py-4 text-white/64">{issue.usedCount}</td>
                            <td className="px-4 py-4 text-white/64">
                              {percent(issue.usedCount, issue.downloadedCount)}%
                            </td>
                            <td className="px-4 py-4">
                              <Badge tone={issue.status === "issuing" ? "green" : "neutral"}>
                                {issue.status === "issuing" ? "활성" : "종료"}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 text-white/64">
                              다운로드 후 {issue.validityDays}일
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/admin/coupons/${issue.id}`}
                                  className="hm-link-focus text-xs font-bold text-[var(--hm-primary)]"
                                >
                                  상세
                                </Link>
                                <form
                                  action={
                                    issue.status === "issuing"
                                      ? stopCouponIssueAction
                                      : resumeCouponIssueAction
                                  }
                                >
                                  <input name="issueId" type="hidden" value={issue.id} />
                                  <button
                                    type="submit"
                                    className="hm-link-focus grid h-8 w-8 place-items-center rounded-[10px] text-white/46 transition hover:bg-white/[0.05] hover:text-[var(--hm-primary)] disabled:opacity-30"
                                    disabled={
                                      issue.status === "ended" &&
                                      issue.endReason !== "admin_stopped"
                                    }
                                    aria-label={issue.status === "issuing" ? "발행중단" : "재발행"}
                                  >
                                    <MoreHorizontal size={18} aria-hidden="true" />
                                  </button>
                                </form>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {couponIssues.length === 0 ? (
                      <p className="px-5 py-8 text-sm font-semibold text-white/42">
                        등록된 쿠폰이 없습니다.
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
            </div>

            <div className="grid gap-5">
              <AdminPanel>
                <AdminPanelHeader title="쿠폰 발급 / 사용 현황" />
                <div className="flex h-[310px] items-end gap-4 px-5 pb-6 pt-8">
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
                <AdminPanelHeader title="빠른 작업" />
                <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <AdminActionLink href="#coupon-create">
                    <Plus size={17} aria-hidden="true" />
                    쿠폰 생성
                  </AdminActionLink>
                  <AdminActionLink href="/admin/coupons">
                    <Send size={17} aria-hidden="true" />
                    쿠폰 일괄 발급
                  </AdminActionLink>
                  <AdminActionLink href="/admin/coupons">
                    <Download size={17} aria-hidden="true" />
                    엑셀 다운로드
                  </AdminActionLink>
                  <AdminActionLink href="/admin/coupons">
                    <BarChart3 size={17} aria-hidden="true" />
                    통계 리포트
                  </AdminActionLink>
                </div>
              </AdminPanel>
            </div>
          </div>
        </div>
      )}
    </AdminFrame>
  );
}
