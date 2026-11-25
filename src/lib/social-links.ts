export type SocialPlatform = "youtube" | "instagram" | "x";
export type SocialProfiles = Partial<Record<SocialPlatform, string>>;

// Add published MFG profile URLs here.
export const socialProfiles: SocialProfiles = {};
