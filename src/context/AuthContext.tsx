'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/api';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  roles: string[];
  permissions: string[];
  token: string | null;
  isLoading: boolean;
  login: (loginVal: string, passwordVal: string) => Promise<any>;
  register: (nameVal: string, emailVal: string, phoneVal: string, passwordVal: string, confirmPasswordVal: string) => Promise<any>;
  logout: () => Promise<void>;
  hasRole: (roleNames: string | string[]) => boolean;
  hasPermission: (permissionName: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore session
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem('mh_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        setToken(storedToken);
        const response = await api.get<{
          user: User;
          roles: string[];
          permissions: string[];
        }>('/auth/me');
        
        if (response.success && response.data) {
          setUser(response.data.user);
          setRoles(response.data.roles);
          setPermissions(response.data.permissions);
        } else {
          clearSession();
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const clearSession = () => {
    setUser(null);
    setRoles([]);
    setPermissions([]);
    setToken(null);
    localStorage.removeItem('mh_token');
  };

  const login = async (loginVal: string, passwordVal: string) => {
    setIsLoading(true);
    try {
      const response = await api.post<{
        user: User;
        roles: string[];
        permissions: string[];
        token: string;
      }>('/auth/login', {
        login: loginVal,
        password: passwordVal,
      });

      if (response.success && response.data) {
        const { user: loggedUser, roles: userRoles, permissions: userPerms, token: authToken } = response.data;
        setUser(loggedUser);
        setRoles(userRoles);
        setPermissions(userPerms);
        setToken(authToken);
        localStorage.setItem('mh_token', authToken);
        return response.data;
      }
      throw new Error(response.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    nameVal: string,
    emailVal: string,
    phoneVal: string,
    passwordVal: string,
    confirmPasswordVal: string
  ) => {
    setIsLoading(true);
    try {
      const response = await api.post<{
        user: User;
        roles: string[];
        token: string;
      }>('/auth/register', {
        name: nameVal,
        email: emailVal,
        phone: phoneVal,
        password: passwordVal,
        password_confirmation: confirmPasswordVal,
      });

      if (response.success && response.data) {
        const { user: registeredUser, roles: userRoles, token: authToken } = response.data;
        setUser(registeredUser);
        setRoles(userRoles);
        setPermissions(['dashboard.view']); // default customer perm
        setToken(authToken);
        localStorage.setItem('mh_token', authToken);
        return response.data;
      }
      throw new Error(response.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/logout').catch(() => {});
    } finally {
      clearSession();
      setIsLoading(false);
      router.push('/');
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await api.get<{
        user: User;
        roles: string[];
        permissions: string[];
      }>('/auth/me');
      if (response.success && response.data) {
        setUser(response.data.user);
        setRoles(response.data.roles);
        setPermissions(response.data.permissions);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const hasRole = (roleNames: string | string[]): boolean => {
    if (roles.includes('super_admin')) return true; // Super admins have access to everything
    if (Array.isArray(roleNames)) {
      return roleNames.some((r) => roles.includes(r));
    }
    return roles.includes(roleNames);
  };

  const hasPermission = (permissionName: string): boolean => {
    if (roles.includes('super_admin')) return true; // Super admins override permissions
    return permissions.includes(permissionName);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        permissions,
        token,
        isLoading,
        login,
        register,
        logout,
        hasRole,
        hasPermission,
        refreshUser,
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
