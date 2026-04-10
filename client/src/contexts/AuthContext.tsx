import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/../../shared/schema';
import type { AssetMount } from '@/../../shared/game-engine/asset-mount';
import { DEFAULT_ASSET_MOUNTS } from '@/../../shared/game-engine/asset-mount';

interface AuthContextType {
  user: User | null;
  token: string | null;
  assetMounts: AssetMount[];
  login: (user: User, token: string, mounts?: AssetMount[]) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [assetMounts, setAssetMounts] = useState<AssetMount[]>(DEFAULT_ASSET_MOUNTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const storedToken = localStorage.getItem('insimul_token');
    const storedUser = localStorage.getItem('insimul_user');
    const storedMounts = localStorage.getItem('insimul_asset_mounts');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        if (storedMounts) {
          try { setAssetMounts(JSON.parse(storedMounts)); } catch { /* keep defaults */ }
        }

        // Verify token is still valid and refresh mounts
        fetch('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })
          .then(async (res) => {
            if (!res.ok) {
              // Token expired or invalid
              localStorage.removeItem('insimul_token');
              localStorage.removeItem('insimul_user');
              localStorage.removeItem('insimul_asset_mounts');
              setUser(null);
              setToken(null);
              setAssetMounts(DEFAULT_ASSET_MOUNTS);
            } else {
              const data = await res.json();
              if (data.assetMounts) {
                setAssetMounts(data.assetMounts);
                localStorage.setItem('insimul_asset_mounts', JSON.stringify(data.assetMounts));
              }
            }
          })
          .catch(() => {
            // Network error, keep local session
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('insimul_token');
        localStorage.removeItem('insimul_user');
        localStorage.removeItem('insimul_asset_mounts');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newUser: User, newToken: string, mounts?: AssetMount[]) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('insimul_token', newToken);
    localStorage.setItem('insimul_user', JSON.stringify(newUser));
    if (mounts) {
      setAssetMounts(mounts);
      localStorage.setItem('insimul_asset_mounts', JSON.stringify(mounts));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAssetMounts(DEFAULT_ASSET_MOUNTS);
    localStorage.removeItem('insimul_token');
    localStorage.removeItem('insimul_user');
    localStorage.removeItem('insimul_asset_mounts');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        assetMounts,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
