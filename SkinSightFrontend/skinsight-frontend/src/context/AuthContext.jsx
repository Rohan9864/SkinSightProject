import {
  createContext,
  useState,
  useEffect,
  useContext
} from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token  = localStorage.getItem('token');
      const stored = localStorage.getItem('user');
      
      if (token && stored) {
        try {
          // Validate token by calling a protected endpoint
          const response = await fetch(
            'http://localhost:8080/api/users/me',
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (response.ok) {
            // Token is valid, keep user logged in
            setUser(JSON.parse(stored));
          } else if (response.status === 401) {
            // Token is expired or invalid, clear everything
            localStorage.clear();
            setUser(null);
          }
        } catch (error) {
          // Network error or other issue, clear auth to be safe
          console.error('Auth validation error:', error);
          localStorage.clear();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user',
        JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
        value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error(
    'useAuth must be inside AuthProvider');
  return ctx;
};