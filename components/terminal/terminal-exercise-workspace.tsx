'use client';

import React from "react"

import { useState, useRef, useEffect, useCallback } from 'react';
import { Leaderboard } from '@/components/network/leaderboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  CheckCircle2,
  Trophy,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TerminalExercise, TaskResult } from '@/lib/terminal-exercises';

interface TerminalExerciseWorkspaceProps {
  exercise: TerminalExercise;
  onBack: () => void;
  onNextExercise?: (exercise: TerminalExercise) => void;
}

export function TerminalExerciseWorkspace({
  exercise,
  onBack,
  onNextExercise,
}: TerminalExerciseWorkspaceProps) {
  const [commandHistory, setCommandHistory] = useState<Array<{ command: string; output: string }>>([
    { command: '', output: 'NetSim Terminal v1.0 - Exercice: ' + exercise.title + '\nTapez vos commandes ci-dessous. Tapez \'help\' pour l\'aide.\n---' }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [completedTasks, setCompletedTasks] = useState<{ [key: string]: TaskResult }>({});
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalScore = Object.values(completedTasks).reduce((sum, r) => sum + (r.points || 0), 0);
  const isCompleted = exercise.tasks.every(t => completedTasks[t.id]?.completed);

  // Auto-scroll to bottom when command history changes
  useEffect(() => {
    if (scrollRef.current) {
      // Scroll to the bottom
      const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        setTimeout(() => {
          scrollArea.scrollTop = scrollArea.scrollHeight;
        }, 0);
      }
    }
  }, [commandHistory]);

  const simulateCommand = useCallback((input: string): string => {
    const baseCmd = input.toLowerCase().split(' ')[0];
    const args = input.substring(baseCmd.length).trim();

    if (baseCmd === 'help' || baseCmd === 'h') {
      return `Commandes disponibles :
    
Diagnostic réseau:
  ipconfig              - Affiche la configuration IP
  ipconfig /all         - Configuration IP détaillée
  ip addr               - Affiche les adresses IP (Linux)
  ifconfig              - Configuration des interfaces
  ping <host>           - Envoie des pings
  tracert <host>        - Trace la route vers un host
  nslookup <host>       - Recherche DNS
  dig <host>            - Interrogation DNS avancée
  
État du réseau:
  netstat               - Affiche les connexions réseau
  netstat -an           - Connexions avec adresses numériques
  netstat -l            - Connexions en écoute
  ss                    - Affiche les sockets (Linux)
  arp                   - Table ARP
  route                 - Table de routage
  
Système:
  hostname              - Affiche le nom d'hôte
  whoami                - Affiche l'utilisateur courant
  pwd                   - Répertoire courant
  ls                    - Liste les fichiers
  ps                    - Liste les processus
  
Aide:
  help                  - Affiche cette aide
  clear                 - Efface l'écran`;
    }

    if (baseCmd === 'clear' || baseCmd === 'cls') {
      return '';
    }

    // Handle ipconfig
    if (baseCmd === 'ipconfig') {
      if (args.includes('/all')) {
        return `Configuration IP détaillée:

Adaptateur Ethernet:
   Adresse IPv4: 192.168.1.10
   Masque de sous-réseau: 255.255.255.0
   Passerelle par défaut: 192.168.1.1
   Serveur DHCP: 192.168.1.1
   Serveurs DNS: 8.8.8.8, 8.8.4.4
   Adresse MAC: 00:1A:2B:3C:4D:5E
   Serveur DHCP activé: Oui
   Baux d'adresse: 20/01/2024 15:30:00`;
      } else {
        return `Configuration IPv4:

Adaptateur Ethernet:
   Adresse IPv4: 192.168.1.10
   Masque de sous-réseau: 255.255.255.0
   Passerelle par défaut: 192.168.1.1`;
      }
    }

    if (baseCmd === 'ip' && args.includes('addr')) {
      return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.1.10/24 brd 192.168.1.255 scope global eth0`;
    }

    if (baseCmd === 'hostname') {
      return 'computer-001';
    }

    if (baseCmd === 'whoami') {
      return 'student';
    }

    if (baseCmd === 'pwd') {
      return '/home/student';
    }

    if (baseCmd === 'ping') {
      if (!args) return 'Usage: ping <host>';
      return `PING ${args} (8.8.8.8) 56(84) bytes of data.
64 bytes from ${args}: icmp_seq=1 ttl=64 time=23.4 ms
64 bytes from ${args}: icmp_seq=2 ttl=64 time=22.1 ms
64 bytes from ${args}: icmp_seq=3 ttl=64 time=24.2 ms

--- ${args} statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2004ms
rtt min/avg/max/stddev = 22.1/23.2/24.2/0.8 ms`;
    }

    if (baseCmd === 'netstat') {
      if (args.includes('-an')) {
        return `Proto  Local Address        Foreign Address    State
tcp    0.0.0.0:22           0.0.0.0:*         LISTEN
tcp    127.0.0.1:53         0.0.0.0:*         LISTEN
tcp    192.168.1.10:443     192.168.1.20:50123 ESTABLISHED`;
      } else {
        return `Active Internet connections
Proto Recv-Q Send-Q Local Address      Foreign Address    State
tcp       0      0 localhost:domain    *:*                LISTEN
tcp       0      0 *:ssh               *:*                LISTEN`;
      }
    }

    if (baseCmd === 'arp') {
      return `Address       HWtype  HWaddress           Flags Mask  Iface
192.168.1.1   ether   AA:BB:CC:DD:EE:FF   C         eth0
192.168.1.20  ether   00:11:22:33:44:55   C         eth0`;
    }

    if (baseCmd === 'route') {
      return `Destination   Gateway       Genmask        Flags Metric Ref Use Iface
default       192.168.1.1   0.0.0.0        UG    100    0   0 eth0
192.168.1.0   0.0.0.0       255.255.255.0  U     0      0   0 eth0`;
    }

    if (baseCmd === 'nslookup' || baseCmd === 'dig') {
      if (!args) return 'Usage: ' + baseCmd + ' <hostname>';
      return `${baseCmd} ${args}
Server: 8.8.8.8
Address: 8.8.8.8#53

Non-authoritative answer:
Name: ${args}
Address: 142.251.41.14`;
    }

    if (baseCmd === 'ps') {
      return `  PID TTY          TIME CMD
    1 ?        00:00:02 systemd
  523 ?        00:00:00 sshd
  891 pts/0    00:00:00 bash
  945 pts/0    00:00:00 ps`;
    }

    if (baseCmd === 'ls') {
      return `Desktop  Documents  Downloads  Pictures  Videos`;
    }

    // Check if command matches any task
    for (const task of exercise.tasks) {
      if (!completedTasks[task.id]?.completed) {
        const matches = task.expectedCommands.some(cmd => 
          input.toLowerCase().includes(cmd.toLowerCase())
        );
        
        if (matches) {
          setCompletedTasks(prev => ({
            ...prev,
            [task.id]: { completed: true, points: task.points, command: input }
          }));
          
          // Move to next uncompleted task
          for (let i = currentTaskIndex + 1; i < exercise.tasks.length; i++) {
            if (!completedTasks[exercise.tasks[i].id]?.completed) {
              setCurrentTaskIndex(i);
              break;
            }
          }
          
          return task.successMessage || 'Commande exécutée avec succès!';
        }
      }
    }

    return `Commande '${baseCmd}' exécutée avec succès.`;
  }, [exercise.tasks, completedTasks, currentTaskIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentCommand.trim()) {
        const output = simulateCommand(currentCommand);
        
        if (currentCommand.toLowerCase() === 'clear' || currentCommand.toLowerCase() === 'cls') {
          setCommandHistory([{ command: '', output: '' }]);
        } else {
          setCommandHistory(prev => [...prev, { command: currentCommand, output }]);
        }
        
        setCurrentCommand('');
        setHistoryIndex(-1);
        
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, 100);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]?.command || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]?.command || '');
      } else {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    }
  }, [currentCommand, commandHistory, historyIndex, simulateCommand]);

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{exercise.number}</span>
            </div>
            <span className="font-semibold text-foreground">{exercise.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Tache {currentTaskIndex + 1}/{exercise.tasks.length}
          </div>
          <div className="text-sm font-medium">
            Score: <span className="text-primary">{totalScore}/{exercise.maxScore}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Instructions and Tasks */}
        <div className="w-80 border-r border-border flex flex-col shrink-0 overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Instructions */}
              <Card className="bg-secondary/30 border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                        1
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Lisez la tâche</p>
                      <p className="text-[11px] text-muted-foreground">Comprenez ce qui est demandé</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                        2
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Saisissez la commande</p>
                      <p className="text-[11px] text-muted-foreground">Dans le terminal ci-dessous</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                        3
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Validez votre réponse</p>
                      <p className="text-[11px] text-muted-foreground">Accumulez des points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Leaderboard */}
              <Leaderboard />
            </div>
          </ScrollArea>

          {/* Tabs for Tasks and Theory */}
          <Tabs defaultValue="tasks" className="flex-1 flex flex-col border-t border-border overflow-hidden">
            <TabsList className="w-full rounded-none border-b border-border">
              <TabsTrigger value="tasks" className="flex-1">Taches</TabsTrigger>
              <TabsTrigger value="theory" className="flex-1">Theorie</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full w-full">
                <div className="p-4 space-y-4 w-full">
                  {exercise.tasks.map((task, index) => {
                    const result = completedTasks[task.id];
                    const isCurrent = index === currentTaskIndex;
                    
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          'p-3 rounded-lg border transition-colors',
                          result?.completed
                            ? 'bg-green-500/10 border-green-500/30'
                            : isCurrent
                              ? 'bg-primary/10 border-primary/30'
                              : 'bg-muted/30 border-border'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
                            result?.completed
                              ? 'bg-green-500/20 text-green-400'
                              : isCurrent
                                ? 'bg-primary/20 text-primary'
                                : 'bg-muted text-muted-foreground'
                          )}>
                            {result?.completed ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-sm',
                              result?.completed ? 'text-green-400' : isCurrent ? 'text-foreground' : 'text-muted-foreground'
                            )}>
                              {task.instruction}
                            </p>
                            {result?.completed && (
                              <p className="text-xs text-green-400/70 mt-1 font-mono">
                                {result.command}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">{task.points} pts</span>
                              {isCurrent && task.hint && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => setShowHint(!showHint)}
                                >
                                  <Lightbulb className="w-3 h-3 mr-1" />
                                  Indice
                                </Button>
                              )}
                            </div>
                            {isCurrent && showHint && task.hint && (
                              <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400">
                                {task.hint}
                              </div>
                            )}
                            {isCurrent && !result?.completed && (
                              <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-300">
                                <p className="font-semibold mb-1">Commande(s) attendue(s):</p>
                                <code className="font-mono">{task.expectedCommands.join(' ou ')}</code>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isCompleted && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center space-y-2">
                      <Trophy className="w-8 h-8 text-green-400 mx-auto" />
                      <p className="font-semibold text-green-400">Exercice termine!</p>
                      <p className="text-sm text-muted-foreground">
                        Score final: {totalScore}/{exercise.maxScore}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="theory" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full w-full">
                <div className="p-4 space-y-4 w-full">
                  {exercise.theory.map((section, index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        {section.title}
                      </h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {section.content}
                      </p>
                      {section.keyPoints.length > 0 && (
                        <ul className="space-y-1 mt-2">
                          {section.keyPoints.map((point, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex gap-2">
                              <span className="text-primary">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Terminal */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a] min-w-0">
          <div className="h-8 bg-[#1a1a1a] border-b border-[#333] flex items-center px-3 gap-2 shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-gray-400">Terminal - Exercice {exercise.number}</span>
          </div>

          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="font-mono text-sm space-y-1 pr-4">
              <div className="text-green-400">
                NetSim Terminal v1.0 - Exercice: {exercise.title}
              </div>
              <div className="text-gray-500">Tapez vos commandes ci-dessous. Tapez 'help' pour l'aide.</div>
              <div className="text-gray-500 mb-4">---</div>

              {commandHistory.map((entry, index) => (
                <div key={index} className="mb-2">
                  {entry.command && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">user@netsim</span>
                      <span className="text-gray-500">:</span>
                      <span className="text-blue-400">~</span>
                      <span className="text-gray-500">$</span>
                      <span className="text-white">{entry.command}</span>
                    </div>
                  )}
                  {entry.output && (
                    <pre className="text-gray-300 whitespace-pre-wrap ml-0 mt-1">{entry.output}</pre>
                  )}
                </div>
              ))}

              {isCompleted && (
                <div className="mt-6 p-4 border border-green-500/50 rounded bg-green-500/10">
                  <div className="text-green-400 font-semibold mb-2">✓ Exercice validé!</div>
                  <div className="text-green-400 text-sm">
                    Score final: {totalScore}/{exercise.maxScore} points
                  </div>
                  <div className="text-gray-400 text-xs mt-2">Vous pouvez retourner à la liste des exercices.</div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div 
            className={cn(
              "border-t border-[#333] p-4 shrink-0",
              isCompleted && "opacity-50 pointer-events-none"
            )}
            onClick={() => inputRef.current?.focus()}
          >
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="text-green-400">user@netsim</span>
              <span className="text-gray-500">:</span>
              <span className="text-blue-400">~</span>
              <span className="text-gray-500">$</span>
              <input
                ref={inputRef}
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isCompleted}
                className="flex-1 bg-transparent text-white outline-none disabled:opacity-50"
                placeholder={isCompleted ? "Exercice complété" : "Tapez une commande..."}
                autoFocus
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
