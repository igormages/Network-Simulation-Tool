'use client';

import { useRef } from "react"

import { useEffect } from 'react';
import type { Exercise } from '@/lib/exercise-types';
import { useNetwork } from '@/lib/network-context';
import { useExercise } from '@/lib/exercise-context';
import { DevicePalette } from '@/components/network/device-palette';
import { NetworkCanvas } from '@/components/network/network-canvas';
import { ConfigPanel } from '@/components/network/config-panel';
import { ConsolePanel } from '@/components/network/console-panel';
import { Leaderboard } from '@/components/network/leaderboard';
import { TargetTopology } from './target-topology';
import { ExercisePanel } from './exercise-panel';
import { PacketAnimationLayer } from './packet-animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Network, Play, RotateCcw, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

interface ExerciseWorkspaceProps {
  exercise: Exercise;
  onBack: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}

export function ExerciseWorkspace({ exercise, onBack, onSelectExercise }: ExerciseWorkspaceProps) {
  const { topology, selectedDevice, simulatePing, addConsoleLog, loadTopology, saveTopology } = useNetwork();
  const { setCurrentExercise, simulatePacketFlow, clearAnimations, showSolution } = useExercise();
  const { user } = useAuth();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize current exercise in context
  useEffect(() => {
    setCurrentExercise(exercise);
    return () => {
      setCurrentExercise(null);
    };
  }, [exercise, setCurrentExercise]);

  // Load saved topology for this exercise
  useEffect(() => {
    const loadSavedTopology = async () => {
      if (user?.id) {
        await loadTopology(user.id, exercise.id);
      }
    };
    loadSavedTopology();
  }, [exercise.id, loadTopology, user?.id]);

  // Auto-save topology changes with debounce
  useEffect(() => {
    if (!user?.id) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(() => {
      if (topology.devices.length > 0 || topology.cables.length > 0) {
        saveTopology(user.id, exercise.id);
      }
    }, 2000); // Save 2 seconds after the last change

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [topology, exercise.id, saveTopology, user?.id]);

  const handleSimulatePackets = () => {
    clearAnimations();
    const pcs = topology.devices.filter(d => d.type === 'pc');
    if (pcs.length >= 2) {
      addConsoleLog('--- Simulation du parcours des paquets ---');
      simulatePacketFlow(topology, pcs[0].id, pcs[1].id);
    } else {
      addConsoleLog('Erreur: Il faut au moins 2 PC pour la simulation');
    }
  };

  return (
    <div className="h-screen flex flex-col ">
      {/* Header */}
      <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">NetSim</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-sm text-muted-foreground">{exercise.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSimulatePackets}>
            <Play className="w-3 h-3 mr-1" />
            Simuler Paquets
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAnimations}>
            <RotateCcw className="w-3 h-3 mr-1" />
            Effacer
          </Button>
          <Link href="/">
            <Button variant="ghost" size="sm">Mode Libre</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex  min-h-0">
        {/* Left Sidebar - Device Palette + Instructions + Leaderboard */}
        <aside className="w-56 border-r border-border flex flex-col  bg-card">
          <div className="p-4 space-y-6 overflow-y-auto flex-1">
            {/* Device Palette */}
            <DevicePalette />

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
                    <p className="text-xs font-medium text-foreground">Glissez un équipement</p>
                    <p className="text-[11px] text-muted-foreground">Déposez-le sur le canvas</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                      2
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Cliquez pour configurer</p>
                    <p className="text-[11px] text-muted-foreground">Définissez les paramètres</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                      3
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Double-cliquez sur l'interface</p>
                    <p className="text-[11px] text-muted-foreground">Pour connecter les équipements</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Leaderboard />
          </div>
        </aside>

        {/* Center - Split View */}
        <div className="flex-1 flex  min-h-0">
          {/* Target Topology (Left) */}
          <div className="w-1/2 border-r border-border flex flex-col ">
            {showSolution ? (
              <SolutionView exercise={exercise} />
            ) : (
              <TargetTopology exercise={exercise} />
            )}
          </div>

          {/* User Workspace (Right) */}
          <div className="w-1/2 flex flex-col relative ">
            <NetworkCanvas />
            <PacketAnimationLayer />
          </div>
        </div>

        {/* Right Sidebar - Exercise Panel & Config */}
        <aside className="w-80 border-l border-border flex flex-col ">
          <div className="flex-1 overflow-y-auto">
            {selectedDevice ? (
              <ConfigPanel />
            ) : (
              <ExercisePanel exercise={exercise} onBack={onBack} onNextExercise={onSelectExercise} />
            )}
          </div>
        </aside>
      </div>

      {/* Console */}
      <ConsolePanel />
    </div>
  );
}

function SolutionView({ exercise }: { exercise: Exercise }) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b border-border bg-primary/10">
        <h3 className="text-sm font-semibold text-primary">Solution</h3>
        <p className="text-xs text-muted-foreground">Configuration attendue</p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Equipements requis:</h4>
          {exercise.targetTopology.devices.map((device) => (
            <div key={device.id} className="p-3 bg-card border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{device.name}</span>
                <span className="text-xs text-muted-foreground">{device.type}</span>
              </div>
              {device.requiredConfig && (
                <div className="mt-2 text-xs space-y-1">
                  {device.requiredConfig.ipAddress && (
                    <p className="text-muted-foreground">
                      IP: <span className="text-primary font-mono">{device.requiredConfig.ipAddress}</span>
                    </p>
                  )}
                  {device.requiredConfig.subnetMask && (
                    <p className="text-muted-foreground">
                      Masque: <span className="text-primary font-mono">{device.requiredConfig.subnetMask}</span>
                    </p>
                  )}
                  {device.requiredConfig.gateway && (
                    <p className="text-muted-foreground">
                      Passerelle: <span className="text-primary font-mono">{device.requiredConfig.gateway}</span>
                    </p>
                  )}
                  {device.requiredConfig.dhcpEnabled && (
                    <p className="text-muted-foreground">
                      DHCP: <span className="text-success">Active</span>
                    </p>
                  )}
                  {device.requiredConfig.dhcpPoolStart && (
                    <p className="text-muted-foreground">
                      Pool DHCP: <span className="text-primary font-mono">
                        {device.requiredConfig.dhcpPoolStart} - {device.requiredConfig.dhcpPoolEnd}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Connexions:</h4>
          {exercise.targetTopology.cables.map((cable, index) => {
            const fromDevice = exercise.targetTopology.devices.find(d => d.id === cable.fromDeviceId);
            const toDevice = exercise.targetTopology.devices.find(d => d.id === cable.toDeviceId);
            return (
              <div key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="font-medium text-foreground">{fromDevice?.name}</span>
                <span className="text-primary">---</span>
                <span className="font-medium text-foreground">{toDevice?.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
