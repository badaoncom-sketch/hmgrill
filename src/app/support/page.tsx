import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { faqs } from "@/lib/site-data";

export default function SupportPage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="SUPPORT"
        title="고객센터"
        description="FAQ와 문의하기 화면을 기획서 메뉴 기준으로 구성했습니다."
      />
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          {faqs.map((item) => (
            <Card key={item.question}>
              <CardContent>
                <h2 className="font-bold text-neutral-950">{item.question}</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {item.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent>
            <form className="grid gap-4">
              <Field label="이름">
                <Input name="name" placeholder="홍길동" />
              </Field>
              <Field label="이메일">
                <Input name="email" placeholder="member@example.com" type="email" />
              </Field>
              <Field label="문의내용">
                <Textarea name="message" placeholder="문의 내용을 입력해 주세요." />
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
