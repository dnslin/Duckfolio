// Unified type definitions for Duckfolio platform configuration
// Single source of truth — all modules import from here

export interface ProfileConfig {
  name: string;
  bio: string;
  avatar: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

export interface WebsiteLink {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  cover: string;
  tags: string[];
  category: string;
  stats?: { stars?: number; forks?: number };
  links: { demo?: string; code?: string };
  featured?: boolean;
}

export interface SkillCategory {
  id: string;
  name: string;
  icon?: string;
  skills: Skill[];
}

export interface Skill {
  name: string;
  icon?: string;
  level: number;
  color?: string;
}

export interface GitHubStatsData {
  totalStars: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
}

export interface ContributionDay {
  date: string;
  contributionCount: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface GitHubData {
  contributions: {
    totalContributions: number;
    weeks: ContributionWeek[];
  };
  stats: GitHubStatsData;
  fetchedAt: string;
}

export interface GitHubConfig {
  username: string;
  showContributionGraph?: boolean;
  showStats?: boolean;
  showPinnedRepos?: boolean;
  statsOverrides?: Partial<GitHubStatsData>;
}


export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

export interface ThemeConfig {
  preset?: string;
  backgroundEffect?: 'none' | 'gradient' | 'geometric' | 'waves';
  customColors?: Partial<ThemeColors>;
  fonts?: {
    heading?: string;
    body?: string;
  };
}

export interface PlatformConfig {
  profile: ProfileConfig;
  socialLinks: SocialLink[];
  websiteLinks: WebsiteLink[];
  projects?: Project[];
  skills?: SkillCategory[];
  github?: GitHubConfig;
  theme?: ThemeConfig;
}
