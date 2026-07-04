import { notFound } from "next/navigation";
import { updateUserRoleAction } from "@/app/actions/admin-users";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/field";
import { requireAdminAccess } from "@/lib/auth/access";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/types";

const sections: Record<string, string> = {
  members: "회원관리",
  staff: "직원관리",
  menu: "메뉴관리",
  events: "이벤트관리",
  notices: "공지사항관리",
  inquiries: "문의관리",
  banners: "배너관리",
  popups: "팝업관리",
};

const roleLabels: Record<UserRole, string> = {
  member: "회원",
  staff: "직원",
  admin: "관리자",
};

const roleTones: Record<UserRole, "neutral" | "green" | "red"> = {
  member: "neutral",
  staff: "green",
  admin: "red",
};

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  email_verified: boolean;
  created_at: string;
};

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const title = sections[section];
  const { canAccess } = await requireAdminAccess();

  if (!title) {
    notFound();
  }

  if (!canAccess) {
    return (
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="ADMIN"
          title={title}
          description="관리자 운영 메뉴입니다."
        />
        <Card>
          <CardContent>
            <p className="text-sm font-semibold text-red-700">
              관리자 권한과 이메일 인증이 필요합니다.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (section === "members" || section === "staff") {
    const query = createAdminClient()
      .from("profiles")
      .select("id,name,email,phone,role,email_verified,created_at")
      .order("created_at", { ascending: false });
    const { data: rows } =
      section === "members"
        ? await query.eq("role", "member")
        : await query.in("role", ["staff", "admin"]);
    const profiles = (rows ?? []) as ProfileRow[];

    return (
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="ADMIN"
          title={title}
          description="회원 권한과 이메일 인증 상태를 확인하고 운영 권한을 조정합니다."
        />
        <Card>
          <CardContent className="grid gap-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="grid gap-4 rounded-md border border-neutral-200 p-4 lg:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-neutral-950">{profile.name}</h2>
                    <Badge tone={roleTones[profile.role]}>
                      {roleLabels[profile.role]}
                    </Badge>
                    <Badge tone={profile.email_verified ? "green" : "amber"}>
                      {profile.email_verified ? "이메일 인증" : "미인증"}
                    </Badge>
                  </div>
                  <dl className="mt-3 grid gap-2 text-sm text-neutral-600 sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold text-neutral-900">이메일</dt>
                      <dd>{profile.email}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-neutral-900">연락처</dt>
                      <dd>{profile.phone || "-"}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-neutral-900">가입일</dt>
                      <dd>
                        {new Date(profile.created_at).toLocaleDateString("ko-KR")}
                      </dd>
                    </div>
                  </dl>
                </div>
                <form action={updateUserRoleAction} className="flex items-end gap-2">
                  <input name="userId" type="hidden" value={profile.id} />
                  <Select
                    name="role"
                    aria-label={`${profile.name} 권한`}
                    defaultValue={profile.role}
                  >
                    <option value="member">회원</option>
                    <option value="staff">직원</option>
                    <option value="admin">관리자</option>
                  </Select>
                  <Button type="submit" variant="outline">
                    변경
                  </Button>
                </form>
              </div>
            ))}
            {profiles.length === 0 ? (
              <p className="text-sm font-semibold text-neutral-600">
                표시할 계정이 없습니다.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="ADMIN"
        title={title}
        description="관리자 권한과 데이터 모델 연결 후 실제 운영 화면으로 확장합니다."
      />
      <Card>
        <CardContent>
          <p className="text-sm leading-6 text-neutral-600">
            현재 1차 구현에서는 관리자 메뉴 라우트와 접근 구조를 먼저
            구성했습니다. 이후 Supabase 테이블, RLS, 서버 액션 연결 단계에서
            실제 목록과 편집 기능을 구현합니다.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
