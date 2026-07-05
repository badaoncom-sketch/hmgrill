import { submitInquiryAction } from "@/app/actions/content";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { faqs } from "@/lib/site-data";

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="SUPPORT"
        title="고객센터"
        description="방문 전 궁금한 내용과 매장 이용 문의를 남길 수 있습니다."
      />
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          {faqs.map((item) => (
            <Card key={item.question}>
              <CardContent>
                <h2 className="font-bold text-[var(--hm-text)]">{item.question}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--hm-subtext)]">
                  {item.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent>
            {sent === "1" ? (
              <div className="mb-4 rounded-[14px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-4 text-sm font-semibold text-[var(--hm-primary)]">
                문의가 접수되었습니다.
              </div>
            ) : null}
            <form action={submitInquiryAction} className="grid gap-4">
              <input
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />
              <Field label="이름">
                <Input name="name" placeholder="홍길동" maxLength={80} required />
              </Field>
              <Field label="이메일">
                <Input
                  name="email"
                  placeholder="member@example.com"
                  type="email"
                  maxLength={180}
                  required
                />
              </Field>
              <Field label="문의내용">
                <Textarea
                  name="message"
                  placeholder="문의 내용을 10자 이상 입력해 주세요."
                  minLength={10}
                  maxLength={2000}
                  required
                />
              </Field>
              <Button type="submit" className="w-full sm:w-fit">
                문의 접수
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
