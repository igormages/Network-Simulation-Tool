'use client';

import { useState, useEffect } from 'react';
import { exercises, type Exercise } from '@/lib/exercise-types';
import { useExercise } from '@/lib/exercise-context';
import { useNetwork } from '@/lib/network-context';
import { useExerciseProgress } from '@/hooks/use-exercise-progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import {
  Target,
  BookOpen,
  Lightbulb,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronRight,
  Trophy,
  Star,
} from 'lucide-react';

interface ExercisePanelProps {
  exercise: Exercise;
  onBack: () => void;
  onNextExercise?: (exercise: Exercise) => void;
}

export function ExercisePanel({ exercise, onBack, onNextExercise }: ExercisePanelProps) {
  const { validateExercise, validationResults, showSolution, toggleSolution } = useExercise();
  const { topology, simulatePing, runDHCPDiscovery, addConsoleLog, clearTopology } = useNetwork();
  const { updateExerciseScore, getExerciseProgress, isExerciseUnlocked } = useExerciseProgress();
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const progress = getExerciseProgress(exercise.id);
  const nextExercise = exercises.find((ex) => ex.number === exercise.number + 1);
  const isNextUnlocked = nextExercise ? isExerciseUnlocked(nextExercise.number) : false;

  // Reset state when exercise changes
  useEffect(() => {
    setShowHints(false);
    setCurrentHint(0);
    setShowSuccessMessage(false);
  }, [exercise.id]);

  const handleValidate = () => {
    addConsoleLog('--- Validation de l\'exercice ---');
    const result = validateExercise(topology);

    for (const res of result.validationResults) {
      const icon = res.passed ? '[OK]' : '[X]';
      addConsoleLog(`${icon} ${res.message}`);
    }

    addConsoleLog(
      `Score: ${result.score}/${result.maxScore} (${Math.round((result.score / result.maxScore) * 100)}%)`
    );

    // Save progress
    updateExerciseScore(exercise.id, result.score, result.maxScore);

    if (result.passed) {
      addConsoleLog('Felicitations! Exercice reussi!');
      setShowSuccessMessage(true);
    } else {
      addConsoleLog('Exercice non valide. Verifiez les erreurs ci-dessus.');
      setShowSuccessMessage(false);
    }
  };

  const handleNextExercise = () => {
    if (nextExercise && onNextExercise) {
      clearTopology();
      onNextExercise(nextExercise);
    }
  };

  const handleSimulatePing = () => {
    const pcs = topology.devices.filter(d => d.type === 'pc');
    if (pcs.length < 2) {
      addConsoleLog('Erreur: Il faut au moins 2 PC pour simuler un ping');
      return;
    }
    
    const source = pcs[0];
    const target = pcs[1];
    const targetIp = target.interfaces.find(i => i.ipAddress)?.ipAddress;
    
    if (!targetIp) {
      addConsoleLog('Erreur: Le PC cible n\'a pas d\'adresse IP');
      return;
    }
    
    simulatePing(source.id, targetIp);
  };

  const handleDHCPTest = () => {
    const clients = topology.devices.filter(d => 
      d.type === 'pc' && d.interfaces.some(i => i.dhcpEnabled)
    );
    
    if (clients.length === 0) {
      addConsoleLog('Erreur: Aucun client DHCP trouve');
      return;
    }
    
    for (const client of clients) {
      runDHCPDiscovery(client.id);
    }
  };

  const nextHint = () => {
    setShowHints(true);
    setCurrentHint(prev => Math.min(prev + 1, exercise.hints.length - 1));
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="px-4 py-3 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{exercise.number}</span>
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{exercise.title}</h2>
              <Badge variant="outline" className="mt-1 text-xs">
                {exercise.difficulty}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onBack}>
            Retour
          </Button>
        </div>

        {/* Progress bar for this exercise */}
        {progress && progress.attempts > 0 && (
          <div className="bg-secondary/50 rounded-lg p-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Star
                  className={cn(
                    'w-3 h-3',
                    progress.completed ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                  )}
                />
                Meilleur score
              </span>
              <span className={cn('font-bold', progress.completed ? 'text-green-400' : 'text-foreground')}>
                {progress.bestScore}/{progress.maxScore}
              </span>
            </div>
            <Progress
              value={Math.round((progress.bestScore / progress.maxScore) * 100)}
              className={cn('h-1.5', progress.completed && '[&>div]:bg-green-500')}
            />
          </div>
        )}
      </div>

      <Tabs defaultValue="objectives" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-2 grid grid-cols-3">
          <TabsTrigger value="objectives" className="text-xs">
            <Target className="w-3 h-3 mr-1" />
            Objectifs
          </TabsTrigger>
          <TabsTrigger value="theory" className="text-xs">
            <BookOpen className="w-3 h-3 mr-1" />
            Theorie
          </TabsTrigger>
          <TabsTrigger value="hints" className="text-xs">
            <Lightbulb className="w-3 h-3 mr-1" />
            Aide
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="objectives" className="p-4 space-y-4 mt-0">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Description</h3>
              <p className="text-sm text-muted-foreground">{exercise.description}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Objectifs a atteindre</h3>
              <ul className="space-y-2">
                {exercise.objectives.map((obj, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-primary font-medium">{index + 1}</span>
                    </div>
                    <span className="text-muted-foreground">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Validation Results */}
            {validationResults && (
              <div className="space-y-2 pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  Resultat de la validation
                  {validationResults.passed ? (
                    <Badge className="bg-success text-success-foreground">Reussi</Badge>
                  ) : (
                    <Badge variant="destructive">Echec</Badge>
                  )}
                </h3>
                <div className="space-y-1">
                  {validationResults.validationResults.map((result, index) => (
                    <div 
                      key={index}
                      className={cn(
                        'flex items-center gap-2 text-sm p-2 rounded',
                        result.passed ? 'bg-success/10' : 'bg-destructive/10'
                      )}
                    >
                      {result.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                      <span className={result.passed ? 'text-success' : 'text-destructive'}>
                        {result.message}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {result.passed ? result.rule.points : 0}/{result.rule.points} pts
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-right text-sm font-medium text-foreground">
                  Score total: {validationResults.score}/{validationResults.maxScore}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="theory" className="p-4 mt-0">
            <Accordion type="single" collapsible className="space-y-2">
              {exercise.theory.map((section, index) => (
                <AccordionItem key={index} value={`theory-${index}`} className="border border-border rounded-lg">
                  <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground mb-3 whitespace-pre-line">
                      {section.content}
                    </p>
                    {section.keyPoints && (
                      <div className="space-y-1">
                        <h4 className="text-xs font-medium text-foreground">Points cles:</h4>
                        <ul className="space-y-1">
                          {section.keyPoints.map((point, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="hints" className="p-4 space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Indices</h3>
              <Button variant="outline" size="sm" onClick={nextHint}>
                <Lightbulb className="w-3 h-3 mr-1" />
                Indice suivant ({currentHint + 1}/{exercise.hints.length})
              </Button>
            </div>

            {showHints && (
              <div className="space-y-2">
                {exercise.hints.slice(0, currentHint + 1).map((hint, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-warning/10 border border-warning/30 rounded-lg text-sm"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                      <span className="text-warning-foreground">{hint}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!showHints && (
              <p className="text-sm text-muted-foreground">
                Cliquez sur "Indice suivant" pour reveler un indice. Essayez d'abord sans aide!
              </p>
            )}
          </TabsContent>
        </div>
      </Tabs>

      <div className="grid grid-cols-2 gap-2 p-4 border-t border-border">
        <Button onClick={handleSimulatePing} variant="outline" size="sm">
          <Play className="w-3 h-3 mr-1" />
          Simuler Ping
        </Button>
        <Button onClick={handleDHCPTest} variant="outline" size="sm">
          <RotateCcw className="w-3 h-3 mr-1" />
          Test DHCP
        </Button>
      </div>

      {/* Success message with next exercise button */}
      {showSuccessMessage && validationResults?.passed && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 space-y-2 mx-4 mb-2">
          <div className="flex items-center gap-2 text-green-400">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">Exercice valide!</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Score: {validationResults.score}/{validationResults.maxScore} points
          </p>
          {nextExercise && (
            <Button
              onClick={handleNextExercise}
              className="w-full bg-green-600 hover:bg-green-700 text-white justify-between"
              size="sm"
            >
              <span className="truncate">Exercice suivant: {nextExercise.title}</span>
              <ChevronRight className="w-4 h-4 ml-1 flex-shrink-0" />
            </Button>
          )}
          {!nextExercise && (
            <div className="text-center py-2">
              <p className="text-sm text-green-400 font-medium">
                Felicitations! Vous avez termine tous les exercices!
              </p>
            </div>
          )}
        </div>
      )}

      <div className="px-4 pb-4 space-y-2">
        <Button onClick={handleValidate} className="w-full" size="sm">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Valider l'exercice
        </Button>
        <Button
          onClick={toggleSolution}
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
        >
          {showSolution ? (
            <>
              <EyeOff className="w-3 h-3 mr-1" />
              Masquer la solution
            </>
          ) : (
            <>
              <Eye className="w-3 h-3 mr-1" />
              Voir la solution
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
