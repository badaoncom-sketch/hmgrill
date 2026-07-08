"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="hm-page-main">
      <Container>
        <div className="mx-auto max-w-xl py-10 text-center md:py-20">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[rgba(198,59,45,.35)] text-[#f0a39b]">
            <TriangleAlert size={28} aria-hidden="true" />
          </span>
          <p className="hm-eyebrow mt-7">Error</p>
          <h1 className="hm-subsection-title mt-3">일시적인 문제가 발생했습니다</h1>
          <p className="hm-body mt-4 text-[var(--hm-subtext)]">
            잠시 후 다시 시도해 주세요. 문제가 계속되면 고객센터로 알려 주시면
            빠르게 확인하겠습니다.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={reset}>
              <RotateCcw size={15} aria-hidden="true" />
              다시 시도
            </Button>
            <ButtonLink href="/" variant="outline">
              메인으로 돌아가기
            </ButtonLink>
          </div>
        </div>
      </Container>
    </main>
  );
}
