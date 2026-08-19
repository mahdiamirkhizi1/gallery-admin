export type AdminRole = "ADMIN" | "SUPER_ADMIN";
export type AdminUser = { id: number; name: string; role: AdminRole };

export function getAdminUser(): AdminUser | null {
  try {
    const value = localStorage.getItem("goldino_admin_user");
    return value ? JSON.parse(value) as AdminUser : null;
  } catch { return null; }
}

export function setAdminSession(token: string, user: AdminUser) {
  localStorage.setItem("goldino_admin_token", token);
  localStorage.setItem("goldino_admin_user", JSON.stringify(user));
}

export function decodeAdminToken(token: string): { userId: number; role: AdminRole } | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { userId: number; role: AdminRole };
    return payload.userId && ["ADMIN", "SUPER_ADMIN"].includes(payload.role) ? payload : null;
  } catch { return null; }
}

export function clearAdminSession() {
  localStorage.removeItem("goldino_admin_token");
  localStorage.removeItem("goldino_admin_user");
  localStorage.removeItem("goldino_admin_refresh_token");
}
