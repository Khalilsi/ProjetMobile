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

// ─── Logout ───────────────────────────────────────────────────────────────────
export const apiLogout = async (accessToken: string): Promise<void> => {
  await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};
