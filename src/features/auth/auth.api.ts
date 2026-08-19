import { api } from "@/services/api";
import { decodeAdminToken, setAdminSession, type AdminUser } from "./auth";
import { endpoints } from "@/config/endpoints";

type LoginResponse = { result: { token: string; refreshToken: string; userId: number } };
type ProfileResponse = { result: { id: number; fullName?: string; role: "ADMIN" | "SUPER_ADMIN" } };

export async function loginAdmin(mobile: string, password: string) {
  const { data } = await api.post<LoginResponse>(
    endpoints.auth.login,
    { mobile, password },
    { params: { type: "CRE" } },
  );
  const claims = decodeAdminToken(data.result.token);
  if (!claims) throw new Error("This account does not have admin access");
  localStorage.setItem("goldino_admin_token", data.result.token);
  localStorage.setItem("goldino_admin_refresh_token", data.result.refreshToken);
  const profile = await api.get<ProfileResponse>(endpoints.user.profile);
  const user: AdminUser = { id: claims.userId, name: profile.data.result.fullName ?? "مدیر فروشگاه", role: claims.role };
  setAdminSession(data.result.token, user);
  return user;
}
