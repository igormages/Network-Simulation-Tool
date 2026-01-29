export type DeviceType = 'router' | 'switch' | 'server' | 'pc' | 'dhcp-server' | 'dns-server';

export interface NetworkInterface {
  id: string;
  name: string;
  ipAddress: string;
  subnetMask: string;
  gateway: string;
  dhcpEnabled: boolean;
  macAddress: string;
  connected: boolean;
  connectedTo?: string;
}

export interface DHCPConfig {
  enabled: boolean;
  poolStart: string;
  poolEnd: string;
  subnetMask: string;
  gateway: string;
  dnsServer: string;
  leaseTime: number;
  leases: DHCPLease[];
}

export interface DHCPLease {
  macAddress: string;
  ipAddress: string;
  hostname: string;
  expiresAt: Date;
}

export interface DNSRecord {
  hostname: string;
  ipAddress: string;
  type: 'A' | 'CNAME' | 'MX' | 'PTR';
}

export interface DNSConfig {
  enabled: boolean;
  records: DNSRecord[];
}

export interface RoutingEntry {
  network: string;
  mask: string;
  gateway: string;
  interface: string;
  metric: number;
}

export interface NetworkDevice {
  id: string;
  type: DeviceType;
  name: string;
  x: number;
  y: number;
  interfaces: NetworkInterface[];
  dhcpConfig?: DHCPConfig;
  dnsConfig?: DNSConfig;
  routingTable?: RoutingEntry[];
  vlanId?: number;
  hostname: string;
  status: 'online' | 'offline' | 'error';
}

export interface Cable {
  id: string;
  fromDeviceId: string;
  fromInterfaceId: string;
  toDeviceId: string;
  toInterfaceId: string;
  type: 'ethernet' | 'fiber' | 'serial';
  status: 'connected' | 'disconnected' | 'error';
}

export interface NetworkTopology {
  devices: NetworkDevice[];
  cables: Cable[];
}

export interface SimulationPacket {
  id: string;
  sourceIP: string;
  destIP: string;
  sourceMac: string;
  destMac: string;
  protocol: 'ICMP' | 'TCP' | 'UDP' | 'ARP' | 'DHCP' | 'DNS';
  ttl: number;
  data: string;
  status: 'success' | 'failed' | 'pending';
  path: string[];
}

// Helper functions
export function generateMacAddress(): string {
  const hex = '0123456789ABCDEF';
  let mac = '';
  for (let i = 0; i < 6; i++) {
    mac += hex.charAt(Math.floor(Math.random() * 16));
    mac += hex.charAt(Math.floor(Math.random() * 16));
    if (i < 5) mac += ':';
  }
  return mac;
}

export function generateDeviceId(): string {
  return `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number);
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

export function numberToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ].join('.');
}

export function isInSameSubnet(ip1: string, ip2: string, mask: string): boolean {
  const ip1Num = ipToNumber(ip1);
  const ip2Num = ipToNumber(ip2);
  const maskNum = ipToNumber(mask);
  return (ip1Num & maskNum) === (ip2Num & maskNum);
}

export function getNetworkAddress(ip: string, mask: string): string {
  const ipNum = ipToNumber(ip);
  const maskNum = ipToNumber(mask);
  return numberToIp(ipNum & maskNum);
}

export function getBroadcastAddress(ip: string, mask: string): string {
  const ipNum = ipToNumber(ip);
  const maskNum = ipToNumber(mask);
  const invertedMask = ~maskNum >>> 0;
  return numberToIp((ipNum & maskNum) | invertedMask);
}

export function cidrToMask(cidr: number): string {
  const mask = (0xffffffff << (32 - cidr)) >>> 0;
  return numberToIp(mask);
}

export function maskToCidr(mask: string): number {
  const maskNum = ipToNumber(mask);
  let cidr = 0;
  let temp = maskNum;
  while (temp & 0x80000000) {
    cidr++;
    temp <<= 1;
  }
  return cidr;
}

export function getAvailableHosts(mask: string): number {
  const cidr = maskToCidr(mask);
  return Math.pow(2, 32 - cidr) - 2;
}

export function isValidIp(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255;
  });
}

export function getIpClass(ip: string): 'A' | 'B' | 'C' | 'D' | 'E' {
  const firstOctet = parseInt(ip.split('.')[0], 10);
  if (firstOctet < 128) return 'A';
  if (firstOctet < 192) return 'B';
  if (firstOctet < 224) return 'C';
  if (firstOctet < 240) return 'D';
  return 'E';
}

export function getDefaultMask(ip: string): string {
  const ipClass = getIpClass(ip);
  switch (ipClass) {
    case 'A': return '255.0.0.0';
    case 'B': return '255.255.0.0';
    case 'C': return '255.255.255.0';
    default: return '255.255.255.0';
  }
}

export const defaultDeviceConfig: Record<DeviceType, Partial<NetworkDevice>> = {
  router: {
    interfaces: [
      { id: 'eth0', name: 'Ethernet 0', ipAddress: '192.168.1.1', subnetMask: '255.255.255.0', gateway: '', dhcpEnabled: false, macAddress: generateMacAddress(), connected: false },
      { id: 'eth1', name: 'Ethernet 1', ipAddress: '10.0.0.1', subnetMask: '255.255.255.0', gateway: '', dhcpEnabled: false, macAddress: generateMacAddress(), connected: false }
    ],
    routingTable: []
  },
  switch: {
    interfaces: Array.from({ length: 8 }, (_, i) => ({
      id: `port${i}`,
      name: `Port ${i}`,
      ipAddress: '',
      subnetMask: '',
      gateway: '',
      dhcpEnabled: false,
      macAddress: generateMacAddress(),
      connected: false
    }))
  },
  server: {
    interfaces: [
      { id: 'eth0', name: 'Ethernet 0', ipAddress: '192.168.1.10', subnetMask: '255.255.255.0', gateway: '192.168.1.1', dhcpEnabled: false, macAddress: generateMacAddress(), connected: false }
    ]
  },
  pc: {
    interfaces: [
      { id: 'eth0', name: 'Ethernet 0', ipAddress: '', subnetMask: '255.255.255.0', gateway: '', dhcpEnabled: false, macAddress: generateMacAddress(), connected: false }
    ]
  },
  'dhcp-server': {
    interfaces: [
      { id: 'eth0', name: 'Ethernet 0', ipAddress: '192.168.1.2', subnetMask: '255.255.255.0', gateway: '192.168.1.1', dhcpEnabled: false, macAddress: generateMacAddress(), connected: false }
    ],
    dhcpConfig: {
      enabled: true,
      poolStart: '192.168.1.100',
      poolEnd: '192.168.1.200',
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1',
      dnsServer: '192.168.1.3',
      leaseTime: 86400,
      leases: []
    }
  },
  'dns-server': {
    interfaces: [
      { id: 'eth0', name: 'Ethernet 0', ipAddress: '192.168.1.3', subnetMask: '255.255.255.0', gateway: '192.168.1.1', dhcpEnabled: false, macAddress: generateMacAddress(), connected: false }
    ],
    dnsConfig: {
      enabled: true,
      records: [
        { hostname: 'server.local', ipAddress: '192.168.1.10', type: 'A' }
      ]
    }
  }
};
