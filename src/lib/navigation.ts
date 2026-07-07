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
  { href: "/support", label: "이용약관" },
  { href: "/support", label: "개인정보처리방침" },
];

export const siteContact = {
  phoneDisplay: "02-1234-5678",
  phoneHref: "tel:0212345678",
  email: "hwamok@hwamok.com",
  address: "서울특별시 강남구 테헤란로 123, 4층",
  hoursWeekday: "평일 10:00 - 22:00",
  hoursWeekend: "주말·공휴일 11:00 - 22:00",
} as const;

export const businessInfo: readonly { label: string; value: string }[] = [
  { label: "상호명", value: "화목" },
  { label: "대표", value: "홍길동" },
  { label: "사업자등록번호", value: "123-45-67890" },
  { label: "주소", value: siteContact.address },
  { label: "전화", value: siteContact.phoneDisplay },
  { label: "이메일", value: siteContact.email },
];
