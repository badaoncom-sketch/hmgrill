import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  Megaphone,
  Plus,
  Store,
  Ticket,
  UsersRound,
} from "lucide-react";
import {
  AdminActionLink,
  AdminFrame,
  AdminPanel,
  AdminPanelHeader,
  AdminStatCard,
} from "@/components/admin/admin-frame";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  couponEventSelect,
  couponIssueSelect,
  mapCouponEvent,
  mapCouponIssue,
} from "@/lib/coupons/db";
import {
  contentPostSelect,
  inquirySelect,
  mapContentPost,
  mapInquiry,
  mapMenuItem,
  menuItemSelect,
} from "@/lib/content/db";
import { requireAdminAccess } from "@/lib/auth/access";
import { siteContact } from "@/lib/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";

type ProfileSummaryRow = {
  id: string;
  role: "member" | "staff" | "admin";
  email_verified: boolean;
  profile_completed_at: string | null;
  created_at: string;
};

const quickActions = [
  { href: "/admin/coupons", label: "쿠폰 생성", icon: Plus },
  { href: "/admin/menu", label: "메뉴 등록", icon: ClipboardList },
  { href: "/admin/events", label: "이벤트 등록", icon: Megaphone },
  { href: "/admin/notices", label: "공지 등록", icon: CalendarDays },
  { href: "/admin/members", label: "회원 확인", icon: UsersRound },
] as const;

function isToday(value: string) {
  const date = new Date(value);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export default async function AdminPage() {
  const { canAccess } = await requireAdminAccess();

  if (!canAccess) {
    return (
      <AdminFrame
        active="dashboard"
        title="대시보드"
        description="관리자 권한과 이메일 인증이 필요합니다."
      >
        <AdminPanel className="p-6">
          <p className="text-sm font-semibold text-[var(--hm-primary)]">
            관리자 권한이 확인되면 운영 현황이 표시됩니다.
          </p>
        </AdminPanel>
      </AdminFrame>
    );
  }

  const admin = createAdminClient();
  const [
    { data: rows },
    { data: eventRows },
    { data: profileRows },
    { data: menuRows },
    { data: noticeRows },
    { data: inquiryRows },
  ] = await Promise.all([
    admin.from("coupon_issues").select(couponIssueSelect),
    admin
      .from("coupon_events")
      .select(couponEventSelect)
      .order("created_at", { ascending: false })
      .limit(12),
    admin
      .from("profiles")
      .select("id,role,email_verified,profile_completed_at,created_at")
      .order("created_at", { ascending: false }),
    admin.from("menu_items").select(menuItemSelect),
    admin
      .from("content_posts")
      .select(contentPostSelect)
      .eq("type", "notice")
      .order("created_at", { ascending: false })
      .limit(5),
    admin.from("inquiries").select(inquirySelect),
  ]);
  const couponIssues = (rows ?? []).map(mapCouponIssue);
  const recentEvents = (eventRows ?? []).map(mapCouponEvent);
  const profiles = (profileRows ?? []) as ProfileSummaryRow[];
  const menuItems = (menuRows ?? []).map(mapMenuItem);
  const recentNotices = (noticeRows ?? []).map(mapContentPost);
  const inquiries = (inquiryRows ?? []).map(mapInquiry);
  const todayEvents = recentEvents.filter((event) => isToday(event.createdAt));

  const totalIssued = couponIssues.reduce((sum, item) => sum + item.quantity, 0);
  const totalDownloaded = couponIssues.reduce((sum, item) => sum + item.downloadedCount, 0);
  const totalRemaining = couponIssues.reduce(
    (sum, item) => sum + Math.max(item.quantity - item.downloadedCount, 0),
    0,
  );
  const totalUsed = couponIssues.reduce((sum, item) => sum + item.usedCount, 0);
  const activeIssues = couponIssues.filter((item) => item.status === "issuing").length;
  const totalUsedAmount = couponIssues.reduce(
    (sum, item) => sum + item.usedCount * item.amount,
    0,
  );
  const todayUsed = todayEvents.filter((event) => event.eventType === "coupon_used").length;
  const todayDownloaded = todayEvents.filter((event) => event.eventType === "coupon_downloaded").length;
  const usageRate = totalDownloaded > 0 ? Math.round((totalUsed / totalDownloaded) * 1000) / 10 : 0;
  const downloadedShare = totalIssued > 0 ? Math.min(100, Math.round((totalDownloaded / totalIssued) * 100)) : 0;
  const usedShare = totalDownloaded > 0 ? Math.min(100, Math.round((totalUsed / totalDownloaded) * 100)) : 0;
  const memberCount = profiles.filter((profile) => profile.role === "member").length;
  const verifiedMemberCount = profiles.filter(
    (profile) => profile.role === "member" && profile.email_verified,
  ).length;
  const profileCompletedCount = profiles.filter(
    (profile) => profile.role === "member" && profile.profile_completed_at,
  ).length;
  const unresolvedInquiryCount = inquiries.filter((item) => item.status === "open").length;
  const activeMenuCount = menuItems.filter((item) => item.isActive).length;
  const featuredMenuCount = menuItems.filter((item) => item.featured).length;

  return (
    <AdminFrame
      active="dashboard"
      title="대시보드"
      description="오늘의 쿠폰 운영, 매장 상태, 최근 처리 내역을 한눈에 확인합니다."
    >
      <div className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <AdminStatCard
            icon={<Ticket size={25} strokeWidth={1.8} aria-hidden="true" />}
            label="활성 쿠폰"
            value={<>{activeIssues}개</>}
            detail={
              <>
                총 발행 {totalIssued}장 · 잔여 {totalRemaining}장
              </>
            }
          />
          <AdminStatCard
            icon={<ClipboardList size={25} strokeWidth={1.8} aria-hidden="true" />}
            label="오늘 다운로드"
            value={<>{todayDownloaded}장</>}
            detail={
              <>
                누적 다운로드 {totalDownloaded}장
              </>
            }
          />
          <AdminStatCard
            icon={<CalendarDays size={25} strokeWidth={1.8} aria-hidden="true" />}
            label="오늘 사용"
            value={<>{todayUsed}장</>}
            detail={
              <>
                전체 사용률 {usageRate}%
              </>
            }
          />
          <AdminStatCard
            icon={<UsersRound size={25} strokeWidth={1.8} aria-hidden="true" />}
            label="회원"
            value={<>{memberCount}명</>}
            detail={
              <>
                인증 {verifiedMemberCount}명 · 프로필 {profileCompletedCount}명
              </>
            }
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="grid gap-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <AdminPanel>
                <AdminPanelHeader
                  title="최근 쿠폰 처리"
                  action={
                    <Link href="/admin/coupons" className="text-xs font-bold text-[var(--hm-primary)]">
                      전체 보기 →
                    </Link>
                  }
                />
                <div className="grid divide-y divide-[rgba(255,255,255,.06)] px-5">
                  {recentEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div>
                        <p className="text-sm font-bold text-white">
                          {event.eventType === "coupon_used"
                            ? "쿠폰 사용 처리"
                            : event.eventType === "coupon_downloaded"
                              ? "쿠폰 다운로드"
                              : "쿠폰 운영 변경"}
                        </p>
                        <p className="mt-1 text-xs font-medium text-white/45">
                          처리자 {event.actorName ?? event.actorEmail ?? "-"}
                        </p>
                      </div>
                      <Badge tone={event.eventType === "coupon_used" ? "green" : "amber"}>
                        {new Date(event.createdAt).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Badge>
                    </div>
                  ))}
                  {recentEvents.length === 0 ? (
                    <p className="py-8 text-sm font-semibold text-white/42">
                      최근 처리 내역이 없습니다.
                    </p>
                  ) : null}
                </div>
                <div className="px-5 pb-5">
                  <ButtonLink href="/admin/coupons" className="w-full">
                    쿠폰 관리 바로가기
                  </ButtonLink>
                </div>
              </AdminPanel>

              <AdminPanel>
                <AdminPanelHeader title="쿠폰 운영 비율" />
                <div className="grid gap-6 p-5 md:grid-cols-[180px_1fr] md:items-center">
                  <div
                    className="mx-auto grid h-40 w-40 place-items-center rounded-full"
                    style={{
                      background: `conic-gradient(#f7e6c1 0 ${usedShare}%, #b8821e ${usedShare}% ${downloadedShare}%, rgba(255,255,255,.12) ${downloadedShare}% 100%)`,
                    }}
                  >
                    <div className="grid h-24 w-24 place-items-center rounded-full bg-[#141414] text-center shadow-[inset_0_0_24px_rgba(0,0,0,.55)]">
                      <span className="text-xs font-bold text-white/45">총 사용</span>
                      <strong className="text-2xl text-[var(--hm-primary)]">{totalUsed}장</strong>
                    </div>
                  </div>
                  <div className="grid gap-3 text-sm font-semibold">
                    <div className="flex items-center justify-between gap-4 text-white/68">
                      <span className="flex items-center gap-2">
                        <i className="h-3 w-3 rounded-sm bg-[var(--hm-primary)]" />
                        사용 완료
                      </span>
                      <span>{usedShare}%</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-white/68">
                      <span className="flex items-center gap-2">
                        <i className="h-3 w-3 rounded-sm bg-[var(--hm-accent-gold)]" />
                        다운로드
                      </span>
                      <span>{downloadedShare}%</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-white/68">
                      <span className="flex items-center gap-2">
                        <i className="h-3 w-3 rounded-sm bg-white/15" />
                        미발행 잔여
                      </span>
                      <span>{Math.max(0, 100 - downloadedShare)}%</span>
                    </div>
                  </div>
                </div>
              </AdminPanel>
            </div>

            <AdminPanel>
              <AdminPanelHeader
                title="빠른 메뉴"
                action={<span className="text-xs font-bold text-white/35">운영 바로가기</span>}
              />
              <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5">
                {quickActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <AdminActionLink key={item.href} href={item.href}>
                      <Icon size={18} aria-hidden="true" />
                      {item.label}
                    </AdminActionLink>
                  );
                })}
              </div>
            </AdminPanel>
          </div>

          <div className="grid gap-5">
            <AdminPanel>
              <AdminPanelHeader title="매장 현황" />
              <div className="p-5">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] border border-[rgba(255,255,255,.08)]">
                  <Image
                    src="/images/brand/brand-storefront.png"
                    alt="화목 본점"
                    fill
                    sizes="420px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.62))]" />
                </div>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-white">화목 본점</h2>
                    <p className="mt-2 text-sm font-semibold text-white/48">{siteContact.address}</p>
                  </div>
                  <Badge tone="green">영업중</Badge>
                </div>
                <dl className="mt-5 grid gap-3 text-sm font-semibold text-white/58">
                  <div className="flex justify-between gap-4">
                    <dt>영업시간</dt>
                    <dd className="text-white/78">11:00 - 22:00</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>전화번호</dt>
                    <dd className="text-white/78">{siteContact.phoneDisplay}</dd>
                  </div>
                </dl>
                <AdminActionLink href="/admin/menu" className="mt-5 w-full">
                  <Store size={17} aria-hidden="true" />
                  매장 정보 관리
                </AdminActionLink>
              </div>
            </AdminPanel>

            <AdminPanel>
              <AdminPanelHeader title="공지사항" />
              <div className="grid divide-y divide-[rgba(255,255,255,.06)] px-5">
                {recentNotices.map((notice) => (
                  <Link
                    key={notice.id}
                    href="/admin/notices"
                    className="hm-link-focus flex items-center justify-between gap-4 py-4 text-sm font-bold text-white/72 transition hover:text-[var(--hm-primary)]"
                  >
                    {notice.title}
                    <span className="text-xs text-white/34">
                      {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </Link>
                ))}
                {recentNotices.length === 0 ? (
                  <p className="py-8 text-sm font-semibold text-white/42">
                    등록된 공지사항이 없습니다.
                  </p>
                ) : null}
              </div>
            </AdminPanel>

            <AdminPanel>
              <AdminPanelHeader title="운영 체크" />
              <div className="grid gap-3 p-5 text-sm font-semibold text-white/58">
                <DashboardCheck
                  ok={activeIssues > 0}
                  label="발행중 쿠폰"
                  value={`${activeIssues}개`}
                />
                <DashboardCheck
                  ok={featuredMenuCount > 0 && activeMenuCount > 0}
                  label="공개 대표 메뉴"
                  value={`${featuredMenuCount}개`}
                />
                <DashboardCheck
                  ok={unresolvedInquiryCount === 0}
                  label="미처리 문의"
                  value={`${unresolvedInquiryCount}건`}
                />
                <DashboardCheck
                  ok={totalUsedAmount >= 0}
                  label="누적 할인 처리"
                  value={formatCurrency(totalUsedAmount)}
                />
              </div>
            </AdminPanel>
          </div>
        </div>
      </div>
    </AdminFrame>
  );
}

function DashboardCheck({
  ok,
  label,
  value,
}: {
  ok: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[rgba(255,255,255,.08)] bg-black/20 px-4 py-3">
      <span>{label}</span>
      <span className={ok ? "text-[var(--hm-primary)]" : "text-[var(--hm-accent-gold)]"}>
        {value}
      </span>
    </div>
  );
}
