'use client';

import { Tabs, Tab, Card, CardBody } from "@heroui/react";
import VideoManager from "./VideoManager";
import FlashcardManager from "./FlashcardManager";
import SummaryManager from "./SummaryManager";

interface ResourceManagerProps {
  type: 'lesson' | 'sublesson';
  id: number | null;
}

export default function ResourceManager({ type, id }: ResourceManagerProps) {
  if (!id) {
    return (
      <Card className="2xl:mx-20 mb-3 rounded-lg shadow-md border border-gray-200">
        <CardBody>
          <p className="text-center text-gray-500 py-4">
            Selecciona una {type === 'lesson' ? 'lección' : 'sublección'} para gestionar sus recursos
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="2xl:mx-20">
      <h2 className="text-xl font-bold mb-4">Recursos</h2>
      <Tabs aria-label="Resource Types">
        <Tab key="videos" title="Videos">
          <VideoManager type={type} id={id} />
        </Tab>
        <Tab key="flashcards" title="Flashcards">
          <FlashcardManager type={type} id={id} />
        </Tab>
        <Tab key="summaries" title="Resúmenes">
          <SummaryManager type={type} id={id} />
        </Tab>
      </Tabs>
    </div>
  );
}