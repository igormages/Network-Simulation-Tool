'use client';

export interface TerminalTask {
  id: string;
  instruction: string;
  hint?: string;
  expectedCommands: string[]; // Commands that would be considered correct
  expectedOutputContains?: string[]; // Output must contain these strings
  points: number;
}

export interface TerminalExercise {
  id: string;
  number: number;
  title: string;
  difficulty: 'debutant' | 'intermediaire' | 'avance';
  category: 'diagnostic' | 'configuration' | 'analyse' | 'depannage';
  description: string;
  objectives: string[];
  theory: {
    title: string;
    content: string;
    keyPoints: string[];
  }[];
  tasks: TerminalTask[];
  estimatedTime: number;
  maxScore: number;
  os: 'windows' | 'linux' | 'both';
}

export interface TaskResult {
  taskId: string;
  completed: boolean;
  command: string;
  points: number;
}

export const terminalExercises: TerminalExercise[] = [
  {
    id: 'term-ex1-ipconfig',
    number: 1,
    title: 'Decouvrir sa configuration IP',
    difficulty: 'debutant',
    category: 'diagnostic',
    description: 'Apprendre a utiliser les commandes de base pour afficher la configuration IP de votre machine.',
    objectives: [
      'Afficher la configuration IP complete',
      'Identifier son adresse IP',
      'Identifier son masque de sous-reseau',
      'Identifier sa passerelle par defaut'
    ],
    theory: [
      {
        title: 'Commandes de configuration IP',
        content: 'Sous Windows, la commande ipconfig permet d\'afficher la configuration reseau. Sous Linux, on utilise ip addr ou ifconfig.\n\nipconfig /all affiche des informations detaillees incluant l\'adresse MAC, les serveurs DNS, et le bail DHCP.',
        keyPoints: [
          'Windows: ipconfig, ipconfig /all',
          'Linux: ip addr, ip a, ifconfig',
          'L\'option /all ou -a donne plus de details',
          'Chaque interface reseau a sa propre configuration'
        ]
      }
    ],
    tasks: [
      {
        id: 'task1',
        instruction: 'Affichez la configuration IP de base de votre machine',
        hint: 'Utilisez ipconfig (Windows) ou ip addr (Linux)',
        expectedCommands: ['ipconfig', 'ip addr', 'ip a', 'ifconfig'],
        points: 25
      },
      {
        id: 'task2',
        instruction: 'Affichez la configuration IP detaillee (avec adresse MAC et DNS)',
        hint: 'Ajoutez l\'option /all pour plus de details',
        expectedCommands: ['ipconfig /all', 'ip addr show', 'ifconfig -a'],
        points: 25
      },
      {
        id: 'task3',
        instruction: 'Affichez uniquement les informations de l\'interface eth0',
        hint: 'Specifiez le nom de l\'interface dans la commande',
        expectedCommands: ['ip addr show eth0', 'ifconfig eth0'],
        points: 25
      },
      {
        id: 'task4',
        instruction: 'Affichez le nom de votre machine (hostname)',
        hint: 'La commande hostname fonctionne sur les deux systemes',
        expectedCommands: ['hostname'],
        points: 25
      }
    ],
    estimatedTime: 10,
    maxScore: 100,
    os: 'both'
  },
  {
    id: 'term-ex2-ping',
    number: 2,
    title: 'Tester la connectivite avec ping',
    difficulty: 'debutant',
    category: 'diagnostic',
    description: 'Maitriser la commande ping pour tester la connectivite reseau et diagnostiquer les problemes.',
    objectives: [
      'Tester la connectivite vers une adresse IP',
      'Tester la connectivite vers un nom de domaine',
      'Limiter le nombre de pings',
      'Interpreter les resultats'
    ],
    theory: [
      {
        title: 'La commande ping',
        content: 'Ping envoie des paquets ICMP Echo Request et attend des reponses. C\'est l\'outil fondamental pour tester si une machine est accessible sur le reseau.\n\nResultats possibles:\n- Reply: La machine repond\n- Request timed out: Pas de reponse\n- Destination unreachable: Pas de route',
        keyPoints: [
          'Ping teste la couche 3 (IP) du modele OSI',
          'Le TTL indique le nombre de sauts restants',
          'Le temps (ms) mesure la latence aller-retour',
          'Ctrl+C arrete un ping continu'
        ]
      }
    ],
    tasks: [
      {
        id: 'task1',
        instruction: 'Testez la connectivite vers votre propre machine (localhost)',
        hint: 'Utilisez l\'adresse 127.0.0.1 ou localhost',
        expectedCommands: ['ping 127.0.0.1', 'ping localhost', 'ping -c 4 127.0.0.1', 'ping -c 4 localhost'],
        points: 20
      },
      {
        id: 'task2',
        instruction: 'Testez la connectivite vers la passerelle (192.168.1.1)',
        hint: 'Ping l\'adresse IP de la passerelle',
        expectedCommands: ['ping 192.168.1.1', 'ping -c 4 192.168.1.1'],
        points: 20
      },
      {
        id: 'task3',
        instruction: 'Testez la connectivite vers google.com',
        hint: 'Vous pouvez ping un nom de domaine directement',
        expectedCommands: ['ping google.com', 'ping -c 4 google.com', 'ping www.google.com'],
        points: 20
      },
      {
        id: 'task4',
        instruction: 'Envoyez exactement 4 pings vers 8.8.8.8 (serveur DNS Google)',
        hint: 'Windows: -n 4, Linux: -c 4',
        expectedCommands: ['ping -n 4 8.8.8.8', 'ping -c 4 8.8.8.8', 'ping 8.8.8.8 -n 4', 'ping 8.8.8.8 -c 4'],
        points: 20
      },
      {
        id: 'task5',
        instruction: 'Testez la connectivite vers le serveur DNS 1.1.1.1 (Cloudflare)',
        hint: 'Meme principe que pour Google DNS',
        expectedCommands: ['ping 1.1.1.1', 'ping -c 4 1.1.1.1', 'ping -n 4 1.1.1.1'],
        points: 20
      }
    ],
    estimatedTime: 10,
    maxScore: 100,
    os: 'both'
  },
  {
    id: 'term-ex3-traceroute',
    number: 3,
    title: 'Tracer le chemin des paquets',
    difficulty: 'intermediaire',
    category: 'diagnostic',
    description: 'Utiliser traceroute/tracert pour visualiser le chemin que prennent les paquets sur le reseau.',
    objectives: [
      'Tracer le chemin vers une destination',
      'Identifier les routeurs intermediaires',
      'Comprendre les sauts (hops)',
      'Analyser les temps de reponse'
    ],
    theory: [
      {
        title: 'Traceroute / Tracert',
        content: 'Traceroute (Linux) ou tracert (Windows) affiche le chemin parcouru par les paquets jusqu\'a destination. Il utilise le TTL (Time To Live) croissant pour identifier chaque routeur sur le trajet.\n\nChaque ligne represente un "saut" (hop) avec l\'adresse IP du routeur et le temps de reponse.',
        keyPoints: [
          'Windows: tracert, Linux: traceroute',
          'Chaque ligne = un routeur traverse',
          '* * * signifie pas de reponse (filtre ICMP)',
          'Les temps en ms montrent la latence a chaque saut'
        ]
      }
    ],
    tasks: [
      {
        id: 'task1',
        instruction: 'Tracez le chemin vers google.com',
        hint: 'Windows: tracert, Linux: traceroute',
        expectedCommands: ['tracert google.com', 'traceroute google.com', 'tracert www.google.com', 'traceroute www.google.com'],
        points: 25
      },
      {
        id: 'task2',
        instruction: 'Tracez le chemin vers le serveur DNS 8.8.8.8',
        hint: 'Utilisez directement l\'adresse IP',
        expectedCommands: ['tracert 8.8.8.8', 'traceroute 8.8.8.8'],
        points: 25
      },
      {
        id: 'task3',
        instruction: 'Tracez le chemin vers 1.1.1.1 en limitant a 10 sauts maximum',
        hint: 'Windows: -h 10, Linux: -m 10',
        expectedCommands: ['tracert -h 10 1.1.1.1', 'traceroute -m 10 1.1.1.1'],
        points: 25
      },
      {
        id: 'task4',
        instruction: 'Tracez le chemin vers cloudflare.com',
        hint: 'Meme syntaxe que pour google.com',
        expectedCommands: ['tracert cloudflare.com', 'traceroute cloudflare.com'],
        points: 25
      }
    ],
    estimatedTime: 15,
    maxScore: 100,
    os: 'both'
  },
  {
    id: 'term-ex4-dns',
    number: 4,
    title: 'Resolution DNS',
    difficulty: 'intermediaire',
    category: 'diagnostic',
    description: 'Maitriser les commandes nslookup et dig pour interroger les serveurs DNS.',
    objectives: [
      'Resoudre un nom de domaine en adresse IP',
      'Identifier le serveur DNS utilise',
      'Effectuer une resolution inverse',
      'Interroger un serveur DNS specifique'
    ],
    theory: [
      {
        title: 'Commandes DNS',
        content: 'nslookup (Windows/Linux) et dig (Linux) permettent d\'interroger les serveurs DNS.\n\nTypes d\'enregistrements:\n- A: IPv4\n- AAAA: IPv6\n- MX: Serveur mail\n- NS: Serveur de noms\n- CNAME: Alias',
        keyPoints: [
          'nslookup fonctionne sur Windows et Linux',
          'dig est plus puissant mais Linux uniquement',
          'Resolution inverse: IP -> nom',
          'On peut specifier un serveur DNS particulier'
        ]
      }
    ],
    tasks: [
      {
        id: 'task1',
        instruction: 'Resolvez le nom google.com en adresse IP',
        hint: 'Utilisez nslookup suivi du nom de domaine',
        expectedCommands: ['nslookup google.com', 'dig google.com', 'nslookup www.google.com'],
        points: 20
      },
      {
        id: 'task2',
        instruction: 'Trouvez l\'adresse IP de github.com',
        hint: 'Meme commande que precedemment',
        expectedCommands: ['nslookup github.com', 'dig github.com', 'nslookup www.github.com'],
        points: 20
      },
      {
        id: 'task3',
        instruction: 'Effectuez une resolution inverse sur 8.8.8.8 (trouvez le nom associe)',
        hint: 'nslookup accepte aussi les adresses IP',
        expectedCommands: ['nslookup 8.8.8.8', 'dig -x 8.8.8.8'],
        points: 20
      },
      {
        id: 'task4',
        instruction: 'Interrogez le serveur DNS 1.1.1.1 pour resoudre microsoft.com',
        hint: 'Syntaxe: nslookup domaine serveur_dns',
        expectedCommands: ['nslookup microsoft.com 1.1.1.1', 'dig @1.1.1.1 microsoft.com'],
        points: 20
      },
      {
        id: 'task5',
        instruction: 'Trouvez les serveurs de messagerie (MX) de gmail.com',
        hint: 'Specifiez le type d\'enregistrement MX',
        expectedCommands: ['nslookup -type=mx gmail.com', 'nslookup -q=mx gmail.com', 'dig gmail.com MX', 'dig mx gmail.com'],
        points: 20
      }
    ],
    estimatedTime: 15,
    maxScore: 100,
    os: 'both'
  },
  {
    id: 'term-ex5-netstat',
    number: 5,
    title: 'Analyser les connexions reseau',
    difficulty: 'intermediaire',
    category: 'analyse',
    description: 'Utiliser netstat et ss pour visualiser les connexions reseau actives et les ports en ecoute.',
    objectives: [
      'Lister toutes les connexions actives',
      'Identifier les ports en ecoute',
      'Voir les statistiques reseau',
      'Filtrer par protocole (TCP/UDP)'
    ],
    theory: [
      {
        title: 'Netstat et ss',
        content: 'netstat (Windows/Linux) et ss (Linux moderne) affichent les connexions reseau.\n\nEtats des connexions TCP:\n- LISTENING: En attente de connexion\n- ESTABLISHED: Connexion active\n- TIME_WAIT: Fermeture en cours\n- CLOSE_WAIT: Attente de fermeture',
        keyPoints: [
          'netstat -a: toutes les connexions',
          'netstat -n: adresses numeriques',
          'netstat -t: TCP uniquement',
          'ss est plus rapide que netstat sur Linux'
        ]
      }
    ],
    tasks: [
      {
        id: 'task1',
        instruction: 'Affichez toutes les connexions reseau actives',
        hint: 'Utilisez l\'option -a pour "all"',
        expectedCommands: ['netstat -a', 'netstat -an', 'ss -a', 'ss -an'],
        points: 20
      },
      {
        id: 'task2',
        instruction: 'Affichez uniquement les ports en ecoute (listening)',
        hint: 'L\'option est differente selon l\'OS',
        expectedCommands: ['netstat -l', 'netstat -an | findstr LISTENING', 'ss -l', 'ss -lt'],
        points: 20
      },
      {
        id: 'task3',
        instruction: 'Affichez les connexions TCP uniquement',
        hint: 'Utilisez l\'option pour filtrer par protocole',
        expectedCommands: ['netstat -t', 'netstat -at', 'netstat -p tcp', 'ss -t', 'ss -ta'],
        points: 20
      },
      {
        id: 'task4',
        instruction: 'Affichez les connexions avec les numeros de ports (pas les noms)',
        hint: 'L\'option -n affiche les adresses numeriques',
        expectedCommands: ['netstat -n', 'netstat -an', 'ss -n', 'ss -an'],
        points: 20
      },
      {
        id: 'task5',
        instruction: 'Affichez les statistiques reseau par protocole',
        hint: 'L\'option -s affiche les statistiques',
        expectedCommands: ['netstat -s', 'ss -s'],
        points: 20
      }
    ],
    estimatedTime: 15,
    maxScore: 100,
    os: 'both'
  },
  {
    id: 'term-ex6-arp',
    number: 6,
    title: 'Table ARP et voisinage',
    difficulty: 'intermediaire',
    category: 'analyse',
    description: 'Comprendre et manipuler la table ARP qui associe les adresses IP aux adresses MAC.',
    objectives: [
      'Afficher la table ARP',
      'Comprendre la correspondance IP/MAC',
      'Identifier les machines du reseau local',
      'Comprendre le role d\'ARP'
    ],
    theory: [
      {
        title: 'Le protocole ARP',
        content: 'ARP (Address Resolution Protocol) permet de trouver l\'adresse MAC associee a une adresse IP sur le reseau local.\n\nQuand une machine veut communiquer avec une IP locale, elle envoie une requete ARP en broadcast. La machine cible repond avec son adresse MAC.',
        keyPoints: [
          'ARP fonctionne uniquement sur le reseau local',
          'La table ARP est un cache temporaire',
          'Chaque entree a une duree de vie limitee',
          'Les adresses MAC sont uniques par interface'
        ]
      }
    ],
    tasks: [
      {
        id: 'task1',
        instruction: 'Affichez la table ARP complete de votre machine',
        hint: 'Utilisez arp avec l\'option appropriee',
        expectedCommands: ['arp -a', 'arp -n', 'ip neigh', 'ip neighbor'],
        points: 25
      },
      {
        id: 'task2',
        instruction: 'Affichez la table de routage de votre machine',
        hint: 'Windows: route print, Linux: ip route',
        expectedCommands: ['route print', 'ip route', 'ip r', 'netstat -r'],
        points: 25
      },
      {
        id: 'task3',
        instruction: 'Affichez les informations de l\'interface eth0 (adresse MAC incluse)',
        hint: 'Utilisez ip link ou ifconfig',
        expectedCommands: ['ip link show eth0', 'ifconfig eth0', 'ip l show eth0'],
        points: 25
      },
      {
        id: 'task4',
        instruction: 'Listez toutes les interfaces reseau disponibles',
        hint: 'Affichez la liste sans filtrer par interface',
        expectedCommands: ['ip link', 'ip l', 'ifconfig -a', 'ipconfig /all', 'netsh interface show interface'],
        points: 25
      }
    ],
    estimatedTime: 15,
    maxScore: 100,
    os: 'both'
  },
  {
    id: 'term-ex7-diagnostic',
    number: 7,
    title: 'Diagnostic methodique',
    difficulty: 'avance',
    category: 'depannage',
    description: 'Appliquer une methodologie de diagnostic reseau complete pour identifier et resoudre les problemes.',
    objectives: [
      'Suivre une procedure de diagnostic',
      'Tester la pile TCP/IP locale',
      'Verifier la connectivite LAN',
      'Verifier la connectivite WAN'
    ],
    theory: [
      {
        title: 'Methodologie de diagnostic',
        content: 'Pour diagnostiquer un probleme reseau, suivez ces etapes dans l\'ordre:\n\n1. Verifier la configuration IP (ipconfig/ip addr)\n2. Ping localhost (127.0.0.1) - teste la pile TCP/IP\n3. Ping sa propre IP - teste l\'interface\n4. Ping la passerelle - teste le LAN\n5. Ping une IP externe - teste le WAN\n6. Ping un domaine - teste le DNS',
        keyPoints: [
          'Toujours partir du plus proche',
          'Si ping localhost echoue: probleme de pile TCP/IP',
          'Si ping passerelle echoue: probleme LAN/cable',
          'Si ping IP externe OK mais domaine KO: probleme DNS'
        ]
      }
    ],
    tasks: [
      {
        id: 'task1',
        instruction: 'Etape 1: Affichez votre configuration IP actuelle',
        hint: 'Commencez par voir votre configuration',
        expectedCommands: ['ipconfig', 'ipconfig /all', 'ip addr', 'ip a', 'ifconfig'],
        points: 15
      },
      {
        id: 'task2',
        instruction: 'Etape 2: Testez la pile TCP/IP (ping localhost)',
        hint: 'Si ca echoue, la pile TCP/IP est corrompue',
        expectedCommands: ['ping 127.0.0.1', 'ping localhost', 'ping -c 4 127.0.0.1'],
        points: 15
      },
      {
        id: 'task3',
        instruction: 'Etape 3: Testez votre interface (ping votre propre IP 192.168.1.100)',
        hint: 'Ping l\'IP de votre machine',
        expectedCommands: ['ping 192.168.1.100', 'ping -c 4 192.168.1.100'],
        points: 15
      },
      {
        id: 'task4',
        instruction: 'Etape 4: Testez le reseau local (ping la passerelle 192.168.1.1)',
        hint: 'Si ca echoue, verifiez cable/wifi',
        expectedCommands: ['ping 192.168.1.1', 'ping -c 4 192.168.1.1'],
        points: 15
      },
      {
        id: 'task5',
        instruction: 'Etape 5: Testez la connectivite Internet (ping 8.8.8.8)',
        hint: 'Teste le routage vers Internet',
        expectedCommands: ['ping 8.8.8.8', 'ping -c 4 8.8.8.8'],
        points: 15
      },
      {
        id: 'task6',
        instruction: 'Etape 6: Testez la resolution DNS (ping google.com)',
        hint: 'Si ca echoue mais l\'IP fonctionne, probleme DNS',
        expectedCommands: ['ping google.com', 'ping -c 4 google.com', 'ping www.google.com'],
        points: 15
      },
      {
        id: 'task7',
        instruction: 'Bonus: Verifiez vos serveurs DNS configures',
        hint: 'Affichez la config complete pour voir les DNS',
        expectedCommands: ['ipconfig /all', 'cat /etc/resolv.conf', 'nslookup', 'systemd-resolve --status'],
        points: 10
      }
    ],
    estimatedTime: 20,
    maxScore: 100,
    os: 'both'
  },
  {
    id: 'term-ex8-linux-admin',
    number: 8,
    title: 'Administration Linux de base',
    difficulty: 'avance',
    category: 'configuration',
    description: 'Decouvrir les commandes d\'administration systeme et reseau sous Linux.',
    objectives: [
      'Gerer les utilisateurs',
      'Naviguer dans le systeme de fichiers',
      'Comprendre les permissions',
      'Gerer les services reseau'
    ],
    theory: [
      {
        title: 'Commandes Linux essentielles',
        content: 'Linux utilise une interface en ligne de commande puissante pour l\'administration.\n\nCommandes de base:\n- ls: lister les fichiers\n- cd: changer de repertoire\n- pwd: afficher le repertoire courant\n- cat: afficher le contenu d\'un fichier\n- whoami: afficher l\'utilisateur courant',
        keyPoints: [
          'Tout est fichier sous Linux',
          'Les chemins utilisent / (pas \\)',
          'sudo permet d\'executer en tant que root',
          'man commande affiche l\'aide'
        ]
      }
    ],
    tasks: [
      {
        id: 'task1',
        instruction: 'Affichez le nom de l\'utilisateur connecte',
        hint: 'Commande simple pour voir qui vous etes',
        expectedCommands: ['whoami'],
        points: 10
      },
      {
        id: 'task2',
        instruction: 'Affichez le repertoire de travail actuel',
        hint: 'pwd = Print Working Directory',
        expectedCommands: ['pwd'],
        points: 10
      },
      {
        id: 'task3',
        instruction: 'Listez les fichiers du repertoire courant avec les details',
        hint: 'Utilisez l\'option -l pour le format long',
        expectedCommands: ['ls -l', 'ls -la', 'ls -al', 'll'],
        points: 15
      },
      {
        id: 'task4',
        instruction: 'Affichez le contenu du fichier /etc/hosts',
        hint: 'Ce fichier contient les associations IP/nom locales',
        expectedCommands: ['cat /etc/hosts'],
        points: 15
      },
      {
        id: 'task5',
        instruction: 'Affichez la configuration DNS du systeme',
        hint: 'Le fichier de configuration DNS est resolv.conf',
        expectedCommands: ['cat /etc/resolv.conf'],
        points: 15
      },
      {
        id: 'task6',
        instruction: 'Affichez les interfaces reseau avec leurs adresses',
        hint: 'Utilisez la commande ip',
        expectedCommands: ['ip addr', 'ip a', 'ifconfig'],
        points: 15
      },
      {
        id: 'task7',
        instruction: 'Affichez les processus en cours d\'execution',
        hint: 'ps affiche les processus',
        expectedCommands: ['ps', 'ps aux', 'ps -ef', 'top', 'htop'],
        points: 20
      }
    ],
    estimatedTime: 20,
    maxScore: 100,
    os: 'linux'
  }
];

export function getTerminalExerciseById(id: string): TerminalExercise | undefined {
  return terminalExercises.find((ex) => ex.id === id);
}
