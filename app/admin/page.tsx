'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { exercises } from '@/lib/exercise-types';
import { terminalExercises } from '@/lib/terminal-exercises';
import type { StudentWithProgress } from '@/lib/actions/user-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Users,
  Trophy,
  CheckCircle2,
  Clock,
  Loader2,
  Eye,
  GraduationCap,
  TrendingUp,
  Award,
  Terminal,
} from 'lucide-react';

export default function AdminPage() {
  const { user, isTeacher, isLoading: authLoading } = useAuth();
  const [students, setStudents] = useState<StudentWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithProgress | null>(null);

  useEffect(() => {
    if (isTeacher) {
      fetchStudents();
    }
  }, [isTeacher]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isTeacher) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">Acces refuse</div>
        <p className="text-muted-foreground">Cette page est reservee aux professeurs.</p>
        <Link href="/">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour a l'accueil
          </Button>
        </Link>
      </div>
    );
  }

  const totalExercises = exercises.length;
  const totalTerminalExercises = terminalExercises.length;
  const maxPossibleScore = exercises.reduce((sum, ex) => sum + ex.maxScore, 0);
  const maxTerminalScore = terminalExercises.reduce((sum, ex) => sum + ex.maxScore, 0);

  // Calculate stats for network exercises
  const averageScore =
    students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.totalScore, 0) / students.length) : 0;
  const averageCompletion =
    students.length > 0
      ? Math.round((students.reduce((sum, s) => sum + s.completedCount, 0) / students.length / totalExercises) * 100)
      : 0;
  const fullyCompletedCount = students.filter((s) => s.completedCount === totalExercises).length;

  // Calculate stats for terminal exercises
  const averageTerminalScore =
    students.length > 0 ? Math.round(students.reduce((sum, s) => sum + (s.terminalTotalScore || 0), 0) / students.length) : 0;
  const averageTerminalCompletion =
    students.length > 0
      ? Math.round((students.reduce((sum, s) => sum + (s.terminalCompletedCount || 0), 0) / students.length / totalTerminalExercises) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Tableau de bord professeur</h1>
              <p className="text-sm text-muted-foreground">Suivi de la progression des etudiants</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            <GraduationCap className="w-4 h-4 mr-1" />
            {user?.name}
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription>Total etudiants</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                {students.length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription>Score moyen (Reseau)</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                {averageScore}/{maxPossibleScore}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Progress value={maxPossibleScore > 0 ? (averageScore / maxPossibleScore) * 100 : 0} className="h-1.5" />
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription>Score moyen (Terminal)</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-500" />
                {averageTerminalScore}/{maxTerminalScore}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Progress value={maxTerminalScore > 0 ? (averageTerminalScore / maxTerminalScore) * 100 : 0} className="h-1.5" />
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription>Progression Reseau</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                {averageCompletion}%
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Progress value={averageCompletion} className="h-1.5" />
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription>Progression Terminal</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-500" />
                {averageTerminalCompletion}%
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Progress value={averageTerminalCompletion} className="h-1.5" />
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Liste des etudiants</CardTitle>
            <CardDescription>
              Cliquez sur un etudiant pour voir le detail de sa progression
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun etudiant n'a encore utilise la plateforme.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Etudiant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Reseau</TableHead>
                    <TableHead className="text-center">Terminal</TableHead>
                    <TableHead className="text-center">Score total</TableHead>
                    <TableHead className="text-center">Connexion</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const progressPercent = Math.round((student.completedCount / totalExercises) * 100);
                    const terminalProgressPercent = Math.round(((student.terminalCompletedCount || 0) / totalTerminalExercises) * 100);
                    const totalCombinedScore = student.totalScore + (student.terminalTotalScore || 0);
                    const maxCombinedScore = maxPossibleScore + maxTerminalScore;
                    return (
                      <TableRow key={student.user.id}>
                        <TableCell className="font-medium">{student.user.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{student.user.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={progressPercent} className="w-16 h-2" />
                            <span className="text-xs text-muted-foreground">
                              {student.completedCount}/{totalExercises}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={terminalProgressPercent} className="w-16 h-2" />
                            <span className="text-xs text-muted-foreground">
                              {student.terminalCompletedCount || 0}/{totalTerminalExercises}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={totalCombinedScore >= maxCombinedScore * 0.7 ? 'default' : 'secondary'}>
                            {totalCombinedScore}/{maxCombinedScore}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {new Date(student.user.last_login).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(student)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Student Detail Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedStudent?.user.name}</DialogTitle>
            <DialogDescription>{selectedStudent?.user.email}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-foreground">{selectedStudent?.completedCount}/{totalExercises}</p>
                <p className="text-xs text-muted-foreground">Reseau</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-foreground">{selectedStudent?.terminalCompletedCount || 0}/{totalTerminalExercises}</p>
                <p className="text-xs text-muted-foreground">Terminal</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-foreground">{(selectedStudent?.totalScore || 0) + (selectedStudent?.terminalTotalScore || 0)}</p>
                <p className="text-xs text-muted-foreground">Score total</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-foreground">
                  {(selectedStudent?.progress.reduce((sum, p) => sum + p.attempts, 0) || 0) + (selectedStudent?.terminalProgress?.reduce((sum, p) => sum + p.attempts, 0) || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Tentatives</p>
              </div>
            </div>

            {/* Network exercises */}
            <div className="space-y-2">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                Exercices Reseau
              </h4>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {exercises.map((exercise) => {
                  const progress = selectedStudent?.progress.find((p) => p.exercise_id === exercise.id);
                  return (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            progress?.completed
                              ? 'bg-green-500/20 text-green-400'
                              : progress
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {progress?.completed ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            exercise.number
                          )}
                        </div>
                        <p className="font-medium text-sm text-foreground">{exercise.title}</p>
                      </div>
                      <div className="text-right">
                        {progress ? (
                          <Badge variant={progress.completed ? 'default' : 'secondary'} className="text-xs">
                            {progress.best_score}/{progress.max_score}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Terminal exercises */}
            <div className="space-y-2">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-500" />
                Exercices Terminal
              </h4>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {terminalExercises.map((exercise) => {
                  const progress = selectedStudent?.terminalProgress?.find((p) => p.exercise_id === exercise.id);
                  return (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            progress?.completed
                              ? 'bg-green-500/20 text-green-400'
                              : progress
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {progress?.completed ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            exercise.number
                          )}
                        </div>
                        <p className="font-medium text-sm text-foreground">{exercise.title}</p>
                      </div>
                      <div className="text-right">
                        {progress ? (
                          <Badge variant={progress.completed ? 'default' : 'secondary'} className="text-xs">
                            {progress.best_score}/{progress.max_score}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
