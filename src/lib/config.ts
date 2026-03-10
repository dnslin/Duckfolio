import profileConfig from '../../public/platform-config.json';
import type { PlatformConfig } from './types';

export type { SocialLink, WebsiteLink, ProfileConfig, PlatformConfig } from './types';

export function getConfig(): PlatformConfig {
  return profileConfig as PlatformConfig;
}
