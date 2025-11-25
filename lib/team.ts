import teamMembersData from "../data/team.json";
import type { TeamMember } from "../types/bios";
import { slugify } from "./slug";

type Portraits = {
  primary: string;
  secondary: string;
};

export type TeamMemberWithPortraits = TeamMember & {
  portraits: Portraits;
};

const buildPortraits = (member: TeamMember): Portraits => {
  const base = (member.portraitBase ?? member.slug).toLowerCase();

  if (base === "jean-louis-poitevin") {
    return {
      primary: "/bios/jean-louis-1.jpeg",
      secondary: "/bios/jean-louis-2.jpeg",
    };
  }

  return {
    primary: `/bios/${base}-1.jpg`,
    secondary: `/bios/${base}-2.jpg`,
  };
};

const teamMembers: TeamMemberWithPortraits[] = (teamMembersData as TeamMember[])
  .map((member) => ({
    ...member,
    portraits: buildPortraits(member),
  }))
  .sort((a, b) => a.rank - b.rank);

export const getTeamMembers = (): TeamMemberWithPortraits[] => teamMembers;

export const findTeamMemberBySlug = (
  slug: string
): TeamMemberWithPortraits | undefined => {
  if (!slug) {
    return undefined;
  }

  const normalized = slug.toLowerCase();
  return teamMembers.find((member) => member.slug.toLowerCase() === normalized);
};

export const findTeamMemberByName = (
  name: string
): TeamMemberWithPortraits | undefined => {
  if (!name) {
    return undefined;
  }

  const normalized = slugify(name);
  return teamMembers.find((member) => slugify(member.name) === normalized);
};
