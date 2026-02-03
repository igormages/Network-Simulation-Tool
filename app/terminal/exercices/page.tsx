'use client';

import { SheetTitle } from "@/components/ui/sheet"

import { SheetHeader } from "@/components/ui/sheet"

import { SheetContent } from "@/components/ui/sheet"

import { Sheet } from "@/components/ui/sheet"

import React from "react"

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { terminalExercises, type TerminalExercise, type TaskResult } from '@/lib/terminal-exercises';
import { useAuth } from '@/lib/auth-context';
import { useTerminalProgress } from '@/hooks/use-terminal-progress';
import { Leaderboard } from '@/components/network/leaderboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Terminal,
  CheckCircle2,
  XCircle,
  Lock,
  ChevronRight,
  Trophy,
  Star,
  Lightbulb,
  BookOpen,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExerciseProgress } from '@/hooks/use-exercise-progress'; // Import useExerciseProgress

const difficultyColors = {
  debutant: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediaire: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  avance: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const categoryLabels = {
  diagnostic: 'Diagnostic',
  configuration: 'Configuration',
  analyse: 'Analyse',
  depannage: 'Depannage',
};

// Terminal simulation logic (same as network-terminal)
function simulateCommand(command: string): string {
  const cmd = command.trim().toLowerCase();
  const parts = cmd.split(/\s+/);
  const baseCmd = parts[0];

  // Basic command simulations
  const responses: Record<string, string> = {
    'ipconfig': `
Configuration IP Windows

Carte Ethernet Ethernet0 :
   Suffixe DNS propre a la connexion. . . : local
   Adresse IPv4. . . . . . . . . . . . . .: 192.168.1.100
   Masque de sous-reseau. . . . . . . . . : 255.255.255.0
   Passerelle par defaut. . . . . . . . . : 192.168.1.1`,
    'ipconfig /all': `
Configuration IP Windows

   Nom de l'hote . . . . . . . . . . . . . : PC-USER
   Suffixe DNS principal. . . . . . . . . : 
   Type de noeud. . . . . . . . . . . . .  : Hybride
   Routage IP active. . . . . . . . . . . : Non
   Proxy WINS active. . . . . . . . . . . : Non

Carte Ethernet Ethernet0 :
   Suffixe DNS propre a la connexion. . . : local
   Description. . . . . . . . . . . . . . : Intel(R) Ethernet Connection
   Adresse physique . . . . . . . . . . . : 00-1A-2B-3C-4D-5E
   DHCP active. . . . . . . . . . . . . . : Oui
   Configuration automatique activee. . . : Oui
   Adresse IPv4. . . . . . . . . . . . . .: 192.168.1.100
   Masque de sous-reseau. . . . . . . . . : 255.255.255.0
   Passerelle par defaut. . . . . . . . . : 192.168.1.1
   Serveur DHCP . . . . . . . . . . . . . : 192.168.1.1
   Serveurs DNS. . . . . . . . . . . . .  : 8.8.8.8
                                            8.8.4.4`,
    'hostname': 'PC-USER',
    'whoami': 'user',
    'pwd': '/home/user',
  };

  // Check for exact matches first
  if (responses[cmd]) {
    return responses[cmd];
  }

  // Handle ip commands
  if (baseCmd === 'ip') {
    if (cmd.includes('addr') || cmd.includes(' a')) {
      if (cmd.includes('eth0')) {
        return `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    link/ether 00:1a:2b:3c:4d:5e brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0
       valid_lft forever preferred_lft forever`;
      }
      return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    link/ether 00:1a:2b:3c:4d:5e brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0`;
    }
    if (cmd.includes('route') || cmd === 'ip r') {
      return `default via 192.168.1.1 dev eth0 proto dhcp metric 100
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100 metric 100`;
    }
    if (cmd.includes('link') || cmd === 'ip l') {
      if (cmd.includes('eth0')) {
        return `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    link/ether 00:1a:2b:3c:4d:5e brd ff:ff:ff:ff:ff:ff`;
      }
      return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    link/ether 00:1a:2b:3c:4d:5e brd ff:ff:ff:ff:ff:ff`;
    }
    if (cmd.includes('neigh') || cmd.includes('neighbor')) {
      return `192.168.1.1 dev eth0 lladdr aa:bb:cc:dd:ee:ff REACHABLE
192.168.1.50 dev eth0 lladdr 11:22:33:44:55:66 STALE`;
    }
  }

  // Handle ifconfig
  if (baseCmd === 'ifconfig') {
    if (parts[1] === 'eth0') {
      return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        ether 00:1a:2b:3c:4d:5e  txqueuelen 1000  (Ethernet)`;
    }
    return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        ether 00:1a:2b:3c:4d:5e  txqueuelen 1000  (Ethernet)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        loop  txqueuelen 1000  (Local Loopback)`;
  }

  // Handle ping
  if (baseCmd === 'ping') {
    const target = parts.find(p => !p.startsWith('-') && p !== 'ping') || '127.0.0.1';
    return `
Envoi d'une requete 'Ping' sur ${target} avec 32 octets de donnees :
Reponse de ${target.includes('.') ? target : '142.250.185.78'} : octets=32 temps=15 ms TTL=117
Reponse de ${target.includes('.') ? target : '142.250.185.78'} : octets=32 temps=14 ms TTL=117
Reponse de ${target.includes('.') ? target : '142.250.185.78'} : octets=32 temps=13 ms TTL=117
Reponse de ${target.includes('.') ? target : '142.250.185.78'} : octets=32 temps=14 ms TTL=117

Statistiques Ping pour ${target.includes('.') ? target : '142.250.185.78'}:
    Paquets : envoyes = 4, recus = 4, perdus = 0 (perte 0%),
Duree approximative des boucles en millisecondes :
    Minimum = 13ms, Maximum = 15ms, Moyenne = 14ms`;
  }

  // Handle tracert/traceroute
  if (baseCmd === 'tracert' || baseCmd === 'traceroute') {
    const target = parts.find(p => !p.startsWith('-') && p !== baseCmd) || 'google.com';
    return `
Determination de l'itineraire vers ${target} [142.250.185.78]
avec un maximum de 30 sauts :

  1     1 ms     1 ms     1 ms  192.168.1.1
  2    10 ms     9 ms    10 ms  10.0.0.1
  3    15 ms    14 ms    15 ms  72.14.215.85
  4    20 ms    19 ms    20 ms  142.250.185.78

Itineraire determine.`;
  }

  // Handle nslookup
  if (baseCmd === 'nslookup') {
    const target = parts[1] || 'google.com';
    if (target.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return `Serveur :   dns.google
Address:  8.8.8.8

Nom :    dns.google
Address:  ${target}`;
    }
    return `Serveur :   dns.google
Address:  8.8.8.8

Reponse ne faisant pas autorite :
Nom :    ${target}
Addresses:  142.250.185.78
          2a00:1450:4007:80e::200e`;
  }

  // Handle dig
  if (baseCmd === 'dig') {
    const target = parts.find(p => !p.startsWith('-') && !p.startsWith('@') && p !== 'dig' && !['mx', 'a', 'aaaa', 'ns'].includes(p.toLowerCase())) || 'google.com';
    if (cmd.includes('-x')) {
      return `;; ANSWER SECTION:
8.8.8.8.in-addr.arpa.   21599   IN      PTR     dns.google.`;
    }
    if (cmd.includes('mx')) {
      return `;; ANSWER SECTION:
${target}.          300     IN      MX      10 alt1.gmail-smtp-in.l.google.com.
${target}.          300     IN      MX      5 gmail-smtp-in.l.google.com.`;
    }
    return `;; ANSWER SECTION:
${target}.          300     IN      A       142.250.185.78`;
  }

  // Handle netstat
  if (baseCmd === 'netstat') {
    if (cmd.includes('-s')) {
      return `Statistiques IPv4

  Paquets recus                     = 1547832
  Erreurs d'en-tete recues          = 0
  Erreurs d'adresse recues          = 0
  Datagrammes transferes             = 0
  Paquets recus inconnus            = 0

Statistiques TCP pour IPv4

  Ouvertures actives                = 1523
  Ouvertures passives               = 42
  Echecs de tentatives de connexion = 12
  Connexions reinitialises          = 89`;
    }
    if (cmd.includes('-l') || cmd.includes('listening')) {
      return `Connexions actives

  Proto  Adresse locale         Adresse distante       Etat
  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING
  TCP    0.0.0.0:443            0.0.0.0:0              LISTENING
  TCP    0.0.0.0:22             0.0.0.0:0              LISTENING`;
    }
    return `Connexions actives

  Proto  Adresse locale         Adresse distante       Etat
  TCP    192.168.1.100:52341    142.250.185.78:443     ESTABLISHED
  TCP    192.168.1.100:52342    151.101.1.69:443       ESTABLISHED
  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING
  TCP    0.0.0.0:443            0.0.0.0:0              LISTENING`;
  }

  // Handle ss
  if (baseCmd === 'ss') {
    if (cmd.includes('-s')) {
      return `Total: 285
TCP:   12 (estab 5, closed 0, orphaned 0, timewait 0)

Transport Total     IP        IPv6
RAW       0         0         0
UDP       8         6         2
TCP       12        10        2
INET      20        16        4`;
    }
    if (cmd.includes('-l')) {
      return `Netid  State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port
tcp    LISTEN  0       128     0.0.0.0:22            0.0.0.0:*
tcp    LISTEN  0       128     0.0.0.0:80            0.0.0.0:*
tcp    LISTEN  0       128     0.0.0.0:443           0.0.0.0:*`;
    }
    return `Netid  State      Recv-Q  Send-Q  Local Address:Port       Peer Address:Port
tcp    ESTAB      0       0       192.168.1.100:52341     142.250.185.78:443
tcp    ESTAB      0       0       192.168.1.100:52342     151.101.1.69:443
tcp    LISTEN     0       128     0.0.0.0:22              0.0.0.0:*`;
  }

  // Handle arp
  if (baseCmd === 'arp') {
    return `Interface : 192.168.1.100 --- 0x2
  Adresse Internet      Adresse physique      Type
  192.168.1.1           aa-bb-cc-dd-ee-ff     dynamique
  192.168.1.50          11-22-33-44-55-66     dynamique
  192.168.1.255         ff-ff-ff-ff-ff-ff     statique`;
  }

  // Handle route
  if (baseCmd === 'route') {
    return `===========================================================================
Liste d'Interfaces
  2...00 1a 2b 3c 4d 5e ......Intel(R) Ethernet Connection
===========================================================================

IPv4 Table de routage
===========================================================================
Itineraires actifs :
Destination reseau    Masque reseau   Adr. passerelle   Adr. interface Metrique
          0.0.0.0          0.0.0.0      192.168.1.1    192.168.1.100     25
      192.168.1.0    255.255.255.0         On-link     192.168.1.100    281`;
  }

  // Handle cat
  if (baseCmd === 'cat') {
    if (cmd.includes('/etc/hosts')) {
      return `127.0.0.1       localhost
127.0.1.1       pc-user
192.168.1.10    server.local
192.168.1.20    printer.local`;
    }
    if (cmd.includes('/etc/resolv.conf')) {
      return `# Generated by NetworkManager
nameserver 8.8.8.8
nameserver 8.8.4.4`;
    }
    return `cat: fichier non trouve`;
  }

  // Handle ls
  if (baseCmd === 'ls') {
    if (cmd.includes('-l')) {
      return `total 32
drwxr-xr-x 2 user user 4096 jan 15 10:00 Documents
drwxr-xr-x 2 user user 4096 jan 15 10:00 Downloads
-rw-r--r-- 1 user user  220 jan 15 09:00 .bashrc
-rw-r--r-- 1 user user  807 jan 15 09:00 .profile`;
    }
    return `Documents  Downloads  .bashrc  .profile`;
  }

  // Handle ps
  if (baseCmd === 'ps') {
    return `  PID TTY          TIME CMD
    1 ?        00:00:02 systemd
  523 ?        00:00:00 sshd
  891 pts/0    00:00:00 bash
  945 pts/0    00:00:00 ps`;
  }

  // Handle help
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
  
Aide:
  help                  - Affiche cette aide
  clear                 - Efface l'écran`;
  }

  // Handle clear
  if (baseCmd === 'clear' || baseCmd === 'cls') {
    return '';
  }

  return `Commande '${baseCmd}' executee avec succes.`;
}

// Exercise Selector Component
function ExerciseSelector({ onSelect }: { onSelect: (ex: TerminalExercise) => void }) {
  const { updateExerciseScore, getExerciseProgress, isExerciseUnlocked, getOverallStats, isLoaded } = useTerminalProgress();
  const stats = getOverallStats();

  // Filter for terminal exercises only
  const terminalStats = {
    completedCount: terminalExercises.filter(ex => {
      const progress = getExerciseProgress(ex.id);
      return progress?.completed;
    }).length,
    totalExercises: terminalExercises.length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border bg-card flex items-center px-4">
        <Link href="/terminal" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Retour au terminal
        </Link>
      </header>

      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Terminal className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Exercices Terminal</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pratiquez les commandes reseau dans un terminal simule. Chaque exercice vous guide
            a travers des taches specifiques avec validation automatique.
          </p>

          <div className="max-w-md mx-auto bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">Progression Terminal</span>
              </div>
              <span className="text-muted-foreground">
                {terminalStats.completedCount}/{terminalStats.totalExercises} exercices
              </span>
            </div>
            <Progress value={(terminalStats.completedCount / terminalStats.totalExercises) * 100} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {terminalExercises.map((exercise) => {
            const progress = getExerciseProgress(exercise.id);
            const unlocked = exercise.number === 1 || 
              terminalExercises.some(ex => 
                ex.number === exercise.number - 1 && 
                getExerciseProgress(ex.id)?.completed
              );
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
                onClick={() => unlocked && onSelect(exercise)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
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
                      <CardTitle className={cn(
                        'text-lg transition-colors',
                        unlocked ? 'text-foreground group-hover:text-primary' : 'text-muted-foreground'
                      )}>
                        {exercise.title}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-10">
                    <Badge variant="outline" className={difficultyColors[exercise.difficulty]}>
                      {exercise.difficulty}
                    </Badge>
                    <Badge variant="secondary">
                      {categoryLabels[exercise.category]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-muted-foreground line-clamp-2">
                    {exercise.description}
                  </CardDescription>

                  {progress && progress.attempts > 0 && (
                    <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Meilleur score</span>
                        <div className="flex items-center gap-1">
                          <Star className={cn('w-4 h-4', scorePercentage >= 70 ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                          <span className={cn('font-bold', scorePercentage >= 70 ? 'text-green-400' : 'text-foreground')}>
                            {progress.bestScore}/{progress.maxScore}
                          </span>
                        </div>
                      </div>
                      <Progress value={scorePercentage} className={cn('h-1.5', scorePercentage >= 70 && '[&>div]:bg-green-500')} />
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{exercise.tasks.length} taches</span>
                    <span>{exercise.estimatedTime} min</span>
                    <Badge variant="outline" className="text-xs">
                      {exercise.os === 'both' ? 'Win/Linux' : exercise.os}
                    </Badge>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!unlocked}
                    className={cn(
                      'w-full justify-between',
                      unlocked ? 'text-primary hover:text-primary hover:bg-primary/10' : 'text-muted-foreground'
                    )}
                  >
                    {!unlocked ? (
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Validez l'exercice {exercise.number - 1}
                      </span>
                    ) : progress?.completed ? (
                      <>Refaire l'exercice<ChevronRight className="w-4 h-4" /></>
                    ) : (
                      <>Commencer<ChevronRight className="w-4 h-4" /></>
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

// Exercise Workspace Component
function ExerciseWorkspace({ 
  exercise, 
  onBack,
  onComplete 
}: { 
  exercise: TerminalExercise; 
  onBack: () => void;
  onComplete: (score: number) => void;
}) {
  const [commandHistory, setCommandHistory] = useState<{ command: string; output: string }[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [taskResults, setTaskResults] = useState<TaskResult[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentTask = exercise.tasks[currentTaskIndex];
  const completedTasks = taskResults.filter(r => r.completed).length;
  const totalScore = taskResults.reduce((sum, r) => sum + r.points, 0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const handleCommand = useCallback((cmd: string) => {
    if (!cmd.trim()) return;

    const output = simulateCommand(cmd);
    setCommandHistory(prev => [...prev, { command: cmd, output }]);
    setCurrentCommand('');
    setHistoryIndex(-1);

    // Check if command matches current task
    if (currentTask) {
      const normalizedCmd = cmd.trim().toLowerCase();
      const isCorrect = currentTask.expectedCommands.some(expected => 
        normalizedCmd === expected.toLowerCase() ||
        normalizedCmd.startsWith(expected.toLowerCase())
      );

      if (isCorrect) {
        // Check if task is not already completed
        const alreadyCompleted = taskResults.some(r => r.taskId === currentTask.id && r.completed);
        
        if (!alreadyCompleted) {
          const newResult: TaskResult = {
            taskId: currentTask.id,
            completed: true,
            command: cmd,
            points: currentTask.points,
          };
          setTaskResults(prev => [...prev, newResult]);
          
          // Add success message to terminal output
          setCommandHistory(prev => [...prev, { 
            command: '', 
            output: `\n✓ Tâche ${currentTaskIndex + 1} complétée ! +${currentTask.points} points\n` 
          }]);
          
          if (currentTaskIndex < exercise.tasks.length - 1) {
            setCurrentTaskIndex(prev => prev + 1);
            setShowHint(false);
          } else {
            // Exercise completed
            const finalScore = totalScore + currentTask.points;
            setIsCompleted(true);
            onComplete(finalScore);
          }
        }
      }
    }
  }, [currentTask, currentTaskIndex, exercise.tasks.length, totalScore, onComplete, taskResults]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(currentCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
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
  };

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

      <div className="flex-1 flex">
        {/* Left panel - Tasks and Theory at top, Instructions and Leaderboard at bottom */}
        <div className="w-80 border-r border-border flex flex-col shrink-0">
          {/* Tabs for Tasks and Theory - NOW AT TOP */}
          <Tabs defaultValue="tasks" className="flex-1 flex flex-col border-b border-border">
            <TabsList className="w-full rounded-none border-b border-border">
              <TabsTrigger value="tasks" className="flex-1">Taches</TabsTrigger>
              <TabsTrigger value="theory" className="flex-1">Theorie</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks" className="flex-1 m-0">
              <ScrollArea className="h-full w-full">
                <div className="p-4 space-y-4 w-full">
                  {exercise.tasks.map((task, index) => {
                    const result = taskResults.find(r => r.taskId === task.id);
                    const isCurrent = index === currentTaskIndex;
                    const isPast = index < currentTaskIndex;
                    
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
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="theory" className="flex-1 m-0">
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
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              {point}
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

          {/* Instructions and Leaderboard - NOW AT BOTTOM */}
          <ScrollArea className="flex-1 w-full border-t border-border">
            <div className="p-4 space-y-6 w-full">
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

            </div>
          </ScrollArea>
        </div>

        {/* Terminal */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a] min-w-0">
          <div className="h-8 bg-[#1a1a1a] border-b border-[#333] flex items-center px-3 gap-2 shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-gray-400">Terminal - Exercice {exercise.number}</span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col-reverse p-4" ref={scrollRef}>
            <div className="font-mono text-sm space-y-1">
              <div className="text-green-400">
                NetSim Terminal v1.0 - Exercice: {exercise.title}
              </div>
              <div className="text-gray-500">Tapez vos commandes ci-dessous. Tapez 'help' pour l'aide.</div>
              <div className="text-gray-500 mb-4">---</div>

              {commandHistory.map((entry, index) => (
                <div key={index} className="mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">user@netsim</span>
                    <span className="text-gray-500">:</span>
                    <span className="text-blue-400">~</span>
                    <span className="text-gray-500">$</span>
                    <span className="text-white">{entry.command}</span>
                  </div>
                  <pre className="text-gray-300 whitespace-pre-wrap ml-0 mt-1">{entry.output}</pre>
                </div>
              ))}

              {isCompleted && (
                <div className="mt-6 p-4 border border-green-500/50 rounded bg-green-500/10">
                  <div className="text-green-400 font-semibold mb-2">Exercice valide!</div>
                  <div className="text-green-400 text-sm">
                    Score final: {totalScore}/{exercise.maxScore} points
                  </div>
                  <div className="text-gray-400 text-xs mt-2">Vous pouvez retourner a la liste des exercices.</div>
                </div>
              )}
            </div>
          </div>

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

      {/* Leaderboard Sheet */}
      <Sheet open={showLeaderboard} onOpenChange={setShowLeaderboard}>
        <SheetContent side="right" className="w-96">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Palmares
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <Leaderboard />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Main Page Component
export default function TerminalExercisesPage() {
  const [selectedExercise, setSelectedExercise] = useState<TerminalExercise | null>(null);
  const { user } = useAuth();
  const { updateExerciseScore } = useTerminalProgress();

  const handleComplete = (score: number) => {
    if (selectedExercise && user) {
      updateExerciseScore(selectedExercise.id, score, selectedExercise.maxScore);
    }
  };

  if (!selectedExercise) {
    return <ExerciseSelector onSelect={setSelectedExercise} />;
  }

  return (
    <ExerciseWorkspace
      exercise={selectedExercise}
      onBack={() => setSelectedExercise(null)}
      onComplete={handleComplete}
    />
  );
}
