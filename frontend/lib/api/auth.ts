import { apiFetch } from "./client";
import type {
  LoginRequest,
  RegisterRequest,
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
