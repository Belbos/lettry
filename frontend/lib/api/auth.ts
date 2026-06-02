import { apiFetch } from "./client";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  TokenResponse,
  UserInfo,
} from "@/lib/types/auth";

export async function register(req: RegisterRequest): Promise<UserInfo> {
  return apiFetch<UserInfo>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function login(req: LoginRequest): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function fetchMe(token: string): Promise<UserInfo> {
  return apiFetch<UserInfo>("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function checkUsername(
  username: string,
): Promise<{ available: boolean }> {
  return apiFetch<{ available: boolean }>(
    `/api/auth/check-username/${encodeURIComponent(username)}`,
  );
}

export async function forgotPassword(
  req: ForgotPasswordRequest,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function resetPassword(
  req: ResetPasswordRequest,
  token: string,
): Promise<UserInfo> {
  return apiFetch<UserInfo>("/api/auth/reset-password", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(req),
  });
}
