import {
  AuthResponse,
  LoginDto,
  RegisterDto,
  UpdateUserProfileDto,
  UserProfile,
} from "@/types/auth";
import { api } from "./api";

export const authApi = {
  login: (dto: LoginDto) => api.post<AuthResponse>("/api/auth/login", dto),
  register: (dto: RegisterDto) => api.post<AuthResponse>("/api/auth/register", dto),
  me: () => api.get<UserProfile>("/api/auth/me"),
  updateProfile: (dto: UpdateUserProfileDto) =>
    api.put<UserProfile>("/api/auth/profile", dto),
};
