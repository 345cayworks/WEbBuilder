import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Role, User } from "@/types";
import { localStore, KEYS } from "@/lib/storage";
import { roleCan, type Permission } from "@/lib/constants";
import { useSettings } from "./SettingsContext";
import { useData } from "./DataContext";

interface LoginResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, masterKey?: string) => LoginResult;
  logout: () => void;
  can: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const { data, setActor } = useData();
  const [user, setUser] = useState<User | null>(() =>
    localStore.get<User | null>(KEYS.session, null),
  );

  // Keep the data layer's audit/history actor in sync with the logged-in user.
  useEffect(() => {
    setActor(user?.name ?? "system");
  }, [user, setActor]);

  const login = useCallback(
    (emailRaw: string, masterKey?: string): LoginResult => {
      const email = emailRaw.trim().toLowerCase();
      if (!email) return { ok: false, error: "Enter your email address." };

      const found = data.users.find((u) => u.email.toLowerCase() === email);
      const isSuperEmail = email === settings.superAdminEmail.trim().toLowerCase();
      const wantsSuper = isSuperEmail || found?.role === "SUPER_ADMIN";

      if (wantsSuper && settings.superAdminMasterKey) {
        if ((masterKey ?? "") !== settings.superAdminMasterKey) {
          return { ok: false, error: "Invalid SuperAdmin master key." };
        }
      }

      let nextUser: User | null = found ?? null;
      if (!nextUser && isSuperEmail) {
        nextUser = {
          id: "superadmin",
          email,
          name: "Super Admin",
          role: "SUPER_ADMIN",
          createdAt: new Date().toISOString(),
        };
      }
      if (!nextUser) {
        return { ok: false, error: "No account found for that email." };
      }

      localStore.set(KEYS.session, nextUser);
      setUser(nextUser);
      return { ok: true };
    },
    [data.users, settings.superAdminEmail, settings.superAdminMasterKey],
  );

  const logout = useCallback(() => {
    localStore.remove(KEYS.session);
    setUser(null);
  }, []);

  const can = useCallback(
    (permission: Permission): boolean => {
      const role: Role | undefined = user?.role;
      return role ? roleCan(role, permission) : false;
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, can }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
