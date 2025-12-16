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

const isAllowedImageDomain = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const allowedDomains = [process.env.NEXT_PUBLIC_NEURAPP_S3_DOMAIN || ''];
    return allowedDomains.includes(urlObj.hostname);
  } catch {
    return false;
  }
};

// Component to safely load an image
function SafeImage({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);
  const isAllowed = isAllowedImageDomain(src);
  if (hasError || !isAllowed) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-200 text-gray-500">
        Imagen no disponible
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      className="w-full h-auto object-contain"
      style={{ maxHeight: '500px' }}
      priority
      onError={() => setHasError(true)}
    />
  );
}

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

  // Validate URLs
  const hasValidUrls = obverseSideUrl && reverseSideUrl &&
                       obverseSideUrl.trim() !== '' &&
                       reverseSideUrl.trim() !== '';

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
          {!hasValidUrls ? (
            <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border-2 border-dashed border-orange-200 min-h-[400px]">
              <div className="text-center space-y-4 max-w-md">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    No hay flashcards disponibles
                  </h3>
                  <p className="text-sm text-gray-600">
                    No se encontraron archivos para mostrar en la vista previa.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className={isFlipped ? 'text-gray-400' : 'text-primary'}>
                  Anverso
                </span>
                <span className="text-gray-400">|</span>
                <span className={isFlipped ? 'text-primary' : 'text-gray-400'}>
                  Reverso
                </span>
              </div>
              <div className="relative w-full" style={{ minHeight: '400px' }}>
                <div className="w-full transition-opacity duration-300">
                  {!isFlipped && (
                    <div className="w-full animate-in fade-in duration-300">
                      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden shadow-lg">
                        <SafeImage
                          src={obverseSideUrl}
                          alt="Anverso de la flashcard"
                        />
                      </div>
                    </div>
                  )}
                  {isFlipped && (
                    <div className="w-full animate-in fade-in duration-300">
                      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden shadow-lg">
                        <SafeImage
                          src={reverseSideUrl}
                          alt="Reverso de la flashcard"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Button
                color="primary"
                variant="flat"
                size="lg"
                onPress={handleFlip}
                className="w-full max-w-xs"
              >
                {isFlipped ? 'Ver Anverso' : 'Ver Reverso'}
              </Button>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={handleClose}>
            Cerrar
          </Button>
          {hasValidUrls && (
            <>
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
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
