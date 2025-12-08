'use client';

import { useState } from "react";
import { Button } from "@heroui/react";
import { SublessonData } from "@/app/hooks/neurapp/useSublessons";
import SublessonModal from "./SublessonModal";

type EditingSublessonState = { type: 'create' | 'edit', data: SublessonData | null, lessonId: number };

interface SublessonManagerProps {
  lessonId: number;
  sublessons: SublessonData[];
  loading: boolean;
  error?: string | null;
  onSublessonsChange: (sublessons: SublessonData[]) => void;
  onSublessonSelect?: (sublessonId: number | null) => void;
  selectedSublessonId?: number | null;
}

export default function SublessonManager({
  lessonId,
  sublessons,
  loading,
  error,
  onSublessonSelect,
  selectedSublessonId,
  onSublessonsChange
}: SublessonManagerProps) {
  const [modalState, setModalState] = useState<{ isOpen: boolean; sublesson: EditingSublessonState } | null>(null);

  const handleCreate = () => {
    setModalState({ isOpen: true, sublesson: { type: 'create', data: null, lessonId } });
  };

  const handleModalClose = () => {
    setModalState(null);
  };

  const handleSave = () => {
    setModalState(null);
  };

  if (loading) {
    return <div className="text-center py-2 text-sm text-gray-500">Cargando sublecciones...</div>;
  }

  if (error) {
    return (
      <div className="mt-3 pl-4 border-l-2 border-red-200">
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-xs text-red-600">Error al cargar sublecciones: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-l-2 border-green-300 pl-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-gray-700">
          Sublecciones {sublessons.length > 0 && `(${sublessons.length})`}
        </h4>
        <Button size="sm" className="bg-green-500 text-white text-xs" onPress={handleCreate}>
          + Sublección
        </Button>
      </div>

      {sublessons.length === 0 ? (
        <p className="text-xs text-gray-500 py-2">No hay sublecciones creadas para esta lección</p>
      ) : (
        <div className="overflow-auto rounded-lg bg-white shadow-sm border border-gray-200">
          <table className="min-w-full bg-white text-xs 2xl:text-sm">
            <thead className="bg-gradient-to-r from-green-500 to-green-600 text-white sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">#</th>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">Título</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sublessons.map((sublesson) => (
                <tr
                  key={sublesson.id}
                  className={`hover:bg-green-50/50 transition-colors cursor-pointer ${
                    selectedSublessonId === sublesson.id ? 'bg-green-100/70' : ''
                  }`}
                  onClick={() => {
                    onSublessonSelect?.(sublesson.id);
                  }}
                >
                  <td className="px-3 py-2 text-gray-700">
                    <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                      {sublesson.order}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-700 font-medium max-w-xs">
                    {sublesson.title}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para crear/editar sublección */}
      {modalState && (
        <SublessonModal
          isOpen={modalState.isOpen}
          onClose={handleModalClose}
          lessonId={lessonId}
          sublesson={modalState.sublesson}
          sublessons={sublessons}
          onSublessonsChange={onSublessonsChange}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
