'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

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

  const fileExtension = getFileExtension(urlFile);
  const isPdf = fileExtension === 'pdf';

  const handleDownload = async () => {
    try {
      const response = await fetch(urlFile);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback: open in new window
      window.open(urlFile, '_blank');
    }
  };

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
          {isPdf && !iframeError ? (
            <div className="w-full" style={{ height: '70vh' }}>
              <iframe
                src={`${urlFile}#toolbar=0&navpanes=0&scrollbar=1`}
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
                      ? 'No se pudo cargar la vista previa. Descarga o abre el archivo para verlo.'
                      : 'Haz clic en uno de los botones para ver el documento.'}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      color="primary"
                      size="lg"
                      startContent={<DocumentTextIcon className="w-5 h-5" />}
                      onPress={() => window.open(urlFile, '_blank')}
                    >
                      Abrir en nueva pestaña
                    </Button>

                    <Button
                      color="secondary"
                      variant="flat"
                      size="lg"
                      startContent={<ArrowDownTrayIcon className="w-5 h-5" />}
                      onPress={handleDownload}
                    >
                      Descargar
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
          {isPdf && !iframeError && (
            <>
              <Button
                color="secondary"
                variant="flat"
                startContent={<ArrowDownTrayIcon className="w-4 h-4" />}
                onPress={handleDownload}
              >
                Descargar
              </Button>
              <Button
                color="primary"
                onPress={() => window.open(urlFile, '_blank')}
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
