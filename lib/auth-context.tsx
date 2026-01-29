'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, ExerciseProgressDB } from './actions/user-actions';

interface AuthContextType {
  user: User | null;
  progress: ExerciseProgressDB[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isTeacher: boolean;
  login: (email: string, name: string) => Promise<boolean>;
  logout: () => void;
  refreshProgress: () => Promise<void>;
  updateLocalProgress: (exerciseId: string, exerciseNumber: number, score: number, maxScore: number) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'netsim_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<ExerciseProgressDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        // Fetch fresh progress from server
        fetchProgress(parsed.user.id);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const fetchProgress = async (userId: number) => {
    try {
      const response = await fetch(`/api/progress?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const login = useCallback(async (email: string, name: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      setUser(data.user);
      setProgress(data.progress);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: data.user }));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setProgress([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const refreshProgress = useCallback(async () => {
    if (user) {
      await fetchProgress(user.id);
    }
  }, [user]);

  const updateLocalProgress = useCallback(
    (exerciseId: string, exerciseNumber: number, score: number, maxScore: number) => {
      const completed = score >= maxScore * 0.7;

      setProgress((prev) => {
        const existing = prev.find((p) => p.exercise_id === exerciseId);
        if (existing) {
          return prev.map((p) =>
            p.exercise_id === exerciseId
              ? {
                  ...p,
                  best_score: Math.max(p.best_score, score),
                  completed: p.completed || completed,
                  attempts: p.attempts + 1,
                }
              : p
          );
        }
        return [
          ...prev,
          {
            id: 0,
            user_id: user?.id || 0,
            exercise_id: exerciseId,
            exercise_number: exerciseNumber,
            completed,
            best_score: score,
            max_score: maxScore,
            attempts: 1,
            completed_at: completed ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          },
        ];
      });
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        progress,
        isLoading,
        isAuthenticated: !!user,
        isTeacher: user?.role === 'teacher',
        login,
        logout,
        refreshProgress,
        updateLocalProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
