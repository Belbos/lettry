import { apiFetch, apiUpload } from "./client";
import type {
  AdminUser,
  DrawInput,
  DrawResult,
  ImportResult,
} from "@/lib/types/admin";

export async function listUsers(): Promise<AdminUser[]> {
  return apiFetch<AdminUser[]>("/api/admin/users");
}

export async function setAdminFlag(
  userId: number,
  isAdmin: boolean,
): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/api/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ is_admin: isAdmin }),
  });
}

export async function upsertDraw(draw: DrawInput): Promise<DrawResult> {
  return apiFetch<DrawResult>("/api/admin/draws", {
    method: "POST",
    body: JSON.stringify(draw),
  });
}

export async function importCsv(file: File): Promise<ImportResult> {
  const form = new FormData();
  form.append("file", file);
  return apiUpload<ImportResult>("/api/lotto/import-csv", form);
}
