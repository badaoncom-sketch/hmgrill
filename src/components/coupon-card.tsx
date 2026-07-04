import { CalendarDays, Download, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { canDownloadCoupon, getRemainingQuantity } from "@/lib/coupon-policy";
import { memberCoupons } from "@/lib/site-data";
import type { CouponIssue } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function CouponCard({ issue }: { issue: CouponIssue }) {
  const decision = canDownloadCoupon(issue, memberCoupons);
  const remaining = getRemainingQuantity(issue);

  return (
    <Card>
      <CardContent className="grid gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge tone={issue.status === "issuing" ? "green" : "neutral"}>
              {issue.status === "issuing" ? "발행중" : "발행종료"}
            </Badge>
            <h2 className="mt-3 text-xl font-bold text-neutral-950">
              {issue.name}
            </h2>
            <p className="mt-1 text-2xl font-bold text-red-700">
              {formatCurrency(issue.amount)}
            </p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-md bg-red-50 text-red-700">
            <Ticket size={24} aria-hidden="true" />
          </div>
        </div>
        <div className="grid gap-2 text-sm text-neutral-600">
          <p className="flex items-center gap-2">
            <CalendarDays size={16} aria-hidden="true" />
            다운로드 후 {issue.validityDays}일 사용 가능
          </p>
          <p>
            남은 수량 {remaining}장 / 총 {issue.quantity}장
          </p>
          <p className="whitespace-pre-line">{issue.conditionText}</p>
        </div>
        <Button type="button" disabled={!decision.allowed}>
          <Download size={16} aria-hidden="true" />
          쿠폰 다운로드
        </Button>
        <p className="text-xs text-neutral-500">{decision.reason}</p>
      </CardContent>
    </Card>
  );
}
