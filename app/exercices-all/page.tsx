'use client';

import { useState } from 'react';
import { NetworkProvider } from '@/lib/network-context';
import { ExerciseProvider } from '@/lib/exercise-context';
import { ExerciseWorkspace } from '@/components/exercise/exercise-workspace';
import { TerminalExerciseWorkspace } from '@/components/terminal/terminal-exercise-workspace';
import { exercises, type Exercise } from '@/lib/exercise-types';
import { terminalExercises, type TerminalExercise } from '@/lib/terminal-exercises';
import { useAuth } from '@/lib/auth-context';
import { useExerciseProgress } from '@/hooks/use-exercise-progress';
import { useTerminalProgress } from '@/hooks/use-terminal-progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  GraduationCap,
  Terminal,
  ArrowLeft,
  Home,
  Trophy,
  CheckCircle2,
  Lock,
  ChevronRight,
  Clock,
  Target,
  BookOpen,
  Star,
} from 'lucide-react';

export default function AllExercicesPage() {
  const [selectedNetworkExercise, setSelectedNetworkExercise] = useState<Exercise | null>(null);
  const [selectedTerminalExercise, setSelectedTerminalExercise] = useState<TerminalExercise | null>(null);
  const { user } = useAuth();

  const networkProgress = useExerciseProgress();
  const terminalProgress = useTerminalProgress();

  const networkStats = networkProgress.getOverallStats();
  const terminalStats = terminalProgress.getOverallStats();

  // If an exercise is selected, show the workspace
  if (selectedNetworkExercise) {
    return (
      <NetworkProvider>
        <ExerciseProvider>
          <ExerciseWorkspace
            exercise={selectedNetworkExercise}
            onBack={() => setSelectedNetworkExercise(null)}
            onSelectExercise={setSelectedNetworkExercise}
          />
        </ExerciseProvider>
      </NetworkProvider>
    );
  }

  if (selectedTerminalExercise) {
    return (
      <TerminalExerciseWorkspace
        exercise={selectedTerminalExercise}
        onBack={() => setSelectedTerminalExercise(null)}
        onNextExercise={(exercise) => {
          const currentIndex = terminalExercises.findIndex(e => e.id === exercise.id);
          if (currentIndex < terminalExercises.length - 1) {
            setSelectedTerminalExercise(terminalExercises[currentIndex + 1]);
          } else {
            setSelectedTerminalExercise(null);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <Home className="w-4 h-4" />
          <span className="text-sm">Accueil</span>
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Tous les exercices</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy className="w-4 h-4 text-primary" />
          <span>{user?.name || 'Utilisateur'}</span>
        </div>
      </header>

      <div className="p-6">
        {/* Global stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Exercices Reseau
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {networkStats.completedCount}/{networkStats.totalExercises}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={networkStats.completionPercentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Score: {networkStats.totalScore}/{networkStats.maxPossibleScore}</span>
                <span>{networkStats.completionPercentage}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-cyan-500" />
                  Exercices Terminal
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {terminalStats.completedCount}/{terminalStats.totalExercises}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={terminalStats.completionPercentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Score: {terminalStats.totalScore}/{terminalStats.maxPossibleScore}</span>
                <span>{terminalStats.completionPercentage}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for exercises */}
        <Tabs defaultValue="network" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="network" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Reseau ({exercises.length})
            </TabsTrigger>
            <TabsTrigger value="terminal" className="gap-2">
              <Terminal className="w-4 h-4" />
              Terminal ({terminalExercises.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="network" className="mt-6">
            <NetworkExerciseList
              onSelectExercise={setSelectedNetworkExercise}
              progress={networkProgress}
            />
          </TabsContent>

          <TabsContent value="terminal" className="mt-6">
            <TerminalExerciseList
              onSelectExercise={setSelectedTerminalExercise}
              progress={terminalProgress}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Network Exercise List Component
function NetworkExerciseList({
  onSelectExercise,
  progress,
}: {
  onSelectExercise: (exercise: Exercise) => void;
  progress: ReturnType<typeof useExerciseProgress>;
}) {
  const { isExerciseUnlocked, getExerciseProgress } = progress;

  const difficultyColors = {
    debutant: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediaire: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    avance: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const categoryLabels = {
    adressage: 'Adressage IP',
    dhcp: 'DHCP',
    dns: 'DNS',
    routage: 'Routage',
    switching: 'Commutation',
    subnetting: 'Sous-reseaux',
  };

  const categoryColors = {
    adressage: 'bg-blue-500/20 text-blue-400',
    dhcp: 'bg-purple-500/20 text-purple-400',
    dns: 'bg-cyan-500/20 text-cyan-400',
    routage: 'bg-orange-500/20 text-orange-400',
    switching: 'bg-pink-500/20 text-pink-400',
    subnetting: 'bg-emerald-500/20 text-emerald-400',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {exercises.map((exercise) => {
        const unlocked = isExerciseUnlocked(exercise.number);
        const exerciseProgress = getExerciseProgress(exercise.id);
        const scorePercentage = exerciseProgress
          ? Math.round((exerciseProgress.bestScore / exerciseProgress.maxScore) * 100)
          : 0;

        return (
          <Card
            key={exercise.id}
            className={cn(
              'border transition-all duration-200',
              unlocked
                ? 'bg-card border-border hover:border-primary/50 cursor-pointer group'
                : 'bg-muted/30 border-border/50 cursor-not-allowed opacity-60'
            )}
            onClick={() => unlocked && onSelectExercise(exercise)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      exerciseProgress?.completed
                        ? 'bg-green-500/20 text-green-400'
                        : unlocked
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {exerciseProgress?.completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : unlocked ? (
                      exercise.number
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>
                  <CardTitle
                    className={cn(
                      'text-base transition-colors',
                      unlocked ? 'text-foreground group-hover:text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {exercise.title}
                  </CardTitle>
                </div>
                <Badge variant="outline" className={cn('text-xs', difficultyColors[exercise.difficulty])}>
                  {exercise.difficulty}
                </Badge>
              </div>
              <Badge variant="secondary" className={cn('w-fit text-xs', categoryColors[exercise.category])}>
                {categoryLabels[exercise.category]}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {exerciseProgress && exerciseProgress.attempts > 0 && (
                <div className="bg-secondary/50 rounded-lg p-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Star
                        className={cn(
                          'w-3 h-3',
                          scorePercentage >= 70 ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                        )}
                      />
                      Meilleur score
                    </span>
                    <span className={cn('font-bold text-xs', scorePercentage >= 70 ? 'text-green-400' : 'text-foreground')}>
                      {exerciseProgress.bestScore}/{exerciseProgress.maxScore}
                    </span>
                  </div>
                  <Progress
                    value={scorePercentage}
                    className={cn('h-1.5', scorePercentage >= 70 && '[&>div]:bg-green-500')}
                  />
                </div>
              )}

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span>{exercise.objectives.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{exercise.estimatedTime}min</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>{exercise.theory.length}</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                disabled={!unlocked}
                className={cn(
                  'w-full justify-between text-xs',
                  unlocked ? 'text-primary hover:text-primary hover:bg-primary/10' : 'text-muted-foreground'
                )}
              >
                {!unlocked ? (
                  <span className="flex items-center gap-1 text-xs">
                    <Lock className="w-3 h-3" />
                    Exercice {exercise.number - 1} requis
                  </span>
                ) : exerciseProgress?.completed ? (
                  <>
                    Refaire
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Commencer
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Terminal Exercise List Component
function TerminalExerciseList({
  onSelectExercise,
  progress,
}: {
  onSelectExercise: (exercise: TerminalExercise) => void;
  progress: ReturnType<typeof useTerminalProgress>;
}) {
  const { isExerciseUnlocked, getExerciseProgress } = progress;

  const difficultyColors = {
    debutant: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediaire: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    avance: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {terminalExercises.map((exercise) => {
        const unlocked = isExerciseUnlocked(exercise.number);
        const exerciseProgress = getExerciseProgress(exercise.id);
        const scorePercentage = exerciseProgress
          ? Math.round((exerciseProgress.bestScore / exerciseProgress.maxScore) * 100)
          : 0;

        return (
          <Card
            key={exercise.id}
            className={cn(
              'border transition-all duration-200',
              unlocked
                ? 'bg-card border-border hover:border-cyan-500/50 cursor-pointer group'
                : 'bg-muted/30 border-border/50 cursor-not-allowed opacity-60'
            )}
            onClick={() => unlocked && onSelectExercise(exercise)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      exerciseProgress?.completed
                        ? 'bg-green-500/20 text-green-400'
                        : unlocked
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {exerciseProgress?.completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : unlocked ? (
                      exercise.number
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>
                  <CardTitle
                    className={cn(
                      'text-base transition-colors',
                      unlocked ? 'text-foreground group-hover:text-cyan-400' : 'text-muted-foreground'
                    )}
                  >
                    {exercise.title}
                  </CardTitle>
                </div>
                <Badge variant="outline" className={cn('text-xs', difficultyColors[exercise.difficulty])}>
                  {exercise.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription className="text-xs line-clamp-2">{exercise.description}</CardDescription>

              {exerciseProgress && exerciseProgress.attempts > 0 && (
                <div className="bg-secondary/50 rounded-lg p-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Star
                        className={cn(
                          'w-3 h-3',
                          scorePercentage >= 70 ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                        )}
                      />
                      Meilleur score
                    </span>
                    <span className={cn('font-bold text-xs', scorePercentage >= 70 ? 'text-green-400' : 'text-foreground')}>
                      {exerciseProgress.bestScore}/{exerciseProgress.maxScore}
                    </span>
                  </div>
                  <Progress
                    value={scorePercentage}
                    className={cn('h-1.5', scorePercentage >= 70 && '[&>div]:bg-green-500')}
                  />
                </div>
              )}

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  <span>{exercise.tasks.length} taches</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{exercise.estimatedTime}min</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                disabled={!unlocked}
                className={cn(
                  'w-full justify-between text-xs',
                  unlocked ? 'text-cyan-400 hover:text-cyan-400 hover:bg-cyan-500/10' : 'text-muted-foreground'
                )}
              >
                {!unlocked ? (
                  <span className="flex items-center gap-1 text-xs">
                    <Lock className="w-3 h-3" />
                    Exercice {exercise.number - 1} requis
                  </span>
                ) : exerciseProgress?.completed ? (
                  <>
                    Refaire
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Commencer
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
