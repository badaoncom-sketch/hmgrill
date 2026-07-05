import type {
  ContentPost,
  ContentPostType,
  ContentStatus,
  Inquiry,
  InquiryStatus,
  MenuItem,
  SiteBanner,
  SitePopup,
} from "@/lib/types";

type MenuItemRow = {
  id: string;
  category: MenuItem["category"];
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  featured: boolean;
  is_active: boolean;
  sort_order: number;
};

type ContentPostRow = {
  id: string;
  type: ContentPostType;
  title: string;
  body: string;
  status: ContentStatus;
  published_at: string | null;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
  created_at: string;
};

type InquiryRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: InquiryStatus;
  admin_note: string | null;
  answered_at: string | null;
  created_at: string;
};

type SiteBannerRow = {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  href: string | null;
  placement: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
};

type SitePopupRow = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
};

export const menuItemSelect =
  "id,category,name,description,price,image_url,featured,is_active,sort_order";

export const contentPostSelect =
  "id,type,title,body,status,published_at,starts_at,ends_at,sort_order,created_at";

export const inquirySelect =
  "id,name,email,message,status,admin_note,answered_at,created_at";

export const siteBannerSelect =
  "id,title,body,image_url,href,placement,is_active,starts_at,ends_at,sort_order";

export const sitePopupSelect =
  "id,title,body,href,is_active,starts_at,ends_at,sort_order";

export function mapMenuItem(row: unknown): MenuItem {
  const item = row as MenuItemRow;

  return {
    id: item.id,
    category: item.category,
    name: item.name,
    description: item.description,
    price: item.price,
    imageUrl: item.image_url ?? undefined,
    featured: item.featured,
    isActive: item.is_active,
    sortOrder: item.sort_order,
  };
}

export function mapContentPost(row: unknown): ContentPost {
  const item = row as ContentPostRow;

  return {
    id: item.id,
    type: item.type,
    title: item.title,
    body: item.body,
    status: item.status,
    publishedAt: item.published_at ?? undefined,
    startsAt: item.starts_at ?? undefined,
    endsAt: item.ends_at ?? undefined,
    sortOrder: item.sort_order,
    createdAt: item.created_at,
  };
}

export function mapInquiry(row: unknown): Inquiry {
  const item = row as InquiryRow;

  return {
    id: item.id,
    name: item.name,
    email: item.email,
    message: item.message,
    status: item.status,
    adminNote: item.admin_note ?? undefined,
    answeredAt: item.answered_at ?? undefined,
    createdAt: item.created_at,
  };
}

export function mapSiteBanner(row: unknown): SiteBanner {
  const item = row as SiteBannerRow;

  return {
    id: item.id,
    title: item.title,
    body: item.body,
    imageUrl: item.image_url ?? undefined,
    href: item.href ?? undefined,
    placement: item.placement,
    isActive: item.is_active,
    startsAt: item.starts_at ?? undefined,
    endsAt: item.ends_at ?? undefined,
    sortOrder: item.sort_order,
  };
}

export function mapSitePopup(row: unknown): SitePopup {
  const item = row as SitePopupRow;

  return {
    id: item.id,
    title: item.title,
    body: item.body,
    href: item.href ?? undefined,
    isActive: item.is_active,
    startsAt: item.starts_at ?? undefined,
    endsAt: item.ends_at ?? undefined,
    sortOrder: item.sort_order,
  };
}
