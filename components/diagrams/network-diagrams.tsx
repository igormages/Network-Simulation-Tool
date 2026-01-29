'use client';

import { cn } from '@/lib/utils';

interface DiagramProps {
  className?: string;
}

// OSI Model Diagram
export function OSIModelDiagram({ className }: DiagramProps) {
  const layers = [
    { num: 7, name: 'Application', color: '#ef4444', examples: 'HTTP, FTP, SMTP, DNS' },
    { num: 6, name: 'Presentation', color: '#f97316', examples: 'SSL/TLS, JPEG, ASCII' },
    { num: 5, name: 'Session', color: '#eab308', examples: 'NetBIOS, RPC' },
    { num: 4, name: 'Transport', color: '#22c55e', examples: 'TCP, UDP' },
    { num: 3, name: 'Network', color: '#06b6d4', examples: 'IP, ICMP, ARP' },
    { num: 2, name: 'Data Link', color: '#3b82f6', examples: 'Ethernet, Wi-Fi, MAC' },
    { num: 1, name: 'Physical', color: '#8b5cf6', examples: 'Cables, Signaux' },
  ];

  return (
    <div className={cn('p-4', className)}>
      <svg viewBox="0 0 500 350" className="w-full h-auto">
        {/* Title */}
        <text x="250" y="25" textAnchor="middle" className="fill-foreground text-sm font-bold">
          Modele OSI - 7 Couches
        </text>
        
        {/* Layers */}
        {layers.map((layer, i) => {
          const y = 40 + i * 42;
          return (
            <g key={layer.num}>
              {/* Layer box */}
              <rect
                x="50"
                y={y}
                width="400"
                height="38"
                rx="4"
                fill={layer.color}
                opacity="0.2"
                stroke={layer.color}
                strokeWidth="2"
              />
              {/* Layer number */}
              <circle
                cx="80"
                cy={y + 19}
                r="14"
                fill={layer.color}
              />
              <text x="80" y={y + 24} textAnchor="middle" className="fill-white text-xs font-bold">
                {layer.num}
              </text>
              {/* Layer name */}
              <text x="110" y={y + 24} className="fill-foreground text-sm font-medium">
                {layer.name}
              </text>
              {/* Examples */}
              <text x="440" y={y + 24} textAnchor="end" className="fill-muted-foreground text-xs">
                {layer.examples}
              </text>
            </g>
          );
        })}
        
        {/* Arrows */}
        <g className="fill-muted-foreground">
          <path d="M 470 80 L 480 150 L 470 220" fill="none" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)"/>
          <text x="490" y="155" className="text-xs" fill="currentColor">Encapsulation</text>
          
          <path d="M 30 220 L 20 150 L 30 80" fill="none" stroke="currentColor" strokeWidth="2"/>
          <text x="10" y="155" className="text-xs" fill="currentColor" transform="rotate(-90, 10, 155)">Decapsulation</text>
        </g>
      </svg>
    </div>
  );
}

// TCP/IP Model Diagram with comparison to OSI
export function TCPIPModelDiagram({ className }: DiagramProps) {
  return (
    <div className={cn('p-4', className)}>
      <svg viewBox="0 0 600 300" className="w-full h-auto">
        <text x="300" y="25" textAnchor="middle" className="fill-foreground text-sm font-bold">
          Comparaison OSI vs TCP/IP
        </text>
        
        {/* OSI Side */}
        <text x="120" y="50" textAnchor="middle" className="fill-muted-foreground text-xs">OSI (7 couches)</text>
        
        {/* TCP/IP Side */}
        <text x="480" y="50" textAnchor="middle" className="fill-muted-foreground text-xs">TCP/IP (4 couches)</text>
        
        {/* OSI Layers */}
        {[
          { name: 'Application', color: '#ef4444' },
          { name: 'Presentation', color: '#f97316' },
          { name: 'Session', color: '#eab308' },
          { name: 'Transport', color: '#22c55e' },
          { name: 'Network', color: '#06b6d4' },
          { name: 'Data Link', color: '#3b82f6' },
          { name: 'Physical', color: '#8b5cf6' },
        ].map((layer, i) => (
          <g key={layer.name}>
            <rect x="30" y={65 + i * 32} width="180" height="28" rx="3" fill={layer.color} opacity="0.2" stroke={layer.color} strokeWidth="1.5"/>
            <text x="120" y={84 + i * 32} textAnchor="middle" className="fill-foreground text-xs">{layer.name}</text>
          </g>
        ))}
        
        {/* TCP/IP Layers */}
        {[
          { name: 'Application', color: '#ef4444', height: 92, y: 65, osiLayers: '5-6-7' },
          { name: 'Transport', color: '#22c55e', height: 28, y: 161, osiLayers: '4' },
          { name: 'Internet', color: '#06b6d4', height: 28, y: 193, osiLayers: '3' },
          { name: 'Network Access', color: '#3b82f6', height: 60, y: 225, osiLayers: '1-2' },
        ].map((layer) => (
          <g key={layer.name}>
            <rect x="390" y={layer.y} width="180" height={layer.height} rx="3" fill={layer.color} opacity="0.2" stroke={layer.color} strokeWidth="1.5"/>
            <text x="480" y={layer.y + layer.height / 2 + 5} textAnchor="middle" className="fill-foreground text-xs">{layer.name}</text>
          </g>
        ))}
        
        {/* Connection lines */}
        <g stroke="#666" strokeWidth="1" strokeDasharray="4">
          <line x1="210" y1="79" x2="390" y2="111"/>
          <line x1="210" y1="111" x2="390" y2="111"/>
          <line x1="210" y1="143" x2="390" y2="111"/>
          <line x1="210" y1="175" x2="390" y2="175"/>
          <line x1="210" y1="207" x2="390" y2="207"/>
          <line x1="210" y1="239" x2="390" y2="255"/>
          <line x1="210" y1="271" x2="390" y2="255"/>
        </g>
      </svg>
    </div>
  );
}

// Star Topology Diagram
export function StarTopologyDiagram({ className }: DiagramProps) {
  const devices = [
    { x: 200, y: 50, label: 'PC1' },
    { x: 350, y: 100, label: 'PC2' },
    { x: 350, y: 200, label: 'PC3' },
    { x: 200, y: 250, label: 'PC4' },
    { x: 50, y: 200, label: 'PC5' },
    { x: 50, y: 100, label: 'PC6' },
  ];
  const center = { x: 200, y: 150 };

  return (
    <div className={cn('p-4', className)}>
      <svg viewBox="0 0 400 320" className="w-full h-auto">
        <text x="200" y="20" textAnchor="middle" className="fill-foreground text-sm font-bold">
          Topologie en Etoile
        </text>
        
        {/* Connection lines */}
        {devices.map((device, i) => (
          <line
            key={i}
            x1={center.x}
            y1={center.y}
            x2={device.x}
            y2={device.y}
            stroke="#3b82f6"
            strokeWidth="2"
          />
        ))}
        
        {/* Central switch */}
        <rect x={center.x - 30} y={center.y - 20} width="60" height="40" rx="4" fill="#22c55e" opacity="0.3" stroke="#22c55e" strokeWidth="2"/>
        <text x={center.x} y={center.y + 5} textAnchor="middle" className="fill-foreground text-xs font-medium">Switch</text>
        
        {/* Devices */}
        {devices.map((device, i) => (
          <g key={i}>
            <rect x={device.x - 25} y={device.y - 15} width="50" height="30" rx="3" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" strokeWidth="1.5"/>
            <text x={device.x} y={device.y + 5} textAnchor="middle" className="fill-foreground text-xs">{device.label}</text>
          </g>
        ))}
        
        {/* Legend */}
        <g transform="translate(20, 290)">
          <rect width="12" height="12" fill="#22c55e" opacity="0.3" stroke="#22c55e"/>
          <text x="18" y="10" className="fill-muted-foreground text-xs">Point central (Switch/Hub)</text>
          <rect x="180" width="12" height="12" fill="#3b82f6" opacity="0.2" stroke="#3b82f6"/>
          <text x="198" y="10" className="fill-muted-foreground text-xs">Equipements terminaux</text>
        </g>
      </svg>
    </div>
  );
}

// Bus Topology Diagram
export function BusTopologyDiagram({ className }: DiagramProps) {
  const devices = [
    { x: 60, y: 100, label: 'PC1' },
    { x: 140, y: 100, label: 'PC2' },
    { x: 220, y: 100, label: 'PC3' },
    { x: 300, y: 100, label: 'PC4' },
    { x: 380, y: 100, label: 'PC5' },
  ];

  return (
    <div className={cn('p-4', className)}>
      <svg viewBox="0 0 450 180" className="w-full h-auto">
        <text x="225" y="20" textAnchor="middle" className="fill-foreground text-sm font-bold">
          Topologie en Bus
        </text>
        
        {/* Main bus line */}
        <line x1="30" y1="70" x2="420" y2="70" stroke="#f97316" strokeWidth="4"/>
        
        {/* Terminators */}
        <rect x="20" y="60" width="10" height="20" fill="#ef4444"/>
        <rect x="420" y="60" width="10" height="20" fill="#ef4444"/>
        
        {/* Drop cables and devices */}
        {devices.map((device, i) => (
          <g key={i}>
            <line x1={device.x} y1="70" x2={device.x} y2={device.y - 20} stroke="#3b82f6" strokeWidth="2"/>
            <rect x={device.x - 25} y={device.y - 15} width="50" height="30" rx="3" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" strokeWidth="1.5"/>
            <text x={device.x} y={device.y + 5} textAnchor="middle" className="fill-foreground text-xs">{device.label}</text>
          </g>
        ))}
        
        {/* Legend */}
        <g transform="translate(20, 150)">
          <line x1="0" y1="6" x2="30" y2="6" stroke="#f97316" strokeWidth="3"/>
          <text x="40" y="10" className="fill-muted-foreground text-xs">Bus principal (cable coaxial)</text>
          <rect x="220" y="0" width="12" height="12" fill="#ef4444"/>
          <text x="238" y="10" className="fill-muted-foreground text-xs">Terminateur</text>
        </g>
      </svg>
    </div>
  );
}

// Ring Topology Diagram
export function RingTopologyDiagram({ className }: DiagramProps) {
  const radius = 80;
  const centerX = 200;
  const centerY = 130;
  const deviceCount = 6;
  
  const devices = Array.from({ length: deviceCount }, (_, i) => {
    const angle = (i * 2 * Math.PI) / deviceCount - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      label: `PC${i + 1}`,
    };
  });

  return (
    <div className={cn('p-4', className)}>
      <svg viewBox="0 0 400 280" className="w-full h-auto">
        <text x="200" y="20" textAnchor="middle" className="fill-foreground text-sm font-bold">
          Topologie en Anneau
        </text>
        
        {/* Ring connections */}
        {devices.map((device, i) => {
          const next = devices[(i + 1) % deviceCount];
          return (
            <line
              key={i}
              x1={device.x}
              y1={device.y}
              x2={next.x}
              y2={next.y}
              stroke="#8b5cf6"
              strokeWidth="2"
            />
          );
        })}
        
        {/* Arrow showing direction */}
        <path
          d={`M ${centerX + 50} ${centerY - 90} A 90 90 0 0 1 ${centerX + 90} ${centerY - 50}`}
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          markerEnd="url(#arrowGreen)"
        />
        <defs>
          <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#22c55e"/>
          </marker>
        </defs>
        <text x={centerX + 95} y={centerY - 70} className="fill-green-500 text-xs">Token</text>
        
        {/* Devices */}
        {devices.map((device, i) => (
          <g key={i}>
            <circle cx={device.x} cy={device.y} r="22" fill="#8b5cf6" opacity="0.2" stroke="#8b5cf6" strokeWidth="1.5"/>
            <text x={device.x} y={device.y + 4} textAnchor="middle" className="fill-foreground text-xs">{device.label}</text>
          </g>
        ))}
        
        {/* Legend */}
        <g transform="translate(50, 250)">
          <text x="0" y="10" className="fill-muted-foreground text-xs">Le jeton (token) circule dans un seul sens</text>
          <text x="0" y="25" className="fill-muted-foreground text-xs">Seul le possesseur du jeton peut emettre</text>
        </g>
      </svg>
    </div>
  );
}

// Mesh Topology Diagram
export function MeshTopologyDiagram({ className }: DiagramProps) {
  const devices = [
    { x: 100, y: 60, label: 'R1' },
    { x: 300, y: 60, label: 'R2' },
    { x: 50, y: 160, label: 'R3' },
    { x: 200, y: 160, label: 'R4' },
    { x: 350, y: 160, label: 'R5' },
  ];

  return (
    <div className={cn('p-4', className)}>
      <svg viewBox="0 0 400 240" className="w-full h-auto">
        <text x="200" y="20" textAnchor="middle" className="fill-foreground text-sm font-bold">
          Topologie Maillee
        </text>
        
        {/* All connections (mesh) */}
        {devices.map((d1, i) =>
          devices.slice(i + 1).map((d2, j) => (
            <line
              key={`${i}-${j}`}
              x1={d1.x}
              y1={d1.y}
              x2={d2.x}
              y2={d2.y}
              stroke="#06b6d4"
              strokeWidth="1.5"
              opacity="0.6"
            />
          ))
        )}
        
        {/* Devices (routers) */}
        {devices.map((device, i) => (
          <g key={i}>
            <rect x={device.x - 20} y={device.y - 15} width="40" height="30" rx="3" fill="#06b6d4" opacity="0.2" stroke="#06b6d4" strokeWidth="1.5"/>
            <text x={device.x} y={device.y + 5} textAnchor="middle" className="fill-foreground text-xs font-medium">{device.label}</text>
          </g>
        ))}
        
        {/* Legend */}
        <g transform="translate(20, 210)">
          <text x="0" y="10" className="fill-muted-foreground text-xs">Chaque noeud est connecte a tous les autres</text>
          <text x="0" y="25" className="fill-muted-foreground text-xs">Haute redondance, cout eleve</text>
        </g>
      </svg>
    </div>
  );
}

// IP Classes Diagram
export function IPClassesDiagram({ className }: DiagramProps) {
  const classes = [
    { class: 'A', range: '0.0.0.0 - 127.255.255.255', mask: '/8', networks: '128', hosts: '16 millions', color: '#ef4444' },
    { class: 'B', range: '128.0.0.0 - 191.255.255.255', mask: '/16', networks: '16 384', hosts: '65 534', color: '#f97316' },
    { class: 'C', range: '192.0.0.0 - 223.255.255.255', mask: '/24', networks: '2 millions', hosts: '254', color: '#22c55e' },
    { class: 'D', range: '224.0.0.0 - 239.255.255.255', mask: '-', networks: '-', hosts: 'Multicast', color: '#3b82f6' },
    { class: 'E', range: '240.0.0.0 - 255.255.255.255', mask: '-', networks: '-', hosts: 'Reserve', color: '#8b5cf6' },
  ];

  return (
    <div className={cn('p-4', className)}>
      <svg viewBox="0 0 600 280" className="w-full h-auto">
        <text x="300" y="25" textAnchor="middle" className="fill-foreground text-sm font-bold">
          Classes d'adresses IPv4
        </text>
        
        {/* Header */}
        <g className="fill-muted-foreground text-xs">
          <text x="50" y="55">Classe</text>
          <text x="120" y="55">Plage d'adresses</text>
          <text x="320" y="55">Masque</text>
          <text x="390" y="55">Reseaux</text>
          <text x="490" y="55">Hotes/reseau</text>
        </g>
        <line x1="30" y1="65" x2="570" y2="65" stroke="#444" strokeWidth="1"/>
        
        {/* Rows */}
        {classes.map((c, i) => {
          const y = 90 + i * 36;
          return (
            <g key={c.class}>
              <rect x="30" y={y - 15} width="540" height="32" rx="3" fill={c.color} opacity="0.1"/>
              <circle cx="50" cy={y} r="12" fill={c.color}/>
              <text x="50" y={y + 4} textAnchor="middle" className="fill-white text-xs font-bold">{c.class}</text>
              <text x="120" y={y + 4} className="fill-foreground text-xs">{c.range}</text>
              <text x="320" y={y + 4} className="fill-foreground text-xs">{c.mask}</text>
              <text x="390" y={y + 4} className="fill-foreground text-xs">{c.networks}</text>
              <text x="490" y={y + 4} className="fill-foreground text-xs">{c.hosts}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// DHCP Process Diagram (DORA)
export function DHCPProcessDiagram({ className }: DiagramProps) {
  return (
    <div className={cn('p-4', className)}>
      <svg viewBox="0 0 500 320" className="w-full h-auto">
        <text x="250" y="25" textAnchor="middle" className="fill-foreground text-sm font-bold">
          Processus DHCP (DORA)
        </text>
        
        {/* Client and Server */}
        <g>
          <rect x="50" y="50" width="80" height="40" rx="4" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" strokeWidth="2"/>
          <text x="90" y="75" textAnchor="middle" className="fill-foreground text-xs">Client</text>
          
          <rect x="370" y="50" width="80" height="40" rx="4" fill="#22c55e" opacity="0.2" stroke="#22c55e" strokeWidth="2"/>
          <text x="410" y="75" textAnchor="middle" className="fill-foreground text-xs">Serveur DHCP</text>
        </g>
        
        {/* Timeline */}
        <line x1="90" y1="100" x2="90" y2="300" stroke="#666" strokeWidth="2"/>
        <line x1="410" y1="100" x2="410" y2="300" stroke="#666" strokeWidth="2"/>
        
        {/* DORA Steps */}
        {[
          { y: 130, label: 'DISCOVER', desc: 'Broadcast', color: '#ef4444', dir: 'right' },
          { y: 180, label: 'OFFER', desc: 'IP proposee', color: '#f97316', dir: 'left' },
          { y: 230, label: 'REQUEST', desc: 'Acceptation', color: '#22c55e', dir: 'right' },
          { y: 280, label: 'ACK', desc: 'Confirmation', color: '#3b82f6', dir: 'left' },
        ].map((step, i) => (
          <g key={i}>
            <line
              x1={step.dir === 'right' ? 95 : 405}
              y1={step.y}
              x2={step.dir === 'right' ? 405 : 95}
              y2={step.y}
              stroke={step.color}
              strokeWidth="2"
              markerEnd={`url(#arrow${i})`}
            />
            <defs>
              <marker id={`arrow${i}`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <path d="M0,0 L0,6 L9,3 z" fill={step.color}/>
              </marker>
            </defs>
            <rect x="200" y={step.y - 12} width="100" height="24" rx="3" fill={step.color} opacity="0.2" stroke={step.color}/>
            <text x="250" y={step.y + 4} textAnchor="middle" className="fill-foreground text-xs font-medium">{step.label}</text>
            <text x="250" y={step.y + 18} textAnchor="middle" className="fill-muted-foreground text-[10px]">{step.desc}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// Encapsulation Diagram
export function EncapsulationDiagram({ className }: DiagramProps) {
  return (
    <div className={cn('p-4', className)}>
      <svg viewBox="0 0 550 250" className="w-full h-auto">
        <text x="275" y="25" textAnchor="middle" className="fill-foreground text-sm font-bold">
          Encapsulation des donnees
        </text>
        
        {/* Layers with encapsulation */}
        {[
          { y: 50, layer: 'Application', data: 'Donnees', width: 100, color: '#ef4444' },
          { y: 90, layer: 'Transport', data: 'Segment', header: 'TCP/UDP', width: 150, color: '#22c55e' },
          { y: 130, layer: 'Network', data: 'Paquet', header: 'IP', width: 200, color: '#06b6d4' },
          { y: 170, layer: 'Data Link', data: 'Trame', header: 'MAC', trailer: 'FCS', width: 280, color: '#3b82f6' },
          { y: 210, layer: 'Physical', data: 'Bits', width: 320, color: '#8b5cf6' },
        ].map((item, i) => {
          const startX = 275 - item.width / 2;
          return (
            <g key={i}>
              {/* Layer label */}
              <text x="50" y={item.y + 18} className="fill-muted-foreground text-xs">{item.layer}</text>
              
              {/* Encapsulated unit */}
              <rect x={startX} y={item.y} width={item.width} height="30" rx="3" fill={item.color} opacity="0.2" stroke={item.color} strokeWidth="1.5"/>
              
              {item.header && (
                <rect x={startX} y={item.y} width="40" height="30" rx="3" fill={item.color} opacity="0.5"/>
              )}
              {item.trailer && (
                <rect x={startX + item.width - 30} y={item.y} width="30" height="30" rx="3" fill={item.color} opacity="0.5"/>
              )}
              
              <text x="275" y={item.y + 18} textAnchor="middle" className="fill-foreground text-xs">{item.data}</text>
              
              {/* Arrow */}
              {i < 4 && (
                <path d={`M 275 ${item.y + 32} L 275 ${item.y + 48}`} stroke="#666" strokeWidth="1.5" markerEnd="url(#arrowDown)"/>
              )}
            </g>
          );
        })}
        
        <defs>
          <marker id="arrowDown" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#666"/>
          </marker>
        </defs>
      </svg>
    </div>
  );
}

// Network Commands Cheat Sheet
export function NetworkCommandsDiagram({ className }: DiagramProps) {
  const commands = [
    { win: 'ipconfig', linux: 'ip addr / ifconfig', desc: 'Configuration IP' },
    { win: 'ipconfig /all', linux: 'ip addr show', desc: 'Details complets' },
    { win: 'ping', linux: 'ping', desc: 'Test connectivite' },
    { win: 'tracert', linux: 'traceroute', desc: 'Trace route' },
    { win: 'netstat', linux: 'ss / netstat', desc: 'Connexions actives' },
    { win: 'nslookup', linux: 'dig / nslookup', desc: 'Requete DNS' },
    { win: 'arp -a', linux: 'arp -a / ip neigh', desc: 'Table ARP' },
    { win: 'route print', linux: 'ip route', desc: 'Table routage' },
  ];

  return (
    <div className={cn('p-4', className)}>
      <svg viewBox="0 0 550 340" className="w-full h-auto">
        <text x="275" y="25" textAnchor="middle" className="fill-foreground text-sm font-bold">
          Commandes Reseau - Windows vs Linux
        </text>
        
        {/* Headers */}
        <rect x="30" y="45" width="140" height="25" rx="3" fill="#3b82f6" opacity="0.3"/>
        <text x="100" y="62" textAnchor="middle" className="fill-foreground text-xs font-medium">Windows</text>
        
        <rect x="180" y="45" width="140" height="25" rx="3" fill="#22c55e" opacity="0.3"/>
        <text x="250" y="62" textAnchor="middle" className="fill-foreground text-xs font-medium">Linux</text>
        
        <rect x="330" y="45" width="190" height="25" rx="3" fill="#8b5cf6" opacity="0.3"/>
        <text x="425" y="62" textAnchor="middle" className="fill-foreground text-xs font-medium">Description</text>
        
        {/* Rows */}
        {commands.map((cmd, i) => {
          const y = 85 + i * 30;
          return (
            <g key={i}>
              <rect x="30" y={y} width="490" height="26" rx="2" fill={i % 2 === 0 ? '#ffffff08' : 'transparent'}/>
              <text x="100" y={y + 17} textAnchor="middle" className="fill-blue-400 text-xs font-mono">{cmd.win}</text>
              <text x="250" y={y + 17} textAnchor="middle" className="fill-green-400 text-xs font-mono">{cmd.linux}</text>
              <text x="425" y={y + 17} textAnchor="middle" className="fill-muted-foreground text-xs">{cmd.desc}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
