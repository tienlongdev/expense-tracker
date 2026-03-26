"use client";

import { authApi } from "@/lib/auth-api";
import {
  AuthResponse,
  LoginDto,
  RegisterDto,
  UpdateUserProfileDto,
  UserProfile,
} from "@/types/auth";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const ACCESS_TOKEN_KEY = "expense-tracker-access-token";

type AuthContextValue = {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<UserProfile | null>;
  login: (dto: LoginDto) => Promise<AuthResponse>;
  register: (dto: RegisterDto) => Promise<AuthResponse>;
  updateProfile: (dto: UpdateUserProfileDto) => Promise<UserProfile>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

function setStoredToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
}

function clearStoredToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const profile = await authApi.me();
      setUser(profile);
      return profile;
    } catch (err) {
      clearStoredToken();
      setUser(null);
      setError(err instanceof Error ? err.message : "Không thể tải thông tin tài khoản");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const applyAuthResponse = useCallback((result: AuthResponse) => {
    setStoredToken(result.accessToken);
    setUser(result.user);
    setError(null);
    return result;
  }, []);

  const login = useCallback(
    async (dto: LoginDto) => {
      setLoading(true);
      try {
        const result = await authApi.login(dto);
        return applyAuthResponse(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [applyAuthResponse]
  );

  const register = useCallback(
    async (dto: RegisterDto) => {
      setLoading(true);
      try {
        const result = await authApi.register(dto);
        return applyAuthResponse(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đăng ký thất bại");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [applyAuthResponse]
  );

  const updateProfile = useCallback(async (dto: UpdateUserProfileDto) => {
    setLoading(true);
    try {
      setError(null);
      const profile = await authApi.updateProfile(dto);
      setUser(profile);
      return profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật hồ sơ");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      refetch,
      login,
      register,
      updateProfile,
      logout,
    }),
    [user, loading, error, refetch, login, register, updateProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function getAccessToken() {
  return getStoredToken();
}
