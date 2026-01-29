'use client';

import { useState } from 'react';
import type { Exercise } from '@/lib/exercise-types';
import { NetworkProvider } from '@/lib/network-context';
import { ExerciseProvider, useExercise } from '@/lib/exercise-context';
import { ExerciseSelector } from '@/components/exercise/exercise-selector';
import { ExerciseWorkspace } from '@/components/exercise/exercise-workspace';

function ExerciseContent() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const { setCurrentExercise, setExerciseMode } = useExercise();

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCurrentExercise(exercise);
    setExerciseMode(true);
  };

  const handleBack = () => {
    setSelectedExercise(null);
    setCurrentExercise(null);
    setExerciseMode(false);
  };

  if (!selectedExercise) {
    return <ExerciseSelector onSelectExercise={handleSelectExercise} />;
  }

  return (
    <ExerciseWorkspace
      exercise={selectedExercise}
      onBack={handleBack}
      onSelectExercise={handleSelectExercise}
    />
  );
}

export default function ExercisesPage() {
  return (
    <NetworkProvider>
      <ExerciseProvider>
        <div className="min-h-screen bg-background">
          <ExerciseContent />
        </div>
      </ExerciseProvider>
    </NetworkProvider>
  );
}
