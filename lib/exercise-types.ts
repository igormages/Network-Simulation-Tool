import type { NetworkDevice, Cable, DeviceType } from './network-types';

export interface Exercise {
  id: string;
  number: number;
  title: string;
  difficulty: 'debutant' | 'intermediaire' | 'avance';
  category: 'adressage' | 'dhcp' | 'dns' | 'routage' | 'switching' | 'subnetting';
  description: string;
  objectives: string[];
  theory: TheorySection[];
  targetTopology: {
    devices: ExerciseDevice[];
    cables: ExerciseCable[];
  };
  validationRules: ValidationRule[];
  hints: string[];
  estimatedTime: number; // en minutes
  maxScore: number;
}

export interface TheorySection {
  title: string;
  content: string;
  keyPoints?: string[];
}

export interface ExerciseDevice {
  id: string;
  type: DeviceType;
  name: string;
  x: number;
  y: number;
  requiredConfig?: {
    ipAddress?: string;
    subnetMask?: string;
    gateway?: string;
    dhcpEnabled?: boolean;
    dhcpPoolStart?: string;
    dhcpPoolEnd?: string;
  };
}

export interface ExerciseCable {
  fromDeviceId: string;
  toDeviceId: string;
}

export interface ValidationRule {
  type: 'device_exists' | 'device_count' | 'cable_exists' | 'ip_configured' | 'dhcp_working' | 'ping_success' | 'subnet_correct' | 'all_connected' | 'gateway_configured' | 'router_has_interfaces' | 'subnet_isolation' | 'dhcp_configured';
  params: Record<string, unknown>;
  errorMessage: string;
  points: number;
}

export interface ExerciseResult {
  exerciseId: string;
  passed: boolean;
  score: number;
  maxScore: number;
  validationResults: {
    rule: ValidationRule;
    passed: boolean;
    message: string;
  }[];
  completedAt: Date;
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseNumber: number;
  completed: boolean;
  bestScore: number;
  maxScore: number;
  attempts: number;
  completedAt?: string;
}

export interface UserProgress {
  exercises: ExerciseProgress[];
  lastUpdated: string;
}

export interface PacketAnimation {
  id: string;
  fromDevice: NetworkDevice;
  toDevice: NetworkDevice;
  protocol: 'ICMP' | 'DHCP' | 'ARP' | 'DNS';
  status: 'pending' | 'traveling' | 'success' | 'failed';
  currentProgress: number; // 0 to 1
  path: { x: number; y: number }[];
  message: string;
}

// Exercices predéfinis
export const exercises: Exercise[] = [
  {
    id: 'ex1-basic-network',
    number: 1,
    title: 'Reseau local simple',
    difficulty: 'debutant',
    category: 'adressage',
    description: 'Creez un reseau local simple avec un switch et deux ordinateurs. Configurez les adresses IP pour permettre la communication entre les deux machines.',
    objectives: [
      'Placer un switch et deux PC',
      'Connecter les PC au switch',
      'Configurer les adresses IP dans le meme sous-reseau',
      'Verifier la connectivite avec un ping'
    ],
    theory: [
      {
        title: 'Adressage IP',
        content: 'Une adresse IP (Internet Protocol) est un identifiant unique attribue a chaque appareil sur un reseau. Elle se compose de 4 octets (32 bits) notes en decimal (ex: 192.168.1.10). Pour que deux machines puissent communiquer directement, elles doivent etre dans le meme sous-reseau.',
        keyPoints: [
          'Format: X.X.X.X (4 octets de 0 a 255)',
          'Classe C: 192.168.X.X - masque /24',
          'Adresse reseau vs adresse hote'
        ]
      },
      {
        title: 'Le masque de sous-reseau',
        content: 'Le masque de sous-reseau (subnet mask) determine quelle partie de l\'adresse IP identifie le reseau et quelle partie identifie l\'hote. Un masque /24 (255.255.255.0) signifie que les 24 premiers bits identifient le reseau.',
        keyPoints: [
          '255.255.255.0 = /24 = 254 hotes',
          'Tous les appareils du meme reseau partagent la meme partie reseau',
          'L\'adresse de broadcast termine par .255'
        ]
      },
      {
        title: 'Le Switch',
        content: 'Un switch (commutateur) est un equipement de niveau 2 (liaison) qui permet de connecter plusieurs appareils sur le meme reseau local. Il apprend les adresses MAC et transmet les trames uniquement vers le port de destination.',
        keyPoints: [
          'Fonctionne avec les adresses MAC',
          'Cree un domaine de collision par port',
          'Table CAM pour le routage des trames'
        ]
      }
    ],
    targetTopology: {
      devices: [
        { id: 'switch1', type: 'switch', name: 'Switch-1', x: 200, y: 100 },
        { id: 'pc1', type: 'pc', name: 'PC-1', x: 80, y: 250, requiredConfig: { ipAddress: '192.168.1.10', subnetMask: '255.255.255.0' } },
        { id: 'pc2', type: 'pc', name: 'PC-2', x: 320, y: 250, requiredConfig: { ipAddress: '192.168.1.20', subnetMask: '255.255.255.0' } }
      ],
      cables: [
        { fromDeviceId: 'switch1', toDeviceId: 'pc1' },
        { fromDeviceId: 'switch1', toDeviceId: 'pc2' }
      ]
    },
    validationRules: [
      { type: 'device_count', params: { type: 'switch', min: 1 }, errorMessage: 'Il faut au moins un switch', points: 10 },
      { type: 'device_count', params: { type: 'pc', min: 2 }, errorMessage: 'Il faut au moins deux PC', points: 10 },
      { type: 'ip_configured', params: { deviceType: 'pc' }, errorMessage: 'Les PC doivent avoir une adresse IP configuree', points: 20 },
      { type: 'subnet_correct', params: { mask: '255.255.255.0' }, errorMessage: 'Les adresses IP doivent etre dans le meme sous-reseau', points: 30 },
      { type: 'ping_success', params: {}, errorMessage: 'Le ping entre les PC doit fonctionner', points: 30 }
    ],
    hints: [
      'Commencez par placer le switch au centre',
      'Utilisez des adresses en 192.168.1.X avec le masque 255.255.255.0',
      'N\'oubliez pas de connecter les PC au switch via les interfaces'
    ],
    estimatedTime: 10,
    maxScore: 100
  },
  {
    id: 'ex2-dhcp-server',
    number: 2,
    title: 'Configuration DHCP',
    difficulty: 'intermediaire',
    category: 'dhcp',
    description: 'Configurez un serveur DHCP pour attribuer automatiquement des adresses IP aux clients du reseau.',
    objectives: [
      'Placer un serveur DHCP, un switch et deux PC',
      'Configurer le serveur DHCP avec un pool d\'adresses',
      'Activer le DHCP sur les PC clients',
      'Verifier l\'attribution automatique des adresses'
    ],
    theory: [
      {
        title: 'Le protocole DHCP',
        content: 'DHCP (Dynamic Host Configuration Protocol) permet d\'attribuer automatiquement des configurations IP aux clients. Le processus suit 4 etapes appelees DORA: Discover, Offer, Request, Acknowledge.',
        keyPoints: [
          'Discover: Le client envoie un broadcast pour trouver un serveur DHCP',
          'Offer: Le serveur propose une adresse IP',
          'Request: Le client demande l\'adresse proposee',
          'Acknowledge: Le serveur confirme l\'attribution'
        ]
      },
      {
        title: 'Configuration du serveur DHCP',
        content: 'Un serveur DHCP doit etre configure avec: une plage d\'adresses (pool), un masque de sous-reseau, une passerelle par defaut (gateway), et optionnellement un serveur DNS. La duree du bail (lease time) determine combien de temps le client conserve son adresse.',
        keyPoints: [
          'Pool: plage d\'adresses disponibles (ex: .100 a .200)',
          'Exclure les adresses statiques du pool',
          'Le serveur DHCP doit avoir une IP statique'
        ]
      }
    ],
    targetTopology: {
      devices: [
        { id: 'switch1', type: 'switch', name: 'Switch-1', x: 200, y: 50 },
        { id: 'dhcp1', type: 'dhcp-server', name: 'DHCP-Server', x: 200, y: 180, requiredConfig: { ipAddress: '192.168.1.1', subnetMask: '255.255.255.0', dhcpPoolStart: '192.168.1.100', dhcpPoolEnd: '192.168.1.200' } },
        { id: 'pc1', type: 'pc', name: 'PC-1', x: 50, y: 300, requiredConfig: { dhcpEnabled: true } },
        { id: 'pc2', type: 'pc', name: 'PC-2', x: 350, y: 300, requiredConfig: { dhcpEnabled: true } }
      ],
      cables: [
        { fromDeviceId: 'switch1', toDeviceId: 'dhcp1' },
        { fromDeviceId: 'switch1', toDeviceId: 'pc1' },
        { fromDeviceId: 'switch1', toDeviceId: 'pc2' }
      ]
    },
    validationRules: [
      { type: 'device_exists', params: { type: 'dhcp-server' }, errorMessage: 'Il faut un serveur DHCP', points: 15 },
      { type: 'device_count', params: { type: 'pc', min: 2 }, errorMessage: 'Il faut au moins deux PC', points: 10 },
      { type: 'dhcp_working', params: {}, errorMessage: 'Le serveur DHCP doit distribuer des adresses', points: 45 },
      { type: 'ping_success', params: {}, errorMessage: 'La communication entre les PC doit fonctionner', points: 30 }
    ],
    hints: [
      'Le serveur DHCP doit avoir une adresse IP statique',
      'Definissez un pool d\'adresses (ex: 192.168.1.100 a 192.168.1.200)',
      'Activez le DHCP client sur les PC (dans la configuration)'
    ],
    estimatedTime: 15,
    maxScore: 100
  },
  {
    id: 'ex3-routing',
    number: 3,
    title: 'Interconnexion de reseaux',
    difficulty: 'avance',
    category: 'routage',
    description: 'Interconnectez deux reseaux locaux differents avec un routeur. Configurez les passerelles pour permettre la communication inter-reseaux.',
    objectives: [
      'Creer deux reseaux locaux distincts (192.168.1.0/24 et 192.168.2.0/24)',
      'Placer un routeur entre les deux reseaux',
      'Configurer les interfaces du routeur avec les bonnes IP',
      'Configurer les passerelles sur tous les equipements',
      'Tester la communication entre les deux reseaux'
    ],
    theory: [
      {
        title: 'Le routage IP',
        content: 'Le routage permet de faire communiquer des reseaux differents. Un routeur possede plusieurs interfaces, chacune connectee a un reseau different. Il utilise une table de routage pour determiner par quelle interface envoyer les paquets.',
        keyPoints: [
          'Le routeur est la passerelle entre les reseaux',
          'Chaque interface du routeur a une IP dans son reseau',
          'Les hotes utilisent la passerelle pour atteindre d\'autres reseaux'
        ]
      },
      {
        title: 'La passerelle par defaut',
        content: 'La passerelle par defaut (default gateway) est l\'adresse IP du routeur vers lequel un hote envoie tous les paquets destines a des reseaux exterieurs. C\'est generalement l\'adresse .1 ou .254 du sous-reseau local.',
        keyPoints: [
          'Configuree sur chaque hote du reseau',
          'Doit etre dans le meme sous-reseau que l\'hote',
          'Point de sortie vers les autres reseaux'
        ]
      },
      {
        title: 'La table de routage',
        content: 'La table de routage contient les informations necessaires pour acheminer les paquets: reseau de destination, masque, passerelle (next hop), interface de sortie et metrique (cout du chemin).',
        keyPoints: [
          'Routes directement connectees',
          'Routes statiques configurees manuellement',
          'Routes dynamiques apprises par protocoles (RIP, OSPF)'
        ]
      }
    ],
    targetTopology: {
      devices: [
        { id: 'router1', type: 'router', name: 'Router-1', x: 200, y: 50 },
        { id: 'switch1', type: 'switch', name: 'Switch-LAN1', x: 80, y: 180 },
        { id: 'switch2', type: 'switch', name: 'Switch-LAN2', x: 320, y: 180 },
        { id: 'pc1', type: 'pc', name: 'PC-LAN1', x: 80, y: 300, requiredConfig: { ipAddress: '192.168.1.10', subnetMask: '255.255.255.0', gateway: '192.168.1.1' } },
        { id: 'pc2', type: 'pc', name: 'PC-LAN2', x: 320, y: 300, requiredConfig: { ipAddress: '192.168.2.10', subnetMask: '255.255.255.0', gateway: '192.168.2.1' } }
      ],
      cables: [
        { fromDeviceId: 'router1', toDeviceId: 'switch1' },
        { fromDeviceId: 'router1', toDeviceId: 'switch2' },
        { fromDeviceId: 'switch1', toDeviceId: 'pc1' },
        { fromDeviceId: 'switch2', toDeviceId: 'pc2' }
      ]
    },
    validationRules: [
      { type: 'device_exists', params: { type: 'router' }, errorMessage: 'Il faut un routeur', points: 10 },
      { type: 'device_count', params: { type: 'switch', min: 2 }, errorMessage: 'Il faut deux switches pour deux reseaux', points: 10 },
      { type: 'device_count', params: { type: 'pc', min: 2 }, errorMessage: 'Il faut au moins deux PC', points: 10 },
      { type: 'ip_configured', params: { checkGateway: true }, errorMessage: 'Tous les equipements doivent avoir une IP et une passerelle configurees', points: 30 },
      { type: 'ping_success', params: { interNetwork: true }, errorMessage: 'Le ping entre les deux reseaux doit fonctionner', points: 40 }
    ],
    hints: [
      'Le routeur a besoin de deux interfaces: une en 192.168.1.1 et une en 192.168.2.1',
      'Chaque PC doit avoir comme passerelle l\'adresse du routeur dans son reseau',
      'Assurez-vous que les PC sont dans des sous-reseaux differents'
    ],
    estimatedTime: 20,
    maxScore: 100
  },
  {
    id: 'ex4-dns',
    number: 4,
    title: 'Resolution DNS',
    difficulty: 'intermediaire',
    category: 'dns',
    description: 'Mettez en place un serveur DNS local pour resoudre les noms d\'hotes en adresses IP.',
    objectives: [
      'Configurer un serveur DNS avec des enregistrements',
      'Configurer les clients pour utiliser le serveur DNS',
      'Tester la resolution de noms'
    ],
    theory: [
      {
        title: 'Le systeme DNS',
        content: 'DNS (Domain Name System) traduit les noms de domaine en adresses IP. Sans DNS, il faudrait memoriser les adresses IP de chaque serveur. Les serveurs DNS hierarchiques gerent les zones et les enregistrements.',
        keyPoints: [
          'Hierarchie: racine > TLD > domaines > sous-domaines',
          'Resolution recursive vs iterative',
          'Cache DNS pour optimiser les requetes'
        ]
      },
      {
        title: 'Types d\'enregistrements DNS',
        content: 'Les enregistrements DNS les plus courants sont: A (adresse IPv4), AAAA (adresse IPv6), CNAME (alias), MX (serveur mail), PTR (resolution inverse), NS (serveur de noms).',
        keyPoints: [
          'Enregistrement A: hostname -> IP',
          'Enregistrement CNAME: alias -> hostname',
          'TTL: duree de vie en cache'
        ]
      }
    ],
    targetTopology: {
      devices: [
        { id: 'switch1', type: 'switch', name: 'Switch-1', x: 200, y: 50 },
        { id: 'dns1', type: 'dns-server', name: 'DNS-Server', x: 320, y: 180 },
        { id: 'server1', type: 'server', name: 'Web-Server', x: 80, y: 180, requiredConfig: { ipAddress: '192.168.1.10', subnetMask: '255.255.255.0' } },
        { id: 'pc1', type: 'pc', name: 'PC-1', x: 200, y: 300, requiredConfig: { ipAddress: '192.168.1.50', subnetMask: '255.255.255.0' } }
      ],
      cables: [
        { fromDeviceId: 'switch1', toDeviceId: 'dns1' },
        { fromDeviceId: 'switch1', toDeviceId: 'server1' },
        { fromDeviceId: 'switch1', toDeviceId: 'pc1' }
      ]
    },
    validationRules: [
      { type: 'device_exists', params: { type: 'dns-server' }, errorMessage: 'Il faut un serveur DNS', points: 20 },
      { type: 'ip_configured', params: {}, errorMessage: 'Tous les equipements doivent avoir une IP', points: 30 },
      { type: 'ping_success', params: {}, errorMessage: 'La connectivite reseau doit fonctionner', points: 50 }
    ],
    hints: [
      'Le serveur DNS doit avoir des enregistrements A pour les serveurs',
      'Ajoutez un enregistrement pour web.local -> 192.168.1.10',
      'Les clients doivent pouvoir atteindre le serveur DNS'
    ],
    estimatedTime: 15,
    maxScore: 100
  },
  {
    id: 'ex5-subnetting',
    number: 5,
    title: 'Decoupage en sous-reseaux',
    difficulty: 'avance',
    category: 'subnetting',
    description: 'Divisez le reseau 192.168.0.0/24 en 4 sous-reseaux et configurez chaque segment avec les bonnes adresses.',
    objectives: [
      'Calculer les 4 sous-reseaux a partir de 192.168.0.0/24',
      'Configurer 4 segments avec leurs plages d\'adresses',
      'Utiliser le bon masque (/26 = 255.255.255.192)',
      'Interconnecter les sous-reseaux via un routeur'
    ],
    theory: [
      {
        title: 'Le subnetting (decoupage en sous-reseaux)',
        content: 'Le subnetting consiste a diviser un reseau en plusieurs sous-reseaux plus petits. Cela permet une meilleure organisation, securite et utilisation des adresses IP. On "emprunte" des bits a la partie hote pour creer plus de reseaux.',
        keyPoints: [
          '/24 -> /26 = emprunte 2 bits = 4 sous-reseaux',
          'Chaque sous-reseau a 64 adresses (62 utilisables)',
          'Formule: 2^n sous-reseaux avec n bits empruntes'
        ]
      },
      {
        title: 'Calcul des sous-reseaux',
        content: 'Pour 192.168.0.0/24 divise en 4 sous-reseaux (/26):\n- Sous-reseau 1: 192.168.0.0/26 (hotes: .1 a .62)\n- Sous-reseau 2: 192.168.0.64/26 (hotes: .65 a .126)\n- Sous-reseau 3: 192.168.0.128/26 (hotes: .129 a .190)\n- Sous-reseau 4: 192.168.0.192/26 (hotes: .193 a .254)',
        keyPoints: [
          'Masque /26 = 255.255.255.192',
          'Increment: 256 - 192 = 64 adresses par sous-reseau',
          'Premiere adresse = reseau, derniere = broadcast'
        ]
      }
    ],
    targetTopology: {
      devices: [
        { id: 'router1', type: 'router', name: 'Router-Central', x: 200, y: 30 },
        { id: 'switch1', type: 'switch', name: 'Switch-SR1', x: 50, y: 150 },
        { id: 'switch2', type: 'switch', name: 'Switch-SR2', x: 350, y: 150 },
        { id: 'pc1', type: 'pc', name: 'PC-SR1', x: 50, y: 280, requiredConfig: { ipAddress: '192.168.0.10', subnetMask: '255.255.255.192', gateway: '192.168.0.1' } },
        { id: 'pc2', type: 'pc', name: 'PC-SR2', x: 350, y: 280, requiredConfig: { ipAddress: '192.168.0.74', subnetMask: '255.255.255.192', gateway: '192.168.0.65' } }
      ],
      cables: [
        { fromDeviceId: 'router1', toDeviceId: 'switch1' },
        { fromDeviceId: 'router1', toDeviceId: 'switch2' },
        { fromDeviceId: 'switch1', toDeviceId: 'pc1' },
        { fromDeviceId: 'switch2', toDeviceId: 'pc2' }
      ]
    },
    validationRules: [
      { type: 'device_exists', params: { type: 'router' }, errorMessage: 'Il faut un routeur central', points: 10 },
      { type: 'device_count', params: { type: 'switch', min: 2 }, errorMessage: 'Il faut au moins 2 switches', points: 10 },
      { type: 'subnet_correct', params: { mask: '255.255.255.192' }, errorMessage: 'Le masque /26 doit etre utilise', points: 40 },
      { type: 'ping_success', params: { interNetwork: true }, errorMessage: 'La communication inter-sous-reseaux doit fonctionner', points: 40 }
    ],
    hints: [
      'Utilisez le masque 255.255.255.192 (/26) pour tous les equipements',
      'Sous-reseau 1: 192.168.0.0 (passerelle .1), Sous-reseau 2: 192.168.0.64 (passerelle .65)',
      'Le routeur doit avoir une interface dans chaque sous-reseau'
    ],
    estimatedTime: 25,
    maxScore: 100
  },
  {
    id: 'ex6-star-topology',
    number: 6,
    title: 'Topologie en etoile',
    difficulty: 'debutant',
    category: 'switching',
    description: 'Construire une topologie en etoile avec un switch central et plusieurs postes clients.',
    objectives: [
      'Comprendre la topologie en etoile',
      'Connecter plusieurs postes a un switch central',
      'Configurer le meme sous-reseau pour tous les postes',
      'Verifier la communication entre tous les postes'
    ],
    theory: [
      {
        title: 'Topologie en etoile',
        content: 'La topologie en etoile est la plus courante dans les reseaux locaux modernes. Tous les equipements sont connectes a un point central (switch ou hub). Cette architecture offre plusieurs avantages: isolation des pannes (une coupure n\'affecte qu\'un seul poste), facilite de gestion et de depannage.',
        keyPoints: [
          'Le switch est le point central de connexion',
          'Chaque appareil a son propre cable vers le switch',
          'Une panne d\'un cable n\'affecte qu\'un seul poste',
          'Facile a etendre en ajoutant des ports'
        ]
      },
      {
        title: 'Role du switch',
        content: 'Le switch fonctionne en couche 2 (liaison de donnees). Il apprend les adresses MAC des equipements connectes et cree une table de correspondance port/MAC. Il transmet les trames uniquement vers le port de destination, evitant ainsi les collisions.',
        keyPoints: [
          'Le switch utilise les adresses MAC',
          'Il cree une table MAC dynamique',
          'Il filtre le trafic pour eviter les collisions',
          'Chaque port a une bande passante dediee'
        ]
      }
    ],
    targetTopology: {
      devices: [
        { id: 'switch1', type: 'switch', name: 'Switch-Central', x: 200, y: 100 },
        { id: 'pc1', type: 'pc', name: 'PC-1', x: 50, y: 250, requiredConfig: { ipAddress: '192.168.1.10', subnetMask: '255.255.255.0' } },
        { id: 'pc2', type: 'pc', name: 'PC-2', x: 150, y: 250, requiredConfig: { ipAddress: '192.168.1.11', subnetMask: '255.255.255.0' } },
        { id: 'pc3', type: 'pc', name: 'PC-3', x: 250, y: 250, requiredConfig: { ipAddress: '192.168.1.12', subnetMask: '255.255.255.0' } },
        { id: 'pc4', type: 'pc', name: 'PC-4', x: 350, y: 250, requiredConfig: { ipAddress: '192.168.1.13', subnetMask: '255.255.255.0' } }
      ],
      cables: [
        { fromDeviceId: 'switch1', toDeviceId: 'pc1' },
        { fromDeviceId: 'switch1', toDeviceId: 'pc2' },
        { fromDeviceId: 'switch1', toDeviceId: 'pc3' },
        { fromDeviceId: 'switch1', toDeviceId: 'pc4' }
      ]
    },
    validationRules: [
      { type: 'device_exists', params: { type: 'switch' }, errorMessage: 'Il faut un switch central', points: 15 },
      { type: 'device_count', params: { type: 'pc', min: 4 }, errorMessage: 'Il faut au moins 4 PC', points: 15 },
      { type: 'all_connected', params: {}, errorMessage: 'Tous les PC doivent etre connectes au switch', points: 30 },
      { type: 'ping_success', params: {}, errorMessage: 'Tous les PC doivent pouvoir communiquer', points: 40 }
    ],
    hints: [
      'Placez le switch au centre du canvas',
      'Connectez chaque PC a un port different du switch',
      'Utilisez des adresses IP consecutives dans le meme sous-reseau'
    ],
    estimatedTime: 10,
    maxScore: 100
  },
  {
    id: 'ex7-gateway-config',
    number: 7,
    title: 'Configuration de la passerelle',
    difficulty: 'intermediaire',
    category: 'routage',
    description: 'Configurer correctement la passerelle par defaut pour permettre la communication avec un reseau externe.',
    objectives: [
      'Comprendre le role de la passerelle par defaut',
      'Configurer un routeur comme passerelle',
      'Configurer les postes avec la bonne passerelle',
      'Tester la communication vers l\'exterieur'
    ],
    theory: [
      {
        title: 'La passerelle par defaut',
        content: 'La passerelle par defaut (default gateway) est l\'adresse IP du routeur qui permet d\'atteindre les reseaux externes. Quand un hote veut communiquer avec une adresse qui n\'est pas dans son sous-reseau, il envoie le paquet a sa passerelle.',
        keyPoints: [
          'La passerelle est l\'IP du routeur dans le reseau local',
          'Elle est utilisee pour atteindre les reseaux distants',
          'Sans passerelle, un hote ne peut communiquer qu\'avec son sous-reseau',
          'La passerelle doit etre dans le meme sous-reseau que l\'hote'
        ]
      },
      {
        title: 'Processus de routage',
        content: '1. L\'hote compare l\'IP destination avec son masque\n2. Si dans le meme sous-reseau: envoi direct (ARP)\n3. Si hors sous-reseau: envoi a la passerelle\n4. Le routeur consulte sa table de routage\n5. Le paquet est transmis vers le prochain saut',
        keyPoints: [
          'Le masque determine si la destination est locale ou distante',
          'Le routeur prend les decisions de routage',
          'Chaque routeur decremente le TTL',
          'Le paquet est encapsule a chaque saut'
        ]
      }
    ],
    targetTopology: {
      devices: [
        { id: 'router1', type: 'router', name: 'Routeur', x: 200, y: 50 },
        { id: 'switch1', type: 'switch', name: 'Switch', x: 200, y: 150 },
        { id: 'pc1', type: 'pc', name: 'PC-1', x: 100, y: 280, requiredConfig: { ipAddress: '192.168.1.10', subnetMask: '255.255.255.0', gateway: '192.168.1.1' } },
        { id: 'pc2', type: 'pc', name: 'PC-2', x: 300, y: 280, requiredConfig: { ipAddress: '192.168.1.11', subnetMask: '255.255.255.0', gateway: '192.168.1.1' } },
        { id: 'server1', type: 'server', name: 'Serveur-Externe', x: 350, y: 50, requiredConfig: { ipAddress: '10.0.0.10', subnetMask: '255.255.255.0' } }
      ],
      cables: [
        { fromDeviceId: 'router1', toDeviceId: 'switch1' },
        { fromDeviceId: 'router1', toDeviceId: 'server1' },
        { fromDeviceId: 'switch1', toDeviceId: 'pc1' },
        { fromDeviceId: 'switch1', toDeviceId: 'pc2' }
      ]
    },
    validationRules: [
      { type: 'device_exists', params: { type: 'router' }, errorMessage: 'Il faut un routeur', points: 10 },
      { type: 'gateway_configured', params: { gateway: '192.168.1.1' }, errorMessage: 'La passerelle doit etre 192.168.1.1', points: 40 },
      { type: 'router_has_interfaces', params: { count: 2 }, errorMessage: 'Le routeur doit avoir 2 interfaces configurees', points: 20 },
      { type: 'ping_success', params: { interNetwork: true }, errorMessage: 'Les PC doivent pouvoir atteindre le serveur externe', points: 30 }
    ],
    hints: [
      'L\'interface du routeur vers le LAN doit etre 192.168.1.1',
      'L\'interface du routeur vers le serveur doit etre 10.0.0.1',
      'Tous les PC doivent avoir 192.168.1.1 comme passerelle'
    ],
    estimatedTime: 15,
    maxScore: 100
  },
  {
    id: 'ex8-network-commands',
    number: 8,
    title: 'Commandes de diagnostic',
    difficulty: 'intermediaire',
    category: 'adressage',
    description: 'Utiliser les commandes de diagnostic reseau (ping, traceroute) pour identifier et resoudre les problemes.',
    objectives: [
      'Utiliser ping pour tester la connectivite',
      'Comprendre les messages d\'erreur ICMP',
      'Identifier les problemes de configuration',
      'Resoudre un probleme de connectivite'
    ],
    theory: [
      {
        title: 'La commande ping',
        content: 'Ping envoie des paquets ICMP Echo Request et attend des Echo Reply. C\'est l\'outil de base pour tester la connectivite.\n\nResultats possibles:\n- Reply: Hote accessible\n- Request timed out: Pas de reponse (pare-feu, hote eteint)\n- Destination unreachable: Pas de route',
        keyPoints: [
          'Ping utilise le protocole ICMP',
          'Le TTL indique le nombre de sauts restants',
          'Le temps (ms) mesure la latence aller-retour',
          'Ping teste la couche 3 (IP)'
        ]
      },
      {
        title: 'Diagnostic methodique',
        content: 'Pour diagnostiquer un probleme reseau:\n1. Ping localhost (127.0.0.1) - teste la pile TCP/IP\n2. Ping sa propre IP - teste l\'interface\n3. Ping la passerelle - teste le reseau local\n4. Ping une IP externe - teste le routage',
        keyPoints: [
          'Toujours commencer par le plus proche',
          'Isoler le probleme etape par etape',
          'Verifier la configuration IP (ipconfig/ip addr)',
          'Verifier les cables et connexions physiques'
        ]
      }
    ],
    targetTopology: {
      devices: [
        { id: 'router1', type: 'router', name: 'Routeur', x: 200, y: 30 },
        { id: 'switch1', type: 'switch', name: 'Switch', x: 200, y: 150 },
        { id: 'pc1', type: 'pc', name: 'PC-Test', x: 100, y: 280, requiredConfig: { ipAddress: '192.168.1.10', subnetMask: '255.255.255.0', gateway: '192.168.1.1' } },
        { id: 'server1', type: 'server', name: 'Serveur-Web', x: 300, y: 280, requiredConfig: { ipAddress: '192.168.1.100', subnetMask: '255.255.255.0', gateway: '192.168.1.1' } }
      ],
      cables: [
        { fromDeviceId: 'router1', toDeviceId: 'switch1' },
        { fromDeviceId: 'switch1', toDeviceId: 'pc1' },
        { fromDeviceId: 'switch1', toDeviceId: 'server1' }
      ]
    },
    validationRules: [
      { type: 'device_exists', params: { type: 'pc' }, errorMessage: 'Il faut un PC pour tester', points: 10 },
      { type: 'device_exists', params: { type: 'server' }, errorMessage: 'Il faut un serveur cible', points: 10 },
      { type: 'all_connected', params: {}, errorMessage: 'Tous les equipements doivent etre connectes', points: 30 },
      { type: 'ping_success', params: {}, errorMessage: 'Le ping du PC vers le serveur doit reussir', points: 50 }
    ],
    hints: [
      'Verifiez que tous les equipements sont dans le meme sous-reseau',
      'Utilisez le bouton "Simuler Ping" pour tester la connectivite',
      'Consultez la console pour voir les resultats detailles'
    ],
    estimatedTime: 10,
    maxScore: 100
  },
  {
    id: 'ex9-vlan-basics',
    number: 9,
    title: 'Introduction aux VLAN',
    difficulty: 'avance',
    category: 'switching',
    description: 'Comprendre la segmentation logique avec les VLAN (Virtual LAN) pour isoler le trafic.',
    objectives: [
      'Comprendre le concept de VLAN',
      'Segmenter un reseau physique en reseaux logiques',
      'Configurer des equipements dans differents VLAN',
      'Comprendre l\'isolation du trafic'
    ],
    theory: [
      {
        title: 'Qu\'est-ce qu\'un VLAN?',
        content: 'Un VLAN (Virtual LAN) permet de segmenter logiquement un reseau physique. Les equipements dans le meme VLAN peuvent communiquer comme s\'ils etaient sur le meme switch, meme s\'ils sont physiquement separes.\n\nAvantages:\n- Securite (isolation des departements)\n- Performance (reduction du domaine de broadcast)\n- Flexibilite (deplacer un poste sans recablage)',
        keyPoints: [
          'VLAN = sous-reseau logique sur un switch',
          'Les ports sont assignes a des VLAN specifiques',
          'Le trafic est isole entre VLAN',
          'Un routeur est necessaire pour communiquer entre VLAN'
        ]
      },
      {
        title: 'Types de ports VLAN',
        content: 'Access port: Appartient a un seul VLAN, pour les equipements terminaux\nTrunk port: Transporte plusieurs VLAN entre switches (tagged avec 802.1Q)\n\nLe tag 802.1Q ajoute 4 octets a la trame Ethernet pour identifier le VLAN.',
        keyPoints: [
          'Access = 1 VLAN, pour PC/serveurs',
          'Trunk = plusieurs VLAN, pour interconnexion',
          '802.1Q est le standard de tagging',
          'VLAN 1 est le VLAN par defaut (natif)'
        ]
      }
    ],
    targetTopology: {
      devices: [
        { id: 'switch1', type: 'switch', name: 'Switch-Principal', x: 200, y: 100 },
        { id: 'pc1', type: 'pc', name: 'PC-VLAN10', x: 50, y: 250, requiredConfig: { ipAddress: '192.168.10.10', subnetMask: '255.255.255.0' } },
        { id: 'pc2', type: 'pc', name: 'PC-VLAN10-2', x: 150, y: 250, requiredConfig: { ipAddress: '192.168.10.11', subnetMask: '255.255.255.0' } },
        { id: 'pc3', type: 'pc', name: 'PC-VLAN20', x: 250, y: 250, requiredConfig: { ipAddress: '192.168.20.10', subnetMask: '255.255.255.0' } },
        { id: 'pc4', type: 'pc', name: 'PC-VLAN20-2', x: 350, y: 250, requiredConfig: { ipAddress: '192.168.20.11', subnetMask: '255.255.255.0' } }
      ],
      cables: [
        { fromDeviceId: 'switch1', toDeviceId: 'pc1' },
        { fromDeviceId: 'switch1', toDeviceId: 'pc2' },
        { fromDeviceId: 'switch1', toDeviceId: 'pc3' },
        { fromDeviceId: 'switch1', toDeviceId: 'pc4' }
      ]
    },
    validationRules: [
      { type: 'device_exists', params: { type: 'switch' }, errorMessage: 'Il faut un switch', points: 10 },
      { type: 'device_count', params: { type: 'pc', min: 4 }, errorMessage: 'Il faut 4 PC (2 par VLAN)', points: 20 },
      { type: 'subnet_isolation', params: { subnets: ['192.168.10.0/24', '192.168.20.0/24'] }, errorMessage: 'Les PC doivent etre dans 2 sous-reseaux differents', points: 40 },
      { type: 'all_connected', params: {}, errorMessage: 'Tous les PC doivent etre connectes au switch', points: 30 }
    ],
    hints: [
      'VLAN 10 utilise le sous-reseau 192.168.10.0/24',
      'VLAN 20 utilise le sous-reseau 192.168.20.0/24',
      'Les PC du meme VLAN peuvent se pinguer, pas ceux de VLAN differents'
    ],
    estimatedTime: 20,
    maxScore: 100
  },
  {
    id: 'ex10-full-network',
    number: 10,
    title: 'Reseau d\'entreprise complet',
    difficulty: 'avance',
    category: 'routage',
    description: 'Concevoir et configurer un reseau d\'entreprise complet avec DHCP, DNS, routage et plusieurs sous-reseaux.',
    objectives: [
      'Concevoir une architecture reseau complete',
      'Configurer DHCP et DNS',
      'Mettre en place le routage inter-reseaux',
      'Assurer la connectivite de bout en bout'
    ],
    theory: [
      {
        title: 'Architecture reseau d\'entreprise',
        content: 'Un reseau d\'entreprise typique comprend:\n- Coeur de reseau (routeurs, switches de coeur)\n- Distribution (switches de distribution)\n- Acces (switches d\'acces, points d\'acces Wi-Fi)\n\nServices essentiels: DHCP, DNS, Active Directory, serveurs d\'applications.',
        keyPoints: [
          'Architecture hierarchique a 3 niveaux',
          'Redondance pour la haute disponibilite',
          'Segmentation par departement ou fonction',
          'Services centralises (DHCP, DNS)'
        ]
      },
      {
        title: 'Planification de l\'adressage',
        content: 'La planification de l\'adressage IP est cruciale:\n1. Definir le nombre de sous-reseaux necessaires\n2. Estimer le nombre d\'hotes par sous-reseau\n3. Choisir la plage d\'adresses privees\n4. Documenter l\'allocation',
        keyPoints: [
          'Utiliser les plages privees RFC 1918',
          'Prevoir la croissance future',
          'Reserver des adresses pour les equipements reseau',
          'Documenter chaque sous-reseau'
        ]
      }
    ],
    targetTopology: {
      devices: [
        { id: 'router1', type: 'router', name: 'Routeur-Core', x: 200, y: 30 },
        { id: 'switch1', type: 'switch', name: 'Switch-IT', x: 80, y: 150 },
        { id: 'switch2', type: 'switch', name: 'Switch-RH', x: 320, y: 150 },
        { id: 'dhcp1', type: 'dhcp-server', name: 'Serveur-DHCP', x: 50, y: 30, requiredConfig: { ipAddress: '192.168.1.2', subnetMask: '255.255.255.0', dhcpPoolStart: '192.168.1.100', dhcpPoolEnd: '192.168.1.200' } },
        { id: 'dns1', type: 'dns-server', name: 'Serveur-DNS', x: 350, y: 30, requiredConfig: { ipAddress: '192.168.1.3', subnetMask: '255.255.255.0' } },
        { id: 'pc1', type: 'pc', name: 'PC-IT-1', x: 30, y: 280, requiredConfig: { dhcpEnabled: true } },
        { id: 'pc2', type: 'pc', name: 'PC-IT-2', x: 130, y: 280, requiredConfig: { dhcpEnabled: true } },
        { id: 'pc3', type: 'pc', name: 'PC-RH-1', x: 270, y: 280, requiredConfig: { ipAddress: '192.168.2.10', subnetMask: '255.255.255.0', gateway: '192.168.2.1' } },
        { id: 'pc4', type: 'pc', name: 'PC-RH-2', x: 370, y: 280, requiredConfig: { ipAddress: '192.168.2.11', subnetMask: '255.255.255.0', gateway: '192.168.2.1' } }
      ],
      cables: [
        { fromDeviceId: 'router1', toDeviceId: 'switch1' },
        { fromDeviceId: 'router1', toDeviceId: 'switch2' },
        { fromDeviceId: 'router1', toDeviceId: 'dhcp1' },
        { fromDeviceId: 'router1', toDeviceId: 'dns1' },
        { fromDeviceId: 'switch1', toDeviceId: 'pc1' },
        { fromDeviceId: 'switch1', toDeviceId: 'pc2' },
        { fromDeviceId: 'switch2', toDeviceId: 'pc3' },
        { fromDeviceId: 'switch2', toDeviceId: 'pc4' }
      ]
    },
    validationRules: [
      { type: 'device_exists', params: { type: 'router' }, errorMessage: 'Il faut un routeur central', points: 10 },
      { type: 'device_exists', params: { type: 'dhcp-server' }, errorMessage: 'Il faut un serveur DHCP', points: 10 },
      { type: 'device_exists', params: { type: 'dns-server' }, errorMessage: 'Il faut un serveur DNS', points: 10 },
      { type: 'device_count', params: { type: 'switch', min: 2 }, errorMessage: 'Il faut au moins 2 switches', points: 10 },
      { type: 'dhcp_configured', params: {}, errorMessage: 'Le serveur DHCP doit etre configure', points: 20 },
      { type: 'ping_success', params: { interNetwork: true }, errorMessage: 'La communication inter-departements doit fonctionner', points: 40 }
    ],
    hints: [
      'Le routeur a besoin d\'une interface dans chaque sous-reseau',
      'Configurez d\'abord les serveurs (DHCP, DNS) avec des IP statiques',
      'Les PC IT utilisent DHCP, les PC RH ont des IP statiques',
      'Verifiez que les passerelles sont correctement configurees'
    ],
    estimatedTime: 30,
    maxScore: 100
  }
];

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find(ex => ex.id === id);
}

export function getExercisesByCategory(category: Exercise['category']): Exercise[] {
  return exercises.filter(ex => ex.category === category);
}

export function getExercisesByDifficulty(difficulty: Exercise['difficulty']): Exercise[] {
  return exercises.filter(ex => ex.difficulty === difficulty);
}
