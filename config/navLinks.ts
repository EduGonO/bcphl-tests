export type NavLink = {
  label: string;
  href: string;
  disabled?: boolean;
};

export const NAV_LINKS: NavLink[] = [
  { label: "Reflexión", href: "/Reflexion" },
  { label: "Création", href: "/Creation" },
  { label: "IRL", href: "/IRL" },
  { label: "À propos", href: "/bios" },
];
