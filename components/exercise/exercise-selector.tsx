'use client';

import { exercises, type Exercise } from '@/lib/exercise-types';
import { useExerciseProgress } from '@/hooks/use-exercise-progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Clock,
  Target,
  ChevronRight,
  Lock,
  CheckCircle2,
  Trophy,
  RotateCcw,
  Star,
  ArrowLeft,
  Home,
} from 'lucide-react';
import Link from 'next/link';

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

interface ExerciseSelectorProps {
  onSelectExercise: (exercise: Exercise) => void;
}

export function ExerciseSelector({ onSelectExercise }: ExerciseSelectorProps) {
  const { isLoaded, isExerciseUnlocked, getExerciseProgress, getOverallStats, resetProgress } =
    useExerciseProgress();

  const stats = getOverallStats();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <Home className="w-4 h-4" />
          <span className="text-sm">Accueil</span>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy className="w-4 h-4 text-primary" />
          <span>{stats.completedCount}/{stats.totalExercises} exercices</span>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Header with stats */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Exercices Pratiques</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Mettez en pratique vos connaissances en reseau. Validez chaque exercice pour debloquer le
            suivant.
          </p>

          {/* Progress overview */}
          <div className="max-w-md mx-auto bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">Progression globale</span>
              </div>
              <span className="text-muted-foreground">
                {stats.completedCount}/{stats.totalExercises} exercices
              </span>
            </div>
            <Progress value={stats.completionPercentage} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Score total: {stats.totalScore}/{stats.maxPossibleScore} pts
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetProgress}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reinitialiser
              </Button>
            </div>
          </div>
        </div>

        {/* Category badges */}
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Badge
              key={key}
              variant="outline"
              className={cn('px-3 py-1', categoryColors[key as keyof typeof categoryColors])}
            >
              {label}
            </Badge>
          ))}
        </div>

        {/* Exercise grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((exercise) => {
            const unlocked = isExerciseUnlocked(exercise.number);
            const progress = getExerciseProgress(exercise.id);
            const scorePercentage = progress ? Math.round((progress.bestScore / progress.maxScore) * 100) : 0;

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
                      {/* Exercise number badge */}
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                          progress?.completed
                            ? 'bg-green-500/20 text-green-400'
                            : unlocked
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {progress?.completed ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : unlocked ? (
                          exercise.number
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>
                      <CardTitle
                        className={cn(
                          'text-lg transition-colors',
                          unlocked
                            ? 'text-foreground group-hover:text-primary'
                            : 'text-muted-foreground'
                        )}
                      >
                        {exercise.title}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className={cn(difficultyColors[exercise.difficulty])}>
                      {exercise.difficulty}
                    </Badge>
                  </div>
                  <div className="flex gap-2 ml-10">
                    <Badge variant="secondary" className={cn(categoryColors[exercise.category])}>
                      {categoryLabels[exercise.category]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-muted-foreground line-clamp-2">
                    {exercise.description}
                  </CardDescription>

                  {/* Score display for completed or attempted exercises */}
                  {progress && progress.attempts > 0 && (
                    <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Meilleur score</span>
                        <div className="flex items-center gap-1">
                          <Star
                            className={cn(
                              'w-4 h-4',
                              scorePercentage >= 70 ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                            )}
                          />
                          <span
                            className={cn(
                              'font-bold',
                              scorePercentage >= 70 ? 'text-green-400' : 'text-foreground'
                            )}
                          >
                            {progress.bestScore}/{progress.maxScore}
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={scorePercentage}
                        className={cn('h-1.5', scorePercentage >= 70 && '[&>div]:bg-green-500')}
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{progress.attempts} tentative(s)</span>
                        {progress.completed && (
                          <span className="text-green-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Valide
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Exercise info */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span>{exercise.objectives.length} objectifs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{exercise.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{exercise.theory.length} notions</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!unlocked}
                    className={cn(
                      'w-full justify-between',
                      unlocked
                        ? 'text-primary hover:text-primary hover:bg-primary/10'
                        : 'text-muted-foreground'
                    )}
                  >
                    {!unlocked ? (
                      <>
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Validez l\'exercice {exercise.number - 1}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    ) : progress?.completed ? (
                      <>
                        Refaire l'exercice
                        <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Commencer l'exercice
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
