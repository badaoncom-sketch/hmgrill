"use client";

import { CheckCircle, ScanLine } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { memberCoupons } from "@/lib/site-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export function StaffScanner() {
  const [token, setToken] = useState("cpn_demo_available_01");
  const coupon = useMemo(
    () => memberCoupons.find((item) => item.token === token.trim()),
    [token],
  );

  return (
    <div className="grid gap-5">
      <Card>
        <CardContent className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-neutral-800">
            QR 스캔 입력
            <Input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="QR 리더기로 토큰을 스캔하세요"
              autoFocus
            />
          </label>
          <p className="text-sm text-neutral-500">
            QR 리더기는 키보드 입력 장치처럼 토큰을 입력하는 것을 기준으로
            합니다.
          </p>
        </CardContent>
      </Card>

      {coupon ? (
        <Card>
          <CardContent className="grid gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Badge tone={coupon.status === "available" ? "green" : "red"}>
                  {coupon.status === "available" ? "사용 가능" : "사용 불가"}
                </Badge>
                <h2 className="mt-3 text-2xl font-bold text-neutral-950">
                  {coupon.couponName}
                </h2>
                <p className="mt-1 text-xl font-bold text-red-700">
                  {formatCurrency(coupon.amount)}
                </p>
              </div>
              <ScanLine className="text-neutral-400" size={36} aria-hidden="true" />
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-neutral-950">회원명</dt>
                <dd className="text-neutral-600">{coupon.memberName}</dd>
              </div>
              <div>
                <dt className="font-semibold text-neutral-950">사용기간</dt>
                <dd className="text-neutral-600">
                  {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-semibold text-neutral-950">사용조건</dt>
                <dd className="whitespace-pre-line text-neutral-600">
                  {coupon.conditionText}
                </dd>
              </div>
            </dl>
            {coupon.status === "available" ? (
              <Button type="button" className="w-full sm:w-fit">
                <CheckCircle size={16} aria-hidden="true" />
                사용 완료
              </Button>
            ) : (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-900">
                이미 사용되었거나 기간이 만료된 쿠폰입니다.
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <p className="text-sm font-semibold text-red-700">
              쿠폰을 찾을 수 없습니다.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
