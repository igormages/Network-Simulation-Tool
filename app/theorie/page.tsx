'use client';

import React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { theoryChapters, type TheoryChapter, type TheorySection } from '@/lib/theory-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  BookOpen,
  Network,
  Layers,
  Globe,
  Server,
  Terminal,
  Wrench,
  ChevronRight,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import {
  OSIModelDiagram,
  TCPIPModelDiagram,
  StarTopologyDiagram,
  BusTopologyDiagram,
  RingTopologyDiagram,
  MeshTopologyDiagram,
  IPClassesDiagram,
  DHCPProcessDiagram,
  EncapsulationDiagram,
  NetworkCommandsDiagram,
} from '@/components/diagrams/network-diagrams';

// Map section IDs to their diagrams
const sectionDiagrams: Record<string, React.ComponentType<{ className?: string }>> = {
  'sec-osi-model': OSIModelDiagram,
  'sec-tcpip-model': TCPIPModelDiagram,
  'sec-encapsulation': EncapsulationDiagram,
  'sec-star-topology': StarTopologyDiagram,
  'sec-bus-topology': BusTopologyDiagram,
  'sec-ring-topology': RingTopologyDiagram,
  'sec-mesh-topology': MeshTopologyDiagram,
  'sec-ip-classes': IPClassesDiagram,
  'sec-dhcp': DHCPProcessDiagram,
  'sec-network-commands': NetworkCommandsDiagram,
};

const chapterIcons: Record<string, React.ElementType> = {
  'ch1-models': Layers,
  'ch2-topologies': Network,
  'ch3-protocols': Globe,
  'ch4-addressing': Server,
  'ch5-os-network': Terminal,
  'ch6-diagnostics': Wrench,
};

export default function TheoriePage() {
  const [selectedChapter, setSelectedChapter] = useState<TheoryChapter | null>(null);
  const [selectedSection, setSelectedSection] = useState<TheorySection | null>(null);

  if (selectedSection && selectedChapter) {
    return (
      <SectionView
        chapter={selectedChapter}
        section={selectedSection}
        onBack={() => setSelectedSection(null)}
        onSelectSection={setSelectedSection}
      />
    );
  }

  if (selectedChapter) {
    return (
      <ChapterView
        chapter={selectedChapter}
        onBack={() => setSelectedChapter(null)}
        onSelectSection={setSelectedSection}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Cours Theoriques</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/exercices">
            <Button variant="outline" size="sm">
              Exercices Pratiques
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold text-foreground">Infrastructure Reseaux</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cours complet couvrant les modeles de reference, les topologies, les protocoles, 
            l'adressage IP, l'administration systeme et les outils de diagnostic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {theoryChapters.map((chapter) => {
            const Icon = chapterIcons[chapter.id] || BookOpen;
            return (
              <Card
                key={chapter.id}
                className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group"
                onClick={() => setSelectedChapter(chapter)}
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Chapitre {chapter.number}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-1 group-hover:text-primary transition-colors">
                        {chapter.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{chapter.description}</CardDescription>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{chapter.sections.length} sections</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function ChapterView({
  chapter,
  onBack,
  onSelectSection,
}: {
  chapter: TheoryChapter;
  onBack: () => void;
  onSelectSection: (section: TheorySection) => void;
}) {
  const Icon = chapterIcons[chapter.id] || BookOpen;

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Chapitre {chapter.number}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="space-y-2 mb-8">
          <Badge variant="outline">Chapitre {chapter.number}</Badge>
          <h1 className="text-3xl font-bold text-foreground">{chapter.title}</h1>
          <p className="text-muted-foreground">{chapter.description}</p>
        </div>

        <div className="space-y-4">
          {chapter.sections.map((section, index) => (
            <Card
              key={section.id}
              className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => onSelectSection(section)}
            >
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

function SectionView({
  chapter,
  section,
  onBack,
  onSelectSection,
}: {
  chapter: TheoryChapter;
  section: TheorySection;
  onBack: () => void;
  onSelectSection: (section: TheorySection) => void;
}) {
  const currentIndex = chapter.sections.findIndex((s) => s.id === section.id);
  const prevSection = currentIndex > 0 ? chapter.sections[currentIndex - 1] : null;
  const nextSection =
    currentIndex < chapter.sections.length - 1 ? chapter.sections[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden lg:block">
        <div className="p-4 border-b border-border">
          <Button variant="ghost" size="sm" onClick={onBack} className="w-full justify-start">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {chapter.title}
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-57px)]">
          <div className="p-2">
            {chapter.sections.map((s, index) => (
              <button
                key={s.id}
                onClick={() => onSelectSection(s)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  s.id === section.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-secondary'
                )}
              >
                {index + 1}. {s.title}
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto py-8 px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={onBack} className="hover:text-primary">
              Chapitre {chapter.number}
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{section.title}</span>
          </div>

          {/* Section Title */}
          <h1 className="text-3xl font-bold text-foreground mb-6">{section.title}</h1>

          {/* Diagram if available */}
          {sectionDiagrams[section.id] && (
            <Card className="mb-6 bg-secondary/30 border-border">
              <CardContent className="p-2">
                {React.createElement(sectionDiagrams[section.id], {
                  className: 'w-full max-w-2xl mx-auto',
                })}
              </CardContent>
            </Card>
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <div className="text-foreground whitespace-pre-wrap leading-relaxed">
              {section.content.split('\n').map((line, i) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <h3 key={i} className="text-lg font-semibold text-foreground mt-6 mb-3">
                      {line.replace(/\*\*/g, '')}
                    </h3>
                  );
                }
                if (line.startsWith('```')) {
                  return null;
                }
                if (line.match(/^\|.*\|$/)) {
                  return (
                    <code key={i} className="block text-sm text-muted-foreground font-mono">
                      {line}
                    </code>
                  );
                }
                if (line.trim() === '') {
                  return <br key={i} />;
                }
                return (
                  <p key={i} className="text-muted-foreground mb-2">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Key Points */}
          {section.keyPoints && section.keyPoints.length > 0 && (
            <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h3 className="flex items-center gap-2 font-semibold text-primary mb-3">
                <Lightbulb className="w-5 h-5" />
                Points cles a retenir
              </h3>
              <ul className="space-y-2">
                {section.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Examples */}
          {section.examples && section.examples.length > 0 && (
            <div className="mt-6 p-4 bg-secondary/50 border border-border rounded-lg">
              <h3 className="font-semibold text-foreground mb-3">Exemples</h3>
              <ul className="space-y-1">
                {section.examples.map((example, i) => (
                  <li key={i} className="text-sm text-muted-foreground font-mono">
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {prevSection ? (
              <Button variant="ghost" onClick={() => onSelectSection(prevSection)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {prevSection.title}
              </Button>
            ) : (
              <div />
            )}
            {nextSection ? (
              <Button variant="ghost" onClick={() => onSelectSection(nextSection)}>
                {nextSection.title}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Link href="/exercices">
                <Button>
                  Passer aux exercices
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
