'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  BookOpen,
  GraduationCap,
  Calculator,
  Terminal,
  User,
  LogOut,
  Users,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  onOpenInfo: () => void;
  onOpenCalculator: () => void;
}

export function Header({ onOpenInfo, onOpenCalculator }: HeaderProps) {
  const { user, isTeacher, logout } = useAuth();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary"
          >
            <circle cx="16" cy="16" r="4" fill="currentColor" />
            <circle cx="6" cy="6" r="3" fill="currentColor" opacity="0.6" />
            <circle cx="26" cy="6" r="3" fill="currentColor" opacity="0.6" />
            <circle cx="6" cy="26" r="3" fill="currentColor" opacity="0.6" />
            <circle cx="26" cy="26" r="3" fill="currentColor" opacity="0.6" />
            <line x1="16" y1="12" x2="8" y2="8" stroke="currentColor" strokeWidth="2" opacity="0.4" />
            <line x1="16" y1="12" x2="24" y2="8" stroke="currentColor" strokeWidth="2" opacity="0.4" />
            <line x1="16" y1="20" x2="8" y2="24" stroke="currentColor" strokeWidth="2" opacity="0.4" />
            <line x1="16" y1="20" x2="24" y2="24" stroke="currentColor" strokeWidth="2" opacity="0.4" />
          </svg>
          <div>
            <h1 className="text-base font-semibold text-foreground">NetSim</h1>
            <p className="text-xs text-muted-foreground">Simulateur Reseau</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/theorie">
          <Button variant="outline" size="sm">
            <BookOpen className="w-4 h-4 mr-1" />
            Cours
          </Button>
        </Link>
        <Link href="/exercices-all">
          <Button variant="default" size="sm">
            <GraduationCap className="w-4 h-4 mr-1" />
            Exercices
          </Button>
        </Link>
        <Link href="/terminal">
          <Button variant="outline" size="sm">
            <Terminal className="w-4 h-4 mr-1" />
            Terminal
          </Button>
        </Link>
        <Button variant="outline" size="sm" onClick={onOpenCalculator}>
          <Calculator className="w-4 h-4 mr-1" />
          Calculateur IP
        </Button>

        {/* User menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-2">
                <User className="w-4 h-4 mr-1" />
                <span className="max-w-[100px] truncate">{user.name}</span>
                {isTeacher && (
                  <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary text-[10px] px-1">
                    Prof
                  </Badge>
                )}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              {isTeacher && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <Users className="w-4 h-4 mr-2" />
                      Tableau de bord
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Deconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
