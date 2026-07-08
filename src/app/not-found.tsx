import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";

const suggestions = [
  { href: "/menu", label: "메뉴 보기" },
  { href: "/coupons", label: "방문 혜택" },
  { href: "/store", label: "매장 안내" },
  { href: "/support", label: "고객센터" },
];

export default function NotFound() {
  return (
    <main className="hm-page-main">
      <Container>
        <div className="mx-auto max-w-xl py-10 text-center md:py-20">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[rgba(247,230,193,.2)] text-[var(--hm-accent-gold)]">
            <Compass size={28} aria-hidden="true" />
          </span>
          <p className="hm-eyebrow mt-7">404 Not Found</p>
          <h1 className="hm-subsection-title mt-3">페이지를 찾을 수 없습니다</h1>
          <p className="hm-body mt-4 text-[var(--hm-subtext)]">
            주소가 바뀌었거나 삭제된 페이지입니다.
            <br />
            아래에서 찾으시는 내용으로 이동해 보세요.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {suggestions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hm-link-focus inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[var(--hm-border)] px-4 text-sm font-semibold text-[var(--hm-subtext)] transition hover:border-[rgba(247,230,193,.32)] hover:text-[var(--hm-primary)]"
              >
                {item.label}
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            ))}
          </div>
          <ButtonLink href="/" className="mt-8">
            메인으로 돌아가기
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
