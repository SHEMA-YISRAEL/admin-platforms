'use client';

import { useState, useRef } from "react";
import { Tabs, Tab, Card, CardBody, Button } from "@heroui/react";
import VideoManager from "./VideoManager";
import FlashcardManager from "./FlashcardManager";
import SummaryManager from "./SummaryManager";

interface ResourceManagerProps {
  type: 'lesson' | 'sublesson';
  id: number | null;
}

export default function ResourceManager({ type, id }: ResourceManagerProps) {
  const [selectedTab, setSelectedTab] = useState<string | number>("videos");
  const videoManagerRef = useRef<{ handleCreate: () => void }>(null);
  const flashcardManagerRef = useRef<{ handleCreate: () => void }>(null);
  const summaryManagerRef = useRef<{ handleCreate: () => void }>(null);

  const handleNewResource = () => {
    if (selectedTab === "videos") {
      videoManagerRef.current?.handleCreate();
    } else if (selectedTab === "flashcards") {
      flashcardManagerRef.current?.handleCreate();
    } else if (selectedTab === "summaries") {
      summaryManagerRef.current?.handleCreate();
    }
  };

  const getButtonConfig = () => {
    switch (selectedTab) {
      case "videos":
        return {
          label: "+ Nuevo Video",
          gradient: "from-red-400 to-red-500"
        };
      case "flashcards":
        return {
          label: "+ Nueva Flashcard",
          gradient: "from-purple-400 to-purple-500"
        };
      case "summaries":
        return {
          label: "+ Nuevo Resumen",
          gradient: "from-teal-400 to-teal-500"
        };
      default:
        return {
          label: "+ Nuevo",
          gradient: "from-gray-500 to-gray-600"
        };
    }
  };

  const buttonConfig = getButtonConfig();
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
    <div>
      <h2 className="text-xl font-bold mb-4">Recursos</h2>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <Tabs
            aria-label="Resource Types"
            selectedKey={selectedTab}
            onSelectionChange={setSelectedTab}
          >
            <Tab key="videos" title="Videos" />
            <Tab key="flashcards" title="Flashcards" />
            <Tab key="summaries" title="Resúmenes" />
          </Tabs>
        </div>
        <Button
          className={`bg-gradient-to-r ${buttonConfig.gradient} text-white shadow-sm`}
          onPress={handleNewResource}
          size="sm"
        >
          {buttonConfig.label}
        </Button>
      </div>

      {/* Content below tabs */}
      <div className="mt-4">
        {selectedTab === "videos" && (
          <VideoManager ref={videoManagerRef} type={type} id={id} />
        )}
        {selectedTab === "flashcards" && (
          <FlashcardManager ref={flashcardManagerRef} type={type} id={id} />
        )}
        {selectedTab === "summaries" && (
          <SummaryManager ref={summaryManagerRef} type={type} id={id} />
        )}
      </div>
    </div>
  );
}