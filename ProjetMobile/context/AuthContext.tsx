import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { apiLogout, apiRefreshToken, AuthUser } from "../services/authService";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (
    user: AuthUser,
    accessToken: string,
    refreshToken: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app start
  useEffect(() => {
    const restore = async () => {
      try {
        const storedRefresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        const userStr = await SecureStore.getItemAsync(USER_KEY);

        if (!storedRefresh || !userStr) {
          // No stored session — go to login
          return;
        }

        // Always use the refresh token to get a fresh access token.
        // This ensures the session survives across app restarts even
        // after the short-lived access token (15 min) has expired.
        const { accessToken: newAccess, refreshToken: newRefresh } =
          await apiRefreshToken(storedRefresh);

        // Persist the rotated tokens
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, newAccess);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefresh);

        setAccessToken(newAccess);
        setUser(JSON.parse(userStr));
      } catch {
        // Refresh token expired or invalid — clear everything and force login
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (
    user: AuthUser,
    accessToken: string,
    refreshToken: string,
  ) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    setUser(user);
    setAccessToken(accessToken);
  };

  const logout = async () => {
    try {
      if (accessToken) await apiLogout(accessToken);
    } catch {
      // Ignore network errors on logout
    } finally {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      setUser(null);
      setAccessToken(null);
    }
  };

  const updateUser = async (updatedUser: AuthUser) => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isLoading, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
