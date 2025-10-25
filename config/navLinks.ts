export type NavLink = {
  label: string;
  href: string;
  disabled?: boolean;
};

export const NAV_LINKS: NavLink[] = [
  { label: "Réflexion", href: "/Reflexion" },
  { label: "Création", href: "/Creation" },
  { label: "IRL", href: "/evenements", disabled: true },
  { label: "À propos", href: "/bios" },
];
