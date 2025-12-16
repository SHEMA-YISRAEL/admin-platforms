'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { useSignedUrls } from '@/app/hooks/neurapp/useSignedUrls';

interface SummaryPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string | null;
  urlFile: string;
  locale: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  'es': 'Español',
  'en': 'English',
  'pt': 'Português',
};

export default function SummaryPreviewModal({
  isOpen,
  onClose,
  title,
  description,
  urlFile,
  locale,
}: SummaryPreviewModalProps) {
  const [iframeError, setIframeError] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string>('');
  const [loadingUrl, setLoadingUrl] = useState(false);
  const { getSignedUrl } = useSignedUrls();

  // Validate URL
  const hasValidUrl = urlFile && urlFile.trim() !== '';

  // Load signed URL when modal opens and URL is available
  useEffect(() => {
    if (isOpen && hasValidUrl) {
      setLoadingUrl(true);
      getSignedUrl(urlFile)
        .then((signed) => {
          console.log('✅ Signed URL obtained for summary:', signed);
          setSignedUrl(signed);
          setLoadingUrl(false);
        })
        .catch((error) => {
          console.error('❌ Error getting signed URL for summary:', error);
          // Fallback to original URL if signing fails
          setSignedUrl(urlFile);
          setLoadingUrl(false);
        });
    }
  }, [isOpen, urlFile, hasValidUrl, getSignedUrl]);

  // Extract file extension from URL (before query parameters)
  const getFileExtension = (url: string): string => {
    try {
      const urlWithoutParams = url.split('?')[0]; // Remove query parameters
      const parts = urlWithoutParams.split('.');
      return parts[parts.length - 1]?.toLowerCase() || 'pdf';
    } catch {
      return 'pdf';
    }
  };

  const fileExtension = hasValidUrl ? getFileExtension(urlFile) : '';
  const isPdf = fileExtension === 'pdf';
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{title}</h3>
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
        <ModalBody className="p-6">
          {!hasValidUrl ? (
            <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border-2 border-dashed border-orange-200 min-h-[400px]">
              <div className="text-center space-y-4 max-w-md">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    No hay resumen disponible
                  </h3>
                  <p className="text-sm text-gray-600">
                    No se encontró ningún archivo para mostrar en la vista previa.
                  </p>
                </div>
              </div>
            </div>
          ) : loadingUrl ? (
            <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-gray-600">Cargando previsualización...</p>
              </div>
            </div>
          ) : isPdf && !iframeError ? (
            <div className="w-full" style={{ height: '70vh' }}>
              <iframe
                src={`${signedUrl || urlFile}#toolbar=0&navpanes=0&scrollbar=1`}
                className="w-full h-full border border-gray-200 rounded-lg"
                title={title}
                onError={() => setIframeError(true)}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg border-2 border-dashed border-teal-200">
              <div className="text-center space-y-6 max-w-md">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-teal-100 rounded-full">
                  <DocumentTextIcon className="w-12 h-12 text-teal-600" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold">
                    Tipo: {fileExtension?.toUpperCase()}
                  </p>
                </div>

                {description && (
                  <p className="text-gray-600 text-sm">
                    {description}
                  </p>
                )}

                <div className="pt-4 space-y-3">
                  <p className="text-sm text-gray-500">
                    {iframeError
                      ? 'No se pudo cargar la vista previa. Abre el archivo para verlo.'
                      : 'Haz clic en uno de los botones para ver el documento.'}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      color="primary"
                      size="lg"
                      startContent={<DocumentTextIcon className="w-5 h-5" />}
                      onPress={() => window.open(signedUrl || urlFile, '_blank')}
                    >
                      Abrir en nueva pestaña
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cerrar
          </Button>
          {hasValidUrl && isPdf && !iframeError && !loadingUrl && (
            <>
              <Button
                color="primary"
                onPress={() => window.open(signedUrl || urlFile, '_blank')}
              >
                Abrir en nueva ventana
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
