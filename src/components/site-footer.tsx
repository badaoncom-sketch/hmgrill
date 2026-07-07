import Link from "next/link";
import {
  businessInfo,
  footerNavGroups,
  policyLinks,
  siteContact,
} from "@/lib/navigation";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-[var(--hm-warm-border)] bg-[#080706]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(58%_120%_at_50%_0%,rgba(184,130,30,.08),transparent_72%)]"
      />

      <div className="hm-container relative pt-16 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          <div>
            <p className="hm-eyebrow">Hwamok · 참나무 장작구이</p>
            <p className="hm-serif mt-4 text-[clamp(23px,2.6vw,31px)] font-semibold leading-[1.42] text-[var(--hm-primary)]">
              참나무 장작의 깊은 향,
              <br />
              화목의 시간
            </p>

            <a href={siteContact.phoneHref} className="hm-link-focus group mt-9 inline-block">
              <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-white/36">
                Reservation
              </span>
              <span className="mt-1.5 block text-[26px] font-bold leading-none text-white transition group-hover:text-[var(--hm-primary)]">
                {siteContact.phoneDisplay}
              </span>
            </a>
            <p className="mt-3 text-[13px] font-medium leading-[1.7] text-white/40">
              {siteContact.hoursWeekday} · {siteContact.hoursWeekend}
            </p>
          </div>

          <div className="grid max-w-[420px] grid-cols-2 gap-10 lg:max-w-none">
            {footerNavGroups.map((group) => (
              <nav key={group.title} aria-label={`푸터 ${group.title}`}>
                <p className="hm-footer-heading">{group.title}</p>
                <ul className="mt-5 grid gap-3">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="hm-footer-link hm-link-focus">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <dl className="mt-14 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-white/[0.07] pt-6 text-[12.5px] leading-[1.7]">
          {businessInfo.map((item) => (
            <div key={item.label} className="flex gap-1.5">
              <dt className="font-semibold text-white/30">{item.label}</dt>
              <dd className="font-medium text-white/52">{item.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-col gap-3 pb-24 text-[13px] sm:flex-row sm:items-center sm:justify-between md:pb-4">
          <div className="flex items-center gap-5">
            {policyLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hm-link-focus font-semibold text-white/46 transition hover:text-[var(--hm-primary)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <span className="text-white/28">
            © {new Date().getFullYear()} HWAMOK. All rights reserved.
          </span>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="hm-serif pointer-events-none relative -mb-[0.38em] select-none whitespace-nowrap text-center text-[clamp(72px,15vw,220px)] font-bold leading-none text-[rgba(247,230,193,0.04)]"
      >
        화목 장작구이
      </p>
    </footer>
  );
}
