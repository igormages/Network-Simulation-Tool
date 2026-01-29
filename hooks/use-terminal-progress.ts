'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { terminalExercises } from '@/lib/terminal-exercises';
import { useAuth } from '@/lib/auth-context';

interface TerminalExerciseProgress {
  exerciseId: string;
  exerciseNumber: number;
  completed: boolean;
  bestScore: number;
  maxScore: number;
  attempts: number;
  completedAt?: string;
}

interface ServerProgress {
  exercise_id: string;
  exercise_number: number;
  best_score: number;
  max_score: number;
  attempts: number;
  completed: boolean;
  completed_at: string | null;
}

export function useTerminalProgress() {
  const { user } = useAuth();
  const [serverProgress, setServerProgress] = useState<ServerProgress[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load progress from server
  useEffect(() => {
    if (!user) {
      setIsLoaded(true);
      return;
    }

    const loadProgress = async () => {
      try {
        const res = await fetch(`/api/terminal-progress?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setServerProgress(data);
        }
      } catch (error) {
        console.error('Failed to load terminal progress:', error);
      }
      setIsLoaded(true);
    };

    loadProgress();
  }, [user]);

  // Convert server progress to local format
  const progress = useMemo(() => {
    return terminalExercises.map((ex) => {
      const serverEx = serverProgress.find((p) => p.exercise_id === ex.id);
      if (serverEx) {
        return {
          exerciseId: ex.id,
          exerciseNumber: ex.number,
          completed: serverEx.completed,
          bestScore: serverEx.best_score,
          maxScore: serverEx.max_score,
          attempts: serverEx.attempts,
          completedAt: serverEx.completed_at || undefined,
        };
      }
      return {
        exerciseId: ex.id,
        exerciseNumber: ex.number,
        completed: false,
        bestScore: 0,
        maxScore: ex.maxScore,
        attempts: 0,
      };
    });
  }, [serverProgress]);

  const updateExerciseScore = useCallback(
    async (exerciseId: string, score: number, maxScore: number) => {
      if (!user) return;

      const exercise = terminalExercises.find((ex) => ex.id === exerciseId);
      if (!exercise) return;

      const passed = score >= maxScore * 0.7;

      // Update local state immediately
      setServerProgress((prev) => {
        const existing = prev.find((p) => p.exercise_id === exerciseId);
        if (existing) {
          return prev.map((p) =>
            p.exercise_id === exerciseId
              ? {
                  ...p,
                  best_score: Math.max(p.best_score, score),
                  attempts: p.attempts + 1,
                  completed: p.completed || passed,
                  completed_at: passed && !p.completed_at ? new Date().toISOString() : p.completed_at,
                }
              : p
          );
        }
        return [
          ...prev,
          {
            exercise_id: exerciseId,
            exercise_number: exercise.number,
            best_score: score,
            max_score: maxScore,
            attempts: 1,
            completed: passed,
            completed_at: passed ? new Date().toISOString() : null,
          },
        ];
      });

      // Save to server
      try {
        await fetch('/api/terminal-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            exerciseId,
            exerciseNumber: exercise.number,
            score,
            maxScore,
          }),
        });
      } catch (error) {
        console.error('Failed to save terminal progress:', error);
      }
    },
    [user]
  );

  const getExerciseProgress = useCallback(
    (exerciseId: string): TerminalExerciseProgress | undefined => {
      return progress.find((p) => p.exerciseId === exerciseId);
    },
    [progress]
  );

  const isExerciseUnlocked = useCallback(
    (exerciseNumber: number): boolean => {
      if (exerciseNumber === 1) return true;
      const previousExercise = terminalExercises.find((ex) => ex.number === exerciseNumber - 1);
      if (!previousExercise) return false;
      const prevProgress = progress.find((p) => p.exerciseId === previousExercise.id);
      return prevProgress?.completed || false;
    },
    [progress]
  );

  const getOverallStats = useCallback(() => {
    const completedCount = progress.filter((p) => p.completed).length;
    const totalScore = progress.reduce((sum, p) => sum + p.bestScore, 0);
    const maxPossibleScore = terminalExercises.reduce((sum, ex) => sum + ex.maxScore, 0);

    return {
      completedCount,
      totalExercises: terminalExercises.length,
      completionPercentage: Math.round((completedCount / terminalExercises.length) * 100),
      totalScore,
      maxPossibleScore,
    };
  }, [progress]);

  return {
    isLoaded,
    progress,
    updateExerciseScore,
    getExerciseProgress,
    isExerciseUnlocked,
    getOverallStats,
  };
}
