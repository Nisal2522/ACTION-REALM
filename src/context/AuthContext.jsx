import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { db, hashPassword, useCollection } from '../services/db';

const AuthContext = createContext(null);
const SESSION_KEY = 'ar_session';

function readSession() {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const users = useCollection('users');
  const [userId, setUserId] = useState(readSession);
  const user = users.find((u) => u.id === userId) || null;

  useEffect(() => {
    try {
      if (userId) localStorage.setItem(SESSION_KEY, userId);
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      /* storage unavailable */
    }
  }, [userId]);

  const login = useCallback(async (email, password) => {
    const found = db.all('users').find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found || found.passwordHash !== (await hashPassword(password))) {
      throw new Error('Email or password is incorrect.');
    }
    setUserId(found.id);
    return found;
  }, []);

  const register = useCallback(async ({ name, email, phone, password }) => {
    if (db.all('users').some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const created = db.insert('users', {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: 'customer',
      coins: 0,
      addresses: [],
      passwordHash: await hashPassword(password),
    });
    setUserId(created.id);
    return created;
  }, []);

  const logout = useCallback(() => setUserId(null), []);

  const updateProfile = useCallback(
    async ({ password, ...patch }) => {
      if (!userId) return;
      const extra = password ? { passwordHash: await hashPassword(password) } : {};
      db.update('users', userId, { ...patch, ...extra });
    },
    [userId],
  );

  const value = useMemo(
    () => ({ user, isAdmin: user?.role === 'admin', login, register, logout, updateProfile }),
    [user, login, register, logout, updateProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
