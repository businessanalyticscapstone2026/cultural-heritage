import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type TravelStyle = "solo" | "couple" | "family" | "friends" | "educational";
export type AccessibilityPref = "wheelchair" | "family" | "senior" | "none";
export type TravelDistance = "nearby" | "municipality" | "province" | "anywhere";

export interface User {
  id: string;
  name: string;
  email: string;
  interests: string[];
  onboarded: boolean;
  travelStyle?: TravelStyle;
  accessibilityPrefs?: AccessibilityPref[];
  travelDistance?: TravelDistance;
  locationEnabled?: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: (data: {
    interests: string[];
    travelStyle?: TravelStyle;
    accessibilityPrefs?: AccessibilityPref[];
    travelDistance?: TravelDistance;
    locationEnabled?: boolean;
  }) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "patrimonio_auth";

function loadUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    setState({ user: loadUser(), loading: false });
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    const existing = loadUser();
    if (existing && existing.email === email) {
      saveUser(existing);
      setState({ user: existing, loading: false });
      return;
    }
    const user: User = {
      id: crypto.randomUUID(),
      name: email.split("@")[0],
      email,
      interests: [],
      onboarded: false,
    };
    saveUser(user);
    setState({ user, loading: false });
  }, []);

  const signup = useCallback(async (name: string, email: string, _password: string) => {
    const user: User = {
      id: crypto.randomUUID(),
      name,
      email,
      interests: [],
      onboarded: false,
    };
    saveUser(user);
    setState({ user, loading: false });
  }, []);

  const logout = useCallback(() => {
    saveUser(null);
    setState({ user: null, loading: false });
  }, []);

  const completeOnboarding = useCallback((data: {
    interests: string[];
    travelStyle?: TravelStyle;
    accessibilityPrefs?: AccessibilityPref[];
    travelDistance?: TravelDistance;
    locationEnabled?: boolean;
  }) => {
    setState((prev) => {
      if (!prev.user) return prev;
      const updated: User = {
        ...prev.user,
        interests: data.interests,
        onboarded: true,
        travelStyle: data.travelStyle,
        accessibilityPrefs: data.accessibilityPrefs,
        travelDistance: data.travelDistance,
        locationEnabled: data.locationEnabled,
      };
      saveUser(updated);
      return { ...prev, user: updated };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
