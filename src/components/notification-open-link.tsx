"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { markNotificationReadAction } from "@/app/actions/notifications";

// 알림 클릭은 링크 이동을 먼저 시작하고(상단 진행 바 표시), 읽음 처리는
// 백그라운드 서버 액션으로 보낸다. 읽음 처리와 redirect를 모두 기다리던
// 기존 form 제출 방식은 이동할 때까지 화면이 멈춘 것처럼 보였다.
// 주의: 액션을 startTransition으로 감싸면 Link 이동과 같은 트랜지션으로
// 묶여 라우터가 push 대신 replace를 수행해 뒤로가기가 목록을 건너뛴다.
export function NotificationOpenLink({
  id,
  href,
  unread,
  className = "",
  children,
}: {
  id: string;
  href: string | null;
  unread: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href ?? "/notifications"}
      className={className}
      onClick={() => {
        if (!unread) return;
        const formData = new FormData();
        formData.set("id", id);
        void markNotificationReadAction(formData);
      }}
    >
      {children}
    </Link>
  );
}
