import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'dev' | 'manager' | 'ba' | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  user: User | null;
}

// Mock user database
const MOCK_USERS: User[] = [
  { id: '00000000-0000-0000-0000-000000000001', email: 'dev@example.com', name: 'Developer User', role: 'dev' },
  { id: '00000000-0000-0000-0000-000000000002', email: 'ba@example.com', name: 'BA User', role: 'ba' },
  { id: '00000000-0000-0000-0000-000000000003', email: 'manager@example.com', name: 'Manager User', role: 'manager' },
  { id: '00000000-0000-0000-0000-000000000004', email: 'marek@example.com', name: 'Marek', role: 'manager' },
  { id: '00000000-0000-0000-0000-000000000005', email: 'client@example.com', name: 'Client User', role: 'client' },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    localStorage.setItem('isAuthenticated', String(isAuthenticated));
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [isAuthenticated, user]);

  const login = (email: string) => {
    // Find user by email in mock database
    const foundUser = MOCK_USERS.find(u => u.email === email);
    if (foundUser) {
      setIsAuthenticated(true);
      setUser(foundUser);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
