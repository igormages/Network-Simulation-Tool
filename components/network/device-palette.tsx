'use client';

import { useState } from 'react';
import type { DeviceType } from '@/lib/network-types';
import { DeviceIcon, deviceLabels, deviceDescriptions } from './device-icons';
import { cn } from '@/lib/utils';

interface DevicePaletteProps {
  onDragStart?: (type: DeviceType) => void;
}

const deviceTypes: DeviceType[] = ['router', 'switch', 'server', 'pc', 'dhcp-server', 'dns-server'];

export function DevicePalette({ onDragStart }: DevicePaletteProps) {
  const [hoveredDevice, setHoveredDevice] = useState<DeviceType | null>(null);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <h2 className="text-sm font-semibold text-foreground">Equipements</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {deviceTypes.map((type) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('deviceType', type);
              onDragStart?.(type);
            }}
            onMouseEnter={() => setHoveredDevice(type)}
            onMouseLeave={() => setHoveredDevice(null)}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-lg cursor-grab transition-all',
              'bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/50',
              'active:cursor-grabbing active:scale-95'
            )}
          >
            <DeviceIcon type={type} size={36} />
            <span className="text-xs font-medium text-foreground text-center leading-tight">
              {deviceLabels[type]}
            </span>
          </div>
        ))}
      </div>

      {hoveredDevice && (
        <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">
            {deviceDescriptions[hoveredDevice]}
          </p>
        </div>
      )}
    </div>
  );
}
