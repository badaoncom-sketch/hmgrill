import { redirect } from "next/navigation";

// 기존 북마크·QR 링크 호환을 위해 새 경로로 이동시킨다.
export default function StaffPage() {
  redirect("/qr-coupon");
}
