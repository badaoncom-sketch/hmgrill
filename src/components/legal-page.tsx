import { Container } from "@/components/ui/layout";

export type LegalSection = {
  title: string;
  // "- " 로 시작하는 항목은 목록으로 묶어서 렌더링한다.
  content: string[];
};

export function LegalPage({
  eyebrow,
  title,
  effectiveDate,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  effectiveDate: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main className="hm-page-main">
      <Container className="max-w-3xl">
        <div>
          <p className="hm-eyebrow">{eyebrow}</p>
          <h1 className="hm-section-title mt-3 md:mt-5">{title}</h1>
          <p className="hm-body mt-3 text-[var(--hm-subtext)] md:mt-5">{intro}</p>
          <p className="mt-3 text-sm font-semibold text-[var(--hm-accent-gold)]">
            시행일: {effectiveDate}
          </p>
        </div>

        <div className="mt-8 grid gap-7 border-t border-[var(--hm-warm-border)] pt-8 md:mt-12 md:gap-9 md:pt-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="hm-serif text-[17px] font-bold text-[var(--hm-primary)] md:text-[19px]">
                {section.title}
              </h2>
              <div className="mt-3 grid gap-2.5">
                {groupContent(section.content).map((block, index) =>
                  block.type === "list" ? (
                    <ul key={index} className="grid list-disc gap-1.5 pl-5 text-sm leading-7 text-[var(--hm-subtext)]">
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={index} className="text-sm leading-7 text-[var(--hm-subtext)]">
                      {block.text}
                    </p>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </main>
  );
}

type ContentBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] };

function groupContent(content: string[]): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  for (const entry of content) {
    if (entry.startsWith("- ")) {
      const item = entry.slice(2);
      const last = blocks[blocks.length - 1];
      if (last && last.type === "list") {
        last.items.push(item);
      } else {
        blocks.push({ type: "list", items: [item] });
      }
    } else {
      blocks.push({ type: "p", text: entry });
    }
  }
  return blocks;
}
