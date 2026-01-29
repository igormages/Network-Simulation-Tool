'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NetworkTerminal } from '@/components/terminal/network-terminal';
import { ArrowLeft, Terminal, BookOpen, Lightbulb, GraduationCap } from 'lucide-react';

const commandGroups = [
  {
    title: 'Configuration IP',
    commands: [
      { cmd: 'ipconfig', desc: 'Affiche la config IP (Windows)' },
      { cmd: 'ip addr', desc: 'Affiche la config IP (Linux)' },
      { cmd: 'ifconfig', desc: 'Config IP legacy (Linux)' },
    ],
  },
  {
    title: 'Diagnostic',
    commands: [
      { cmd: 'ping google.com', desc: 'Test de connectivite' },
      { cmd: 'tracert google.com', desc: 'Trace la route (Windows)' },
      { cmd: 'traceroute google.com', desc: 'Trace la route (Linux)' },
    ],
  },
  {
    title: 'Connexions',
    commands: [
      { cmd: 'netstat', desc: 'Connexions actives (Windows)' },
      { cmd: 'ss', desc: 'Sockets actifs (Linux)' },
      { cmd: 'arp -a', desc: 'Table ARP' },
    ],
  },
  {
    title: 'DNS',
    commands: [
      { cmd: 'nslookup google.com', desc: 'Requete DNS (Windows)' },
      { cmd: 'dig google.com', desc: 'Requete DNS (Linux)' },
    ],
  },
  {
    title: 'Routage',
    commands: [
      { cmd: 'route print', desc: 'Table de routage (Windows)' },
      { cmd: 'ip route', desc: 'Table de routage (Linux)' },
    ],
  },
];

export default function TerminalPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Terminal Reseau</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/terminal/exercices">
            <Button variant="default" size="sm">
              <GraduationCap className="w-4 h-4 mr-1" />
              Exercices Terminal
            </Button>
          </Link>
          <Link href="/theorie">
            <Button variant="outline" size="sm">
              <BookOpen className="w-4 h-4 mr-1" />
              Cours
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Terminal */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-primary" />
                  Terminal Interactif
                </CardTitle>
                <CardDescription>
                  Pratiquez les commandes reseau dans un environnement simule. Tapez "help" pour voir
                  les commandes disponibles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NetworkTerminal className="h-[500px]" />
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  Astuces
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>
                  - Utilisez les fleches haut/bas pour naviguer dans l'historique des commandes
                </p>
                <p>- Tapez "clear" pour effacer le terminal</p>
                <p>- Les commandes Windows et Linux sont toutes deux supportees</p>
                <p>- Essayez de ping des adresses comme 192.168.1.1 ou google.com</p>
              </CardContent>
            </Card>
          </div>

          {/* Command Reference */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Reference des commandes</h2>

            {commandGroups.map((group) => (
              <Card key={group.title} className="bg-card border-border">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-primary">{group.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {group.commands.map((cmd) => (
                      <div key={cmd.cmd} className="flex flex-col">
                        <code className="text-xs font-mono text-green-400 bg-secondary/50 px-2 py-1 rounded">
                          {cmd.cmd}
                        </code>
                        <span className="text-xs text-muted-foreground mt-1">{cmd.desc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
