'use client';

import { useRef, useEffect, useState } from 'react';
import { useNetwork } from '@/lib/network-context';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

const CONSOLE_COLLAPSED_KEY = 'netsim-console-collapsed';

export function ConsolePanel() {
  const { consoleOutput, clearConsole } = useNetwork();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(CONSOLE_COLLAPSED_KEY);
    setIsCollapsed(saved ? JSON.parse(saved) : false);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (isCollapsed !== null) {
      localStorage.setItem(CONSOLE_COLLAPSED_KEY, JSON.stringify(isCollapsed));
    }
  }, [isCollapsed]);

  useEffect(() => {
    if (scrollRef.current && !isCollapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [consoleOutput, isCollapsed]);

  if (isCollapsed === null) return null;

  return (
    <div className={`border-t border-border bg-card flex flex-col transition-all duration-200 ${isCollapsed ? 'h-10' : 'h-48'}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/30">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          {isCollapsed ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <h3 className="text-xs font-semibold text-foreground">
            Console
            <span className="ml-2 text-muted-foreground">
              ({consoleOutput.length} ligne{consoleOutput.length > 1 ? 's' : ''})
            </span>
          </h3>
        </button>
        {!isCollapsed && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={clearConsole}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Effacer
          </Button>
        )}
      </div>
      {!isCollapsed && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-0.5 bg-canvas"
        >
          {consoleOutput.map((line, idx) => (
            <div
              key={idx}
              className={
                line.includes('Erreur') || line.includes('Impossible')
                  ? 'text-destructive'
                  : line.includes('Reponse') || line.includes('resolu') || line.includes('ACK')
                    ? 'text-success'
                    : line.includes('DISCOVER') || line.includes('OFFER') || line.includes('REQUEST')
                      ? 'text-warning'
                      : 'text-muted-foreground'
              }
            >
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
