'use client';

import type { Exercise } from '@/lib/exercise-types';
import { DeviceIcon, deviceLabels } from '@/components/network/device-icons';
import { cn } from '@/lib/utils';

interface TargetTopologyProps {
  exercise: Exercise;
}

export function TargetTopology({ exercise }: TargetTopologyProps) {
  const { devices, cables } = exercise.targetTopology;

  const getDeviceCenter = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return { x: 0, y: 0 };
    return { x: device.x + 40, y: device.y + 40 };
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b border-border bg-card">
        <h3 className="text-sm font-semibold text-foreground">Schema attendu</h3>
        <p className="text-xs text-muted-foreground">Reproduisez cette topologie</p>
      </div>

      <div className="flex-1 relative bg-canvas ">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />

        {/* Cables */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {cables.map((cable, index) => {
            const from = getDeviceCenter(cable.fromDeviceId);
            const to = getDeviceCenter(cable.toDeviceId);

            return (
              <line
                key={index}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="var(--success)"
                strokeWidth={2}
                strokeDasharray="4,4"
                opacity={0.6}
              />
            );
          })}
        </svg>

        {/* Devices */}
        {devices.map((device) => (
          <div
            key={device.id}
            className={cn(
              'absolute flex flex-col items-center gap-1 p-2 rounded-lg',
              'bg-card/80 border border-border/50'
            )}
            style={{
              left: device.x,
              top: device.y,
              width: 80
            }}
          >
            <DeviceIcon type={device.type} size={28} />
            <span className="text-xs font-medium text-foreground truncate w-full text-center">
              {device.name}
            </span>
            <span className="text-[9px] text-muted-foreground">
              {deviceLabels[device.type]}
            </span>

            {/* Required config indicator */}
            {device.requiredConfig && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary/20 px-1 rounded text-[8px] text-primary whitespace-nowrap">
                {device.requiredConfig.ipAddress || (device.requiredConfig.dhcpEnabled ? 'DHCP' : '')}
              </div>
            )}
          </div>
        ))}

        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-card/90 border border-border rounded-lg p-2 text-xs space-y-1">
          <div className="text-muted-foreground font-medium">Legende:</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-success" style={{ strokeDasharray: '4,4' }}></div>
            <span className="text-muted-foreground">Cable requis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-1 bg-primary/20 text-primary rounded text-[8px]">IP</div>
            <span className="text-muted-foreground">Config requise</span>
          </div>
        </div>
      </div>
    </div>
  );
}
