'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  isValidIp,
  getNetworkAddress,
  getBroadcastAddress,
  maskToCidr,
  cidrToMask,
  getAvailableHosts,
  getIpClass,
  ipToNumber,
  numberToIp
} from '@/lib/network-types';

interface SubnetCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubnetCalculator({ isOpen, onClose }: SubnetCalculatorProps) {
  const [ipAddress, setIpAddress] = useState('192.168.1.0');
  const [cidr, setCidr] = useState(24);

  const calculations = useMemo(() => {
    if (!isValidIp(ipAddress)) return null;

    const mask = cidrToMask(cidr);
    const networkAddr = getNetworkAddress(ipAddress, mask);
    const broadcastAddr = getBroadcastAddress(ipAddress, mask);
    const availableHosts = getAvailableHosts(mask);
    const ipClass = getIpClass(ipAddress);

    // Calculate first and last usable addresses
    const networkNum = ipToNumber(networkAddr);
    const broadcastNum = ipToNumber(broadcastAddr);
    const firstUsable = numberToIp(networkNum + 1);
    const lastUsable = numberToIp(broadcastNum - 1);

    // Binary representation
    const ipParts = ipAddress.split('.').map(Number);
    const maskParts = mask.split('.').map(Number);
    const ipBinary = ipParts.map(p => p.toString(2).padStart(8, '0')).join('.');
    const maskBinary = maskParts.map(p => p.toString(2).padStart(8, '0')).join('.');

    return {
      mask,
      networkAddr,
      broadcastAddr,
      availableHosts,
      ipClass,
      firstUsable,
      lastUsable,
      ipBinary,
      maskBinary,
      totalAddresses: Math.pow(2, 32 - cidr)
    };
  }, [ipAddress, cidr]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-xl ">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Calculateur de Sous-reseau</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Adresse IP</Label>
              <Input
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.1.0"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">CIDR (/{cidr})</Label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={32}
                  value={cidr}
                  onChange={(e) => setCidr(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-8 text-center font-mono text-sm">/{cidr}</span>
              </div>
            </div>
          </div>

          {calculations && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <ResultCard label="Masque de sous-reseau" value={calculations.mask} />
                <ResultCard label="Adresse reseau" value={calculations.networkAddr} />
                <ResultCard label="Adresse de broadcast" value={calculations.broadcastAddr} />
                <ResultCard label="Classe d'adresse" value={`Classe ${calculations.ipClass}`} />
                <ResultCard label="Premiere adresse utilisable" value={calculations.firstUsable} />
                <ResultCard label="Derniere adresse utilisable" value={calculations.lastUsable} />
                <ResultCard label="Nombre total d'adresses" value={calculations.totalAddresses.toLocaleString()} />
                <ResultCard label="Hotes utilisables" value={calculations.availableHosts.toLocaleString()} />
              </div>

              <div className="space-y-2 p-4 bg-secondary/30 rounded-lg">
                <h3 className="text-sm font-medium text-foreground">Representation binaire</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20">IP:</span>
                    <code className="text-xs font-mono text-foreground">{calculations.ipBinary}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20">Masque:</span>
                    <code className="text-xs font-mono text-foreground">{calculations.maskBinary}</code>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="text-sm font-medium text-foreground mb-2">Notation CIDR</h3>
                <code className="text-lg font-mono text-primary">{calculations.networkAddr}/{cidr}</code>
              </div>
            </div>
          )}

          {!calculations && (
            <div className="p-4 bg-destructive/10 rounded-lg text-destructive text-sm">
              Adresse IP invalide. Utilisez le format xxx.xxx.xxx.xxx
            </div>
          )}

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-foreground mb-2">Masques courants</h3>
            <div className="grid grid-cols-4 gap-2">
              {[8, 16, 24, 25, 26, 27, 28, 30].map((c) => (
                <Button
                  key={c}
                  variant="outline"
                  size="sm"
                  className="font-mono text-xs bg-transparent"
                  onClick={() => setCidr(c)}
                >
                  /{c} ({cidrToMask(c).split('.').pop()})
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-3 bg-secondary/50 rounded-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-mono font-medium text-foreground mt-1">{value}</p>
    </div>
  );
}
