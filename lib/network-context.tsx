'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  type NetworkDevice,
  type Cable,
  type NetworkTopology,
  type DeviceType,
  type SimulationPacket,
  generateDeviceId,
  generateMacAddress,
  defaultDeviceConfig,
  ipToNumber,
  numberToIp,
  isInSameSubnet
} from './network-types';

interface NetworkContextType {
  topology: NetworkTopology;
  selectedDevice: NetworkDevice | null;
  selectedCable: Cable | null;
  connectionMode: { active: boolean; fromDeviceId: string | null; fromInterfaceId: string | null };
  simulationPackets: SimulationPacket[];
  consoleOutput: string[];
  addDevice: (type: DeviceType, x: number, y: number) => void;
  removeDevice: (id: string) => void;
  updateDevice: (device: NetworkDevice) => void;
  moveDevice: (id: string, x: number, y: number) => void;
  selectDevice: (device: NetworkDevice | null) => void;
  selectCable: (cable: Cable | null) => void;
  startConnection: (deviceId: string, interfaceId: string) => void;
  completeConnection: (deviceId: string, interfaceId: string) => void;
  cancelConnection: () => void;
  removeCable: (id: string) => void;
  simulatePing: (sourceId: string, destIp: string) => void;
  runDHCPDiscovery: (deviceId: string) => void;
  resolveDNS: (deviceId: string, hostname: string) => void;
  addConsoleLog: (message: string) => void;
  clearConsole: () => void;
  clearTopology: () => void;
  saveTopology: (userId: string, exerciseId: string) => Promise<void>;
  loadTopology: (userId: string, exerciseId: string) => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | null>(null);

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [topology, setTopology] = useState<NetworkTopology>({ devices: [], cables: [] });
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  const [selectedCable, setSelectedCable] = useState<Cable | null>(null);
  const [connectionMode, setConnectionMode] = useState<{
    active: boolean;
    fromDeviceId: string | null;
    fromInterfaceId: string | null;
  }>({ active: false, fromDeviceId: null, fromInterfaceId: null });
  const [simulationPackets, setSimulationPackets] = useState<SimulationPacket[]>([]);
  const [consoleOutput, setConsoleOutput] = useState<string[]>(['[NetSim] Console initialisee. Bienvenue dans le simulateur reseau.']);

  const addConsoleLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    setConsoleOutput(prev => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  const clearConsole = useCallback(() => {
    setConsoleOutput(['[NetSim] Console effacee.']);
  }, []);

  const clearTopology = useCallback(() => {
    setTopology({ devices: [], cables: [] });
    setSelectedDevice(null);
    setSelectedCable(null);
    setConnectionMode({ active: false, fromDeviceId: null, fromInterfaceId: null });
    setConsoleOutput(['[NetSim] Topologie reinitialise.']);
  }, []);

  const addDevice = useCallback((type: DeviceType, x: number, y: number) => {
    const config = defaultDeviceConfig[type];
    const newDevice: NetworkDevice = {
      id: generateDeviceId(),
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)}-${Math.floor(Math.random() * 100)}`,
      x,
      y,
      hostname: `${type}-${Math.floor(Math.random() * 1000)}`,
      status: 'online',
      interfaces: config.interfaces?.map(iface => ({
        ...iface,
        id: `${generateDeviceId()}-${iface.id}`,
        macAddress: generateMacAddress()
      })) || [],
      ...(config.dhcpConfig && { dhcpConfig: { ...config.dhcpConfig } }),
      ...(config.dnsConfig && { dnsConfig: { ...config.dnsConfig } }),
      ...(config.routingTable && { routingTable: [...config.routingTable] })
    };

    setTopology(prev => ({
      ...prev,
      devices: [...prev.devices, newDevice]
    }));
    addConsoleLog(`Appareil ajoute: ${newDevice.name} (${type})`);
  }, [addConsoleLog]);

  const removeDevice = useCallback((id: string) => {
    setTopology(prev => {
      const device = prev.devices.find(d => d.id === id);
      if (device) {
        addConsoleLog(`Appareil supprime: ${device.name}`);
      }
      return {
        devices: prev.devices.filter(d => d.id !== id),
        cables: prev.cables.filter(c => c.fromDeviceId !== id && c.toDeviceId !== id)
      };
    });
    if (selectedDevice?.id === id) {
      setSelectedDevice(null);
    }
  }, [selectedDevice, addConsoleLog]);

  const updateDevice = useCallback((device: NetworkDevice) => {
    setTopology(prev => ({
      ...prev,
      devices: prev.devices.map(d => d.id === device.id ? device : d)
    }));
    if (selectedDevice?.id === device.id) {
      setSelectedDevice(device);
    }
  }, [selectedDevice]);

  const moveDevice = useCallback((id: string, x: number, y: number) => {
    setTopology(prev => ({
      ...prev,
      devices: prev.devices.map(d => d.id === id ? { ...d, x, y } : d)
    }));
  }, []);

  const selectDevice = useCallback((device: NetworkDevice | null) => {
    setSelectedDevice(device);
    setSelectedCable(null);
  }, []);

  const selectCable = useCallback((cable: Cable | null) => {
    setSelectedCable(cable);
    setSelectedDevice(null);
  }, []);

  const startConnection = useCallback((deviceId: string, interfaceId: string) => {
    setConnectionMode({ active: true, fromDeviceId: deviceId, fromInterfaceId: interfaceId });
    addConsoleLog(`Mode connexion: selection de l'interface source`);
  }, [addConsoleLog]);

  const completeConnection = useCallback((toDeviceId: string, toInterfaceId: string) => {
    if (!connectionMode.active || !connectionMode.fromDeviceId || !connectionMode.fromInterfaceId) return;
    if (connectionMode.fromDeviceId === toDeviceId) {
      addConsoleLog('Erreur: Impossible de connecter un appareil a lui-meme');
      setConnectionMode({ active: false, fromDeviceId: null, fromInterfaceId: null });
      return;
    }

    const newCable: Cable = {
      id: `cable-${Date.now()}`,
      fromDeviceId: connectionMode.fromDeviceId,
      fromInterfaceId: connectionMode.fromInterfaceId,
      toDeviceId,
      toInterfaceId,
      type: 'ethernet',
      status: 'connected'
    };

    setTopology(prev => {
      const updatedDevices = prev.devices.map(device => {
        if (device.id === connectionMode.fromDeviceId) {
          return {
            ...device,
            interfaces: device.interfaces.map(iface =>
              iface.id === connectionMode.fromInterfaceId
                ? { ...iface, connected: true, connectedTo: toDeviceId }
                : iface
            )
          };
        }
        if (device.id === toDeviceId) {
          return {
            ...device,
            interfaces: device.interfaces.map(iface =>
              iface.id === toInterfaceId
                ? { ...iface, connected: true, connectedTo: connectionMode.fromDeviceId! }
                : iface
            )
          };
        }
        return device;
      });

      return {
        devices: updatedDevices,
        cables: [...prev.cables, newCable]
      };
    });

    addConsoleLog(`Cable connecte entre les appareils`);
    setConnectionMode({ active: false, fromDeviceId: null, fromInterfaceId: null });
  }, [connectionMode, addConsoleLog]);

  const cancelConnection = useCallback(() => {
    setConnectionMode({ active: false, fromDeviceId: null, fromInterfaceId: null });
    addConsoleLog('Mode connexion annule');
  }, [addConsoleLog]);

  const removeCable = useCallback((id: string) => {
    setTopology(prev => {
      const cable = prev.cables.find(c => c.id === id);
      if (!cable) return prev;

      const updatedDevices = prev.devices.map(device => {
        if (device.id === cable.fromDeviceId || device.id === cable.toDeviceId) {
          return {
            ...device,
            interfaces: device.interfaces.map(iface => {
              if (
                (device.id === cable.fromDeviceId && iface.id === cable.fromInterfaceId) ||
                (device.id === cable.toDeviceId && iface.id === cable.toInterfaceId)
              ) {
                return { ...iface, connected: false, connectedTo: undefined };
              }
              return iface;
            })
          };
        }
        return device;
      });

      return {
        devices: updatedDevices,
        cables: prev.cables.filter(c => c.id !== id)
      };
    });
    addConsoleLog('Cable deconnecte');
    if (selectedCable?.id === id) {
      setSelectedCable(null);
    }
  }, [selectedCable, addConsoleLog]);

  const simulatePing = useCallback((sourceId: string, destIp: string) => {
    const sourceDevice = topology.devices.find(d => d.id === sourceId);
    if (!sourceDevice) {
      addConsoleLog('Erreur: Appareil source non trouve');
      return;
    }

    const sourceInterface = sourceDevice.interfaces.find(i => i.ipAddress);
    if (!sourceInterface || !sourceInterface.ipAddress) {
      addConsoleLog(`Ping depuis ${sourceDevice.name}: Erreur - Pas d'adresse IP configuree`);
      return;
    }

    addConsoleLog(`Ping depuis ${sourceDevice.name} (${sourceInterface.ipAddress}) vers ${destIp}...`);

    // Find target device
    const targetDevice = topology.devices.find(d =>
      d.interfaces.some(i => i.ipAddress === destIp)
    );

    if (!targetDevice) {
      addConsoleLog(`Ping vers ${destIp}: Hote de destination inaccessible`);
      return;
    }

    const targetInterface = targetDevice.interfaces.find(i => i.ipAddress === destIp);
    if (!targetInterface) {
      addConsoleLog(`Ping vers ${destIp}: Interface non trouvee`);
      return;
    }

    // Check if in same subnet
    const inSameSubnet = isInSameSubnet(
      sourceInterface.ipAddress,
      destIp,
      sourceInterface.subnetMask
    );

    if (inSameSubnet) {
      // Check if connected via cables
      const isConnected = checkConnectivity(sourceDevice.id, targetDevice.id, topology);
      if (isConnected) {
        addConsoleLog(`Reponse de ${destIp}: octets=32 temps<1ms TTL=64`);
        addConsoleLog(`Statistiques Ping pour ${destIp}: Paquets: envoyes = 1, recus = 1, perdus = 0`);
      } else {
        addConsoleLog(`Ping vers ${destIp}: Delai d'attente de la demande depasse`);
      }
    } else {
      // Need to route through gateway
      if (!sourceInterface.gateway) {
        addConsoleLog(`Ping vers ${destIp}: Pas de passerelle configuree pour atteindre ce reseau`);
        return;
      }
      addConsoleLog(`Routage via passerelle ${sourceInterface.gateway}...`);
      addConsoleLog(`Reponse de ${destIp}: octets=32 temps=2ms TTL=63`);
    }
  }, [topology, addConsoleLog]);

  const runDHCPDiscovery = useCallback((deviceId: string) => {
    const device = topology.devices.find(d => d.id === deviceId);
    if (!device) {
      addConsoleLog('Erreur: Appareil non trouve');
      return;
    }

    const dhcpInterface = device.interfaces.find(i => i.dhcpEnabled);
    if (!dhcpInterface) {
      addConsoleLog(`${device.name}: DHCP non active sur cette interface`);
      return;
    }

    addConsoleLog(`${device.name}: Envoi DHCP DISCOVER (broadcast)...`);

    // Find DHCP server
    const dhcpServer = topology.devices.find(d => d.type === 'dhcp-server' && d.dhcpConfig?.enabled);
    if (!dhcpServer || !dhcpServer.dhcpConfig) {
      addConsoleLog(`${device.name}: Aucun serveur DHCP disponible`);
      return;
    }

    // Check connectivity
    const isConnected = checkConnectivity(device.id, dhcpServer.id, topology);
    if (!isConnected) {
      addConsoleLog(`${device.name}: Serveur DHCP non accessible (pas de connexion)`);
      return;
    }

    addConsoleLog(`${dhcpServer.name}: DHCP OFFER recu`);

    // Assign IP from pool
    const poolStart = ipToNumber(dhcpServer.dhcpConfig.poolStart);
    const poolEnd = ipToNumber(dhcpServer.dhcpConfig.poolEnd);
    const usedIps = dhcpServer.dhcpConfig.leases.map(l => ipToNumber(l.ipAddress));

    let assignedIp: string | null = null;
    for (let ip = poolStart; ip <= poolEnd; ip++) {
      if (!usedIps.includes(ip)) {
        assignedIp = numberToIp(ip);
        break;
      }
    }

    if (!assignedIp) {
      addConsoleLog(`${device.name}: Pool DHCP epuise`);
      return;
    }

    addConsoleLog(`${device.name}: DHCP REQUEST pour ${assignedIp}`);
    addConsoleLog(`${dhcpServer.name}: DHCP ACK - Adresse ${assignedIp} assignee`);

    // Update device and DHCP server
    const updatedDevice: NetworkDevice = {
      ...device,
      interfaces: device.interfaces.map(iface =>
        iface.id === dhcpInterface.id
          ? {
              ...iface,
              ipAddress: assignedIp!,
              subnetMask: dhcpServer.dhcpConfig!.subnetMask,
              gateway: dhcpServer.dhcpConfig!.gateway
            }
          : iface
      )
    };

    const updatedDhcpServer: NetworkDevice = {
      ...dhcpServer,
      dhcpConfig: {
        ...dhcpServer.dhcpConfig,
        leases: [
          ...dhcpServer.dhcpConfig.leases,
          {
            macAddress: dhcpInterface.macAddress,
            ipAddress: assignedIp,
            hostname: device.hostname,
            expiresAt: new Date(Date.now() + dhcpServer.dhcpConfig.leaseTime * 1000)
          }
        ]
      }
    };

    setTopology(prev => ({
      ...prev,
      devices: prev.devices.map(d => {
        if (d.id === device.id) return updatedDevice;
        if (d.id === dhcpServer.id) return updatedDhcpServer;
        return d;
      })
    }));

    if (selectedDevice?.id === device.id) {
      setSelectedDevice(updatedDevice);
    }

    addConsoleLog(`${device.name}: Configuration IP obtenue via DHCP`);
    addConsoleLog(`  IP: ${assignedIp}`);
    addConsoleLog(`  Masque: ${dhcpServer.dhcpConfig.subnetMask}`);
    addConsoleLog(`  Passerelle: ${dhcpServer.dhcpConfig.gateway}`);
  }, [topology, selectedDevice, addConsoleLog]);

  const resolveDNS = useCallback((deviceId: string, hostname: string) => {
    const device = topology.devices.find(d => d.id === deviceId);
    if (!device) {
      addConsoleLog('Erreur: Appareil non trouve');
      return;
    }

    addConsoleLog(`${device.name}: Resolution DNS pour ${hostname}...`);

    // Find DNS server
    const dnsServer = topology.devices.find(d => d.type === 'dns-server' && d.dnsConfig?.enabled);
    if (!dnsServer || !dnsServer.dnsConfig) {
      addConsoleLog(`${device.name}: Aucun serveur DNS disponible`);
      return;
    }

    const record = dnsServer.dnsConfig.records.find(r => r.hostname === hostname);
    if (record) {
      addConsoleLog(`${device.name}: ${hostname} resolu en ${record.ipAddress}`);
    } else {
      addConsoleLog(`${device.name}: Impossible de resoudre ${hostname}`);
    }
  }, [topology, addConsoleLog]);

  const saveTopology = useCallback(async (userId: string, exerciseId: string) => {
    try {
      await fetch('/api/exercise-schemas/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, exerciseId, topology })
      });
    } catch (error) {
      console.error('Error saving topology:', error);
    }
  }, [topology]);

  const loadTopology = useCallback(async (userId: string, exerciseId: string) => {
    try {
      const response = await fetch(`/api/exercise-schemas/load/${userId}/${exerciseId}`);
      const data = await response.json();
      if (data.topology) {
        setTopology(data.topology);
        addConsoleLog('Schéma charge depuis la base de donnees');
      }
    } catch (error) {
      console.error('Error loading topology:', error);
    }
  }, [addConsoleLog]);

  return (
    <NetworkContext.Provider
      value={{
        topology,
        selectedDevice,
        selectedCable,
        connectionMode,
        simulationPackets,
        consoleOutput,
        addDevice,
        removeDevice,
        updateDevice,
        moveDevice,
        selectDevice,
        selectCable,
        startConnection,
        completeConnection,
        cancelConnection,
        removeCable,
        simulatePing,
        runDHCPDiscovery,
        resolveDNS,
        addConsoleLog,
        clearConsole,
        clearTopology,
        saveTopology,
        loadTopology
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

// Helper function to check connectivity between devices
function checkConnectivity(sourceId: string, targetId: string, topology: NetworkTopology): boolean {
  const visited = new Set<string>();
  const queue = [sourceId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (currentId === targetId) return true;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    // Find all connected devices
    for (const cable of topology.cables) {
      if (cable.fromDeviceId === currentId && !visited.has(cable.toDeviceId)) {
        queue.push(cable.toDeviceId);
      }
      if (cable.toDeviceId === currentId && !visited.has(cable.fromDeviceId)) {
        queue.push(cable.fromDeviceId);
      }
    }
  }

  return false;
}
