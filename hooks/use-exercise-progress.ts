'use client';

import { useCallback, useMemo } from 'react';
import { exercises, type ExerciseProgress } from '@/lib/exercise-types';
import { useAuth } from '@/lib/auth-context';

export function useExerciseProgress() {
  const { user, progress: serverProgress, updateLocalProgress, isLoading } = useAuth();

  // Convert server progress to local format
  const progress = useMemo(() => {
    const exerciseList = exercises.map((ex) => {
      const serverEx = serverProgress?.find((p) => p.exercise_id === ex.id);
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

    return {
      exercises: exerciseList,
      lastUpdated: new Date().toISOString(),
    };
  }, [serverProgress]);

  const updateExerciseScore = useCallback(
    async (exerciseId: string, score: number, maxScore: number) => {
      if (!user) return;

      const exercise = exercises.find((ex) => ex.id === exerciseId);
      if (!exercise) return;

      // Update local state immediately
      updateLocalProgress(exerciseId, exercise.number, score, maxScore);

      // Save to server
      try {
        await fetch('/api/progress', {
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
        console.error('Failed to save progress to server:', error);
      }
    },
    [user, updateLocalProgress]
  );

  const isExerciseUnlocked = useCallback(
    (exerciseNumber: number): boolean => {
      if (exerciseNumber === 1) return true;

      // Check if previous exercise is completed
      const previousExercise = progress.exercises.find(
        (ex) => ex.exerciseNumber === exerciseNumber - 1
      );
      return previousExercise?.completed ?? false;
    },
    [progress]
  );

  const getExerciseProgress = useCallback(
    (exerciseId: string): ExerciseProgress | undefined => {
      return progress.exercises.find((ex) => ex.exerciseId === exerciseId);
    },
    [progress]
  );

  const getOverallStats = useCallback(() => {
    const completedCount = progress.exercises.filter((ex) => ex.completed).length;
    const totalScore = progress.exercises.reduce((sum, ex) => sum + ex.bestScore, 0);
    const maxPossibleScore = progress.exercises.reduce((sum, ex) => sum + ex.maxScore, 0);

    return {
      totalExercises: exercises.length,
      completedCount,
      totalScore,
      maxPossibleScore,
      completionPercentage: Math.round((completedCount / exercises.length) * 100),
    };
  }, [progress]);

  const resetProgress = useCallback(() => {
    // For now, just log - full reset would require server-side implementation
    console.log('Reset progress requested');
  }, []);

  return {
    progress,
    isLoaded: !isLoading,
    updateExerciseScore,
    isExerciseUnlocked,
    getExerciseProgress,
    getOverallStats,
    resetProgress,
  };
}
