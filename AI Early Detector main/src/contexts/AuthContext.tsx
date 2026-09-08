import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  loginAsGuest: (email?: string) => void;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  loginAsGuest: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if guest session exists in browser storage first
    const guest = sessionStorage.getItem("guest_session") || localStorage.getItem("guest_session");
    if (guest) {
      try {
        setSession(JSON.parse(guest));
        setLoading(false);
      } catch (e) {
        sessionStorage.removeItem("guest_session");
        localStorage.removeItem("guest_session");
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) {
        setSession(s);
      } else {
        const guestActive = sessionStorage.getItem("guest_session") || localStorage.getItem("guest_session");
        if (guestActive) {
          try {
            setSession(JSON.parse(guestActive));
          } catch (e) {
            sessionStorage.removeItem("guest_session");
            localStorage.removeItem("guest_session");
            setSession(null);
          }
        } else {
          setSession(null);
        }
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) {
        setSession(s);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginAsGuest = (email?: string) => {
    const mockSession = {
      access_token: "mock-token",
      refresh_token: "mock-token",
      expires_in: 3600,
      token_type: "bearer",
      user: {
        id: "guest-id",
        email: email || "guest@aiearly.detector",
        app_metadata: { provider: "guest" },
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      }
    } as unknown as Session;

    sessionStorage.setItem("guest_session", JSON.stringify(mockSession));
    setSession(mockSession);
  };

  const signOut = async () => {
    sessionStorage.removeItem("guest_session");
    localStorage.removeItem("guest_session");
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
