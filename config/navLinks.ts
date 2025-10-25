export type NavLink = {
  label: string;
  href: string;
  disabled?: boolean;
};

export const NAV_LINKS: NavLink[] = [
  { label: "Reflexión", href: "/Reflexion" },
  { label: "Creation", href: "/Creation" },
  { label: "À Propos", href: "/bios" },
];
