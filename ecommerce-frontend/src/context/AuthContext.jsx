import { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth.js';

const AuthContext = createContext(null);

// Hook so any component can read the logged-in user: const { user } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = not logged in
  const [loading, setLoading] = useState(true); // true while we check on first load

  // Save the access token in localStorage so it survives page refreshes.
  function saveToken(token) {
    localStorage.setItem('accessToken', token);
  }
  function clearToken() {
    localStorage.removeItem('accessToken');
  }

  // When the app first loads, try to restore the session using the refresh cookie.
  useEffect(() => {
    async function restoreSession() {
      try {
        const res = await authApi.refresh(); // uses the httpOnly cookie
        saveToken(res.data.accessToken);
        const me = await authApi.getMe();
        setUser(me.data);
      } catch {
        // No valid session — that's fine, the user is just a guest.
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  async function login(email, password) {
    const res = await authApi.login({ email, password });
    saveToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(name, email, password) {
    const res = await authApi.register({ name, email, password });
    saveToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      clearToken();
      setUser(null);
    }
  }

  const value = { user, loading, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
