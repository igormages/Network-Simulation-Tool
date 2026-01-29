'use client';

import React from "react"

import { useRef, useState, useCallback, useEffect } from 'react';
import { useNetwork } from '@/lib/network-context';
import type { DeviceType, NetworkDevice } from '@/lib/network-types';
import { DeviceIcon, deviceLabels } from './device-icons';
import { cn } from '@/lib/utils';

export function NetworkCanvas() {
  const {
    topology,
    selectedDevice,
    connectionMode,
    addDevice,
    moveDevice,
    selectDevice,
    startConnection,
    completeConnection,
    cancelConnection,
    selectCable,
    removeCable
  } = useNetwork();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedDevice, setDraggedDevice] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [dragFromInterface, setDragFromInterface] = useState<{ deviceId: string; interfaceId: string; x: number; y: number } | null>(null);
  const [mousePosForPreview, setMousePosForPreview] = useState({ x: 0, y: 0 });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const deviceType = e.dataTransfer.getData('deviceType') as DeviceType;
    if (!deviceType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 40;
    const y = e.clientY - rect.top - 40;

    addDevice(deviceType, Math.max(0, x), Math.max(0, y));
  }, [addDevice]);

  const handleDeviceMouseDown = useCallback((e: React.MouseEvent, device: NetworkDevice) => {
    e.stopPropagation();
    if (connectionMode.active) return;
    
    setDraggedDevice(device.id);
    setDragOffset({
      x: e.clientX - device.x,
      y: e.clientY - device.y
    });
    selectDevice(device);
  }, [connectionMode.active, selectDevice]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedDevice || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - dragOffset.x, rect.width - 80));
    const y = Math.max(0, Math.min(e.clientY - dragOffset.y, rect.height - 80));

    moveDevice(draggedDevice, x, y);

    // Update mouse position for preview line
    if (dragFromInterface) {
      setMousePosForPreview({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }, [draggedDevice, dragOffset, moveDevice, dragFromInterface]);

  const handleCanvasMouseUp = useCallback(() => {
    setDraggedDevice(null);
    setDragFromInterface(null);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      selectDevice(null);
      if (connectionMode.active) {
        cancelConnection();
      }
    }
  }, [selectDevice, connectionMode.active, cancelConnection]);

  const handleInterfaceClick = useCallback((e: React.MouseEvent, device: NetworkDevice, interfaceId: string) => {
    e.stopPropagation();
    
    if (connectionMode.active) {
      completeConnection(device.id, interfaceId);
    } else {
      startConnection(device.id, interfaceId);
    }
  }, [connectionMode.active, startConnection, completeConnection]);

  const handleInterfaceMouseDown = useCallback((e: React.MouseEvent, device: NetworkDevice, interfaceId: string) => {
    e.stopPropagation();
    
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const interfacePos = {
      x: device.x + 40,
      y: device.y + 43
    };
    
    setDragFromInterface({
      deviceId: device.id,
      interfaceId,
      x: interfacePos.x,
      y: interfacePos.y
    });
    setMousePosForPreview({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleInterfaceMouseUp = useCallback((e: React.MouseEvent, device: NetworkDevice, interfaceId: string) => {
    e.stopPropagation();
    
    if (dragFromInterface && dragFromInterface.deviceId !== device.id) {
      completeConnection(device.id, interfaceId);
    }
    setDragFromInterface(null);
  }, [dragFromInterface, completeConnection]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && connectionMode.active) {
        cancelConnection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [connectionMode.active, cancelConnection]);

  const getDeviceCenter = (device: NetworkDevice) => ({
    x: device.x + 40,
    y: device.y + 40
  });

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold text-foreground">Canvas Reseau</h2>
          <span className="text-xs text-muted-foreground">
            {topology.devices.length} appareil(s) | {topology.cables.length} connexion(s)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="rounded border-border"
            />
            Grille
          </label>
          {connectionMode.active && (
            <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-md">
              Mode connexion actif - Cliquez sur une interface cible
            </span>
          )}
        </div>
      </div>

      <div
        ref={canvasRef}
        className={cn(
          'flex-1 relative overflow-hidden cursor-crosshair',
          'bg-canvas',
          showGrid && 'bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]'
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onClick={handleCanvasClick}
      >
        {/* Cables SVG Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {topology.cables.map((cable) => {
            const fromDevice = topology.devices.find(d => d.id === cable.fromDeviceId);
            const toDevice = topology.devices.find(d => d.id === cable.toDeviceId);
            if (!fromDevice || !toDevice) return null;

            const from = getDeviceCenter(fromDevice);
            const to = getDeviceCenter(toDevice);

            return (
              <g key={cable.id} className="pointer-events-auto cursor-pointer">
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="transparent"
                  strokeWidth={10}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectCable(cable);
                  }}
                />
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={cable.status === 'connected' ? 'var(--success)' : 'var(--destructive)'}
                  strokeWidth={2}
                  strokeDasharray={cable.status === 'disconnected' ? '5,5' : undefined}
                  className="pointer-events-none"
                />
                <circle
                  cx={(from.x + to.x) / 2}
                  cy={(from.y + to.y) / 2}
                  r={6}
                  fill="var(--card)"
                  stroke={cable.status === 'connected' ? 'var(--success)' : 'var(--destructive)'}
                  strokeWidth={2}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Supprimer cette connexion ?')) {
                      removeCable(cable.id);
                    }
                  }}
                />
              </g>
            );
          })}

          {/* Preview line for drag-to-connect */}
          {dragFromInterface && (
            <line
              x1={dragFromInterface.x}
              y1={dragFromInterface.y}
              x2={mousePosForPreview.x}
              y2={mousePosForPreview.y}
              stroke="var(--primary)"
              strokeWidth={2}
              strokeDasharray="5,5"
              opacity={0.6}
              className="pointer-events-none"
            />
          )}
        </svg>

        {/* Devices Layer */}
        {topology.devices.map((device) => (
          <div
            key={device.id}
            className={cn(
              'absolute flex flex-col items-center gap-1 p-2 rounded-lg cursor-move transition-all select-none',
              'bg-card border-2',
              selectedDevice?.id === device.id ? 'border-primary shadow-lg shadow-primary/20' : 'border-border hover:border-muted-foreground',
              draggedDevice === device.id && 'opacity-75 scale-105'
            )}
            style={{
              left: device.x,
              top: device.y,
              width: 80
            }}
            onMouseDown={(e) => handleDeviceMouseDown(e, device)}
          >
            <DeviceIcon type={device.type} size={32} />
            <span className="text-xs font-medium text-foreground truncate w-full text-center">
              {device.name}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {deviceLabels[device.type]}
            </span>
            
            {/* Status indicator */}
            <div className={cn(
              'absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-card',
              device.status === 'online' ? 'bg-success' : device.status === 'error' ? 'bg-destructive' : 'bg-muted-foreground'
            )} />

            {/* Interface indicators */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {device.interfaces.slice(0, 4).map((iface) => (
                <button
                  key={iface.id}
                  className={cn(
                    'w-3 h-3 rounded-sm border transition-all',
                    iface.connected
                      ? 'bg-success border-success'
                      : connectionMode.active || dragFromInterface
                        ? 'bg-primary/50 border-primary animate-pulse'
                        : 'bg-muted border-border hover:bg-primary/50 hover:border-primary',
                    dragFromInterface && dragFromInterface.deviceId === device.id && dragFromInterface.interfaceId === iface.id && 'ring-2 ring-primary'
                  )}
                  title={`${iface.name}${iface.ipAddress ? ` (${iface.ipAddress})` : ''}`}
                  onMouseDown={(e) => handleInterfaceMouseDown(e, device, iface.id)}
                  onMouseUp={(e) => handleInterfaceMouseUp(e, device, iface.id)}
                  onClick={(e) => handleInterfaceClick(e, device, iface.id)}
                />
              ))}
            </div>

            {/* IP Address display */}
            {device.interfaces[0]?.ipAddress && (
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground whitespace-nowrap bg-card px-1 rounded">
                {device.interfaces[0].ipAddress}
              </span>
            )}
          </div>
        ))}

        {/* Empty state */}
        {topology.devices.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">Canvas vide</p>
              <p className="text-sm">Glissez des equipements depuis le panneau de gauche</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
