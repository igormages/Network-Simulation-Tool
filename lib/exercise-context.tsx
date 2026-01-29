'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Exercise, ExerciseResult, PacketAnimation, ValidationRule } from './exercise-types';
import type { NetworkTopology, NetworkDevice } from './network-types';
import { isInSameSubnet } from './network-types';

interface ExerciseContextType {
  currentExercise: Exercise | null;
  exerciseMode: boolean;
  validationResults: ExerciseResult | null;
  packetAnimations: PacketAnimation[];
  showSolution: boolean;
  setCurrentExercise: (exercise: Exercise | null) => void;
  setExerciseMode: (mode: boolean) => void;
  validateExercise: (topology: NetworkTopology) => ExerciseResult;
  simulatePacketFlow: (topology: NetworkTopology, sourceId: string, destId: string) => void;
  clearAnimations: () => void;
  toggleSolution: () => void;
}

const ExerciseContext = createContext<ExerciseContextType | null>(null);

export function useExercise() {
  const context = useContext(ExerciseContext);
  if (!context) {
    throw new Error('useExercise must be used within an ExerciseProvider');
  }
  return context;
}

export function ExerciseProvider({ children }: { children: ReactNode }) {
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [exerciseMode, setExerciseMode] = useState(false);
  const [validationResults, setValidationResults] = useState<ExerciseResult | null>(null);
  const [packetAnimations, setPacketAnimations] = useState<PacketAnimation[]>([]);
  const [showSolution, setShowSolution] = useState(false);

  const toggleSolution = useCallback(() => {
    setShowSolution(prev => !prev);
  }, []);

  const clearAnimations = useCallback(() => {
    setPacketAnimations([]);
  }, []);

  const validateExercise = useCallback((topology: NetworkTopology): ExerciseResult => {
    if (!currentExercise) {
      return {
        exerciseId: '',
        passed: false,
        score: 0,
        maxScore: 0,
        validationResults: [],
        completedAt: new Date()
      };
    }

    const results: { rule: ValidationRule; passed: boolean; message: string }[] = [];
    let totalScore = 0;
    let maxScore = 0;

    for (const rule of currentExercise.validationRules) {
      maxScore += rule.points;
      const { passed, message } = validateRule(rule, topology);
      results.push({ rule, passed, message });
      if (passed) {
        totalScore += rule.points;
      }
    }

    const exerciseResult: ExerciseResult = {
      exerciseId: currentExercise.id,
      passed: totalScore >= maxScore * 0.7,
      score: totalScore,
      maxScore,
      validationResults: results,
      completedAt: new Date()
    };

    setValidationResults(exerciseResult);
    return exerciseResult;
  }, [currentExercise]);

  const simulatePacketFlow = useCallback((topology: NetworkTopology, sourceId: string, destId: string) => {
    const sourceDevice = topology.devices.find(d => d.id === sourceId);
    const destDevice = topology.devices.find(d => d.id === destId);

    if (!sourceDevice || !destDevice) return;

    const animation: PacketAnimation = {
      id: `packet-${Date.now()}`,
      fromDevice: sourceDevice,
      toDevice: destDevice,
      protocol: 'ICMP',
      status: 'pending',
      currentProgress: 0,
      path: calculatePath(sourceDevice, destDevice, topology),
      message: `ICMP Echo Request: ${sourceDevice.name} -> ${destDevice.name}`
    };

    setPacketAnimations(prev => [...prev, animation]);

    // Animate the packet
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.02;
      if (progress >= 1) {
        clearInterval(interval);
        setPacketAnimations(prev =>
          prev.map(p =>
            p.id === animation.id ? { ...p, status: 'success', currentProgress: 1 } : p
          )
        );
        
        // Add reply animation after a short delay
        setTimeout(() => {
          const replyAnimation: PacketAnimation = {
            id: `packet-reply-${Date.now()}`,
            fromDevice: destDevice,
            toDevice: sourceDevice,
            protocol: 'ICMP',
            status: 'pending',
            currentProgress: 0,
            path: calculatePath(destDevice, sourceDevice, topology),
            message: `ICMP Echo Reply: ${destDevice.name} -> ${sourceDevice.name}`
          };
          
          setPacketAnimations(prev => [...prev, replyAnimation]);
          
          let replyProgress = 0;
          const replyInterval = setInterval(() => {
            replyProgress += 0.02;
            if (replyProgress >= 1) {
              clearInterval(replyInterval);
              setPacketAnimations(prev =>
                prev.map(p =>
                  p.id === replyAnimation.id ? { ...p, status: 'success', currentProgress: 1 } : p
                )
              );
            } else {
              setPacketAnimations(prev =>
                prev.map(p =>
                  p.id === replyAnimation.id ? { ...p, status: 'traveling', currentProgress: replyProgress } : p
                )
              );
            }
          }, 30);
        }, 500);
      } else {
        setPacketAnimations(prev =>
          prev.map(p =>
            p.id === animation.id ? { ...p, status: 'traveling', currentProgress: progress } : p
          )
        );
      }
    }, 30);
  }, []);

  return (
    <ExerciseContext.Provider
      value={{
        currentExercise,
        exerciseMode,
        validationResults,
        packetAnimations,
        showSolution,
        setCurrentExercise,
        setExerciseMode,
        validateExercise,
        simulatePacketFlow,
        clearAnimations,
        toggleSolution
      }}
    >
      {children}
    </ExerciseContext.Provider>
  );
}

function validateRule(rule: ValidationRule, topology: NetworkTopology): { passed: boolean; message: string } {
  switch (rule.type) {
    case 'device_exists': {
      const exists = topology.devices.some(d => d.type === rule.params.type);
      return {
        passed: exists,
        message: exists ? `Appareil ${rule.params.type} present` : rule.errorMessage
      };
    }
    
    case 'device_count': {
      const count = topology.devices.filter(d => d.type === rule.params.type).length;
      const minCount = (rule.params.min as number) || 1;
      const passed = count >= minCount;
      return {
        passed,
        message: passed ? `${count} ${rule.params.type}(s) trouves` : rule.errorMessage
      };
    }
    
    case 'ip_configured': {
      const devicesToCheck = rule.params.deviceType
        ? topology.devices.filter(d => d.type === rule.params.deviceType)
        : topology.devices.filter(d => d.type !== 'switch');
      
      const allConfigured = devicesToCheck.every(d =>
        d.interfaces.some(i => i.ipAddress && i.subnetMask)
      );
      
      if (rule.params.checkGateway) {
        const gatewaysConfigured = devicesToCheck
          .filter(d => d.type !== 'router')
          .every(d => d.interfaces.some(i => i.gateway));
        return {
          passed: allConfigured && gatewaysConfigured,
          message: allConfigured && gatewaysConfigured ? 'IP et passerelles configurees' : rule.errorMessage
        };
      }
      
      return {
        passed: allConfigured,
        message: allConfigured ? 'IP configurees' : rule.errorMessage
      };
    }
    
    case 'subnet_correct': {
      const pcs = topology.devices.filter(d => d.type === 'pc');
      if (pcs.length < 2) {
        return { passed: false, message: 'Pas assez de PC pour verifier' };
      }
      
      const ips = pcs
        .map(pc => pc.interfaces[0])
        .filter(i => i?.ipAddress && i?.subnetMask);
      
      if (ips.length < 2) {
        return { passed: false, message: 'IP non configurees' };
      }
      
      // Check if all are in same subnet (for basic exercises) or correct masks
      const expectedMask = rule.params.mask as string;
      const correctMasks = ips.every(i => i.subnetMask === expectedMask);
      
      return {
        passed: correctMasks,
        message: correctMasks ? 'Masques de sous-reseau corrects' : rule.errorMessage
      };
    }
    
    case 'dhcp_working': {
      const dhcpServer = topology.devices.find(d => d.type === 'dhcp-server');
      if (!dhcpServer?.dhcpConfig?.enabled) {
        return { passed: false, message: 'Serveur DHCP non configure' };
      }
      
      const clients = topology.devices.filter(d => 
        d.type === 'pc' && d.interfaces.some(i => i.dhcpEnabled)
      );
      
      const hasLeases = dhcpServer.dhcpConfig.leases.length > 0 ||
        clients.some(c => c.interfaces.some(i => i.ipAddress));
      
      return {
        passed: hasLeases,
        message: hasLeases ? 'DHCP fonctionnel' : rule.errorMessage
      };
    }
    
    case 'ping_success': {
      const interNetwork = rule.params.interNetwork as boolean;
      const pcs = topology.devices.filter(d => d.type === 'pc');
      const servers = topology.devices.filter(d => d.type === 'server' || d.type === 'dhcp-server' || d.type === 'dns-server');
      
      if (pcs.length < 2) {
        return { passed: false, message: 'Pas assez de PC' };
      }
      
      if (interNetwork && servers.length === 0) {
        return { passed: false, message: 'Aucun serveur trouve pour les tests inter-reseaux' };
      }

      // Check if all PCs have IPs and are connected
      const allHaveIps = pcs.every(pc => 
        pc.interfaces.some(i => i.ipAddress || i.dhcpEnabled)
      );
      
      if (!allHaveIps) {
        return { passed: false, message: 'Certains PC n\'ont pas d\'IP' };
      }
      
      // For inter-network ping, verify routing is set up
      if (interNetwork) {
        const router = topology.devices.find(d => d.type === 'router');
        if (!router) {
          return { passed: false, message: 'Aucun routeur trouve pour le routage inter-reseaux' };
        }
        
        // Check if router is connected to servers
        const routerConnected = servers.every(s =>
          topology.cables.some(cable =>
            (cable.fromDeviceId === router.id && cable.toDeviceId === s.id) ||
            (cable.toDeviceId === router.id && cable.fromDeviceId === s.id)
          )
        );
        
        if (!routerConnected) {
          return { passed: false, message: 'Le routeur doit etre connecte aux serveurs' };
        }
        
        // Check if router has multiple interfaces configured
        const configuredInterfaces = router.interfaces.filter(i => i.ipAddress);
        if (configuredInterfaces.length < 2) {
          return { passed: false, message: 'Le routeur doit avoir au moins 2 interfaces configurees' };
        }
      }
      
      // Check connectivity through cables
      const isConnected = checkFullConnectivity(topology);
      
      return {
        passed: isConnected,
        message: interNetwork ? 'Communication inter-reseaux verifiee' : 'Connectivite validee'
      };
    }
    
    case 'cable_exists': {
      const hasRequiredCables = topology.cables.length >= 
        ((rule.params.minCables as number) || 1);
      return {
        passed: hasRequiredCables,
        message: hasRequiredCables ? 'Cables connectes' : rule.errorMessage
      };
    }
    
    case 'all_connected': {
      const pcs = topology.devices.filter(d => d.type === 'pc');
      const switches = topology.devices.filter(d => d.type === 'switch');
      
      if (pcs.length === 0 || switches.length === 0) {
        return { passed: false, message: 'PC ou switch manquants' };
      }
      
      // Check if each PC is connected to at least one switch
      const allConnected = pcs.every(pc => {
        return topology.cables.some(cable =>
          (cable.fromDeviceId === pc.id && 
            topology.devices.find(d => d.id === cable.toDeviceId)?.type === 'switch') ||
          (cable.toDeviceId === pc.id && 
            topology.devices.find(d => d.id === cable.fromDeviceId)?.type === 'switch')
        );
      });
      
      return {
        passed: allConnected,
        message: allConnected ? 'Tous les PC connectes au switch' : rule.errorMessage
      };
    }
    
    case 'gateway_configured': {
      const gateway = rule.params.gateway as string;
      const pcs = topology.devices.filter(d => d.type === 'pc');
      
      const allConfigured = pcs.every(pc => 
        pc.interfaces.some(i => i.gateway === gateway)
      );
      
      return {
        passed: allConfigured,
        message: allConfigured ? `Tous les PC ont la passerelle ${gateway}` : rule.errorMessage
      };
    }
    
    case 'router_has_interfaces': {
      const requiredCount = rule.params.count as number;
      const router = topology.devices.find(d => d.type === 'router');
      
      if (!router) {
        return { passed: false, message: 'Aucun routeur trouve' };
      }
      
      const configuredInterfaces = router.interfaces.filter(i => i.ipAddress);
      const passed = configuredInterfaces.length >= requiredCount;
      
      return {
        passed,
        message: passed ? `Le routeur a ${configuredInterfaces.length} interfaces configurees` : rule.errorMessage
      };
    }
    
    case 'subnet_isolation': {
      const subnets = rule.params.subnets as string[];
      const pcs = topology.devices.filter(d => d.type === 'pc');
      
      if (pcs.length === 0) {
        return { passed: false, message: 'Aucun PC trouve' };
      }
      
      // Check if PCs are distributed across the specified subnets
      const subnetCounts: { [key: string]: number } = {};
      
      pcs.forEach(pc => {
        const ips = pc.interfaces
          .filter(i => i.ipAddress)
          .map(i => i.ipAddress);
        
        ips.forEach(ip => {
          const ipParts = ip?.split('.') || [];
          if (ipParts.length === 4) {
            const subnet = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.0/24`;
            subnetCounts[subnet] = (subnetCounts[subnet] || 0) + 1;
          }
        });
      });
      
      const usedSubnets = Object.keys(subnetCounts);
      const passed = usedSubnets.length === subnets.length;
      
      return {
        passed,
        message: passed ? 'Isolation de sous-reseaux verifiee' : rule.errorMessage
      };
    }

    case 'dhcp_configured': {
      const dhcpServer = topology.devices.find(d => d.type === 'dhcp-server');
      
      if (!dhcpServer) {
        return { passed: false, message: 'Aucun serveur DHCP trouve' };
      }
      
      const hasIP = dhcpServer.interfaces.some(i => i.ipAddress);
      const hasPool = dhcpServer.dhcpConfig?.poolStart && dhcpServer.dhcpConfig?.poolEnd;
      
      return {
        passed: hasIP && hasPool,
        message: hasIP && hasPool ? 'Serveur DHCP correctement configure' : rule.errorMessage
      };
    }
    
    default:
      return { passed: false, message: 'Regle de validation inconnue' };
  }
}

function checkFullConnectivity(topology: NetworkTopology): boolean {
  if (topology.devices.length === 0) return false;
  
  const visited = new Set<string>();
  const queue = [topology.devices[0].id];
  
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    
    for (const cable of topology.cables) {
      if (cable.fromDeviceId === currentId && !visited.has(cable.toDeviceId)) {
        queue.push(cable.toDeviceId);
      }
      if (cable.toDeviceId === currentId && !visited.has(cable.fromDeviceId)) {
        queue.push(cable.fromDeviceId);
      }
    }
  }
  
  return visited.size === topology.devices.length;
}

function calculatePath(
  from: NetworkDevice,
  to: NetworkDevice,
  topology: NetworkTopology
): { x: number; y: number }[] {
  // Simple path: direct line through intermediate devices
  const path: { x: number; y: number }[] = [];
  
  path.push({ x: from.x + 40, y: from.y + 40 });
  
  // Find intermediate devices (switches/routers)
  const intermediates = findPath(from.id, to.id, topology);
  for (const deviceId of intermediates) {
    const device = topology.devices.find(d => d.id === deviceId);
    if (device && device.id !== from.id && device.id !== to.id) {
      path.push({ x: device.x + 40, y: device.y + 40 });
    }
  }
  
  path.push({ x: to.x + 40, y: to.y + 40 });
  
  return path;
}

function findPath(fromId: string, toId: string, topology: NetworkTopology): string[] {
  const visited = new Set<string>();
  const queue: { id: string; path: string[] }[] = [{ id: fromId, path: [fromId] }];
  
  while (queue.length > 0) {
    const { id: currentId, path } = queue.shift()!;
    
    if (currentId === toId) return path;
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    
    for (const cable of topology.cables) {
      let nextId: string | null = null;
      if (cable.fromDeviceId === currentId) nextId = cable.toDeviceId;
      if (cable.toDeviceId === currentId) nextId = cable.fromDeviceId;
      
      if (nextId && !visited.has(nextId)) {
        queue.push({ id: nextId, path: [...path, nextId] });
      }
    }
  }
  
  return [];
}
