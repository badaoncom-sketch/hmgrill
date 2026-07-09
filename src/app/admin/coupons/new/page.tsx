import { Globe, QrCode, Send } from "lucide-react";
import { CouponIssueForm } from "@/components/admin/coupon-issue-form";
import {
  AdminActionLink,
  AdminFrame,
  AdminPanel,
  AdminPanelHeader,
} from "@/components/admin/admin-frame";
import { requireAdminAccess } from "@/lib/auth/access";

const distributionGuides = [
  {
    icon: Globe,
    title: "홈페이지 공개",
    description: "쿠폰 페이지에 노출되어 회원이 직접 다운로드합니다. 이벤트·프로모션에 적합합니다.",
  },
  {
    icon: Send,
    title: "지급 전용",
    description:
      "홈페이지에 노출되지 않고, 관리자가 특정 회원을 지정해 지급할 때만 사용됩니다.",
  },
  {
    icon: QrCode,
    title: "비회원 QR",
    description:
      "계산대에서 직원이 QR을 보여주면 비회원 손님이 그 자리에서 발급받는 쿠폰입니다.",
  },
];

export default async function AdminCouponCreatePage() {
  const { canAccess } = await requireAdminAccess();

  return (
    <AdminFrame
      active="coupons"
      title="쿠폰 생성"
      description="쿠폰명, 금액, 수량, 사용 조건을 설정해 새 쿠폰을 발행합니다."
      backHref="/admin/coupons"
      backLabel="쿠폰 관리"
    >
      {!canAccess ? (
        <AdminPanel className="p-6">
          <p className="text-sm font-semibold text-[var(--hm-primary)]">
            관리자 권한이 확인되면 쿠폰을 생성할 수 있습니다.
          </p>
        </AdminPanel>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <AdminPanel>
            <AdminPanelHeader title="쿠폰 발행" />
            <div className="p-5">
              <CouponIssueForm />
            </div>
          </AdminPanel>

          <div className="grid content-start gap-5">
            <AdminPanel>
              <AdminPanelHeader title="배포 방식 안내" />
              <div className="grid gap-4 p-5">
                {distributionGuides.map((guide) => {
                  const Icon = guide.icon;
                  return (
                    <div key={guide.title} className="flex gap-3.5">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border border-[rgba(247,230,193,.22)] text-[var(--hm-accent-gold)]">
                        <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-extrabold text-white">{guide.title}</p>
                        <p className="mt-1 text-[13px] font-medium leading-5 text-white/55">
                          {guide.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AdminPanel>

            <AdminPanel>
              <AdminPanelHeader title="다음 단계" />
              <div className="grid gap-3 p-5">
                <AdminActionLink href="/admin/coupons/grant">
                  <Send size={17} aria-hidden="true" />
                  회원에게 직접 지급하기
                </AdminActionLink>
                <AdminActionLink href="/admin/coupons">
                  <Globe size={17} aria-hidden="true" />
                  쿠폰 목록에서 확인하기
                </AdminActionLink>
              </div>
            </AdminPanel>
          </div>
        </div>
      )}
    </AdminFrame>
  );
}
