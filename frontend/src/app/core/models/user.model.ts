export type Gender = 'Male' | 'Female';
export type ThemePreference = 'Light' | 'Dark';
export type UnitSystem = 'Metric' | 'Imperial';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  bmi: number;
  preferredLanguage: string;
  themePreference: ThemePreference;
  preferredUnitSystem: UnitSystem;
}

/** Full-replace payload for PUT /api/profile, the server always expects every field. */
export interface UpdateProfileRequest {
  heightCm: number;
  weightKg: number;
  preferredLanguage: string;
  themePreference: ThemePreference;
  preferredUnitSystem: UnitSystem;
}
