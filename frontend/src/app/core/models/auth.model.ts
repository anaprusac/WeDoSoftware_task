import { Gender, UnitSystem, UserProfile } from './user.model';

export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  user: UserProfile;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  preferredUnitSystem?: UnitSystem;
}

export interface ForgotPasswordRequest {
  usernameOrEmail: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
