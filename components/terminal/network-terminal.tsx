'use client';

import React from "react"

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface NetworkTerminalProps {
  className?: string;
  initialHostname?: string;
  initialIp?: string;
}

interface CommandResult {
  output: string[];
  isError?: boolean;
}

const HELP_TEXT = `
Commandes disponibles:
  help                  - Affiche cette aide
  clear                 - Efface le terminal
  
  ipconfig              - Affiche la configuration IP (Windows)
  ip addr               - Affiche la configuration IP (Linux)
  ifconfig              - Affiche la configuration IP (Linux legacy)
  
  ping <ip>             - Envoie des paquets ICMP a une adresse
  tracert <ip>          - Trace la route vers une destination (Windows)
  traceroute <ip>       - Trace la route vers une destination (Linux)
  
  netstat               - Affiche les connexions reseau
  ss                    - Affiche les sockets (Linux moderne)
  
  nslookup <domain>     - Interroge le DNS
  dig <domain>          - Interroge le DNS (Linux)
  
  arp -a                - Affiche la table ARP
  route print           - Affiche la table de routage (Windows)
  ip route              - Affiche la table de routage (Linux)
  
  hostname              - Affiche le nom de l'hote
  whoami                - Affiche l'utilisateur courant
`;

// Simulated network configuration
const networkConfig = {
  hostname: 'PC-User',
  username: 'admin',
  interfaces: [
    {
      name: 'Ethernet0',
      linuxName: 'eth0',
      ip: '192.168.1.100',
      mask: '255.255.255.0',
      gateway: '192.168.1.1',
      mac: 'AA:BB:CC:DD:EE:01',
      status: 'UP',
    },
    {
      name: 'Loopback',
      linuxName: 'lo',
      ip: '127.0.0.1',
      mask: '255.0.0.0',
      gateway: '',
      mac: '00:00:00:00:00:00',
      status: 'UP',
    },
  ],
  dns: '192.168.1.1',
  arpTable: [
    { ip: '192.168.1.1', mac: 'AA:BB:CC:DD:EE:FF', type: 'dynamic' },
    { ip: '192.168.1.50', mac: '11:22:33:44:55:66', type: 'dynamic' },
  ],
  routeTable: [
    { destination: '0.0.0.0', mask: '0.0.0.0', gateway: '192.168.1.1', interface: 'Ethernet0', metric: '25' },
    { destination: '192.168.1.0', mask: '255.255.255.0', gateway: 'On-link', interface: 'Ethernet0', metric: '281' },
    { destination: '127.0.0.0', mask: '255.0.0.0', gateway: 'On-link', interface: 'Loopback', metric: '331' },
  ],
  dnsRecords: [
    { domain: 'google.com', ip: '142.250.185.78' },
    { domain: 'www.google.com', ip: '142.250.185.78' },
    { domain: 'example.com', ip: '93.184.216.34' },
    { domain: 'localhost', ip: '127.0.0.1' },
  ],
};

function simulatePing(target: string): string[] {
  const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(target);
  const targetIp = isIp ? target : networkConfig.dnsRecords.find(r => r.domain === target)?.ip || '0.0.0.0';
  
  if (!isIp && targetIp === '0.0.0.0') {
    return [`Impossible de trouver l'hote ${target}. Verifiez le nom et essayez a nouveau.`];
  }
  
  // Simulate ping responses
  const ttl = target.startsWith('192.168') ? 64 : (target.startsWith('10.') ? 128 : 56);
  const baseTime = target.startsWith('192.168') ? 1 : (target.startsWith('127') ? 0 : 15);
  
  const lines = [
    ``,
    `Envoi d'une requete 'Ping' ${targetIp} avec 32 octets de donnees :`,
  ];
  
  for (let i = 0; i < 4; i++) {
    const time = baseTime + Math.floor(Math.random() * 5);
    lines.push(`Reponse de ${targetIp} : octets=32 temps=${time}ms TTL=${ttl}`);
  }
  
  lines.push(``);
  lines.push(`Statistiques Ping pour ${targetIp}:`);
  lines.push(`    Paquets : envoyes = 4, recus = 4, perdus = 0 (perte 0%)`);
  lines.push(`Duree approximative des boucles en millisecondes :`);
  lines.push(`    Minimum = ${baseTime}ms, Maximum = ${baseTime + 4}ms, Moyenne = ${baseTime + 2}ms`);
  
  return lines;
}

function simulateTraceroute(target: string, isWindows: boolean): string[] {
  const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(target);
  const targetIp = isIp ? target : networkConfig.dnsRecords.find(r => r.domain === target)?.ip || '0.0.0.0';
  
  if (!isIp && targetIp === '0.0.0.0') {
    return [`Impossible de resoudre le nom de destination ${target}.`];
  }
  
  const isLocal = target.startsWith('192.168') || target.startsWith('127');
  const cmd = isWindows ? 'tracert' : 'traceroute';
  
  const lines = [
    ``,
    isWindows 
      ? `Determination de l'itineraire vers ${target} [${targetIp}]`
      : `traceroute to ${target} (${targetIp}), 30 hops max, 60 byte packets`,
    isWindows ? `avec un maximum de 30 sauts :` : ``,
    ``,
  ];
  
  if (isLocal) {
    lines.push(isWindows 
      ? `  1     1 ms     1 ms     1 ms  ${targetIp}`
      : ` 1  ${targetIp}  0.456 ms  0.412 ms  0.398 ms`
    );
  } else {
    lines.push(isWindows 
      ? `  1     1 ms     1 ms     1 ms  192.168.1.1`
      : ` 1  192.168.1.1  1.234 ms  1.198 ms  1.156 ms`
    );
    lines.push(isWindows 
      ? `  2    10 ms    12 ms    11 ms  10.0.0.1`
      : ` 2  10.0.0.1  12.456 ms  11.234 ms  10.987 ms`
    );
    lines.push(isWindows 
      ? `  3    15 ms    14 ms    16 ms  ${targetIp}`
      : ` 3  ${targetIp}  15.789 ms  14.567 ms  16.123 ms`
    );
  }
  
  lines.push(``);
  lines.push(isWindows ? `Itineraire determine.` : ``);
  
  return lines;
}

function executeCommand(input: string): CommandResult {
  const parts = input.trim().toLowerCase().split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);
  
  switch (cmd) {
    case 'help':
    case '?':
      return { output: HELP_TEXT.split('\n') };
      
    case 'clear':
    case 'cls':
      return { output: ['__CLEAR__'] };
      
    case 'hostname':
      return { output: [networkConfig.hostname] };
      
    case 'whoami':
      return { output: [`${networkConfig.hostname}\\${networkConfig.username}`] };
      
    case 'ipconfig':
      return {
        output: [
          ``,
          `Configuration IP de Windows`,
          ``,
          ...networkConfig.interfaces.flatMap(iface => [
            `Carte Ethernet ${iface.name} :`,
            ``,
            `   Suffixe DNS propre a la connexion. . . :`,
            `   Adresse IPv4. . . . . . . . . . . . . .: ${iface.ip}`,
            `   Masque de sous-reseau. . . . . . . . . : ${iface.mask}`,
            `   Passerelle par defaut. . . . . . . . . : ${iface.gateway || ''}`,
            ``,
          ]),
        ],
      };
      
    case 'ip':
      if (args[0] === 'addr' || args[0] === 'a') {
        return {
          output: [
            ...networkConfig.interfaces.flatMap((iface, idx) => [
              `${idx + 1}: ${iface.linuxName}: <BROADCAST,MULTICAST,${iface.status}> mtu 1500`,
              `    link/ether ${iface.mac.toLowerCase()} brd ff:ff:ff:ff:ff:ff`,
              `    inet ${iface.ip}/${iface.mask === '255.255.255.0' ? '24' : '8'} brd ${iface.ip.split('.').slice(0, 3).join('.')}.255 scope global ${iface.linuxName}`,
              ``,
            ]),
          ],
        };
      }
      if (args[0] === 'route') {
        return {
          output: [
            `default via 192.168.1.1 dev eth0 proto dhcp metric 100`,
            `192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100 metric 100`,
          ],
        };
      }
      return { output: [`Usage: ip addr | ip route`], isError: true };
      
    case 'ifconfig':
      return {
        output: [
          ...networkConfig.interfaces.flatMap(iface => [
            `${iface.linuxName}: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500`,
            `        inet ${iface.ip}  netmask ${iface.mask}  broadcast ${iface.ip.split('.').slice(0, 3).join('.')}.255`,
            `        ether ${iface.mac.toLowerCase()}  txqueuelen 1000  (Ethernet)`,
            `        RX packets 12345  bytes 12345678 (12.3 MB)`,
            `        TX packets 9876  bytes 9876543 (9.8 MB)`,
            ``,
          ]),
        ],
      };
      
    case 'ping':
      if (!args[0]) {
        return { output: [`Usage: ping <adresse_ip ou nom_hote>`], isError: true };
      }
      return { output: simulatePing(args[0]) };
      
    case 'tracert':
      if (!args[0]) {
        return { output: [`Usage: tracert <adresse_ip ou nom_hote>`], isError: true };
      }
      return { output: simulateTraceroute(args[0], true) };
      
    case 'traceroute':
      if (!args[0]) {
        return { output: [`Usage: traceroute <adresse_ip ou nom_hote>`], isError: true };
      }
      return { output: simulateTraceroute(args[0], false) };
      
    case 'netstat':
      return {
        output: [
          ``,
          `Connexions actives`,
          ``,
          `  Proto  Adresse locale         Adresse distante       Etat`,
          `  TCP    192.168.1.100:49152    142.250.185.78:443     ESTABLISHED`,
          `  TCP    192.168.1.100:49153    93.184.216.34:80       TIME_WAIT`,
          `  TCP    192.168.1.100:49154    192.168.1.1:53         CLOSE_WAIT`,
          `  UDP    192.168.1.100:68       *:*                    `,
          `  UDP    192.168.1.100:137      *:*                    `,
        ],
      };
      
    case 'ss':
      return {
        output: [
          `Netid  State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port`,
          `tcp    ESTAB   0       0       192.168.1.100:49152  142.250.185.78:443`,
          `tcp    TIME-WAIT 0     0       192.168.1.100:49153  93.184.216.34:80`,
          `udp    UNCONN  0       0       192.168.1.100:68     0.0.0.0:*`,
        ],
      };
      
    case 'arp':
      if (args[0] === '-a') {
        return {
          output: [
            ``,
            `Interface : 192.168.1.100 --- 0x2`,
            `  Adresse Internet      Adresse physique      Type`,
            ...networkConfig.arpTable.map(entry => 
              `  ${entry.ip.padEnd(20)} ${entry.mac.padEnd(20)} ${entry.type}`
            ),
          ],
        };
      }
      return { output: [`Usage: arp -a`], isError: true };
      
    case 'route':
      if (args[0] === 'print') {
        return {
          output: [
            `===========================================================================`,
            `Liste d'Interfaces`,
            `  2...aa bb cc dd ee 01 ......Ethernet0`,
            `  1...........................Loopback Pseudo-Interface 1`,
            `===========================================================================`,
            ``,
            `IPv4 Table de routage`,
            `===========================================================================`,
            `Itineraires actifs :`,
            `Destination reseau    Masque reseau   Adr. passerelle   Adr. interface Metrique`,
            ...networkConfig.routeTable.map(entry =>
              `${entry.destination.padEnd(20)} ${entry.mask.padEnd(16)} ${entry.gateway.padEnd(18)} ${entry.interface.padEnd(15)} ${entry.metric}`
            ),
            `===========================================================================`,
          ],
        };
      }
      return { output: [`Usage: route print`], isError: true };
      
    case 'nslookup':
      if (!args[0]) {
        return { output: [`Usage: nslookup <nom_de_domaine>`], isError: true };
      }
      const record = networkConfig.dnsRecords.find(r => r.domain === args[0]);
      if (record) {
        return {
          output: [
            `Serveur :   dns.local`,
            `Address:  ${networkConfig.dns}`,
            ``,
            `Nom :    ${record.domain}`,
            `Address:  ${record.ip}`,
          ],
        };
      }
      return { 
        output: [
          `Serveur :   dns.local`,
          `Address:  ${networkConfig.dns}`,
          ``,
          `*** dns.local ne parvient pas a trouver ${args[0]} : Non-existent domain`,
        ],
        isError: true,
      };
      
    case 'dig':
      if (!args[0]) {
        return { output: [`Usage: dig <nom_de_domaine>`], isError: true };
      }
      const digRecord = networkConfig.dnsRecords.find(r => r.domain === args[0]);
      if (digRecord) {
        return {
          output: [
            `; <<>> DiG 9.16.1 <<>> ${args[0]}`,
            `;; global options: +cmd`,
            `;; Got answer:`,
            `;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 12345`,
            ``,
            `;; ANSWER SECTION:`,
            `${digRecord.domain}.      300     IN      A       ${digRecord.ip}`,
            ``,
            `;; Query time: 23 msec`,
            `;; SERVER: ${networkConfig.dns}#53(${networkConfig.dns})`,
          ],
        };
      }
      return {
        output: [
          `; <<>> DiG 9.16.1 <<>> ${args[0]}`,
          `;; Got answer:`,
          `;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 12345`,
        ],
        isError: true,
      };
      
    case '':
      return { output: [] };
      
    default:
      return {
        output: [`'${cmd}' n'est pas reconnu comme une commande. Tapez 'help' pour la liste des commandes.`],
        isError: true,
      };
  }
}

export function NetworkTerminal({ className, initialHostname = 'PC-User' }: NetworkTerminalProps) {
  const [history, setHistory] = useState<{ type: 'input' | 'output'; content: string; isError?: boolean }[]>([
    { type: 'output', content: 'Terminal Reseau - Simulateur de commandes' },
    { type: 'output', content: 'Tapez "help" pour afficher les commandes disponibles.' },
    { type: 'output', content: '' },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const hostname = initialHostname || networkConfig.hostname;
  const prompt = `${hostname}> `;
  
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const input = currentInput.trim();
    
    // Add input to history display
    setHistory(prev => [...prev, { type: 'input', content: `${prompt}${input}` }]);
    
    // Execute command
    const result = executeCommand(input);
    
    if (result.output[0] === '__CLEAR__') {
      setHistory([
        { type: 'output', content: 'Terminal Reseau - Simulateur de commandes' },
        { type: 'output', content: '' },
      ]);
    } else {
      setHistory(prev => [
        ...prev,
        ...result.output.map(line => ({ 
          type: 'output' as const, 
          content: line,
          isError: result.isError,
        })),
      ]);
    }
    
    // Add to command history
    if (input) {
      setCommandHistory(prev => [...prev, input]);
    }
    setHistoryIndex(-1);
    setCurrentInput('');
  }, [currentInput, prompt]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    }
  };
  
  const focusInput = () => {
    inputRef.current?.focus();
  };
  
  return (
    <div
      ref={containerRef}
      onClick={focusInput}
      className={cn(
        'bg-[#0c0c0c] text-green-400 font-mono text-sm p-4 rounded-lg overflow-auto cursor-text',
        className
      )}
    >
      {history.map((entry, i) => (
        <div
          key={i}
          className={cn(
            'whitespace-pre-wrap',
            entry.type === 'input' && 'text-white',
            entry.isError && 'text-red-400'
          )}
        >
          {entry.content}
        </div>
      ))}
      
      <form onSubmit={handleSubmit} className="flex items-center">
        <span className="text-white">{prompt}</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-white caret-white"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </form>
    </div>
  );
}
