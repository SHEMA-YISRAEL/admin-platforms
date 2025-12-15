'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import Image from 'next/image';

interface FlashcardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | null;
  description?: string | null;
  obverseSideUrl: string;
  reverseSideUrl: string;
  locale: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  'es': 'Español',
  'en': 'English',
  'pt': 'Português',
};

export default function FlashcardPreviewModal({
  isOpen,
  onClose,
  title,
  description,
  obverseSideUrl,
  reverseSideUrl,
  locale,
}: FlashcardPreviewModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleClose = () => {
    setIsFlipped(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{title || 'Flashcard'}</h3>
            <span className="text-sm text-gray-500 font-normal">
              {LANGUAGE_LABELS[locale] || locale}
            </span>
          </div>
          {description && (
            <p className="text-sm text-gray-600 font-normal mt-1">
              {description}
            </p>
          )}
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center gap-4">
            {/* Indicador de lado */}
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className={isFlipped ? 'text-gray-400' : 'text-primary'}>
                Anverso
              </span>
              <span className="text-gray-400">|</span>
              <span className={isFlipped ? 'text-primary' : 'text-gray-400'}>
                Reverso
              </span>
            </div>

            {/* Contenedor de la tarjeta con transición simple */}
            <div className="relative w-full" style={{ minHeight: '400px' }}>
              <div className="w-full transition-opacity duration-300">
                {/* Anverso */}
                {!isFlipped && (
                  <div className="w-full animate-in fade-in duration-300">
                    <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden shadow-lg">
                      <Image
                        src={obverseSideUrl}
                        alt="Anverso de la flashcard"
                        width={800}
                        height={600}
                        className="w-full h-auto object-contain"
                        style={{ maxHeight: '500px' }}
                        priority
                      />
                    </div>
                  </div>
                )}

                {/* Reverso */}
                {isFlipped && (
                  <div className="w-full animate-in fade-in duration-300">
                    <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden shadow-lg">
                      <Image
                        src={reverseSideUrl}
                        alt="Reverso de la flashcard"
                        width={800}
                        height={600}
                        className="w-full h-auto object-contain"
                        style={{ maxHeight: '500px' }}
                        priority
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botón para voltear */}
            <Button
              color="primary"
              variant="flat"
              size="lg"
              onPress={handleFlip}
              className="w-full max-w-xs"
            >
              {isFlipped ? '🔄 Ver Anverso' : '🔄 Ver Reverso'}
            </Button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={handleClose}>
            Cerrar
          </Button>
          <Button
            color="default"
            variant="flat"
            onPress={() => window.open(obverseSideUrl, '_blank')}
          >
            Abrir Anverso
          </Button>
          <Button
            color="default"
            variant="flat"
            onPress={() => window.open(reverseSideUrl, '_blank')}
          >
            Abrir Reverso
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
