import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  ImageIcon,
  MenuSquare,
  MessageSquareText,
  Plus,
  Search,
  Ticket,
  Trash2,
  UserRound,
  UsersRound,
  XCircle,
} from "lucide-react";
import { updateUserRoleAction } from "@/app/actions/admin-users";
import {
  createContentPostAction,
  createMenuCategoryAction,
  createMenuItemAction,
  createSiteBannerAction,
  createSitePopupAction,
  deleteMenuCategoryAction,
  deleteMenuItemAction,
  moveMenuCategoryAction,
  renameMenuCategoryAction,
  updateContentPostAction,
  updateInquiryStatusAction,
  updateMenuCopyAction,
  updateMenuItemAction,
  updateSiteBannerAction,
  updateSitePopupAction,
} from "@/app/actions/content";
import { IconSubmitButton } from "@/components/icon-submit-button";
import {
  AdminFrame,
  AdminPanel,
  AdminPanelHeader,
  AdminStatCard,
} from "@/components/admin/admin-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { couponIssueSelect, mapCouponIssue } from "@/lib/coupons/db";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ContentPost,
  ContentPostType,
  ContentStatus,
  Inquiry,
  InquiryStatus,
  MenuItem,
  SiteBanner,
  SitePopup,
  UserRole,
} from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type SectionKey =
  | "members"
  | "staff"
  | "menu"
  | "events"
  | "notices"
  | "inquiries"
  | "banners"
  | "popups"
  | "reports";

type ProfileRow = {
  id: string;
  member_uid: string;
  name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  role: UserRole;
  email_verified: boolean;
  privacy_accepted_at: string | null;
  profile_completed_at: string | null;
  created_at: string;
};

const sectionMeta: Record<SectionKey, { title: string; description: string }> = {
  members: {
    title: "회원 관리",
    description: "회원 프로필, 인증 상태, 개인정보 입력 여부를 한 화면에서 관리합니다.",
  },
  staff: {
    title: "직원 관리",
    description: "직원과 관리자 권한을 확인하고 운영 접근 권한을 조정합니다.",
  },
  menu: {
    title: "메뉴 관리",
    description: "공개 메뉴와 대표 노출 메뉴를 등록하고 매장 메뉴판을 운영합니다.",
  },
  events: {
    title: "이벤트 관리",
    description: "이벤트 콘텐츠의 공개, 초안, 보관 상태를 관리합니다.",
  },
  notices: {
    title: "공지사항",
    description: "방문 고객에게 전달할 공지 콘텐츠를 작성하고 공개 상태를 관리합니다.",
  },
  inquiries: {
    title: "문의 관리",
    description: "고객 문의를 확인하고 처리 상태와 내부 메모를 관리합니다.",
  },
  banners: {
    title: "배너 관리",
    description: "홈 화면과 운영 배너의 노출 위치, 링크, 활성 상태를 관리합니다.",
  },
  popups: {
    title: "팝업 관리",
    description: "공지성 팝업과 프로모션 팝업의 노출 상태를 관리합니다.",
  },
  reports: {
    title: "통계 리포트",
    description: "쿠폰, 회원, 콘텐츠, 문의 지표를 운영 관점에서 점검합니다.",
  },
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

type MenuCategoryRow = {
  id: string;
  name: string;
  sort_order: number;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function SectionAccessDenied({ section }: { section: SectionKey }) {
  const meta = sectionMeta[section];

  return (
    <AdminFrame active={section} title={meta.title} description={meta.description}>
      <AdminPanel className="p-6">
        <p className="text-sm font-semibold text-[var(--hm-primary)]">
          관리자 권한과 이메일 인증이 필요합니다.
        </p>
      </AdminPanel>
    </AdminFrame>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[rgba(255,255,255,.12)] bg-black/20 p-8 text-center text-sm font-semibold text-white/42">
      {children}
    </div>
  );
}

function SearchShell({ children }: { children?: ReactNode }) {
  return (
    <div className="grid gap-3 border-b border-[rgba(255,255,255,.06)] p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="flex min-h-11 items-center gap-3 rounded-[14px] border border-[rgba(255,255,255,.09)] bg-black/20 px-4 text-sm font-semibold text-white/42">
        <Search size={16} aria-hidden="true" />
        현재 화면 데이터 기준으로 관리합니다. 브라우저 검색으로 빠르게 찾을 수 있습니다.
      </div>
      {children}
    </div>
  );
}

function FormPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <AdminPanel>
      <AdminPanelHeader title={title} />
      <div className="p-5">{children}</div>
    </AdminPanel>
  );
}

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: rawSection } = await params;
  const section = rawSection as SectionKey;
  const meta = sectionMeta[section];

  if (!meta) {
    notFound();
  }

  const { canAccess } = await requireAdminAccess();

  if (!canAccess) {
    return <SectionAccessDenied section={section} />;
  }

  if (section === "members" || section === "staff") {
    return <UserSection section={section} />;
  }

  if (section === "menu") {
    return <MenuSection />;
  }

  if (section === "events" || section === "notices") {
    return <ContentSection section={section} />;
  }

  if (section === "inquiries") {
    return <InquirySection />;
  }

  if (section === "banners" || section === "popups") {
    return <ExposureSection section={section} />;
  }

  return <ReportsSection />;
}

async function UserSection({ section }: { section: "members" | "staff" }) {
  const meta = sectionMeta[section];
  const query = createAdminClient()
    .from("profiles")
    .select(
      "id,member_uid,name,email,phone,address,role,email_verified,privacy_accepted_at,profile_completed_at,created_at",
    )
    .order("created_at", { ascending: false });
  const { data: rows } =
    section === "members"
      ? await query.eq("role", "member")
      : await query.in("role", ["staff", "admin"]);
  const profiles = (rows ?? []) as ProfileRow[];
  const verifiedCount = profiles.filter((profile) => profile.email_verified).length;
  const completedCount = profiles.filter(
    (profile) => profile.profile_completed_at && profile.privacy_accepted_at,
  ).length;
  const adminCount = profiles.filter((profile) => profile.role === "admin").length;

  return (
    <AdminFrame active={section} title={meta.title} description={meta.description}>
      <div className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-3">
          <AdminStatCard
            icon={<UsersRound size={24} aria-hidden="true" />}
            label="총 계정"
            value={<>{profiles.length}명</>}
            detail="현재 필터 기준"
          />
          <AdminStatCard
            icon={<CheckCircle2 size={24} aria-hidden="true" />}
            label="이메일 인증"
            value={<>{verifiedCount}명</>}
            detail={`미인증 ${profiles.length - verifiedCount}명`}
          />
          <AdminStatCard
            icon={<UserRound size={24} aria-hidden="true" />}
            label={section === "staff" ? "관리자" : "프로필 완료"}
            value={<>{section === "staff" ? adminCount : completedCount}명</>}
            detail={section === "staff" ? "관리 권한 보유" : "개인정보 동의 포함"}
          />
        </div>

        <AdminPanel>
          <AdminPanelHeader title="계정 목록" />
          <SearchShell />
          <div className="grid gap-3 p-5">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="grid gap-4 rounded-[18px] border border-[rgba(255,255,255,.08)] bg-black/20 p-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-[17px] font-extrabold text-white">
                      {profile.name || profile.email}
                    </h2>
                    <Badge tone={roleTones[profile.role]}>{roleLabels[profile.role]}</Badge>
                    <Badge tone={profile.email_verified ? "green" : "amber"}>
                      {profile.email_verified ? "이메일 인증" : "미인증"}
                    </Badge>
                    <Badge tone={profile.profile_completed_at ? "green" : "neutral"}>
                      {profile.profile_completed_at ? "프로필 완료" : "프로필 대기"}
                    </Badge>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm text-white/58 md:grid-cols-5">
                    <div>
                      <dt className="text-xs font-bold text-[var(--hm-accent-gold)]">UID</dt>
                      <dd className="mt-1 font-extrabold text-[var(--hm-primary)]">
                        {profile.member_uid}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold text-[var(--hm-accent-gold)]">이메일</dt>
                      <dd className="mt-1 truncate">{profile.email}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold text-[var(--hm-accent-gold)]">연락처</dt>
                      <dd className="mt-1">{profile.phone || "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold text-[var(--hm-accent-gold)]">주소</dt>
                      <dd className="mt-1 truncate">{profile.address || "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold text-[var(--hm-accent-gold)]">가입일</dt>
                      <dd className="mt-1">{formatDate(profile.created_at)}</dd>
                    </div>
                  </dl>
                </div>
                <form action={updateUserRoleAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input name="userId" type="hidden" value={profile.id} />
                  <Select name="role" aria-label="권한" defaultValue={profile.role}>
                    <option value="member">회원</option>
                    <option value="staff">직원</option>
                    <option value="admin">관리자</option>
                  </Select>
                  <Button type="submit" variant="outline">권한 변경</Button>
                </form>
              </div>
            ))}
            {profiles.length === 0 ? <EmptyState>표시할 계정이 없습니다.</EmptyState> : null}
          </div>
        </AdminPanel>
      </div>
    </AdminFrame>
  );
}

async function MenuSection() {
  const meta = sectionMeta.menu;
  const admin = createAdminClient();
  const [{ data: rows }, { data: categoryRows }, { data: copyRow }] = await Promise.all([
    admin
      .from("menu_items")
      .select(menuItemSelect)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    admin
      .from("menu_categories")
      .select("id,name,sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    admin.from("site_copy").select("title,body").eq("key", "menu").maybeSingle(),
  ]);
  const menuItems = (rows ?? []).map(mapMenuItem);
  const categories = (categoryRows ?? []) as MenuCategoryRow[];
  const activeCount = menuItems.filter((item) => item.isActive).length;
  const featuredCount = menuItems.filter((item) => item.featured).length;
  const itemCountByCategory = new Map<string, number>();
  for (const item of menuItems) {
    itemCountByCategory.set(item.category, (itemCountByCategory.get(item.category) ?? 0) + 1);
  }

  return (
    <AdminFrame active="menu" title={meta.title} description={meta.description}>
      <div className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-3">
          <AdminStatCard icon={<MenuSquare size={24} />} label="등록 메뉴" value={<>{menuItems.length}개</>} detail={`공개 ${activeCount}개`} />
          <AdminStatCard icon={<CheckCircle2 size={24} />} label="대표 노출" value={<>{featuredCount}개</>} detail="홈 대표 메뉴 기준" />
          <AdminStatCard icon={<Ticket size={24} />} label="카테고리" value={<>{categories.length}개</>} detail="메뉴판 구성 기준" />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <AdminPanel>
            <AdminPanelHeader
              title="카테고리"
              action={<span className="text-xs font-semibold text-white/40">순서 = 메뉴판 섹션 순서</span>}
            />
            <div className="divide-y divide-white/[0.05]">
              {categories.map((category, index) => (
                <div key={category.id} className="flex items-center gap-1.5 px-5 py-2.5">
                  <form action={renameMenuCategoryAction} className="flex min-w-0 flex-1 items-center gap-1.5">
                    <input name="id" type="hidden" value={category.id} />
                    <Input name="name" defaultValue={category.name} required className="min-h-9 flex-1 text-sm" />
                    <IconSubmitButton label="이름 저장"><Check size={15} aria-hidden="true" /></IconSubmitButton>
                  </form>
                  <span className="w-10 shrink-0 text-center font-mono text-[11px] text-white/35">
                    {itemCountByCategory.get(category.name) ?? 0}개
                  </span>
                  <form action={moveMenuCategoryAction}>
                    <input name="id" type="hidden" value={category.id} />
                    <input name="direction" type="hidden" value="up" />
                    <IconSubmitButton label="위로 이동">
                      <ArrowUp size={15} aria-hidden="true" className={index === 0 ? "opacity-25" : undefined} />
                    </IconSubmitButton>
                  </form>
                  <form action={moveMenuCategoryAction}>
                    <input name="id" type="hidden" value={category.id} />
                    <input name="direction" type="hidden" value="down" />
                    <IconSubmitButton label="아래로 이동">
                      <ArrowDown size={15} aria-hidden="true" className={index === categories.length - 1 ? "opacity-25" : undefined} />
                    </IconSubmitButton>
                  </form>
                  <form action={deleteMenuCategoryAction}>
                    <input name="id" type="hidden" value={category.id} />
                    <IconSubmitButton label="카테고리 삭제" danger><Trash2 size={15} aria-hidden="true" /></IconSubmitButton>
                  </form>
                </div>
              ))}
              {categories.length === 0 ? <div className="p-5"><EmptyState>등록된 카테고리가 없습니다.</EmptyState></div> : null}
              <form action={createMenuCategoryAction} className="flex items-center gap-2 px-5 py-3.5">
                <Input name="name" placeholder="새 카테고리 이름" required className="min-h-10 flex-1 text-sm" />
                <Button type="submit" variant="outline" className="shrink-0"><Plus size={15} aria-hidden="true" />추가</Button>
              </form>
            </div>
          </AdminPanel>

          <FormPanel title="메뉴 페이지 문구">
            <form action={updateMenuCopyAction} className="grid gap-4">
              <Field label="페이지 제목">
                <Input name="title" defaultValue={copyRow?.title ?? "화목의 메뉴"} required />
              </Field>
              <Field label="소개 문구">
                <Textarea name="body" defaultValue={copyRow?.body ?? ""} />
              </Field>
              <Button type="submit" variant="outline" className="w-fit">문구 저장</Button>
              <p className="text-xs leading-5 text-white/40">
                공개 메뉴 페이지 상단의 제목과 소개 문구가 즉시 변경됩니다.
              </p>
            </form>
          </FormPanel>
        </div>

        <AdminPanel>
          <AdminPanelHeader
            title="메뉴 목록"
            action={<span className="text-xs font-semibold text-white/40">행을 클릭하면 수정·삭제</span>}
          />
          <details className="group border-b border-white/[0.05]">
            <summary className="hm-link-focus flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-sm font-bold text-[var(--hm-primary)] transition hover:bg-white/[0.03] [&::-webkit-details-marker]:hidden">
              <span className="grid h-9 w-9 place-items-center rounded-[12px] border border-[rgba(247,230,193,.25)]">
                <Plus size={16} aria-hidden="true" />
              </span>
              새 메뉴 추가
              <ChevronDown size={16} className="ml-auto text-white/35 transition group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="border-t border-white/[0.05] bg-black/25 p-5">
              <MenuCreateForm categories={categories} />
            </div>
          </details>
          <div className="divide-y divide-white/[0.05]">
            {menuItems.map((item) => (
              <MenuListRow key={item.id} item={item} categories={categories} />
            ))}
            {menuItems.length === 0 ? <div className="p-5"><EmptyState>등록된 메뉴가 없습니다.</EmptyState></div> : null}
          </div>
        </AdminPanel>
      </div>
    </AdminFrame>
  );
}

function MenuImageInput({ label = "이미지 업로드" }: { label?: string }) {
  return (
    <Field label={label}>
      <Input
        name="imageFile"
        type="file"
        accept="image/*"
        className="cursor-pointer pt-2 text-xs text-white/55 file:mr-3 file:cursor-pointer file:rounded-[10px] file:border-0 file:bg-[var(--hm-primary)] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-[var(--hm-background)]"
      />
    </Field>
  );
}

function MenuCreateForm({ categories }: { categories: MenuCategoryRow[] }) {
  return (
    <form action={createMenuItemAction} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="카테고리"><CategorySelect categories={categories} /></Field>
        <Field label="메뉴명"><Input name="name" required /></Field>
      </div>
      <Field label="설명"><Textarea name="description" /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="가격"><Input name="price" min={0} required type="number" /></Field>
        <Field label="정렬순서"><Input name="sortOrder" defaultValue={0} type="number" /></Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <MenuImageInput />
        <Field label="또는 이미지 경로(선택)"><Input name="imageUrl" placeholder="/images/menu/example.png" /></Field>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <CheckRow name="featured" label="대표 노출" />
        <CheckRow name="isActive" label="공개" defaultChecked />
      </div>
      <Button type="submit" className="w-fit"><Plus size={17} />메뉴 추가</Button>
    </form>
  );
}

function MenuListRow({ item, categories }: { item: MenuItem; categories: MenuCategoryRow[] }) {
  return (
    <details className="group">
      <summary className="hm-link-focus flex cursor-pointer list-none items-center gap-3 px-5 py-3.5 transition hover:bg-white/[0.03] [&::-webkit-details-marker]:hidden">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-white/[0.04]">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt="" fill sizes="56px" className="object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-white/30"><ImageIcon size={20} /></div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-[15px] font-extrabold text-white">{item.name}</span>
            {item.featured ? <Badge tone="amber">대표</Badge> : null}
            {!item.isActive ? <Badge tone="red">비공개</Badge> : null}
          </div>
          <p className="mt-1 text-xs font-semibold text-white/45">
            {item.category} · 정렬 {item.sortOrder ?? 0}
          </p>
        </div>
        <span className="shrink-0 text-sm font-extrabold text-[var(--hm-primary)]">
          {formatCurrency(item.price)}
        </span>
        <ChevronDown size={16} className="shrink-0 text-white/35 transition group-open:rotate-180" aria-hidden="true" />
      </summary>

      <div className="border-t border-white/[0.05] bg-black/25 p-5">
        <form action={updateMenuItemAction} className="grid gap-3">
          <input name="id" type="hidden" value={item.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="카테고리"><CategorySelect categories={categories} defaultValue={item.category} /></Field>
            <Field label="메뉴명"><Input name="name" defaultValue={item.name} required /></Field>
          </div>
          <Field label="설명"><Textarea name="description" defaultValue={item.description} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <MenuImageInput label="이미지 교체" />
            <Field label="이미지 경로"><Input name="imageUrl" defaultValue={item.imageUrl ?? ""} /></Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="가격"><Input name="price" defaultValue={item.price} min={0} required type="number" /></Field>
            <Field label="정렬순서"><Input name="sortOrder" defaultValue={item.sortOrder ?? 0} type="number" /></Field>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <CheckRow name="featured" label="대표 노출" defaultChecked={item.featured} />
            <CheckRow name="isActive" label="공개" defaultChecked={item.isActive} />
          </div>
          <Button type="submit" variant="outline">수정 저장</Button>
        </form>
        <form action={deleteMenuItemAction} className="mt-3 flex justify-end border-t border-white/[0.06] pt-3">
          <input name="id" type="hidden" value={item.id} />
          <Button type="submit" variant="danger" className="min-h-10 px-4 text-xs">
            <Trash2 size={14} aria-hidden="true" />
            메뉴 삭제
          </Button>
        </form>
      </div>
    </details>
  );
}

function CategorySelect({
  categories,
  defaultValue,
}: {
  categories: MenuCategoryRow[];
  defaultValue?: string;
}) {
  return (
    <Select name="category" defaultValue={defaultValue ?? categories[0]?.name}>
      {categories.map((category) => (
        <option key={category.id} value={category.name}>{category.name}</option>
      ))}
      {defaultValue && !categories.some((category) => category.name === defaultValue) ? (
        <option value={defaultValue}>{defaultValue} (삭제된 카테고리)</option>
      ) : null}
    </Select>
  );
}

async function ContentSection({ section }: { section: "events" | "notices" }) {
  const type: ContentPostType = section === "events" ? "event" : "notice";
  const meta = sectionMeta[section];
  const { data: rows } = await createAdminClient()
    .from("content_posts")
    .select(contentPostSelect)
    .eq("type", type)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  const posts = (rows ?? []).map(mapContentPost);
  const publishedCount = posts.filter((post) => post.status === "published").length;
  const draftCount = posts.filter((post) => post.status === "draft").length;

  return (
    <AdminFrame active={section} title={meta.title} description={meta.description}>
      <div className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-3">
          <AdminStatCard icon={<FileText size={24} />} label="전체 콘텐츠" value={<>{posts.length}건</>} detail="현재 유형 기준" />
          <AdminStatCard icon={<CheckCircle2 size={24} />} label="공개" value={<>{publishedCount}건</>} detail="사용자 화면 노출" />
          <AdminStatCard icon={<Clock3 size={24} />} label="초안" value={<>{draftCount}건</>} detail="운영 검토 대기" />
        </div>
        <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
          <FormPanel title={`${meta.title} 추가`}><ContentCreateForm type={type} /></FormPanel>
          <AdminPanel>
            <AdminPanelHeader title="콘텐츠 목록" />
            <div className="grid gap-4 p-5">
              {posts.map((post) => <ContentEditCard key={post.id} post={post} type={type} />)}
              {posts.length === 0 ? <EmptyState>등록된 콘텐츠가 없습니다.</EmptyState> : null}
            </div>
          </AdminPanel>
        </div>
      </div>
    </AdminFrame>
  );
}

function ContentCreateForm({ type }: { type: ContentPostType }) {
  return (
    <form action={createContentPostAction} className="grid gap-4">
      <input name="type" type="hidden" value={type} />
      <Field label="제목"><Input name="title" required /></Field>
      <Field label="내용"><Textarea name="body" required /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="상태"><StatusSelect /></Field>
        <Field label="정렬순서"><Input name="sortOrder" defaultValue={0} type="number" /></Field>
      </div>
      <Button type="submit"><Plus size={17} />콘텐츠 추가</Button>
    </form>
  );
}

function ContentEditCard({ post, type }: { post: ContentPost; type: ContentPostType }) {
  return (
    <div className="rounded-[18px] border border-[rgba(255,255,255,.08)] bg-black/20 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={post.status === "published" ? "green" : post.status === "draft" ? "amber" : "neutral"}>{statusLabels[post.status]}</Badge>
        <span className="text-xs font-semibold text-white/35">{formatDate(post.createdAt)}</span>
      </div>
      <h2 className="mt-3 text-lg font-extrabold text-white">{post.title}</h2>
      <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-white/52">{post.body}</p>
      <form action={updateContentPostAction} className="mt-4 grid gap-3">
        <input name="id" type="hidden" value={post.id} />
        <input name="type" type="hidden" value={type} />
        <Field label="제목"><Input name="title" defaultValue={post.title} required /></Field>
        <Field label="내용"><Textarea name="body" defaultValue={post.body} required /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="상태"><StatusSelect defaultValue={post.status} /></Field>
          <Field label="정렬순서"><Input name="sortOrder" defaultValue={post.sortOrder} type="number" /></Field>
        </div>
        <Button type="submit" variant="outline">수정 저장</Button>
      </form>
    </div>
  );
}

function StatusSelect({ defaultValue = "published" }: { defaultValue?: ContentStatus }) {
  return (
    <Select name="status" defaultValue={defaultValue}>
      <option value="published">공개</option>
      <option value="draft">초안</option>
      <option value="archived">보관</option>
    </Select>
  );
}

async function InquirySection() {
  const meta = sectionMeta.inquiries;
  const { data: rows } = await createAdminClient()
    .from("inquiries")
    .select(inquirySelect)
    .order("created_at", { ascending: false });
  const inquiries = (rows ?? []).map(mapInquiry);
  const openCount = inquiries.filter((item) => item.status === "open").length;
  const answeredCount = inquiries.filter((item) => item.status === "answered").length;

  return (
    <AdminFrame active="inquiries" title={meta.title} description={meta.description}>
      <div className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-3">
          <AdminStatCard icon={<MessageSquareText size={24} />} label="전체 문의" value={<>{inquiries.length}건</>} detail="누적 접수" />
          <AdminStatCard icon={<Bell size={24} />} label="접수" value={<>{openCount}건</>} detail="응답 필요" />
          <AdminStatCard icon={<CheckCircle2 size={24} />} label="답변" value={<>{answeredCount}건</>} detail="처리 완료" />
        </div>
        <AdminPanel>
          <AdminPanelHeader title="문의 목록" />
          <div className="grid gap-4 p-5">
            {inquiries.map((inquiry) => <InquiryCard key={inquiry.id} inquiry={inquiry} />)}
            {inquiries.length === 0 ? <EmptyState>접수된 문의가 없습니다.</EmptyState> : null}
          </div>
        </AdminPanel>
      </div>
    </AdminFrame>
  );
}

function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
  return (
    <div className="rounded-[18px] border border-[rgba(255,255,255,.08)] bg-black/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-extrabold text-white">{inquiry.name}</h2>
            <Badge tone={inquiry.status === "open" ? "amber" : inquiry.status === "answered" ? "green" : "neutral"}>{inquiryStatusLabels[inquiry.status]}</Badge>
          </div>
          <p className="mt-1 text-sm font-semibold text-white/42">{inquiry.email} · {formatDate(inquiry.createdAt)}</p>
        </div>
      </div>
      <p className="mt-4 whitespace-pre-line rounded-[14px] bg-white/[0.025] p-4 text-sm leading-7 text-white/68">{inquiry.message}</p>
      <form action={updateInquiryStatusAction} className="mt-4 grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_auto]">
        <input name="id" type="hidden" value={inquiry.id} />
        <Select name="status" defaultValue={inquiry.status}>
          <option value="open">접수</option>
          <option value="answered">답변</option>
          <option value="closed">종료</option>
        </Select>
        <Input name="adminNote" defaultValue={inquiry.adminNote ?? ""} placeholder="내부 관리 메모" />
        <Button type="submit" variant="outline">처리 저장</Button>
      </form>
    </div>
  );
}

async function ExposureSection({ section }: { section: "banners" | "popups" }) {
  const meta = sectionMeta[section];
  const isBanner = section === "banners";
  const admin = createAdminClient();
  const { data: rows } = isBanner
    ? await admin.from("site_banners").select(siteBannerSelect).order("sort_order", { ascending: true })
    : await admin.from("site_popups").select(sitePopupSelect).order("sort_order", { ascending: true });
  const items = isBanner ? (rows ?? []).map(mapSiteBanner) : (rows ?? []).map(mapSitePopup);
  const activeCount = items.filter((item) => item.isActive).length;

  return (
    <AdminFrame active={section} title={meta.title} description={meta.description}>
      <div className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-3">
          <AdminStatCard icon={<ImageIcon size={24} />} label="전체" value={<>{items.length}개</>} detail={isBanner ? "배너 항목" : "팝업 항목"} />
          <AdminStatCard icon={<CheckCircle2 size={24} />} label="활성" value={<>{activeCount}개</>} detail="현재 노출 대상" />
          <AdminStatCard icon={<XCircle size={24} />} label="비활성" value={<>{items.length - activeCount}개</>} detail="숨김 처리" />
        </div>
        <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
          <FormPanel title={isBanner ? "배너 추가" : "팝업 추가"}>
            <ExposureCreateForm isBanner={isBanner} />
          </FormPanel>
          <AdminPanel>
            <AdminPanelHeader title={isBanner ? "배너 목록" : "팝업 목록"} />
            <div className="grid gap-4 p-5">
              {items.map((item) => <ExposureEditCard key={item.id} item={item} isBanner={isBanner} />)}
              {items.length === 0 ? <EmptyState>등록된 항목이 없습니다.</EmptyState> : null}
            </div>
          </AdminPanel>
        </div>
      </div>
    </AdminFrame>
  );
}

function ExposureCreateForm({ isBanner }: { isBanner: boolean }) {
  const action = isBanner ? createSiteBannerAction : createSitePopupAction;
  return (
    <form action={action} className="grid gap-4">
      <Field label="제목"><Input name="title" required /></Field>
      <Field label="내용"><Textarea name="body" /></Field>
      {isBanner ? (
        <>
          <Field label="이미지 URL"><Input name="imageUrl" placeholder="/images/brand/example.png" /></Field>
          <Field label="노출 위치"><Input name="placement" defaultValue="home" /></Field>
        </>
      ) : null}
      <Field label="연결 URL"><Input name="href" placeholder="/coupons" /></Field>
      <Field label="정렬순서"><Input name="sortOrder" defaultValue={0} type="number" /></Field>
      <CheckRow name="isActive" label="활성" defaultChecked />
      <Button type="submit"><Plus size={17} />{isBanner ? "배너 추가" : "팝업 추가"}</Button>
    </form>
  );
}

function ExposureEditCard({ item, isBanner }: { item: SiteBanner | SitePopup; isBanner: boolean }) {
  const action = isBanner ? updateSiteBannerAction : updateSitePopupAction;
  const banner = item as SiteBanner;
  return (
    <div className="rounded-[18px] border border-[rgba(255,255,255,.08)] bg-black/20 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-extrabold text-white">{item.title}</h2>
        <Badge tone={item.isActive ? "green" : "neutral"}>{item.isActive ? "활성" : "비활성"}</Badge>
      </div>
      <p className="mt-2 text-sm leading-6 text-white/52">{item.body || "내용 없음"}</p>
      <form action={action} className="mt-4 grid gap-3">
        <input name="id" type="hidden" value={item.id} />
        <Field label="제목"><Input name="title" defaultValue={item.title} required /></Field>
        <Field label="내용"><Textarea name="body" defaultValue={item.body} /></Field>
        {isBanner ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="이미지 URL"><Input name="imageUrl" defaultValue={banner.imageUrl ?? ""} /></Field>
            <Field label="노출 위치"><Input name="placement" defaultValue={banner.placement ?? "home"} /></Field>
          </div>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="연결 URL"><Input name="href" defaultValue={item.href ?? ""} /></Field>
          <Field label="정렬순서"><Input name="sortOrder" defaultValue={item.sortOrder} type="number" /></Field>
        </div>
        <CheckRow name="isActive" label="활성" defaultChecked={item.isActive} />
        <Button type="submit" variant="outline">수정 저장</Button>
      </form>
    </div>
  );
}

async function ReportsSection() {
  const meta = sectionMeta.reports;
  const admin = createAdminClient();
  const [profilesResult, couponsResult, menuResult, postsResult, inquiriesResult] = await Promise.all([
    admin.from("profiles").select("id,role,email_verified,profile_completed_at,created_at"),
    admin.from("coupon_issues").select(couponIssueSelect),
    admin.from("menu_items").select(menuItemSelect),
    admin.from("content_posts").select(contentPostSelect),
    admin.from("inquiries").select(inquirySelect),
  ]);
  const profiles = (profilesResult.data ?? []) as Pick<ProfileRow, "id" | "role" | "email_verified" | "profile_completed_at" | "created_at">[];
  const coupons = (couponsResult.data ?? []).map(mapCouponIssue);
  const menus = (menuResult.data ?? []).map(mapMenuItem);
  const posts = (postsResult.data ?? []).map(mapContentPost);
  const inquiries = (inquiriesResult.data ?? []).map(mapInquiry);
  const totalUsedAmount = coupons.reduce((sum, item) => sum + item.usedCount * item.amount, 0);
  const downloaded = coupons.reduce((sum, item) => sum + item.downloadedCount, 0);
  const used = coupons.reduce((sum, item) => sum + item.usedCount, 0);
  const usageRate = downloaded ? Math.round((used / downloaded) * 1000) / 10 : 0;

  const reportRows = [
    ["회원", `${profiles.length}명`, `인증 ${profiles.filter((item) => item.email_verified).length}명`],
    ["직원/관리자", `${profiles.filter((item) => item.role !== "member").length}명`, `관리자 ${profiles.filter((item) => item.role === "admin").length}명`],
    ["메뉴", `${menus.length}개`, `공개 ${menus.filter((item) => item.isActive).length}개`],
    ["콘텐츠", `${posts.length}건`, `공개 ${posts.filter((item) => item.status === "published").length}건`],
    ["문의", `${inquiries.length}건`, `접수 ${inquiries.filter((item) => item.status === "open").length}건`],
  ];

  return (
    <AdminFrame active="reports" title={meta.title} description={meta.description}>
      <div className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard icon={<Ticket size={24} />} label="쿠폰 다운로드" value={<>{downloaded}장</>} detail={`사용 ${used}장`} />
          <AdminStatCard icon={<BarChart3 size={24} />} label="쿠폰 사용률" value={<>{usageRate}%</>} detail="다운로드 대비" />
          <AdminStatCard icon={<Ticket size={24} />} label="할인 처리액" value={formatCurrency(totalUsedAmount)} detail="사용 완료 기준" />
          <AdminStatCard icon={<UsersRound size={24} />} label="회원 규모" value={<>{profiles.length}명</>} detail="전체 프로필" />
        </div>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <AdminPanel>
            <AdminPanelHeader title="운영 지표 요약" />
            <div className="overflow-x-auto p-5">
              <table className="min-w-[640px] w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,.08)] text-left text-xs font-extrabold text-[var(--hm-accent-gold)]">
                    <th className="py-3">영역</th>
                    <th className="py-3">주요 지표</th>
                    <th className="py-3">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,.06)] text-white/68">
                  {reportRows.map(([label, value, detail]) => (
                    <tr key={label}>
                      <td className="py-4 font-bold text-white">{label}</td>
                      <td className="py-4">{value}</td>
                      <td className="py-4">{detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminPanel>
          <AdminPanel>
            <AdminPanelHeader title="운영 체크" />
            <div className="grid gap-3 p-5 text-sm font-semibold text-white/58">
              <ReportCheck ok={menus.some((item) => item.featured)} label="대표 메뉴 노출 설정" />
              <ReportCheck ok={coupons.some((item) => item.status === "issuing")} label="발행중 쿠폰 존재" />
              <ReportCheck ok={posts.some((item) => item.status === "published")} label="공개 콘텐츠 존재" />
              <ReportCheck ok={inquiries.every((item) => item.status !== "open")} label="미처리 문의 없음" />
            </div>
          </AdminPanel>
        </div>
      </div>
    </AdminFrame>
  );
}

function ReportCheck({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[rgba(255,255,255,.08)] bg-black/20 px-4 py-3">
      <span>{label}</span>
      <Badge tone={ok ? "green" : "amber"}>{ok ? "정상" : "점검"}</Badge>
    </div>
  );
}

function CheckRow({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-[14px] border border-[rgba(255,255,255,.08)] bg-white/[0.025] px-3 text-sm font-bold text-white/68">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="size-4 accent-[var(--hm-primary)]" />
      {label}
    </label>
  );
}
