export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  preferredCurrency: string;
  timeZone: string;
  createdAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
}

export interface UpdateUserProfileDto {
  fullName: string;
  preferredCurrency: string;
  timeZone: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}
