export interface AppConfig {
  buildNumber: string;
  apiBaseUrl: string;
  msalConfig: MsalConfig;
  featureFlags: FeatureFlags | undefined;
}

export interface BaseFeatureFlag {
  description: string;
  isActive: boolean;
}

export type FeatureFlagsTypes = BaseFeatureFlag;

export interface FeatureFlags {
  readonly [key: string]: FeatureFlagsTypes;
}

export interface MsalConfig {
  spaClientId: string,
  apiClientId: string,
  groupId: string,
  authority: string,
  redirectUrl: string
}
