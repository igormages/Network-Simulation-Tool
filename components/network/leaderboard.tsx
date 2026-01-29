'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Medal } from 'lucide-react';

interface LeaderboardEntry {
  id: number;
  name: string;
  email: string;
  total_score: number;
  exercises_completed: number;
  terminal_completed: number;
  last_login: string;
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        if (response.ok) {
          const data = await response.json();
          setEntries(data.slice(0, 3)); // Top 3 only
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className="text-muted-foreground text-sm">Chargement du classement...</div>;
  }

  if (entries.length === 0) {
    return <div className="text-muted-foreground text-sm">Aucun résultat disponible</div>;
  }

  const getMedalIcon = (position: number) => {
    if (position === 0) {
      return <Crown className="w-5 h-5 text-yellow-500" />;
    }
    if (position === 1) {
      return <Medal className="w-5 h-5 text-gray-400" />;
    }
    return <Medal className="w-5 h-5 text-orange-600" />;
  };

  const getPositionBadge = (position: number) => {
    if (position === 0) {
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
    if (position === 1) {
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
    return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="w-5 h-5 text-yellow-500" />
          Palmarès - Top 3
        </CardTitle>
        <CardDescription>Meilleurs élèves par score total</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className={`p-3 rounded-lg border transition-colors ${getPositionBadge(index)}`}
          >
            {/* Position and name */}
            <div className="flex items-center gap-2 mb-2">
              {getMedalIcon(index)}
              <span className="font-semibold text-xs text-foreground">
                #{index + 1} {entry.name}
              </span>
            </div>

            {/* Score info */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Score: </span>
                <span className="font-bold text-foreground">{entry.total_score}</span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground">Exercices: </span>
                <span className="font-bold text-foreground">
                  {entry.exercises_completed + entry.terminal_completed}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
