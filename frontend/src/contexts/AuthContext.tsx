import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthContextValue {
  token: string | null;
  username: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeUsername(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("mh_token")
  );
  const [username, setUsername] = useState<string | null>(() => {
    const t = localStorage.getItem("mh_token");
    return t ? decodeUsername(t) : null;
  });

  function login(newToken: string) {
    localStorage.setItem("mh_token", newToken);
    setToken(newToken);
    setUsername(decodeUsername(newToken));
  }

  function logout() {
    localStorage.removeItem("mh_token");
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ token, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
