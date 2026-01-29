'use client';

import { useExercise } from '@/lib/exercise-context';
import { cn } from '@/lib/utils';

export function PacketAnimationLayer() {
  const { packetAnimations } = useExercise();

  if (packetAnimations.length === 0) return null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
      {packetAnimations.map((animation) => {
        if (animation.path.length < 2) return null;

        // Calculate current position along the path
        const totalSegments = animation.path.length - 1;
        const currentSegmentFloat = animation.currentProgress * totalSegments;
        const currentSegment = Math.min(Math.floor(currentSegmentFloat), totalSegments - 1);
        const segmentProgress = currentSegmentFloat - currentSegment;

        const from = animation.path[currentSegment];
        const to = animation.path[currentSegment + 1] || from;

        const currentX = from.x + (to.x - from.x) * segmentProgress;
        const currentY = from.y + (to.y - from.y) * segmentProgress;

        // Draw the path taken
        const pathD = animation.path
          .slice(0, currentSegment + 2)
          .map((point, i) => {
            if (i === 0) return `M ${point.x} ${point.y}`;
            if (i <= currentSegment) return `L ${point.x} ${point.y}`;
            return `L ${currentX} ${currentY}`;
          })
          .join(' ');

        return (
          <g key={animation.id}>
            {/* Trail path */}
            <path
              d={pathD}
              fill="none"
              stroke={animation.status === 'success' ? 'var(--success)' : 'var(--primary)'}
              strokeWidth={2}
              strokeDasharray="4,4"
              opacity={0.5}
            />

            {/* Packet indicator */}
            <g transform={`translate(${currentX}, ${currentY})`}>
              {/* Glow effect */}
              <circle
                r={12}
                fill={animation.status === 'success' ? 'var(--success)' : 'var(--primary)'}
                opacity={0.3}
                className="animate-ping"
              />
              
              {/* Packet body */}
              <rect
                x={-8}
                y={-6}
                width={16}
                height={12}
                rx={2}
                fill={animation.status === 'success' ? 'var(--success)' : 'var(--primary)'}
                stroke="var(--background)"
                strokeWidth={1}
              />
              
              {/* Protocol label */}
              <text
                x={0}
                y={3}
                textAnchor="middle"
                fontSize={6}
                fill="var(--background)"
                fontWeight="bold"
              >
                {animation.protocol}
              </text>
            </g>

            {/* Message tooltip */}
            {animation.status === 'traveling' && (
              <g transform={`translate(${currentX}, ${currentY - 25})`}>
                <rect
                  x={-60}
                  y={-10}
                  width={120}
                  height={20}
                  rx={4}
                  fill="var(--card)"
                  stroke="var(--border)"
                />
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  fontSize={8}
                  fill="var(--foreground)"
                >
                  {animation.message}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
