'use client';

import { useState } from 'react';
import { useNetwork } from '@/lib/network-context';
import type { NetworkDevice, NetworkInterface, DHCPConfig, DNSConfig } from '@/lib/network-types';
import { DeviceIcon, deviceLabels } from './device-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  isValidIp,
  getNetworkAddress,
  getBroadcastAddress,
  maskToCidr,
  getAvailableHosts,
  getIpClass
} from '@/lib/network-types';

export function ConfigPanel() {
  const {
    selectedDevice,
    selectedCable,
    updateDevice,
    removeDevice,
    removeCable,
    simulatePing,
    runDHCPDiscovery,
    resolveDNS
  } = useNetwork();

  const [pingTarget, setPingTarget] = useState('');
  const [dnsQuery, setDnsQuery] = useState('');

  if (!selectedDevice && !selectedCable) {
    return (
      <div className="w-80 border-l border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Configuration</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted-foreground text-center">
            Selectionnez un appareil ou un cable pour voir sa configuration
          </p>
        </div>
      </div>
    );
  }

  if (selectedCable) {
    return (
      <div className="w-80 border-l border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Cable</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <p className="text-sm font-medium text-foreground capitalize">{selectedCable.type}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Statut</Label>
            <p className={cn(
              'text-sm font-medium',
              selectedCable.status === 'connected' ? 'text-success' : 'text-destructive'
            )}>
              {selectedCable.status === 'connected' ? 'Connecte' : 'Deconnecte'}
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => removeCable(selectedCable.id)}
          >
            Supprimer la connexion
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col ">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <DeviceIcon type={selectedDevice.type} size={32} />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground truncate">{selectedDevice.name}</h2>
          <p className="text-xs text-muted-foreground">{deviceLabels[selectedDevice.type]}</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="flex-1 flex flex-col ">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger value="general" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            General
          </TabsTrigger>
          <TabsTrigger value="interfaces" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            Interfaces
          </TabsTrigger>
          {selectedDevice.type === 'dhcp-server' && (
            <TabsTrigger value="dhcp" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              DHCP
            </TabsTrigger>
          )}
          {selectedDevice.type === 'dns-server' && (
            <TabsTrigger value="dns" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              DNS
            </TabsTrigger>
          )}
          <TabsTrigger value="tools" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            Outils
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="general" className="p-4 space-y-4 m-0">
            <GeneralTab device={selectedDevice} onUpdate={updateDevice} />
          </TabsContent>

          <TabsContent value="interfaces" className="p-4 space-y-4 m-0">
            <InterfacesTab device={selectedDevice} onUpdate={updateDevice} />
          </TabsContent>

          {selectedDevice.type === 'dhcp-server' && selectedDevice.dhcpConfig && (
            <TabsContent value="dhcp" className="p-4 space-y-4 m-0">
              <DHCPTab device={selectedDevice} onUpdate={updateDevice} />
            </TabsContent>
          )}

          {selectedDevice.type === 'dns-server' && selectedDevice.dnsConfig && (
            <TabsContent value="dns" className="p-4 space-y-4 m-0">
              <DNSTab device={selectedDevice} onUpdate={updateDevice} />
            </TabsContent>
          )}

          <TabsContent value="tools" className="p-4 space-y-4 m-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Ping</Label>
                <div className="flex gap-2">
                  
                  <Button
                    size="sm"
                    onClick={() => {
                      if (pingTarget) {
                        simulatePing(selectedDevice.id, pingTarget);
                      }
                    }}
                  >
                    Ping
                  </Button>
                </div>
              </div>

              {selectedDevice.interfaces.some(i => i.dhcpEnabled) && (
                <div className="space-y-2">
                  <Label className="text-xs">DHCP</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => runDHCPDiscovery(selectedDevice.id)}
                  >
                    Obtenir une adresse IP (DHCP)
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs">DNS Lookup</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nom d'hote"
                    value={dnsQuery}
                    onChange={(e) => setDnsQuery(e.target.value)}
                    className="flex-1 h-8 text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (dnsQuery) {
                        resolveDNS(selectedDevice.id, dnsQuery);
                      }
                    }}
                  >
                    Resoudre
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <div className="p-4 border-t border-border">
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => removeDevice(selectedDevice.id)}
        >
          Supprimer l'appareil
        </Button>
      </div>
    </div>
  );
}

function GeneralTab({ device, onUpdate }: { device: NetworkDevice; onUpdate: (d: NetworkDevice) => void }) {
  const [name, setName] = useState(device.name);
  const [hostname, setHostname] = useState(device.hostname);

  const handleSave = () => {
    onUpdate({ ...device, name, hostname });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Nom de l'appareil</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Hostname</Label>
        <Input
          value={hostname}
          onChange={(e) => setHostname(e.target.value)}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Statut</Label>
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            device.status === 'online' ? 'bg-success' : device.status === 'error' ? 'bg-destructive' : 'bg-muted-foreground'
          )} />
          <span className="text-xs text-muted-foreground capitalize">{device.status}</span>
        </div>
      </div>

      <Button size="sm" onClick={handleSave} className="w-full">
        Enregistrer
      </Button>
    </div>
  );
}

function InterfacesTab({ device, onUpdate }: { device: NetworkDevice; onUpdate: (d: NetworkDevice) => void }) {
  const [editingInterface, setEditingInterface] = useState<string | null>(null);
  const [interfaceForm, setInterfaceForm] = useState<NetworkInterface | null>(null);

  const handleEditInterface = (iface: NetworkInterface) => {
    setEditingInterface(iface.id);
    setInterfaceForm({ ...iface });
  };

  const handleSaveInterface = () => {
    if (!interfaceForm) return;

    const updatedDevice = {
      ...device,
      interfaces: device.interfaces.map(i =>
        i.id === interfaceForm.id ? interfaceForm : i
      )
    };
    onUpdate(updatedDevice);
    setEditingInterface(null);
    setInterfaceForm(null);
  };

  return (
    <div className="space-y-3">
      {device.interfaces.map((iface) => (
        <div
          key={iface.id}
          className="p-3 rounded-lg bg-secondary/50 border border-border space-y-2"
        >
          {editingInterface === iface.id && interfaceForm ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{iface.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{iface.macAddress}</span>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">DHCP</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={interfaceForm.dhcpEnabled}
                    onCheckedChange={(checked) =>
                      setInterfaceForm({ ...interfaceForm, dhcpEnabled: checked })
                    }
                  />
                  <span className="text-xs text-muted-foreground">
                    {interfaceForm.dhcpEnabled ? 'Active' : 'Desactive'}
                  </span>
                </div>
              </div>

              {!interfaceForm.dhcpEnabled && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Adresse IP</Label>
                    <Input
                      value={interfaceForm.ipAddress}
                      onChange={(e) =>
                        setInterfaceForm({ ...interfaceForm, ipAddress: e.target.value })
                      }
                      placeholder="192.168.1.10"
                      className="h-7 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Masque de sous-reseau</Label>
                    <Input
                      value={interfaceForm.subnetMask}
                      onChange={(e) =>
                        setInterfaceForm({ ...interfaceForm, subnetMask: e.target.value })
                      }
                      placeholder="255.255.255.0"
                      className="h-7 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Passerelle</Label>
                    <Input
                      value={interfaceForm.gateway}
                      onChange={(e) =>
                        setInterfaceForm({ ...interfaceForm, gateway: e.target.value })
                      }
                      placeholder="192.168.1.1"
                      className="h-7 text-xs font-mono"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveInterface} className="flex-1">
                  Sauvegarder
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingInterface(null);
                    setInterfaceForm(null);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{iface.name}</span>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    iface.connected ? 'bg-success' : 'bg-muted-foreground'
                  )} />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleEditInterface(iface)}
                  >
                    Modifier
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">IP:</span>{' '}
                  <span className="font-mono text-foreground">{iface.ipAddress || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Masque:</span>{' '}
                  <span className="font-mono text-foreground">{iface.subnetMask || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Passerelle:</span>{' '}
                  <span className="font-mono text-foreground">{iface.gateway || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">DHCP:</span>{' '}
                  <span className="text-foreground">{iface.dhcpEnabled ? 'Oui' : 'Non'}</span>
                </div>
              </div>

              <div className="text-[10px] text-muted-foreground font-mono">
                MAC: {iface.macAddress}
              </div>

              {/* IP Analysis */}
              {iface.ipAddress && iface.subnetMask && isValidIp(iface.ipAddress) && isValidIp(iface.subnetMask) && (
                <div className="pt-2 border-t border-border space-y-1">
                  <p className="text-[10px] text-muted-foreground">
                    Classe: {getIpClass(iface.ipAddress)} | CIDR: /{maskToCidr(iface.subnetMask)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Reseau: {getNetworkAddress(iface.ipAddress, iface.subnetMask)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Broadcast: {getBroadcastAddress(iface.ipAddress, iface.subnetMask)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Hotes disponibles: {getAvailableHosts(iface.subnetMask)}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function DHCPTab({ device, onUpdate }: { device: NetworkDevice; onUpdate: (d: NetworkDevice) => void }) {
  const [config, setConfig] = useState<DHCPConfig>(device.dhcpConfig!);

  const handleSave = () => {
    onUpdate({ ...device, dhcpConfig: config });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Serveur DHCP</Label>
        <Switch
          checked={config.enabled}
          onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
        />
      </div>

      {config.enabled && (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Debut du pool</Label>
            <Input
              value={config.poolStart}
              onChange={(e) => setConfig({ ...config, poolStart: e.target.value })}
              placeholder="192.168.1.100"
              className="h-7 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Fin du pool</Label>
            <Input
              value={config.poolEnd}
              onChange={(e) => setConfig({ ...config, poolEnd: e.target.value })}
              placeholder="192.168.1.200"
              className="h-7 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Masque de sous-reseau</Label>
            <Input
              value={config.subnetMask}
              onChange={(e) => setConfig({ ...config, subnetMask: e.target.value })}
              placeholder="255.255.255.0"
              className="h-7 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Passerelle par defaut</Label>
            <Input
              value={config.gateway}
              onChange={(e) => setConfig({ ...config, gateway: e.target.value })}
              placeholder="192.168.1.1"
              className="h-7 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Serveur DNS</Label>
            <Input
              value={config.dnsServer}
              onChange={(e) => setConfig({ ...config, dnsServer: e.target.value })}
              placeholder="192.168.1.3"
              className="h-7 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Duree du bail (secondes)</Label>
            <Input
              type="number"
              value={config.leaseTime}
              onChange={(e) => setConfig({ ...config, leaseTime: parseInt(e.target.value) || 86400 })}
              className="h-7 text-xs font-mono"
            />
          </div>

          {config.leases.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Baux actifs ({config.leases.length})</Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {config.leases.map((lease, idx) => (
                  <div key={idx} className="text-[10px] p-2 bg-secondary/50 rounded font-mono">
                    <div>{lease.ipAddress} - {lease.hostname}</div>
                    <div className="text-muted-foreground">{lease.macAddress}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Button size="sm" onClick={handleSave} className="w-full">
        Enregistrer la configuration DHCP
      </Button>
    </div>
  );
}

function DNSTab({ device, onUpdate }: { device: NetworkDevice; onUpdate: (d: NetworkDevice) => void }) {
  const [config, setConfig] = useState<DNSConfig>(device.dnsConfig!);
  const [newRecord, setNewRecord] = useState({ hostname: '', ipAddress: '' });

  const handleSave = () => {
    onUpdate({ ...device, dnsConfig: config });
  };

  const addRecord = () => {
    if (newRecord.hostname && newRecord.ipAddress) {
      setConfig({
        ...config,
        records: [...config.records, { ...newRecord, type: 'A' }]
      });
      setNewRecord({ hostname: '', ipAddress: '' });
    }
  };

  const removeRecord = (index: number) => {
    setConfig({
      ...config,
      records: config.records.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Serveur DNS</Label>
        <Switch
          checked={config.enabled}
          onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
        />
      </div>

      {config.enabled && (
        <>
          <div className="space-y-2">
            <Label className="text-xs">Ajouter un enregistrement</Label>
            <div className="space-y-2">
              <Input
                value={newRecord.hostname}
                onChange={(e) => setNewRecord({ ...newRecord, hostname: e.target.value })}
                placeholder="serveur.local"
                className="h-7 text-xs"
              />
              <Input
                value={newRecord.ipAddress}
                onChange={(e) => setNewRecord({ ...newRecord, ipAddress: e.target.value })}
                placeholder="192.168.1.10"
                className="h-7 text-xs font-mono"
              />
              <Button size="sm" variant="outline" onClick={addRecord} className="w-full bg-transparent">
                Ajouter
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Enregistrements ({config.records.length})</Label>
            <div className="space-y-1">
              {config.records.map((record, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-secondary/50 rounded text-xs"
                >
                  <div>
                    <span className="font-medium">{record.hostname}</span>
                    <span className="text-muted-foreground"> → </span>
                    <span className="font-mono">{record.ipAddress}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-destructive hover:text-destructive"
                    onClick={() => removeRecord(idx)}
                  >
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Button size="sm" onClick={handleSave} className="w-full">
        Enregistrer la configuration DNS
      </Button>
    </div>
  );
}
