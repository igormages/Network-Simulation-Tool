export interface TheoryChapter {
  id: string;
  number: number;
  title: string;
  description: string;
  sections: TheorySection[];
}

export interface TheorySection {
  id: string;
  title: string;
  content: string;
  keyPoints: string[];
  examples?: string[];
  diagram?: string;
}

export const theoryChapters: TheoryChapter[] = [
  {
    id: 'ch1-models',
    number: 1,
    title: 'Modeles de reference',
    description: 'Comprendre les modeles OSI et TCP/IP',
    sections: [
      {
        id: 'sec-osi-model',
        title: 'Le modele OSI (7 couches)',
        content: `Le modele OSI (Open Systems Interconnection) est un modele de reference qui decompose les communications reseau en 7 couches distinctes. Chaque couche a un role specifique et communique avec les couches adjacentes.

**Les 7 couches du modele OSI:**

7. **Application** - Interface avec l'utilisateur (HTTP, FTP, SMTP, DNS)
6. **Presentation** - Format des donnees, chiffrement, compression
5. **Session** - Gestion des sessions de communication
4. **Transport** - Fiabilite de la transmission (TCP, UDP)
3. **Reseau** - Adressage logique et routage (IP, ICMP)
2. **Liaison de donnees** - Adressage physique, trames (Ethernet, MAC)
1. **Physique** - Transmission des bits (cables, signaux electriques)

**Mnemonique:** "Ah Pour Savoir Tout Regle, Laisse Passer"`,
        keyPoints: [
          'Le modele OSI a 7 couches, de la couche physique a la couche application',
          'Chaque couche encapsule les donnees de la couche superieure',
          'Les protocoles operent a des couches specifiques',
          'L\'encapsulation ajoute des en-tetes a chaque couche'
        ],
        examples: [
          'HTTP opere a la couche Application (7)',
          'TCP opere a la couche Transport (4)',
          'IP opere a la couche Reseau (3)',
          'Ethernet opere a la couche Liaison (2)'
        ]
      },
      {
        id: 'sec-tcpip-model',
        title: 'Le modele TCP/IP (4 couches)',
        content: `Le modele TCP/IP est le modele pratique utilise sur Internet. Il simplifie le modele OSI en 4 couches:

**Les 4 couches du modele TCP/IP:**

4. **Application** - Correspond aux couches 5, 6, 7 du modele OSI
   - Protocoles: HTTP, HTTPS, FTP, SSH, DNS, DHCP, SMTP
   
3. **Transport** - Correspond a la couche 4 du modele OSI
   - Protocoles: TCP (fiable), UDP (non fiable mais rapide)
   
2. **Internet** - Correspond a la couche 3 du modele OSI
   - Protocoles: IP, ICMP, ARP
   
1. **Acces reseau** - Correspond aux couches 1 et 2 du modele OSI
   - Protocoles: Ethernet, Wi-Fi, PPP

**Comparaison OSI vs TCP/IP:**
- OSI est un modele theorique de reference
- TCP/IP est le modele pratique utilise sur Internet
- TCP/IP est plus simple mais moins detaille`,
        keyPoints: [
          'TCP/IP est le modele utilise dans les reseaux reels',
          'Il fusionne les couches superieures en une seule couche Application',
          'La couche Internet gere l\'adressage IP et le routage',
          'La couche Acces reseau gere la connexion physique'
        ]
      }
    ]
  },
  {
    id: 'ch2-topologies',
    number: 2,
    title: 'Topologies de reseaux',
    description: 'Les differentes architectures physiques des reseaux',
    sections: [
      {
        id: 'sec-bus-topology',
        title: 'Topologie en bus',
        content: `Dans une topologie en bus, tous les equipements sont connectes a un cable unique (le bus).

**Caracteristiques:**
- Cable unique partage par tous les equipements
- Terminateurs aux extremites pour eviter les reflexions de signal
- Collision possible si deux equipements emettent simultanement

**Avantages:**
- Simple a installer
- Peu couteux en cablage
- Facile a etendre

**Inconvenients:**
- Une coupure du bus coupe tout le reseau
- Performances degradees avec beaucoup d'equipements
- Difficile a depanner
- Obsolete aujourd'hui`,
        keyPoints: [
          'Tous les equipements partagent un meme cable',
          'Utilise le protocole CSMA/CD pour gerer les collisions',
          'Topologie historique, rarement utilisee aujourd\'hui'
        ]
      },
      {
        id: 'sec-star-topology',
        title: 'Topologie en etoile',
        content: `La topologie en etoile est la plus courante aujourd'hui. Tous les equipements sont connectes a un noeud central (switch ou hub).

**Caracteristiques:**
- Point central (switch) qui redistribue le trafic
- Chaque equipement a son propre cable vers le switch
- Isolation des pannes

**Avantages:**
- Panne d'un equipement n'affecte pas les autres
- Facile a depanner (LED sur le switch)
- Performances previsibles
- Facile a gerer et etendre

**Inconvenients:**
- Le switch est un point de defaillance unique
- Plus de cablage necessaire
- Cout du switch central`,
        keyPoints: [
          'Topologie la plus utilisee dans les reseaux locaux',
          'Le switch est le point central de connexion',
          'Chaque appareil a sa propre connexion dediee',
          'Isolation des pannes: un cable coupe n\'affecte qu\'un seul appareil'
        ]
      },
      {
        id: 'sec-ring-topology',
        title: 'Topologie en anneau',
        content: `Dans une topologie en anneau, chaque equipement est connecte a deux voisins, formant une boucle fermee.

**Caracteristiques:**
- Les donnees circulent dans un sens (ou deux pour double anneau)
- Chaque equipement regenere le signal
- Utilise un jeton (token) pour controler l'acces

**Avantages:**
- Pas de collision (acces controle par jeton)
- Performances previsibles sous forte charge
- Chaque noeud regenere le signal

**Inconvenients:**
- Une panne peut couper l'anneau entier
- Ajout d'equipement necessite l'arret du reseau
- Latence proportionnelle au nombre de noeuds

**Exemples:** Token Ring (IBM), FDDI`,
        keyPoints: [
          'Les donnees circulent en boucle fermee',
          'Utilise un mecanisme de jeton (token passing)',
          'Moins courant que la topologie en etoile'
        ]
      },
      {
        id: 'sec-mesh-topology',
        title: 'Topologie maillee',
        content: `Dans une topologie maillee, chaque equipement est connecte a plusieurs autres, offrant de la redondance.

**Types de maillage:**
- **Maillage complet:** Chaque noeud est connecte a tous les autres
- **Maillage partiel:** Certains noeuds ont des connexions multiples

**Avantages:**
- Haute disponibilite (chemins alternatifs)
- Tolerant aux pannes
- Repartition de charge possible

**Inconvenients:**
- Tres couteux en cablage
- Complexe a gerer
- Nombre de connexions = n(n-1)/2 pour maillage complet

**Utilisation:** Reseaux WAN, dorsales (backbone), reseaux critiques`,
        keyPoints: [
          'Redondance des liens pour la haute disponibilite',
          'Utilisee pour les infrastructures critiques',
          'Le maillage complet est couteux mais tres resilient'
        ]
      }
    ]
  },
  {
    id: 'ch3-protocols',
    number: 3,
    title: 'Protocoles reseau',
    description: 'Fonctionnement des protocoles Ethernet, IP, TCP, UDP, ICMP, DHCP, DNS',
    sections: [
      {
        id: 'ethernet',
        title: 'Ethernet (IEEE 802.3)',
        content: `Ethernet est le protocole de couche 2 (liaison) le plus utilise dans les reseaux locaux.

**Caracteristiques:**
- Adressage par adresse MAC (48 bits, ex: 00:1A:2B:3C:4D:5E)
- Trame Ethernet avec en-tete, donnees et CRC
- Vitesses: 10 Mbps, 100 Mbps, 1 Gbps, 10 Gbps, 100 Gbps

**Structure d'une trame Ethernet:**
| Preambule | MAC Dest | MAC Source | Type/Longueur | Donnees | FCS |
|    8      |    6     |     6      |      2        | 46-1500 |  4  |

**CSMA/CD (Carrier Sense Multiple Access with Collision Detection):**
1. Ecoute du support (Carrier Sense)
2. Envoi si libre
3. Detection de collision
4. Backoff aleatoire si collision`,
        keyPoints: [
          'Protocole de couche 2 (Liaison de donnees)',
          'Utilise des adresses MAC uniques de 48 bits',
          'Taille maximale d\'une trame: 1518 octets',
          'CSMA/CD gere les collisions (obsolete avec les switches full-duplex)'
        ]
      },
      {
        id: 'ip-protocol',
        title: 'Protocole IP (Internet Protocol)',
        content: `IP est le protocole de couche 3 qui permet l'adressage et le routage des paquets.

**IPv4:**
- Adresse sur 32 bits (ex: 192.168.1.1)
- Divisee en partie reseau et partie hote
- Masque de sous-reseau pour definir la frontiere

**En-tete IPv4 (20-60 octets):**
- Version (4 bits)
- Longueur d'en-tete (4 bits)
- Type de service (8 bits)
- Longueur totale (16 bits)
- TTL - Time To Live (8 bits)
- Protocole (8 bits): 1=ICMP, 6=TCP, 17=UDP
- Adresse source (32 bits)
- Adresse destination (32 bits)

**IPv6:**
- Adresse sur 128 bits (ex: 2001:0db8::1)
- Espace d'adressage beaucoup plus grand
- Simplification de l'en-tete`,
        keyPoints: [
          'Protocole de couche 3 (Reseau)',
          'Assure l\'adressage logique et le routage',
          'IPv4 utilise des adresses de 32 bits',
          'TTL empeche les boucles infinies de paquets'
        ]
      },
      {
        id: 'tcp-protocol',
        title: 'Protocole TCP (Transmission Control Protocol)',
        content: `TCP est un protocole de couche 4 qui assure une transmission fiable des donnees.

**Caracteristiques:**
- Oriente connexion (etablit une connexion avant l'envoi)
- Fiable (accusees de reception, retransmission)
- Controle de flux et de congestion
- Segmentation des donnees

**Etablissement de connexion (Three-Way Handshake):**
1. Client -> SYN -> Serveur
2. Client <- SYN-ACK <- Serveur
3. Client -> ACK -> Serveur

**Fermeture de connexion (Four-Way Handshake):**
1. Client -> FIN -> Serveur
2. Client <- ACK <- Serveur
3. Client <- FIN <- Serveur
4. Client -> ACK -> Serveur

**Ports TCP courants:**
- 80: HTTP
- 443: HTTPS
- 22: SSH
- 25: SMTP
- 53: DNS`,
        keyPoints: [
          'Protocole de couche 4 (Transport) fiable',
          'Etablit une connexion avec le three-way handshake',
          'Garantit la livraison ordonnee des donnees',
          'Utilise des numeros de sequence et accusees de reception'
        ]
      },
      {
        id: 'udp-protocol',
        title: 'Protocole UDP (User Datagram Protocol)',
        content: `UDP est un protocole de couche 4 simple et rapide, mais non fiable.

**Caracteristiques:**
- Sans connexion (pas de handshake)
- Non fiable (pas d'accusee de reception)
- Pas de controle de flux
- Faible surcharge (en-tete de 8 octets seulement)

**En-tete UDP:**
| Port Source | Port Dest | Longueur | Checksum |
|     2       |     2     |    2     |    2     |

**Utilisation:**
- Streaming video/audio (temps reel)
- Jeux en ligne
- DNS (petites requetes)
- DHCP
- VoIP

**Ports UDP courants:**
- 53: DNS
- 67/68: DHCP
- 123: NTP
- 161: SNMP`,
        keyPoints: [
          'Protocole de couche 4 non fiable mais rapide',
          'Pas de connexion ni d\'accusee de reception',
          'Ideal pour le temps reel (streaming, jeux)',
          'En-tete minimal de 8 octets'
        ]
      },
      {
        id: 'icmp-protocol',
        title: 'Protocole ICMP (Internet Control Message Protocol)',
        content: `ICMP est un protocole de couche 3 utilise pour le diagnostic et les messages d'erreur.

**Messages ICMP courants:**
- **Echo Request/Reply (Type 8/0):** Utilise par ping
- **Destination Unreachable (Type 3):** Destination inaccessible
- **Time Exceeded (Type 11):** TTL expire (utilise par traceroute)
- **Redirect (Type 5):** Redirection de route

**Commande ping:**
\`\`\`
ping 192.168.1.1
\`\`\`
Envoie des Echo Request et attend les Echo Reply.
Mesure le RTT (Round-Trip Time).

**Commande traceroute/tracert:**
\`\`\`
traceroute 8.8.8.8
\`\`\`
Utilise le TTL incrementalement pour decouvrir le chemin.`,
        keyPoints: [
          'Protocole de diagnostic reseau',
          'Ping utilise ICMP Echo Request/Reply',
          'Traceroute utilise les messages TTL Exceeded',
          'Permet de detecter les problemes de connectivite'
        ]
      },
      {
        id: 'sec-dhcp',
        title: 'Protocole DHCP (Dynamic Host Configuration Protocol)',
        content: `DHCP permet l'attribution automatique des parametres reseau aux clients.

**Processus DORA:**
1. **Discover:** Le client envoie un broadcast pour trouver un serveur DHCP
2. **Offer:** Le serveur propose une adresse IP
3. **Request:** Le client demande l'adresse proposee
4. **Acknowledge:** Le serveur confirme et envoie les parametres

**Parametres fournis par DHCP:**
- Adresse IP
- Masque de sous-reseau
- Passerelle par defaut
- Serveurs DNS
- Duree du bail (lease time)

**Ports utilises:**
- Serveur: UDP 67
- Client: UDP 68

**Renouvellement du bail:**
- A 50% du bail: Renouvellement unicast au serveur
- A 87.5%: Broadcast si echec`,
        keyPoints: [
          'Attribution automatique d\'adresses IP',
          'Processus en 4 etapes: DORA',
          'Utilise UDP sur les ports 67 (serveur) et 68 (client)',
          'Le bail a une duree limitee et doit etre renouvele'
        ]
      },
      {
        id: 'dns-protocol',
        title: 'Protocole DNS (Domain Name System)',
        content: `DNS traduit les noms de domaine en adresses IP.

**Hierarchie DNS:**
- Serveurs racine (.)
- TLD: .com, .fr, .org
- Domaines: google.com, exemple.fr
- Sous-domaines: www.google.com

**Types d'enregistrements:**
- **A:** Nom -> IPv4
- **AAAA:** Nom -> IPv6
- **CNAME:** Alias vers un autre nom
- **MX:** Serveur de messagerie
- **NS:** Serveur de noms autoritaire
- **PTR:** IPv4 -> Nom (resolution inverse)
- **SOA:** Start of Authority

**Resolution DNS:**
1. Client interroge son resolveur local
2. Si pas en cache, interroge serveur racine
3. Puis serveur TLD
4. Puis serveur autoritaire du domaine

**Commandes:**
\`\`\`
nslookup google.com
dig google.com
\`\`\``,
        keyPoints: [
          'Traduit les noms de domaine en adresses IP',
          'Structure hierarchique (racine, TLD, domaines)',
          'Utilise UDP port 53 (TCP pour les transferts de zone)',
          'Mise en cache pour ameliorer les performances'
        ]
      }
    ]
  },
  {
    id: 'ch4-addressing',
    number: 4,
    title: 'Adressage IP et sous-reseaux',
    description: 'Classes IP, masques de sous-reseau, calculs binaires',
    sections: [
      {
        id: 'sec-ip-classes',
        title: 'Classes d\'adresses IP',
        content: `Les adresses IPv4 etaient historiquement divisees en classes:

**Classe A (0.0.0.0 - 127.255.255.255):**
- Premier octet: 1-126 (0 et 127 reserves)
- Masque par defaut: 255.0.0.0 (/8)
- 126 reseaux, ~16 millions d'hotes chacun
- Premier bit: 0

**Classe B (128.0.0.0 - 191.255.255.255):**
- Premier octet: 128-191
- Masque par defaut: 255.255.0.0 (/16)
- ~16 000 reseaux, ~65 000 hotes chacun
- Premiers bits: 10

**Classe C (192.0.0.0 - 223.255.255.255):**
- Premier octet: 192-223
- Masque par defaut: 255.255.255.0 (/24)
- ~2 millions de reseaux, 254 hotes chacun
- Premiers bits: 110

**Classe D (224.0.0.0 - 239.255.255.255):**
- Multicast

**Classe E (240.0.0.0 - 255.255.255.255):**
- Reserve pour experimentation

**Adresses privees (RFC 1918):**
- 10.0.0.0/8 (Classe A)
- 172.16.0.0/12 (Classe B)
- 192.168.0.0/16 (Classe C)`,
        keyPoints: [
          'Classe A: grands reseaux (1-126.x.x.x)',
          'Classe B: reseaux moyens (128-191.x.x.x)',
          'Classe C: petits reseaux (192-223.x.x.x)',
          'Les classes sont obsoletes, remplacees par CIDR',
          'Les plages privees ne sont pas routables sur Internet'
        ]
      },
      {
        id: 'subnet-mask',
        title: 'Masque de sous-reseau',
        content: `Le masque de sous-reseau definit la partie reseau et la partie hote d'une adresse IP.

**Notation:**
- Decimale: 255.255.255.0
- CIDR: /24

**Exemples de masques:**
| CIDR | Masque           | Hotes disponibles |
|------|------------------|-------------------|
| /8   | 255.0.0.0        | 16 777 214        |
| /16  | 255.255.0.0      | 65 534            |
| /24  | 255.255.255.0    | 254               |
| /25  | 255.255.255.128  | 126               |
| /26  | 255.255.255.192  | 62                |
| /27  | 255.255.255.224  | 30                |
| /28  | 255.255.255.240  | 14                |
| /29  | 255.255.255.248  | 6                 |
| /30  | 255.255.255.252  | 2                 |

**Calcul du nombre d'hotes:**
Nombre d'hotes = 2^(32-CIDR) - 2

On soustrait 2 pour:
- L'adresse reseau (tous les bits hote a 0)
- L'adresse de broadcast (tous les bits hote a 1)`,
        keyPoints: [
          'Le masque separe la partie reseau de la partie hote',
          'Notation CIDR: /24 = 24 bits pour le reseau',
          'Plus le CIDR est grand, moins il y a d\'hotes',
          'Formule: hotes = 2^(32-CIDR) - 2'
        ]
      },
      {
        id: 'binary-arithmetic',
        title: 'Arithmetique binaire et hexadecimale',
        content: `La comprehension du binaire est essentielle pour le calcul des sous-reseaux.

**Conversion decimale -> binaire:**
192 = 128 + 64 = 11000000

| 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |
|-----|----|----|----|----|---|---|---|
|  1  | 1  | 0  | 0  | 0  | 0 | 0 | 0 |

**Exemple d'adresse IP en binaire:**
192.168.1.10 =
11000000.10101000.00000001.00001010

**Calcul de l'adresse reseau:**
IP:     192.168.1.10  = 11000000.10101000.00000001.00001010
Masque: 255.255.255.0 = 11111111.11111111.11111111.00000000
Reseau: 192.168.1.0   = 11000000.10101000.00000001.00000000
(AND logique entre IP et masque)

**Hexadecimal (base 16):**
0-9, A-F (A=10, B=11, C=12, D=13, E=14, F=15)
Utilise pour les adresses MAC: 00:1A:2B:3C:4D:5E`,
        keyPoints: [
          'Chaque octet = 8 bits (0-255)',
          'Puissances de 2: 128, 64, 32, 16, 8, 4, 2, 1',
          'AND logique entre IP et masque donne l\'adresse reseau',
          'L\'hexadecimal utilise 0-9 et A-F'
        ]
      },
      {
        id: 'subnetting',
        title: 'Decoupage en sous-reseaux (Subnetting)',
        content: `Le subnetting permet de diviser un reseau en plusieurs sous-reseaux.

**Methode de calcul:**
1. Determiner le nombre de sous-reseaux necessaires
2. Calculer le nombre de bits a emprunter: 2^n >= nb sous-reseaux
3. Nouveau masque = ancien masque + bits empruntes
4. Calculer les plages d'adresses

**Exemple: Diviser 192.168.1.0/24 en 4 sous-reseaux**

Bits a emprunter: 2^2 = 4 sous-reseaux
Nouveau masque: /24 + 2 = /26 (255.255.255.192)
Taille de chaque sous-reseau: 2^(32-26) = 64 adresses

| Sous-reseau | Adresse reseau | Premiere IP  | Derniere IP   | Broadcast     |
|-------------|----------------|--------------|---------------|---------------|
| 1           | 192.168.1.0    | 192.168.1.1  | 192.168.1.62  | 192.168.1.63  |
| 2           | 192.168.1.64   | 192.168.1.65 | 192.168.1.126 | 192.168.1.127 |
| 3           | 192.168.1.128  | 192.168.1.129| 192.168.1.190 | 192.168.1.191 |
| 4           | 192.168.1.192  | 192.168.1.193| 192.168.1.254 | 192.168.1.255 |

**VLSM (Variable Length Subnet Mask):**
Permet d'utiliser des masques differents pour optimiser l'espace d'adressage.`,
        keyPoints: [
          'Subnetting divise un reseau en sous-reseaux plus petits',
          'Chaque bit emprunte double le nombre de sous-reseaux',
          'La premiere adresse est l\'adresse reseau',
          'La derniere adresse est le broadcast',
          'VLSM permet d\'optimiser l\'allocation d\'adresses'
        ]
      }
    ]
  },
  {
    id: 'ch5-os-network',
    number: 5,
    title: 'Systemes d\'exploitation reseau',
    description: 'Administration Windows et Linux, Bash et PowerShell',
    sections: [
      {
        id: 'windows-admin',
        title: 'Administration Windows',
        content: `**Gestion des utilisateurs:**
- Interface graphique: lusrmgr.msc (Utilisateurs et groupes locaux)
- Commandes: net user, net localgroup

\`\`\`powershell
# Creer un utilisateur
net user jean P@ssw0rd! /add

# Ajouter a un groupe
net localgroup Administrateurs jean /add

# Lister les utilisateurs
net user
\`\`\`

**Partage de ressources:**
- Clic droit sur dossier > Proprietes > Partage
- Ou: net share

\`\`\`powershell
# Creer un partage
net share MonPartage=C:\\Donnees /grant:Utilisateurs,READ

# Lister les partages
net share
\`\`\`

**Configuration reseau:**
- Panneau de configuration > Centre Reseau et partage
- Ou: ncpa.cpl

**Services:**
- services.msc (interface graphique)
- sc query, sc start, sc stop (ligne de commande)`,
        keyPoints: [
          'lusrmgr.msc pour gerer les utilisateurs locaux',
          'net user et net localgroup pour la ligne de commande',
          'net share pour gerer les partages',
          'services.msc pour gerer les services'
        ]
      },
      {
        id: 'linux-admin',
        title: 'Administration Linux',
        content: `**Gestion des utilisateurs:**
\`\`\`bash
# Creer un utilisateur
sudo useradd -m -s /bin/bash jean

# Definir le mot de passe
sudo passwd jean

# Ajouter a un groupe
sudo usermod -aG sudo jean

# Lister les utilisateurs
cat /etc/passwd
\`\`\`

**Services reseau:**
\`\`\`bash
# Installer un serveur DHCP
sudo apt install isc-dhcp-server

# Configurer /etc/dhcp/dhcpd.conf
subnet 192.168.1.0 netmask 255.255.255.0 {
  range 192.168.1.100 192.168.1.200;
  option routers 192.168.1.1;
  option domain-name-servers 8.8.8.8;
}

# Demarrer le service
sudo systemctl start isc-dhcp-server
sudo systemctl enable isc-dhcp-server
\`\`\`

**Configuration reseau (Netplan - Ubuntu):**
\`\`\`yaml
# /etc/netplan/01-config.yaml
network:
  ethernets:
    eth0:
      addresses: [192.168.1.10/24]
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
\`\`\`

\`\`\`bash
sudo netplan apply
\`\`\``,
        keyPoints: [
          'useradd, usermod, passwd pour gerer les utilisateurs',
          'systemctl pour gerer les services (start, stop, enable)',
          'Netplan ou /etc/network/interfaces pour la config reseau',
          'apt ou yum pour installer des paquets'
        ]
      },
      {
        id: 'bash-intro',
        title: 'Introduction a Bash',
        content: `Bash est le shell par defaut sur la plupart des distributions Linux.

**Commandes de base:**
\`\`\`bash
# Navigation
pwd          # Repertoire courant
ls -la       # Lister avec details
cd /chemin   # Changer de repertoire

# Fichiers
cat fichier  # Afficher contenu
cp src dest  # Copier
mv src dest  # Deplacer/renommer
rm fichier   # Supprimer
mkdir dossier # Creer un dossier

# Permissions
chmod 755 script.sh  # rwxr-xr-x
chown user:group fichier

# Recherche
grep "motif" fichier
find /chemin -name "*.txt"
\`\`\`

**Scripts Bash:**
\`\`\`bash
#!/bin/bash
# Premier script

echo "Hello World"

# Variables
NOM="Jean"
echo "Bonjour $NOM"

# Conditions
if [ "$NOM" == "Jean" ]; then
  echo "C'est Jean!"
fi

# Boucles
for i in 1 2 3; do
  echo "Numero: $i"
done
\`\`\``,
        keyPoints: [
          'Bash est le shell standard de Linux',
          'Les scripts commencent par #!/bin/bash',
          'Variables: NOM="valeur", utilisation: $NOM',
          'Permissions: chmod pour modifier, chown pour proprietaire'
        ]
      },
      {
        id: 'powershell-intro',
        title: 'Introduction a PowerShell',
        content: `PowerShell est le shell avance de Windows avec une syntaxe orientee objet.

**Commandes de base (cmdlets):**
\`\`\`powershell
# Navigation
Get-Location       # pwd
Set-Location C:\\   # cd
Get-ChildItem      # ls

# Fichiers
Get-Content fichier.txt    # cat
Copy-Item src dest         # cp
Move-Item src dest         # mv
Remove-Item fichier        # rm
New-Item -Type Directory dossier  # mkdir

# Alias
# PowerShell a des alias pour les commandes Unix
# ls, cd, pwd, cat, cp, mv, rm fonctionnent aussi
\`\`\`

**Cmdlets reseau:**
\`\`\`powershell
# Configuration IP
Get-NetIPAddress
Get-NetIPConfiguration
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.1.10 -PrefixLength 24

# DNS
Get-DnsClientServerAddress
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 8.8.8.8

# Test connexion
Test-NetConnection google.com
Test-NetConnection -ComputerName 192.168.1.1 -Port 80
\`\`\`

**Scripts PowerShell:**
\`\`\`powershell
# Variables
$Nom = "Jean"
Write-Host "Bonjour $Nom"

# Conditions
if ($Nom -eq "Jean") {
    Write-Host "C'est Jean!"
}

# Boucles
foreach ($i in 1..3) {
    Write-Host "Numero: $i"
}
\`\`\``,
        keyPoints: [
          'PowerShell utilise des cmdlets (Verbe-Nom)',
          'Get-Command pour lister les cmdlets disponibles',
          'Get-Help cmdlet pour obtenir de l\'aide',
          'Les objets permettent le pipeline (|) avance'
        ]
      }
    ]
  },
  {
    id: 'ch6-diagnostics',
    number: 6,
    title: 'Outils de diagnostic',
    description: 'Commandes reseau essentielles et outils de depannage',
    sections: [
      {
        id: 'sec-network-commands',
        title: 'ipconfig / ip',
        content: `Ces commandes affichent et configurent la configuration IP.

**Windows - ipconfig:**
\`\`\`cmd
# Afficher la configuration
ipconfig

# Afficher les details complets
ipconfig /all

# Liberer l'adresse DHCP
ipconfig /release

# Renouveler l'adresse DHCP
ipconfig /renew

# Vider le cache DNS
ipconfig /flushdns

# Afficher le cache DNS
ipconfig /displaydns
\`\`\`

**Linux - ip:**
\`\`\`bash
# Afficher les interfaces
ip addr show
ip a

# Afficher une interface specifique
ip addr show eth0

# Configurer une adresse IP
sudo ip addr add 192.168.1.10/24 dev eth0

# Activer/desactiver une interface
sudo ip link set eth0 up
sudo ip link set eth0 down

# Afficher la table de routage
ip route show
\`\`\``,
        keyPoints: [
          'ipconfig (Windows) / ip addr (Linux) pour voir la config',
          'ipconfig /all pour les details complets (MAC, DHCP, DNS)',
          'ipconfig /release et /renew pour le bail DHCP',
          'ip route pour la table de routage sur Linux'
        ]
      },
      {
        id: 'ping-cmd',
        title: 'ping',
        content: `Ping teste la connectivite reseau en envoyant des paquets ICMP.

**Utilisation:**
\`\`\`bash
# Ping simple
ping 192.168.1.1
ping google.com

# Nombre de pings specifique (Linux: -c, Windows: -n)
ping -c 4 192.168.1.1    # Linux
ping -n 4 192.168.1.1    # Windows

# Ping continu
ping 192.168.1.1         # Linux (Ctrl+C pour arreter)
ping -t 192.168.1.1      # Windows

# Taille du paquet
ping -s 1000 192.168.1.1 # Linux
ping -l 1000 192.168.1.1 # Windows
\`\`\`

**Interpretation des resultats:**
- **Reply from:** Reponse recue, hote accessible
- **Request timed out:** Pas de reponse (pare-feu, hote eteint)
- **Destination host unreachable:** Pas de route vers l'hote
- **TTL:** Nombre de sauts restants
- **time:** Temps de reponse (RTT) en ms

**Cas d'usage:**
1. Verifier si un hote est en ligne
2. Mesurer la latence
3. Detecter une perte de paquets`,
        keyPoints: [
          'Ping utilise ICMP Echo Request/Reply',
          'TTL indique le nombre de sauts avant expiration',
          'Le temps (ms) mesure la latence aller-retour',
          'Utile pour le diagnostic de base de connectivite'
        ]
      },
      {
        id: 'traceroute-cmd',
        title: 'traceroute / tracert',
        content: `Traceroute affiche le chemin emprunte par les paquets.

**Utilisation:**
\`\`\`bash
# Linux
traceroute google.com
traceroute -n 8.8.8.8    # Sans resolution DNS

# Windows
tracert google.com
tracert -d 8.8.8.8       # Sans resolution DNS
\`\`\`

**Fonctionnement:**
1. Envoie un paquet avec TTL=1
2. Le premier routeur decremente TTL a 0 et repond "Time Exceeded"
3. Envoie un paquet avec TTL=2
4. Le deuxieme routeur repond
5. Continue jusqu'a atteindre la destination

**Interpretation:**
\`\`\`
1   1.234 ms   192.168.1.1      # Passerelle locale
2  10.456 ms   10.0.0.1         # Routeur FAI
3  15.789 ms   172.16.0.1       # Coeur de reseau
4   * * *                        # Pas de reponse (filtrage ICMP)
5  25.123 ms   8.8.8.8          # Destination
\`\`\`

**Cas d'usage:**
1. Identifier ou le trafic est bloque
2. Detecter les goulots d'etranglement
3. Comprendre le chemin reseau`,
        keyPoints: [
          'Utilise le TTL incrementalement pour decouvrir le chemin',
          'Chaque ligne = un routeur sur le chemin',
          '* * * indique un routeur qui ne repond pas (normal)',
          'Utile pour localiser les problemes de routage'
        ]
      },
      {
        id: 'netstat-ss',
        title: 'netstat / ss',
        content: `Ces commandes affichent les connexions reseau et ports ouverts.

**Windows - netstat:**
\`\`\`cmd
# Toutes les connexions
netstat -a

# Avec les PID des processus
netstat -ano

# Connexions etablies seulement
netstat -an | findstr ESTABLISHED

# Statistiques par protocole
netstat -s
\`\`\`

**Linux - ss (remplace netstat):**
\`\`\`bash
# Toutes les connexions
ss -a

# Connexions TCP
ss -t

# Ports en ecoute
ss -l

# Avec les processus
ss -tulnp

# Connexions etablies
ss -t state established
\`\`\`

**Etats des connexions TCP:**
- LISTENING: En attente de connexion
- ESTABLISHED: Connexion active
- TIME_WAIT: Fermeture en cours
- CLOSE_WAIT: Attente de fermeture locale`,
        keyPoints: [
          'netstat -ano (Windows) / ss -tulnp (Linux) pour les ports ouverts',
          'Permet d\'identifier quel processus utilise quel port',
          'LISTENING = port ouvert en attente de connexion',
          'ESTABLISHED = connexion active'
        ]
      },
      {
        id: 'nslookup-dig',
        title: 'nslookup / dig',
        content: `Ces outils permettent d'interroger les serveurs DNS.

**nslookup (Windows/Linux):**
\`\`\`bash
# Resolution simple
nslookup google.com

# Utiliser un serveur DNS specifique
nslookup google.com 8.8.8.8

# Mode interactif
nslookup
> server 8.8.8.8
> set type=MX
> google.com
\`\`\`

**dig (Linux - plus puissant):**
\`\`\`bash
# Resolution simple
dig google.com

# Type d'enregistrement specifique
dig google.com MX
dig google.com NS
dig google.com TXT

# Reponse courte
dig +short google.com

# Utiliser un serveur DNS specifique
dig @8.8.8.8 google.com

# Trace de la resolution
dig +trace google.com
\`\`\`

**Types d'enregistrements:**
- A: Adresse IPv4
- AAAA: Adresse IPv6
- MX: Serveur mail
- NS: Serveur de noms
- CNAME: Alias
- TXT: Texte (SPF, DKIM, etc.)`,
        keyPoints: [
          'nslookup pour les requetes DNS simples',
          'dig est plus puissant et detaille',
          'Permet de diagnostiquer les problemes DNS',
          'dig +trace montre la resolution complete'
        ]
      }
    ]
  }
];

export function getChapterById(id: string): TheoryChapter | undefined {
  return theoryChapters.find(ch => ch.id === id);
}

export function getSectionById(sectionId: string): TheorySection | undefined {
  for (const chapter of theoryChapters) {
    const section = chapter.sections.find(s => s.id === sectionId);
    if (section) return section;
  }
  return undefined;
}
