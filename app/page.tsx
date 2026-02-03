'use client';

import { useState } from 'react';
import { NetworkProvider } from '@/lib/network-context';
import { DevicePalette } from '@/components/network/device-palette';
import { NetworkCanvas } from '@/components/network/network-canvas';
import { ConfigPanel } from '@/components/network/config-panel';
import { ConsolePanel } from '@/components/network/console-panel';
import { Header } from '@/components/network/header';
import { InfoPanel } from '@/components/network/info-panel';
import { SubnetCalculator } from '@/components/network/subnet-calculator';
import { Leaderboard } from '@/components/network/leaderboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { DeviceType } from '@/lib/network-types';
import { Lightbulb, MousePointer2, Cable } from 'lucide-react';

export default function NetworkSimulator() {
  const [infoOpen, setInfoOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [draggedType, setDraggedType] = useState<DeviceType | null>(null);

  return (
    <NetworkProvider>
      <div className="h-screen flex flex-col bg-background ">
        <Header
          onOpenInfo={() => setInfoOpen(true)}
          onOpenCalculator={() => setCalculatorOpen(true)}
        />

        <div className="flex-1 flex ">
          {/* Left Sidebar - Device Palette and Instructions */}
          <aside className="w-56 border-r border-border bg-card overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Device Palette */}
              <DevicePalette onDragStart={setDraggedType} />

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

          {/* Main Content */}
          <main className="flex-1 flex flex-col  min-h-0">
            <div className="flex-1 ">
              <NetworkCanvas />
            </div>
            <ConsolePanel />
          </main>

          {/* Right Sidebar - Configuration */}
          <ConfigPanel />
        </div>

        {/* Modals */}
        <InfoPanel isOpen={infoOpen} onClose={() => setInfoOpen(false)} />
        <SubnetCalculator isOpen={calculatorOpen} onClose={() => setCalculatorOpen(false)} />
      </div>
    </NetworkProvider>
  );
}
