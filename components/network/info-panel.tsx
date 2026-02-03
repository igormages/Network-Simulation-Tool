'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface InfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoPanel({ isOpen, onClose }: InfoPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[80vh] bg-card border border-border rounded-lg shadow-xl  flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Guide des Notions Reseau</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="osi">
              <AccordionTrigger className="text-sm font-medium">
                Modele OSI (7 couches)
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <p>Le modele OSI decompose la communication reseau en 7 couches:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li><strong>Physique</strong> - Transmission des bits (cables, signaux)</li>
                  <li><strong>Liaison de donnees</strong> - Trames, adresses MAC, switches</li>
                  <li><strong>Reseau</strong> - Paquets IP, routage, routeurs</li>
                  <li><strong>Transport</strong> - TCP/UDP, ports, segments</li>
                  <li><strong>Session</strong> - Gestion des sessions</li>
                  <li><strong>Presentation</strong> - Encodage, chiffrement</li>
                  <li><strong>Application</strong> - HTTP, DNS, DHCP</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tcpip">
              <AccordionTrigger className="text-sm font-medium">
                Modele TCP/IP (4 couches)
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <p>Le modele TCP/IP est une version simplifiee du modele OSI:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li><strong>Acces reseau</strong> - Correspond aux couches 1 et 2 OSI</li>
                  <li><strong>Internet</strong> - Protocole IP, routage</li>
                  <li><strong>Transport</strong> - TCP (fiable) et UDP (rapide)</li>
                  <li><strong>Application</strong> - HTTP, FTP, DNS, DHCP</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ip">
              <AccordionTrigger className="text-sm font-medium">
                Adressage IP et Sous-reseaux
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <p><strong>Adresse IP (IPv4)</strong>: 4 octets separes par des points (ex: 192.168.1.10)</p>
                <p><strong>Classes d'adresses:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Classe A: 1.0.0.0 - 126.255.255.255 (masque /8)</li>
                  <li>Classe B: 128.0.0.0 - 191.255.255.255 (masque /16)</li>
                  <li>Classe C: 192.0.0.0 - 223.255.255.255 (masque /24)</li>
                </ul>
                <p><strong>Masque de sous-reseau:</strong> Determine la partie reseau et hote</p>
                <p>Exemple: 255.255.255.0 = /24 = 256 adresses (254 hotes utilisables)</p>
                <p><strong>Adresses privees (RFC 1918):</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>10.0.0.0/8</li>
                  <li>172.16.0.0/12</li>
                  <li>192.168.0.0/16</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="dhcp">
              <AccordionTrigger className="text-sm font-medium">
                Protocole DHCP
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <p>DHCP (Dynamic Host Configuration Protocol) attribue automatiquement les configurations IP.</p>
                <p><strong>Processus DORA:</strong></p>
                <ol className="list-decimal list-inside ml-2 space-y-1">
                  <li><strong>Discover</strong> - Le client envoie une requete broadcast</li>
                  <li><strong>Offer</strong> - Le serveur propose une adresse IP</li>
                  <li><strong>Request</strong> - Le client demande l'adresse proposee</li>
                  <li><strong>Acknowledge</strong> - Le serveur confirme l'attribution</li>
                </ol>
                <p><strong>Parametres fournis:</strong> IP, masque, passerelle, DNS, duree du bail</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="dns">
              <AccordionTrigger className="text-sm font-medium">
                Protocole DNS
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <p>DNS (Domain Name System) traduit les noms de domaine en adresses IP.</p>
                <p><strong>Types d'enregistrements:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li><strong>A</strong> - Nom vers IPv4</li>
                  <li><strong>AAAA</strong> - Nom vers IPv6</li>
                  <li><strong>CNAME</strong> - Alias de domaine</li>
                  <li><strong>MX</strong> - Serveur de messagerie</li>
                  <li><strong>PTR</strong> - Resolution inverse</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="routing">
              <AccordionTrigger className="text-sm font-medium">
                Routage
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <p>Le routage permet d'acheminer les paquets entre differents reseaux.</p>
                <p><strong>Table de routage:</strong> Contient les routes vers les reseaux de destination</p>
                <p><strong>Passerelle par defaut:</strong> Route utilisee quand aucune route specifique n'existe</p>
                <p><strong>Metriques:</strong> Cout/priorite pour choisir entre plusieurs routes</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="switching">
              <AccordionTrigger className="text-sm font-medium">
                Commutation (Switching)
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <p>Les switches operent au niveau 2 (liaison de donnees) du modele OSI.</p>
                <p><strong>Table d'adresses MAC:</strong> Associe les adresses MAC aux ports physiques</p>
                <p><strong>Broadcast:</strong> Envoi a tous les ports quand la destination est inconnue</p>
                <p><strong>VLAN:</strong> Segmentation logique du reseau sur un meme switch</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="protocols">
              <AccordionTrigger className="text-sm font-medium">
                Protocoles essentiels
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <ul className="space-y-2">
                  <li><strong>TCP</strong> - Transmission fiable, connexion etablie, verification des erreurs</li>
                  <li><strong>UDP</strong> - Transmission rapide sans connexion, pas de verification</li>
                  <li><strong>ICMP</strong> - Messages de controle (ping, traceroute)</li>
                  <li><strong>ARP</strong> - Resolution adresse IP vers MAC</li>
                  <li><strong>HTTP/HTTPS</strong> - Transfert de pages web</li>
                  <li><strong>SSH</strong> - Acces distant securise (port 22)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="commands">
              <AccordionTrigger className="text-sm font-medium">
                Commandes reseau essentielles
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Windows:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 font-mono text-xs">
                      <li>ipconfig - Configuration IP</li>
                      <li>ping - Test de connectivite</li>
                      <li>tracert - Trace de route</li>
                      <li>netstat - Connexions actives</li>
                      <li>nslookup - Requete DNS</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Linux:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 font-mono text-xs">
                      <li>ip addr / ifconfig - Configuration IP</li>
                      <li>ping - Test de connectivite</li>
                      <li>traceroute - Trace de route</li>
                      <li>ss / netstat - Connexions actives</li>
                      <li>dig / nslookup - Requete DNS</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="topologies">
              <AccordionTrigger className="text-sm font-medium">
                Topologies reseau
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <ul className="space-y-2">
                  <li><strong>Etoile</strong> - Tous les appareils connectes a un point central (switch)</li>
                  <li><strong>Bus</strong> - Tous les appareils sur un cable unique</li>
                  <li><strong>Anneau</strong> - Chaque appareil connecte a deux voisins</li>
                  <li><strong>Maillee</strong> - Chaque appareil connecte a plusieurs autres</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
