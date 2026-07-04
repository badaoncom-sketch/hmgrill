import type { CouponIssue, MemberCoupon, MenuItem } from "@/lib/types";

export const menuItems: MenuItem[] = [
  {
    id: "signature-grill",
    category: "대표메뉴",
    name: "화목 시그니처 구이",
    description: "매장 대표 구이 메뉴입니다.",
    price: 39000,
    featured: true,
  },
  {
    id: "family-set",
    category: "세트메뉴",
    name: "가족 세트",
    description: "여러 명이 함께 주문하기 좋은 세트 구성입니다.",
    price: 89000,
    featured: true,
  },
  {
    id: "side-noodle",
    category: "사이드",
    name: "마무리 면",
    description: "식사 마무리를 위한 사이드 메뉴입니다.",
    price: 7000,
  },
  {
    id: "house-drink",
    category: "음료",
    name: "하우스 음료",
    description: "매장 식사와 어울리는 음료입니다.",
    price: 4000,
  },
];

export const couponIssues: CouponIssue[] = [
  {
    id: "welcome-10000",
    name: "신규 회원 10,000원 쿠폰",
    amount: 10000,
    quantity: 100,
    downloadedCount: 35,
    usedCount: 18,
    expiredCount: 2,
    validityDays: 10,
    conditionText:
      "300,000원 이상 결제 시 사용 가능합니다.\n타 쿠폰과 중복 사용이 불가능합니다.\n계산 전 직원에게 QR쿠폰을 제시해 주세요.",
    qrNotice:
      "계산 전에 직원에게 QR코드를 제시해 주세요.\n직원 확인 또는 자동 처리 후 쿠폰이 사용 완료됩니다.\n사용 완료된 쿠폰은 다시 사용할 수 없습니다.",
    redownloadPolicy: "after_use_allowed",
    useFlow: "staff_confirm",
    status: "issuing",
  },
  {
    id: "weekday-5000",
    name: "평일 방문 5,000원 쿠폰",
    amount: 5000,
    quantity: 50,
    downloadedCount: 50,
    usedCount: 31,
    expiredCount: 7,
    validityDays: 7,
    conditionText: "평일 방문 시 사용 가능합니다.",
    qrNotice: "계산 전에 직원에게 QR코드를 제시해 주세요.",
    redownloadPolicy: "once_per_member",
    useFlow: "staff_confirm",
    status: "ended",
    endReason: "quantity_sold_out",
  },
];

export const memberCoupons: MemberCoupon[] = [
  {
    id: "member-coupon-1",
    issueId: "welcome-10000",
    token: "cpn_demo_available_01",
    couponName: "신규 회원 10,000원 쿠폰",
    amount: 10000,
    memberName: "홍길동",
    downloadedAt: "2026-07-01",
    validFrom: "2026-07-01",
    validUntil: "2026-07-10",
    status: "available",
    conditionText:
      "300,000원 이상 결제 시 사용 가능합니다.\n타 쿠폰과 중복 사용이 불가능합니다.",
    qrNotice:
      "계산 전에 직원에게 QR코드를 제시해 주세요.\n직원 확인 또는 자동 처리 후 쿠폰이 사용 완료됩니다.\n사용 완료된 쿠폰은 다시 사용할 수 없습니다.\n동일 쿠폰은 사용 완료 후 다시 다운로드할 수 있습니다.",
  },
  {
    id: "member-coupon-2",
    issueId: "weekday-5000",
    token: "cpn_demo_used_01",
    couponName: "평일 방문 5,000원 쿠폰",
    amount: 5000,
    memberName: "김화목",
    downloadedAt: "2026-06-20",
    validFrom: "2026-06-20",
    validUntil: "2026-06-26",
    status: "used",
    usedAt: "2026-06-24T12:30:00+09:00",
    usedByStaffName: "직원 A",
    conditionText: "평일 방문 시 사용 가능합니다.",
    qrNotice: "계산 전에 직원에게 QR코드를 제시해 주세요.",
  },
];

export const notices = [
  {
    id: "notice-1",
    title: "QR 쿠폰 사용 안내",
    date: "2026-07-05",
    body: "쿠폰은 계산 전 직원에게 QR코드를 제시한 뒤 사용할 수 있습니다.",
  },
  {
    id: "notice-2",
    title: "직원모드 운영 기준",
    date: "2026-07-05",
    body: "POS 할인은 직원이 수동으로 적용하고, 직원모드에서 사용완료 처리합니다.",
  },
];

export const faqs = [
  {
    question: "이메일 인증 전에도 쿠폰을 받을 수 있나요?",
    answer: "이메일 인증 전에는 쿠폰 다운로드와 마이페이지 접근이 제한됩니다.",
  },
  {
    question: "사용한 쿠폰을 다시 받을 수 있나요?",
    answer:
      "관리자가 사용 후 재다운로드 가능으로 설정한 쿠폰만 사용완료 후 다시 다운로드할 수 있습니다.",
  },
];
