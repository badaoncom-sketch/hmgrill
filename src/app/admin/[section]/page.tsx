import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { updateUserRoleAction } from "@/app/actions/admin-users";
import {
  createContentPostAction,
  createMenuItemAction,
  createSiteBannerAction,
  createSitePopupAction,
  updateContentPostStatusAction,
  updateInquiryStatusAction,
  updateMenuItemStatusAction,
  updateSiteBannerStatusAction,
  updateSitePopupStatusAction,
} from "@/app/actions/content";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { requireAdminAccess } from "@/lib/auth/access";
import {
  contentPostSelect,
  inquirySelect,
  mapContentPost,
  mapInquiry,
  mapMenuItem,
  mapSiteBanner,
  mapSitePopup,
  menuItemSelect,
  siteBannerSelect,
  sitePopupSelect,
} from "@/lib/content/db";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ContentPostType,
  ContentStatus,
  InquiryStatus,
  MenuItem,
  UserRole,
} from "@/lib/types";

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

const statusLabels: Record<ContentStatus, string> = {
  draft: "초안",
  published: "공개",
  archived: "보관",
};

const inquiryStatusLabels: Record<InquiryStatus, string> = {
  open: "접수",
  answered: "답변",
  closed: "종료",
};

const menuCategories: MenuItem["category"][] = [
  "대표메뉴",
  "전체메뉴",
  "세트메뉴",
  "사이드",
  "음료",
];

function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="ADMIN" title={title} description={description} />
      {children}
    </main>
  );
}

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

  if (section === "menu") {
    const { data: rows } = await createAdminClient()
      .from("menu_items")
      .select(menuItemSelect)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    const menuItems = (rows ?? []).map(mapMenuItem);

    return (
      <AdminShell
        title={title}
        description="공개 메뉴 목록을 추가하고 노출 여부를 관리합니다."
      >
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardContent>
              <form action={createMenuItemAction} className="grid gap-4">
                <Field label="카테고리">
                  <Select name="category" defaultValue="대표메뉴">
                    {menuCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="메뉴명">
                  <Input name="name" required />
                </Field>
                <Field label="설명">
                  <Textarea name="description" />
                </Field>
                <Field label="가격">
                  <Input name="price" min={0} required type="number" />
                </Field>
                <Field label="정렬순서">
                  <Input name="sortOrder" defaultValue={0} type="number" />
                </Field>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
                  <input name="featured" type="checkbox" /> 대표 노출
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
                  <input name="isActive" defaultChecked type="checkbox" /> 공개
                </label>
                <Button type="submit">메뉴 추가</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid gap-4">
              {menuItems.map((item) => (
                <div key={item.id} className="rounded-md border border-neutral-200 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-neutral-950">{item.name}</h2>
                    <Badge tone={item.isActive ? "green" : "neutral"}>
                      {item.isActive ? "공개" : "비공개"}
                    </Badge>
                    <Badge>{item.category}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600">{item.description}</p>
                  <form
                    action={updateMenuItemStatusAction}
                    className="mt-4 flex items-center gap-3"
                  >
                    <input name="id" type="hidden" value={item.id} />
                    <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
                      <input
                        name="isActive"
                        defaultChecked={item.isActive}
                        type="checkbox"
                      />
                      공개
                    </label>
                    <Button type="submit" variant="outline">
                      저장
                    </Button>
                  </form>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </AdminShell>
    );
  }

  if (section === "events" || section === "notices") {
    const type: ContentPostType = section === "events" ? "event" : "notice";
    const { data: rows } = await createAdminClient()
      .from("content_posts")
      .select(contentPostSelect)
      .eq("type", type)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    const posts = (rows ?? []).map(mapContentPost);

    return (
      <AdminShell
        title={title}
        description="게시 콘텐츠를 작성하고 공개, 초안, 보관 상태를 관리합니다."
      >
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardContent>
              <form action={createContentPostAction} className="grid gap-4">
                <input name="type" type="hidden" value={type} />
                <Field label="제목">
                  <Input name="title" required />
                </Field>
                <Field label="내용">
                  <Textarea name="body" required />
                </Field>
                <Field label="상태">
                  <Select name="status" defaultValue="published">
                    <option value="published">공개</option>
                    <option value="draft">초안</option>
                    <option value="archived">보관</option>
                  </Select>
                </Field>
                <Field label="정렬순서">
                  <Input name="sortOrder" defaultValue={0} type="number" />
                </Field>
                <Button type="submit">콘텐츠 추가</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid gap-4">
              {posts.map((post) => (
                <div key={post.id} className="rounded-md border border-neutral-200 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-neutral-950">{post.title}</h2>
                    <Badge tone={post.status === "published" ? "green" : "neutral"}>
                      {statusLabels[post.status]}
                    </Badge>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm text-neutral-600">
                    {post.body}
                  </p>
                  <form
                    action={updateContentPostStatusAction}
                    className="mt-4 flex items-center gap-2"
                  >
                    <input name="id" type="hidden" value={post.id} />
                    <input name="type" type="hidden" value={type} />
                    <Select
                      name="status"
                      aria-label={`${post.title} 상태`}
                      defaultValue={post.status}
                    >
                      <option value="published">공개</option>
                      <option value="draft">초안</option>
                      <option value="archived">보관</option>
                    </Select>
                    <Button type="submit" variant="outline">
                      저장
                    </Button>
                  </form>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </AdminShell>
    );
  }

  if (section === "inquiries") {
    const { data: rows } = await createAdminClient()
      .from("inquiries")
      .select(inquirySelect)
      .order("created_at", { ascending: false });
    const inquiries = (rows ?? []).map(mapInquiry);

    return (
      <AdminShell
        title={title}
        description="고객 문의 접수 내역을 확인하고 처리 상태를 관리합니다."
      >
        <Card>
          <CardContent className="grid gap-4">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="rounded-md border border-neutral-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold text-neutral-950">{inquiry.name}</h2>
                  <Badge tone={inquiry.status === "open" ? "amber" : "neutral"}>
                    {inquiryStatusLabels[inquiry.status]}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-neutral-500">{inquiry.email}</p>
                <p className="mt-3 whitespace-pre-line text-sm text-neutral-700">
                  {inquiry.message}
                </p>
                <form
                  action={updateInquiryStatusAction}
                  className="mt-4 grid gap-3 md:grid-cols-[180px_1fr_auto]"
                >
                  <input name="id" type="hidden" value={inquiry.id} />
                  <Select
                    name="status"
                    aria-label={`${inquiry.name} 문의 상태`}
                    defaultValue={inquiry.status}
                  >
                    <option value="open">접수</option>
                    <option value="answered">답변</option>
                    <option value="closed">종료</option>
                  </Select>
                  <Input
                    name="adminNote"
                    defaultValue={inquiry.adminNote ?? ""}
                    placeholder="관리 메모"
                  />
                  <Button type="submit" variant="outline">
                    저장
                  </Button>
                </form>
              </div>
            ))}
            {inquiries.length === 0 ? (
              <p className="text-sm font-semibold text-neutral-600">
                접수된 문의가 없습니다.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </AdminShell>
    );
  }

  if (section === "banners" || section === "popups") {
    const isBanner = section === "banners";
    const admin = createAdminClient();
    const { data: rows } = isBanner
      ? await admin
          .from("site_banners")
          .select(siteBannerSelect)
          .order("sort_order", { ascending: true })
      : await admin
          .from("site_popups")
          .select(sitePopupSelect)
          .order("sort_order", { ascending: true });
    const items = isBanner
      ? (rows ?? []).map(mapSiteBanner)
      : (rows ?? []).map(mapSitePopup);

    return (
      <AdminShell
        title={title}
        description="홈 화면 운영 노출 요소를 추가하고 활성 상태를 관리합니다."
      >
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardContent>
              <form
                action={isBanner ? createSiteBannerAction : createSitePopupAction}
                className="grid gap-4"
              >
                <Field label="제목">
                  <Input name="title" required />
                </Field>
                <Field label="내용">
                  <Textarea name="body" />
                </Field>
                {isBanner ? (
                  <>
                    <Field label="이미지 URL">
                      <Input name="imageUrl" placeholder="https://..." />
                    </Field>
                    <Field label="노출 위치">
                      <Input name="placement" defaultValue="home" />
                    </Field>
                  </>
                ) : null}
                <Field label="연결 URL">
                  <Input name="href" placeholder="/coupons" />
                </Field>
                <Field label="정렬순서">
                  <Input name="sortOrder" defaultValue={0} type="number" />
                </Field>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
                  <input name="isActive" defaultChecked type="checkbox" /> 활성
                </label>
                <Button type="submit">{isBanner ? "배너 추가" : "팝업 추가"}</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid gap-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-md border border-neutral-200 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-neutral-950">{item.title}</h2>
                    <Badge tone={item.isActive ? "green" : "neutral"}>
                      {item.isActive ? "활성" : "비활성"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600">{item.body}</p>
                  <form
                    action={
                      isBanner
                        ? updateSiteBannerStatusAction
                        : updateSitePopupStatusAction
                    }
                    className="mt-4 flex items-center gap-3"
                  >
                    <input name="id" type="hidden" value={item.id} />
                    <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
                      <input
                        name="isActive"
                        defaultChecked={item.isActive}
                        type="checkbox"
                      />
                      활성
                    </label>
                    <Button type="submit" variant="outline">
                      저장
                    </Button>
                  </form>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </AdminShell>
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
