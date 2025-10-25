export type NavLink = {
  label: string;
  href: string;
  disabled?: boolean;
};

export const NAV_LINKS: NavLink[] = [
  { label: "Reflexion", href: "/Reflexion" },
  { label: "Création", href: "/Creation" },
  { label: "À Propos", href: "/bios" },
];
