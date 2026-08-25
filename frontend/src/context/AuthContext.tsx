import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type { ReactNode } from "react";
import { authService } from "@/services/auth.service";
import type { Profile, Role } from "@/types/auth";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  avatarUrl?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  getRedirectPath: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

function getRoleRedirectPath(role: Role): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/admin/dashboard";
    case "TEACHER":
      return "/teacher/dashboard";
    case "STUDENT":
      return "/student/dashboard";
    default:
      return "/";
  }
}

function mapUser(
  authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> },
  profile: Profile | null
): AuthUser {
  return {
    id: authUser.id,
    email: authUser.email || profile?.email || "",
    role: profile?.role || "STUDENT",
    fullName:
      profile?.full_name ||
      (authUser.user_metadata?.full_name as string) ||
      "",
    avatarUrl: profile?.avatar_url || undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const loadProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      try {
        const profileData = await authService.getProfile(userId);
        if (mountedRef.current) {
          setProfile(profileData);
        }
        return profileData;
      } catch {
        if (mountedRef.current) {
          setProfile(null);
        }
        return null;
      }
    },
    []
  );

  const handleAuthChange = useCallback(
    async (event: string, session: unknown) => {
      if (!mountedRef.current) return;

      const authSession = session as {
        user?: {
          id: string;
          email?: string;
          user_metadata?: Record<string, unknown>;
        };
      } | null;

      if (event === "SIGNED_OUT" || !authSession?.user) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (authSession.user) {
        const profileData = await loadProfile(authSession.user.id);
        if (!mountedRef.current) return;
        setUser(mapUser(authSession.user, profileData));
        setLoading(false);
      }
    },
    [loadProfile]
  );

  useEffect(() => {
    mountedRef.current = true;

    async function init() {
      try {
        const session = await authService.getSession();
        if (!mountedRef.current) return;

        if (session?.user) {
          const profileData = await loadProfile(session.user.id);
          if (!mountedRef.current) return;
          setUser(mapUser(session.user, profileData));
        }
      } catch {
        // Session not available
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    }

    init();

    const {
      data: { subscription },
    } = authService.onAuthStateChange(handleAuthChange);

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [handleAuthChange, loadProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const data = await authService.signIn(email, password);
      if (data.user) {
        const profileData = await loadProfile(data.user.id);
        setUser(mapUser(data.user, profileData));
      }
    },
    [loadProfile]
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string, phone?: string) => {
      const data = await authService.signUp(email, password, fullName, phone);
      if (data.user) {
        const profileData = await loadProfile(data.user.id);
        setUser(mapUser(data.user, profileData));
      }
    },
    [loadProfile]
  );

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPassword(email);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user.id);
    }
  }, [user, loadProfile]);

  const getRedirectPath = useCallback(() => {
    if (!user) return "/";
    return getRoleRedirectPath(user.role);
  }, [user]);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile,
    getRedirectPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
