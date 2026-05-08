import { BASE_URL } from "../config/api";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// ─── Signup ───────────────────────────────────────────────────────────────────
export const apiSignup = async (
  username: string,
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Signup failed");
  return data;
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const apiLogin = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
};

// ─── Refresh Token ──────────────────────────────────────────────────────────
export const apiRefreshToken = async (
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Token refresh failed");
  return data;
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const apiLogout = async (accessToken: string): Promise<void> => {
  await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};

// ─── Update Username ──────────────────────────────────────────────────────────
export const apiUpdateUsername = async (
  accessToken: string,
  username: string,
): Promise<AuthUser> => {
  const res = await fetch(`${BASE_URL}/auth/update-username`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ username }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update username");
  return data.user as AuthUser;
};

// ─── Update Password ──────────────────────────────────────────────────────────
export const apiUpdatePassword = async (
  accessToken: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const res = await fetch(`${BASE_URL}/auth/update-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update password");
};
