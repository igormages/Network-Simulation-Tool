'use client';

import type { DeviceType } from '@/lib/network-types';

interface DeviceIconProps {
  type: DeviceType;
  className?: string;
  size?: number;
}

export function DeviceIcon({ type, className = '', size = 48 }: DeviceIconProps) {
  const iconProps = {
    width: size,
    height: size,
    className,
    viewBox: '0 0 48 48',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg'
  };

  switch (type) {
    case 'router':
      return (
        <svg {...iconProps}>
          <rect x="4" y="16" width="40" height="16" rx="2" fill="currentColor" className="text-primary" />
          <circle cx="12" cy="24" r="2" fill="currentColor" className="text-primary-foreground" />
          <circle cx="20" cy="24" r="2" fill="currentColor" className="text-primary-foreground" />
          <circle cx="28" cy="24" r="2" fill="currentColor" className="text-primary-foreground" />
          <circle cx="36" cy="24" r="2" fill="currentColor" className="text-primary-foreground" />
          <path d="M8 16V12H16V16" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
          <path d="M32 16V12H40V16" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
          <path d="M20 32V36H28V32" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
        </svg>
      );

    case 'switch':
      return (
        <svg {...iconProps}>
          <rect x="4" y="18" width="40" height="12" rx="2" fill="currentColor" className="text-accent" />
          <rect x="8" y="22" width="4" height="4" rx="1" fill="currentColor" className="text-accent-foreground" />
          <rect x="14" y="22" width="4" height="4" rx="1" fill="currentColor" className="text-accent-foreground" />
          <rect x="20" y="22" width="4" height="4" rx="1" fill="currentColor" className="text-accent-foreground" />
          <rect x="26" y="22" width="4" height="4" rx="1" fill="currentColor" className="text-accent-foreground" />
          <rect x="32" y="22" width="4" height="4" rx="1" fill="currentColor" className="text-accent-foreground" />
          <rect x="38" y="22" width="4" height="4" rx="1" fill="currentColor" className="text-accent-foreground" />
        </svg>
      );

    case 'server':
      return (
        <svg {...iconProps}>
          <rect x="10" y="4" width="28" height="40" rx="2" fill="currentColor" className="text-secondary" />
          <rect x="14" y="8" width="20" height="4" rx="1" fill="currentColor" className="text-muted-foreground" />
          <rect x="14" y="16" width="20" height="4" rx="1" fill="currentColor" className="text-muted-foreground" />
          <rect x="14" y="24" width="20" height="4" rx="1" fill="currentColor" className="text-muted-foreground" />
          <circle cx="32" cy="10" r="1.5" fill="currentColor" className="text-success" />
          <circle cx="32" cy="18" r="1.5" fill="currentColor" className="text-success" />
          <circle cx="32" cy="26" r="1.5" fill="currentColor" className="text-success" />
          <rect x="18" y="36" width="12" height="4" rx="1" fill="currentColor" className="text-muted-foreground" />
        </svg>
      );

    case 'pc':
      return (
        <svg {...iconProps}>
          <rect x="8" y="8" width="32" height="24" rx="2" fill="currentColor" className="text-secondary" />
          <rect x="12" y="12" width="24" height="16" rx="1" fill="currentColor" className="text-primary" />
          <rect x="20" y="32" width="8" height="4" fill="currentColor" className="text-muted-foreground" />
          <rect x="14" y="36" width="20" height="4" rx="1" fill="currentColor" className="text-muted-foreground" />
        </svg>
      );

    case 'dhcp-server':
      return (
        <svg {...iconProps}>
          <rect x="10" y="4" width="28" height="40" rx="2" fill="currentColor" className="text-chart-2" />
          <rect x="14" y="8" width="20" height="4" rx="1" fill="currentColor" className="text-muted-foreground" />
          <rect x="14" y="16" width="20" height="4" rx="1" fill="currentColor" className="text-muted-foreground" />
          <circle cx="32" cy="10" r="1.5" fill="currentColor" className="text-warning" />
          <circle cx="32" cy="18" r="1.5" fill="currentColor" className="text-success" />
          <text x="24" y="32" textAnchor="middle" fill="currentColor" className="text-secondary-foreground" fontSize="8" fontWeight="bold">DHCP</text>
        </svg>
      );

    case 'dns-server':
      return (
        <svg {...iconProps}>
          <rect x="10" y="4" width="28" height="40" rx="2" fill="currentColor" className="text-chart-3" />
          <rect x="14" y="8" width="20" height="4" rx="1" fill="currentColor" className="text-muted-foreground" />
          <rect x="14" y="16" width="20" height="4" rx="1" fill="currentColor" className="text-muted-foreground" />
          <circle cx="32" cy="10" r="1.5" fill="currentColor" className="text-success" />
          <circle cx="32" cy="18" r="1.5" fill="currentColor" className="text-success" />
          <text x="24" y="32" textAnchor="middle" fill="currentColor" className="text-secondary-foreground" fontSize="8" fontWeight="bold">DNS</text>
        </svg>
      );

    default:
      return null;
  }
}

export const deviceLabels: Record<DeviceType, string> = {
  router: 'Routeur',
  switch: 'Switch',
  server: 'Serveur',
  pc: 'Poste Client',
  'dhcp-server': 'Serveur DHCP',
  'dns-server': 'Serveur DNS'
};

export const deviceDescriptions: Record<DeviceType, string> = {
  router: 'Interconnecte les reseaux et route les paquets IP',
  switch: 'Commutateur de niveau 2 pour connecter les appareils',
  server: 'Serveur generique pour heberger des services',
  pc: 'Poste de travail client',
  'dhcp-server': 'Attribue automatiquement les adresses IP',
  'dns-server': 'Resout les noms de domaine en adresses IP'
};
