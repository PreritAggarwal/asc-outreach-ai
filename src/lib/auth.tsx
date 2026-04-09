import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '@/lib/api';
import type { Org } from '@/lib/types';

interface AuthState {
  user: Org | null;
  token: string | null;
  isLoading: boolean;
  login: (googleIdToken: string) => Promise<void>;
  logout: () => void;
  markOnboardingComplete: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const PUBLIC_PATHS = ['/login'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Org | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // On mount — validate existing token
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      if (!PUBLIC_PATHS.includes(location.pathname)) {
        navigate('/login');
      }
      return;
    }

    api.get<{ complete: boolean }>('/api/onboarding/status')
      .then(() => {
        // Token is valid — fetch settings for user info
        return api.get<Org & { onboardingComplete: boolean }>('/api/settings');
      })
      .then((settings) => {
        setUser({
          id: settings.id,
          name: settings.name,
          email: settings.email,
          onboardingComplete: settings.onboardingComplete,
        });

        if (!settings.onboardingComplete && location.pathname !== '/onboarding') {
          navigate('/onboarding');
        }
      })
      .catch(() => {
        // Token invalid
        localStorage.removeItem('auth_token');
        setToken(null);
        if (!PUBLIC_PATHS.includes(location.pathname)) {
          navigate('/login');
        }
      })
      .finally(() => setIsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (googleIdToken: string) => {
    const response = await api.post<{ token: string; org: Org }>('/api/auth/google', {
      idToken: googleIdToken,
    });

    localStorage.setItem('auth_token', response.token);
    setToken(response.token);
    setUser(response.org);

    if (!response.org.onboardingComplete) {
      navigate('/onboarding');
    } else {
      navigate('/');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const markOnboardingComplete = () => {
    setUser((prev) => prev ? { ...prev, onboardingComplete: true } : null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, markOnboardingComplete }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
