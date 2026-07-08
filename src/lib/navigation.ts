export type NavItem = {
  href: string;
  label: string;
};

const links = {
  about: { href: "/about", label: "화목 소개" },
  menu: { href: "/menu", label: "메뉴" },
  coupons: { href: "/coupons", label: "쿠폰" },
  events: { href: "/events", label: "이벤트" },
  notices: { href: "/notices", label: "공지사항" },
  store: { href: "/store", label: "매장 안내" },
  support: { href: "/support", label: "고객센터" },
  mypage: { href: "/mypage", label: "마이페이지" },
} as const satisfies Record<string, NavItem>;

export const headerNavItems: readonly NavItem[] = [
  links.about,
  links.menu,
  links.coupons,
  links.events,
  links.store,
  links.support,
];

export const drawerNavItems: readonly NavItem[] = [
  links.about,
  links.menu,
  links.coupons,
  links.events,
  links.notices,
  links.store,
  links.support,
];

export const footerNavGroups: readonly {
  title: string;
  items: readonly NavItem[];
}[] = [
  {
    title: "바로가기",
    items: [links.about, links.menu, links.coupons, links.events, links.store],
  },
  {
    title: "고객지원",
    items: [links.notices, links.support, links.mypage],
  },
];

export const policyLinks: readonly NavItem[] = [
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침" },
];

export const siteContact = {
  phoneDisplay: "051-1234-5678",
  phoneHref: "tel:05112345678",
  email: "help@hmgrill.com",
  address: "부산광역시 동래구 온천천로 447-2",
  postalCode: "47900",
  hoursWeekday: "평일 10:00 - 22:00",
  hoursWeekend: "주말·공휴일 11:00 - 22:00",
} as const;

export const businessInfo: readonly { label: string; value: string }[] = [
  { label: "상호명", value: "회목 주식회사" },
  { label: "대표", value: "여창동" },
  { label: "사업자등록번호", value: "123-45-67890" },
  { label: "주소", value: `${siteContact.address} (우편번호 ${siteContact.postalCode})` },
  { label: "전화", value: siteContact.phoneDisplay },
  { label: "이메일", value: siteContact.email },
];
