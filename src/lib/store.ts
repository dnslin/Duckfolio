import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getConfig } from '@/lib/config';
import type {
  PlatformConfig,
  SocialLink,
  WebsiteLink,
  Project,
  SkillCategory,
  GitHubConfig,
  MusicPlayerConfig,
  ThemeConfig,
} from '@/lib/types';

interface ProfileState {
  avatar: string;
  name: string;
  bio: string;
  socialLinks: SocialLink[];
  websiteLinks: WebsiteLink[];
  projects: Project[];
  skills: SkillCategory[];
  github?: GitHubConfig;
  musicPlayer?: MusicPlayerConfig;
  theme?: ThemeConfig;
}

function buildState(cfg: PlatformConfig): ProfileState {
  return {
    avatar: cfg.profile.avatar,
    name: cfg.profile.name,
    bio: cfg.profile.bio,
    socialLinks: cfg.socialLinks,
    websiteLinks: cfg.websiteLinks,
    projects: cfg.projects ?? [],
    skills: cfg.skills ?? [],
    github: cfg.github,
    musicPlayer: cfg.musicPlayer,
    theme: cfg.theme,
  };
}

const config = getConfig();

export const useProfileStore = create<ProfileState>()(
  persist<ProfileState>(
    () => buildState(config),
    {
      name: 'duckfolio-storage',
      version: 1,
      migrate: () => buildState(getConfig()),
    }
  )
);
