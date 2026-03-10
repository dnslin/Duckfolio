import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getConfig } from '@/lib/config';
import type {
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

const config = getConfig();

export const useProfileStore = create<ProfileState>()(
  persist<ProfileState>(
    () => ({
      avatar: config.profile.avatar,
      name: config.profile.name,
      bio: config.profile.bio,
      socialLinks: config.socialLinks,
      websiteLinks: config.websiteLinks,
      projects: config.projects ?? [],
      skills: config.skills ?? [],
      github: config.github,
      musicPlayer: config.musicPlayer,
      theme: config.theme,
    }),
    {
      name: 'duckfolio-storage',
      version: 1,
      migrate: () => {
        const freshConfig = getConfig();
        return {
          avatar: freshConfig.profile.avatar,
          name: freshConfig.profile.name,
          bio: freshConfig.profile.bio,
          socialLinks: freshConfig.socialLinks,
          websiteLinks: freshConfig.websiteLinks,
          projects: freshConfig.projects ?? [],
          skills: freshConfig.skills ?? [],
          github: freshConfig.github,
          musicPlayer: freshConfig.musicPlayer,
          theme: freshConfig.theme,
        };
      },
    }
  )
);
