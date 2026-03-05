import teamMembersData from "../data/team.json";
import type { TeamMember } from "../types/bios";
import type { SupabaseBioEntry } from "../types/supabase";
import { slugify } from "./slug";
import { loadSupabaseBios } from "./supabase/content";
import { getSupabaseServerClient } from "./supabase/serverClient";

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

const localTeamMembers: TeamMemberWithPortraits[] = (teamMembersData as TeamMember[])
  .map((member) => ({
    ...member,
    portraits: buildPortraits(member),
  }))
  .sort((a, b) => a.rank - b.rank);

const mapSupabaseBioToTeamMember = (entry: SupabaseBioEntry): TeamMemberWithPortraits => {
  const member: TeamMember = {
    slug: entry.slug,
    name: entry.name,
    role: entry.role ?? undefined,
    bio: entry.bio,
    rank: entry.rank,
    portraitBase: entry.portraitBase ?? undefined,
  };

  return {
    ...member,
    portraits: buildPortraits(member),
  };
};

export const getTeamMembers = async (): Promise<TeamMemberWithPortraits[]> => {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return localTeamMembers;
    }

    const bios = await loadSupabaseBios(supabase);
    if (!bios.length) {
      return localTeamMembers;
    }

    return bios.map(mapSupabaseBioToTeamMember).sort((a, b) => a.rank - b.rank);
  } catch {
    return localTeamMembers;
  }
};

export const findTeamMemberBySlug = async (
  slug: string
): Promise<TeamMemberWithPortraits | undefined> => {
  if (!slug) {
    return undefined;
  }

  const normalized = slug.toLowerCase();
  const teamMembers = await getTeamMembers();
  return teamMembers.find((member) => member.slug.toLowerCase() === normalized);
};

export const findTeamMemberByName = async (
  name: string
): Promise<TeamMemberWithPortraits | undefined> => {
  if (!name) {
    return undefined;
  }

  const normalized = slugify(name);
  const teamMembers = await getTeamMembers();
  return teamMembers.find((member) => slugify(member.name) === normalized);
};
